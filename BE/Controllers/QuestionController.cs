using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Model.Dto;
using BE.Context;
using BE.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;

namespace BE.Controllers
{
    public class QuestionController : BaseApiController
    {
        private readonly DataContext _context;
        private AnswerController _answerController;
        public QuestionController(DataContext context, AnswerController answerController)
        {
            _context = context;
            _answerController = answerController;
        }

        [HttpGet("QuestionList")]
        public async Task<ActionResult<List<QuestionListOutputDto>>> QuestionList([FromQuery] QuestionListInputDto input)
        {
            var test = await (
                from Test in _context.Test
                join Question in _context.Question on Test.TestId equals Question.TestId
                where Question.TestId == input.TestId
                select new QuestionListOutputDto()
                {
                    QuestionId = Question.QuestionId,
                    QuestionText = Question.QuestionText,
                    QuestionDifficultyName = Question.QuestionDifficultyName,
                    QuestionMark = Question.QuestionMark,
                })
            .ToListAsync();

            foreach (var q in test)
            {
                q.Answers = await _answerController.SearchByQuestionId(q.QuestionId);
            }

            return test;
        }

        [Authorize]
        [HttpPost("CreateQuestionAndAnswers")]
        public async Task<ActionResult> CreateQuestionAndAnswers([FromBody] QuestionAndAnswersInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User not a admin!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });
            if (test.TestId != input.TestId) return BadRequest(new { message = "Test not found!" });
            if (input.QuestionMark <= 0) return BadRequest(new { message = "Invalid Point!" });
            if (string.IsNullOrWhiteSpace(input.QuestionText)) return BadRequest(new { message = "Invalid Text!" });
            if (string.IsNullOrWhiteSpace(input.QuestionDifficultyName)) return BadRequest(new { message = "Invalid Difficult!" });
            if (input.QuestionDifficultyName != "Easy" && input.QuestionDifficultyName != "Medium" && input.QuestionDifficultyName != "Hard") return BadRequest(new { message = "Invalid Difficult!" });
            if (input.QuestionMark <= 0) return BadRequest(new { message = "Invalid number!" });
            if (input.Answers == null || input.Answers.Count > 4 || input.Answers.Count < 2 || input.Answers.Count(a => a.IsCorrect) != 1)
            {
                return BadRequest(new { message = "Invalid number of answers or incorrect answer count!" });
            }
            else
            {
                var newQuestion = new Question
                {
                    QuestionText = input.QuestionText,
                    QuestionDifficultyName = input.QuestionDifficultyName,
                    QuestionMark = input.QuestionMark,
                    TestId = input.TestId,
                    Answers = input.Answers.Select(answer => new Answer
                    {
                        AnswerText = answer.AnswerText,
                        IsCorrect = answer.IsCorrect
                    }).ToList()
                };
                _context.Question.Add(newQuestion);
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Create Question successfully!" });
        }

