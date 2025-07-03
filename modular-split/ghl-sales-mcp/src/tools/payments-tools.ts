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
  constructor(private client: GHLApiClient) {}

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
              description: 'Alt ID (unique identifier like location ID)'
            },
            altType: {
              type: 'string',
              description: 'Alt Type (type of identifier)'
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
          required: ['altId', 'altType']
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
              description: 'Alt ID (unique identifier like location ID)'
            },
            altType: {
              type: 'string',
              description: 'Alt Type (type of identifier)'
            }
          },
          required: ['orderId', 'altId', 'altType']
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
              description: 'Location ID or Agency ID'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
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
          required: ['orderId', 'altId', 'altType', 'trackings', 'items', 'notifyCustomer']
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
              description: 'Location ID or Agency ID'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
            }
          },
          required: ['orderId', 'altId', 'altType']
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
              description: 'Alt ID (unique identifier like location ID)'
            },
            altType: {
              type: 'string',
              description: 'Alt Type (type of identifier)'
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
          required: ['altId', 'altType']
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
              description: 'Alt ID (unique identifier like location ID)'
            },
            altType: {
              type: 'string',
              description: 'Alt Type (type of identifier)'
            }
          },
          required: ['transactionId', 'altId', 'altType']
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
              description: 'Alt ID (unique identifier like location ID)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
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
          required: ['altId', 'altType']
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
              description: 'Alt ID (unique identifier like location ID)'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
            }
          },
          required: ['subscriptionId', 'altId', 'altType']
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
              description: 'Location ID'
            },
            altType: {
              type: 'string',
              enum: ['location'],
              description: 'Alt Type'
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
          required: ['altId', 'altType']
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
   * Execute a tool by name with given arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    return this.handleToolCall(name, args);
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      // Integration Provider Handlers
      case 'create_whitelabel_integration_provider':
        return this.client.createWhiteLabelIntegrationProvider(args as CreateWhiteLabelIntegrationProviderDto);

      case 'list_whitelabel_integration_providers':
        return this.client.listWhiteLabelIntegrationProviders(args);

      // Order Handlers
      case 'list_orders':
        return this.client.listOrders(args);

      case 'get_order_by_id':
        return this.client.getOrderById(args.orderId, args);

      // Order Fulfillment Handlers
      case 'create_order_fulfillment':
        const { orderId, ...fulfillmentData } = args;
        return this.client.createOrderFulfillment(orderId, fulfillmentData as CreateFulfillmentDto);

      case 'list_order_fulfillments':
        return this.client.listOrderFulfillments(args.orderId, args);

      // Transaction Handlers
      case 'list_transactions':
        return this.client.listTransactions(args);

      case 'get_transaction_by_id':
        return this.client.getTransactionById(args.transactionId, args);

      // Subscription Handlers
      case 'list_subscriptions':
        return this.client.listSubscriptions(args);

      case 'get_subscription_by_id':
        return this.client.getSubscriptionById(args.subscriptionId, args);

      // Coupon Handlers
      case 'list_coupons':
        return this.client.listCoupons(args);

      case 'create_coupon':
        return this.client.createCoupon(args as CreateCouponParams);

      case 'update_coupon':
        return this.client.updateCoupon(args as UpdateCouponParams);

      case 'delete_coupon':
        return this.client.deleteCoupon(args as DeleteCouponParams);

      case 'get_coupon':
        return this.client.getCoupon(args);

      // Custom Provider Handlers
      case 'create_custom_provider_integration':
        const { locationId: createLocationId, ...createProviderData } = args;
        return this.client.createCustomProviderIntegration(createLocationId, createProviderData as CreateCustomProviderDto);

      case 'delete_custom_provider_integration':
        return this.client.deleteCustomProviderIntegration(args.locationId);

      case 'get_custom_provider_config':
        return this.client.getCustomProviderConfig(args.locationId);

      case 'create_custom_provider_config':
        const { locationId: configLocationId, ...configData } = args;
        return this.client.createCustomProviderConfig(configLocationId, configData as ConnectCustomProviderConfigDto);

      case 'disconnect_custom_provider_config':
        const { locationId: disconnectLocationId, ...disconnectData } = args;
        return this.client.disconnectCustomProviderConfig(disconnectLocationId, disconnectData as DeleteCustomProviderConfigDto);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
} 