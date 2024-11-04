using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Model.Entity
{
    public class QuestionDifficulty
    {
        [Key] public string QuestionDifficultyName { get; set; }
    }
}