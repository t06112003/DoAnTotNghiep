using System.ComponentModel.DataAnnotations;

namespace BE.Model.Dto
{
    public class UserChangePasswordInputDto
    {
        [Required] public string Username { get; set; }
        [Required][StringLength(16, MinimumLength = 8)] public string CurrentPassword { get; set; }
        [Required][StringLength(10, MinimumLength = 6)] public string NewPassword { get; set; }
        public int OTPCode { get; set; }
    }
}