using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class ResetPasswordInputDto
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}