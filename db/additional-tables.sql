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

-- Data Exports Table
CREATE TABLE DataExports (
    export_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type NVARCHAR(50) NOT NULL, -- llm_requests, database_queries, etc.
    format NVARCHAR(10) NOT NULL, -- csv, json, xlsx
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    row_count INT NOT NULL,
    size_kb INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- API Keys Table
CREATE TABLE ApiKeys (
    key_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    api_key NVARCHAR(100) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    expires_at DATETIME NULL,
    last_used_at DATETIME NULL,
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
    FOREIGN KEY (key_id) REFERENCES ApiKeys(key_id)
);

-- User Preferences Table
CREATE TABLE UserPreferences (
    user_id INT PRIMARY KEY,
    theme NVARCHAR(20) NOT NULL DEFAULT 'system', -- light, dark, system
    dashboard_layout NVARCHAR(MAX) NULL, -- JSON string with dashboard layout
    notifications_enabled BIT NOT NULL DEFAULT 1,
    email_notifications BIT NOT NULL DEFAULT 1,
    date_format NVARCHAR(20) NOT NULL DEFAULT 'MM/dd/yyyy',
    time_format NVARCHAR(20) NOT NULL DEFAULT 'hh:mm a',
    items_per_page INT NOT NULL DEFAULT 10,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Notifications Table
CREATE TABLE Notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(100) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(20) NOT NULL, -- info, warning, error, success
    is_read BIT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    action_url NVARCHAR(255) NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Scheduled Tasks Table
CREATE TABLE ScheduledTasks (
    task_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    task_type NVARCHAR(50) NOT NULL, -- report, export, backup, etc.
    schedule NVARCHAR(100) NOT NULL, -- cron expression
    parameters NVARCHAR(MAX) NULL, -- JSON string with task parameters
    is_active BIT NOT NULL DEFAULT 1,
    last_run DATETIME NULL,
    next_run DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Task Execution History Table
CREATE TABLE TaskExecutionHistory (
    execution_id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    status NVARCHAR(20) NOT NULL, -- running, completed, failed
    result NVARCHAR(MAX) NULL,
    error_message NVARCHAR(MAX) NULL,
    FOREIGN KEY (task_id) REFERENCES ScheduledTasks(task_id)
);

-- Model Performance Metrics Table
CREATE TABLE ModelPerformanceMetrics (
    metric_id INT IDENTITY(1,1) PRIMARY KEY,
    model_name NVARCHAR(100) NOT NULL,
    date_recorded DATE NOT NULL,
    avg_response_time_ms FLOAT NOT NULL,
    avg_tokens_per_second FLOAT NOT NULL,
    total_requests INT NOT NULL,
    total_tokens INT NOT NULL,
    error_rate FLOAT NOT NULL,
    CONSTRAINT UQ_ModelPerformance UNIQUE (model_name, date_recorded)
);

-- Cost Tracking Table
CREATE TABLE CostTracking (
    cost_id INT IDENTITY(1,1) PRIMARY KEY,
    date_recorded DATE NOT NULL,
    service_type NVARCHAR(50) NOT NULL, -- llm, database, storage, etc.
    cost_amount DECIMAL(10, 4) NOT NULL,
    usage_amount DECIMAL(10, 2) NOT NULL,
    usage_unit NVARCHAR(20) NOT NULL, -- tokens, queries, GB, etc.
    notes NVARCHAR(MAX) NULL
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

-- Knowledge Base Table
CREATE TABLE KnowledgeBase (
    document_id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(100) NOT NULL,
    tags NVARCHAR(255) NULL,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES Users(user_id)
);

-- Embeddings Table for RAG
CREATE TABLE Embeddings (
    embedding_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text NVARCHAR(MAX) NOT NULL,
    embedding VARBINARY(MAX) NOT NULL, -- Store vector embeddings as binary
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (document_id) REFERENCES KnowledgeBase(document_id)
);

-- Create indexes for performance
CREATE INDEX IX_LlmRequests_UserId ON LlmRequests(user_id);
CREATE INDEX IX_LlmRequests_CreatedAt ON LlmRequests(created_at);
CREATE INDEX IX_DatabaseQueries_UserId ON DatabaseQueries(user_id);
CREATE INDEX IX_DatabaseQueries_CreatedAt ON DatabaseQueries(created_at);
CREATE INDEX IX_SystemMetrics_RecordedAt ON SystemMetrics(recorded_at);
CREATE INDEX IX_Sessions_UserId ON Sessions(user_id);
CREATE INDEX IX_ApiKeyUsage_KeyId ON ApiKeyUsage(key_id);
CREATE INDEX IX_Notifications_UserId ON Notifications(user_id);
CREATE INDEX IX_Embeddings_DocumentId ON Embeddings(document_id);
