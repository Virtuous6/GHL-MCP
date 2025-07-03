#!/bin/bash

# GoHighLevel MCP Server Splitting Script
# This script splits the monolithic server into 7 focused MCP servers

set -e  # Exit on any error

echo "🏗️  Starting GoHighLevel MCP Server Split..."
echo "======================================================"

# Define the base directory
BASE_DIR="$(pwd)"
MODULAR_DIR="$BASE_DIR/modular-split"
SRC_DIR="$BASE_DIR/src"

# Server configurations
declare -A SERVERS=(
    ["ghl-core-mcp"]="contact-tools.ts custom-field-v2-tools.ts email-isv-tools.ts"
    ["ghl-communications-mcp"]="conversation-tools.ts email-tools.ts"
    ["ghl-sales-mcp"]="opportunity-tools.ts payments-tools.ts invoices-tools.ts"
    ["ghl-marketing-mcp"]="blog-tools.ts social-media-tools.ts media-tools.ts"
    ["ghl-operations-mcp"]="calendar-tools.ts workflow-tools.ts survey-tools.ts location-tools.ts"
    ["ghl-ecommerce-mcp"]="store-tools.ts products-tools.ts"
    ["ghl-data-mcp"]="object-tools.ts association-tools.ts"
)

# Function to create server structure
create_server_structure() {
    local server_name=$1
    local server_dir="$MODULAR_DIR/$server_name"
    
    echo "📁 Creating directory structure for $server_name..."
    
    # Create directories
    mkdir -p "$server_dir/src/tools"
    mkdir -p "$server_dir/src/types"
    mkdir -p "$server_dir/src/clients"
    
    # Copy shared files
    echo "   📄 Copying shared files..."
    cp "$SRC_DIR/types/ghl-types.ts" "$server_dir/src/types/"
    cp "$SRC_DIR/clients/ghl-api-client.ts" "$server_dir/src/clients/"
    
    echo "   ✅ Directory structure created"
}

# Function to copy tool files
copy_tool_files() {
    local server_name=$1
    local tools_list=$2
    local server_dir="$MODULAR_DIR/$server_name"
    
    echo "🔧 Copying tool files for $server_name..."
    
    for tool_file in $tools_list; do
        if [ -f "$SRC_DIR/tools/$tool_file" ]; then
            echo "   📋 Copying $tool_file..."
            cp "$SRC_DIR/tools/$tool_file" "$server_dir/src/tools/"
        else
            echo "   ⚠️  Warning: $tool_file not found in source"
        fi
    done
    
    echo "   ✅ Tool files copied"
}

