using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Context;
using BE.Model.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace BE.Controllers
{
    public class UserMarkController : BaseApiController
    {
        private readonly DataContext _context;
        public UserMarkController(DataContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("UserMarkView")]
        public async Task<ActionResult<List<UserMarkViewOutputDto>>> UserMarkView([FromQuery] UserMarkViewInputDto input)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Username == input.Username);
            if (user == null) return BadRequest(new { message = "User not found!" });
            var test = from Test in _context.Test
                       join UserMark in _context.UserMark on Test.TestId equals UserMark.TestId
                       join User in _context.User on UserMark.UserId equals User.UserId
                       where (UserMark.UserId == user.UserId)
                       && (string.IsNullOrWhiteSpace(input.TestName) || Test.TestName.Contains(input.TestName))
                       orderby Test.TestName
                       select new UserMarkViewOutputDto()
                       {
                           UserMarkId = UserMark.UserMarkId,
                           TestId = Test.TestId,
                           TestName = Test.TestName,
                           Mark = UserMark.Mark,
                           BeginDate = Test.BeginDate
                       };
            return await test.ToListAsync();
        }
    }
}