using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class UserCheckIsAdminInputDto
    {
        [Required]public string Username { get; set; }
    }
}