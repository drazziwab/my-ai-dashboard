-- LLM Usage Tables
CREATE TABLE LLMRequests (
    RequestID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    ModelID NVARCHAR(100) NOT NULL,
    Prompt NVARCHAR(MAX) NOT NULL,
    Response NVARCHAR(MAX),
    TokensUsed INT,
    ProcessingTime FLOAT,
    Cost DECIMAL(10, 6),
    Status NVARCHAR(20),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    IPAddress NVARCHAR(50),
    SessionID NVARCHAR(100),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE LLMModels (
    ModelID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Provider NVARCHAR(50) NOT NULL,
    Version NVARCHAR(50),
    Description NVARCHAR(MAX),
    Parameters BIGINT,
    ContextWindow INT,
    CostPerToken DECIMAL(10, 8),
    IsActive BIT NOT NULL DEFAULT 1,
    AddedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastUsed DATETIME
);

CREATE TABLE LLMFeedback (
    FeedbackID INT PRIMARY KEY IDENTITY(1,1),
    RequestID INT NOT NULL,
    UserID INT,
    Rating INT,
    Comments NVARCHAR(MAX),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (RequestID) REFERENCES LLMRequests(RequestID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Database Query Tables
CREATE TABLE DatabaseQueries (
    QueryID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    Query NVARCHAR(MAX) NOT NULL,
    DatabaseName NVARCHAR(100),
    ExecutionTime FLOAT,
    RowsAffected INT,
    Status NVARCHAR(20),
    ErrorMessage NVARCHAR(MAX),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    IPAddress NVARCHAR(50),
    SessionID NVARCHAR(100),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE QueryPerformance (
    PerformanceID INT PRIMARY KEY IDENTITY(1,1),
    QueryID INT NOT NULL,
    ExecutionPlan NVARCHAR(MAX),
    CPUTime FLOAT,
    IOTime FLOAT,
    MemoryUsage BIGINT,
    FOREIGN KEY (QueryID) REFERENCES DatabaseQueries(QueryID)
);

CREATE TABLE SavedQueries (
    SavedQueryID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Query NVARCHAR(MAX) NOT NULL,
    DatabaseName NVARCHAR(100),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastRun DATETIME,
    IsPublic BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- System Metrics Tables
CREATE TABLE SystemMetrics (
    MetricID INT PRIMARY KEY IDENTITY(1,1),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    CPUUsage FLOAT,
    MemoryUsage FLOAT,
    DiskUsage FLOAT,
    NetworkIn FLOAT,
    NetworkOut FLOAT,
    ActiveUsers INT,
    ServerName NVARCHAR(100)
);

CREATE TABLE SystemAlerts (
    AlertID INT PRIMARY KEY IDENTITY(1,1),
    MetricID INT,
    AlertType NVARCHAR(50) NOT NULL,
    Severity NVARCHAR(20) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    IsResolved BIT NOT NULL DEFAULT 0,
    ResolvedAt DATETIME,
    FOREIGN KEY (MetricID) REFERENCES SystemMetrics(MetricID)
);

-- Reports and Exports
CREATE TABLE Reports (
    ReportID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Type NVARCHAR(50) NOT NULL,
    Configuration NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastRun DATETIME,
    Schedule NVARCHAR(50),
    IsPublic BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE ReportExecutions (
    ExecutionID INT PRIMARY KEY IDENTITY(1,1),
    ReportID INT NOT NULL,
    UserID INT,
    StartTime DATETIME NOT NULL DEFAULT GETDATE(),
    EndTime DATETIME,
    Status NVARCHAR(20) NOT NULL,
    ResultPath NVARCHAR(255),
    ErrorMessage NVARCHAR(MAX),
    FOREIGN KEY (ReportID) REFERENCES Reports(ReportID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE DataExports (
    ExportID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Type NVARCHAR(50) NOT NULL,
    Format NVARCHAR(20) NOT NULL,
    Configuration NVARCHAR(MAX),
    FilePath NVARCHAR(255),
    FileSize BIGINT,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME,
    DownloadCount INT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Analytics and Predictions
CREATE TABLE AnalyticsModels (
    ModelID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Type NVARCHAR(50) NOT NULL,
    Configuration NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastTrained DATETIME,
    Accuracy FLOAT,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE Predictions (
    PredictionID INT PRIMARY KEY IDENTITY(1,1),
    ModelID INT NOT NULL,
    UserID INT,
    InputData NVARCHAR(MAX),
    PredictionResult NVARCHAR(MAX),
    Confidence FLOAT,
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ModelID) REFERENCES AnalyticsModels(ModelID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE AnomalyDetection (
    AnomalyID INT PRIMARY KEY IDENTITY(1,1),
    MetricType NVARCHAR(50) NOT NULL,
    Value FLOAT NOT NULL,
    ExpectedRange NVARCHAR(50),
    Deviation FLOAT,
    Severity NVARCHAR(20) NOT NULL,
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    IsResolved BIT NOT NULL DEFAULT 0,
    ResolvedAt DATETIME,
    ResolvedBy INT,
    FOREIGN KEY (ResolvedBy) REFERENCES Users(UserID)
);

-- Cost Tracking
CREATE TABLE CostTracking (
    CostID INT PRIMARY KEY IDENTITY(1,1),
    ServiceType NVARCHAR(50) NOT NULL,
    ResourceID NVARCHAR(100),
    UserID INT,
    Amount DECIMAL(10, 4) NOT NULL,
    Currency NVARCHAR(3) DEFAULT 'USD',
    Description NVARCHAR(255),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    BillingPeriod NVARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Performance Benchmarks
CREATE TABLE PerformanceBenchmarks (
    BenchmarkID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Type NVARCHAR(50) NOT NULL,
    Configuration NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE BenchmarkRuns (
    RunID INT PRIMARY KEY IDENTITY(1,1),
    BenchmarkID INT NOT NULL,
    StartTime DATETIME NOT NULL DEFAULT GETDATE(),
    EndTime DATETIME,
    Status NVARCHAR(20) NOT NULL,
    Results NVARCHAR(MAX),
    SystemInfo NVARCHAR(MAX),
    FOREIGN KEY (BenchmarkID) REFERENCES PerformanceBenchmarks(BenchmarkID)
);

-- Security Monitoring
CREATE TABLE SecurityEvents (
    EventID INT PRIMARY KEY IDENTITY(1,1),
    EventType NVARCHAR(50) NOT NULL,
    Severity NVARCHAR(20) NOT NULL,
    UserID INT,
    IPAddress NVARCHAR(50),
    UserAgent NVARCHAR(255),
    Description NVARCHAR(MAX),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    IsResolved BIT NOT NULL DEFAULT 0,
    ResolvedAt DATETIME,
    ResolvedBy INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (ResolvedBy) REFERENCES Users(UserID)
);

CREATE TABLE SecurityPolicies (
    PolicyID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Configuration NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);
