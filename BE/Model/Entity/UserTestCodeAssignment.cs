using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class UserTestCodeAssignment
    {
        public long UserTestCodeAssignmentId { get; set; }
        public string Username { get; set; }
        public long TestId { get; set; }
        public long Code { get; set; }
        public DateTime AssignmentTime { get; set; }
    }
}