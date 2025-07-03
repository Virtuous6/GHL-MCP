# MCP Request Structure & Setup Guide

This guide explains how to set up and make requests to the GoHighLevel MCP (Model Context Protocol) servers.

## 🏗️ MCP Architecture Overview

The MCP setup supports two deployment modes:
1. **Static Pre-configured** - Servers with fixed credentials
2. **Dynamic Multi-tenant** - Users provide credentials with each request

---

## 📋 Configuration Setup

### 🖥️ **Local Server Configuration** (For Local Development)

For servers running **locally** on your machine (`claude-desktop-config.json`):

```json
{
  "mcpServers": {
    "ghl-core": {
      "command": "node",
      "args": ["/path/to/modular-split/ghl-core-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-communications": {
      "command": "node",
      "args": ["/path/to/modular-split/ghl-communications-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-sales": {
      "command": "node",
      "args": ["/path/to/modular-split/ghl-sales-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-marketing": {
      "command": "node",
      "args": ["/path/to/modular-split/ghl-marketing-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-operations": {
      "command": "node",
      "args": ["/path/to/modular-split/ghl-operations-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-ecommerce": {
      "command": "node",
      "args": ["/path/to/modular-split/ghl-ecommerce-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-data": {
      "command": "node",
      "args": ["/path/to/modular-split/ghl-data-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    }
  }
}
```

---

## 🌐 **Deployed Server Configuration** (For Fly.io/Remote Servers)

For servers **deployed** to Fly.io or other remote platforms, you need to use **`mcp-remote`** to bridge stdio ↔ HTTP+SSE:

```json
{
  "mcpServers": {
    "ghl-core": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-dynamic-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-ecommerce": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-ecommerce-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-communications": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-communications-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-sales": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-sales-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-marketing": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-marketing-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-operations": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-operations-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    },
    "ghl-data": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-data-mcp.fly.dev/sse"],
      "env": {
        "GHL_API_KEY": "pk_live_your_api_key_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    }
  }
}
```

### 🔧 **How `mcp-remote` Works:**

1. **Claude Desktop** connects to `mcp-remote` via **stdio**
2. **`mcp-remote`** connects to your **remote server** via **HTTP+SSE**  
3. **Your credentials** stay in Claude Desktop config (secure)
4. **All requests** are proxied through the bridge

### 📋 **Configuration Notes:**

- **Package**: Use `mcp-remote` (not `@modelcontextprotocol/client-sse` which doesn't exist)
- **URL**: Point to your deployed server's `/sse` endpoint
- **Credentials**: Set in `env` section of Claude Desktop config
- **Auto-install**: `npx` will automatically install `mcp-remote` when needed

---

## 🔄 MCP Request Structure

### How MCP Works

MCP uses JSON-RPC 2.0 protocol for communication:

1. **Client** (Claude Desktop) sends requests to the **Server** (GHL MCP)
2. **Server** processes the request using the appropriate tool
3. **Server** returns structured response to the **Client**

### Request Flow

```
Claude Desktop → MCP Server → GoHighLevel API → Response → Claude Desktop
```

---

## 📨 Request Examples

### 1. Static Pre-configured Server Requests

For servers with pre-configured credentials, you only need to provide tool-specific parameters:

#### List Available Tools Request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

#### Tool Call Request - Search Contacts
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_contacts",
    "arguments": {
      "query": "VIP customer",
      "limit": 25
    }
  }
}
```

#### Tool Call Request - Create Contact
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "create_contact",
    "arguments": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "tags": ["VIP", "New Lead"]
    }
  }
}
```

### 2. Dynamic Multi-tenant Server Requests

For dynamic servers, you must provide credentials with each request:

#### Search Contacts (Dynamic)
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "search_contacts",
    "arguments": {
      "apiKey": "pk_live_abc123...",
      "locationId": "loc_xyz789...",
      "userId": "john-doe",
      "query": "VIP customer",
      "limit": 25
    }
  }
}
```

#### Create Contact (Dynamic)
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "create_contact",
    "arguments": {
      "apiKey": "pk_live_abc123...",
      "locationId": "loc_xyz789...",
      "userId": "john-doe",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1987654321"
    }
  }
}
```

---

## 📤 Response Structure

### Successful Response
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Successfully found 3 contacts matching 'VIP customer':\n\n1. John Doe (john.doe@example.com)\n   - Phone: +1234567890\n   - Tags: VIP, Customer\n   - ID: cont_abc123\n\n2. Jane Smith (jane.smith@example.com)\n   - Phone: +1987654321\n   - Tags: VIP, Premium\n   - ID: cont_def456\n\n3. Bob Johnson (bob.johnson@example.com)\n   - Phone: +1122334455\n   - Tags: VIP, Enterprise\n   - ID: cont_ghi789"
      }
    ]
  }
}
```

### Error Response
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "error": {
    "code": -32602,
    "message": "Invalid API key. Please check your GoHighLevel Private Integration API key and scopes."
  }
}
```

---

## 🛠️ Tool Definition Structure

