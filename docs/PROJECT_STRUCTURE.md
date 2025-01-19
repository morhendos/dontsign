# DontSign Project Structure

## Directory Structure

[Previous directory structure content...]

## Application Flows

### Contract Analysis Flow

```mermaid
graph TB
    subgraph File Upload
        A[User] -->|Uploads File| B[ContractUpload]
        B -->|Validates| C{File Valid?}
        C -->|Yes| D[PDF Utils]
        C -->|No| E[Error Display]
        D -->|Extract Text| F[Text Content]
    end
    
    subgraph Analysis
        F -->|Split| G[Text Chunks]
        G -->|Process| H[Server Action]
        H -->|OpenAI| I[GPT Analysis]
        I -->|Results| J[Analysis Results]
    end
    
    subgraph Display
        J -->|Show| K[Results Display]
        K -->|Save| L[Analysis History]
        K -->|Export| M[Download/Share]
    end
    
    subgraph Analytics/Monitoring
        N[Analytics] -.->|Track| B
        N -.->|Track| H
        N -.->|Track| K
        O[Sentry] -.->|Monitor| B
        O -.->|Monitor| H
        O -.->|Monitor| D
    end
```

### Error Handling Flow

```mermaid
flowchart TB
    subgraph "Error Sources"
        A1[File Upload] -->|Error| B[Error Handler]
        A2[PDF Processing] -->|Error| B
        A3[OpenAI API] -->|Error| B
        A4[Analysis] -->|Error| B
    end
    
    subgraph "Error Processing"
        B -->|Capture| C[Sentry]
        B -->|Display| D[Error Component]
        B -->|Log| E[Analytics]
    end
    
    subgraph "User Recovery"
        D -->|Show| F[User Message]
        D -->|Action| G[Retry Button]
        D -->|Help| H[Support Link]
        G -->|Click| I[Reset State]
    end
```

### State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    state "File Upload" as Upload {
        Idle --> Uploading: Select File
        Uploading --> Validating: File Received
        Validating --> Processing: Valid
        Validating --> Error: Invalid
        Processing --> Ready: Text Extracted
        Processing --> Error: Failed
    }
    
    state "Analysis" as Analysis {
        Ready --> Analyzing: Start Analysis
        Analyzing --> Chunks: Split Text
        Chunks --> APICall: Process Chunk
        APICall --> Chunks: Next Chunk
        APICall --> Complete: All Done
        APICall --> Error: API Error
    }
    
    state "Results" as Results {
        Complete --> Displayed: Show Results
        Displayed --> Saved: Save History
        Saved --> [*]
    }
    
    Error --> Idle: Reset
```

## Flow Descriptions

### Contract Analysis Flow
The main application flow for analyzing contracts:
1. User uploads a contract document
2. File is validated and processed
3. Text is extracted and chunked
4. Each chunk is analyzed by OpenAI
5. Results are compiled and displayed
6. Analysis is saved to history

### Error Handling Flow
Comprehensive error handling process:
1. Errors are caught from multiple sources
2. Processed through error boundaries
3. Tracked in Sentry and analytics
4. Displayed to user with recovery options
5. State is reset on retry

### State Management Flow
Detailed state transitions throughout the application:
1. Initial file upload and validation
2. Text processing and preparation
3. Chunk-based analysis process
4. Results display and storage
5. Error handling and recovery

[Rest of the previous content...]