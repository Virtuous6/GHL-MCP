# 🔌 Application Integration Guide

## Overview

Your MCP servers expose HTTP endpoints that accept JSON-RPC requests, making them accessible from any application that can make HTTP calls. This document explains how applications communicate with your MCP servers using standard HTTP protocols.

## 🏗️ Architecture

Your MCP servers have two main components:

1. **`server.ts`** - The standard MCP server (uses stdio transport, meant for direct MCP protocol communication)
2. **`http-server.ts`** - The HTTP wrapper that exposes MCP functionality via HTTP endpoints

## 🌐 Available Endpoints

Your deployed MCP servers expose the following endpoints:

```javascript
const endpoints = {
  core: 'https://ghl-core-mcp.fly.dev/sse',
  communications: 'https://ghl-communications-mcp.fly.dev/sse',
  sales: 'https://ghl-sales-mcp.fly.dev/sse',
  marketing: 'https://ghl-marketing-mcp.fly.dev/sse',
  operations: 'https://ghl-operations-mcp.fly.dev/sse',
  ecommerce: 'https://ghl-ecommerce-mcp.fly.dev/sse',
  data: 'https://ghl-data-mcp.fly.dev/sse'
};
```

### Endpoint Types

Each server exposes these endpoints:

- **`/health`** - Health check endpoint
- **`/sse`** - Main JSON-RPC endpoint for tool calls
- **`/tools`** - Lists available tools
- **`/`** - Service information

## 📋 JSON-RPC Request Format

All requests use the JSON-RPC 2.0 format:

### List Available Tools

```javascript
const listToolsRequest = {
  jsonrpc: "2.0",
  method: "tools/list",
  params: {},
  id: 1
};
```

### Call a Specific Tool

```javascript
const callToolRequest = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "search_contacts",
    arguments: {
      apiKey: "pk_live_your_api_key",
      locationId: "loc_your_location_id",
      query: "VIP customers",
      limit: 10
    }
  },
  id: 2
};
```

## 🔐 Authentication Options

You can provide credentials in two ways:

### Option A: In Request Body (Recommended)

```javascript
const response = await fetch('https://ghl-core-mcp.fly.dev/sse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "create_contact",
      arguments: {
        apiKey: "pk_live_your_api_key",
        locationId: "loc_your_location_id",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com"
      }
    },
    id: 3
  })
});
```

### Option B: Via HTTP Headers

```javascript
const response = await fetch('https://ghl-core-mcp.fly.dev/sse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-GHL-API-Key': 'pk_live_your_api_key',
    'X-GHL-Location-ID': 'loc_your_location_id'
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "search_contacts",
      arguments: {
        query: "VIP customers"
      }
    },
    id: 4
  })
});
```

## 🛠️ Real-World Integration Examples

### Node.js/JavaScript Application

```javascript
class GoHighLevelMCPClient {
  constructor(apiKey, locationId) {
    this.apiKey = apiKey;
    this.locationId = locationId;
    this.baseUrl = 'https://ghl-core-mcp.fly.dev/sse';
  }

  async callTool(toolName, args) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: toolName,
          arguments: {
            apiKey: this.apiKey,
            locationId: this.locationId,
            ...args
          }
        },
        id: Date.now()
      })
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`MCP Error: ${result.error.message}`);
    }
    
    return result.result;
  }

  async searchContacts(query, limit = 10) {
    return this.callTool('search_contacts', { query, limit });
  }

  async createContact(contactData) {
    return this.callTool('create_contact', contactData);
  }
}

// Usage Example
const client = new GoHighLevelMCPClient('pk_live_...', 'loc_...');
const contacts = await client.searchContacts('VIP');
```

### Python Application

```python
import requests
import json

class GoHighLevelMCPClient:
    def __init__(self, api_key, location_id):
        self.api_key = api_key
        self.location_id = location_id
        self.base_url = 'https://ghl-core-mcp.fly.dev/sse'
    
    def call_tool(self, tool_name, **kwargs):
        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": {
                    "apiKey": self.api_key,
                    "locationId": self.location_id,
                    **kwargs
                }
            },
            "id": 1
        }
        
        response = requests.post(
            self.base_url,
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload)
        )
        
        result = response.json()
        if 'error' in result:
            raise Exception(f"MCP Error: {result['error']['message']}")
        
        return result['result']

# Usage Example
client = GoHighLevelMCPClient('pk_live_...', 'loc_...')
contacts = client.call_tool('search_contacts', query='VIP', limit=10)
```

