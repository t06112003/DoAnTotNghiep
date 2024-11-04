using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class TestQuestionAssignment
    {
        public long TestQuestionAssignmentId { get; set; }
        public long TestId { get; set; }
        public long QuestionId { get; set; }
        public long Code { get; set; }
        public Test Test { get; set; }
        public Question Question { get; set; }
    }
}