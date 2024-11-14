using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class Test
    {
        public long TestId { get; set; }
        public string TestName { get; set; }
        public string TestKey { get; set; }
        public DateTime BeginDate { get; set; }
        public TimeSpan TestTime { get; set; }
        public DateTime EndDate { get; set; }
        public ICollection<TestQuestionAssignment> TestQuestionAssignment { get; set; }
        public ICollection<Question> Question { get; set; }
        public ICollection<UserTestCodeAssignment> UserTestCodeAssignment { get; set; }
    }
}