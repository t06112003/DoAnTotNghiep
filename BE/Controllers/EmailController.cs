using System.Net;
using System.Net.Mail;
using BE.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers
{
    public class EmailModel
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }
    public class EmailController : BaseApiController
    {
        [NonAction]
        public async Task<ActionResult> SendEmail(EmailModel emailModel)
        {
            try
            {
                using (SmtpClient smtpClient = new SmtpClient("smtp.gmail.com"))
                {
                    smtpClient.Port = 587;
                    smtpClient.Credentials = new NetworkCredential("tuan0207866@huce.edu.vn", "Tuan0611@12");
                    smtpClient.EnableSsl = true;
                    MailMessage mail = new MailMessage();
                    mail.IsBodyHtml = true;
                    mail.From = new MailAddress("tuan0207866@huce.edu.vn");
                    mail.To.Add(emailModel.To);
                    mail.Subject = emailModel.Subject;
                    mail.Body = emailModel.Body;
                    await smtpClient.SendMailAsync(mail);
                }
                return Ok(new {message = "Email send successfully, please go check your Email!"});
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = $"Email send failed! Error: {ex.Message}"});
            }
        }
    }
}