        [Authorize]
        [HttpPost("ImportQuestionsWord")]
        public async Task<IActionResult> ImportQuestionsWord(IFormFile file, long TestId, string Username)
        {
            if (file == null || file.Length <= 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (fileExtension != ".doc" && fileExtension != ".docx")
            {
                return BadRequest(new { message = "Invalid file format" });
            }

            const long maxFileSize = 3 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = "File size must be less than 3MB." });
            }

            try
            {
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;

                    using (var doc = WordprocessingDocument.Open(stream, false))
                    {
                        var paragraphs = doc.MainDocumentPart.Document.Body.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>();
                        var text = string.Join("\n", paragraphs.Select(p => p.InnerText));

                        // Tách các khối câu hỏi bằng ký hiệu `//`
                        var questionBlocks = text.Split(new[] { "//" }, StringSplitOptions.RemoveEmptyEntries)
                                                  .Select(block => block.Trim())
                                                  .Where(block => !string.IsNullOrWhiteSpace(block))
                                                  .ToList();

                        var questions = new List<Question>();

                        foreach (var block in questionBlocks)
                        {
                            // Chia block thành các dòng (câu hỏi và câu trả lời)
                            var lines = block.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                                             .Select(line => line.Trim())
                                             .ToList();

                            if (lines.Count < 2)
                            {
                                return BadRequest(new { message = "Each question must have at least one question and one answer." });
                            }

                            // Xử lý câu hỏi và trích xuất độ khó và điểm
                            string questionText = lines[0];
                            string difficulty = "Medium";
                            int mark = 1;

                            var match = Regex.Match(questionText, @"^(?<text>.+?)\s*\((?<difficulty>\w+),\s*(?<mark>\d+)\)$");
                            if (match.Success)
                            {
                                questionText = match.Groups["text"].Value.Trim();
                                difficulty = match.Groups["difficulty"].Value;
                                mark = int.Parse(match.Groups["mark"].Value);
                            }

                            // Xử lý các câu trả lời
                            var answers = lines.Skip(1)
                                               .Where(line => !string.IsNullOrWhiteSpace(line))
                                               .Select(line =>
                            {
                                bool isCorrect = line.StartsWith("*");
                                string answerText = isCorrect ? line.Substring(1).Trim() : line.Trim();
                                answerText = answerText.Replace("<br />", "\n");

                                return new Answer
                                {
                                    AnswerText = answerText,
                                    IsCorrect = isCorrect
                                };
                            }).ToList();

                            if (answers.Count(a => a.IsCorrect) != 1 || answers.Count(a => !a.IsCorrect) < 1)
                            {
                                return BadRequest(new { message = $"Each question must have exactly one correct answer and at least one incorrect answer. Issue with question: {questionText}" });
                            }

                            var question = new Question
                            {
                                QuestionText = questionText,
                                QuestionDifficultyName = difficulty,
                                QuestionMark = mark,
                                TestId = TestId,
                                Answers = answers
                            };
                            questions.Add(question);
                        }

                        _context.Question.AddRange(questions);
                        await _context.SaveChangesAsync();
                        return Ok(new { message = "Questions imported successfully!", questionCount = questions.Count });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error processing file: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpPut("EditQuestion")]
        public async Task<ActionResult> EditQuestion([FromBody] QuestionEditInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var question = await _context.Question.SingleOrDefaultAsync(q => q.QuestionId == input.QuestionId);
            if (string.IsNullOrWhiteSpace(input.QuestionText)) return BadRequest(new { message = "Invalid Text!" });
            else
            {
                question.QuestionText = input.QuestionText;
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Edit Question successfully!" });
        }

        [Authorize]
        [HttpDelete("DeleteQuestion")]
        public async Task<ActionResult> DeleteQuestion([FromBody] QuestionDeleteInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var answer = await _context.Answer.Where(a => a.QuestionId == input.QuestionId).ToListAsync();
            var question = await _context.Question.SingleOrDefaultAsync(q => q.QuestionId == input.QuestionId);
            if (question == null) return NotFound(new { message = "Question not found!" });
            else
            {
                _context.Question.Remove(question);
                _context.Answer.RemoveRange(answer);
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Delete Question successfully!" });
        }

        [Authorize]
        [HttpPost("AssignRandomQuestions")]
        public async Task<ActionResult> AssignRandomQuestions([FromBody] QuestionRandomInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });
            if (test.TestId != input.TestId) return BadRequest(new { message = "Test not found!" });
            var availableEasyQuestions = await _context.Question
                .Where(q => q.QuestionDifficultyName == "Easy" && q.TestId == input.TestId)
                .CountAsync();

            var availableMediumQuestions = await _context.Question
                .Where(q => q.QuestionDifficultyName == "Medium" && q.TestId == input.TestId)
                .CountAsync();

            var availableHardQuestions = await _context.Question
                .Where(q => q.QuestionDifficultyName == "Hard" && q.TestId == input.TestId)
                .CountAsync();

            if (input.EasyQuestions < 0 || input.EasyQuestions > availableEasyQuestions)
                return BadRequest(new { message = "Invalid number of Easy questions requested." });

            if (input.MediumQuestions < 0 || input.MediumQuestions > availableMediumQuestions)
                return BadRequest(new { message = "Invalid number of Medium questions requested." });

            if (input.HardQuestions < 0 || input.HardQuestions > availableHardQuestions)
                return BadRequest(new { message = "Invalid number of Hard questions requested." });

            var totalRequestedQuestions = input.EasyQuestions + input.MediumQuestions + input.HardQuestions;
            if (totalRequestedQuestions <= 0)
                return BadRequest(new { message = "Total number of questions must be greater than zero." });

            var easyQuestions = await _context.Question
                .Where(q => q.QuestionDifficultyName == "Easy" && q.TestId == input.TestId)
                .OrderBy(r => Guid.NewGuid())
                .Take(input.EasyQuestions)
                .ToListAsync();

            var mediumQuestions = await _context.Question
                .Where(q => q.QuestionDifficultyName == "Medium" && q.TestId == input.TestId)
                .OrderBy(r => Guid.NewGuid())
                .Take(input.MediumQuestions)
                .ToListAsync();

            var hardQuestions = await _context.Question
                .Where(q => q.QuestionDifficultyName == "Hard" && q.TestId == input.TestId)
                .OrderBy(r => Guid.NewGuid())
                .Take(input.HardQuestions)
                .ToListAsync();

            var selectedQuestions = easyQuestions
                .Concat(mediumQuestions)
                .Concat(hardQuestions)
                .ToList();

            Random rnd = new Random();
            int randomCode;
            bool codeExists;

            do
            {
                randomCode = rnd.Next(0, 1000);
                codeExists = await _context.TestQuestionAssignment
                    .AnyAsync(tqa => tqa.Code == randomCode && tqa.TestId != test.TestId);
            }
            while (codeExists);

            var newAssignments = selectedQuestions.Select(q => new TestQuestionAssignment
            {
                TestId = test.TestId,
                QuestionId = q.QuestionId,
                Code = randomCode
            }).ToList();
            await _context.TestQuestionAssignment.AddRangeAsync(newAssignments);
            await _context.SaveChangesAsync();

            var result = selectedQuestions.Select(q => new QuestionRandomOutputDto
            {
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
                    .ToList()
            }).ToList();

            return Ok(new { message = "Questions assigned successfully!", questions = result, Code = randomCode });
        }

        [Authorize]
        [HttpGet("QuestionAssignList")]
        public async Task<ActionResult<List<QuestionAssignListOutputDto>>> QuestionAssignList([FromQuery] QuestionAssignListInputDto input)
        {
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });

            var randomTest = await
            (
                from tqa in _context.TestQuestionAssignment
                join q in _context.Question on tqa.QuestionId equals q.QuestionId
                where tqa.TestId == input.TestId
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
                        .ToList(),
                    Code = tqa.Code
                }).ToListAsync();
            return Ok(randomTest);
        }
    }
}