# 🏗️ GoHighLevel Modular MCP Architecture Guide

## 🎯 Overview: From Monolithic to Modular

**Current State**: 1 MCP server with 269 tools (overwhelming for AI agents)
**Target State**: 7 focused MCP servers with 20-70 tools each (optimal for AI)

---

## 📊 **7-Server Architecture Plan**

### **1. 🏢 Core CRM Server (40 tools)**
**Repository**: `ghl-core-mcp`
**Tools**: Essential daily operations
- `contact-tools.ts` (31 tools) - Contacts, tasks, notes, tags
- `custom-field-v2-tools.ts` (8 tools) - Custom field management
- `email-isv-tools.ts` (1 tool) - Email verification

**Use Cases**: 
- Contact management and lead tracking
- Task and note management
- Custom field operations
- Daily CRM activities

### **2. 💬 Communications Server (25 tools)**
**Repository**: `ghl-communications-mcp`
**Tools**: All messaging and communication
- `conversation-tools.ts` (20 tools) - SMS, calls, conversations
- `email-tools.ts` (5 tools) - Email campaigns and templates

**Use Cases**:
- Send SMS and emails
- Manage conversations and call recordings
- Email template management
- Communication automation

### **3. 💰 Sales & Revenue Server (69 tools)**
**Repository**: `ghl-sales-mcp`
**Tools**: Complete revenue operations
- `opportunity-tools.ts` (10 tools) - Sales pipeline management
- `payments-tools.ts` (20 tools) - Payment processing
- `invoices-tools.ts` (39 tools) - Billing and invoicing

**Use Cases**:
- Sales pipeline management
- Payment processing and subscriptions
- Invoice generation and billing
- Revenue tracking and reporting

### **4. 📱 Marketing Server (27 tools)**
**Repository**: `ghl-marketing-mcp`
**Tools**: Marketing automation and content
- `blog-tools.ts` (7 tools) - Blog content management
- `social-media-tools.ts` (17 tools) - Social media posting
- `media-tools.ts` (3 tools) - Media library management

**Use Cases**:
- Blog content creation and management
- Social media posting and scheduling
- Media asset management
- Content marketing automation

### **5. ⚙️ Operations Server (41 tools)**
**Repository**: `ghl-operations-mcp`
**Tools**: Business operations and workflows
- `calendar-tools.ts` (14 tools) - Appointment scheduling
- `workflow-tools.ts` (1 tool) - Automation workflows
- `survey-tools.ts` (2 tools) - Survey management
- `location-tools.ts` (24 tools) - Multi-location management

**Use Cases**:
- Appointment booking and calendar management
- Workflow automation
- Survey creation and analysis
- Multi-location business management

### **6. 🛒 E-commerce Server (28 tools)**
**Repository**: `ghl-ecommerce-mcp`
**Tools**: Online store and product management
- `store-tools.ts` (18 tools) - Store settings and shipping
- `products-tools.ts` (10 tools) - Product and inventory management

**Use Cases**:
- Product catalog management
- Inventory tracking
- Shipping zone configuration
- E-commerce store operations

### **7. 🗄️ Data & Objects Server (19 tools)**
**Repository**: `ghl-data-mcp`
**Tools**: Custom data structures and relationships
- `object-tools.ts` (9 tools) - Custom object schemas
- `association-tools.ts` (10 tools) - Data relationships

**Use Cases**:
- Custom object creation (pets, tickets, inventory)
- Data relationship mapping
- Advanced data structures
- Custom business data management

---

## 🛠️ **Implementation Steps**

### **Step 1: Create Shared Dependencies Package**

Create `ghl-mcp-shared` package for common code:

```bash
mkdir ghl-mcp-shared
cd ghl-mcp-shared
npm init -y
```

**Directory Structure**:
```
ghl-mcp-shared/
├── src/
│   ├── clients/
│   │   └── ghl-api-client.ts     # Shared API client
│   ├── types/
│   │   └── ghl-types.ts          # Shared type definitions
│   └── utils/
│       └── common.ts             # Shared utilities
├── package.json
└── tsconfig.json
```

**package.json**:
```json
{
  "name": "@ghl/mcp-shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "axios": "^1.9.0",
    "dotenv": "^16.5.0"
  }
}
```

### **Step 2: Create Individual MCP Servers**

For each server, create this structure:

```bash
# Example for Core CRM Server
mkdir ghl-core-mcp
cd ghl-core-mcp
npm init -y
```

**Directory Structure (each server)**:
```
ghl-core-mcp/
├── src/
│   ├── tools/
│   │   ├── contact-tools.ts
│   │   ├── custom-field-v2-tools.ts
│   │   └── email-isv-tools.ts
│   ├── server.ts                 # MCP server entry point
│   └── http-server.ts            # HTTP server for web
├── dist/                         # Built files
├── package.json
├── tsconfig.json
├── Dockerfile
├── fly.toml                      # Deployment config
└── README.md
```

**package.json (each server)**:
```json
{
  "name": "@ghl/core-mcp",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --exec ts-node src/server.ts",
    "start": "node dist/server.js",
    "start:http": "node dist/http-server.js"
  },
  "dependencies": {
    "@ghl/mcp-shared": "^1.0.0",
    "@modelcontextprotocol/sdk": "^1.12.1",
    "express": "^5.1.0"
  }
}
```

### **Step 3: Server Implementation Template**

**src/server.ts** (template for each server):
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GHLApiClient } from '@ghl/mcp-shared';
import { ContactTools } from './tools/contact-tools.js';
// Import other tools for this server

class CoreMCPServer {
  private server: Server;
  private ghlClient: GHLApiClient;
  private contactTools: ContactTools;

