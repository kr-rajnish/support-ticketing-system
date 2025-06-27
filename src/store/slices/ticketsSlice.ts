import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Ticket,
  TicketFilters,
  CreateTicketData,
  UpdateTicketData,
  MessageFormData,
  TicketStatus,
  TicketPriority,
} from "@/types";
import { mockTickets } from "@/utils/mockData";

interface TicketsState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  ticketCache: { [key: string]: Ticket };
  lastFetch: number;
}

const initialState: TicketsState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  ticketCache: {},
  lastFetch: 0,
};

const generateTicketId = (): string => {
  return `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const loadTicketsFromCache = (): Ticket[] => {
  try {
    const cached = localStorage.getItem("ticketsCache");
    if (cached) {
      const parsedCache = JSON.parse(cached);

      const cacheMap = new Map(
        parsedCache.map((ticket: Ticket) => [ticket.id, ticket])
      );
      const mergedTickets = [...parsedCache];

      mockTickets.forEach((mockTicket) => {
        if (!cacheMap.has(mockTicket.id)) {
          mergedTickets.push(mockTicket);
        }
      });

      return mergedTickets;
    }
  } catch (error) {
    console.error("Error loading tickets from cache:", error);
  }
  return [...mockTickets];
};

const saveTicketsToCache = (tickets: Ticket[]) => {
  try {
    localStorage.setItem("ticketsCache", JSON.stringify(tickets));
    localStorage.setItem("ticketsCacheTimestamp", Date.now().toString());
  } catch (error) {
    console.error("Error saving tickets to cache:", error);
  }
};

export const fetchTickets = createAsyncThunk(
  "tickets/fetchTickets",
  async ({
    filters,
    pagination,
  }: {
    filters: TicketFilters;
    pagination: { page: number; limit: number };
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let allTickets = loadTicketsFromCache();

    let filteredTickets = allTickets;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.id.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filteredTickets = filteredTickets.filter((ticket) =>
        filters.status!.includes(ticket.status)
      );
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredTickets = filteredTickets.filter((ticket) =>
        filters.priority!.includes(ticket.priority)
      );
    }

    if (filters.assignee && filters.assignee.length > 0) {
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.assignedTo && filters.assignee!.includes(ticket.assignedTo)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.tags && ticket.tags.some((tag) => filters.tags!.includes(tag))
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredTickets = filteredTickets.filter(
        (ticket) => new Date(ticket.createdAt) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filteredTickets = filteredTickets.filter(
        (ticket) => new Date(ticket.createdAt) <= toDate
      );
    }

    const total = filteredTickets.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    return {
      tickets: paginatedTickets,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }
);

export const fetchTicketById = createAsyncThunk(
  "tickets/fetchTicketById",
  async (ticketId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allTickets = loadTicketsFromCache();
    const ticket = allTickets.find((t) => t.id === ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket;
  }
);

export const createTicket = createAsyncThunk(
  "tickets/createTicket",
  async (ticketData: CreateTicketData, { getState }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const state = getState() as any;
    const currentUser = state.auth.user;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const newTicket: Ticket = {
      id: generateTicketId(),
      title: ticketData.title,
      description: ticketData.description,
      status: "OPEN" as TicketStatus,
      priority: ticketData.priority,
      customerId: currentUser.id,
      customer: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
      },
      assignedTo: ticketData.assignedTo || null,
      assignee: null,
      tags: ticketData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    const allTickets = loadTicketsFromCache();
    const updatedTickets = [newTicket, ...allTickets];
    saveTicketsToCache(updatedTickets);

    return newTicket;
  }
);

export const updateTicket = createAsyncThunk(
  "tickets/updateTicket",
  async ({
    ticketId,
    updates,
  }: {
    ticketId: string;
    updates: UpdateTicketData;
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allTickets = loadTicketsFromCache();
    const ticketIndex = allTickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) {
      throw new Error("Ticket not found");
    }

    const updatedTicket: Ticket = {
      ...allTickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedTickets = [...allTickets];
    updatedTickets[ticketIndex] = updatedTicket;
    saveTicketsToCache(updatedTickets);

    return updatedTicket;
  }
);

export const addMessage = createAsyncThunk(
  "tickets/addMessage",
  async (
    {
      ticketId,
      messageData,
    }: {
      ticketId: string;
      messageData: MessageFormData & { senderId: string };
    },
    { getState }
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const state = getState() as any;
    const currentUser = state.auth.user;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const allTickets = loadTicketsFromCache();
    const ticketIndex = allTickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) {
      throw new Error("Ticket not found");
    }

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: messageData.content,
      senderId: messageData.senderId,
      sender: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
      },
      createdAt: new Date().toISOString(),
    };

    const updatedTicket = {
      ...allTickets[ticketIndex],
      messages: [...allTickets[ticketIndex].messages, newMessage],
      updatedAt: new Date().toISOString(),
    };

    const updatedTickets = [...allTickets];
    updatedTickets[ticketIndex] = updatedTicket;
    saveTicketsToCache(updatedTickets);

    return { ticket: updatedTicket, message: newMessage };
  }
);

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TicketFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },

    refreshTickets: (state) => {
      state.lastFetch = 0;
    },

    updateTicketOptimistic: (
      state,
      action: PayloadAction<{ ticketId: string; updates: Partial<Ticket> }>
    ) => {
      const { ticketId, updates } = action.payload;

      const ticketIndex = state.tickets.findIndex((t) => t.id === ticketId);
      if (ticketIndex !== -1) {
        state.tickets[ticketIndex] = {
          ...state.tickets[ticketIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }

      if (state.currentTicket && state.currentTicket.id === ticketId) {
        state.currentTicket = {
          ...state.currentTicket,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }

      if (state.ticketCache[ticketId]) {
        state.ticketCache[ticketId] = {
          ...state.ticketCache[ticketId],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    addTicketOptimistic: (state, action: PayloadAction<Ticket>) => {
      const newTicket = action.payload;
      state.tickets = [newTicket, ...state.tickets];
      state.ticketCache[newTicket.id] = newTicket;
      state.pagination.total += 1;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
        state.lastFetch = Date.now();

        action.payload.tickets.forEach((ticket) => {
          state.ticketCache[ticket.id] = ticket;
        });
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch tickets";
      })

      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
        state.ticketCache[action.payload.id] = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch ticket";
      })

      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        const newTicket = action.payload;

        if (state.pagination.page === 1) {
          state.tickets = [
            newTicket,
            ...state.tickets.slice(0, state.pagination.limit - 1),
          ];
        }

        state.ticketCache[newTicket.id] = newTicket;
        state.pagination.total += 1;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create ticket";
      })

      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTicket = action.payload;

        const ticketIndex = state.tickets.findIndex(
          (t) => t.id === updatedTicket.id
        );
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = updatedTicket;
        }

        if (
          state.currentTicket &&
          state.currentTicket.id === updatedTicket.id
        ) {
          state.currentTicket = updatedTicket;
        }

        state.ticketCache[updatedTicket.id] = updatedTicket;
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update ticket";
      })

      .addCase(addMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { ticket } = action.payload;

        const ticketIndex = state.tickets.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = ticket;
        }

        if (state.currentTicket && state.currentTicket.id === ticket.id) {
          state.currentTicket = ticket;
        }

        state.ticketCache[ticket.id] = ticket;
      })
      .addCase(addMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add message";
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearError,
  refreshTickets,
  updateTicketOptimistic,
  addTicketOptimistic,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
