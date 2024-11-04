using System.ComponentModel.DataAnnotations;

namespace BE.Model.Dto
{
    public class UserChangePasswordInputDto
    {
        [Required] public string Username { get; set; }
        public int OTPCode { get; set; }
        [Required] public string CurrentPassword { get; set; }
        [Required] public string NewPassword { get; set; }
    }
}