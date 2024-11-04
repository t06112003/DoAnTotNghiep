using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class QuestionAnsweredInputDto
    {
        public string Username { get; set; }
        public long TestId { get; set; }
        public string TestKey { get; set; }
        public List<AnswerInputDto> Answers { get; set; }
    }

    public class AnswerInputDto
    {
        public long QuestionId { get; set; }
        public long? AnswerId { get; set; }
    }
}