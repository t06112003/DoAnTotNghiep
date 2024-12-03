using BE.Context;
using BE.Model.Dto;
using BE.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

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
        [HttpDelete("DeleteTest")]
        public async Task<ActionResult> DeleteTest([FromBody] TestDeleteInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var question = await _context.Question.Where(q => q.TestId == input.TestId).ToListAsync();
            var emailLogs = await _context.EmailLog.Where(el => el.TestId == input.TestId).ToListAsync();
            var userTestCode = await _context.UserTestCodeAssignment.Where(utc => utc.TestId == input.TestId).ToListAsync();
            var userMark = await _context.UserMark.Where(um => um.TestId == input.TestId).ToListAsync();
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            var answer = await _context.Answer
                .Where(a => question.Select(q => q.QuestionId).Contains(a.QuestionId))
                .ToListAsync();
            var testQuestionAssignments = await _context.TestQuestionAssignment
                .Where(tqa => question.Select(q => q.QuestionId).Contains(tqa.QuestionId))
                .ToListAsync();

            if (test == null) return NotFound(new { message = "Test not found!" });
            else
            {
                _context.Question.RemoveRange(question);
                _context.Answer.RemoveRange(answer);
                _context.EmailLog.RemoveRange(emailLogs);
                _context.UserTestCodeAssignment.RemoveRange(userTestCode);
                _context.UserMark.RemoveRange(userMark);
                _context.TestQuestionAssignment.RemoveRange(testQuestionAssignments);
                _context.Test.Remove(test);
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Delete Test Successfully!" });
        }

        [Authorize]
        [HttpDelete("DeleteTestCode")]
        public async Task<ActionResult> DeleteTestCode([FromBody] TestDeleteCodeInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });
            var testCodeAssignments = await _context.TestQuestionAssignment
                .Where(tqa => tqa.TestId == input.TestId && tqa.Code == input.Code)
                .ToListAsync();
            if (!testCodeAssignments.Any()) return NotFound(new { message = "No test code assignments found with the specified code and test ID." });
            _context.TestQuestionAssignment.RemoveRange(testCodeAssignments);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Delete Test Code Successfully!" });
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
            return Ok(randomTest);
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

        [Authorize]
        [HttpGet("ExportTestResults")]
        public async Task<IActionResult> ExportTestResults([FromQuery] TestExportInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User not a admin!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return NotFound(new { message = "Test not found!" });

            var testResults = await (
                from um in _context.UserMark
                join u in _context.User on um.UserId equals u.UserId
                where um.TestId == input.TestId
                select new
                {
                    Name = u.Name,
                    Mark = um.Mark
                }
            ).ToListAsync();

            var fileName = $"{test.TestName}.xlsx";

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Test Results");

                worksheet.Cells[1, 1].Value = "Name";
                worksheet.Cells[1, 2].Value = "Mark";

                for (int i = 0; i < testResults.Count; i++)
                {
                    worksheet.Cells[i + 2, 1].Value = testResults[i].Name;
                    worksheet.Cells[i + 2, 2].Value = testResults[i].Mark;
                }

                worksheet.Cells[1, 1, 1, 2].Style.Font.Bold = true;
                worksheet.Cells.AutoFitColumns();

                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;

                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }
    }
}