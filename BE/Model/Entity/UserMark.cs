using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class UserMark
    {
        public long UserMarkId { get; set; }
        public long UserId { get; set; }
        public long TestId { get; set; }
        public double Mark { get; set; }
    }
}