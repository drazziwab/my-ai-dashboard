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
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
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
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
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
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
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
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
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
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
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
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
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
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
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
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
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
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
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
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
