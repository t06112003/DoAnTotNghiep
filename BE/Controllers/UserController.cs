using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using BE._iservices;
using BE.Context;
using BE.Model.Dto;
using BE.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace BE.Controllers
{
    public class UserController : BaseApiController
    {
        TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        DateTime vietnamTime;
        private readonly DataContext _context;
        private readonly EmailController _email;
        private readonly OTPController _otp;
        private readonly ITokenService _tokenService;
        TimeSpan expiredTime = TimeSpan.FromMinutes(10);

        public UserController(DataContext context, EmailController email, OTPController otp, ITokenService tokenService)
        {
            _context = context;
            _email = email;
            _otp = otp;
            _tokenService = tokenService;
            vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
        }

        private async Task<bool> EmailExists(string Email)
        {
            return await _context.User.AnyAsync(x => x.Email == Email.ToLower());
        }

        [HttpPost("Login")]
        public async Task<ActionResult<UserLoginOutputDto>> Login([FromBody] UserLoginInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(x => x.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (input.Password != user.Password) return BadRequest(new { message = "Wrong password, please check again!" });
            else return Ok(new UserLoginOutputDto()
            {
                Username = user.Username,
                Name = user.Name,
                Token = _tokenService.CreateToken(user),
            });
        }

        [Authorize]
        [HttpPost("ImportUsers")]
        public async Task<IActionResult> ImportUsers(IFormFile file, string adminUsername)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == adminUsername);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });

            if (file == null || file.Length <= 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            const long maxFileSize = 3 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = "File size must be less than 3MB." });
            }

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (fileExtension != ".xls" && fileExtension != ".xlsx")
            {
                return BadRequest(new { message = "Invalid file format. Only .xls and .xlsx files are allowed." });
            }

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);

                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var rowCount = worksheet.Dimension.Rows;
                    var users = new List<User>();
                    var existingUsernames = (await _context.User.Select(u => u.Username).ToListAsync()).ToHashSet(StringComparer.OrdinalIgnoreCase);

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var username = worksheet.Cells[row, 1].Text.Trim();
                        if (string.IsNullOrEmpty(username))
                        {
                            continue;
                        }

                        var password = worksheet.Cells[row, 2].Text.Trim();
                        var email = worksheet.Cells[row, 3].Text.Trim();
                        var name = worksheet.Cells[row, 4].Text.Trim();
                        var isAdminText = worksheet.Cells[row, 5].Text.Trim();

                        if (existingUsernames.Contains(username))
                        {
                            return BadRequest(new { message = $"Username '{username}' already exists in the database." });
                        }

                        if (!bool.TryParse(isAdminText, out var isAdmin))
                        {
                            return BadRequest(new { message = $"Invalid IsAdmin value at row {row}. Expected 'true' or 'false'." });
                        }

                        users.Add(new User
                        {
                            Username = username,
                            Password = password,
                            Email = email,
                            Name = name,
                            IsAdmin = isAdmin
                        });

                        existingUsernames.Add(username);
                    }

                    _context.User.AddRange(users);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Users imported successfully!" });
        }

        [Authorize]
        [HttpPut("ChangePassword")]
        public async Task<ActionResult> ChangePassword([FromBody] UserChangePasswordInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(x => x.Username == input.Username);
            var otp = await _context.OTP.SingleOrDefaultAsync(o => o.UserId == user.UserId);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.Password != input.CurrentPassword) return BadRequest(new { message = "Wrong current password!" });
            if (input.OTPCode != otp.OTPCode) return BadRequest(new { message = "Invalid code!" });
            if (vietnamTime >= otp.SentTime + expiredTime) return BadRequest(new { message = "This code is expired!" });
            if (otp.IsUsed) return BadRequest(new { message = "This code is used!" });
            else
            {
                await _otp.CodeIsUsed(input.OTPCode);
                user.Password = input.NewPassword;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Change password successfully!" });
            }
        }

        [Authorize]
        [HttpPost("ChangeEmail")]
        public async Task<ActionResult> ChangeEmail([FromBody] UserChangeEmailInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(x => x.Username == input.Username);
            var otp = await _context.OTP.SingleOrDefaultAsync(o => o.UserId == user.UserId);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.Email != input.CurrentEmail) return BadRequest(new { message = "Wrong current Email!" });
            if (input.OTPCode != otp.OTPCode) return BadRequest(new { message = "Invalid code!" });
            if (vietnamTime >= otp.SentTime + expiredTime) return BadRequest(new { message = "This code is expired!" });
            if (otp.IsUsed) return BadRequest(new { message = "This code is used!" });
            if (await EmailExists(input.NewEmail))
            {
                return BadRequest(new { message = "Email already in use!" });
            }
            else
            {
                await _otp.CodeIsUsed(input.OTPCode);
                user.Email = input.NewEmail;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Change Email successfully!" });
            }
        }

        [HttpPost("ForgetPassword")]
        public async Task<ActionResult> ForgetPassword([FromBody] UserForgetPasswordInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(x => x.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.Email != input.Email) return BadRequest(new { message = "Wrong Email!" });
            else
            {
                return await _email.SendEmail(new EmailModel()
                {
                    To = user.Email,
                    Subject = "Forgot your password!",
                    Body = "<h2>Dear " + user.Name + ", please don't share your password for anyone!</h2><h3>Your password is:</h3>" + user.Password,
                });
            }
        }

        [HttpGet("CheckIsAdmin")]
        public async Task<ActionResult> CheckIsAdmin([FromQuery] UserCheckIsAdminInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            else return Ok();
        }

        [HttpGet("GetInfo")]
        public async Task<ActionResult> GetInfo([FromQuery] string Username)
        {
            var user = await _context.User.SingleOrDefaultAsync(x => x.Username == Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            return Ok(new { Name = user.Name, Email = user.Email });
        }
    }
}