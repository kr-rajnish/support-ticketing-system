import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Send,
  Edit,
  Save,
  Cancel,
  AttachFile,
  CheckCircle,
  Schedule,
  Person,
  AccessTime,
} from "@mui/icons-material";
import { RootState } from "@/store";
import {
  fetchTicketById,
  updateTicket,
  addMessage,
  updateTicketOptimistic,
} from "@/store/slices/ticketsSlice";
import {
  TicketStatus,
  TicketPriority,
  Message,
  MessageFormData,
} from "@/types";
import { enqueueSnackbar } from "notistack";

const statusOptions: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];
const priorityOptions: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(dateString);
};

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentTicket, loading, error } = useSelector(
    (state: RootState) => state.tickets
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingMessage, setIsAddingMessage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormData>();

  useEffect(() => {
    if (id) {
      dispatch(fetchTicketById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTicket) {
      setEditData({
        status: currentTicket.status,
        priority: currentTicket.priority,
        assignedTo: currentTicket.assignedTo || "",
      });
    }
  }, [currentTicket]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && currentTicket) {
      setEditData({
        status: currentTicket.status,
        priority: currentTicket.priority,
        assignedTo: currentTicket.assignedTo || "",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!currentTicket) return;

    setIsSaving(true);

    try {
      const updates = {
        status: editData.status as TicketStatus,
        priority: editData.priority as TicketPriority,
        assignedTo: editData.assignedTo || undefined,
      };

      dispatch(
        updateTicketOptimistic({
          ticketId: currentTicket.id,
          updates,
        })
      );

      enqueueSnackbar("Ticket updated successfully!", { variant: "success" });
      setIsEditing(false);

      const result = await dispatch(
        updateTicket({
          ticketId: currentTicket.id,
          updates,
        })
      );

      if (updateTicket.fulfilled.match(result)) {
        enqueueSnackbar("Changes saved to server!", {
          variant: "info",
          autoHideDuration: 2000,
        });
      } else {
        enqueueSnackbar("Update saved locally. Server sync will retry.", {
          variant: "warning",
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      enqueueSnackbar("Failed to update ticket. Changes saved locally.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitMessage = async (data: MessageFormData) => {
    if (!currentTicket || !user) return;

    setIsAddingMessage(true);

    try {
      const optimisticMessage = {
        id: `temp-msg-${Date.now()}`,
        content: data.content,
        senderId: user.id,
        sender: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        createdAt: new Date().toISOString(),
      };

      if (currentTicket.messages) {
        dispatch(
          updateTicketOptimistic({
            ticketId: currentTicket.id,
            updates: {
              messages: [...currentTicket.messages, optimisticMessage],
            },
          })
        );
      }

      reset();

      enqueueSnackbar("Message sent!", { variant: "success" });

      const result = await dispatch(
        addMessage({
          ticketId: currentTicket.id,
          messageData: {
            ...data,
            senderId: user.id,
          },
        })
      );

      if (addMessage.fulfilled.match(result)) {
        enqueueSnackbar("Message delivered to server!", {
          variant: "info",
          autoHideDuration: 2000,
        });
      } else {
        enqueueSnackbar(
          "Message saved locally. Will sync when connection is restored.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      enqueueSnackbar("Message saved locally. Will retry sending.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
    } finally {
      setIsAddingMessage(false);
    }
  };

  const canEdit = user?.role === "AGENT" || user?.role === "ADMIN";
  const canMessage =
    currentTicket &&
    ((user?.role === "CUSTOMER" && currentTicket.customerId === user.id) ||
      (user?.role === "AGENT" && currentTicket.assignedTo === user.id) ||
      user?.role === "ADMIN");

  if (loading && !currentTicket) {
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

  if (error || !currentTicket) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/tickets")}
          sx={{ mb: 2 }}
        >
          Back to Tickets
        </Button>
        <Alert severity="error">{error || "Ticket not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate("/tickets")} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Ticket #{currentTicket.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {formatRelativeTime(currentTicket.createdAt)} • Last
              updated {formatRelativeTime(currentTicket.updatedAt)}
            </Typography>
          </Box>
        </Box>

        {canEdit && (
          <Box>
            {isEditing ? (
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={
                    isSaving ? <CircularProgress size={16} /> : <Save />
                  }
                  onClick={handleSaveEdit}
                  variant="contained"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleEditToggle}
                  variant="outlined"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                startIcon={<Edit />}
                onClick={handleEditToggle}
                variant="outlined"
              >
                Edit
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {currentTicket.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {currentTicket.description}
              </Typography>

              {currentTicket.tags && currentTicket.tags.length > 0 && (
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {currentTicket.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                display="flex"
                alignItems="center"
              >
                <AccessTime sx={{ mr: 0.5, fontSize: 16 }} />
                Created on {formatDate(currentTicket.createdAt)}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Messages ({currentTicket.messages?.length || 0})
              </Typography>

              <List sx={{ maxHeight: 500, overflow: "auto" }}>
                {currentTicket.messages && currentTicket.messages.length > 0 ? (
                  currentTicket.messages.map((message: Message) => (
                    <ListItem
                      key={message.id}
                      alignItems="flex-start"
                      sx={{ px: 0 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              message.sender.role === "CUSTOMER"
                                ? "primary.main"
                                : "secondary.main",
                          }}
                        >
                          {message.sender.firstName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={0.5}
                          >
                            <Typography variant="subtitle2" fontWeight="bold">
                              {message.sender.firstName}{" "}
                              {message.sender.lastName}
                            </Typography>
                            <Chip
                              label={message.sender.role}
                              size="small"
                              variant="outlined"
                              color={
                                message.sender.role === "CUSTOMER"
                                  ? "primary"
                                  : "secondary"
                              }
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatRelativeTime(message.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                          >
                            {message.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                        >
                          No messages yet. Start the conversation below.
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>

              {canMessage && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmitMessage)}
                  >
                    <TextField
                      {...register("content", {
                        required: "Message is required",
                      })}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Type your message..."
                      error={!!errors.content}
                      helperText={errors.content?.message}
                      sx={{ mb: 2 }}
                      disabled={isAddingMessage}
                    />
                    <Box display="flex" justifyContent="space-between">
                      <Button
                        startIcon={<AttachFile />}
                        variant="outlined"
                        size="small"
                        disabled={isAddingMessage}
                      >
                        Attach File
                      </Button>
                      <Button
                        type="submit"
                        startIcon={
                          isAddingMessage ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Send />
                          )
                        }
                        variant="contained"
                        disabled={isAddingMessage}
                      >
                        {isAddingMessage ? "Sending..." : "Send Message"}
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ticket Information
              </Typography>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={editData.status}
                      onChange={(e) =>
                        setEditData({ ...editData, status: e.target.value })
                      }
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={status.replace("_", " ")}
                              size="small"
                              color={
                                status === "OPEN"
                                  ? "info"
                                  : status === "IN_PROGRESS"
                                  ? "warning"
                                  : status === "RESOLVED"
                                  ? "success"
                                  : "default"
                              }
                              sx={{ mr: 1 }}
                            />
                            {status.replace("_", " ")}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Chip
                    label={currentTicket.status.replace("_", " ")}
                    color={
                      currentTicket.status === "OPEN"
                        ? "info"
                        : currentTicket.status === "IN_PROGRESS"
                        ? "warning"
                        : currentTicket.status === "RESOLVED"
                        ? "success"
                        : "default"
                    }
                    sx={{ fontWeight: "medium" }}
                  />
                )}
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Priority
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={editData.priority}
                      onChange={(e) =>
                        setEditData({ ...editData, priority: e.target.value })
                      }
                    >
                      {priorityOptions.map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={priority}
                              size="small"
                              color={
                                priority === "LOW"
                                  ? "default"
                                  : priority === "MEDIUM"
                                  ? "info"
                                  : priority === "HIGH"
                                  ? "warning"
                                  : "error"
                              }
                              sx={{ mr: 1 }}
                            />
                            {priority}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Chip
                    label={currentTicket.priority}
                    color={
                      currentTicket.priority === "LOW"
                        ? "default"
                        : currentTicket.priority === "MEDIUM"
                        ? "info"
                        : currentTicket.priority === "HIGH"
                        ? "warning"
                        : "error"
                    }
                    sx={{ fontWeight: "medium" }}
                  />
                )}
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Customer
                </Typography>
                <Box display="flex" alignItems="center">
                  <Person sx={{ mr: 1, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="body2">
                      {currentTicket.customer.firstName}{" "}
                      {currentTicket.customer.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentTicket.customer.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Assignee
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={editData.assignedTo}
                    onChange={(e) =>
                      setEditData({ ...editData, assignedTo: e.target.value })
                    }
                    placeholder="Agent ID"
                  />
                ) : (
                  <>
                    {currentTicket.assignee ? (
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 1, color: "text.secondary" }} />
                        <Box>
                          <Typography variant="body2">
                            {currentTicket.assignee.firstName}{" "}
                            {currentTicket.assignee.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {currentTicket.assignee.email}
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
                  </>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body2">
                  {formatDate(currentTicket.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {formatDate(currentTicket.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {canEdit && (
            <Card sx={{ mt: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      setEditData({ ...editData, status: "RESOLVED" });
                      setIsEditing(true);
                    }}
                    disabled={currentTicket.status === "RESOLVED"}
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Schedule />}
                    onClick={() => {
                      setEditData({ ...editData, status: "IN_PROGRESS" });
                      setIsEditing(true);
                    }}
                    disabled={currentTicket.status === "IN_PROGRESS"}
                  >
                    Set In Progress
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TicketDetailPage;
