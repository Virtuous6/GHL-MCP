/**
 * MCP Calendar Tools for GoHighLevel Integration
 * Exposes calendar and appointment management capabilities to Claude Desktop
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPGetCalendarsParams,
  MCPCreateCalendarParams,
  MCPUpdateCalendarParams,
  MCPGetCalendarEventsParams,
  MCPGetFreeSlotsParams,
  MCPCreateAppointmentParams,
  MCPUpdateAppointmentParams,
  MCPCreateBlockSlotParams,
  MCPUpdateBlockSlotParams,
  GHLCalendar,
  GHLGetCalendarsResponse,
  GHLGetCalendarGroupsResponse,
  GHLGetCalendarEventsResponse,
  GHLGetFreeSlotsResponse,
  GHLCalendarEvent,
  GHLBlockSlotResponse,
  MCPCreateCalendarGroupParams,
  MCPValidateGroupSlugParams,
  MCPUpdateCalendarGroupParams,
  MCPDeleteCalendarGroupParams,
  MCPDisableCalendarGroupParams,
  MCPGetAppointmentNotesParams,
  MCPCreateAppointmentNoteParams,
  MCPUpdateAppointmentNoteParams,
  MCPDeleteAppointmentNoteParams,
  MCPGetCalendarResourcesParams,
  MCPCreateCalendarResourceParams,
  MCPGetCalendarResourceParams,
  MCPUpdateCalendarResourceParams,
  MCPDeleteCalendarResourceParams,
  MCPGetCalendarNotificationsParams,
  MCPCreateCalendarNotificationParams,
  MCPGetCalendarNotificationParams,
  MCPUpdateCalendarNotificationParams,
  MCPDeleteCalendarNotificationParams,
  MCPGetBlockedSlotsParams
} from '../types/ghl-types.js';

/**
 * Calendar Tools Class
 * Implements MCP tools for calendar and appointment management
 */
export class CalendarTools {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Get static tool definitions without requiring API client
   */
  static getStaticToolDefinitions(): Tool[] {
    return CalendarTools.getToolDefinitionsStatic();
  }

  /**
   * Get all calendar tool definitions for MCP server
   */
  getToolDefinitions(): Tool[] {
    return CalendarTools.getToolDefinitionsStatic();
  }

