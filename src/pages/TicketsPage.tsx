import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Card,
  CardContent,
  Fab,
  CircularProgress,
  Alert,
  Collapse,
  Autocomplete,
  Stack,
  Tooltip,
  Badge,
  Divider,
  ListItemText,
  Checkbox,
  OutlinedInput,
  SelectChangeEvent,
  alpha,
} from "@mui/material";
import {
  Visibility,
  Add,
  Search,
  FilterList,
  Clear,
  Sort,
  KeyboardArrowUp,
  KeyboardArrowDown,
  FilterAlt,
  Person,
  Label,
  Today,
  TrendingUp,
  Close,
  SwapVert,
  Speed,
} from "@mui/icons-material";
import { RootState } from "@/store";
import {
  fetchTickets,
  setFilters,
  clearFilters,
} from "@/store/slices/ticketsSlice";
import { Ticket, TicketStatus, TicketPriority, TicketFilters } from "@/types";

const statusColors: Record<
  TicketStatus,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

const priorityColors: Record<
  TicketPriority,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "error",
};

interface SortConfig {
  field: keyof Ticket | "customer" | "assignee" | "custom";
  direction: "asc" | "desc";
  customSort?: string;
}

const sortOptions = [
  { value: "createdAt-desc", label: "Newest First", icon: "🆕" },
  { value: "createdAt-asc", label: "Oldest First", icon: "📅" },
  { value: "updatedAt-desc", label: "Recently Updated", icon: "🔄" },
  { value: "updatedAt-asc", label: "Least Recently Updated", icon: "⏰" },
  { value: "priority-desc", label: "High Priority First", icon: "🔥" },
  { value: "priority-asc", label: "Low Priority First", icon: "📉" },
  { value: "status-asc", label: "Status: Open → Closed", icon: "📊" },
  { value: "status-desc", label: "Status: Closed → Open", icon: "📈" },
  { value: "title-asc", label: "Title A → Z", icon: "🔤" },
  { value: "title-desc", label: "Title Z → A", icon: "🔠" },
];

const getPriorityValue = (priority: TicketPriority): number => {
  const priorityMap = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
  return priorityMap[priority];
};

