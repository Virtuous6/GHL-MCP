# 🚀 GoHighLevel MCP Server

## 🚨 **IMPORTANT: FOUNDATIONAL PROJECT NOTICE** 

> **⚠️ This is a BASE-LEVEL foundational project designed to connect the GoHighLevel community with AI automation through MCP (Model Context Protocol).**

### **🎯 What This Project Is:**
- **Foundation Layer**: Provides access to ALL sub-account level GoHighLevel API endpoints via MCP
- **Community Starter**: Built to get the community moving forward together, faster
- **Open Architecture**: API client and types can be further modularized and segmented as needed
- **Educational Resource**: Learn how to integrate GoHighLevel with AI systems

### **⚠️ Critical AI Safety Considerations:**
- **Memory/Recall Systems**: If you don't implement proper memory or recall mechanisms, AI may perform unintended actions
- **Rate Limiting**: Monitor API usage to avoid hitting GoHighLevel rate limits
- **Permission Controls**: Understand that this provides FULL access to your sub-account APIs
- **Data Security**: All actions are performed with your API credentials - ensure proper security practices

### **🎯 Intended Use:**
- **Personal/Business Use**: Integrate your own GoHighLevel accounts with AI
- **Development Base**: Build upon this foundation for custom solutions  
- **Learning & Experimentation**: Understand GoHighLevel API patterns
- **Community Contribution**: Help improve and extend this foundation

### **🚫 NOT Intended For:**
- **Direct Resale**: This is freely available community software
- **Production Without Testing**: Always test thoroughly in development environments
- **Unmonitored AI Usage**: Implement proper safeguards and monitoring

---

## 🔑 **CRITICAL: GoHighLevel API Setup**

### **📋 Required: Private Integrations API Key**

> **⚠️ This project requires a PRIVATE INTEGRATIONS API key, not a regular API key!**

**How to get your Private Integrations API Key:**

1. **Login to your GoHighLevel account**
2. **Navigate to Settings** → **Integrations** → **Private Integrations**
3. **Create New Private Integration:**
   - **Name**: `MCP Server Integration` (or your preferred name)
   - **Webhook URL**: Leave blank (not needed)
4. **Select Required Scopes** based on tools you'll use:
   - ✅ **contacts.readonly** - View contacts
   - ✅ **contacts.write** - Create/update contacts  
   - ✅ **conversations.readonly** - View conversations
   - ✅ **conversations.write** - Send messages
   - ✅ **opportunities.readonly** - View opportunities
   - ✅ **opportunities.write** - Manage opportunities
   - ✅ **calendars.readonly** - View calendars/appointments
   - ✅ **calendars.write** - Create/manage appointments
   - ✅ **locations.readonly** - View location data
   - ✅ **locations.write** - Manage location settings
   - ✅ **workflows.readonly** - View workflows
   - ✅ **campaigns.readonly** - View campaigns
   - ✅ **blogs.readonly** - View blog content
   - ✅ **blogs.write** - Create/manage blog posts
   - ✅ **users.readonly** - View user information
   - ✅ **custom_objects.readonly** - View custom objects
   - ✅ **custom_objects.write** - Manage custom objects
   - ✅ **invoices.readonly** - View invoices
   - ✅ **invoices.write** - Create/manage invoices
   - ✅ **payments.readonly** - View payment data
   - ✅ **products.readonly** - View products
   - ✅ **products.write** - Manage products

5. **Save Integration** and copy the generated **Private API Key**
6. **Copy your Location ID** from Settings → Company → Locations

**💡 Tip:** You can always add more scopes later by editing your Private Integration if you need additional functionality.

---