  /**
   * Static method to get tool definitions
   */
  private static getToolDefinitionsStatic(): Tool[] {
    return [
      {
        name: 'get_calendar_groups',
        description: 'Get all calendar groups in the GoHighLevel location',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_calendars',
        description: 'Get all calendars in the GoHighLevel location with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            groupId: {
              type: 'string',
              description: 'Filter calendars by group ID'
            },
            showDrafted: {
              type: 'boolean',
              description: 'Include draft calendars (default: true)',
              default: true
            }
          }
        }
      },
      {
        name: 'create_calendar',
        description: 'Create a new calendar in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the calendar'
            },
            description: {
              type: 'string',
              description: 'Description of the calendar'
            },
            calendarType: {
              type: 'string',
              description: 'Type of calendar to create',
              enum: ['round_robin', 'event', 'class_booking', 'collective', 'service_booking', 'personal'],
              default: 'event'
            },
            groupId: {
              type: 'string',
              description: 'Calendar group ID to organize the calendar'
            },
            slotDuration: {
              type: 'number',
              description: 'Duration of appointment slots in minutes (default: 30)',
              default: 30
            },
            slotDurationUnit: {
              type: 'string',
              description: 'Unit for slot duration',
              enum: ['mins', 'hours'],
              default: 'mins'
            },
            autoConfirm: {
              type: 'boolean',
              description: 'Automatically confirm appointments (default: true)',
              default: true
            },
            allowReschedule: {
              type: 'boolean',
              description: 'Allow clients to reschedule appointments (default: true)',
              default: true
            },
            allowCancellation: {
              type: 'boolean',
              description: 'Allow clients to cancel appointments (default: true)',
              default: true
            },
            isActive: {
              type: 'boolean',
              description: 'Make calendar active immediately (default: true)',
              default: true
            }
          },
          required: ['name', 'calendarType']
        }
      },
      {
        name: 'get_calendar',
        description: 'Get detailed information about a specific calendar by ID',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'The unique ID of the calendar to retrieve'
            }
          },
          required: ['calendarId']
        }
      },
      {
        name: 'update_calendar',
        description: 'Update an existing calendar in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'The unique ID of the calendar to update'
            },
            name: {
              type: 'string',
              description: 'Updated name of the calendar'
            },
            description: {
              type: 'string',
              description: 'Updated description of the calendar'
            },
            slotDuration: {
              type: 'number',
              description: 'Updated duration of appointment slots in minutes'
            },
            autoConfirm: {
              type: 'boolean',
              description: 'Updated auto-confirm setting'
            },
            allowReschedule: {
              type: 'boolean',
              description: 'Updated reschedule permission setting'
            },
            allowCancellation: {
              type: 'boolean',
              description: 'Updated cancellation permission setting'
            },
            isActive: {
              type: 'boolean',
              description: 'Updated active status'
            }
          },
          required: ['calendarId']
        }
      },
      {
        name: 'delete_calendar',
        description: 'Delete a calendar from GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'The unique ID of the calendar to delete'
            }
          },
          required: ['calendarId']
        }
      },
      {
        name: 'get_calendar_events',
        description: 'Get appointments/events from calendars within a date range',
        inputSchema: {
          type: 'object',
          properties: {
            startTime: {
              type: 'string',
              description: 'Start time in milliseconds or ISO date (e.g., "2024-01-01" or "1704067200000")'
            },
            endTime: {
              type: 'string',
              description: 'End time in milliseconds or ISO date (e.g., "2024-01-31" or "1706745599999")'
            },
            calendarId: {
              type: 'string',
              description: 'Filter events by specific calendar ID'
            },
            userId: {
              type: 'string',
              description: 'Filter events by assigned user ID'
            },
            groupId: {
              type: 'string',
              description: 'Filter events by calendar group ID'
            }
          },
          required: ['startTime', 'endTime']
        }
      },
      {
        name: 'get_free_slots',
        description: 'Get available time slots for booking appointments on a specific calendar',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'The calendar ID to check availability for'
            },
            startDate: {
              type: 'string',
              description: 'Start date for availability check (YYYY-MM-DD format or milliseconds)'
            },
            endDate: {
              type: 'string',
              description: 'End date for availability check (YYYY-MM-DD format or milliseconds)'
            },
            timezone: {
              type: 'string',
              description: 'Timezone for the results (e.g., "America/New_York")'
            },
            userId: {
              type: 'string',
              description: 'Specific user ID to check availability for'
            }
          },
          required: ['calendarId', 'startDate', 'endDate']
        }
      },
      {
        name: 'create_appointment',
        description: 'Create a new appointment/booking in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'The calendar ID to book the appointment in'
            },
            contactId: {
              type: 'string',
              description: 'The contact ID for whom to book the appointment'
            },
            startTime: {
              type: 'string',
              description: 'Start time in ISO format (e.g., "2024-01-15T10:00:00-05:00")'
            },
            endTime: {
              type: 'string',
              description: 'End time in ISO format (optional, will be calculated from slot duration if not provided)'
            },
            title: {
              type: 'string',
              description: 'Title/subject of the appointment'
            },
            appointmentStatus: {
              type: 'string',
              description: 'Initial status of the appointment',
              enum: ['new', 'confirmed'],
              default: 'confirmed'
            },
            assignedUserId: {
              type: 'string',
              description: 'User ID to assign this appointment to'
            },
            address: {
              type: 'string',
              description: 'Meeting location or address'
            },
            meetingLocationType: {
              type: 'string',
              description: 'Type of meeting location',
              enum: ['custom', 'zoom', 'gmeet', 'phone', 'address'],
              default: 'custom'
            },
            ignoreDateRange: {
              type: 'boolean',
              description: 'Ignore minimum scheduling notice and date range restrictions',
              default: false
            },
            toNotify: {
              type: 'boolean',
              description: 'Send notifications for this appointment',
              default: true
            }
          },
          required: ['calendarId', 'contactId', 'startTime']
        }
      },
      {
        name: 'get_appointment',
        description: 'Get detailed information about a specific appointment by ID',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: {
              type: 'string',
              description: 'The unique ID of the appointment to retrieve'
            }
          },
          required: ['appointmentId']
        }
      },
      {
        name: 'update_appointment',
        description: 'Update an existing appointment in GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: {
              type: 'string',
              description: 'The unique ID of the appointment to update'
            },
            title: {
              type: 'string',
              description: 'Updated title/subject of the appointment'
            },
            appointmentStatus: {
              type: 'string',
              description: 'Updated status of the appointment',
              enum: ['new', 'confirmed', 'cancelled', 'showed', 'noshow']
            },
            assignedUserId: {
              type: 'string',
              description: 'Updated assigned user ID'
            },
            address: {
              type: 'string',
              description: 'Updated meeting location or address'
            },
            startTime: {
              type: 'string',
              description: 'Updated start time in ISO format'
            },
            endTime: {
              type: 'string',
              description: 'Updated end time in ISO format'
            },
            toNotify: {
              type: 'boolean',
              description: 'Send notifications for this update',
              default: true
            }
          },
          required: ['appointmentId']
        }
      },
      {
        name: 'delete_appointment',
        description: 'Cancel/delete an appointment from GoHighLevel',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: {
              type: 'string',
              description: 'The unique ID of the appointment to delete'
            }
          },
          required: ['appointmentId']
        }
      },
      {
        name: 'create_block_slot',
        description: 'Create a blocked time slot to prevent bookings during specific times',
        inputSchema: {
          type: 'object',
          properties: {
            startTime: {
              type: 'string',
              description: 'Start time of the block in ISO format (e.g., "2024-01-15T10:00:00-05:00")'
            },
            endTime: {
              type: 'string',
              description: 'End time of the block in ISO format (e.g., "2024-01-15T12:00:00-05:00")'
            },
            title: {
              type: 'string',
              description: 'Title/reason for the block (e.g., "Lunch Break", "Meeting")'
            },
            calendarId: {
              type: 'string',
              description: 'Specific calendar to block (optional, blocks all if not specified)'
            },
            assignedUserId: {
              type: 'string',
              description: 'User ID to apply the block for'
            }
          },
          required: ['startTime', 'endTime']
        }
      },
      {
        name: 'update_block_slot',
        description: 'Update an existing blocked time slot',
        inputSchema: {
          type: 'object',
          properties: {
            blockSlotId: {
              type: 'string',
              description: 'The unique ID of the block slot to update'
            },
            startTime: {
              type: 'string',
              description: 'Updated start time in ISO format'
            },
            endTime: {
              type: 'string',
              description: 'Updated end time in ISO format'
            },
            title: {
              type: 'string',
              description: 'Updated title/reason for the block'
            },
            calendarId: {
              type: 'string',
              description: 'Updated calendar ID for the block'
            },
            assignedUserId: {
              type: 'string',
              description: 'Updated assigned user ID'
            }
          },
          required: ['blockSlotId']
        }
      },
      {
        name: 'create_calendar_group',
        description: 'Create a new calendar group',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Group name' },
            description: { type: 'string', description: 'Group description' },
            slug: { type: 'string', description: 'URL slug for the group' },
            isActive: { type: 'boolean', description: 'Whether group is active', default: true }
          },
          required: ['name', 'description', 'slug']
        }
      },
      {
        name: 'validate_group_slug',
        description: 'Validate if a calendar group slug is available',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Slug to validate' },
            locationId: { type: 'string', description: 'Location ID' }
          },
          required: ['slug']
        }
      },
      {
        name: 'update_calendar_group',
        description: 'Update calendar group details',
        inputSchema: {
          type: 'object',
          properties: {
            groupId: { type: 'string', description: 'Calendar group ID' },
            name: { type: 'string', description: 'Group name' },
            description: { type: 'string', description: 'Group description' },
            slug: { type: 'string', description: 'URL slug for the group' }
          },
          required: ['groupId', 'name', 'description', 'slug']
        }
      },
      {
        name: 'delete_calendar_group',
        description: 'Delete a calendar group',
        inputSchema: {
          type: 'object',
          properties: {
            groupId: { type: 'string', description: 'Calendar group ID' }
          },
          required: ['groupId']
        }
      },
      {
        name: 'disable_calendar_group',
        description: 'Enable or disable a calendar group',
        inputSchema: {
          type: 'object',
          properties: {
            groupId: { type: 'string', description: 'Calendar group ID' },
            isActive: { type: 'boolean', description: 'Whether to enable (true) or disable (false) the group' }
          },
          required: ['groupId', 'isActive']
        }
      },
      {
        name: 'get_appointment_notes',
        description: 'Get notes for an appointment',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: { type: 'string', description: 'Appointment ID' },
            limit: { type: 'number', description: 'Maximum number of notes to return', default: 10 },
            offset: { type: 'number', description: 'Number of notes to skip', default: 0 }
          },
          required: ['appointmentId']
        }
      },
      {
        name: 'create_appointment_note',
        description: 'Create a note for an appointment',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: { type: 'string', description: 'Appointment ID' },
            body: { type: 'string', description: 'Note content' },
            userId: { type: 'string', description: 'User ID creating the note' }
          },
          required: ['appointmentId', 'body']
        }
      },
      {
        name: 'update_appointment_note',
        description: 'Update an appointment note',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: { type: 'string', description: 'Appointment ID' },
            noteId: { type: 'string', description: 'Note ID' },
            body: { type: 'string', description: 'Updated note content' },
            userId: { type: 'string', description: 'User ID updating the note' }
          },
          required: ['appointmentId', 'noteId', 'body']
        }
      },
      {
        name: 'delete_appointment_note',
        description: 'Delete an appointment note',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: { type: 'string', description: 'Appointment ID' },
            noteId: { type: 'string', description: 'Note ID' }
          },
          required: ['appointmentId', 'noteId']
        }
      },
      {
        name: 'get_calendar_resources_equipments',
        description: 'Get calendar equipment resources',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number to return', default: 20 },
            skip: { type: 'number', description: 'Number to skip', default: 0 }
          }
        }
      },
      {
        name: 'create_calendar_resource_equipment',
        description: 'Create a calendar equipment resource',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Equipment name' },
            description: { type: 'string', description: 'Equipment description' },
            quantity: { type: 'number', description: 'Total quantity available' },
            outOfService: { type: 'number', description: 'Number currently out of service' },
            capacity: { type: 'number', description: 'Capacity per unit' },
            calendarIds: { type: 'array', items: { type: 'string' }, description: 'Associated calendar IDs' }
          },
          required: ['name', 'description', 'quantity', 'outOfService', 'capacity', 'calendarIds']
        }
      },
      {
        name: 'get_calendar_resource_equipment',
        description: 'Get specific equipment resource details',
        inputSchema: {
          type: 'object',
          properties: {
            resourceId: { type: 'string', description: 'Equipment resource ID' }
          },
          required: ['resourceId']
        }
      },
      {
        name: 'update_calendar_resource_equipment',
        description: 'Update equipment resource details',
        inputSchema: {
          type: 'object',
          properties: {
            resourceId: { type: 'string', description: 'Equipment resource ID' },
            name: { type: 'string', description: 'Equipment name' },
            description: { type: 'string', description: 'Equipment description' },
            quantity: { type: 'number', description: 'Total quantity available' },
            outOfService: { type: 'number', description: 'Number currently out of service' },
            capacity: { type: 'number', description: 'Capacity per unit' },
            calendarIds: { type: 'array', items: { type: 'string' }, description: 'Associated calendar IDs' },
            isActive: { type: 'boolean', description: 'Whether resource is active' }
          },
          required: ['resourceId']
        }
      },
      {
        name: 'delete_calendar_resource_equipment',
        description: 'Delete an equipment resource',
        inputSchema: {
          type: 'object',
          properties: {
            resourceId: { type: 'string', description: 'Equipment resource ID' }
          },
          required: ['resourceId']
        }
      },
      {
        name: 'get_calendar_resources_rooms',
        description: 'Get calendar room resources',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number to return', default: 20 },
            skip: { type: 'number', description: 'Number to skip', default: 0 }
          }
        }
      },
      {
        name: 'create_calendar_resource_room',
        description: 'Create a calendar room resource',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Room name' },
            description: { type: 'string', description: 'Room description' },
            quantity: { type: 'number', description: 'Total quantity available' },
            outOfService: { type: 'number', description: 'Number currently out of service' },
            capacity: { type: 'number', description: 'Room capacity' },
            calendarIds: { type: 'array', items: { type: 'string' }, description: 'Associated calendar IDs' }
          },
          required: ['name', 'description', 'quantity', 'outOfService', 'capacity', 'calendarIds']
        }
      },
      {
        name: 'get_calendar_resource_room',
        description: 'Get specific room resource details',
        inputSchema: {
          type: 'object',
          properties: {
            resourceId: { type: 'string', description: 'Room resource ID' }
          },
          required: ['resourceId']
        }
      },
      {
        name: 'update_calendar_resource_room',
        description: 'Update room resource details',
        inputSchema: {
          type: 'object',
          properties: {
            resourceId: { type: 'string', description: 'Room resource ID' },
            name: { type: 'string', description: 'Room name' },
            description: { type: 'string', description: 'Room description' },
            quantity: { type: 'number', description: 'Total quantity available' },
            outOfService: { type: 'number', description: 'Number currently out of service' },
            capacity: { type: 'number', description: 'Room capacity' },
            calendarIds: { type: 'array', items: { type: 'string' }, description: 'Associated calendar IDs' },
            isActive: { type: 'boolean', description: 'Whether resource is active' }
          },
          required: ['resourceId']
        }
      },
      {
        name: 'delete_calendar_resource_room',
        description: 'Delete a room resource',
        inputSchema: {
          type: 'object',
          properties: {
            resourceId: { type: 'string', description: 'Room resource ID' }
          },
          required: ['resourceId']
        }
      },
      {
        name: 'get_calendar_notifications',
        description: 'Get calendar notifications',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: { type: 'string', description: 'Calendar ID' },
            isActive: { type: 'boolean', description: 'Filter by active status' },
            deleted: { type: 'boolean', description: 'Include deleted notifications' },
            limit: { type: 'number', description: 'Maximum number to return' },
            skip: { type: 'number', description: 'Number to skip' }
          },
          required: ['calendarId']
        }
      },
      {
        name: 'create_calendar_notifications',
        description: 'Create calendar notifications',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: { type: 'string', description: 'Calendar ID' },
            notifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  receiverType: { type: 'string', enum: ['contact', 'guest', 'assignedUser', 'emails'], description: 'Who receives the notification' },
                  channel: { type: 'string', enum: ['email', 'inApp'], description: 'Notification channel' },
                  notificationType: { type: 'string', enum: ['booked', 'confirmation', 'cancellation', 'reminder', 'followup', 'reschedule'], description: 'Type of notification' },
                  isActive: { type: 'boolean', description: 'Whether notification is active' },
                  templateId: { type: 'string', description: 'Template ID' },
                  body: { type: 'string', description: 'Notification body' },
                  subject: { type: 'string', description: 'Notification subject' }
                },
                required: ['receiverType', 'channel', 'notificationType']
              },
              description: 'Array of notification configurations'
            }
          },
          required: ['calendarId', 'notifications']
        }
      },
      {
        name: 'get_calendar_notification',
        description: 'Get specific calendar notification',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: { type: 'string', description: 'Calendar ID' },
            notificationId: { type: 'string', description: 'Notification ID' }
          },
          required: ['calendarId', 'notificationId']
        }
      },
      {
        name: 'update_calendar_notification',
        description: 'Update calendar notification',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: { type: 'string', description: 'Calendar ID' },
            notificationId: { type: 'string', description: 'Notification ID' },
            receiverType: { type: 'string', enum: ['contact', 'guest', 'assignedUser', 'emails'], description: 'Who receives the notification' },
            channel: { type: 'string', enum: ['email', 'inApp'], description: 'Notification channel' },
            notificationType: { type: 'string', enum: ['booked', 'confirmation', 'cancellation', 'reminder', 'followup', 'reschedule'], description: 'Type of notification' },
            isActive: { type: 'boolean', description: 'Whether notification is active' },
            deleted: { type: 'boolean', description: 'Whether notification is deleted' },
            templateId: { type: 'string', description: 'Template ID' },
            body: { type: 'string', description: 'Notification body' },
            subject: { type: 'string', description: 'Notification subject' }
          },
          required: ['calendarId', 'notificationId']
        }
      },
      {
        name: 'delete_calendar_notification',
        description: 'Delete calendar notification',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: { type: 'string', description: 'Calendar ID' },
            notificationId: { type: 'string', description: 'Notification ID' }
          },
          required: ['calendarId', 'notificationId']
        }
      },
      {
        name: 'get_blocked_slots',
        description: 'Get blocked time slots for a location',
        inputSchema: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Filter by user ID' },
            calendarId: { type: 'string', description: 'Filter by calendar ID' },
            groupId: { type: 'string', description: 'Filter by group ID' },
            startTime: { type: 'string', description: 'Start time for the query range' },
            endTime: { type: 'string', description: 'End time for the query range' }
          },
          required: ['startTime', 'endTime']
        }
      }
    ];
  }

  /**
   * Execute calendar tool based on tool name and arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_calendar_groups':
        return this.getCalendarGroups();
      
      case 'get_calendars':
        return this.getCalendars(args as MCPGetCalendarsParams);
      
      case 'create_calendar':
        return this.createCalendar(args as MCPCreateCalendarParams);
      
      case 'get_calendar':
        return this.getCalendar(args.calendarId);
      
      case 'update_calendar':
        return this.updateCalendar(args as MCPUpdateCalendarParams);
      
      case 'delete_calendar':
        return this.deleteCalendar(args.calendarId);
      
      case 'get_calendar_events':
        return this.getCalendarEvents(args as MCPGetCalendarEventsParams);
      
      case 'get_free_slots':
        return this.getFreeSlots(args as MCPGetFreeSlotsParams);
      
      case 'create_appointment':
        return this.createAppointment(args as MCPCreateAppointmentParams);
      
      case 'get_appointment':
        return this.getAppointment(args.appointmentId);
      
      case 'update_appointment':
        return this.updateAppointment(args as MCPUpdateAppointmentParams);
      
      case 'delete_appointment':
        return this.deleteAppointment(args.appointmentId);
      
      case 'create_block_slot':
        return this.createBlockSlot(args as MCPCreateBlockSlotParams);
      
      case 'update_block_slot':
        return this.updateBlockSlot(args as MCPUpdateBlockSlotParams);
      
      case 'create_calendar_group':
        return this.createCalendarGroup(args as MCPCreateCalendarGroupParams);
      
      case 'validate_group_slug':
        return this.validateGroupSlug(args as MCPValidateGroupSlugParams);
      
      case 'update_calendar_group':
        return this.updateCalendarGroup(args as MCPUpdateCalendarGroupParams);
      
      case 'delete_calendar_group':
        return this.deleteCalendarGroup(args as MCPDeleteCalendarGroupParams);
      
      case 'disable_calendar_group':
        return this.disableCalendarGroup(args as MCPDisableCalendarGroupParams);
      
      case 'get_appointment_notes':
        return this.getAppointmentNotes(args as MCPGetAppointmentNotesParams);
      
      case 'create_appointment_note':
        return this.createAppointmentNote(args as MCPCreateAppointmentNoteParams);
      
      case 'update_appointment_note':
        return this.updateAppointmentNote(args as MCPUpdateAppointmentNoteParams);
      
      case 'delete_appointment_note':
        return this.deleteAppointmentNote(args as MCPDeleteAppointmentNoteParams);
      
      case 'get_calendar_resources_equipments':
        return this.getCalendarResourcesEquipments(args as MCPGetCalendarResourcesParams);
      
      case 'create_calendar_resource_equipment':
        return this.createCalendarResourceEquipment(args as MCPCreateCalendarResourceParams);
      
      case 'get_calendar_resource_equipment':
        return this.getCalendarResourceEquipment(args as MCPGetCalendarResourceParams);
      
      case 'update_calendar_resource_equipment':
        return this.updateCalendarResourceEquipment(args as MCPUpdateCalendarResourceParams);
      
      case 'delete_calendar_resource_equipment':
        return this.deleteCalendarResourceEquipment(args as MCPDeleteCalendarResourceParams);
      
      case 'get_calendar_resources_rooms':
        return this.getCalendarResourcesRooms(args as MCPGetCalendarResourcesParams);
      
      case 'create_calendar_resource_room':
        return this.createCalendarResourceRoom(args as MCPCreateCalendarResourceParams);
      
      case 'get_calendar_resource_room':
        return this.getCalendarResourceRoom(args as MCPGetCalendarResourceParams);
      
      case 'update_calendar_resource_room':
        return this.updateCalendarResourceRoom(args as MCPUpdateCalendarResourceParams);
      
      case 'delete_calendar_resource_room':
        return this.deleteCalendarResourceRoom(args as MCPDeleteCalendarResourceParams);
      
      case 'get_calendar_notifications':
        return this.getCalendarNotifications(args as MCPGetCalendarNotificationsParams);
      
      case 'create_calendar_notifications':
        return this.createCalendarNotifications(args as MCPCreateCalendarNotificationParams);
      
      case 'get_calendar_notification':
        return this.getCalendarNotification(args as MCPGetCalendarNotificationParams);
      
      case 'update_calendar_notification':
        return this.updateCalendarNotification(args as MCPUpdateCalendarNotificationParams);
      
      case 'delete_calendar_notification':
        return this.deleteCalendarNotification(args as MCPDeleteCalendarNotificationParams);
      
      case 'get_blocked_slots':
        return this.getBlockedSlots(args as MCPGetBlockedSlotsParams);
      
      default:
        throw new Error(`Unknown calendar tool: ${name}`);
    }
  }

  /**
   * GET CALENDAR GROUPS
   */
  private async getCalendarGroups(): Promise<{ success: boolean; groups: any[]; message: string }> {
    try {
      const response = await this.ghlClient.getCalendarGroups();
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const data = response.data as GHLGetCalendarGroupsResponse;
      const groups = Array.isArray(data.groups) ? data.groups : [];
      
      return {
        success: true,
        groups,
        message: `Retrieved ${groups.length} calendar groups`
      };
    } catch (error) {
      process.stderr.write(`[GHL MCP] Get calendar groups error: ${JSON.stringify(error, null, 2)}\n`);
      throw new Error(`Failed to get calendar groups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDARS
   */
  private async getCalendars(params: MCPGetCalendarsParams = {}): Promise<{ success: boolean; calendars: GHLCalendar[]; message: string }> {
    try {
      const response = await this.ghlClient.getCalendars(params);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const data = response.data as GHLGetCalendarsResponse;
      const calendars = Array.isArray(data.calendars) ? data.calendars : [];
      
      return {
        success: true,
        calendars,
        message: `Retrieved ${calendars.length} calendars`
      };
    } catch (error) {
      throw new Error(`Failed to get calendars: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE CALENDAR
   */
  private async createCalendar(params: MCPCreateCalendarParams): Promise<{ success: boolean; calendar: GHLCalendar; message: string }> {
    try {
      const calendarData = {
        locationId: this.ghlClient.getConfig().locationId,
        name: params.name,
        description: params.description,
        calendarType: params.calendarType,
        groupId: params.groupId,
        teamMembers: params.teamMembers,
        slotDuration: params.slotDuration || 30,
        slotDurationUnit: params.slotDurationUnit || 'mins',
        autoConfirm: params.autoConfirm !== undefined ? params.autoConfirm : true,
        allowReschedule: params.allowReschedule !== undefined ? params.allowReschedule : true,
        allowCancellation: params.allowCancellation !== undefined ? params.allowCancellation : true,
        isActive: params.isActive !== undefined ? params.isActive : true
      };

      const response = await this.ghlClient.createCalendar(calendarData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        calendar: response.data.calendar,
        message: `Calendar created successfully with ID: ${response.data.calendar.id}`
      };
    } catch (error) {
      throw new Error(`Failed to create calendar: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR BY ID
   */
  private async getCalendar(calendarId: string): Promise<{ success: boolean; calendar: GHLCalendar; message: string }> {
    try {
      const response = await this.ghlClient.getCalendar(calendarId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        calendar: response.data.calendar,
        message: 'Calendar retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get calendar: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE CALENDAR
   */
  private async updateCalendar(params: MCPUpdateCalendarParams): Promise<{ success: boolean; calendar: GHLCalendar; message: string }> {
    try {
      const { calendarId, ...updateData } = params;
      
      const response = await this.ghlClient.updateCalendar(calendarId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        calendar: response.data.calendar,
        message: 'Calendar updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update calendar: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE CALENDAR
   */
  private async deleteCalendar(calendarId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteCalendar(calendarId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Calendar deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete calendar: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR EVENTS
   */
  private async getCalendarEvents(params: MCPGetCalendarEventsParams): Promise<{ success: boolean; events: GHLCalendarEvent[]; message: string }> {
    try {
      // Convert date strings to milliseconds if needed
      const startTime = this.convertToMilliseconds(params.startTime);
      const endTime = this.convertToMilliseconds(params.endTime);

      const eventParams = {
        locationId: this.ghlClient.getConfig().locationId,
        startTime,
        endTime,
        userId: params.userId,
        calendarId: params.calendarId,
        groupId: params.groupId
      };

      const response = await this.ghlClient.getCalendarEvents(eventParams);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const data = response.data as GHLGetCalendarEventsResponse;
      const events = Array.isArray(data.events) ? data.events : [];
      
      return {
        success: true,
        events,
        message: `Retrieved ${events.length} calendar events`
      };
    } catch (error) {
      throw new Error(`Failed to get calendar events: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET FREE SLOTS
   */
  private async getFreeSlots(params: MCPGetFreeSlotsParams): Promise<{ success: boolean; freeSlots: any; message: string }> {
    try {
      // Convert dates to milliseconds if needed
      const startDate = this.convertDateToMilliseconds(params.startDate);
      const endDate = this.convertDateToMilliseconds(params.endDate);

      const slotParams = {
        calendarId: params.calendarId,
        startDate,
        endDate,
        timezone: params.timezone,
        userId: params.userId
      };

      const response = await this.ghlClient.getFreeSlots(slotParams);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        freeSlots: response.data,
        message: 'Free slots retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get free slots: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE APPOINTMENT
   */
  private async createAppointment(params: MCPCreateAppointmentParams): Promise<{ success: boolean; appointment: GHLCalendarEvent; message: string }> {
    try {
      const appointmentData = {
        calendarId: params.calendarId,
        locationId: this.ghlClient.getConfig().locationId,
        contactId: params.contactId,
        startTime: params.startTime,
        endTime: params.endTime,
        title: params.title,
        appointmentStatus: params.appointmentStatus || 'confirmed',
        assignedUserId: params.assignedUserId,
        address: params.address,
        meetingLocationType: params.meetingLocationType,
        ignoreDateRange: params.ignoreDateRange,
        toNotify: params.toNotify !== undefined ? params.toNotify : true
      };

      const response = await this.ghlClient.createAppointment(appointmentData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        appointment: response.data,
        message: `Appointment created successfully with ID: ${response.data.id}`
      };
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET APPOINTMENT BY ID
   */
  private async getAppointment(appointmentId: string): Promise<{ success: boolean; appointment: GHLCalendarEvent; message: string }> {
    try {
      const response = await this.ghlClient.getAppointment(appointmentId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        appointment: response.data.event,
        message: 'Appointment retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get appointment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE APPOINTMENT
   */
  private async updateAppointment(params: MCPUpdateAppointmentParams): Promise<{ success: boolean; appointment: GHLCalendarEvent; message: string }> {
    try {
      const { appointmentId, ...updateData } = params;
      
      const response = await this.ghlClient.updateAppointment(appointmentId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        appointment: response.data,
        message: 'Appointment updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update appointment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE APPOINTMENT
   */
  private async deleteAppointment(appointmentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteAppointment(appointmentId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Appointment deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete appointment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE BLOCK SLOT
   */
  private async createBlockSlot(params: MCPCreateBlockSlotParams): Promise<{ success: boolean; blockSlot: GHLBlockSlotResponse; message: string }> {
    try {
      const blockSlotData = {
        locationId: this.ghlClient.getConfig().locationId,
        startTime: params.startTime,
        endTime: params.endTime,
        title: params.title,
        calendarId: params.calendarId,
        assignedUserId: params.assignedUserId
      };

      const response = await this.ghlClient.createBlockSlot(blockSlotData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        blockSlot: response.data,
        message: `Block slot created successfully with ID: ${response.data.id}`
      };
    } catch (error) {
      throw new Error(`Failed to create block slot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE BLOCK SLOT
   */
  private async updateBlockSlot(params: MCPUpdateBlockSlotParams): Promise<{ success: boolean; blockSlot: GHLBlockSlotResponse; message: string }> {
    try {
      const { blockSlotId, ...updateData } = params;
      
      const response = await this.ghlClient.updateBlockSlot(blockSlotId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        blockSlot: response.data,
        message: 'Block slot updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update block slot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Helper method to convert date string to milliseconds
   */
  private convertToMilliseconds(dateString: string): string {
    // If already in milliseconds, return as is
    if (/^\d+$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse as ISO date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.getTime().toString();
    }
    
    // Return as is if can't parse
    return dateString;
  }

  /**
   * Helper method to convert date string to milliseconds for date-only values
   */
  private convertDateToMilliseconds(dateString: string): number {
    // If already in milliseconds, parse and return
    if (/^\d+$/.test(dateString)) {
      return parseInt(dateString, 10);
    }
    
    // Try to parse as date string (YYYY-MM-DD format)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
    
    // Fallback to current time
    return Date.now();
  }

  /**
   * CREATE CALENDAR GROUP
   */
  private async createCalendarGroup(params: MCPCreateCalendarGroupParams): Promise<{ success: boolean; group: any; message: string }> {
    try {
      const groupData = {
        locationId: this.ghlClient.getConfig().locationId,
        name: params.name,
        description: params.description,
        slug: params.slug
      };

      const response = await this.ghlClient.createCalendarGroup(groupData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        group: response.data,
        message: `Calendar group created successfully with slug: ${params.slug}`
      };
    } catch (error) {
      throw new Error(`Failed to create calendar group: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * VALIDATE GROUP SLUG
   */
  private async validateGroupSlug(params: MCPValidateGroupSlugParams): Promise<{ success: boolean; available?: boolean; message: string }> {
    try {
      const locationId = params.locationId || this.ghlClient.getConfig().locationId;
      const response = await this.ghlClient.validateCalendarGroupSlug(params.slug, locationId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        available: response.data.available,
        message: response.data.available ? 'Slug is available' : 'Slug is not available'
      };
    } catch (error) {
      throw new Error(`Failed to validate group slug: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE CALENDAR GROUP
   */
  private async updateCalendarGroup(params: MCPUpdateCalendarGroupParams): Promise<{ success: boolean; group: any; message: string }> {
    try {
      const { groupId, ...updateData } = params;
      const response = await this.ghlClient.updateCalendarGroup(groupId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        group: response.data,
        message: 'Calendar group updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update calendar group: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE CALENDAR GROUP
   */
  private async deleteCalendarGroup(params: MCPDeleteCalendarGroupParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteCalendarGroup(params.groupId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Calendar group deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete calendar group: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DISABLE CALENDAR GROUP
   */
  private async disableCalendarGroup(params: MCPDisableCalendarGroupParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.disableCalendarGroup(params.groupId, params.isActive);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: `Calendar group ${params.isActive ? 'enabled' : 'disabled'} successfully`
      };
    } catch (error) {
      throw new Error(`Failed to disable calendar group: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET APPOINTMENT NOTES
   */
  private async getAppointmentNotes(params: MCPGetAppointmentNotesParams): Promise<{ success: boolean; notes: any[]; message: string }> {
    try {
      const response = await this.ghlClient.getAppointmentNotes(params.appointmentId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const notes = Array.isArray(response.data.notes) ? response.data.notes : [];
      
      return {
        success: true,
        notes,
        message: `Retrieved ${notes.length} appointment notes`
      };
    } catch (error) {
      throw new Error(`Failed to get appointment notes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE APPOINTMENT NOTE
   */
  private async createAppointmentNote(params: MCPCreateAppointmentNoteParams): Promise<{ success: boolean; note: any; message: string }> {
    try {
      const { appointmentId, ...noteData } = params;
      const response = await this.ghlClient.createAppointmentNote(appointmentId, noteData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        note: response.data,
        message: 'Appointment note created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create appointment note: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE APPOINTMENT NOTE
   */
  private async updateAppointmentNote(params: MCPUpdateAppointmentNoteParams): Promise<{ success: boolean; note: any; message: string }> {
    try {
      const { appointmentId, noteId, ...updateData } = params;
      const response = await this.ghlClient.updateAppointmentNote(appointmentId, noteId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        note: response.data,
        message: 'Appointment note updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update appointment note: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE APPOINTMENT NOTE
   */
  private async deleteAppointmentNote(params: MCPDeleteAppointmentNoteParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteAppointmentNote(params.appointmentId, params.noteId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Appointment note deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete appointment note: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR RESOURCES - EQUIPMENTS
   */
  private async getCalendarResourcesEquipments(params: MCPGetCalendarResourcesParams): Promise<{ success: boolean; resources: any[]; message: string }> {
    try {
      const locationId = params.locationId || this.ghlClient.getConfig().locationId;
      const response = await this.ghlClient.getCalendarResources('equipments', params.limit, params.skip, locationId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const resources = Array.isArray(response.data) ? response.data : [];
      
      return {
        success: true,
        resources,
        message: `Retrieved ${resources.length} equipment resources`
      };
    } catch (error) {
      throw new Error(`Failed to get equipment resources: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE CALENDAR RESOURCE - EQUIPMENT
   */
  private async createCalendarResourceEquipment(params: MCPCreateCalendarResourceParams): Promise<{ success: boolean; resource: any; message: string }> {
    try {
      const resourceData = {
        ...params,
        locationId: params.locationId || this.ghlClient.getConfig().locationId
      };
      const response = await this.ghlClient.createCalendarResource('equipments', resourceData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        resource: response.data,
        message: 'Equipment resource created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create equipment resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR RESOURCE - EQUIPMENT
   */
  private async getCalendarResourceEquipment(params: MCPGetCalendarResourceParams): Promise<{ success: boolean; resource: any; message: string }> {
    try {
      const response = await this.ghlClient.getCalendarResource('equipments', params.resourceId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        resource: response.data,
        message: 'Equipment resource retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get equipment resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE CALENDAR RESOURCE - EQUIPMENT
   */
  private async updateCalendarResourceEquipment(params: MCPUpdateCalendarResourceParams): Promise<{ success: boolean; resource: any; message: string }> {
    try {
      const { resourceId, ...updateData } = params;
      const response = await this.ghlClient.updateCalendarResource('equipments', resourceId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        resource: response.data,
        message: 'Equipment resource updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update equipment resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE CALENDAR RESOURCE - EQUIPMENT
   */
  private async deleteCalendarResourceEquipment(params: MCPDeleteCalendarResourceParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteCalendarResource('equipments', params.resourceId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Equipment resource deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete equipment resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR RESOURCES - ROOMS
   */
  private async getCalendarResourcesRooms(params: MCPGetCalendarResourcesParams): Promise<{ success: boolean; resources: any[]; message: string }> {
    try {
      const locationId = params.locationId || this.ghlClient.getConfig().locationId;
      const response = await this.ghlClient.getCalendarResources('rooms', params.limit, params.skip, locationId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const resources = Array.isArray(response.data) ? response.data : [];
      
      return {
        success: true,
        resources,
        message: `Retrieved ${resources.length} room resources`
      };
    } catch (error) {
      throw new Error(`Failed to get room resources: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE CALENDAR RESOURCE - ROOM
   */
  private async createCalendarResourceRoom(params: MCPCreateCalendarResourceParams): Promise<{ success: boolean; resource: any; message: string }> {
    try {
      const resourceData = {
        ...params,
        locationId: params.locationId || this.ghlClient.getConfig().locationId
      };
      const response = await this.ghlClient.createCalendarResource('rooms', resourceData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        resource: response.data,
        message: 'Room resource created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create room resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR RESOURCE - ROOM
   */
  private async getCalendarResourceRoom(params: MCPGetCalendarResourceParams): Promise<{ success: boolean; resource: any; message: string }> {
    try {
      const response = await this.ghlClient.getCalendarResource('rooms', params.resourceId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        resource: response.data,
        message: 'Room resource retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get room resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE CALENDAR RESOURCE - ROOM
   */
  private async updateCalendarResourceRoom(params: MCPUpdateCalendarResourceParams): Promise<{ success: boolean; resource: any; message: string }> {
    try {
      const { resourceId, ...updateData } = params;
      const response = await this.ghlClient.updateCalendarResource('rooms', resourceId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        resource: response.data,
        message: 'Room resource updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update room resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE CALENDAR RESOURCE - ROOM
   */
  private async deleteCalendarResourceRoom(params: MCPDeleteCalendarResourceParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteCalendarResource('rooms', params.resourceId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Room resource deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete room resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR NOTIFICATIONS
   */
  private async getCalendarNotifications(params: MCPGetCalendarNotificationsParams): Promise<{ success: boolean; notifications: any[]; message: string }> {
    try {
      const response = await this.ghlClient.getCalendarNotifications(params.calendarId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const notifications = Array.isArray(response.data) ? response.data : [];
      
      return {
        success: true,
        notifications,
        message: `Retrieved ${notifications.length} calendar notifications`
      };
    } catch (error) {
      throw new Error(`Failed to get calendar notifications: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE CALENDAR NOTIFICATIONS
   */
  private async createCalendarNotifications(params: MCPCreateCalendarNotificationParams): Promise<{ success: boolean; message: string }> {
    try {
      const { calendarId, notifications } = params;
      const response = await this.ghlClient.createCalendarNotifications(calendarId, notifications);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Calendar notifications created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create calendar notifications: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET CALENDAR NOTIFICATION
   */
  private async getCalendarNotification(params: MCPGetCalendarNotificationParams): Promise<{ success: boolean; notification: any; message: string }> {
    try {
      const response = await this.ghlClient.getCalendarNotification(params.calendarId, params.notificationId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        notification: response.data,
        message: 'Calendar notification retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get calendar notification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * UPDATE CALENDAR NOTIFICATION
   */
  private async updateCalendarNotification(params: MCPUpdateCalendarNotificationParams): Promise<{ success: boolean; message: string }> {
    try {
      const { calendarId, notificationId, ...updateData } = params;
      const response = await this.ghlClient.updateCalendarNotification(calendarId, notificationId, updateData);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Calendar notification updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update calendar notification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE CALENDAR NOTIFICATION
   */
  private async deleteCalendarNotification(params: MCPDeleteCalendarNotificationParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteCalendarNotification(params.calendarId, params.notificationId);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }
      
      return {
        success: true,
        message: 'Calendar notification deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete calendar notification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET BLOCKED SLOTS
   */
  private async getBlockedSlots(params: MCPGetBlockedSlotsParams): Promise<{ success: boolean; slots: any[]; message: string }> {
    try {
      const eventParams = {
        locationId: this.ghlClient.getConfig().locationId,
        startTime: params.startTime,
        endTime: params.endTime,
        userId: params.userId,
        calendarId: params.calendarId,
        groupId: params.groupId
      };

      const response = await this.ghlClient.getBlockedSlots(eventParams);
      
      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Unknown API error';
        throw new Error(`API request failed: ${errorMsg}`);
      }

      const slots = Array.isArray(response.data.events) ? response.data.events : [];
      
      return {
        success: true,
        slots,
        message: `Retrieved ${slots.length} blocked time slots`
      };
    } catch (error) {
      throw new Error(`Failed to get blocked slots: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 