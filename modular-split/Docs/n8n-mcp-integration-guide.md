# 🔧 n8n + MCP Integration Guide

## 📋 Overview

This guide shows you how to integrate n8n with your GoHighLevel MCP servers using the SSE endpoints. Since your MCP servers are deployed with HTTP/SSE support, n8n can communicate with them using JSON-RPC over HTTP.

## 🚀 Quick Start

### **Step 1: Understand the Architecture**

Your MCP servers expose SSE endpoints that accept JSON-RPC requests:
- **Core Server**: `https://ghl-core-mcp.fly.dev/sse`
- **Communications**: `https://ghl-communications-mcp.fly.dev/sse`
- **Sales**: `https://ghl-sales-mcp.fly.dev/sse`
- **Marketing**: `https://ghl-marketing-mcp.fly.dev/sse`
- **Operations**: `https://ghl-operations-mcp.fly.dev/sse`
- **Ecommerce**: `https://ghl-ecommerce-mcp.fly.dev/sse`
- **Data**: `https://ghl-data-mcp.fly.dev/sse`

### **Step 2: Authentication Options**

You have two ways to provide credentials:

#### **Option A: In Request Body (Recommended)**
```json
{
  "arguments": {
    "apiKey": "pk_live_abc123...",
    "locationId": "loc_xyz789...",
    "query": "search term"
  }
}
```

#### **Option B: Via Headers**
```
X-GHL-API-Key: pk_live_abc123...
X-GHL-Location-ID: loc_xyz789...
```

## 📝 n8n Workflow Examples

### **1. Basic HTTP Request Node Setup**

Create an HTTP Request node with these settings:

```yaml
Node Type: HTTP Request
Method: POST
URL: https://ghl-core-mcp.fly.dev/sse
Headers:
  Content-Type: application/json
Body Type: JSON
Body:
  jsonrpc: "2.0"
  method: "tools/call"
  params:
    name: "search_contacts"
    arguments:
      apiKey: "{{ $credentials.ghl.apiKey }}"
      locationId: "{{ $credentials.ghl.locationId }}"
      query: "{{ $json.searchQuery }}"
  id: 1
```

### **2. Complete n8n Workflow Example**

Here's a full n8n workflow that searches contacts and processes results:

```json
{
  "name": "GoHighLevel MCP Contact Search",
  "nodes": [
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "searchQuery",
              "value": "VIP customers"
            }
          ]
        }
      },
      "name": "Set Search Parameters",
      "type": "n8n-nodes-base.set",
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "https://ghl-core-mcp.fly.dev/sse",
        "method": "POST",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "jsonrpc",
              "value": "2.0"
            },
            {
              "name": "method",
              "value": "tools/call"
            },
            {
              "name": "params.name",
              "value": "search_contacts"
            },
            {
              "name": "params.arguments.apiKey",
              "value": "={{ $credentials.ghl.apiKey }}"
            },
            {
              "name": "params.arguments.locationId",
              "value": "={{ $credentials.ghl.locationId }}"
            },
            {
              "name": "params.arguments.query",
              "value": "={{ $json.searchQuery }}"
            },
            {
              "name": "id",
              "value": "1"
            }
          ]
        }
      },
      "name": "Search Contacts MCP",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "// Extract contacts from MCP response\nconst mcpResponse = $input.first().json;\n\nif (mcpResponse.error) {\n  throw new Error(`MCP Error: ${mcpResponse.error.message}`);\n}\n\nconst contacts = mcpResponse.result?.contacts || [];\n\n// Process each contact\nreturn contacts.map(contact => ({\n  json: {\n    id: contact.id,\n    firstName: contact.firstName,\n    lastName: contact.lastName,\n    email: contact.email,\n    phone: contact.phone,\n    tags: contact.tags || [],\n    fullName: `${contact.firstName} ${contact.lastName}`.trim()\n  }\n}));"
      },
      "name": "Process MCP Response",
      "type": "n8n-nodes-base.code",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Set Search Parameters": {
      "main": [[{"node": "Search Contacts MCP", "type": "main", "index": 0}]]
    },
    "Search Contacts MCP": {
      "main": [[{"node": "Process MCP Response", "type": "main", "index": 0}]]
    }
  }
}
```

