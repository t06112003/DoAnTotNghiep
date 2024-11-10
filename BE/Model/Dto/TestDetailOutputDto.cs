using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class TestDetailOutputDto
    {
        public long TestId { get; set; }
        public string TestName { get; set; }
        public string TestKey { get; set; }
        public DateTime BeginDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeSpan TestTime { get; set; }
    }
}