const getStatusValue = (status: TicketStatus): number => {
  const statusMap = { OPEN: 1, IN_PROGRESS: 2, RESOLVED: 3, CLOSED: 4 };
  return statusMap[status];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const mockAssignees = [
  { id: "agent-1", name: "John Smith", email: "john@example.com" },
  { id: "agent-2", name: "Sarah Johnson", email: "sarah@example.com" },
  { id: "agent-3", name: "Mike Davis", email: "mike@example.com" },
];

const mockTags = [
  "Bug",
  "Feature Request",
  "Payment",
  "Login",
  "Performance",
  "UI/UX",
  "Security",
  "Database",
  "API",
  "Mobile",
  "Email",
  "Billing",
];

const TicketsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tickets, loading, error, filters, pagination } = useSelector(
    (state: RootState) => state.tickets
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "createdAt",
    direction: "desc",
    customSort: "createdAt-desc",
  });
  const [quickSort, setQuickSort] = useState("createdAt-desc");

  const [sortedTickets, setSortedTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    dispatch(
      fetchTickets({
        filters,
        pagination: { page: pagination.page, limit: pagination.limit },
      })
    );
  }, [dispatch, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    const sorted = [...tickets].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case "customer":
          aValue =
            `${a.customer.firstName} ${a.customer.lastName}`.toLowerCase();
          bValue =
            `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase();
          break;
        case "assignee":
          aValue = a.assignee
            ? `${a.assignee.firstName} ${a.assignee.lastName}`.toLowerCase()
            : "";
          bValue = b.assignee
            ? `${b.assignee.firstName} ${b.assignee.lastName}`.toLowerCase()
            : "";
          break;
        case "createdAt":
        case "updatedAt":
          aValue = new Date(a[sortConfig.field]);
          bValue = new Date(b[sortConfig.field]);
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "priority":
          aValue = getPriorityValue(a.priority);
          bValue = getPriorityValue(b.priority);
          break;
        case "status":
          aValue = getStatusValue(a.status);
          bValue = getStatusValue(b.status);
          break;
        case "id":
          aValue = parseInt(a.id.replace(/\D/g, "")) || 0;
          bValue = parseInt(b.id.replace(/\D/g, "")) || 0;
          break;
        default:
          aValue = a[sortConfig.field as keyof Ticket];
          bValue = b[sortConfig.field as keyof Ticket];
      }

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined || aValue === "") return 1;
      if (bValue === null || bValue === undefined || bValue === "") return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "desc" ? -comparison : comparison;
    });

    setSortedTickets(sorted);
  }, [tickets, sortConfig]);

  const handleSort = (field: keyof Ticket | "customer" | "assignee") => {
    setSortConfig((prev) => {
      const newDirection =
        prev.field === field && prev.direction === "asc" ? "desc" : "asc";
      const customSort = `${field}-${newDirection}`;
      setQuickSort(customSort);
      return {
        field,
        direction: newDirection,
        customSort,
      };
    });
  };

  const handleQuickSort = (sortValue: string) => {
    const [field, direction] = sortValue.split("-") as [string, "asc" | "desc"];
    setQuickSort(sortValue);
    setSortConfig({
      field: field as keyof Ticket | "customer" | "assignee",
      direction,
      customSort: sortValue,
    });
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === quickSort);
    return option ? `${option.icon} ${option.label}` : "📊 Custom Sort";
  };

  const handleSearch = () => {
    const newFilters: TicketFilters = {
      ...filters,
      search: searchTerm || undefined,
      status: statusFilter.length > 0 ? statusFilter : undefined,
      priority: priorityFilter.length > 0 ? priorityFilter : undefined,
      assignee: assigneeFilter.length > 0 ? assigneeFilter : undefined,
      tags: tagsFilter.length > 0 ? tagsFilter : undefined,
      dateFrom: dateRange.from || undefined,
      dateTo: dateRange.to || undefined,
    };
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setPriorityFilter([]);
    setAssigneeFilter([]);
    setTagsFilter([]);
    setDateRange({ from: "", to: "" });
    dispatch(clearFilters());
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(
      fetchTickets({
        filters,
        pagination: { page: newPage + 1, limit: pagination.limit },
      })
    );
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    dispatch(
      fetchTickets({
        filters,
        pagination: { page: 1, limit: newLimit },
      })
    );
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    navigate("/tickets/new");
  };

  const activeFiltersCount = [
    statusFilter.length > 0,
    priorityFilter.length > 0,
    assigneeFilter.length > 0,
    tagsFilter.length > 0,
    dateRange.from || dateRange.to,
    searchTerm.length > 0,
  ].filter(Boolean).length;

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "status":
        if (value) setStatusFilter((prev) => prev.filter((s) => s !== value));
        break;
      case "priority":
        if (value) setPriorityFilter((prev) => prev.filter((p) => p !== value));
        break;
      case "assignee":
        if (value) setAssigneeFilter((prev) => prev.filter((a) => a !== value));
        break;
      case "tags":
        if (value) setTagsFilter((prev) => prev.filter((t) => t !== value));
        break;
      case "search":
        setSearchTerm("");
        break;
      case "date":
        setDateRange({ from: "", to: "" });
        break;
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination.total} total tickets
          </Typography>
        </Box>
        {(user?.role === "CUSTOMER" || user?.role === "ADMIN") && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateTicket}
            size="large"
          >
            New Ticket
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search tickets by title, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha("#000", 0.02),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <Badge badgeContent={activeFiltersCount} color="primary">
                  <Button
                    variant={showFilters ? "contained" : "outlined"}
                    startIcon={<FilterAlt />}
                    onClick={() => setShowFilters(!showFilters)}
                    endIcon={
                      showFilters ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                    }
                  >
                    Filters
                  </Button>
                </Badge>

                <FormControl sx={{ minWidth: 200 }}>
                  <Select
                    value={quickSort}
                    onChange={(e) => handleQuickSort(e.target.value)}
                    size="medium"
                    displayEmpty
                    startAdornment={
                      <SwapVert sx={{ mr: 1, color: "text.secondary" }} />
                    }
                    sx={{
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<Search />}
                >
                  Search
                </Button>
                <Button
                  variant="text"
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Clear All
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {activeFiltersCount > 0 && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    onDelete={() => removeFilter("search")}
                    size="small"
                    color="primary"
                  />
                )}
                {statusFilter.map((status) => (
                  <Chip
                    key={status}
                    label={`Status: ${status.replace("_", " ")}`}
                    onDelete={() => removeFilter("status", status)}
                    size="small"
                    color="info"
                  />
                ))}
                {priorityFilter.map((priority) => (
                  <Chip
                    key={priority}
                    label={`Priority: ${priority}`}
                    onDelete={() => removeFilter("priority", priority)}
                    size="small"
                    color="warning"
                  />
                ))}
                {assigneeFilter.map((assignee) => (
                  <Chip
                    key={assignee}
                    label={`Assignee: ${
                      mockAssignees.find((a) => a.id === assignee)?.name ||
                      assignee
                    }`}
                    onDelete={() => removeFilter("assignee", assignee)}
                    size="small"
                    color="secondary"
                  />
                ))}
                {tagsFilter.map((tag) => (
                  <Chip
                    key={tag}
                    label={`Tag: ${tag}`}
                    onDelete={() => removeFilter("tags", tag)}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {(dateRange.from || dateRange.to) && (
                  <Chip
                    label={`Date: ${dateRange.from || "Start"} - ${
                      dateRange.to || "End"
                    }`}
                    onDelete={() => removeFilter("date")}
                    size="small"
                    color="default"
                  />
                )}
              </Stack>
            </Box>
          )}

          <Collapse in={showFilters}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as TicketStatus[])
                    }
                    input={<OutlinedInput label="Status" />}
                    renderValue={(selected) => `${selected.length} selected`}
                  >
                    {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                      (status) => (
                        <MenuItem key={status} value={status}>
                          <Checkbox
                            checked={statusFilter.includes(
                              status as TicketStatus
                            )}
                          />
                          <ListItemText primary={status.replace("_", " ")} />
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    multiple
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(e.target.value as TicketPriority[])
                    }
                    input={<OutlinedInput label="Priority" />}
                    renderValue={(selected) => `${selected.length} selected`}
                  >
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        <Checkbox
                          checked={priorityFilter.includes(
                            priority as TicketPriority
                          )}
                        />
                        <ListItemText primary={priority} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Autocomplete
                  multiple
                  options={mockAssignees}
                  getOptionLabel={(option) => option.name}
                  value={mockAssignees.filter((a) =>
                    assigneeFilter.includes(a.id)
                  )}
                  onChange={(_, newValue) =>
                    setAssigneeFilter(newValue.map((v) => v.id))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assignee"
                      placeholder="Select assignees"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        size="small"
                      />
                    ))
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Autocomplete
                  multiple
                  options={mockTags}
                  value={tagsFilter}
                  onChange={(_, newValue) => setTagsFilter(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Select tags"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                        variant="outlined"
                      />
                    ))
                  }
                />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      <Paper sx={{ boxShadow: 3 }}>
        <Box
          p={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{sortedTickets.length} Tickets</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              icon={<Speed />}
              label={getCurrentSortLabel()}
              variant="outlined"
              size="small"
              color="primary"
            />
            <Tooltip title="Sort Options">
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={quickSort}
                  onChange={(e) => handleQuickSort(e.target.value)}
                  displayEmpty
                  variant="outlined"
                  sx={{
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    },
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: "1rem" }}>{option.icon}</span>
                        <span style={{ fontSize: "0.875rem" }}>
                          {option.label}
                        </span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
          </Box>
        </Box>
        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha("#000", 0.02) }}>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === "id"}
                    direction={
                      sortConfig.field === "id" ? sortConfig.direction : "asc"
                    }
                    onClick={() => handleSort("id")}
                    sx={{ fontWeight: "bold" }}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === "title"}
                    direction={
                      sortConfig.field === "title"
                        ? sortConfig.direction
                        : "asc"
                    }
                    onClick={() => handleSort("title")}
                    sx={{ fontWeight: "bold" }}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === "status"}
                    direction={
                      sortConfig.field === "status"
                        ? sortConfig.direction
                        : "asc"
                    }
                    onClick={() => handleSort("status")}
                    sx={{ fontWeight: "bold" }}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === "priority"}
                    direction={
                      sortConfig.field === "priority"
                        ? sortConfig.direction
                        : "asc"
                    }
                    onClick={() => handleSort("priority")}
                    sx={{ fontWeight: "bold" }}
                  >
                    Priority
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === "customer"}
                    direction={
                      sortConfig.field === "customer"
                        ? sortConfig.direction
                        : "asc"
                    }
                    onClick={() => handleSort("customer")}
                    sx={{ fontWeight: "bold" }}
                  >
                    Customer
                  </TableSortLabel>
                </TableCell>
                {user?.role !== "CUSTOMER" && (
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.field === "assignee"}
                      direction={
                        sortConfig.field === "assignee"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("assignee")}
                      sx={{ fontWeight: "bold" }}
                    >
                      Assignee
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === "createdAt"}
                    direction={
                      sortConfig.field === "createdAt"
                        ? sortConfig.direction
                        : "asc"
                    }
                    onClick={() => handleSort("createdAt")}
                    sx={{ fontWeight: "bold" }}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTickets.map((ticket: Ticket) => (
                <TableRow
                  key={ticket.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha("#1976d2", 0.04),
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleViewTicket(ticket.id)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      #{ticket.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {ticket.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.description.substring(0, 50)}...
                      </Typography>
                      {ticket.tags && ticket.tags.length > 0 && (
                        <Box mt={0.5}>
                          {ticket.tags.slice(0, 2).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, fontSize: "0.7rem", height: 18 }}
                            />
                          ))}
                          {ticket.tags.length > 2 && (
                            <Chip
                              label={`+${ticket.tags.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 18 }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status.replace("_", " ")}
                      color={statusColors[ticket.status]}
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      color={priorityColors[ticket.priority]}
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Person
                        sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                      />
                      <Box>
                        <Typography variant="body2">
                          {ticket.customer.firstName} {ticket.customer.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  {user?.role !== "CUSTOMER" && (
                    <TableCell>
                      {ticket.assignee ? (
                        <Box display="flex" alignItems="center">
                          <Person
                            sx={{
                              mr: 1,
                              fontSize: 16,
                              color: "text.secondary",
                            }}
                          />
                          <Box>
                            <Typography variant="body2">
                              {ticket.assignee.firstName}{" "}
                              {ticket.assignee.lastName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {ticket.assignee.email}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontStyle="italic"
                        >
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Today
                        sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {formatDate(ticket.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTicket(ticket.id);
                        }}
                        color="primary"
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha("#1976d2", 0.1),
                          },
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {sortedTickets.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={user?.role !== "CUSTOMER" ? 8 : 7}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No tickets found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: alpha("#000", 0.01),
          }}
        />
      </Paper>

      {(user?.role === "CUSTOMER" || user?.role === "ADMIN") && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreateTicket}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: { xs: "flex", md: "none" },
            boxShadow: 3,
          }}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default TicketsPage;