# Function to create server.ts
create_server_file() {
    local server_name=$1
    local tools_list=$2
    local server_dir="$MODULAR_DIR/$server_name"
    local class_name=$(echo $server_name | sed 's/-/ /g' | sed 's/\b\w/\U&/g' | sed 's/ //g')
    
    echo "🚀 Creating server.ts for $server_name..."
    
    # Generate imports
    local imports=""
    local tool_instances=""
    local tool_definitions=""
    local tool_routing=""
    
    for tool_file in $tools_list; do
        local tool_name=$(basename "$tool_file" .ts)
        local class_name_tool=$(echo $tool_name | sed 's/-/_/g' | sed 's/_\(.\)/\U\1/g' | sed 's/^./\U&/')
        
        imports+="import { ${class_name_tool} } from './tools/${tool_file}';\n"
        tool_instances+="  private ${tool_name//-/_}: ${class_name_tool};\n"
        tool_definitions+="      ...this.${tool_name//-/_}.getToolDefinitions(),\n"
        tool_routing+="    if (this.is${class_name_tool}Tool(toolName)) {\n      return await this.${tool_name//-/_}.executeTool(toolName, args);\n    }\n    "
    done
    
    cat > "$server_dir/src/server.ts" << EOF
/**
 * $server_name MCP Server
 * Focused MCP server for GoHighLevel integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

import { GHLApiClient } from './clients/ghl-api-client.js';
import { GHLConfig } from './types/ghl-types.js';
$imports

// Load environment variables
dotenv.config();

class ${class_name}Server {
  private server: Server;
  private ghlClient: GHLApiClient;
$tool_instances

  constructor() {
    this.server = new Server(
      { name: '$server_name', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    
    this.setupServer();
  }

  private setupServer(): void {
    // Initialize GHL client
    const config: GHLConfig = {
      accessToken: process.env.GHL_API_KEY || '',
      baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
      version: '2021-07-28',
      locationId: process.env.GHL_LOCATION_ID || ''
    };

    this.ghlClient = new GHLApiClient(config);
    
    // Initialize tool instances
$tool_instances

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const allTools = [
$tool_definitions
        ];
        
        process.stderr.write(\`[$server_name] Registered \${allTools.length} tools\\n\`);
        
        return { tools: allTools };
      } catch (error) {
        process.stderr.write(\`[$server_name] Error listing tools: \${error}\\n\`);
        throw new McpError(ErrorCode.InternalError, \`Failed to list tools: \${error}\`);
      }
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        process.stderr.write(\`[$server_name] Executing tool: \${toolName}\\n\`);
        
$tool_routing
        
        throw new McpError(ErrorCode.MethodNotFound, \`Unknown tool: \${toolName}\`);
      } catch (error) {
        process.stderr.write(\`[$server_name] Error executing tool \${toolName}: \${error}\\n\`);
        throw error;
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    process.stderr.write('$server_name MCP Server running on stdio\\n');
  }
}

// Start server
async function main(): Promise<void> {
  const server = new ${class_name}Server();
  await server.start();
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
EOF

    echo "   ✅ server.ts created"
}

# Function to create package.json
create_package_json() {
    local server_name=$1
    local server_dir="$MODULAR_DIR/$server_name"
    
    echo "📦 Creating package.json for $server_name..."
    
    cat > "$server_dir/package.json" << EOF
{
  "name": "@ghl/$server_name",
  "version": "1.0.0", 
  "description": "GoHighLevel $server_name MCP Server",
  "main": "dist/server.js",
  "bin": {
    "$server_name": "dist/server.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --exec ts-node src/server.ts",
    "start": "node dist/server.js",
    "start:http": "node dist/http-server.js",
    "test": "jest",
    "lint": "tsc --noEmit"
  },
  "keywords": [
    "mcp",
    "gohighlevel",
    "claude",
    "ai"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",
    "@types/express": "^5.0.2",
    "axios": "^1.9.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.18",
    "@types/node": "^22.15.29",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

    echo "   ✅ package.json created"
}

# Function to create TypeScript config
create_tsconfig() {
    local server_name=$1
    local server_dir="$MODULAR_DIR/$server_name"
    
    echo "⚙️  Creating tsconfig.json for $server_name..."
    
    cat > "$server_dir/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "outDir": "./dist",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

    echo "   ✅ tsconfig.json created"
}

# Function to create Dockerfile
create_dockerfile() {
    local server_name=$1
    local server_dir="$MODULAR_DIR/$server_name"
    
    echo "🐳 Creating Dockerfile for $server_name..."
    
    cat > "$server_dir/Dockerfile" << EOF
# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
EOF

    echo "   ✅ Dockerfile created"
}

# Function to create fly.toml
create_fly_config() {
    local server_name=$1
    local server_dir="$MODULAR_DIR/$server_name"
    
    echo "✈️  Creating fly.toml for $server_name..."
    
    cat > "$server_dir/fly.toml" << EOF
app = "$server_name"
primary_region = "sjc"

[build]

[deploy]
  release_command = "npm run build"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[machine]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1

[[services]]
  protocol = "tcp"
  internal_port = 8080

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20
EOF

    echo "   ✅ fly.toml created"
}

# Function to create README
create_readme() {
    local server_name=$1
    local tools_list=$2
    local server_dir="$MODULAR_DIR/$server_name"
    
    echo "📄 Creating README.md for $server_name..."
    
    local tool_count=$(echo $tools_list | wc -w)
    
    cat > "$server_dir/README.md" << EOF
# $server_name

Focused GoHighLevel MCP Server with $tool_count specialized tools.

## 🎯 Focus Area

This MCP server provides AI agents with focused access to:
$(for tool_file in $tools_list; do
    echo "- $(basename "$tool_file" .ts | sed 's/-/ /g' | sed 's/\b\w/\U&/g') functionality"
done)

## 🚀 Quick Start

### Local Development
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

### Fly.io Deployment
\`\`\`bash
fly launch
fly secrets set GHL_API_KEY=your_key GHL_LOCATION_ID=your_id
fly deploy
\`\`\`

## 🔧 Configuration

Set these environment variables:
- \`GHL_API_KEY\` - Your GoHighLevel Private Integrations API key
- \`GHL_BASE_URL\` - GoHighLevel API base URL (default: https://services.leadconnectorhq.com)
- \`GHL_LOCATION_ID\` - Your GoHighLevel location ID

## 📊 Tool Count: $tool_count

This focused server provides optimal performance for AI agents by limiting tool scope while maintaining full functionality for its domain.
EOF

    echo "   ✅ README.md created"
}

# Main execution
echo "🔍 Checking source directory..."
if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Source directory not found: $SRC_DIR"
    echo "Please run this script from the GoHighLevel-MCP root directory"
    exit 1
fi

echo "📁 Creating modular directory structure..."
mkdir -p "$MODULAR_DIR"

# Process each server
for server_name in "${!SERVERS[@]}"; do
    echo ""
    echo "🏗️  Processing $server_name..."
    echo "----------------------------------------"
    
    tools_list="${SERVERS[$server_name]}"
    
    # Create all files for this server
    create_server_structure "$server_name"
    copy_tool_files "$server_name" "$tools_list"
    create_server_file "$server_name" "$tools_list"
    create_package_json "$server_name"
    create_tsconfig "$server_name"
    create_dockerfile "$server_name"
    create_fly_config "$server_name"
    create_readme "$server_name" "$tools_list"
    
    echo "✅ $server_name completed!"
done

echo ""
echo "======================================================"
echo "🎉 GoHighLevel MCP Server Split Complete!"
echo ""
echo "📊 Summary:"
echo "- Created 7 focused MCP servers"
echo "- Each server is independently deployable"
echo "- Optimal tool count for AI agent performance"
echo ""
echo "📁 Created servers:"
for server_name in "${!SERVERS[@]}"; do
    tools_list="${SERVERS[$server_name]}"
    tool_count=$(echo $tools_list | wc -w)
    echo "   $server_name ($tool_count tools)"
done
echo ""
echo "🚀 Next Steps:"
echo "1. cd modular-split/ghl-core-mcp"
echo "2. npm install && npm run build"
echo "3. Test: npm start"
echo "4. Deploy: fly launch"
echo ""
echo "💡 Update your Claude Desktop mcp_settings.json to use the new servers!"
echo "See MODULAR-ARCHITECTURE-GUIDE.md for detailed instructions."
EOF 