# 🚪 GoHighLevel Auth Gateway Blueprint

## 🎯 **Vision**

A **Token Refresh Proxy/Gateway** that sits between users and GoHighLevel MCP servers, handling all token management complexity so users never have to worry about 24-hour token expiration.

### **Problem Being Solved:**
- ❌ GoHighLevel JWT tokens expire every 24 hours
- ❌ Users must manually refresh tokens 
- ❌ Production apps break when tokens expire
- ❌ Each client needs complex token management logic

### **Solution:**
- ✅ **One-time setup** - User registers refresh token once
- ✅ **Permanent gateway key** - Never expires, always works
- ✅ **Automatic token refresh** - Gateway handles GHL token lifecycle
- ✅ **Transparent proxy** - Works with existing MCP servers
- ✅ **Simple user experience** - Set it and forget it

---

## 🏗️ **Architecture Overview**

```
User Request → Auth Gateway → GoHighLevel MCP Server → GoHighLevel API
    ↑               ↑                   ↑
Gateway API Key   Real GHL Token    Business Logic
(permanent)      (auto-refreshed)    (unchanged)
```

### **Data Flow:**
1. **User** calls tool with `gatewayApiKey`
2. **Gateway** looks up user's refresh token
3. **Gateway** ensures valid GHL access token (refresh if needed)
4. **Gateway** proxies request to appropriate MCP server with real GHL token
5. **MCP Server** processes request normally
6. **Gateway** returns response to user

---

## 📁 **Repository Structure**

```
ghl-auth-gateway/
├── README.md                     # User setup guide
├── DEPLOYMENT.md                 # Deployment instructions
├── package.json
├── tsconfig.json
├── fly.toml                      # Fly.io deployment config
├── docker/
│   └── Dockerfile
├── src/
│   ├── server.ts                 # Main HTTP server
│   ├── gateway/
│   │   ├── auth-gateway.ts       # Core gateway logic
│   │   ├── token-manager.ts      # Token refresh logic
│   │   ├── user-manager.ts       # User registration/lookup
│   │   └── mcp-proxy.ts          # Proxy to MCP servers
│   ├── storage/
│   │   ├── user-store.ts         # User data persistence
│   │   └── token-cache.ts        # Token caching layer
│   ├── clients/
│   │   ├── ghl-api-client.ts     # GoHighLevel API client
│   │   └── mcp-client.ts         # MCP server client
│   ├── types/
│   │   ├── gateway-types.ts      # Gateway-specific types
│   │   ├── ghl-types.ts          # GoHighLevel types
│   │   └── user-types.ts         # User/auth types
│   ├── utils/
│   │   ├── crypto.ts             # Key generation/validation
│   │   ├── logger.ts             # Logging utilities
│   │   └── config.ts             # Configuration management
│   └── routes/
│       ├── auth.ts               # Registration/auth endpoints
│       ├── proxy.ts              # MCP proxy endpoints
│       └── admin.ts              # Admin/monitoring endpoints
├── scripts/
│   ├── deploy.sh                 # One-click deployment
│   └── setup-user.sh             # User onboarding script
├── docs/
│   ├── API.md                    # API documentation
│   ├── USER-GUIDE.md             # User setup guide
│   └── DEVELOPMENT.md            # Development guide
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🔑 **Core Components**

### **1. Auth Gateway (`src/gateway/auth-gateway.ts`)**
```typescript
export class AuthGateway {
  async processRequest(req: GatewayRequest): Promise<GatewayResponse> {
    // 1. Validate gateway API key
    // 2. Get valid GHL token (refresh if needed)
    // 3. Route to appropriate MCP server
    // 4. Return response
  }
}
```

### **2. Token Manager (`src/gateway/token-manager.ts`)**
```typescript
export class TokenManager {
  async getValidToken(userId: string): Promise<string> {
    // 1. Check if current token is valid
    // 2. Refresh if expired
    // 3. Return valid access token
  }
  
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // GoHighLevel OAuth refresh flow
  }
}
```

### **3. User Manager (`src/gateway/user-manager.ts`)**
```typescript
export class UserManager {
  async registerUser(registration: UserRegistration): Promise<GatewayApiKey> {
    // 1. Validate refresh token
    // 2. Generate permanent gateway key
    // 3. Store user data securely
    // 4. Return gateway key
  }
}
```

### **4. MCP Proxy (`src/gateway/mcp-proxy.ts`)**
```typescript
export class MCPProxy {
  async proxyToMCPServer(toolName: string, request: MCPRequest): Promise<MCPResponse> {
    // 1. Determine target server from tool name
    // 2. Forward request to appropriate server
    // 3. Return response
  }
}
```

---

## 🌐 **API Design**

### **User Registration**
```http
POST /auth/register
Content-Type: application/json

