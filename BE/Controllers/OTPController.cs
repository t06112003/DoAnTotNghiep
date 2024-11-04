using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using BE.Context;
using BE.Model.Dto;
using BE.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BE.Controllers
{
    public class OTPController : BaseApiController
    {
        TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        DateTime vietnamTime;
        private readonly DataContext _context;
        private readonly EmailController _email;
        public OTPController(DataContext context, EmailController email)
        {
            _context = context;
            _email = _email = email;
            vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
        }

        [HttpPost("SendOTP")]
        public async Task<ActionResult> SendOTP([FromBody] OTPSendInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (string.IsNullOrWhiteSpace(user.Email)) return BadRequest(new { message = "Email not found!" });
            if (user.Email != input.Email) return BadRequest(new { message = "Wrong Email!" });
            var activeCode = new Random().Next(100000, 999999);
            var rs = await _email.SendEmail(new EmailModel()
            {
                To = input.Email,
                Subject = activeCode + " is your Verification Code",
                Body = "<h1>Dear " + user.Name + "</h1> <h3>Verification code is " + activeCode + "</h3> <h3>Please complete verification within 10 minutes.</h3>",
            });
            var existingOTP = await _context.OTP.SingleOrDefaultAsync(o => o.UserId == user.UserId);

            if (existingOTP != null)
            {
                existingOTP.OTPCode = activeCode;
                existingOTP.SentTime = vietnamTime;
                existingOTP.IsUsed = false;
            }
            else
            {
                var newUser = new OTP()
                {
                    UserId = user.UserId,
                    OTPCode = activeCode,
                    SentTime = vietnamTime
                };
                _context.OTP.Add(newUser);
            }
            await _context.SaveChangesAsync();
            return rs;
        }

        [NonAction]
        public async Task CodeIsUsed(int OTPCode)
        {
            var otp = await _context.OTP.SingleOrDefaultAsync(o => o.OTPCode == OTPCode);
            otp.IsUsed = true;
            _context.SaveChanges();
        }
    }
}