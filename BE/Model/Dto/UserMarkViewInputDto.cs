using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class UserMarkViewInputDto
    {
        public string Username { get; set; }
        public string? TestName { get; set; }
    }
}