  constructor() {
    this.server = new Server(
      { name: 'ghl-core-mcp', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    
    this.ghlClient = new GHLApiClient();
    this.contactTools = new ContactTools(this.ghlClient);
    
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Register only the tools for this server
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [
        ...this.contactTools.getToolDefinitions(),
        // Add other tool definitions for this server
      ];
      
      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Route to appropriate tool handler
      if (this.isContactTool(name)) {
        return await this.contactTools.executeTool(name, args);
      }
      
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('GHL Core MCP Server running');
  }
}

// Start server
const server = new CoreMCPServer();
server.start().catch(console.error);
```

---

## 🔧 **Claude Desktop Configuration**

Update your `mcp_settings.json` to use all 7 servers:

```json
{
  "mcpServers": {
    "ghl-core": {
      "command": "node",
      "args": ["/path/to/ghl-core-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-communications": {
      "command": "node", 
      "args": ["/path/to/ghl-communications-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-sales": {
      "command": "node",
      "args": ["/path/to/ghl-sales-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com", 
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-marketing": {
      "command": "node",
      "args": ["/path/to/ghl-marketing-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-operations": {
      "command": "node",
      "args": ["/path/to/ghl-operations-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-ecommerce": {
      "command": "node",
      "args": ["/path/to/ghl-ecommerce-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    },
    "ghl-data": {
      "command": "node",
      "args": ["/path/to/ghl-data-mcp/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    }
  }
}
```

---

## 🚀 **Deployment Strategy**

### **Option 1: Individual Deployments**
Deploy each server separately on Fly.io:

```bash
# Deploy each server
cd ghl-core-mcp && fly deploy
cd ghl-communications-mcp && fly deploy
cd ghl-sales-mcp && fly deploy
# ... etc for all 7 servers
```

**Cost**: 7 × $3.88/month = ~$27/month for full suite

### **Option 2: Selective Deployment**
Deploy only the servers you need:

```bash
# Most common use case: Core + Communications + Sales
cd ghl-core-mcp && fly deploy          # $3.88/month
cd ghl-communications-mcp && fly deploy # $3.88/month  
cd ghl-sales-mcp && fly deploy         # $3.88/month
# Total: ~$12/month for essential functionality
```

### **Option 3: Multi-Server Single Instance**
Run multiple servers on one Fly.io instance using different ports:

**fly.toml**:
```toml
app = "ghl-mcp-suite"

[[services]]
  internal_port = 8001
  protocol = "tcp"
  [[services.ports]]
    handlers = ["http"]
    port = 80

[[services]]
  internal_port = 8002  
  protocol = "tcp"
  [[services.ports]]
    handlers = ["http"]
    port = 81
```

**Cost**: $7.76/month (1GB RAM instance for all servers)

---

## 🎯 **Benefits of Modular Architecture**

### **🚀 For AI Agents**
- **Faster tool discovery**: 20-70 tools vs 269 tools
- **Better context usage**: Focused tool sets
- **Improved decision making**: Less cognitive overhead
- **Specialized expertise**: Each server is domain-focused

### **👨‍💻 For Developers**
- **Easier maintenance**: Smaller, focused codebases
- **Independent deployments**: Update one server without affecting others
- **Better testing**: Focused test suites
- **Team specialization**: Different teams can own different servers

### **💰 For Cost Management**
- **Selective deployment**: Pay only for what you use
- **Resource optimization**: Right-size each server
- **Auto-hibernation**: Unused servers sleep automatically
- **Flexible scaling**: Scale servers independently

---

## 📋 **Migration Steps**

### **Phase 1: Setup (1-2 hours)**
1. Create shared package (`ghl-mcp-shared`)
2. Extract common code (API client, types)
3. Publish shared package

### **Phase 2: Split Servers (2-3 hours)**
1. Create 7 new repositories
2. Copy relevant tool files to each server
3. Update imports to use shared package
4. Test each server independently

### **Phase 3: Deploy (30 minutes)**
1. Deploy each server to Fly.io
2. Update Claude Desktop configuration
3. Test end-to-end functionality

### **Phase 4: Optimize (ongoing)**
1. Monitor usage patterns
2. Optimize resource allocation
3. Add server-specific features
4. Improve documentation

---

## 🎨 **Example: Core CRM Server**

Here's what the Core CRM server structure would look like:

**Tools Included**:
- ✅ Contact management (create, update, search, delete)
- ✅ Task management (create, assign, complete)  
- ✅ Note management (add, update, organize)
- ✅ Tag operations (add, remove, bulk operations)
- ✅ Custom field management
- ✅ Email verification

**AI Agent Benefits**:
- **Clear focus**: "I need to manage contacts and tasks"
- **Fast decisions**: Only 40 relevant tools to choose from
- **Better performance**: Smaller context, faster responses
- **Specialized knowledge**: Deep understanding of CRM operations

**Example AI Usage**:
```
"Search for contacts tagged 'VIP' who haven't been contacted in 30 days, 
create follow-up tasks for each, and add a note about the outreach campaign"
```

The AI agent knows exactly which server handles this (Core CRM) and can efficiently execute the workflow with focused tool selection.

---

## 🚀 **Ready to Split?**

This modular architecture will transform your GoHighLevel MCP integration from overwhelming to optimized. Each AI agent interaction becomes faster, more focused, and more effective.

**Next Steps**:
1. Choose your deployment strategy (individual vs selective vs multi-server)
2. Start with the Core CRM server (most commonly used)
3. Add additional servers based on your specific use cases
4. Monitor and optimize based on usage patterns

The future of AI-driven GoHighLevel automation is modular, focused, and incredibly powerful! 🎯 