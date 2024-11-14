using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace BE.Context
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<User> User { get; set; }
        public DbSet<Answer> Answer { get; set; }
        public DbSet<EmailLog> EmailLog { get; set; }
        public DbSet<OTP> OTP { get; set; }
        public DbSet<Question> Question { get; set; }
        public DbSet<QuestionDifficulty> QuestionDifficulty { get; set; }
        public DbSet<Test> Test { get; set; }
        public DbSet<TestQuestionAssignment> TestQuestionAssignment { get; set; }
        public DbSet<UserMark> UserMark { get; set; }
        public DbSet<UserTestCodeAssignment> UserTestCodeAssignment { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Question>()
            .HasMany(q => q.Answers)
            .WithOne(a => a.Question)
            .HasForeignKey(a => a.QuestionId);

            modelBuilder.Entity<TestQuestionAssignment>()
            .HasOne(tqa => tqa.Test)
            .WithMany(t => t.TestQuestionAssignment)
            .HasForeignKey(tqa => tqa.TestId);

            modelBuilder.Entity<TestQuestionAssignment>()
            .HasOne(tqa => tqa.Question)
            .WithMany(q => q.TestQuestionAssignment)
            .HasForeignKey(tqa => tqa.QuestionId);

            modelBuilder.Entity<Test>()
            .HasMany(t => t.Question)
            .WithOne(q => q.Test)
            .HasForeignKey(q => q.TestId);

            modelBuilder.Entity<Test>()
            .HasMany(t => t.UserTestCodeAssignment)
            .WithOne(u => u.Test)
            .HasForeignKey(u => u.TestId);
        }
    }
}