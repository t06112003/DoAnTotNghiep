using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BE.Context;
using BE.Controllers;
using BE.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace BE._service
{
    public class EmailReminderService : IHostedService, IDisposable
    {
        TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        DateTime vietnamTime;
        private Timer _timer;
        private readonly IServiceProvider _serviceProvider;

        public EmailReminderService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
            vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(SendEmailReminders, null, TimeSpan.Zero, TimeSpan.FromMinutes(10));
            return Task.CompletedTask;
        }

        private async void SendEmailReminders(object state)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<DataContext>();
                var emailController = scope.ServiceProvider.GetRequiredService<EmailController>();
                var upcomingTests = await context.Test
                    .Where(t => t.BeginDate <= vietnamTime.AddHours(24) && t.BeginDate > vietnamTime)
                    .ToListAsync();

                foreach (var test in upcomingTests)
                {
                    var users = await context.User
                        .Where(u => !u.IsAdmin)
                        .ToListAsync();

                    foreach (var user in users)
                    {
                        var emailSent = await context.EmailLog
                            .AnyAsync(e => e.UserId == user.UserId && e.TestId == test.TestId);

                        if (!emailSent)
                        {
                            var emailModel = new EmailModel
                            {
                                To = user.Email,
                                Subject = "Upcoming Test Reminder",
                                Body = $"Dear {user.Name},\n\nThis is a reminder that your test \"{test.TestName}\" will begin on {test.BeginDate}. Please make sure you are prepared."
                            };
                            await emailController.SendEmail(emailModel);

                            context.EmailLog.Add(new EmailLog
                            {
                                UserId = user.UserId,
                                TestId = test.TestId,
                                SentDate = vietnamTime
                            });
                            await context.SaveChangesAsync();
                        }
                    }
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}