# GoHighLevel MCP Modular Servers Overview

This document provides a comprehensive overview of each modular GoHighLevel MCP server and the tools they provide. The monolithic server has been split into 7 specialized servers, each handling specific aspects of the GoHighLevel API.

## Server Architecture

The modular architecture consists of the following servers:

- **ghl-core-mcp**: Contact management and core functionality
- **ghl-communications-mcp**: Messaging and communication tools
- **ghl-data-mcp**: Data management and custom objects
- **ghl-ecommerce-mcp**: E-commerce and product management
- **ghl-marketing-mcp**: Marketing content and media management
- **ghl-operations-mcp**: Business operations and scheduling
- **ghl-sales-mcp**: Sales management and payment processing

---

## 1. GHL Core MCP Server (`ghl-core-mcp`)

**Purpose**: Handles core contact management, custom fields, and email verification functionality.

### Tools Available:

#### Contact Management Tools (33 tools)
- **create_contact** - Create a new contact in GoHighLevel
- **search_contacts** - Search for contacts with advanced filtering options
- **get_contact** - Get detailed information about a specific contact
- **update_contact** - Update contact information
- **delete_contact** - Delete a contact from GoHighLevel
- **add_contact_tags** - Add tags to a contact
- **remove_contact_tags** - Remove tags from a contact

#### Task Management Tools
- **get_contact_tasks** - Get all tasks for a contact
- **create_contact_task** - Create a new task for a contact
- **get_contact_task** - Get a specific task for a contact
- **update_contact_task** - Update task details
- **delete_contact_task** - Delete a task
- **update_task_completion** - Update task completion status

#### Note Management Tools
- **get_contact_notes** - Get all notes for a contact
- **create_contact_note** - Create a new note for a contact
- **get_contact_note** - Get a specific note
- **update_contact_note** - Update note content
- **delete_contact_note** - Delete a note

#### Advanced Contact Operations
- **upsert_contact** - Create or update contact (advanced)
- **get_duplicate_contact** - Check for duplicate contacts
- **get_contacts_by_business** - Get contacts by business
- **get_contact_appointments** - Get contact appointments

#### Bulk Operations
- **bulk_update_contact_tags** - Update tags for multiple contacts
- **bulk_update_contact_business** - Update business info for multiple contacts

#### Followers Management
- **add_contact_followers** - Add followers to a contact
- **remove_contact_followers** - Remove followers from a contact

#### Campaign Management
- **add_contact_to_campaign** - Add contact to a campaign
- **remove_contact_from_campaign** - Remove contact from campaign
- **remove_contact_from_all_campaigns** - Remove contact from all campaigns

#### Workflow Management
- **add_contact_to_workflow** - Add contact to a workflow
- **remove_contact_from_workflow** - Remove contact from workflow

#### Custom Fields V2 Tools (6 tools)
- **ghl_get_custom_field_by_id** - Get custom field or folder by ID
- **ghl_create_custom_field** - Create new custom field for objects/company
- **ghl_update_custom_field** - Update existing custom field
- **ghl_delete_custom_field** - Delete a custom field
- **ghl_get_custom_fields_by_object_key** - Get all custom fields for an object

#### Email Verification Tools (1 tool)
- **verify_email** - Verify email address deliverability and get risk assessment

---

## 2. GHL Communications MCP Server (`ghl-communications-mcp`)

**Purpose**: Handles all messaging, conversations, and email campaign functionality.

### Tools Available:

#### Conversation & Messaging Tools (20 tools)
- **send_sms** - Send an SMS message to a contact
- **send_email** - Send an email message to a contact
- **search_conversations** - Search conversations with various filters
- **get_conversation** - Get detailed conversation information with message history
- **create_conversation** - Create a new conversation
- **update_conversation** - Update conversation details
- **get_recent_messages** - Get recent messages across conversations
- **delete_conversation** - Delete a conversation
- **get_email_message** - Get specific email message details
- **get_message** - Get specific message details
- **upload_message_attachments** - Upload files as message attachments
- **update_message_status** - Update message read/unread status
- **add_inbound_message** - Add an inbound message to conversation
- **add_outbound_call** - Add an outbound call record
- **get_message_recording** - Get call recording for a message
- **get_message_transcription** - Get call transcription
- **download_transcription** - Download transcription file
- **cancel_scheduled_message** - Cancel a scheduled SMS message
- **cancel_scheduled_email** - Cancel a scheduled email
- **live_chat_typing** - Send typing indicator for live chat

