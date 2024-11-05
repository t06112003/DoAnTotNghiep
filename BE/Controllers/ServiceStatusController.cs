using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE._service;
using Microsoft.AspNetCore.Authorization;
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

        [Authorize]
        [HttpGet("last-run-times")]
        public ActionResult GetLastRunTimes()
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