Each tool is defined with a schema that specifies required and optional parameters:

```typescript
{
  name: 'create_contact',
  description: 'Create a new contact in GoHighLevel',
  inputSchema: {
    type: 'object',
    properties: {
      // For dynamic servers
      apiKey: {
        type: 'string',
        description: 'GoHighLevel Private Integration API key (pk_live_...)'
      },
      locationId: {
        type: 'string',
        description: 'GoHighLevel Location ID'
      },
      userId: {
        type: 'string',
        description: 'User identifier for tracking/logging (optional)'
      },
      // Tool-specific parameters
      firstName: {
        type: 'string',
        description: 'Contact first name'
      },
      lastName: {
        type: 'string',
        description: 'Contact last name'
      },
      email: {
        type: 'string',
        description: 'Contact email address'
      },
      phone: {
        type: 'string',
        description: 'Contact phone number'
      }
    },
    required: ['apiKey', 'locationId', 'firstName'] // Dynamic mode
    // required: ['firstName'] for static mode
  }
}
```

---

## 🔐 Authentication Flow

### Static Mode (Pre-configured)
```
1. Server starts with credentials from environment variables
2. Client makes tool call with only tool parameters
3. Server uses pre-configured credentials for GHL API
4. Response returned to client
```

### Dynamic Mode (Multi-tenant)
```
1. Server starts without pre-configured credentials
2. Client makes tool call with credentials + tool parameters
3. Server creates GHL API client with provided credentials
4. Server validates credentials and makes API call
5. Response returned to client
```

---

## 🌐 HTTP Server Requests

For deployed HTTP servers, you can make direct HTTP requests:

### HTTP Tool Call
```bash
curl -X POST https://your-server.fly.dev/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_contacts",
    "arguments": {
      "apiKey": "pk_live_abc123...",
      "locationId": "loc_xyz789...",
      "query": "VIP customer",
      "limit": 10
    }
  }'
```

### HTTP Response
```json
{
  "success": true,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 2 VIP customers: John Doe, Jane Smith"
      }
    ]
  }
}
```

---

## 📋 Usage Examples by Server

### Core Server (Contacts)
```javascript
// Search contacts
{
  "name": "search_contacts",
  "arguments": {
    "query": "email:john@example.com",
    "limit": 10
  }
}

// Create contact
{
  "name": "create_contact", 
  "arguments": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

### Communications Server (Messaging)
```javascript
// Send SMS
{
  "name": "send_sms",
  "arguments": {
    "contactId": "cont_abc123",
    "message": "Hello! Your appointment is tomorrow at 2pm."
  }
}

// Send email
{
  "name": "send_email",
  "arguments": {
    "contactId": "cont_abc123",
    "subject": "Welcome to our service",
    "message": "Thank you for signing up!"
  }
}
```

### Sales Server (Opportunities)
```javascript
// Create opportunity
{
  "name": "create_opportunity",
  "arguments": {
    "name": "Website Redesign Project",
    "contactId": "cont_abc123",
    "pipelineId": "pipe_xyz789",
    "monetaryValue": 5000
  }
}

// Search opportunities
{
  "name": "search_opportunities",
  "arguments": {
    "status": "open",
    "limit": 20
  }
}
```

### E-commerce Server (Products) ✅ DEPLOYED
```javascript
// Create product
{
  "name": "ghl_create_product",
  "arguments": {
    "apiKey": "pk_live_abc123...",
    "locationId": "loc_xyz789...", 
    "name": "Premium Web Design Package",
    "productType": "SERVICE",
    "description": "Complete website design and development",
    "availableInStore": true
  }
}

// List products
{
  "name": "ghl_list_products",
  "arguments": {
    "apiKey": "pk_live_abc123...",
    "locationId": "loc_xyz789...",
    "limit": 50,
    "search": "design"
  }
}

// Create shipping zone
{
  "name": "ghl_create_shipping_zone",
  "arguments": {
    "apiKey": "pk_live_abc123...",
    "locationId": "loc_xyz789...",
    "name": "US Domestic",
    "countries": [
      {
        "code": "US",
        "states": [
          {"code": "CA"},
          {"code": "NY"},
          {"code": "TX"}
        ]
      }
    ]
  }
}
```

---

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   cd modular-split/ghl-core-mcp
   npm install
   npm run build
   ```

2. **Configure Claude Desktop** with the JSON config above

3. **Test the connection**:
   ```
   Ask Claude: "Search for contacts in my GoHighLevel account"
   ```

4. **Use dynamic mode** by providing credentials:
   ```
   Ask Claude: "Using API key pk_live_... and location loc_..., create a contact named John Doe"
   ```

---

## 💡 Key Benefits

- **Modular**: Use only the servers you need
- **Scalable**: Deploy separately for better performance
- **Flexible**: Static or dynamic credential management
- **Secure**: Credentials can be environment-based or request-based
- **Cost-effective**: Pay only for deployed servers

This structure allows for sophisticated integration with GoHighLevel while maintaining clean separation of concerns and flexible deployment options. 