#### Email Campaign Tools (5 tools)
- **get_email_campaigns** - Get list of email campaigns
- **create_email_template** - Create a new email template
- **get_email_templates** - Get list of email templates
- **update_email_template** - Update an existing email template
- **delete_email_template** - Delete an email template

---

## 3. GHL Data MCP Server (`ghl-data-mcp`)

**Purpose**: Manages custom objects, associations, and data relationships within GoHighLevel.

### Tools Available:

#### Custom Objects Tools (9 tools)
- **get_all_objects** - Get all objects (custom and standard) for a location
- **create_object_schema** - Create a new custom object schema
- **get_object_schema** - Get object schema details by key
- **update_object_schema** - Update object schema properties
- **create_object_record** - Create a new record in a custom object
- **get_object_record** - Get specific object record
- **update_object_record** - Update object record properties
- **delete_object_record** - Delete an object record
- **search_object_records** - Search records within custom objects

#### Association Management Tools (10 tools)
- **ghl_get_all_associations** - Get all associations for a location
- **ghl_create_association** - Create new association between entity types
- **ghl_get_association_by_id** - Get specific association by ID
- **ghl_update_association** - Update association labels
- **ghl_delete_association** - Delete user-defined association
- **ghl_get_association_by_key** - Get association by key name
- **ghl_get_association_by_object_key** - Get associations by object keys

#### Relation Management Tools
- **ghl_create_relation** - Create relation between two entities
- **ghl_get_relations_by_record** - Get all relations for a record
- **ghl_delete_relation** - Delete a specific relation

---

## 4. GHL E-commerce MCP Server (`ghl-ecommerce-mcp`)

**Purpose**: Handles all e-commerce functionality including products, pricing, inventory, and store management.

### Tools Available:

#### Product Management Tools (16 tools)
- **ghl_create_product** - Create a new product
- **ghl_list_products** - List products with optional filtering
- **ghl_get_product** - Get specific product by ID
- **ghl_update_product** - Update existing product
- **ghl_delete_product** - Delete a product
- **ghl_bulk_update_products** - Update multiple products at once

#### Pricing Tools
- **ghl_create_price** - Create a price for a product
- **ghl_list_prices** - List prices for a product
- **ghl_get_price** - Get specific price by ID
- **ghl_update_price** - Update existing price
- **ghl_delete_price** - Delete a price

#### Inventory Management
- **ghl_list_inventory** - List inventory with filtering
- **ghl_update_inventory** - Update inventory quantities

#### Product Collections
- **ghl_create_product_collection** - Create product collection
- **ghl_list_product_collections** - List product collections
- **ghl_get_product_collection** - Get specific collection
- **ghl_update_product_collection** - Update collection details
- **ghl_delete_product_collection** - Delete a collection

#### Product Reviews
- **ghl_list_product_reviews** - List product reviews
- **ghl_get_reviews_count** - Get review counts
- **ghl_update_product_review** - Update review details
- **ghl_delete_product_review** - Delete a review
- **ghl_bulk_update_product_reviews** - Update multiple reviews

#### Store Management Tools (15 tools)
- **ghl_create_shipping_zone** - Create shipping zone with countries/states
- **ghl_list_shipping_zones** - List all shipping zones
- **ghl_get_shipping_zone** - Get specific shipping zone
- **ghl_update_shipping_zone** - Update shipping zone
- **ghl_delete_shipping_zone** - Delete shipping zone
- **ghl_get_available_shipping_rates** - Get available rates for order

#### Shipping Rates
- **ghl_create_shipping_rate** - Create shipping rate for zone
- **ghl_list_shipping_rates** - List shipping rates
- **ghl_get_shipping_rate** - Get specific shipping rate
- **ghl_update_shipping_rate** - Update shipping rate
- **ghl_delete_shipping_rate** - Delete shipping rate

