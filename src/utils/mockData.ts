import {
  User,
  Ticket,
  Message,
  DashboardStats,
  UserRole,
  TicketStatus,
  TicketPriority,
} from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "agent@example.com",
    firstName: "Support",
    lastName: "Agent",
    role: "AGENT",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "customer@example.com",
    firstName: "John",
    lastName: "Customer",
    role: "CUSTOMER",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "CUSTOMER",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    email: "agent2@example.com",
    firstName: "Sarah",
    lastName: "Wilson",
    role: "AGENT",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: "1",
    ticketId: "1",
    senderId: "3",
    sender: mockUsers[2],
    content: "I am having trouble logging into my account. Can you help?",
    messageType: "TEXT",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    ticketId: "1",
    senderId: "2",
    sender: mockUsers[1],
    content:
      "Hello! I'd be happy to help you with your login issue. Can you provide more details about the error you're seeing?",
    messageType: "TEXT",
    createdAt: "2024-01-15T10:15:00Z",
  },
  {
    id: "3",
    ticketId: "1",
    senderId: "3",
    sender: mockUsers[2],
    content:
      'I get a message saying "Invalid credentials" even though I\'m sure my password is correct.',
    messageType: "TEXT",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "4",
    ticketId: "2",
    senderId: "4",
    sender: mockUsers[3],
    content:
      "The payment gateway is not working properly. Customers are unable to complete their purchases.",
    messageType: "TEXT",
    createdAt: "2024-01-16T09:00:00Z",
  },
  {
    id: "5",
    ticketId: "2",
    senderId: "5",
    sender: mockUsers[4],
    content:
      "This is a critical issue. I'm escalating this to our technical team immediately.",
    messageType: "TEXT",
    createdAt: "2024-01-16T09:05:00Z",
  },
];

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Login Issue",
    description: "Unable to log into the application",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    customerId: "3",
    customer: mockUsers[2],
    assignedTo: "2",
    assignee: mockUsers[1],
    tags: ["login", "authentication"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    messages: mockMessages.filter((m) => m.ticketId === "1"),
  },
  {
    id: "2",
    title: "Payment Gateway Error",
    description: "Customers cannot complete payment transactions",
    status: "OPEN",
    priority: "URGENT",
    customerId: "4",
    customer: mockUsers[3],
    assignedTo: "5",
    assignee: mockUsers[4],
    tags: ["payment", "critical", "e-commerce"],
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:05:00Z",
    messages: mockMessages.filter((m) => m.ticketId === "2"),
  },
  {
    id: "3",
    title: "Feature Request: Dark Mode",
    description: "Request to add dark mode theme to the application",
    status: "OPEN",
    priority: "LOW",
    customerId: "3",
    customer: mockUsers[2],
    tags: ["feature-request", "ui", "enhancement"],
    createdAt: "2024-01-17T14:00:00Z",
    updatedAt: "2024-01-17T14:00:00Z",
    messages: [],
  },
  {
    id: "4",
    title: "Email Notifications Not Working",
    description:
      "Users are not receiving email notifications for important updates",
    status: "RESOLVED",
    priority: "HIGH",
    customerId: "4",
    customer: mockUsers[3],
    assignedTo: "2",
    assignee: mockUsers[1],
    tags: ["email", "notifications", "bug"],
    createdAt: "2024-01-10T11:00:00Z",
    updatedAt: "2024-01-12T16:00:00Z",
    messages: [],
  },
  {
    id: "5",
    title: "Performance Issues",
    description: "Application is running slowly, especially during peak hours",
    status: "CLOSED",
    priority: "HIGH",
    customerId: "3",
    customer: mockUsers[2],
    assignedTo: "5",
    assignee: mockUsers[4],
    tags: ["performance", "optimization", "backend"],
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-08T17:00:00Z",
    messages: [],
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalTickets: 5,
  openTickets: 2,
  resolvedTickets: 2,
  averageResolutionTime: 2.5, // days
  ticketsByStatus: {
    OPEN: 2,
    IN_PROGRESS: 1,
    RESOLVED: 1,
    CLOSED: 1,
  },
  ticketsByPriority: {
    LOW: 1,
    MEDIUM: 1,
    HIGH: 2,
    URGENT: 1,
  },
  agentPerformance: [
    {
      agentId: "2",
      agentName: "Support Agent",
      assignedTickets: 2,
      resolvedTickets: 1,
      averageResolutionTime: 2.0,
      customerSatisfaction: 4.5,
    },
    {
      agentId: "5",
      agentName: "Sarah Wilson",
      assignedTickets: 2,
      resolvedTickets: 1,
      averageResolutionTime: 3.0,
      customerSatisfaction: 4.8,
    },
  ],
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getTicketsByUserRole = (
  userId: string,
  role: UserRole
): Ticket[] => {
  switch (role) {
    case "ADMIN":
      return mockTickets;
    case "AGENT":
      return mockTickets.filter((ticket) => ticket.assignedTo === userId);
    case "CUSTOMER":
      return mockTickets.filter((ticket) => ticket.customerId === userId);
    default:
      return [];
  }
};

export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
