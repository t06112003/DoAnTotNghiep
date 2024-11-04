using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class QuestionAndAnswersInputDto
    {
        public string Username { get; set; }
        public long TestId { get; set; }
        public string QuestionText { get; set; }
        public string QuestionDifficultyName { get; set; }
        public double QuestionMark { get; set; }
        public List<AnswerDto> Answers { get; set; }
    }

    public class AnswerDto
    {
        public string AnswerText { get; set; }
        public bool IsCorrect { get; set; }
    }
}