#### Shipping Carriers
- **ghl_create_shipping_carrier** - Create shipping carrier
- **ghl_list_shipping_carriers** - List shipping carriers
- **ghl_get_shipping_carrier** - Get specific carrier
- **ghl_update_shipping_carrier** - Update carrier details
- **ghl_delete_shipping_carrier** - Delete carrier

#### Store Settings
- **ghl_create_store_setting** - Create store settings
- **ghl_get_store_setting** - Get store settings

---

## 5. GHL Marketing MCP Server (`ghl-marketing-mcp`)

**Purpose**: Manages marketing content including blogs, media library, and social media.

### Tools Available:

#### Blog Management Tools (7 tools)
- **create_blog_post** - Create new blog post with full content
- **update_blog_post** - Update existing blog post
- **get_blog_posts** - Get blog posts from specific site
- **get_blog_sites** - Get all blog sites
- **get_blog_authors** - Get all blog authors
- **get_blog_categories** - Get all blog categories
- **check_url_slug** - Check URL slug availability

#### Media Library Tools (3 tools)
- **get_media_files** - Get files/folders from media library with filtering
- **upload_media_file** - Upload file to media library (max 25MB)
- **delete_media_file** - Delete specific file/folder from library

#### Social Media Management Tools (20+ tools)
- **search_social_posts** - Search and filter social media posts
- **create_social_post** - Create new social media post for multiple platforms
- **get_social_post** - Get details of specific social media post
- **update_social_post** - Update existing social media post
- **delete_social_post** - Delete a social media post
- **bulk_delete_social_posts** - Delete multiple posts (max 50)

#### Social Media Accounts
- **get_social_accounts** - Get all connected social media accounts
- **delete_social_account** - Delete social media account

#### Social Media Categories & Tags
- **get_social_categories** - Get all social media categories
- **get_social_category** - Get specific category
- **get_social_tags** - Get all social media tags
- **get_social_tags_by_ids** - Get tags by specific IDs

#### OAuth & Platform Integration
- **start_social_oauth** - Start OAuth flow for platform
- **get_platform_accounts** - Get accounts for specific platform
- **attach_oauth_account** - Attach OAuth account

#### CSV Management
- **upload_social_csv** - Upload CSV for bulk social posts
- **get_csv_upload_status** - Get CSV upload status
- **set_csv_accounts** - Set accounts for CSV posts
- **get_csv_posts** - Get posts from CSV
- **finalize_csv_posts** - Finalize CSV post creation
- **delete_csv_upload** - Delete CSV upload
- **delete_csv_post** - Delete specific CSV post

---

## 6. GHL Operations MCP Server (`ghl-operations-mcp`)

**Purpose**: Handles business operations including calendar management, location management, surveys, and workflows.

### Tools Available:

#### Calendar Management Tools (30+ tools)
- **get_calendar_groups** - Get all calendar groups
- **get_calendars** - Get all calendars with optional filtering
- **create_calendar** - Create new calendar
- **get_calendar** - Get detailed calendar information
- **update_calendar** - Update existing calendar
- **delete_calendar** - Delete a calendar

#### Calendar Events & Appointments
- **get_calendar_events** - Get events for specific calendar
- **get_free_slots** - Get available time slots
- **create_appointment** - Create new appointment
- **get_appointment** - Get specific appointment
- **update_appointment** - Update appointment details
- **delete_appointment** - Delete an appointment

#### Calendar Groups
- **create_calendar_group** - Create new calendar group
- **validate_group_slug** - Validate group slug availability
- **update_calendar_group** - Update calendar group
- **delete_calendar_group** - Delete calendar group
- **disable_calendar_group** - Disable calendar group

#### Block Slots Management
- **create_block_slot** - Create blocked time slot
- **update_block_slot** - Update blocked slot
- **get_blocked_slots** - Get all blocked slots

#### Appointment Notes
- **get_appointment_notes** - Get notes for appointment
- **create_appointment_note** - Create appointment note
- **update_appointment_note** - Update appointment note
- **delete_appointment_note** - Delete appointment note

