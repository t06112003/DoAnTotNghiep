using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using BE.Model.Entity;
using BE.Context;
using Microsoft.Extensions.Logging;

public class ZeroScoreService : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ZeroScoreService> _logger;
    private List<Timer> _timers = new List<Timer>();
    private readonly TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
    public DateTime? LastRunTime { get; private set; }

    public ZeroScoreService(IServiceProvider serviceProvider, ILogger<ZeroScoreService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("ZeroScoreService is starting...");
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<DataContext>();
            var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
            var upcomingTests = await context.Test
                .Where(t => t.EndDate > vietnamTime)
                .ToListAsync();

            LastRunTime = DateTime.Now;

            foreach (var test in upcomingTests)
            {
                var testEndTime = test.EndDate;
                var remainingTime = testEndTime - vietnamTime + TimeSpan.FromMinutes(1);
                if (remainingTime.TotalMilliseconds > 0)
                {
                    _logger.LogInformation($"Scheduling zero score assignment for Test ID {test.TestId} at {testEndTime}");
                    var timer = new Timer(AssignZeroScores, test.TestId, remainingTime, Timeout.InfiniteTimeSpan);
                    _timers.Add(timer);
                }
            }
        }
    }

    private async void AssignZeroScores(object state)
    {
        LastRunTime = DateTime.Now;
        var testId = (long)state;
        _logger.LogInformation($"Assigning zero scores for Test ID {testId}");
        var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<DataContext>();
            var test = await context.Test.SingleOrDefaultAsync(t => t.TestId == testId);
            if (test == null || vietnamTime <= test.EndDate.AddMinutes(1))
            {
                _logger.LogWarning($"Test ID {testId} not found or not yet eligible for zero score assignment");
                return;
            }

            var usersWithoutMarks = await context.User
                .Where(u => !u.IsAdmin)
                .Where(u => !context.UserMark.Any(um => um.UserId == u.UserId && um.TestId == testId))
                .ToListAsync();

            foreach (var user in usersWithoutMarks)
            {
                var userMark = new UserMark
                {
                    UserId = user.UserId,
                    TestId = testId,
                    Mark = 0
                };

                context.UserMark.Add(userMark);
                _logger.LogInformation($"Assigned zero score to User ID {user.UserId} for Test ID {testId}");
            }

            await context.SaveChangesAsync();
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("ZeroScoreService is stopping...");
        foreach (var timer in _timers)
        {
            timer?.Change(Timeout.Infinite, 0);
            timer?.Dispose();
        }
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        foreach (var timer in _timers)
        {
            timer?.Dispose();
        }
    }
}
