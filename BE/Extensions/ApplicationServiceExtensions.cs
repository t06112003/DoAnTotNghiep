using System.Text;
using BE._iservices;
using BE._service;
using BE._services;
using BE.Context;
using BE.Controllers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace BE.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddControllers();
            services.AddSingleton<ZeroScoreService>();
            services.AddHostedService(sp => sp.GetRequiredService<ZeroScoreService>());
            services.AddSingleton<EmailReminderService>();
            services.AddHostedService(sp => sp.GetRequiredService<EmailReminderService>());
            services.AddCors();
            services.AddScoped<UserController>();
            services.AddScoped<AnswerController>();
            services.AddScoped<EmailController>();
            services.AddScoped<OTPController>();
            services.AddHostedService<EmailReminderService>();
            services.AddHostedService<ZeroScoreService>();
            services.AddScoped<ITokenService, TokenService>();

            services.AddDbContext<DataContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
            });

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(option =>
            {
                option.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["TokenKey"])),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme.",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
                        },
                        new string[] {}
                    }
                });
            });
            return services;
        }
    }
}