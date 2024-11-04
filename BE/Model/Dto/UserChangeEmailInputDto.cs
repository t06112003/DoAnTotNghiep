using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class UserChangeEmailInputDto
    {
        [Required] public string Username { get; set; }
        [Required] public int OTPCode { get; set; }
        [Required] public string CurrentEmail { get; set; }
        [Required] public string NewEmail { get; set; }

    }
}