using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Dto
{
    public class QuestionRandomInputDto
    {
        [Required] public string Username { get; set; }
        public long TestId { get; set; }
        public int EasyQuestions { get; set; }
        public int MediumQuestions { get; set; }
        public int HardQuestions { get; set; }
    }
}