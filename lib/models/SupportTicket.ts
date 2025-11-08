import { ObjectId } from 'mongodb';

export type SupportTicketStatus = 'open' | 'in_review' | 'resolved' | 'rejected' | 'spam';
export type SupportTicketPriority = 'low' | 'medium' | 'high';

export interface SupportTicket {
  _id?: ObjectId;
  userId?: string;
  email: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolutionNote?: string;
  resolvedAt?: Date;
}

export function serializeSupportTicket(ticket: SupportTicket & { _id?: any }) {
  return {
    id: ticket._id ? String(ticket._id) : undefined,
    userId: ticket.userId || '',
    email: ticket.email,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    tags: ticket.tags || [],
    assignedTo: ticket.assignedTo || '',
    resolutionNote: ticket.resolutionNote || '',
    createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt,
    updatedAt: ticket.updatedAt instanceof Date ? ticket.updatedAt.toISOString() : ticket.updatedAt,
    resolvedAt:
      ticket.resolvedAt instanceof Date ? ticket.resolvedAt.toISOString() : ticket.resolvedAt,
  };
}
