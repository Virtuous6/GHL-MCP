# GoHighLevel Communications MCP Server

Dynamic multi-tenant MCP server for GoHighLevel communication operations including conversations, SMS, email, and email campaigns.

## Features

### Conversation Management
- Send SMS messages to contacts
- Send emails to contacts  
- Search conversations with advanced filters
- Get conversation details and message history
- Create new conversations
- Update conversation properties (star, mark read, etc.)
- Delete conversations
- Get recent messages across all conversations

### Email Campaign Management
- Get email campaigns with status filtering
- Create custom email templates
- Get email templates with pagination
- Update existing email templates
- Delete email templates

### Message Operations
- Get email message details
- Get generic message details
- Upload message attachments
- Update message status (read/unread)
- Add inbound messages to conversations
- Add outbound call records
- Get message recordings and transcriptions
- Cancel scheduled messages and emails
- Live chat typing indicators

## Architecture

This server uses a **dynamic multi-tenant** architecture where:
- No pre-configuration required
- Users provide API credentials with each tool call
- Supports unlimited tenants/users
- Each request is authenticated individually

## Usage

### Tool Parameters

Every tool requires these authentication parameters:
- `apiKey` (required): GoHighLevel API key
- `locationId` (optional): GoHighLevel location ID for location-specific operations

### Available Tools

**Conversation Tools:**
- `send_sms` - Send SMS messages
- `send_email` - Send email messages  
- `search_conversations` - Find conversations with filters
- `get_conversation` - Get conversation details and messages
- `create_conversation` - Create new conversation
- `update_conversation` - Update conversation properties
- `delete_conversation` - Delete conversations
- `get_recent_messages` - Get recent activity
- `get_email_message` - Get email message details
- `get_message` - Get generic message details
- `upload_message_attachments` - Add file attachments
- `update_message_status` - Mark messages read/unread
- `add_inbound_message` - Add inbound messages
- `add_outbound_call` - Add call records
- `get_message_recording` - Get call recordings
- `get_message_transcription` - Get call transcriptions
- `download_transcription` - Download transcription files
- `cancel_scheduled_message` - Cancel scheduled SMS
- `cancel_scheduled_email` - Cancel scheduled emails
- `live_chat_typing` - Send typing indicators

**Email Tools:**
- `get_email_campaigns` - List email campaigns
- `create_email_template` - Create new templates
- `get_email_templates` - List email templates
- `update_email_template` - Update existing templates
- `delete_email_template` - Delete templates

## Deployment

### Standalone Server (stdio)
```bash
npm run build
npm start
```

### HTTP Server
```bash
npm run build  
npm run start:http
```

### Docker
```bash
docker build -t ghl-communications-mcp .
docker run -p 3000:3000 ghl-communications-mcp
```

### Cloud Deployment
Deploy to Fly.io, Railway, or any cloud platform using the included configuration files.

## Development

```bash
npm install
npm run dev
```

## Dependencies

- **@modelcontextprotocol/sdk**: ^1.12.1
- **axios**: ^1.9.0  
- **express**: ^5.1.0
- **cors**: ^2.8.5
- **typescript**: ^5.8.3

## Security

- API keys are validated on each request
- No credentials stored server-side
- Supports CORS for web deployment
- Error handling prevents credential leakage

## Error Handling

All tools return structured responses with:
- `success`: boolean indicating operation success
- `message`: human-readable description
- Additional data fields based on tool type

Failed operations throw MCP errors with appropriate error codes and descriptions. 