#### Calendar Resources (Equipment & Rooms)
- **get_calendar_resources_equipments** - Get equipment resources
- **create_calendar_resource_equipment** - Create equipment resource
- **get_calendar_resource_equipment** - Get specific equipment
- **update_calendar_resource_equipment** - Update equipment
- **delete_calendar_resource_equipment** - Delete equipment
- **get_calendar_resources_rooms** - Get room resources
- **create_calendar_resource_room** - Create room resource
- **get_calendar_resource_room** - Get specific room
- **update_calendar_resource_room** - Update room
- **delete_calendar_resource_room** - Delete room

#### Calendar Notifications
- **get_calendar_notifications** - Get calendar notifications
- **create_calendar_notifications** - Create notifications
- **get_calendar_notification** - Get specific notification
- **update_calendar_notification** - Update notification
- **delete_calendar_notification** - Delete notification

#### Location Management Tools (25+ tools)
- **search_locations** - Search locations/sub-accounts with filtering
- **get_location** - Get detailed location information
- **create_location** - Create new sub-account/location
- **update_location** - Update existing location
- **delete_location** - Delete a location

#### Location Tags
- **get_location_tags** - Get all location tags
- **create_location_tag** - Create new location tag
- **get_location_tag** - Get specific location tag
- **update_location_tag** - Update location tag
- **delete_location_tag** - Delete location tag

#### Location Tasks
- **search_location_tasks** - Search tasks for location

#### Location Custom Fields
- **get_location_custom_fields** - Get custom fields for location
- **create_location_custom_field** - Create custom field
- **get_location_custom_field** - Get specific custom field
- **update_location_custom_field** - Update custom field
- **delete_location_custom_field** - Delete custom field

#### Location Custom Values
- **get_location_custom_values** - Get custom values
- **create_location_custom_value** - Create custom value
- **get_location_custom_value** - Get specific custom value
- **update_location_custom_value** - Update custom value
- **delete_location_custom_value** - Delete custom value

#### Location Templates & Utilities
- **get_location_templates** - Get location templates
- **delete_location_template** - Delete location template
- **get_timezones** - Get available timezones

#### Survey Management Tools (2 tools)
- **ghl_get_surveys** - Retrieve all surveys for location
- **ghl_get_survey_submissions** - Get survey submissions with filtering

#### Workflow Management Tools (1 tool)
- **ghl_get_workflows** - Retrieve all workflows for location

---

## 7. GHL Sales MCP Server (`ghl-sales-mcp`)

**Purpose**: Handles sales management including opportunities, invoices, and payment processing.

### Tools Available:

#### Opportunity Management Tools (10 tools)
- **search_opportunities** - Search opportunities with various filters
- **get_pipelines** - Get all sales pipelines
- **get_opportunity** - Get detailed opportunity information
- **create_opportunity** - Create new opportunity in CRM
- **update_opportunity_status** - Update opportunity status (won/lost/etc)
- **delete_opportunity** - Delete opportunity from CRM
- **update_opportunity** - Full update of opportunity details
- **upsert_opportunity** - Create or update opportunity (advanced)
- **add_opportunity_followers** - Add followers to opportunity
- **remove_opportunity_followers** - Remove followers from opportunity

#### Invoice Management Tools (25+ tools)

##### Invoice Templates
- **create_invoice_template** - Create new invoice template
- **list_invoice_templates** - List all invoice templates
- **get_invoice_template** - Get invoice template by ID
- **update_invoice_template** - Update existing template
- **delete_invoice_template** - Delete invoice template

##### Invoice Schedules
- **create_invoice_schedule** - Create new invoice schedule
- **list_invoice_schedules** - List all invoice schedules
- **get_invoice_schedule** - Get schedule by ID
- **update_invoice_schedule** - Update existing schedule
- **delete_invoice_schedule** - Delete invoice schedule
- **schedule_invoice_schedule** - Schedule invoice from template
- **auto_payment_schedule** - Set up auto payment for schedule
- **cancel_invoice_schedule** - Cancel invoice schedule

