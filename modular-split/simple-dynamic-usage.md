# 🚀 Simple Dynamic Multi-Tenant Usage

## 🎯 **Perfect for Your Use Case**

Single server deployment, users provide credentials with each call. No pre-configuration needed!

## 📋 **User Onboarding Flow**

### **Step 1: User Gets GoHighLevel Credentials**
1. User creates Private Integration in GoHighLevel
2. User gets: `pk_live_abc123...` (API key) + `loc_xyz789...` (Location ID)  
3. User can immediately start using the MCP server

### **Step 2: Tool Usage**
Every tool call includes credentials:
```json
{
  "name": "search_contacts",
  "arguments": {
    "apiKey": "pk_live_abc123...",
    "locationId": "loc_xyz789...", 
    "userId": "john-doe",
    "query": "VIP customers"
  }
}
```

## 🔧 **Claude Desktop Configuration**

**Single server for all users:**
```json
{
  "mcpServers": {
    "ghl-dynamic": {
      "command": "node",
      "args": ["/path/to/ghl-core-mcp/dist/dynamic-server.js"]
    }
  }
}
```

**No environment variables needed!** ✅

## 💬 **Usage Examples**

### **Account A Usage**
```
User: "Search for VIP customers in my John Doe account"

Claude: I'll search contacts using your credentials...

Tool Call:
{
  "name": "search_contacts",
  "arguments": {
    "apiKey": "pk_live_john123...",
    "locationId": "loc_john789...",
    "userId": "john-doe", 
    "query": "VIP"
  }
}
```

### **Account B Usage**
```
User: "Create a contact in my Acme Corp account"

Claude: I'll create a contact using your Acme Corp credentials...

Tool Call:
{
  "name": "create_contact",
  "arguments": {
    "apiKey": "pk_live_acme456...",
    "locationId": "loc_acme123...",
    "userId": "acme-corp",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  }
}
```

## 🔒 **Security Benefits**

### **✅ Dynamic Authentication**
- No stored credentials in server
- Users provide their own API keys
- Each request authenticated independently

### **✅ User Isolation**
- Users can only access their own data
- No risk of cross-user data leakage
- API keys never logged or stored

### **✅ Audit Trail**
- Optional `userId` for tracking
- Request logging for debugging
- Clear attribution per request

## 💰 **Cost: $3.88/month Total**

**Single Fly.io deployment serves unlimited users!**

```
Cost Breakdown:
- Server: $3.88/month (Fly.io shared-cpu-2x)  
- Users: Unlimited
- Per-user cost: ~$0
```

## 🚀 **Deployment**

### **Deploy the Dynamic Server**
```bash
cd ghl-core-mcp

# Replace server.ts with dynamic version
cp src/dynamic-server.ts src/server.ts

# Deploy to Fly.io
fly launch --generate-name
fly deploy
```

### **Test with Multiple Accounts**
```bash
# Test Account A
curl -X POST https://your-app.fly.dev/tools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_contacts",
    "arguments": {
      "apiKey": "pk_live_account_a...",
      "locationId": "loc_account_a...",
      "query": "test"
    }
  }'

# Test Account B  
curl -X POST https://your-app.fly.dev/tools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_contacts", 
    "arguments": {
      "apiKey": "pk_live_account_b...",
      "locationId": "loc_account_b...",
      "query": "test"
    }
  }'
```

## 🎯 **Benefits for Your Use Case**

### **✅ Zero Configuration**
- No user setup required
- No environment variables to manage
- Users just provide credentials per call

### **✅ Perfect for Multiple Accounts**
- Switch between accounts seamlessly
- Each call can use different credentials
- No server restarts needed

### **✅ Simple Integration**
- Single server deployment
- Users get immediate access
- No complex user management

### **✅ Cost Effective**
- $3.88/month regardless of user count
- No per-user deployment costs
- Maximum cost efficiency

## 📝 **Example User Instructions**

**For your users:**

```markdown
# Using the GoHighLevel MCP Server

## Setup (One-time)
1. Get your Private Integration API key from GoHighLevel
2. Get your Location ID from Settings → Company → Locations

## Usage
Include these in every tool call:
- `apiKey`: Your Private Integration API key (pk_live_...)
- `locationId`: Your Location ID (loc_...)
- `userId`: Your identifier (optional, for tracking)

## Example
"Search for contacts tagged 'VIP' using my API key pk_live_abc123 and location loc_xyz789"
```

## 🎉 **Perfect Solution**

This gives you:
- ✅ **One deployment** for all users
- ✅ **Dynamic credentials** per request  
- ✅ **Zero configuration** required
- ✅ **Maximum security** (no stored credentials)
- ✅ **$3.88/month total cost**
- ✅ **Unlimited users**

**This is exactly what you need for your multiple account use case!** 🚀 