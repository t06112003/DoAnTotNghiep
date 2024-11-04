using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class EmailLog
    {
        public long EmailLogId { get; set; }
        public long UserId { get; set; }
        public long TestId { get; set; }
        public DateTime? SentDate { get; set; }
    }
}