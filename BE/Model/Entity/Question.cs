using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class Question
    {
        public long QuestionId { get; set; }
        public long TestId { get; set; }
        public string QuestionText { get; set; }
        public string QuestionDifficultyName { get; set; }
        public double QuestionMark { get; set; }
        public ICollection<TestQuestionAssignment> TestQuestionAssignment { get; set; }
        public ICollection<Answer> Answers { get; set; }
        public Test Test { get; set; }
    }
}