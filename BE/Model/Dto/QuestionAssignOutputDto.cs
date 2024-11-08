using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class QuestionAssignOutputDto
    {
        public long QuestionId { get; set; }
        public string QuestionText { get; set; }
        public List<AnswerListOutputDto> Answers { get; set; }
        public long Code { get; set; }
    }
}