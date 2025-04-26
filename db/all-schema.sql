-- Combined SQL Schema for LLM Analytics Dashboard

-- User Tables
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Role NVARCHAR(20) DEFAULT 'user',
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME,
    IsActive BIT DEFAULT 1
);

CREATE TABLE UserPreferences (
    PreferenceID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Theme NVARCHAR(20) DEFAULT 'light',
    DashboardLayout NVARCHAR(MAX),
    NotificationsEnabled BIT DEFAULT 1,
    EmailNotifications BIT DEFAULT 1,
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE UserSessions (
    SessionID NVARCHAR(100) PRIMARY KEY,
    UserID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME,
    IPAddress NVARCHAR(50),
    UserAgent NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE UserActivity (
    ActivityID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ActivityType NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX),
    Timestamp DATETIME DEFAULT GETDATE(),
    ResourceID INT,
    ResourceType NVARCHAR(50),
    IPAddress NVARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Analytics Tables
CREATE TABLE QueryHistory (
    QueryID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    QueryText NVARCHAR(MAX) NOT NULL,
    ExecutionTime INT, -- in milliseconds
    RowsReturned INT,
    Status NVARCHAR(20),
    Timestamp DATETIME DEFAULT GETDATE(),
    DatabaseName NVARCHAR(100),
    Tags NVARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Reports (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Title NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    QueryID INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    ScheduleID INT,
    IsPublic BIT DEFAULT 0,
    Tags NVARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (QueryID) REFERENCES QueryHistory(QueryID)
);

CREATE TABLE ReportSchedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    ReportID INT NOT NULL,
    Frequency NVARCHAR(20) NOT NULL, -- daily, weekly, monthly
    DayOfWeek INT, -- 1-7 for weekly
    DayOfMonth INT, -- 1-31 for monthly
    TimeOfDay TIME,
    IsActive BIT DEFAULT 1,
    LastRun DATETIME,
    NextRun DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ReportID) REFERENCES Reports(ReportID)
);

CREATE TABLE LLMModels (
    ModelID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Provider NVARCHAR(50),
    Version NVARCHAR(50),
    Description NVARCHAR(MAX),
    Parameters BIGINT,
    ContextLength INT,
    IsActive BIT DEFAULT 1,
    DateAdded DATETIME DEFAULT GETDATE(),
    LastUsed DATETIME,
    ConfigPath NVARCHAR(255)
);

CREATE TABLE LLMUsage (
    UsageID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ModelID INT NOT NULL,
    TokensInput INT,
    TokensOutput INT,
    LatencyMS INT,
    QueryText NVARCHAR(MAX),
    ResponseText NVARCHAR(MAX),
    Timestamp DATETIME DEFAULT GETDATE(),
    Cost DECIMAL(10,6),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (ModelID) REFERENCES LLMModels(ModelID)
);

-- Integration Tables
CREATE TABLE Integrations (
    IntegrationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    IntegrationType NVARCHAR(50) NOT NULL, -- google, slack, etc.
    Name NVARCHAR(100),
    ConfigData NVARCHAR(MAX), -- JSON config
    AccessToken NVARCHAR(MAX),
    RefreshToken NVARCHAR(MAX),
    TokenExpiry DATETIME,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE IntegrationUsage (
    UsageID INT IDENTITY(1,1) PRIMARY KEY,
    IntegrationID INT NOT NULL,
    UserID INT NOT NULL,
    ActionType NVARCHAR(50),
    Description NVARCHAR(MAX),
    Timestamp DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20),
    ErrorMessage NVARCHAR(MAX),
    FOREIGN KEY (IntegrationID) REFERENCES Integrations(IntegrationID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Additional Tables
CREATE TABLE Tasks (
    TaskID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    TaskType NVARCHAR(50),
    ConfigData NVARCHAR(MAX), -- JSON config
    Schedule NVARCHAR(100), -- CRON expression
    IsActive BIT DEFAULT 1,
    LastRun DATETIME,
    NextRun DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE TaskRuns (
    RunID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    StartTime DATETIME,
    EndTime DATETIME,
    Status NVARCHAR(20),
    Result NVARCHAR(MAX),
    ErrorMessage NVARCHAR(MAX),
    FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID)
);

CREATE TABLE KnowledgeBases (
    KnowledgeBaseID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    IsPublic BIT DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Documents (
    DocumentID INT IDENTITY(1,1) PRIMARY KEY,
    KnowledgeBaseID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX),
    FilePath NVARCHAR(255),
    FileType NVARCHAR(50),
    UploadedAt DATETIME DEFAULT GETDATE(),
    ProcessedAt DATETIME,
    Status NVARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (KnowledgeBaseID) REFERENCES KnowledgeBases(KnowledgeBaseID)
);

CREATE TABLE SystemMetrics (
    MetricID INT IDENTITY(1,1) PRIMARY KEY,
    MetricName NVARCHAR(50) NOT NULL,
    MetricValue FLOAT NOT NULL,
    MetricUnit NVARCHAR(20),
    Timestamp DATETIME DEFAULT GETDATE(),
    Category NVARCHAR(50)
);

CREATE TABLE DataExports (
    ExportID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ExportType NVARCHAR(50) NOT NULL,
    FilePath NVARCHAR(255),
    Status NVARCHAR(20) DEFAULT 'pending',
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    RowCount INT,
    FileSize BIGINT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Indexes for performance
CREATE INDEX idx_user_activity_user_id ON UserActivity(UserID);
CREATE INDEX idx_user_activity_timestamp ON UserActivity(Timestamp);
CREATE INDEX idx_query_history_user_id ON QueryHistory(UserID);
CREATE INDEX idx_query_history_timestamp ON QueryHistory(Timestamp);
CREATE INDEX idx_reports_user_id ON Reports(UserID);
CREATE INDEX idx_llm_usage_user_id ON LLMUsage(UserID);
CREATE INDEX idx_llm_usage_model_id ON LLMUsage(ModelID);
CREATE INDEX idx_llm_usage_timestamp ON LLMUsage(Timestamp);
CREATE INDEX idx_integrations_user_id ON Integrations(UserID);
CREATE INDEX idx_tasks_user_id ON Tasks(UserID);
CREATE INDEX idx_task_runs_task_id ON TaskRuns(TaskID);
CREATE INDEX idx_knowledge_bases_user_id ON KnowledgeBases(UserID);
CREATE INDEX idx_documents_kb_id ON Documents(KnowledgeBaseID);
CREATE INDEX idx_system_metrics_timestamp ON SystemMetrics(Timestamp);
CREATE INDEX idx_system_metrics_name ON SystemMetrics(MetricName);

-- Sample data for testing
INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Role)
VALUES 
('admin', 'admin@example.com', 'hashed_password_here', 'Admin', 'User', 'admin'),
('user1', 'user1@example.com', 'hashed_password_here', 'Test', 'User', 'user');

INSERT INTO LLMModels (Name, Provider, Version, Parameters, ContextLength, IsActive)
VALUES 
('GPT-4', 'OpenAI', '4.0', 1750000000000, 8192, 1),
('Claude 2', 'Anthropic', '2.0', 137000000000, 100000, 1),
('Llama 2', 'Meta', '2.0', 70000000000, 4096, 1),
('GPT-3.5 Turbo', 'OpenAI', '3.5', 175000000000, 4096, 1);

-- Stored Procedures for Database Metrics
CREATE OR ALTER PROCEDURE GetDatabaseMetrics
AS
BEGIN
    -- Database size
    SELECT 
        DB_NAME() AS DatabaseName,
        SUM(size * 8 / 1024) AS SizeMB
    FROM sys.database_files
    WHERE type_desc = 'ROWS';

    -- Connection count
    SELECT 
        COUNT(*) AS ConnectionCount
    FROM sys.dm_exec_connections;

    -- Active queries
    SELECT 
        COUNT(*) AS ActiveQueries
    FROM sys.dm_exec_requests
    WHERE status = 'running';

    -- Cache hit ratio
    SELECT 
        (a.cntr_value * 1.0 / b.cntr_value) * 100 AS CacheHitRatio
    FROM sys.dm_os_performance_counters a
    JOIN sys.dm_os_performance_counters b ON a.object_name = b.object_name
    WHERE a.counter_name = 'Buffer cache hit ratio'
    AND b.counter_name = 'Buffer cache hit ratio base';

    -- CPU usage
    SELECT 
        AVG(cpu_percent) AS CpuUsage
    FROM sys.dm_db_resource_stats
    WHERE database_id = DB_ID();

    -- Memory usage
    SELECT 
        physical_memory_in_use_kb / 1024.0 AS MemoryUsageMB
    FROM sys.dm_os_process_memory;

    -- IO stats
    SELECT 
        SUM(io_stall_read_ms + io_stall_write_ms) / 
        CASE WHEN SUM(num_of_reads + num_of_writes) = 0 THEN 1 
        ELSE SUM(num_of_reads + num_of_writes) END AS AvgIOLatency
    FROM sys.dm_io_virtual_file_stats(NULL, NULL);
END;
GO

-- Create a view for query performance analysis
CREATE OR ALTER VIEW QueryPerformanceView
AS
SELECT 
    q.QueryID,
    u.Username,
    q.QueryText,
    q.ExecutionTime,
    q.RowsReturned,
    q.Status,
    q.Timestamp,
    q.DatabaseName
FROM 
    QueryHistory q
JOIN 
    Users u ON q.UserID = u.UserID;
GO

-- Create a function to get user activity summary
CREATE OR ALTER FUNCTION GetUserActivitySummary(@UserID INT, @Days INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        ActivityType,
        COUNT(*) AS ActivityCount,
        MIN(Timestamp) AS FirstActivity,
        MAX(Timestamp) AS LastActivity
    FROM 
        UserActivity
    WHERE 
        UserID = @UserID
        AND Timestamp >= DATEADD(day, -@Days, GETDATE())
    GROUP BY 
        ActivityType
);
GO
