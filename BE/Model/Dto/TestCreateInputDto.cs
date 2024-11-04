using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class TestCreateInputDto
    {
        [Required] public string Username { get; set; }
        [Required] public string TestName { get; set; }
        [Required] public string TestKey { get; set; }
        public DateTime BeginDate { get; set; }
        public TimeSpan TestTime { get; set; }
        public DateTime EndDate { get; set; }
    }
}