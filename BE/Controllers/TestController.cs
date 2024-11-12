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
    public class TestController : BaseApiController
    {
        TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        DateTime vietnamTime;
        private readonly DataContext _context;
        public TestController(DataContext context)
        {
            _context = context;
            vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
        }

        [HttpGet("TestList")]
        public async Task<ActionResult<List<TestListOutputDto>>> TestList()
        {
            var test = await (
                from Test in _context.Test
                select new TestListOutputDto()
                {
                    TestId = Test.TestId,
                    TestName = Test.TestName,
                    TestKey = Test.TestKey,
                    BeginDate = Test.BeginDate,
                    EndDate = Test.EndDate,
                    TestTime = Test.TestTime,
                })
            .ToListAsync();

            return test;
        }

        [HttpGet("TestDetail")]
        public async Task<ActionResult<List<TestDetailOutputDto>>> TestDetail([FromQuery] TestDetailInputDto input)
        {
            var test = await (
                from Test in _context.Test
                where Test.TestId == input.TestId
                select new TestDetailOutputDto()
                {
                    TestId = Test.TestId,
                    TestName = Test.TestName,
                    TestKey = Test.TestKey,
                    BeginDate = Test.BeginDate,
                    EndDate = Test.EndDate,
                    TestTime = Test.TestTime,
                })
            .ToListAsync();

            return test;
        }

        [HttpGet("TestListForUser")]
        public async Task<ActionResult<List<TestListOutputDto>>> TestListForUser()
        {
            DateTime today = DateTime.UtcNow.Date;
            DateTime threeDaysFromNow = today.AddDays(3);

            var test = await (
                from Test in _context.Test
                where Test.BeginDate >= today && Test.BeginDate <= threeDaysFromNow
                select new TestListOutputDto()
                {
                    TestId = Test.TestId,
                    TestName = Test.TestName,
                    TestKey = Test.TestKey,
                    BeginDate = Test.BeginDate,
                    EndDate = Test.EndDate,
                    TestTime = Test.TestTime,
                })
            .ToListAsync();

            return test;
        }

        [Authorize]
        [HttpPost("CreateTest")]
        public async Task<ActionResult> CreateTest([FromBody] TestCreateInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User not a admin!" });
            if (string.IsNullOrWhiteSpace(input.TestName)) return BadRequest(new { message = "Invalid Text!" });
            if (string.IsNullOrWhiteSpace(input.TestKey)) return BadRequest(new { message = "Invalid Key!" });
            if (input.BeginDate == null) return BadRequest(new { message = "Please enter beginning date of the test." });
            if (input.EndDate == null) return BadRequest(new { message = "Please enter end date of the test." });
            if (input.TestTime == null) return BadRequest(new { message = "Please enter test time" });
            if (input.BeginDate < vietnamTime) return BadRequest(new { message = "Invalid Beginning Date!" });
            if (input.BeginDate > input.EndDate) return BadRequest(new { message = "Invalid Date!" });
            if (input.EndDate - input.BeginDate < input.TestTime) return BadRequest(new { message = "Invalid Time!" });
            else
            {
                var newTest = new Test
                {
                    TestName = input.TestName,
                    TestKey = input.TestKey,
                    BeginDate = input.BeginDate,
                    TestTime = input.TestTime,
                    EndDate = input.EndDate,
                };
                _context.Test.Add(newTest);
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Create Test successfully!" });
        }

        [Authorize]
        [HttpPut("EditTest")]
        public async Task<ActionResult> EditTest([FromBody] TestEditInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });
            if (string.IsNullOrWhiteSpace(input.TestName)) return BadRequest(new { message = "Invalid Text!" });
            if (string.IsNullOrWhiteSpace(input.TestKey)) return BadRequest(new { message = "Invalid Key!" });
            if (input.BeginDate == null) return BadRequest(new { message = "Please enter beginning date of the test." });
            if (input.EndDate == null) return BadRequest(new { message = "Please enter end date of the test." });
            if (input.TestTime == null) return BadRequest(new { message = "Please enter test time" });
            if (input.BeginDate < vietnamTime) return BadRequest(new { message = "Invalid Beginning Date!" });
            if (input.BeginDate > input.EndDate) return BadRequest(new { message = "Invalid Date!" });
            if (input.EndDate - input.BeginDate < input.TestTime) return BadRequest(new { message = "Invalid Time!" });
            else
            {
                test.TestName = input.TestName;
                test.TestKey = input.TestKey;
                test.BeginDate = input.BeginDate;
                test.TestTime = input.TestTime;
                test.EndDate = input.EndDate;
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Edit Test successfully!" });
        }

        [Authorize]
        [HttpGet("RandomTest")]
        public async Task<ActionResult<List<TestRandomOutputDto>>> RandomQuestion([FromQuery] TestRandomInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });
            if (input.TestKey != test.TestKey) return BadRequest(new { message = "Wrong TestKey! Please try again!" });
            if (vietnamTime < test.BeginDate || vietnamTime > test.EndDate) return BadRequest(new { message = "Test is not available at this time!" });
            var userTestCode = await _context.UserTestCodeAssignment
                .SingleOrDefaultAsync(utc => utc.Username == input.Username && utc.TestId == input.TestId);
            long assignedCode;
            if (userTestCode == null)
            {
                var availableCodes = await _context.TestQuestionAssignment
                    .Where(tqa => tqa.TestId == input.TestId)
                    .Select(tqa => tqa.Code)
                    .Distinct()
                    .ToListAsync();

                if (availableCodes.Count == 0)
                    return BadRequest(new { message = "No questions assigned with any code!" });

                var random = new Random();
                assignedCode = availableCodes[random.Next(availableCodes.Count)];

                userTestCode = new UserTestCodeAssignment
                {
                    Username = input.Username,
                    TestId = input.TestId,
                    Code = assignedCode,
                    AssignmentTime = vietnamTime
                };
                _context.UserTestCodeAssignment.Add(userTestCode);
                await _context.SaveChangesAsync();
            }
            else
            {
                assignedCode = userTestCode.Code;
            }
            if (vietnamTime > userTestCode.AssignmentTime + test.TestTime) return BadRequest(new { message = "Test is overdue!" });
            var randomTest = await
            (
                from tqa in _context.TestQuestionAssignment
                join q in _context.Question on tqa.QuestionId equals q.QuestionId
                where tqa.TestId == input.TestId && tqa.Code == assignedCode
                select new TestRandomOutputDto
                {
                    TestId = tqa.TestId,
                    QuestionId = q.QuestionId,
                    QuestionText = q.QuestionText,
                    Answers = _context.Answer
                        .Where(a => a.QuestionId == q.QuestionId)
                        .Select(a => new AnswerRandomOutputDto
                        {
                            AnswerId = a.AnswerId,
                            AnswerText = a.AnswerText
                        })
                        .OrderBy(a => Guid.NewGuid())
                        .ToList(),
                    Code = tqa.Code
                }).ToListAsync();
            return Ok(new
            {
                randomTest,
                isAssigned = true
            });
        }

        [Authorize]
        [HttpGet("TestRemainingTime")]
        public async Task<ActionResult<TestRemainingTimeOutputDto>> TestRemainingTime([FromQuery] TestRemainingTimeInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null)
                return BadRequest(new { message = "User not found!" });

            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null)
                return BadRequest(new { message = "Test not found!" });

            // Calculate the current time adjusted to Vietnam timezone
            var vietnamTime = DateTime.UtcNow.AddHours(7);

            var remainTimeQuery =
                from Test in _context.Test
                join UserTestCodeAssignment in _context.UserTestCodeAssignment
                    on Test.TestId equals UserTestCodeAssignment.TestId
                where UserTestCodeAssignment.TestId == input.TestId && UserTestCodeAssignment.Username == input.Username
                select new
                {
                    RemainingTime = Test.TestTime - (vietnamTime - UserTestCodeAssignment.AssignmentTime)
                };

            var remainTimeResult = await remainTimeQuery.FirstOrDefaultAsync();
            if (remainTimeResult == null)
                return BadRequest(new { message = "Test assignment not found for this user." });

            // Ensure RemainingTime is non-negative
            var remainingTime = remainTimeResult.RemainingTime < TimeSpan.Zero ? TimeSpan.Zero : remainTimeResult.RemainingTime;
            var formattedRemainingTime = $"{remainingTime.Hours:D2}:{remainingTime.Minutes:D2}:{remainingTime.Seconds:D2}";

            return Ok(new TestRemainingTimeOutputDto
            {
                RemainingTime = formattedRemainingTime
            });
        }

        [Authorize]
        [HttpGet("MarkViewbyTest")]
        public async Task<ActionResult<List<TestViewOutputDto>>> MarkViewbyTest([FromQuery] TestViewInputDto input, string? sort, bool sortAscending = true)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            var test = from Test in _context.Test
                       join UserMark in _context.UserMark on Test.TestId equals UserMark.TestId
                       join User in _context.User on UserMark.UserId equals User.UserId
                       where (string.IsNullOrWhiteSpace(input.TestName) || Test.TestName.Contains(input.TestName))
                       && (input.DateFrom == null || Test.BeginDate >= input.DateFrom) && (input.DateTo == null || Test.BeginDate <= input.DateTo.Value.AddDays(1))
                       orderby User.Username
                       select new TestViewOutputDto()
                       {
                           TestId = Test.TestId,
                           TestName = Test.TestName,
                           Name = User.Name,
                           Mark = UserMark.Mark,
                           BeginDate = Test.BeginDate
                       };
            if (sort == "time")
            {
                test = sortAscending ? test.OrderBy(t => t.BeginDate) : test.OrderByDescending(d => d.BeginDate);
            }
            if (sort == "mark")
            {
                test = sortAscending ? test.OrderBy(t => t.Mark) : test.OrderByDescending(d => d.Mark);
            }
            return await test.ToListAsync();
        }
    }
}