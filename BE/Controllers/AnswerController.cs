using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Context;
using BE.Model.Dto;
using BE.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace BE.Controllers
{
    public class AnswerController : BaseApiController
    {
        TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        DateTime vietnamTime;
        private readonly DataContext _context;
        public AnswerController(DataContext context)
        {
            _context = context;
            vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
        }
        [NonAction]
        public async Task<List<AnswerListOutputDto>> SearchByQuestionId(long QuestionId)
        {
            var answer = await (
                from Answer in _context.Answer
                where Answer.QuestionId == QuestionId
                select new AnswerListOutputDto()
                {
                    AnswerId = Answer.AnswerId,
                    AnswerText = Answer.AnswerText,
                    IsCorrect = Answer.IsCorrect,
                })
                .ToListAsync();
            return answer;
        }

        [NonAction]
        public async Task<List<AnswerRandomOutputDto>> AnswerByQuestionId(long QuestionId)
        {
            var answer = await (
                from Answer in _context.Answer
                where Answer.QuestionId == QuestionId
                select new AnswerRandomOutputDto()
                {
                    AnswerId = Answer.AnswerId,
                    AnswerText = Answer.AnswerText,
                })
                .ToListAsync();
            return answer;
        }

        [Authorize]
        [HttpPost("SubmitAnswers")]
        public async Task<ActionResult> SubmitAnswers([FromBody] QuestionAnsweredInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            var test = await _context.Test.SingleOrDefaultAsync(t => t.TestId == input.TestId);
            if (test == null) return BadRequest(new { message = "Test not found!" });
            var existingAssignment = await _context.UserTestCodeAssignment.SingleOrDefaultAsync(utc => utc.Username == input.Username && utc.TestId == input.TestId);
            if (existingAssignment == null) return BadRequest(new { message = "You have not assigned for the test yet!" });
            if (vietnamTime < test.BeginDate) return BadRequest(new { message = "Test time has not yet begun" });
            if (vietnamTime > test.EndDate) return BadRequest(new { message = "The test is overdue" });
            if (vietnamTime > existingAssignment.AssignmentTime + test.TestTime) return BadRequest(new { message = "The test is overdue" });

            double totalMarks = 0;

            foreach (var answerInput in input.Answers)
            {
                var question = await _context.Question.SingleOrDefaultAsync(q => q.QuestionId == answerInput.QuestionId);
                if (question == null) return BadRequest(new { message = $"Question with ID {answerInput.QuestionId} not found!" });

                if (answerInput.AnswerId == null)
                {
                    continue;
                }

                var answer = await _context.Answer.SingleOrDefaultAsync(a => a.AnswerId == answerInput.AnswerId);
                if (answer.QuestionId != answerInput.QuestionId)
                {
                    return BadRequest(new { message = $"Answer with ID {answerInput.AnswerId} not found or doesn't belong to the question!" });
                }

                if (answer.IsCorrect)
                {
                    totalMarks += question.QuestionMark;
                }
            }

            var userMark = new UserMark
            {
                UserId = user.UserId,
                TestId = input.TestId,
                Mark = totalMarks
            };

            _context.UserMark.Add(userMark);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Answers submitted successfully!", totalMarks });
        }

        [Authorize]
        [HttpPut("EditAnswer")]
        public async Task<ActionResult> EditAnswer([FromBody] AnswerEditInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            if (user.IsAdmin == false) return BadRequest(new { message = "User is not an admin!" });
            var answerToEdit = await _context.Answer.SingleOrDefaultAsync(a => a.AnswerId == input.AnswerId);
            if (answerToEdit == null)
            {
                return BadRequest(new { message = "Answer not found!" });
            }
            var otherAnswers = await _context.Answer
                .Where(a => a.QuestionId == answerToEdit.QuestionId)
                .ToListAsync();
            answerToEdit.AnswerText = input.AnswerText;
            if (answerToEdit.IsCorrect == false && input.IsCorrect == false)
            {
                answerToEdit.AnswerText = input.AnswerText;
            }
            else if (answerToEdit.IsCorrect == false && input.IsCorrect == true)
            {
                foreach (var answer in otherAnswers)
                {
                    if (answer.AnswerId == input.AnswerId)
                    {
                        if (answer.IsCorrect == false && input.IsCorrect == true)
                        {
                            answer.IsCorrect = input.IsCorrect;
                        }
                        else if (answer.IsCorrect == false && input.IsCorrect == false)
                        {
                            answer.IsCorrect = input.IsCorrect;
                        }
                        else if (answer.IsCorrect == true && input.IsCorrect == true)
                        {
                            answer.IsCorrect = input.IsCorrect;
                        }
                        else if (answer.IsCorrect == true && input.IsCorrect == false)
                        {
                            return BadRequest(new { message = "Invalid" });
                        }
                    }
                    else
                    {
                        answer.IsCorrect = false;
                    }
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Edit Answer successfully!" });
        }
    }
}