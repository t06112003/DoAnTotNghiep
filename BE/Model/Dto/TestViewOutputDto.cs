using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class TestViewOutputDto
    {
        public long TestId { get; set; }
        public string TestName { get; set; }
        public string Name { get; set; }
        public double Mark { get; set; }
        public DateTime BeginDate { get; set; }
    }
}