##### Invoice Operations
- **create_invoice** - Create new invoice
- **list_invoices** - List all invoices with filtering
- **get_invoice** - Get specific invoice by ID
- **update_invoice** - Update existing invoice
- **delete_invoice** - Delete invoice
- **void_invoice** - Void an invoice
- **send_invoice** - Send invoice to contact
- **record_payment** - Record payment for invoice
- **text2pay_invoice** - Send text-to-pay for invoice
- **generate_invoice_number** - Generate unique invoice number

##### Estimates
- **create_estimate** - Create new estimate
- **list_estimates** - List all estimates
- **get_estimate** - Get specific estimate
- **update_estimate** - Update existing estimate
- **delete_estimate** - Delete estimate
- **send_estimate** - Send estimate to contact
- **create_invoice_from_estimate** - Convert estimate to invoice
- **generate_estimate_number** - Generate unique estimate number

#### Payment Processing Tools (20+ tools)

##### Integration Providers
- **create_whitelabel_integration_provider** - Create white-label payment provider
- **list_whitelabel_integration_providers** - List integration providers

##### Orders Management
- **list_orders** - List orders with filtering and pagination
- **get_order_by_id** - Get specific order by ID
- **create_fulfillment** - Create order fulfillment
- **list_fulfillments** - List order fulfillments

##### Transactions & Subscriptions
- **list_transactions** - List payment transactions
- **list_subscriptions** - List active subscriptions

##### Coupons Management
- **list_coupons** - List all coupons
- **create_coupon** - Create new coupon
- **get_coupon** - Get specific coupon
- **update_coupon** - Update existing coupon
- **delete_coupon** - Delete coupon

##### Custom Payment Providers
- **create_custom_provider** - Create custom payment provider
- **list_custom_providers** - List custom providers
- **connect_custom_provider_config** - Connect custom provider config
- **disconnect_custom_provider_config** - Disconnect provider config
- **delete_custom_provider** - Delete custom payment provider

---

## Summary

This modular architecture provides:

- **Total Tools**: 200+ specialized tools across 7 servers
- **Improved Performance**: Each server handles specific functionality
- **Better Scalability**: Servers can be scaled independently
- **Enhanced Maintenance**: Easier to update and maintain specific functionality
- **Flexible Deployment**: Can deploy only needed servers for specific use cases

Each server can be deployed independently and configured with its own endpoints and authentication, providing a flexible and scalable solution for GoHighLevel API integration.

---

## 🔧 **Claude Desktop Configuration**

### **✅ VERIFIED WORKING SETUP**

To use these modular servers with Claude Desktop, use the following configuration in your `~/.claude_desktop_config.json`:

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
    "ghl-ecommerce": {
      "command": "npx",
      "args": ["mcp-remote", "https://ghl-ecommerce-mcp.fly.dev/sse"],
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

### **🚨 IMPORTANT NOTES**

- **Package**: Use `mcp-remote` (NOT `@modelcontextprotocol/client-sse` which doesn't exist)
- **Credentials**: Set your GoHighLevel API key and Location ID in the `env` section
- **URLs**: Update URLs to match your deployed server names on Fly.io
- **Testing**: Only `ghl-core` (ghl-dynamic-mcp.fly.dev) is currently deployed and verified working

### **📋 Deployment Status**

- **✅ ghl-core-mcp**: DEPLOYED & WORKING (https://ghl-dynamic-mcp.fly.dev)
- **⏳ ghl-communications-mcp**: Ready to deploy
- **⏳ ghl-sales-mcp**: Ready to deploy  
- **⏳ ghl-marketing-mcp**: Ready to deploy
- **⏳ ghl-operations-mcp**: Ready to deploy
- **⏳ ghl-ecommerce-mcp**: Ready to deploy
- **⏳ ghl-data-mcp**: Ready to deploy

### **🛠️ Troubleshooting**

If you encounter connection issues:

1. **Check logs**: `tail -f ~/Library/Logs/Claude/mcp-server-*.log`
2. **Verify deployment**: `curl https://your-server.fly.dev/health`
3. **Test initialize**: See `MCP-DEPLOYMENT-TROUBLESHOOTING.md` for detailed testing steps
4. **Reference working example**: Use ghl-dynamic-mcp.fly.dev as template

**For complete troubleshooting guide**: See `modular-split/MCP-DEPLOYMENT-TROUBLESHOOTING.md` 