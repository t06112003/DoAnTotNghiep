using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class UserMarkViewOutputDto
    {
        public long UserMarkId { get; set; }
        public long TestId { get; set; }
        public string TestName { get; set; }
        public double Mark { get; set; }
        public DateTime BeginDate { get; set; }
    }
}