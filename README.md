# MCP Chat Assistant for Jira

## Installation Steps

1. **Package the App**: 
   - Zip all files: `manifest.json`, `index.html`, `app.js`, `style.css`
   
2. **Upload to Jira**:
   - Go to Jira Settings → Apps → Upload app
   - Upload the zip file
   
3. **Configure MCP URL**:
   - After installation, open any Jira issue
   - Click the "AI Chat" button in the issue view
   - Double-click the header to show config
   - Enter your MCP agent URL: `https://cdb8fd503520.ngrok-free.app`
   - Click Connect

## Features

- **Issue Context**: Chat knows which issue you're viewing
- **Persistent Config**: URL saves in browser storage
- **Real-time Chat**: Direct integration with your MCP agent
- **Native UI**: Matches Jira's design system

## MCP Agent Requirements

Your MCP agent should expose these endpoints:

- `GET /health` - Connection test
- `POST /chat` - Main chat endpoint

Expected chat payload:
```json
{
  "message": "user message",
  "context": {
    "issueKey": "PROJ-123",
    "platform": "jira"
  }
}
```

Expected response:
```json
{
  "response": "AI response text"
}
```