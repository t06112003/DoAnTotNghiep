using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class User
    {
        public long UserId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Email { get; set;}
        public string? ResetToken { get; set; }
        public DateTime? TokenExpiry { get; set; }
        public bool IsAdmin { get; set;}
        
    }
}