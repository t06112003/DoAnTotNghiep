using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class QuestionListOutputDto
    {
        public long QuestionId { get; set; }
        public string QuestionText { get; set; }
        public string QuestionDifficultyName { get; set; }
        public double QuestionMark { get; set; }
        public List<AnswerListOutputDto> Answers { get; set; }
    }
}