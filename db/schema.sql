-- Users and Authentication Tables
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    salt NVARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_login DATETIME NULL,
    is_active BIT NOT NULL DEFAULT 1,
    role NVARCHAR(20) NOT NULL DEFAULT 'user' -- 'admin', 'user', etc.
);

CREATE TABLE Sessions (
    session_id NVARCHAR(100) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    ip_address NVARCHAR(50) NULL,
    user_agent NVARCHAR(255) NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- LLM Usage Tracking Tables
CREATE TABLE LlmRequests (
    request_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    model_name NVARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NULL,
    tokens_prompt INT NOT NULL,
    tokens_completion INT NOT NULL,
    tokens_total INT NOT NULL,
    duration_ms INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    context_window INT NULL,
    temperature FLOAT NULL,
    top_p FLOAT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE ModelUsage (
    usage_id INT IDENTITY(1,1) PRIMARY KEY,
    model_name NVARCHAR(100) NOT NULL,
    date_recorded DATE NOT NULL,
    total_requests INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    avg_response_time_ms INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_ModelUsage UNIQUE (model_name, date_recorded)
);

-- Database Usage Tracking Tables
CREATE TABLE DatabaseQueries (
    query_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    query_text NVARCHAR(MAX) NOT NULL,
    execution_time_ms INT NOT NULL,
    rows_affected INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    status NVARCHAR(20) NOT NULL, -- 'success', 'error', etc.
    error_message NVARCHAR(MAX) NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE SystemMetrics (
    metric_id INT IDENTITY(1,1) PRIMARY KEY,
    recorded_at DATETIME NOT NULL DEFAULT GETDATE(),
    cpu_usage FLOAT NOT NULL,
    ram_usage FLOAT NOT NULL,
    gpu_usage FLOAT NULL,
    disk_usage FLOAT NOT NULL,
    network_in_kbps FLOAT NULL,
    network_out_kbps FLOAT NULL
);

-- System Status Tracking
CREATE TABLE SystemStatus (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    system_name NVARCHAR(50) NOT NULL,
    is_online BIT NOT NULL DEFAULT 1,
    last_checked DATETIME NOT NULL DEFAULT GETDATE(),
    response_time_ms INT NULL,
    error_message NVARCHAR(255) NULL,
    CONSTRAINT UQ_SystemName UNIQUE (system_name)
);

-- User Management Tables
CREATE TABLE UserPreferences (
    UserID INT PRIMARY KEY,
    Theme NVARCHAR(20) DEFAULT 'light',
    Language NVARCHAR(10) DEFAULT 'en',
    NotificationsEnabled BIT DEFAULT 1,
    EmailNotificationsEnabled BIT DEFAULT 1,
    DefaultDashboard NVARCHAR(50) DEFAULT 'overview',
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

CREATE TABLE UserAPIKeys (
    KeyID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    APIKey NVARCHAR(100) NOT NULL,
    Name NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME,
    LastUsed DATETIME,
    IsActive BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Permissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    Category NVARCHAR(50)
);

CREATE TABLE RolePermissions (
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID)
);

CREATE TABLE UserRoles (
    UserID INT NOT NULL,
    RoleID INT NOT NULL,
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES Users(user_id),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- User Activity Logging
CREATE TABLE UserActivityLog (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    Action NVARCHAR(100) NOT NULL,
    Details NVARCHAR(MAX),
    IPAddress NVARCHAR(50),
    UserAgent NVARCHAR(255),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

-- Email Verification and Password Reset
CREATE TABLE EmailVerifications (
    VerificationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Token NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

CREATE TABLE PasswordResets (
    ResetID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Token NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

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
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
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
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

-- Database Query Tables
CREATE TABLE QueryPerformance (
    PerformanceID INT PRIMARY KEY IDENTITY(1,1),
    QueryID INT NOT NULL,
    ExecutionPlan NVARCHAR(MAX),
    CPUTime FLOAT,
    IOTime FLOAT,
    MemoryUsage BIGINT,
    FOREIGN KEY (QueryID) REFERENCES DatabaseQueries(query_id)
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
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
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
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
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
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
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
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
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
    FOREIGN KEY (CreatedBy) REFERENCES Users(user_id)
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
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
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
    FOREIGN KEY (ResolvedBy) REFERENCES Users(user_id)
);

-- Integration Tables
CREATE TABLE Integrations (
    IntegrationID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255),
    Configuration NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(user_id)
);

CREATE TABLE IntegrationCredentials (
    CredentialID INT PRIMARY KEY IDENTITY(1,1),
    IntegrationID INT NOT NULL,
    UserID INT NOT NULL,
    AccessToken NVARCHAR(MAX),
    RefreshToken NVARCHAR(MAX),
    TokenExpiry DATETIME,
    AdditionalData NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (IntegrationID) REFERENCES Integrations(IntegrationID),
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

CREATE TABLE IntegrationLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    IntegrationID INT NOT NULL,
    UserID INT,
    Action NVARCHAR(100) NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    Request NVARCHAR(MAX),
    Response NVARCHAR(MAX),
    ErrorMessage NVARCHAR(MAX),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (IntegrationID) REFERENCES Integrations(IntegrationID),
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

-- Notification System
CREATE TABLE NotificationTemplates (
    TemplateID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Subject NVARCHAR(255),
    Body NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(user_id)
);

CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    TemplateID INT,
    Title NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ReadAt DATETIME,
    RelatedEntityType NVARCHAR(50),
    RelatedEntityID NVARCHAR(100),
    FOREIGN KEY (UserID) REFERENCES Users(user_id),
    FOREIGN KEY (TemplateID) REFERENCES NotificationTemplates(TemplateID)
);

-- Scheduled Tasks
CREATE TABLE ScheduledTasks (
    TaskID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Type NVARCHAR(50) NOT NULL,
    Configuration NVARCHAR(MAX),
    Schedule NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    LastRun DATETIME,
    NextRun DATETIME,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(user_id)
);

CREATE TABLE TaskExecutions (
    ExecutionID INT PRIMARY KEY IDENTITY(1,1),
    TaskID INT NOT NULL,
    StartTime DATETIME NOT NULL DEFAULT GETDATE(),
    EndTime DATETIME,
    Status NVARCHAR(20) NOT NULL,
    Result NVARCHAR(MAX),
    ErrorMessage NVARCHAR(MAX),
    FOREIGN KEY (TaskID) REFERENCES ScheduledTasks(TaskID)
);

-- Knowledge Base
CREATE TABLE KnowledgeBases (
    KnowledgeBaseID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    IsPublic BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(user_id)
);

CREATE TABLE Documents (
    DocumentID INT PRIMARY KEY IDENTITY(1,1),
    KnowledgeBaseID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Metadata NVARCHAR(MAX),
    IsPublic BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (KnowledgeBaseID) REFERENCES KnowledgeBases(KnowledgeBaseID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(user_id)
);

CREATE TABLE DocumentVectors (
    VectorID INT PRIMARY KEY IDENTITY(1,1),
    DocumentID INT NOT NULL,
    ChunkIndex INT NOT NULL,
    ChunkText NVARCHAR(MAX) NOT NULL,
    Embedding VARBINARY(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (DocumentID) REFERENCES Documents(DocumentID)
);

-- RAG Queries
CREATE TABLE RAGQueries (
    QueryID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    Query NVARCHAR(MAX) NOT NULL,
    KnowledgeBaseID INT,
    ProcessingTime FLOAT,
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(user_id),
    FOREIGN KEY (KnowledgeBaseID) REFERENCES KnowledgeBases(KnowledgeBaseID)
);

CREATE TABLE RAGResults (
    ResultID INT PRIMARY KEY IDENTITY(1,1),
    QueryID INT NOT NULL,
    DocumentID INT NOT NULL,
    ChunkIndex INT,
    Relevance FLOAT,
    FOREIGN KEY (QueryID) REFERENCES RAGQueries(QueryID),
    FOREIGN KEY (DocumentID) REFERENCES Documents(DocumentID)
);

-- Feedback System
CREATE TABLE Feedback (
    FeedbackID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    Type NVARCHAR(50) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Rating INT,
    RelatedEntityType NVARCHAR(50),
    RelatedEntityID NVARCHAR(100),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (UserID) REFERENCES Users(user_id)
);

-- Admin Logs Table
CREATE TABLE AdminLogs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    action_type NVARCHAR(50) NOT NULL, -- USER_CREATED, USER_UPDATED, USER_DELETED, etc.
    details NVARCHAR(MAX) NULL,
    target_id INT NULL, -- ID of the affected resource
    timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- API Key Usage Table
CREATE TABLE ApiKeyUsage (
    usage_id INT IDENTITY(1,1) PRIMARY KEY,
    key_id INT NOT NULL,
    endpoint NVARCHAR(255) NOT NULL,
    method NVARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    ip_address NVARCHAR(50) NULL,
    user_agent NVARCHAR(255) NULL,
    FOREIGN KEY (key_id) REFERENCES UserAPIKeys(KeyID)
);

-- Security Audit Log
CREATE TABLE SecurityAuditLog (
    audit_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL,
    event_type NVARCHAR(50) NOT NULL, -- login, logout, failed_login, permission_change, etc.
    details NVARCHAR(MAX) NOT NULL,
    ip_address NVARCHAR(50) NULL,
    user_agent NVARCHAR(255) NULL,
    timestamp DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create indexes for performance
CREATE INDEX IX_LlmRequests_UserId ON LlmRequests(user_id);
CREATE INDEX IX_LlmRequests_CreatedAt ON LlmRequests(created_at);
CREATE INDEX IX_DatabaseQueries_UserId ON DatabaseQueries(user_id);
CREATE INDEX IX_DatabaseQueries_CreatedAt ON DatabaseQueries(created_at);
CREATE INDEX IX_SystemMetrics_RecordedAt ON SystemMetrics(recorded_at);
CREATE INDEX IX_Sessions_UserId ON Sessions(user_id);
CREATE INDEX IX_ApiKeyUsage_KeyId ON ApiKeyUsage(key_id);
CREATE INDEX IX_Notifications_UserId ON Notifications(UserID);
CREATE INDEX IX_Embeddings_DocumentId ON DocumentVectors(DocumentID);

-- Insert default systems to monitor
INSERT INTO SystemStatus (system_name, is_online, last_checked)
VALUES 
('Database', 1, GETDATE()),
('LLM Service', 1, GETDATE()),
('File Storage', 1, GETDATE()),
('API Gateway', 1, GETDATE());

-- Insert a default admin user (password: admin123)
INSERT INTO Users (username, email, password_hash, salt, role)
VALUES ('admin', 'admin@example.com', 'hashed_password_placeholder', 'salt_placeholder', 'admin');
