using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class TestRandomInputDto
    {
        [Required]public string Username { get; set; }
        public long TestId { get; set; }
        public string TestKey { get; set; }
    }
}