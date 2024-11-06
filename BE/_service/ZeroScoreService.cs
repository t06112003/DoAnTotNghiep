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
    private Dictionary<long, Timer> _testTimers = new Dictionary<long, Timer>();
    private Timer _checkNewTestsTimer;
    private readonly TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
    public DateTime? LastRunTime { get; private set; }

    public ZeroScoreService(IServiceProvider serviceProvider, ILogger<ZeroScoreService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        LastRunTime = DateTime.Now;
        _logger.LogInformation("ZeroScoreService is starting...");
        ScheduleExistingTests();
        
        // Start a periodic timer to check for new tests every minute
        _checkNewTestsTimer = new Timer(CheckForNewTests, null, TimeSpan.Zero, TimeSpan.FromMinutes(1));
        
        return Task.CompletedTask;
    }

    private async void ScheduleExistingTests()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<DataContext>();
            var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
            var upcomingTests = await context.Test
                .Where(t => t.EndDate > vietnamTime)
                .ToListAsync();

            foreach (var test in upcomingTests)
            {
                ScheduleTestForZeroScore(test, vietnamTime);
            }
        }
    }

    private void ScheduleTestForZeroScore(Test test, DateTime vietnamTime)
    {
        var testEndTime = test.EndDate;
        var remainingTime = testEndTime - vietnamTime + TimeSpan.FromMinutes(1);

        if (remainingTime.TotalMilliseconds > 0 && !_testTimers.ContainsKey(test.TestId))
        {
            _logger.LogInformation($"Scheduling zero score assignment for Test ID {test.TestId} at {testEndTime}");
            var timer = new Timer(AssignZeroScores, test.TestId, remainingTime, Timeout.InfiniteTimeSpan);
            _testTimers[test.TestId] = timer;
        }
    }

    private async void CheckForNewTests(object state)
    {
        LastRunTime = DateTime.Now;
        
        var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<DataContext>();

            var upcomingTests = await context.Test
                .Where(t => t.EndDate > vietnamTime)
                .ToListAsync();

            foreach (var test in upcomingTests)
            {
                ScheduleTestForZeroScore(test, vietnamTime);
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
        
        // Stop all individual test timers
        foreach (var timer in _testTimers.Values)
        {
            timer?.Change(Timeout.Infinite, 0);
            timer?.Dispose();
        }
        
        // Stop the periodic check timer
        _checkNewTestsTimer?.Change(Timeout.Infinite, 0);
        _checkNewTestsTimer?.Dispose();
        
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        foreach (var timer in _testTimers.Values)
        {
            timer?.Dispose();
        }
        _checkNewTestsTimer?.Dispose();
    }
}
