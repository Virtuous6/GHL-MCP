# 🏢 GoHighLevel Core CRM MCP Server

Focused GoHighLevel MCP Server with **40 specialized tools** for contact management, custom fields, and email verification.

## 🎯 Focus Area

This MCP server provides AI agents with focused access to:
- **Contact Management** - Create, update, search, and manage contacts
- **Task & Note Management** - Handle contact tasks and notes  
- **Tag Operations** - Add, remove, and bulk manage contact tags
- **Custom Field Management** - Create and manage custom fields for objects
- **Email Verification** - Validate email addresses

## 📊 Tool Count: 40

**Optimal performance for AI agents** by limiting tool scope while maintaining full functionality for CRM operations.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run build
npm start
```

### Fly.io Deployment
```bash
fly launch
fly secrets set GHL_API_KEY=your_key GHL_LOCATION_ID=your_id
fly deploy
```

## 🔧 Configuration

Set these environment variables:
- `GHL_API_KEY` - Your GoHighLevel Private Integrations API key
- `GHL_BASE_URL` - GoHighLevel API base URL (default: https://services.leadconnectorhq.com)
- `GHL_LOCATION_ID` - Your GoHighLevel location ID

## 🎯 Use Cases

### Daily CRM Operations
```
"Find all VIP contacts who haven't been contacted in 30 days and create follow-up tasks"
```

### Lead Management
```
"Search for contacts tagged 'hot-lead' and add them to the 'Q1-followup' tag"
```

### Custom Field Operations
```
"Create a custom field for pet names in our veterinary practice CRM"
```

### Email Verification
```
"Verify the email addresses for all contacts added in the last 7 days"
```

## 🚀 Deployment Cost

**Fly.io**: $3.88/month (512MB RAM, shared CPU)
**Perfect for**: 1000+ API calls/day, multiple concurrent AI agents

This focused server provides optimal performance for AI agents working with GoHighLevel contact management! 