CREATE DATABASE DoAn;
--Drop database DoAn;
--Use BTL
USE DoAn;

CREATE TABLE "User" (
    UserId bigint IDENTITY(1,1) PRIMARY KEY,
    Username varchar(16) NOT NULL UNIQUE CHECK (LEN(Username) >= 8),
    Password varchar(16) NOT NULL CHECK (LEN(Password) >= 8),
    Email varchar(50) NOT NULL UNIQUE,
    Name nvarchar(100) NOT NULL,
    IsAdmin bit NOT NULL,
);

CREATE TABLE QuestionDifficulty (
    QuestionDifficultyName nvarchar(10) PRIMARY KEY,
);

CREATE TABLE Test (
    TestId bigint IDENTITY(1,1) PRIMARY KEY,
    TestName varchar(100) NOT NULL,
    TestKey varchar(20) NOT NULL,
    BeginDate datetime2 NOT NULL,
	TestTime time NOT NULL,
    EndDate datetime2 NOT NULL,
);

CREATE TABLE Question (
    QuestionId bigint IDENTITY(1,1) PRIMARY KEY,
    TestId bigint NOT NULL FOREIGN KEY REFERENCES Test(TestId),
    QuestionText nvarchar(500) NOT NULL ,
    QuestionDifficultyName nvarchar(10) NOT NULL FOREIGN KEY REFERENCES QuestionDifficulty(QuestionDifficultyName),
    QuestionMark float NOT NULL,
);

CREATE TABLE Answer (
    AnswerId bigint IDENTITY(1,1) PRIMARY KEY,
    QuestionId bigint NOT NULL FOREIGN KEY REFERENCES Question(QuestionId),
    AnswerText nvarchar(500) NOT NULL ,
    IsCorrect bit NOT NULL,
);

CREATE TABLE OTP (
    OTPId bigint IDENTITY(1,1) PRIMARY KEY,
    UserId bigint NOT NULL FOREIGN KEY REFERENCES "User"(UserId),
    OTPCode int NOT NULL,
    SentTime datetime NOT NULL,
    IsUsed bit NOT NULL,
);

CREATE TABLE EmailLog (
    EmailLogId bigint IDENTITY(1,1) PRIMARY KEY,
    UserId bigint NOT NULL FOREIGN KEY REFERENCES "User"(UserId),
    TestId bigint NOT NULL FOREIGN KEY REFERENCES Test(TestId),
    SentDate datetime,
);

CREATE TABLE TestQuestionAssignment (
    TestQuestionAssignmentId bigint IDENTITY(1,1) PRIMARY KEY,
    TestId bigint NOT NULL FOREIGN KEY REFERENCES Test(TestId),
    QuestionId bigint NOT NULL FOREIGN KEY REFERENCES Question(QuestionId),
    Code bigint NOT NULL,
);

CREATE TABLE UserMark (
    UserMarkId bigint IDENTITY(1,1) PRIMARY KEY,
    UserId bigint NOT NULL FOREIGN KEY REFERENCES "User"(UserId),
    TestId bigint NOT NULL FOREIGN KEY REFERENCES Test(TestId),
    Mark float NOT NULL,
);

CREATE TABLE UserTestCodeAssignment (
    UserTestCodeAssignmentId bigint IDENTITY(1,1) PRIMARY KEY,
    Username varchar(16) NOT NULL,
    TestId bigint NOT NULL FOREIGN KEY REFERENCES Test(TestId),
    Code bigint NOT NULL,
    AssignmentTime datetime2 NOT NULL,
);
