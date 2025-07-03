# GoHighLevel Data MCP Server

Dynamic multi-tenant MCP server for GoHighLevel data management operations including custom objects, object schemas, associations, and records.

## Features

### Custom Objects Management
- Get all objects (custom and standard) for a location
- Create new custom object schemas with labels and primary properties  
- Get object schema details including all fields and properties
- Update object schema properties including labels and searchable fields
- Support for both custom objects and standard objects (contacts, opportunities, businesses)

### Object Records Management
- Create new records in custom or standard objects
- Get specific object records by ID
- Update existing object records with new properties
- Delete object records
- Search object records with advanced filtering
- Support for properties, owners, and followers

### Associations Management
- Get all associations for a location with pagination
- Create new associations between entities (contacts, custom objects, opportunities)
- Get associations by ID, key, or object key
- Update association labels
- Delete user-defined associations
- Support for both system-defined and user-defined associations

### Relations Management
- Create relations between specific records using associations
- Get relations by record ID with pagination
- Delete specific relations
- Link contacts to custom objects, opportunities to contacts, etc.

## Architecture

This server uses a **dynamic multi-tenant** architecture where:
- No pre-configuration required
- Users provide API credentials with each tool call
- Supports unlimited tenants/users
- Each request is authenticated individually

## Usage

### Tool Parameters

Every tool requires these authentication parameters:
- `apiKey` (required): GoHighLevel API key
- `locationId` (optional): GoHighLevel location ID for location-specific operations

### Available Tools

**Object Management Tools:**
- `get_all_objects` - List all objects for a location
- `create_object_schema` - Create new custom object schemas
- `get_object_schema` - Get schema details and fields
- `update_object_schema` - Update schema properties
- `create_object_record` - Create new records
- `get_object_record` - Get specific records
- `update_object_record` - Update existing records
- `delete_object_record` - Delete records
- `search_object_records` - Search with filters

**Association Management Tools:**
- `ghl_get_all_associations` - List all associations
- `ghl_create_association` - Create new associations
- `ghl_get_association_by_id` - Get association by ID
- `ghl_update_association` - Update association labels
- `ghl_delete_association` - Delete associations
- `ghl_get_association_by_key` - Get association by key
- `ghl_get_association_by_object_key` - Get associations by object

**Relation Management Tools:**
- `ghl_create_relation` - Create relations between records
- `ghl_get_relations_by_record` - Get relations for a record
- `ghl_delete_relation` - Delete specific relations

## Examples

### Creating a Custom Object Schema
```json
{
  "apiKey": "your-api-key",
  "locationId": "your-location-id",
  "labels": {
    "singular": "Pet",
    "plural": "Pets"
  },
  "key": "pet",
  "description": "Pet management system",
  "primaryDisplayPropertyDetails": {
    "key": "custom_objects.pet.name",
    "name": "Pet Name",
    "dataType": "TEXT"
  }
}
```

### Creating an Association
```json
{
  "apiKey": "your-api-key",
  "locationId": "your-location-id", 
  "key": "pet_owner",
  "firstObjectLabel": "pet",
  "firstObjectKey": "custom_objects.pet",
  "secondObjectLabel": "owner", 
  "secondObjectKey": "contact"
}
```

### Creating a Relation
```json
{
  "apiKey": "your-api-key",
  "locationId": "your-location-id",
  "associationId": "association-id",
  "firstRecordId": "pet-record-id",
  "secondRecordId": "contact-id"
}
```

## Deployment

### Standalone Server (stdio)
```bash
npm run build
npm start
```

### HTTP Server
```bash
npm run build  
npm run start:http
```

### Docker
```bash
docker build -t ghl-data-mcp .
docker run -p 3000:3000 ghl-data-mcp
```

### Cloud Deployment (Fly.io)
```bash
fly deploy
```

## Development

```bash
npm install
npm run dev
```

## Dependencies

- **@modelcontextprotocol/sdk**: ^1.12.1
- **axios**: ^1.9.0  
- **express**: ^5.1.0
- **cors**: ^2.8.5
- **typescript**: ^5.8.3

## Security

- API keys are validated on each request
- No credentials stored server-side
- Supports CORS for web deployment
- Error handling prevents credential leakage

## Error Handling

All tools return structured responses with:
- `success`: boolean indicating operation success
- `message`: human-readable description
- Additional data fields based on tool type

Failed operations throw MCP errors with appropriate error codes and descriptions. 