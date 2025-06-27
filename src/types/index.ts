// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';

// Auth Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Ticket Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  customer: User;
  assignedTo?: string;
  assignee?: User;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Message Types
export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  sender: User;
  content: string;
  messageType: MessageType;
  attachments?: Attachment[];
  createdAt: string;
}

export type MessageType = 'TEXT' | 'SYSTEM' | 'FILE';

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

// Filter Types
export interface TicketFilters {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assignee?: string[];
  tags?: string[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: string;
}

export type WebSocketMessageType = 
  | 'NEW_MESSAGE'
  | 'TICKET_UPDATED'
  | 'TICKET_ASSIGNED'
  | 'USER_TYPING'
  | 'CONNECTION_STATUS';

// Form Types
export interface TicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
  tags: string[];
}

export interface MessageFormData {
  content: string;
  attachments?: File[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Theme Types
export interface ThemeState {
  mode: 'light' | 'dark';
}

// Dashboard Types (for admin)
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByPriority: Record<TicketPriority, number>;
  agentPerformance: AgentPerformance[];
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  assignedTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
}