### n8n Automation Platform

```javascript
// n8n HTTP Request node configuration
{
  method: "POST",
  url: "https://ghl-core-mcp.fly.dev/sse",
  headers: {
    "Content-Type": "application/json"
  },
  body: {
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_contacts",
      "arguments": {
        "apiKey": "{{$credentials.ghl.apiKey}}",
        "locationId": "{{$credentials.ghl.locationId}}",
        "query": "{{$json.searchQuery}}"
      }
    },
    "id": 1
  }
}
```

## ⚠️ Error Handling

MCP servers return structured errors in JSON-RPC format:

```javascript
// Error response format
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,  // Invalid params
    "message": "apiKey is required"
  },
  "id": 1
}
```

### Common Error Codes

- **-32700**: Parse error
- **-32600**: Invalid request
- **-32601**: Method not found
- **-32602**: Invalid params
- **-32603**: Internal error

## 🧪 Testing Your Integration

### Using curl

```bash
# List available tools
curl -X POST https://ghl-core-mcp.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 1
  }'

# Call a tool
curl -X POST https://ghl-core-mcp.fly.dev/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_contacts",
      "arguments": {
        "apiKey": "pk_live_your_api_key",
        "locationId": "loc_your_location_id",
        "query": "test"
      }
    },
    "id": 2
  }'
```

### Using Postman

1. Set method to **POST**
2. URL: `https://ghl-core-mcp.fly.dev/sse`
3. Headers: `Content-Type: application/json`
4. Body: Raw JSON with JSON-RPC request

## 🚀 Benefits of HTTP/JSON-RPC Approach

1. **Language Agnostic**: Any language that can make HTTP requests can use your MCP servers
2. **Easy Integration**: Standard HTTP/JSON makes it simple to integrate with existing applications
3. **Scalable**: HTTP servers can handle multiple concurrent requests
4. **Debuggable**: Easy to test with tools like curl, Postman, or browser dev tools
5. **Standardized**: JSON-RPC is a well-established protocol with clear specifications

## 🔄 Multi-Server Integration

When working with multiple MCP servers, you can:

### Route by Functionality

```javascript
class GoHighLevelMCPSuite {
  constructor(apiKey, locationId) {
    this.credentials = { apiKey, locationId };
    this.servers = {
      core: 'https://ghl-core-mcp.fly.dev/sse',
      communications: 'https://ghl-communications-mcp.fly.dev/sse',
      sales: 'https://ghl-sales-mcp.fly.dev/sse',
      marketing: 'https://ghl-marketing-mcp.fly.dev/sse',
      operations: 'https://ghl-operations-mcp.fly.dev/sse',
      ecommerce: 'https://ghl-ecommerce-mcp.fly.dev/sse',
      data: 'https://ghl-data-mcp.fly.dev/sse'
    };
  }

  async callTool(server, toolName, args) {
    const response = await fetch(this.servers[server], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: toolName,
          arguments: { ...this.credentials, ...args }
        },
        id: Date.now()
      })
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);
    return result.result;
  }

  // Convenience methods
  async searchContacts(query) {
    return this.callTool('core', 'search_contacts', { query });
  }

  async createOpportunity(data) {
    return this.callTool('sales', 'create_opportunity', data);
  }

  async sendEmail(data) {
    return this.callTool('communications', 'send_email', data);
  }
}
```

## 📚 Next Steps

1. **Read the n8n Integration Guide** for detailed automation examples
2. **Check the N8N Flows folder** for ready-to-use workflow templates
3. **Review individual server documentation** for specific tool capabilities
4. **Test with your GoHighLevel credentials** using the examples above

Your MCP servers are essentially API gateways that translate HTTP requests into GoHighLevel API calls, providing a standardized interface for any application to interact with GoHighLevel's services. 