This project was a 'time-taker' but I felt it was important. Feel free to donate - everything will go into furthering this Project -> Aiming for Mass Agency "Agent Driven Operations".

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mastanley13/GoHighLevel-MCP)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/mastanley13/GoHighLevel-MCP)
[![Deploy on Fly.io](https://fly.io/static/images/launch.svg)](https://fly.io/docs/getting-started/)
[![Donate to the Project](https://img.shields.io/badge/Donate_to_the_Project-💝_Support_Development-ff69b4?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/28E14o1hT7JAfstfvqdZ60y)

> **🔥 Transform Claude Desktop into a complete GoHighLevel CRM powerhouse with 269+ powerful tools across 19+ categories**

## 🎯 What This Does

This comprehensive MCP (Model Context Protocol) server connects Claude Desktop directly to your GoHighLevel account, providing unprecedented automation capabilities:

- **👥 Complete Contact Management**: 31 tools for contacts, tasks, notes, and relationships
- **💬 Advanced Messaging**: 20 tools for SMS, email, conversations, and call recordings  
- **🏢 Business Operations**: Location management, custom objects, workflows, and surveys
- **💰 Sales & Revenue**: Opportunities, payments, invoices, estimates, and billing automation
- **📱 Marketing Automation**: Social media, email campaigns, blog management, and media library
- **🛒 E-commerce**: Store management, products, inventory, shipping, and order fulfillment

## ⚡ Quick Deploy Options

### 🟢 Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mastanley13/GoHighLevel-MCP)

**Why Vercel:**
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS and global CDN
- ✅ Zero-config deployment
- ✅ Perfect for MCP servers

### 🚂 Railway  
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/mastanley13/GoHighLevel-MCP)

**Why Railway:**
- ✅ $5 free monthly credit
- ✅ Simple one-click deployment
- ✅ Automatic scaling
- ✅ Great for production workloads

### ✈️ Fly.io
[![Deploy on Fly.io](https://fly.io/static/images/launch.svg)](https://fly.io/docs/getting-started/)

**Why Fly.io:**
- ✅ Global edge deployment
- ✅ $3.88/month for 512MB RAM
- ✅ Auto-scaling and hibernation
- ✅ Excellent performance

### 🎨 Render
- ✅ Free tier available
- ✅ Auto-deploy from GitHub
- ✅ Built-in SSL

---

## ✈️ **Fly.io Deployment Guide**

### **💰 Pricing**
```
Free Tier: 3 machines × 256MB RAM (may need upgrade)
Recommended: shared-cpu-2x (512MB RAM) = $3.88/month
Bandwidth: Included
Storage: Included
Total: ~$4/month
```

### **🔧 Setup & Deployment**

#### **1. Install Fly CLI**
```bash
# macOS
brew install flyctl

# Linux/WSL
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

#### **2. Login to Fly.io**
```bash
fly auth login
```

#### **3. Deploy from Repository**
```bash
# Clone the repository
git clone https://github.com/mastanley13/GoHighLevel-MCP.git
cd GoHighLevel-MCP

# Initialize Fly app
fly launch

# Set environment variables
fly secrets set GHL_API_KEY=your_private_integrations_api_key
fly secrets set GHL_BASE_URL=https://services.leadconnectorhq.com
fly secrets set GHL_LOCATION_ID=your_location_id
fly secrets set NODE_ENV=production

# Deploy
fly deploy
```

#### **4. Configuration File (fly.toml)**
The repository includes a pre-configured `fly.toml` with:
- ✅ 512MB RAM allocation
- ✅ Auto-scaling enabled
- ✅ Health checks configured  
- ✅ HTTPS enforcement
- ✅ Port 8080 internal routing

#### **5. Health Check & Monitoring**
```bash
# Check app status
fly status

# View logs
fly logs

# Monitor resources
fly vm status

# Scale if needed
fly scale vm shared-cpu-1x --memory 1024
```

### **🎯 Fly.io Advantages for MCP Server**

#### **🌍 Global Edge Deployment**
- **Multiple regions**: Deploy close to your users
- **Low latency**: ~50ms response times globally
- **Automatic failover**: Built-in redundancy

#### **💰 Cost-Effective Scaling**
```
Development: Free tier (256MB) = $0/month
Production: shared-cpu-2x (512MB) = $3.88/month  
High-traffic: dedicated-cpu-1x (2GB) = $23.92/month
```

#### **🔄 Auto-Hibernation**
- **Sleep when idle**: Reduces costs for low-traffic apps
- **Instant wake**: <1 second cold start
- **Smart scaling**: Auto-adjust based on demand

#### **🛠️ DevOps Features**
- **Rolling deployments**: Zero-downtime updates
- **Built-in secrets**: Secure environment variables
- **Integrated monitoring**: Real-time metrics and alerts
- **Custom domains**: Easy HTTPS setup

### **📊 Fly.io vs Other Platforms**

| Feature | Fly.io | Railway | Vercel | Render |
|---------|--------|---------|--------|--------|
| **Free Tier** | 256MB RAM | $5 credit | Generous | 750hrs |
| **Paid Price** | $3.88/month | $5/month | $20/month | $7/month |
| **Global Edge** | ✅ | ❌ | ✅ | ❌ |
| **Auto-hibernate** | ✅ | ❌ | ✅ | ✅ |
| **Custom domains** | ✅ | ✅ | ✅ | ✅ |
| **CLI Tool** | ✅ Excellent | ✅ Good | ✅ Good | ❌ |

### **🚀 Quick Start (5 minutes)**
```bash
# 1. Install & login
brew install flyctl && fly auth login

# 2. Deploy
fly launch --generate-name

# 3. Set secrets
fly secrets set GHL_API_KEY=your_key GHL_LOCATION_ID=your_id

# 4. Access your MCP server
fly open
```

Your GoHighLevel MCP server will be live at: `https://your-app-name.fly.dev`

---

## 🎮 Claude Desktop Usage Examples

### 📞 Customer Communication Workflow
```
"Search for contacts tagged 'VIP' who haven't been contacted in 30 days, then send them a personalized SMS about our new premium service offering"
```

### 💰 Sales Pipeline Management
```
"Create an opportunity for contact John Smith for our Premium Package worth $5000, add it to the 'Enterprise Sales' pipeline, and schedule a follow-up appointment for next Tuesday"
```

### 📊 Business Intelligence
```
"Get all invoices from the last quarter, analyze payment patterns, and create a report of our top-paying customers with their lifetime value"
```

### 🛒 E-commerce Operations
```
"List all products with low inventory, create a restock notification campaign, and send it to contacts tagged 'inventory-manager'"
```

### 📱 Social Media Automation
```
"Create a social media post announcing our Black Friday sale, schedule it for all connected platforms, and track engagement metrics"
```

### 🎯 Marketing Automation
```
"Find all contacts who opened our last email campaign but didn't purchase, add them to the 'warm-leads' workflow, and schedule a follow-up sequence"
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+ (Latest LTS recommended)
- GoHighLevel account with API access
- Valid API key and Location ID
- Claude Desktop (for MCP integration)

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/mastanley13/GoHighLevel-MCP.git
cd GoHighLevel-MCP

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Configure your GHL credentials in .env

# Build the project
npm run build

# Start the server
npm start

# For development with hot reload
npm run dev
```

### Environment Configuration
```bash
# Required Environment Variables
GHL_API_KEY=your_private_integrations_api_key  # From Private Integrations, NOT regular API key
GHL_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=your_location_id              # From Settings → Company → Locations
NODE_ENV=production

# Optional Configuration
PORT=8000
CORS_ORIGINS=*
LOG_LEVEL=info
```

### Available Scripts
```bash
npm run build          # TypeScript compilation
npm run dev            # Development server with hot reload
npm start              # Production HTTP server
npm run start:stdio    # CLI MCP server for Claude Desktop
npm run start:http     # HTTP MCP server for web apps
npm test               # Run test suite
npm run test:watch     # Watch mode testing
npm run test:coverage  # Coverage reports
npm run lint           # TypeScript linting
```

### Testing & Validation
```bash
# Test API connectivity
curl http://localhost:8000/health

# List available tools
curl http://localhost:8000/tools

# Test MCP SSE endpoint
curl -H "Accept: text/event-stream" http://localhost:8000/sse
```

## 🌐 Deployment Guide

### 🟢 Vercel Deployment (Recommended)

**Option 1: One-Click Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mastanley13/GoHighLevel-MCP)

**Option 2: Manual Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# Add: GHL_API_KEY, GHL_BASE_URL, GHL_LOCATION_ID, NODE_ENV
```

**Vercel Configuration** (vercel.json):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/http-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/http-server.js"
    }
  ]
}
```

### 🚂 Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add environment variables via Railway dashboard
```

### 🎨 Render Deployment

1. Connect your GitHub repository
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Add environment variables in Render dashboard

### 🐳 Docker Deployment

```bash
# Build image
docker build -t ghl-mcp-server .

# Run container
docker run -p 8000:8000 \
  -e GHL_API_KEY=your_key \
  -e GHL_BASE_URL=https://services.leadconnectorhq.com \
  -e GHL_LOCATION_ID=your_location_id \
  ghl-mcp-server
```

## 🔌 Claude Desktop Integration

### MCP Configuration
Add to your Claude Desktop `mcp_settings.json`:

```json
{
  "mcpServers": {
    "ghl-mcp-server": {
      "command": "node",
      "args": ["path/to/ghl-mcp-server/dist/server.js"],
      "env": {
        "GHL_API_KEY": "your_private_integrations_api_key",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com",
        "GHL_LOCATION_ID": "your_location_id"
      }
    }
  }
}
```

### HTTP MCP Integration
For web-based MCP clients, use the HTTP endpoint:
```
https://your-deployment-url.vercel.app/sse
```

## 📋 Project Architecture

```
ghl-mcp-server/
├── 📁 src/                    # Source code
│   ├── 📁 clients/            # API client implementations
│   │   └── ghl-api-client.ts  # Core GHL API client
│   ├── 📁 tools/              # MCP tool implementations
│   │   ├── contact-tools.ts   # Contact management (31 tools)
│   │   ├── conversation-tools.ts # Messaging (20 tools)
│   │   ├── blog-tools.ts      # Blog management (7 tools)
│   │   ├── opportunity-tools.ts # Sales pipeline (10 tools)
│   │   ├── calendar-tools.ts  # Appointments (14 tools)
│   │   ├── email-tools.ts     # Email marketing (5 tools)
│   │   ├── location-tools.ts  # Location management (24 tools)
│   │   ├── email-isv-tools.ts # Email verification (1 tool)
│   │   ├── social-media-tools.ts # Social media (17 tools)
│   │   ├── media-tools.ts     # Media library (3 tools)
│   │   ├── object-tools.ts    # Custom objects (9 tools)
│   │   ├── association-tools.ts # Associations (10 tools)
│   │   ├── custom-field-v2-tools.ts # Custom fields (8 tools)
│   │   ├── workflow-tools.ts  # Workflows (1 tool)
│   │   ├── survey-tools.ts    # Surveys (2 tools)
│   │   ├── store-tools.ts     # Store management (18 tools)
│   │   ├── products-tools.ts  # Products (10 tools)
│   │   ├── payments-tools.ts  # Payments (20 tools)
│   │   └── invoices-tools.ts  # Invoices & billing (39 tools)
│   ├── 📁 types/              # TypeScript definitions
│   │   └── ghl-types.ts       # Comprehensive type definitions
│   ├── 📁 utils/              # Utility functions
│   ├── server.ts              # CLI MCP server (Claude Desktop)
│   └── http-server.ts         # HTTP MCP server (Web apps)
├── 📁 tests/                  # Comprehensive test suite
│   ├── 📁 clients/            # API client tests
│   ├── 📁 tools/              # Tool implementation tests
│   └── 📁 mocks/              # Test mocks and fixtures
├── 📁 api/                    # Vercel API routes
├── 📁 docker/                 # Docker configurations
├── 📁 dist/                   # Compiled JavaScript (auto-generated)
├── 📄 Documentation files
│   ├── DEPLOYMENT.md          # Deployment guides
│   ├── CLAUDE-DESKTOP-DEPLOYMENT-PLAN.md
│   ├── VERCEL-DEPLOYMENT.md
│   ├── CLOUD-DEPLOYMENT.md
│   └── PROJECT-COMPLETION.md
├── 📄 Configuration files
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript configuration
│   ├── jest.config.js         # Testing configuration
│   ├── vercel.json            # Vercel deployment config
│   ├── railway.json           # Railway deployment config
│   ├── Dockerfile             # Docker containerization
│   ├── Procfile               # Process configuration
│   └── cursor-mcp-config.json # MCP configuration
└── 📄 README.md               # This comprehensive guide
```

## 🔐 Security & Best Practices

### Environment Security
- ✅ Never commit API keys to version control
- ✅ Use environment variables for all sensitive data
- ✅ Implement proper CORS policies
- ✅ Regular API key rotation
- ✅ Monitor API usage and rate limits

### Production Considerations
- ✅ Implement proper error handling and logging
- ✅ Set up monitoring and alerting
- ✅ Use HTTPS for all deployments
- ✅ Implement request rate limiting
- ✅ Regular security updates

### API Rate Limiting
- GoHighLevel API has rate limits
- Implement exponential backoff
- Cache frequently requested data
- Use batch operations when available

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist/
npm install
npm run build
```

**API Connection Issues:**
```bash
# Test API connectivity (use your Private Integrations API key)
curl -H "Authorization: Bearer YOUR_PRIVATE_INTEGRATIONS_API_KEY" \
     https://services.leadconnectorhq.com/locations/YOUR_LOCATION_ID
```

**Common API Issues:**
- ✅ Using Private Integrations API key (not regular API key)
- ✅ Required scopes enabled in Private Integration
- ✅ Location ID matches your GHL account
- ✅ Environment variables properly set

**Claude Desktop Integration:**
1. Verify MCP configuration syntax
2. Check file paths are absolute
3. Ensure environment variables are set
4. Restart Claude Desktop after changes

**Memory Issues:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=8192 dist/server.js
```

**CORS Errors:**
- Configure CORS_ORIGINS environment variable
- Ensure proper HTTP headers
- Check domain whitelist

### Performance Optimization
- Enable response caching for read operations
- Use pagination for large data sets
- Implement connection pooling
- Monitor memory usage and optimize accordingly

## 📊 Technical Specifications

### System Requirements
- **Runtime**: Node.js 18+ (Latest LTS recommended)
- **Memory**: Minimum 512MB RAM, Recommended 1GB+
- **Storage**: 100MB for application, additional for logs
- **Network**: Stable internet connection for API calls

### Technology Stack
- **Backend**: Node.js + TypeScript
- **HTTP Framework**: Express.js 5.x
- **MCP SDK**: @modelcontextprotocol/sdk ^1.12.1
- **HTTP Client**: Axios ^1.9.0
- **Testing**: Jest with TypeScript support
- **Build System**: TypeScript compiler

### API Integration
- **GoHighLevel API**: v2021-07-28 (Contacts), v2021-04-15 (Conversations)
- **Authentication**: Bearer token
- **Rate Limiting**: Respects GHL API limits
- **Error Handling**: Comprehensive error recovery

### Performance Metrics
- **Cold Start**: < 2 seconds
- **API Response**: < 500ms average
- **Memory Usage**: ~50-100MB base
- **Tool Execution**: < 1 second average

## 🤝 Contributing

We welcome contributions from the GoHighLevel community!

### Development Workflow
```bash
# Fork and clone the repository
git clone https://github.com/your-fork/GoHighLevel-MCP.git

# Create feature branch
git checkout -b feature/amazing-new-tool

# Make your changes with tests
npm test

# Commit and push
git commit -m "Add amazing new tool for [specific functionality]"
git push origin feature/amazing-new-tool

# Open Pull Request with detailed description
```

### Contribution Guidelines
- ✅ Add comprehensive tests for new tools
- ✅ Follow TypeScript best practices
- ✅ Update documentation for new features
- ✅ Ensure all linting passes
- ✅ Include examples in PR description

### Code Standards
- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for all public methods
- Implement proper error handling
- Include integration tests

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Community & Support

### Documentation
- 📖 [Complete API Documentation](docs/)
- 🎥 [Video Tutorials](docs/videos/)
- 📋 [Tool Reference Guide](docs/tools/)
- 🔧 [Deployment Guides](docs/deployment/)

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/mastanley13/GoHighLevel-MCP/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mastanley13/GoHighLevel-MCP/discussions)
- **API Reference**: [GoHighLevel API Docs](https://highlevel.stoplight.io/)
- **MCP Protocol**: [Model Context Protocol](https://modelcontextprotocol.io/)

### Community Resources
- 💬 Join our Discord community
- 📺 Subscribe to our YouTube channel
- 📰 Follow our development blog
- 🐦 Follow us on Twitter for updates

## 🎉 Success Metrics

This comprehensive MCP server delivers:

### ✅ **269 Operational Tools** across 19 categories
### ✅ **Real-time GoHighLevel Integration** with full API coverage
### ✅ **Production-Ready Deployment** on multiple platforms
### ✅ **Enterprise-Grade Architecture** with comprehensive error handling
### ✅ **Full TypeScript Support** with complete type definitions
### ✅ **Extensive Test Coverage** ensuring reliability
### ✅ **Multi-Platform Deployment** (Vercel, Railway, Render, Docker)
### ✅ **Claude Desktop Integration** with MCP protocol compliance
### ✅ **Community-Driven Development** with comprehensive documentation

---

## 🚀 **Ready to revolutionize your GoHighLevel automation?**

**Deploy now and unlock the full potential of AI-powered CRM management!**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mastanley13/GoHighLevel-MCP) [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/mastanley13/GoHighLevel-MCP)

---

## 💝 Support This Project

This project represents hundreds of hours of development work to help the GoHighLevel community. If it's saving you time and helping your business, consider supporting its continued development:

### 🎁 Ways to Support:
- **⭐ Star this repo** - Helps others discover the project
- **🍕 Buy me a pizza** - [Donate via Stripe](https://buy.stripe.com/28E14o1hT7JAfstfvqdZ60y) 
- **🐛 Report bugs** - Help make it better for everyone
- **💡 Suggest features** - Share your ideas for improvements
- **🤝 Contribute code** - Pull requests are always welcome!

### 🏆 Recognition:
- Contributors will be listed in the project
- Significant contributions may get special recognition
- This project is community-driven and community-supported

**Every contribution, big or small, helps keep this project alive and growing!** 🚀

---

*Made with ❤️ for the GoHighLevel community by developers who understand the power of automation.* 