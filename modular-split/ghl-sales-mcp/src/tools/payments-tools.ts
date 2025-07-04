import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  CreateWhiteLabelIntegrationProviderDto,
  ListIntegrationProvidersResponse,
  IntegrationProvider,
  ListOrdersResponse,
  Order,
  CreateFulfillmentDto,
  CreateFulfillmentResponse,
  ListFulfillmentResponse,
  ListTransactionsResponse,
  Transaction,
  ListSubscriptionsResponse,
  Subscription,
  ListCouponsResponse,
  CreateCouponParams,
  UpdateCouponParams,
  DeleteCouponParams,
  CreateCouponResponse,
  DeleteCouponResponse,
  Coupon,
  CreateCustomProviderDto,
  CustomProvider,
  ConnectCustomProviderConfigDto,
  DeleteCustomProviderConfigDto,
  DeleteCustomProviderResponse,
  DisconnectCustomProviderResponse
} from '../types/ghl-types.js';

export class PaymentsTools {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Format response for MCP protocol
   */
  private formatResponse(data: any): any {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }]
    };
  }

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return PaymentsTools.getToolDefinitionsStatic();
  }

  /**
   * Get all tool definitions for MCP server  
   */
  getToolDefinitions(): Tool[] {
    return PaymentsTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      // Integration Provider Tools
      {
        name: 'create_whitelabel_integration_provider',
        description: 'Create a white-label integration provider for payments',
        inputSchema: {
          type: 'object',
          properties: {
            altId: {
              type: 'string',
              description: 'Location ID or company ID based on altType'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
            },
            uniqueName: {
              type: 'string',
              description: 'A unique name for the integration provider (lowercase, hyphens only)'
            },
            title: {
              type: 'string',
              description: 'The title or name of the integration provider'
            },
            provider: {
              type: 'string',
              enum: ['authorize-net', 'nmi'],
              description: 'The type of payment provider'
            },
            description: {
              type: 'string',
              description: 'A brief description of the integration provider'
            },
            imageUrl: {
              type: 'string',
              description: 'The URL to an image representing the integration provider'
            }
          },
          required: ['altId', 'altType', 'uniqueName', 'title', 'provider', 'description', 'imageUrl']
        }
      },
      {
        name: 'list_whitelabel_integration_providers',
        description: 'List white-label integration providers with optional pagination',
        inputSchema: {
          type: 'object',
          properties: {
            altId: {
              type: 'string',
              description: 'Location ID or company ID based on altType'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of items to return',
              default: 0
            },
            offset: {
              type: 'number',
              description: 'Starting index for pagination',
              default: 0
            }
          },
          required: ['altId', 'altType']
        }
      },

      // Order Tools
      {
        name: 'list_orders',
        description: 'List orders with optional filtering and pagination',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID (sub-account ID)'
            },
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            },
            status: {
              type: 'string',
              description: 'Order status filter'
            },
            paymentMode: {
              type: 'string',
              description: 'Mode of payment (live/test)'
            },
            startAt: {
              type: 'string',
              description: 'Starting date interval for orders (YYYY-MM-DD)'
            },
            endAt: {
              type: 'string',
              description: 'Ending date interval for orders (YYYY-MM-DD)'
            },
            search: {
              type: 'string',
              description: 'Search term for order name'
            },
            contactId: {
              type: 'string',
              description: 'Contact ID for filtering orders'
            },
            funnelProductIds: {
              type: 'string',
              description: 'Comma-separated funnel product IDs'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of items per page',
              default: 10
            },
            offset: {
              type: 'number',
              description: 'Starting index for pagination',
              default: 0
            }
          },
          required: []
        }
      },
      {
        name: 'get_order_by_id',
        description: 'Get a specific order by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'ID of the order to retrieve'
            },
            locationId: {
              type: 'string',
              description: 'Location ID (sub-account ID)'
            },
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            }
          },
          required: ['orderId']
        }
      },

      // Order Fulfillment Tools
      {
        name: 'create_order_fulfillment',
        description: 'Create a fulfillment for an order',
        inputSchema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'ID of the order to fulfill'
            },
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            },
            trackings: {
              type: 'array',
              description: 'Fulfillment tracking information',
              items: {
                type: 'object',
                properties: {
                  trackingNumber: {
                    type: 'string',
                    description: 'Tracking number from shipping carrier'
                  },
                  shippingCarrier: {
                    type: 'string',
                    description: 'Shipping carrier name'
                  },
                  trackingUrl: {
                    type: 'string',
                    description: 'Tracking URL'
                  }
                }
              }
            },
            items: {
              type: 'array',
              description: 'Items being fulfilled',
              items: {
                type: 'object',
                properties: {
                  priceId: {
                    type: 'string',
                    description: 'The ID of the product price'
                  },
                  qty: {
                    type: 'number',
                    description: 'Quantity of the item'
                  }
                },
                required: ['priceId', 'qty']
              }
            },
            notifyCustomer: {
              type: 'boolean',
              description: 'Whether to notify the customer'
            }
          },
          required: ['orderId', 'trackings', 'items', 'notifyCustomer']
        }
      },
      {
        name: 'list_order_fulfillments',
        description: 'List all fulfillments for an order',
        inputSchema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'ID of the order'
            },
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            }
          },
          required: ['orderId']
        }
      },

      // Transaction Tools
      {
        name: 'list_transactions',
        description: 'List transactions with optional filtering and pagination',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID (sub-account ID)'
            },
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            },
            paymentMode: {
              type: 'string',
              description: 'Mode of payment (live/test)'
            },
            startAt: {
              type: 'string',
              description: 'Starting date interval for transactions (YYYY-MM-DD)'
            },
            endAt: {
              type: 'string',
              description: 'Ending date interval for transactions (YYYY-MM-DD)'
            },
            entitySourceType: {
              type: 'string',
              description: 'Source of the transactions'
            },
            entitySourceSubType: {
              type: 'string',
              description: 'Source sub-type of the transactions'
            },
            search: {
              type: 'string',
              description: 'Search term for transaction name'
            },
            subscriptionId: {
              type: 'string',
              description: 'Subscription ID for filtering transactions'
            },
            entityId: {
              type: 'string',
              description: 'Entity ID for filtering transactions'
            },
            contactId: {
              type: 'string',
              description: 'Contact ID for filtering transactions'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of items per page',
              default: 10
            },
            offset: {
              type: 'number',
              description: 'Starting index for pagination',
              default: 0
            }
          },
          required: []
        }
      },
      {
        name: 'get_transaction_by_id',
        description: 'Get a specific transaction by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            transactionId: {
              type: 'string',
              description: 'ID of the transaction to retrieve'
            },
            locationId: {
              type: 'string',
              description: 'Location ID (sub-account ID)'
            },
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            }
          },
          required: ['transactionId']
        }
      },

      // Subscription Tools
      {
        name: 'list_subscriptions',
        description: 'List subscriptions with optional filtering and pagination',
        inputSchema: {
          type: 'object',
          properties: {
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            },
            entityId: {
              type: 'string',
              description: 'Entity ID for filtering subscriptions'
            },
            paymentMode: {
              type: 'string',
              description: 'Mode of payment (live/test)'
            },
            startAt: {
              type: 'string',
              description: 'Starting date interval for subscriptions (YYYY-MM-DD)'
            },
            endAt: {
              type: 'string',
              description: 'Ending date interval for subscriptions (YYYY-MM-DD)'
            },
            entitySourceType: {
              type: 'string',
              description: 'Source of the subscriptions'
            },
            search: {
              type: 'string',
              description: 'Search term for subscription name'
            },
            contactId: {
              type: 'string',
              description: 'Contact ID for the subscription'
            },
            id: {
              type: 'string',
              description: 'Subscription ID for filtering'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of items per page',
              default: 10
            },
            offset: {
              type: 'number',
              description: 'Starting index for pagination',
              default: 0
            }
          },
          required: []
        }
      },
      {
        name: 'get_subscription_by_id',
        description: 'Get a specific subscription by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            subscriptionId: {
              type: 'string',
              description: 'ID of the subscription to retrieve'
            },
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            }
          },
          required: ['subscriptionId']
        }
      },

      // Coupon Tools
      {
        name: 'list_coupons',
        description: 'List all coupons for a location with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of coupons to return',
              default: 100
            },
            offset: {
              type: 'number',
              description: 'Number of coupons to skip for pagination',
              default: 0
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'active', 'expired'],
              description: 'Filter coupons by status'
            },
            search: {
              type: 'string',
              description: 'Search term to filter coupons by name or code'
            }
          },
          required: []
        }
      },
      {
        name: 'create_coupon',
        description: 'Create a new promotional coupon',
        inputSchema: {
          type: 'object',
          properties: {
            altId: {
              type: 'string',
              description: 'Location ID (automatically populated from MCP headers if not provided)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Type of identifier (defaults to "location")',
              default: 'location'
            },
            name: {
              type: 'string',
              description: 'Coupon name'
            },
            code: {
              type: 'string',
              description: 'Coupon code'
            },
            discountType: {
              type: 'string',
              enum: ['percentage', 'amount'],
              description: 'Type of discount'
            },
            discountValue: {
              type: 'number',
              description: 'Discount value'
            },
            startDate: {
              type: 'string',
              description: 'Start date in YYYY-MM-DDTHH:mm:ssZ format'
            },
            endDate: {
              type: 'string',
              description: 'End date in YYYY-MM-DDTHH:mm:ssZ format'
            },
            usageLimit: {
              type: 'number',
              description: 'Maximum number of times coupon can be used'
            },
            productIds: {
              type: 'array',
              description: 'Product IDs that the coupon applies to',
              items: {
                type: 'string'
              }
            },
            applyToFuturePayments: {
              type: 'boolean',
              description: 'Whether coupon applies to future subscription payments',
              default: true
            },
            applyToFuturePaymentsConfig: {
              type: 'object',
              description: 'Configuration for future payments application',
              properties: {
                type: {
                  type: 'string',
                  enum: ['forever', 'fixed'],
                  description: 'Type of future payments config'
                },
                duration: {
                  type: 'number',
                  description: 'Duration for fixed type'
                },
                durationType: {
                  type: 'string',
                  enum: ['months'],
                  description: 'Duration type'
                }
              },
              required: ['type']
            },
            limitPerCustomer: {
              type: 'boolean',
              description: 'Whether to limit coupon to once per customer',
              default: false
            }
          },
          required: ['altId', 'altType', 'name', 'code', 'discountType', 'discountValue', 'startDate']
        }
      },
      {
        name: 'update_coupon',
        description: 'Update an existing coupon',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Coupon ID'
            },
            altId: {
              type: 'string',
              description: 'Location ID'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
            },
            name: {
              type: 'string',
              description: 'Coupon name'
            },
            code: {
              type: 'string',
              description: 'Coupon code'
            },
            discountType: {
              type: 'string',
              enum: ['percentage', 'amount'],
              description: 'Type of discount'
            },
            discountValue: {
              type: 'number',
              description: 'Discount value'
            },
            startDate: {
              type: 'string',
              description: 'Start date in YYYY-MM-DDTHH:mm:ssZ format'
            },
            endDate: {
              type: 'string',
              description: 'End date in YYYY-MM-DDTHH:mm:ssZ format'
            },
            usageLimit: {
              type: 'number',
              description: 'Maximum number of times coupon can be used'
            },
            productIds: {
              type: 'array',
              description: 'Product IDs that the coupon applies to',
              items: {
                type: 'string'
              }
            },
            applyToFuturePayments: {
              type: 'boolean',
              description: 'Whether coupon applies to future subscription payments'
            },
            applyToFuturePaymentsConfig: {
              type: 'object',
              description: 'Configuration for future payments application',
              properties: {
                type: {
                  type: 'string',
                  enum: ['forever', 'fixed'],
                  description: 'Type of future payments config'
                },
                duration: {
                  type: 'number',
                  description: 'Duration for fixed type'
                },
                durationType: {
                  type: 'string',
                  enum: ['months'],
                  description: 'Duration type'
                }
              },
              required: ['type']
            },
            limitPerCustomer: {
              type: 'boolean',
              description: 'Whether to limit coupon to once per customer'
            }
          },
          required: ['id', 'altId', 'altType', 'name', 'code', 'discountType', 'discountValue', 'startDate']
        }
      },
      {
        name: 'delete_coupon',
        description: 'Delete a coupon permanently',
        inputSchema: {
          type: 'object',
          properties: {
            altId: {
              type: 'string',
              description: 'Location ID'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
            },
            id: {
              type: 'string',
              description: 'Coupon ID'
            }
          },
          required: ['altId', 'altType', 'id']
        }
      },
      {
        name: 'get_coupon',
        description: 'Get coupon details by ID or code',
        inputSchema: {
          type: 'object',
          properties: {
            altId: {
              type: 'string',
              description: 'Location ID'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
            },
            id: {
              type: 'string',
              description: 'Coupon ID'
            },
            code: {
              type: 'string',
              description: 'Coupon code'
            }
          },
          required: ['altId', 'altType', 'id', 'code']
        }
      },

      // Custom Provider Tools
      {
        name: 'create_custom_provider_integration',
        description: 'Create a new custom payment provider integration',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID'
            },
            name: {
              type: 'string',
              description: 'Name of the custom provider'
            },
            description: {
              type: 'string',
              description: 'Description of the payment gateway'
            },
            paymentsUrl: {
              type: 'string',
              description: 'URL to load in iframe for payment session'
            },
            queryUrl: {
              type: 'string',
              description: 'URL for querying payment events'
            },
            imageUrl: {
              type: 'string',
              description: 'Public image URL for the payment gateway logo'
            }
          },
          required: ['locationId', 'name', 'description', 'paymentsUrl', 'queryUrl', 'imageUrl']
        }
      },
      {
        name: 'delete_custom_provider_integration',
        description: 'Delete an existing custom payment provider integration',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID'
            }
          },
          required: ['locationId']
        }
      },
      {
        name: 'get_custom_provider_config',
        description: 'Fetch existing payment config for a location',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID'
            }
          },
          required: ['locationId']
        }
      },
      {
        name: 'create_custom_provider_config',
        description: 'Create new payment config for a location',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID'
            },
            live: {
              type: 'object',
              description: 'Live payment configuration',
              properties: {
                apiKey: {
                  type: 'string',
                  description: 'API key for live payments'
                },
                publishableKey: {
                  type: 'string',
                  description: 'Publishable key for live payments'
                }
              },
              required: ['apiKey', 'publishableKey']
            },
            test: {
              type: 'object',
              description: 'Test payment configuration',
              properties: {
                apiKey: {
                  type: 'string',
                  description: 'API key for test payments'
                },
                publishableKey: {
                  type: 'string',
                  description: 'Publishable key for test payments'
                }
              },
              required: ['apiKey', 'publishableKey']
            }
          },
          required: ['locationId', 'live', 'test']
        }
      },
      {
        name: 'disconnect_custom_provider_config',
        description: 'Disconnect existing payment config for a location',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID'
            },
            liveMode: {
              type: 'boolean',
              description: 'Whether to disconnect live or test mode config'
            }
          },
          required: ['locationId', 'liveMode']
        }
      }
    ];
  }

  /**
   * Execute payment tool based on tool name
   */
  async executeTool(name: string, args: any): Promise<any> {
    try {
      // Auto-populate altId and altType if not provided
      const processedArgs = { ...args };
      
      // For any tool that uses altId/altType, default to location ID from client config
      if ('altId' in processedArgs || 'altType' in processedArgs || 
          ['list_orders', 'get_order_by_id', 'create_order_fulfillment', 'list_order_fulfillments',
           'list_transactions', 'get_transaction_by_id', 'list_subscriptions', 'get_subscription_by_id',
           'list_coupons', 'create_coupon', 'update_coupon', 'delete_coupon', 'get_coupon'].includes(name)) {
        if (!processedArgs.altId && this.ghlClient.getConfig().locationId) {
          processedArgs.altId = this.ghlClient.getConfig().locationId;
        }
        if (!processedArgs.altType) {
          processedArgs.altType = 'location';
        }
      }
      
      let result;
      switch (name) {
        // Integration Provider Handlers
        case 'create_whitelabel_integration_provider':
          result = await this.ghlClient.createWhiteLabelIntegrationProvider(processedArgs as CreateWhiteLabelIntegrationProviderDto);
          break;

        case 'list_whitelabel_integration_providers':
          result = await this.ghlClient.listWhiteLabelIntegrationProviders(processedArgs);
          break;

        // Order Handlers
        case 'list_orders':
          result = await this.ghlClient.listOrders(processedArgs);
          break;

        case 'get_order_by_id':
          result = await this.ghlClient.getOrderById(processedArgs.orderId, processedArgs);
          break;

        // Order Fulfillment Handlers
        case 'create_order_fulfillment':
          const { orderId, ...fulfillmentData } = processedArgs;
          result = await this.ghlClient.createOrderFulfillment(orderId, fulfillmentData as CreateFulfillmentDto);
          break;

        case 'list_order_fulfillments':
          result = await this.ghlClient.listOrderFulfillments(processedArgs.orderId, processedArgs);
          break;

        // Transaction Handlers
        case 'list_transactions':
          result = await this.ghlClient.listTransactions(processedArgs);
          break;

        case 'get_transaction_by_id':
          result = await this.ghlClient.getTransactionById(processedArgs.transactionId, processedArgs);
          break;

        // Subscription Handlers
        case 'list_subscriptions':
          result = await this.ghlClient.listSubscriptions(processedArgs);
          break;

        case 'get_subscription_by_id':
          result = await this.ghlClient.getSubscriptionById(processedArgs.subscriptionId, processedArgs);
          break;

        // Coupon Handlers
        case 'list_coupons':
          result = await this.ghlClient.listCoupons(processedArgs);
          break;

        case 'create_coupon':
          result = await this.ghlClient.createCoupon(processedArgs as CreateCouponParams);
          break;

        case 'update_coupon':
          result = await this.ghlClient.updateCoupon(processedArgs as UpdateCouponParams);
          break;

        case 'delete_coupon':
          result = await this.ghlClient.deleteCoupon(processedArgs as DeleteCouponParams);
          break;

        case 'get_coupon':
          result = await this.ghlClient.getCoupon(processedArgs);
          break;

        // Custom Provider Handlers
        case 'create_custom_provider_integration':
          const { locationId: createLocationId, ...createProviderData } = processedArgs;
          result = await this.ghlClient.createCustomProviderIntegration(createLocationId, createProviderData as CreateCustomProviderDto);
          break;

        case 'delete_custom_provider_integration':
          result = await this.ghlClient.deleteCustomProviderIntegration(processedArgs.locationId);
          break;

        case 'get_custom_provider_config':
          result = await this.ghlClient.getCustomProviderConfig(processedArgs.locationId);
          break;

        case 'create_custom_provider_config':
          const { locationId: configLocationId, ...configData } = processedArgs;
          result = await this.ghlClient.createCustomProviderConfig(configLocationId, configData as ConnectCustomProviderConfigDto);
          break;

        case 'disconnect_custom_provider_config':
          const { locationId: disconnectLocationId, ...disconnectData } = processedArgs;
          result = await this.ghlClient.disconnectCustomProviderConfig(disconnectLocationId, disconnectData as DeleteCustomProviderConfigDto);
          break;

        default:
          throw new Error(`Unknown payment tool: ${name}`);
      }
      
      return this.formatResponse(result);
    } catch (error) {
      return this.formatResponse({
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
} 