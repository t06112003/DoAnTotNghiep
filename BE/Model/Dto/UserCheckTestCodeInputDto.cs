using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class UserCheckTestCodeInputDto
    {
        public string Username { get; set; }
        public long TestId { get; set; }
    }
}