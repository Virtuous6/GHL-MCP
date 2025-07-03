# GoHighLevel Ecommerce MCP Server

Dynamic multi-tenant MCP server for GoHighLevel ecommerce operations including products, pricing, inventory, collections, shipping zones, rates, and carriers.

## Features

### Products Management
- Create, read, update, delete products
- Manage product pricing and variants
- Handle inventory tracking
- Product collections management
- Customer reviews management
- Bulk operations support

### Store Management
- Shipping zones configuration
- Shipping rates management
- Shipping carriers setup
- Store settings configuration
- Available shipping rates calculation

## Architecture

This server uses a **dynamic multi-tenant** architecture where:
- No pre-configuration required
- Users provide API credentials with each tool call
- Supports multiple GoHighLevel accounts simultaneously
- No environment variables needed (credentials are passed per request)

## Installation & Setup

```bash
npm install
npm run build
```

## Usage

### Stdio Mode (MCP Protocol)
```bash
npm start
```

### HTTP Mode (Web Deployment)
```bash
npm run start:http
```

The HTTP server runs on port 8080 by default and provides:
- Health check: `GET /health`
- Tools info: `GET /tools` 
- MCP endpoint: `POST /sse`

## Tool Examples

### Create Product
```json
{
  "apiKey": "pk_live_...",
  "locationId": "location123",
  "name": "Premium Widget",
  "productType": "PHYSICAL",
  "description": "High-quality premium widget",
  "availableInStore": true
}
```

### List Products
```json
{
  "apiKey": "pk_live_...",
  "locationId": "location123",
  "limit": 50,
  "search": "widget"
}
```

### Create Shipping Zone
```json
{
  "apiKey": "pk_live_...",
  "locationId": "location123",
  "name": "North America",
  "countries": [
    {
      "code": "US",
      "states": [
        {"code": "CA"},
        {"code": "NY"}
      ]
    },
    {"code": "CA"}
  ]
}
```

## API Requirements

- **API Key**: GoHighLevel Private Integration API key (pk_live_...)
- **Location ID**: GoHighLevel Location ID
- **Permissions**: Requires ecommerce scopes in your GoHighLevel app

## Available Tools

### Products Tools (24 tools)
- `ghl_create_product`, `ghl_list_products`, `ghl_get_product`, `ghl_update_product`, `ghl_delete_product`
- `ghl_create_price`, `ghl_list_prices`, `ghl_get_price`, `ghl_update_price`, `ghl_delete_price`
- `ghl_bulk_update_products`, `ghl_list_inventory`, `ghl_update_inventory`
- `ghl_get_product_store_stats`, `ghl_update_product_store`
- `ghl_create_product_collection`, `ghl_list_product_collections`, `ghl_get_product_collection`, `ghl_update_product_collection`, `ghl_delete_product_collection`
- `ghl_list_product_reviews`, `ghl_get_reviews_count`, `ghl_update_product_review`, `ghl_delete_product_review`, `ghl_bulk_update_product_reviews`

### Store Tools (15 tools)
- `ghl_create_shipping_zone`, `ghl_list_shipping_zones`, `ghl_get_shipping_zone`, `ghl_update_shipping_zone`, `ghl_delete_shipping_zone`
- `ghl_create_shipping_rate`, `ghl_list_shipping_rates`, `ghl_get_shipping_rate`, `ghl_update_shipping_rate`, `ghl_delete_shipping_rate`
- `ghl_get_available_shipping_rates`
- `ghl_create_shipping_carrier`, `ghl_list_shipping_carriers`, `ghl_get_shipping_carrier`, `ghl_update_shipping_carrier`, `ghl_delete_shipping_carrier`
- `ghl_create_store_setting`, `ghl_get_store_setting`

## Development

```bash
npm run dev          # Development mode with auto-reload
npm run build        # Build TypeScript
npm run lint         # Type checking
npm test             # Run tests
```

## Deployment

The server supports multiple deployment options:
- Local development (stdio)
- Docker containers
- Cloud platforms (Railway, Fly.io, etc.)
- HTTP mode for web integration

See the Docker and fly.toml configuration files for deployment examples.

## Updates from v1.0.0

✅ **Updated to latest dependencies**:
- `@modelcontextprotocol/sdk`: `^1.12.1` (was `^0.5.0`)
- `axios`: `^1.9.0` (was `^1.6.0`)
- `express`: `^5.1.0` (was `^4.18.2`)
- `typescript`: `^5.8.3` (was `^5.3.0`)

✅ **Modernized TypeScript configuration**:
- Using `NodeNext` module resolution
- Improved isolation and type checking

✅ **Dynamic Multi-Tenant Architecture**:
- No environment variables required
- Credentials passed with each tool call
- Better security and multi-user support

✅ **Enhanced Package Configuration**:
- Added proper metadata and keywords
- Development tools (jest, nodemon, ts-node)
- Node.js version requirements 