### **3. Using Headers for Authentication**

Alternative approach using headers:

```yaml
Node Type: HTTP Request
Method: POST
URL: https://ghl-core-mcp.fly.dev/sse
Headers:
  Content-Type: application/json
  X-GHL-API-Key: {{ $credentials.ghl.apiKey }}
  X-GHL-Location-ID: {{ $credentials.ghl.locationId }}
Body:
  jsonrpc: "2.0"
  method: "tools/call"
  params:
    name: "search_contacts"
    arguments:
      query: "VIP customers"
  id: 1
```

## 🛠️ Common MCP Operations

### **List Available Tools**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {},
  "id": 1
}
```

### **Create a Contact**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create_contact",
    "arguments": {
      "apiKey": "pk_live_...",
      "locationId": "loc_...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  },
  "id": 2
}
```

### **Update Contact Tags**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "add_contact_tags",
    "arguments": {
      "apiKey": "pk_live_...",
      "locationId": "loc_...",
      "contactId": "contact_123",
      "tags": ["vip", "premium"]
    }
  },
  "id": 3
}
```

## 🔄 Error Handling in n8n

Add an error handling node after your MCP calls:

```javascript
// Check for MCP errors
if ($json.error) {
  // Log the error
  console.error('MCP Error:', $json.error);
  
  // Handle specific error codes
  switch($json.error.code) {
    case -32602: // Invalid params
      throw new Error('Invalid parameters: ' + $json.error.message);
    case -32601: // Method not found
      throw new Error('Tool not found: ' + $json.error.message);
    default:
      throw new Error('MCP Error: ' + $json.error.message);
  }
}

// Continue with successful response
return [{
  json: $json.result
}];
```

## 🚀 Advanced Patterns

### **Batch Operations**
Use n8n's Split In Batches node to process multiple items:

```yaml
1. Split In Batches (batch size: 10)
2. For each batch:
   - Call MCP tool
   - Process results
3. Merge results
```

### **Parallel Processing**
Use multiple HTTP Request nodes in parallel:

```yaml
1. Start
2. Split into branches:
   - Branch A: Search contacts
   - Branch B: Get custom fields
   - Branch C: List tags
3. Merge results
4. Process combined data
```

### **Dynamic Tool Selection**
```javascript
// Dynamic tool selection based on input
const toolName = $json.operation === 'search' ? 'search_contacts' : 'create_contact';

return [{
  json: {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: toolName,
      arguments: {
        apiKey: $credentials.ghl.apiKey,
        locationId: $credentials.ghl.locationId,
        ...$json.params
      }
    },
    id: 1
  }
}];
```

## 🔐 Security Best Practices

1. **Store Credentials in n8n**
   - Create a credential type for GoHighLevel
   - Never hardcode API keys in workflows

2. **Validate Responses**
   - Always check for error responses
   - Validate data types before processing

3. **Rate Limiting**
   - Add delays between bulk operations
   - Monitor API usage

4. **Logging**
   - Log all MCP interactions
   - Track errors for debugging

## 📊 Monitoring & Debugging

### **Test MCP Connection**
```bash
curl -X POST https://ghl-core-mcp.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 1
  }'
```

### **Check Server Health**
```bash
curl https://ghl-core-mcp.fly.dev/health
```

### **Debug in n8n**
1. Enable full output in HTTP Request node
2. Use console.log in Code nodes
3. Check n8n execution logs

## 🎯 Use Cases

### **1. Contact Sync Workflow**
- Trigger: Webhook or schedule
- Search contacts in MCP
- Compare with external system
- Update or create as needed

### **2. Automated Tagging**
- Trigger: New contact created
- Analyze contact data
- Apply tags via MCP
- Send notification

### **3. Bulk Operations**
- Read CSV file
- For each row:
  - Create/update contact via MCP
  - Handle errors
- Generate report

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [JSON-RPC Specification](https://www.jsonrpc.org/specification)

## 🤝 Support

For issues or questions:
1. Check MCP server logs: `fly logs -a ghl-core-mcp`
2. Test with curl first
3. Enable n8n debug logging
4. Check server health endpoints 