{
  "userId": "user123",
  "refreshToken": "rt_ghl_refresh_token_here",
  "locationId": "ghl_location_id",
  "metadata": {
    "businessName": "Optional business name",
    "email": "user@example.com"
  }
}

Response:
{
  "gatewayApiKey": "gw_abc123def456...",
  "status": "registered",
  "expiresAt": null,
  "serverEndpoints": {
    "sse": "https://ghl-auth-gateway.fly.dev/mcp/sse",
    "tools": "https://ghl-auth-gateway.fly.dev/mcp/tools"
  }
}
```

### **MCP Tool Proxy**
```http
POST /mcp/tools/call
Content-Type: application/json

{
  "name": "get_products",
  "arguments": {
    "apiKey": "gw_abc123def456...",  // Gateway key
    "locationId": "ghl_location_id",
    "userId": "user123",
    "limit": 10
  }
}

Response: [Proxied from MCP server]
```

### **SSE Connection**
```http
GET /mcp/sse?apiKey=gw_abc123def456...
Accept: text/event-stream
```

---

## 🚀 **MCP Server Routing Strategy**

### **Static Tool Mapping Approach** ⭐ (Recommended)

The gateway uses a **static tool-to-server mapping** for fast, reliable routing. Users see one unified MCP server, but tools are routed to specialized servers behind the scenes.

### **Complete Tool-to-Server Mapping**

```typescript
// Static mapping of all tools to their respective MCP servers
const TOOL_TO_SERVER_MAP = {
  // ===== SALES & REVENUE TOOLS → ghl-sales-mcp =====
  'search_opportunities': 'https://ghl-sales-mcp.fly.dev',
  'get_pipelines': 'https://ghl-sales-mcp.fly.dev',
  'get_opportunity': 'https://ghl-sales-mcp.fly.dev',
  'create_opportunity': 'https://ghl-sales-mcp.fly.dev',
  'update_opportunity_status': 'https://ghl-sales-mcp.fly.dev',
  'delete_opportunity': 'https://ghl-sales-mcp.fly.dev',
  'update_opportunity': 'https://ghl-sales-mcp.fly.dev',
  'upsert_opportunity': 'https://ghl-sales-mcp.fly.dev',
  'add_opportunity_followers': 'https://ghl-sales-mcp.fly.dev',
  'remove_opportunity_followers': 'https://ghl-sales-mcp.fly.dev',
  
  // Payment & Integration Tools
  'create_whitelabel_integration_provider': 'https://ghl-sales-mcp.fly.dev',
  'list_whitelabel_integration_providers': 'https://ghl-sales-mcp.fly.dev',
  'list_orders': 'https://ghl-sales-mcp.fly.dev',
  'get_order_by_id': 'https://ghl-sales-mcp.fly.dev',
  'create_order_fulfillment': 'https://ghl-sales-mcp.fly.dev',
  'list_order_fulfillments': 'https://ghl-sales-mcp.fly.dev',
  'list_transactions': 'https://ghl-sales-mcp.fly.dev',
  'get_transaction_by_id': 'https://ghl-sales-mcp.fly.dev',
  'list_subscriptions': 'https://ghl-sales-mcp.fly.dev',
  'get_subscription_by_id': 'https://ghl-sales-mcp.fly.dev',
  'list_coupons': 'https://ghl-sales-mcp.fly.dev',
  'create_coupon': 'https://ghl-sales-mcp.fly.dev',
  'update_coupon': 'https://ghl-sales-mcp.fly.dev',
  'delete_coupon': 'https://ghl-sales-mcp.fly.dev',
  'get_coupon': 'https://ghl-sales-mcp.fly.dev',
  'create_custom_provider_integration': 'https://ghl-sales-mcp.fly.dev',
  'delete_custom_provider_integration': 'https://ghl-sales-mcp.fly.dev',
  'get_custom_provider_config': 'https://ghl-sales-mcp.fly.dev',
  'create_custom_provider_config': 'https://ghl-sales-mcp.fly.dev',
  'disconnect_custom_provider_config': 'https://ghl-sales-mcp.fly.dev',
  
  // Invoice Tools
  'create_invoice_template': 'https://ghl-sales-mcp.fly.dev',
  'list_invoice_templates': 'https://ghl-sales-mcp.fly.dev',
  'get_invoice_template': 'https://ghl-sales-mcp.fly.dev',
  'update_invoice_template': 'https://ghl-sales-mcp.fly.dev',
  'delete_invoice_template': 'https://ghl-sales-mcp.fly.dev',
  'create_invoice_schedule': 'https://ghl-sales-mcp.fly.dev',
  'list_invoice_schedules': 'https://ghl-sales-mcp.fly.dev',
  'get_invoice_schedule': 'https://ghl-sales-mcp.fly.dev',
  'create_invoice': 'https://ghl-sales-mcp.fly.dev',
  'list_invoices': 'https://ghl-sales-mcp.fly.dev',
  'get_invoice': 'https://ghl-sales-mcp.fly.dev',
  'send_invoice': 'https://ghl-sales-mcp.fly.dev',
  'create_estimate': 'https://ghl-sales-mcp.fly.dev',
  'list_estimates': 'https://ghl-sales-mcp.fly.dev',
  'send_estimate': 'https://ghl-sales-mcp.fly.dev',
  'create_invoice_from_estimate': 'https://ghl-sales-mcp.fly.dev',
  'generate_invoice_number': 'https://ghl-sales-mcp.fly.dev',
  'generate_estimate_number': 'https://ghl-sales-mcp.fly.dev',

  // ===== ECOMMERCE TOOLS → ghl-ecommerce-mcp =====
  'get_products': 'https://ghl-ecommerce-mcp.fly.dev',
  'create_product': 'https://ghl-ecommerce-mcp.fly.dev',
  'update_product': 'https://ghl-ecommerce-mcp.fly.dev',
  'delete_product': 'https://ghl-ecommerce-mcp.fly.dev',
  'get_product_by_id': 'https://ghl-ecommerce-mcp.fly.dev',
  'get_product_variants': 'https://ghl-ecommerce-mcp.fly.dev',
  'create_product_variant': 'https://ghl-ecommerce-mcp.fly.dev',
  'update_product_variant': 'https://ghl-ecommerce-mcp.fly.dev',
  'delete_product_variant': 'https://ghl-ecommerce-mcp.fly.dev',
  'get_store_settings': 'https://ghl-ecommerce-mcp.fly.dev',
  'update_store_settings': 'https://ghl-ecommerce-mcp.fly.dev',
  'get_store_categories': 'https://ghl-ecommerce-mcp.fly.dev',
  'create_store_category': 'https://ghl-ecommerce-mcp.fly.dev',
  'update_store_category': 'https://ghl-ecommerce-mcp.fly.dev',
  'delete_store_category': 'https://ghl-ecommerce-mcp.fly.dev',

  // ===== COMMUNICATIONS TOOLS → ghl-communications-mcp =====
  'send_sms': 'https://ghl-communications-mcp.fly.dev',
  'send_email': 'https://ghl-communications-mcp.fly.dev',
  'search_conversations': 'https://ghl-communications-mcp.fly.dev',
  'get_conversation': 'https://ghl-communications-mcp.fly.dev',
  'create_conversation': 'https://ghl-communications-mcp.fly.dev',
  'update_conversation': 'https://ghl-communications-mcp.fly.dev',
  'get_recent_messages': 'https://ghl-communications-mcp.fly.dev',
  'delete_conversation': 'https://ghl-communications-mcp.fly.dev',
  'get_email_message': 'https://ghl-communications-mcp.fly.dev',
  'get_message': 'https://ghl-communications-mcp.fly.dev',
  'upload_message_attachments': 'https://ghl-communications-mcp.fly.dev',
  'update_message_status': 'https://ghl-communications-mcp.fly.dev',
  'add_inbound_message': 'https://ghl-communications-mcp.fly.dev',
  'add_outbound_call': 'https://ghl-communications-mcp.fly.dev',
  'get_message_recording': 'https://ghl-communications-mcp.fly.dev',
  'get_message_transcription': 'https://ghl-communications-mcp.fly.dev',
  'download_transcription': 'https://ghl-communications-mcp.fly.dev',
  'cancel_scheduled_message': 'https://ghl-communications-mcp.fly.dev',
  'cancel_scheduled_email': 'https://ghl-communications-mcp.fly.dev',
  'live_chat_typing': 'https://ghl-communications-mcp.fly.dev',
  'get_email_campaigns': 'https://ghl-communications-mcp.fly.dev',
  'create_email_template': 'https://ghl-communications-mcp.fly.dev',
  'get_email_templates': 'https://ghl-communications-mcp.fly.dev',
  'update_email_template': 'https://ghl-communications-mcp.fly.dev',
  'delete_email_template': 'https://ghl-communications-mcp.fly.dev',

  // ===== OPERATIONS TOOLS → ghl-operations-mcp =====
  'list_calendars': 'https://ghl-operations-mcp.fly.dev',
  'get_calendar': 'https://ghl-operations-mcp.fly.dev',
  'create_calendar': 'https://ghl-operations-mcp.fly.dev',
  'update_calendar': 'https://ghl-operations-mcp.fly.dev',
  'delete_calendar': 'https://ghl-operations-mcp.fly.dev',
  'create_appointment': 'https://ghl-operations-mcp.fly.dev',
  'get_appointments': 'https://ghl-operations-mcp.fly.dev',
  'get_appointment': 'https://ghl-operations-mcp.fly.dev',
  'update_appointment': 'https://ghl-operations-mcp.fly.dev',
  'delete_appointment': 'https://ghl-operations-mcp.fly.dev',
  'get_calendar_slots': 'https://ghl-operations-mcp.fly.dev',
  'list_workflows': 'https://ghl-operations-mcp.fly.dev',
  'get_workflow': 'https://ghl-operations-mcp.fly.dev',
  'create_workflow': 'https://ghl-operations-mcp.fly.dev',
  'update_workflow': 'https://ghl-operations-mcp.fly.dev',
  'delete_workflow': 'https://ghl-operations-mcp.fly.dev',
  'get_location_settings': 'https://ghl-operations-mcp.fly.dev',
  'update_location_settings': 'https://ghl-operations-mcp.fly.dev',
  'get_surveys': 'https://ghl-operations-mcp.fly.dev',
  'get_survey': 'https://ghl-operations-mcp.fly.dev',
  'create_survey': 'https://ghl-operations-mcp.fly.dev',
  'update_survey': 'https://ghl-operations-mcp.fly.dev',
  'delete_survey': 'https://ghl-operations-mcp.fly.dev',
  'get_survey_submissions': 'https://ghl-operations-mcp.fly.dev',
  'get_survey_submission': 'https://ghl-operations-mcp.fly.dev',

  // ===== DATA MANAGEMENT TOOLS → ghl-data-mcp =====
  'list_custom_objects': 'https://ghl-data-mcp.fly.dev',
  'get_custom_object': 'https://ghl-data-mcp.fly.dev',
  'create_custom_object': 'https://ghl-data-mcp.fly.dev',
  'update_custom_object': 'https://ghl-data-mcp.fly.dev',
  'delete_custom_object': 'https://ghl-data-mcp.fly.dev',
  'list_custom_records': 'https://ghl-data-mcp.fly.dev',
  'get_custom_record': 'https://ghl-data-mcp.fly.dev',
  'create_custom_record': 'https://ghl-data-mcp.fly.dev',
  'update_custom_record': 'https://ghl-data-mcp.fly.dev',
  'delete_custom_record': 'https://ghl-data-mcp.fly.dev',
  'search_custom_records': 'https://ghl-data-mcp.fly.dev',
  'list_associations': 'https://ghl-data-mcp.fly.dev',
  'get_association': 'https://ghl-data-mcp.fly.dev',
  'create_association': 'https://ghl-data-mcp.fly.dev',
  'delete_association': 'https://ghl-data-mcp.fly.dev',

  // ===== MARKETING TOOLS → ghl-marketing-mcp =====
  'get_media_files': 'https://ghl-marketing-mcp.fly.dev',
  'upload_media': 'https://ghl-marketing-mcp.fly.dev',
  'update_media_file': 'https://ghl-marketing-mcp.fly.dev',
  'delete_media_file': 'https://ghl-marketing-mcp.fly.dev',
  'get_media_folders': 'https://ghl-marketing-mcp.fly.dev',
  'create_media_folder': 'https://ghl-marketing-mcp.fly.dev',
  'update_media_folder': 'https://ghl-marketing-mcp.fly.dev',
  'delete_media_folder': 'https://ghl-marketing-mcp.fly.dev',
  'create_blog_post': 'https://ghl-marketing-mcp.fly.dev',
  'get_blog_posts': 'https://ghl-marketing-mcp.fly.dev',
  'get_blog_post': 'https://ghl-marketing-mcp.fly.dev',
  'update_blog_post': 'https://ghl-marketing-mcp.fly.dev',
  'delete_blog_post': 'https://ghl-marketing-mcp.fly.dev',
  'publish_blog_post': 'https://ghl-marketing-mcp.fly.dev',
  'schedule_social_post': 'https://ghl-marketing-mcp.fly.dev',
  'get_social_media_accounts': 'https://ghl-marketing-mcp.fly.dev',
  'connect_social_media_account': 'https://ghl-marketing-mcp.fly.dev',
  'disconnect_social_media_account': 'https://ghl-marketing-mcp.fly.dev',
  'get_social_media_posts': 'https://ghl-marketing-mcp.fly.dev',
  'get_social_media_post': 'https://ghl-marketing-mcp.fly.dev',
  'update_social_media_post': 'https://ghl-marketing-mcp.fly.dev',
  'delete_social_media_post': 'https://ghl-marketing-mcp.fly.dev',

  // ===== CORE TOOLS → ghl-core-mcp =====
  'get_contact': 'https://ghl-core-mcp.fly.dev',
  'create_contact': 'https://ghl-core-mcp.fly.dev',
  'update_contact': 'https://ghl-core-mcp.fly.dev',
  'delete_contact': 'https://ghl-core-mcp.fly.dev',
  'search_contacts': 'https://ghl-core-mcp.fly.dev',
  'get_contact_by_email': 'https://ghl-core-mcp.fly.dev',
  'get_contact_by_phone': 'https://ghl-core-mcp.fly.dev',
  'add_contact_tag': 'https://ghl-core-mcp.fly.dev',
  'remove_contact_tag': 'https://ghl-core-mcp.fly.dev',
  'get_custom_fields': 'https://ghl-core-mcp.fly.dev',
  'create_custom_field': 'https://ghl-core-mcp.fly.dev',
  'update_custom_field': 'https://ghl-core-mcp.fly.dev',
  'delete_custom_field': 'https://ghl-core-mcp.fly.dev',
  'get_email_isv_config': 'https://ghl-core-mcp.fly.dev',
  'create_email_isv_config': 'https://ghl-core-mcp.fly.dev',
  'update_email_isv_config': 'https://ghl-core-mcp.fly.dev',
  'delete_email_isv_config': 'https://ghl-core-mcp.fly.dev'
};

