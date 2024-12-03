using BE._service;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers
{
    public class ServiceStatusController : BaseApiController
    {
        private readonly ZeroScoreService _zeroScoreService;
        private readonly EmailReminderService _emailReminderService;

        public ServiceStatusController(ZeroScoreService zeroScoreService, EmailReminderService emailReminderService)
        {
            _zeroScoreService = zeroScoreService;
            _emailReminderService = emailReminderService;
        }

        [HttpGet("LastRunTimes")]
        public ActionResult LastRunTimes()
        {
            var lastRunTimeInfo = new
            {
                ZeroScoreServiceLastRun = _zeroScoreService.LastRunTime,
                EmailReminderServiceLastRun = _emailReminderService.LastRunTime
            };

            return Ok(lastRunTimeInfo);
        }
    }
}