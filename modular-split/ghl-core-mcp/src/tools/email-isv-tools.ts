/**
 * GoHighLevel Email ISV (Verification) Tools
 * Implements email verification functionality for the MCP server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPVerifyEmailParams,
  GHLEmailVerificationResponse
} from '../types/ghl-types.js';

/**
 * Email ISV Tools class
 * Provides email verification capabilities
 */
export class EmailISVTools {
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
   * Get tool definitions for all Email ISV operations
   */
  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'verify_email',
        description: 'Verify email address deliverability and get risk assessment. Charges will be deducted from the specified location wallet.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'Location ID - charges will be deducted from this location wallet'
            },
            type: {
              type: 'string',
              enum: ['email', 'contact'],
              description: 'Verification type: "email" for direct email verification, "contact" for contact ID verification'
            },
            verify: {
              type: 'string',
              description: 'Email address to verify (if type=email) or contact ID (if type=contact)'
            }
          },
          required: ['locationId', 'type', 'verify']
        }
      }
    ];
  }

  /**
   * Execute email ISV tools
   */
  async executeTool(name: string, args: any): Promise<any> {
    try {
      let result: any;
      
      switch (name) {
        case 'verify_email':
          result = await this.verifyEmail(args as MCPVerifyEmailParams);
          break;

        default:
          throw new Error(`Unknown email ISV tool: ${name}`);
      }
      
      return this.formatResponse(result);
    } catch (error) {
      console.error(`Error executing email ISV tool ${name}:`, error);
      throw error;
    }
  }

  /**
   * Verify email address or contact
   */
  private async verifyEmail(params: MCPVerifyEmailParams): Promise<{
    success: boolean;
    verification: GHLEmailVerificationResponse;
    message: string;
  }> {
    try {
      const result = await this.ghlClient.verifyEmail(params.locationId, {
        type: params.type,
        verify: params.verify
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          verification: { verified: false, message: 'Verification failed', address: params.verify } as any,
          message: result.error?.message || 'Email verification failed'
        };
      }

      const verification = result.data;
      
      // Determine if this is a successful verification response
      const isVerified = 'result' in verification;
      let message: string;

      if (isVerified) {
        const verifiedResult = verification as any;
        message = `Email verification completed. Result: ${verifiedResult.result}, Risk: ${verifiedResult.risk}`;
        
        if (verifiedResult.reason && verifiedResult.reason.length > 0) {
          message += `, Reasons: ${verifiedResult.reason.join(', ')}`;
        }
        
        if (verifiedResult.leadconnectorRecomendation?.isEmailValid !== undefined) {
          message += `, Recommended: ${verifiedResult.leadconnectorRecomendation.isEmailValid ? 'Valid' : 'Invalid'}`;
        }
      } else {
        const notVerifiedResult = verification as any;
        message = `Email verification not processed: ${notVerifiedResult.message}`;
      }

      return {
        success: true,
        verification,
        message
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        verification: { verified: false, message: errorMessage, address: params.verify } as any,
        message: `Failed to verify email: ${errorMessage}`
      };
    }
  }
} 