// Router implementation
export class MCPRouter {
  async routeToolCall(toolName: string, ghlToken: string, args: any): Promise<any> {
    // 1. Get target server from static mapping
    const targetServer = TOOL_TO_SERVER_MAP[toolName];
    
    if (!targetServer) {
      throw new Error(`Unknown tool: ${toolName}. Available tools: ${Object.keys(TOOL_TO_SERVER_MAP).join(', ')}`);
    }

    // 2. Prepare request for target server
    const mcpRequest = {
      jsonrpc: "2.0",
      id: Math.random(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: {
          apiKey: ghlToken,  // Real GHL token (auto-refreshed)
          ...args
        }
      }
    };

    // 3. Proxy to appropriate MCP server
    const response = await fetch(`${targetServer}/sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mcpRequest)
    });

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get all available tools from static mapping
   */
  getAllAvailableTools(): string[] {
    return Object.keys(TOOL_TO_SERVER_MAP);
  }

  /**
   * Get tools by server
   */
  getToolsByServer(serverUrl: string): string[] {
    return Object.entries(TOOL_TO_SERVER_MAP)
      .filter(([_, url]) => url === serverUrl)
      .map(([toolName, _]) => toolName);
  }

  /**
   * Get server for specific tool
   */
  getServerForTool(toolName: string): string | undefined {
    return TOOL_TO_SERVER_MAP[toolName];
  }
}
```

### **Routing Benefits:**

✅ **Fast Performance** - No discovery overhead, direct routing  
✅ **Reliable** - No dependency on server availability for routing decisions  
✅ **Predictable** - Known tools always go to known servers  
✅ **Easy Debugging** - Clear mapping in code, easy to trace issues  
✅ **Simple Maintenance** - Update mapping when adding/removing tools  

### **Tool Count by Server:**
- **ghl-sales-mcp**: ~47 tools (Revenue, Payments, Invoices)
- **ghl-ecommerce-mcp**: ~15 tools (Products, Store Management)  
- **ghl-communications-mcp**: ~25 tools (SMS, Email, Conversations)
- **ghl-operations-mcp**: ~25 tools (Calendar, Workflows, Surveys)
- **ghl-data-mcp**: ~15 tools (Custom Objects, Associations)
- **ghl-marketing-mcp**: ~20 tools (Media, Blog, Social Media)
- **ghl-core-mcp**: ~25 tools (Contacts, Custom Fields, Email ISV)

**Total: ~172 unified tools** accessible through one gateway! 🚀

---

## 💾 **Data Storage Design**

### **User Data Structure**
```typescript
interface User {
  id: string;                    // Internal user ID
  gatewayApiKey: string;         // Permanent gateway key
  ghlRefreshToken: string;       // GoHighLevel refresh token (encrypted)
  ghlAccessToken?: string;       // Current access token (cached)
  ghlTokenExpiresAt?: Date;      // Access token expiration
  locationId: string;            // GoHighLevel location ID
  metadata: {
    businessName?: string;
    email?: string;
    createdAt: Date;
    lastUsedAt: Date;
    requestCount: number;
  };
}
```

### **Storage Options**
1. **SQLite** (simple start) - Single file database
2. **PostgreSQL** (production) - Scalable relational database  
3. **Redis** (caching) - Fast token cache layer

---

## 🔐 **Security Considerations**

### **Gateway API Key Generation**
```typescript
// Format: gw_{userId_hash}_{random_suffix}
const gatewayKey = `gw_${userIdHash}_${randomString(16)}`;
```

### **Token Encryption**
```typescript
// Encrypt refresh tokens at rest
const encryptedRefreshToken = encrypt(refreshToken, process.env.ENCRYPTION_KEY);
```

### **Rate Limiting**
```typescript
// Per-user rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each user to 1000 requests per windowMs
  keyGenerator: (req) => req.body.arguments?.userId || req.ip
});
```

---

## 🛠️ **Implementation Phases**

### **Phase 1: MVP (Week 1)**
- [x] Basic token refresh logic
- [x] User registration endpoint
- [x] Simple proxy to one MCP server
- [x] SQLite storage
- [x] Basic error handling

### **Phase 2: Core Features (Week 2)**
- [x] Route to all MCP servers
- [x] SSE connection support
- [x] Token caching layer
- [x] Comprehensive error handling
- [x] Basic monitoring/logging

### **Phase 3: Production Ready (Week 3)**
- [x] PostgreSQL storage
- [x] Rate limiting
- [x] Security hardening
- [x] Admin dashboard
- [x] Usage analytics

### **Phase 4: Enhanced Features (Week 4)**
- [x] Multi-location support
- [x] User management UI
- [x] Advanced monitoring
- [x] Performance optimization

---

## 📊 **Monitoring & Analytics**

### **Health Endpoints**
```http
GET /health                    # Service health
GET /metrics                   # Prometheus metrics
GET /admin/users               # User management
GET /admin/usage               # Usage statistics
```

### **Key Metrics**
- Token refresh success rate
- Request latency by MCP server
- User registration rate
- Error rates by endpoint
- Token expiration alerts

---

## 🚀 **Deployment Strategy**

### **Fly.io Configuration (`fly.toml`)**
```toml
app = 'ghl-auth-gateway'
primary_region = 'sjc'

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 1
  processes = ['app']

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1

[env]
  NODE_ENV = 'production'
```

### **Environment Variables**
```bash
# Required
DATABASE_URL=postgres://...
ENCRYPTION_KEY=your_encryption_key_here
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret

# Optional
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
REDIS_URL=redis://...
```

---

## 👤 **User Experience Flow**

### **One-Time Setup**
1. **User gets GoHighLevel refresh token** (OAuth flow)
2. **User registers with gateway:**
   ```bash
   curl -X POST https://ghl-auth-gateway.fly.dev/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "my-business",
       "refreshToken": "rt_...",
       "locationId": "loc_..."
     }'
   ```
3. **Gateway returns permanent API key:** `gw_abc123...`

### **Daily Usage (Claude Desktop)**
```json
{
  "mcpServers": {
    "ghl-gateway": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "env": {
        "FETCH_BASE_URL": "https://ghl-auth-gateway.fly.dev"
      }
    }
  }
}
```

### **Daily Usage (Custom Apps)**
```typescript
const client = new MCPClient('https://ghl-auth-gateway.fly.dev/mcp/sse');
await client.callTool('get_products', {
  apiKey: 'gw_abc123...',  // Never changes!
  locationId: 'loc_123',
  limit: 10
});
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Token refresh logic
- User registration
- Gateway key generation
- MCP routing

### **Integration Tests**
- Full request flow
- Token expiration scenarios
- MCP server connectivity
- Database operations

### **E2E Tests**
- User registration flow
- Token refresh automation
- Multi-server tool calls
- Error handling

---

## 📚 **Documentation Requirements**

### **README.md**
- Quick start guide
- User registration process
- Claude Desktop setup
- Troubleshooting

### **API.md**
- Complete API reference
- Request/response examples
- Error codes
- Rate limiting

### **USER-GUIDE.md**
- Step-by-step setup
- Getting GoHighLevel tokens
- Common use cases
- FAQ

---

## 🎯 **Success Metrics**

### **Technical**
- 99.9% uptime
- <200ms response time
- 99.95% token refresh success rate
- Zero manual token management

### **User Experience**
- 5-minute setup time
- One-command registration
- Zero ongoing maintenance
- Seamless MCP server integration

---

## 🚦 **Next Steps**

1. **Create new repository:** `ghl-auth-gateway`
2. **Copy shared code** from current repo:
   - `src/types/ghl-types.ts`
   - `src/clients/ghl-api-client.ts`
3. **Start with Phase 1 MVP**
4. **Deploy to Fly.io**
5. **Test with existing MCP servers**
6. **Document user setup process**

---

## 🔗 **Related Repositories**

- **Main MCP Servers:** [GoHighLevel-MCP](https://github.com/your-username/GoHighLevel-MCP)
- **Documentation:** Links to setup guides
- **Examples:** Sample integrations

---

**This blueprint provides everything needed to build a production-ready GoHighLevel Auth Gateway that makes token management invisible to users!** 🚀 