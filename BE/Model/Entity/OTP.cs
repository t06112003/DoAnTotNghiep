using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class OTP
    {
        public long OTPId { get; set; }
        public long UserId { get; set; }
        public int OTPCode { get; set; }
        public DateTime SentTime { get; set; }
        public bool IsUsed { get; set; }
    }
}