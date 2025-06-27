import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Autocomplete,
  Divider,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Send,
  Save,
  Add,
  Label,
  PriorityHigh,
  Description,
  Title,
} from "@mui/icons-material";
import { RootState } from "@/store";
import {
  createTicket,
  addTicketOptimistic,
  fetchTickets,
} from "@/store/slices/ticketsSlice";
import {
  CreateTicketData,
  TicketPriority,
  Ticket,
  TicketStatus,
} from "@/types";
import { enqueueSnackbar } from "notistack";

const priorityOptions: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const suggestedTags = [
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
  "Account",
  "Technical Support",
  "General Inquiry",
];

const CreateTicketPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error } = useSelector((state: RootState) => state.tickets);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateTicketData>({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      tags: [],
    },
  });

  const watchedTitle = watch("title");
  const watchedDescription = watch("description");

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: CreateTicketData) => {
    if (!user) {
      enqueueSnackbar("User not authenticated", { variant: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        ...data,
        tags: selectedTags,
      };

      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const optimisticTicket: Ticket = {
        id: tempId,
        title: ticketData.title,
        description: ticketData.description,
        status: "OPEN" as TicketStatus,
        priority: ticketData.priority,
        customerId: user.id,
        customer: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        assignedTo: ticketData.assignedTo || null,
        assignee: null,
        tags: ticketData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      dispatch(addTicketOptimistic(optimisticTicket));

      enqueueSnackbar("Ticket created successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      navigate("/tickets");

      const result = await dispatch(createTicket(ticketData));

      if (createTicket.fulfilled.match(result)) {
        dispatch(
          fetchTickets({
            filters: {},
            pagination: { page: 1, limit: 10 },
          })
        );

        enqueueSnackbar("Ticket saved to server!", {
          variant: "info",
          autoHideDuration: 2000,
        });
      } else {
        enqueueSnackbar("Ticket created locally. Server sync will retry.", {
          variant: "warning",
          autoHideDuration: 4000,
        });
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      enqueueSnackbar("Failed to create ticket. Please try again.", {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/tickets");
  };

  const handleSaveDraft = () => {
    const draftData = {
      title: watchedTitle,
      description: watchedDescription,
      tags: selectedTags,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("ticketDraft", JSON.stringify(draftData));
    enqueueSnackbar("Draft saved locally!", { variant: "info" });
  };

  React.useEffect(() => {
    const draft = localStorage.getItem("ticketDraft");
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        reset({
          title: draftData.title || "",
          description: draftData.description || "",
          priority: "MEDIUM",
          tags: draftData.tags || [],
        });
        setSelectedTags(draftData.tags || []);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [reset]);

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            Back to Tickets
          </Button>
          <Typography variant="h4" component="h1">
            Create New Ticket
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                display="flex"
                alignItems="center"
              >
                <Description sx={{ mr: 1 }} />
                Ticket Details
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                spacing={3}
              >
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: "Title is required",
                    minLength: {
                      value: 5,
                      message: "Title must be at least 5 characters",
                    },
                    maxLength: {
                      value: 100,
                      message: "Title must be less than 100 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ticket Title"
                      placeholder="Brief description of your issue..."
                      error={!!errors.title}
                      helperText={
                        errors.title?.message ||
                        `${field.value?.length || 0}/100 characters`
                      }
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <Title sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "Description is required",
                    minLength: {
                      value: 20,
                      message: "Description must be at least 20 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Detailed Description"
                      placeholder="Please provide a detailed description of your issue, including steps to reproduce if applicable..."
                      multiline
                      rows={6}
                      error={!!errors.description}
                      helperText={
                        errors.description?.message ||
                        `${field.value?.length || 0} characters`
                      }
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: "Priority is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        {...field}
                        label="Priority"
                        error={!!errors.priority}
                        startAdornment={
                          <PriorityHigh
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
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
                              {priority === "URGENT" &&
                                " - Requires immediate attention"}
                              {priority === "HIGH" && " - Important issue"}
                              {priority === "MEDIUM" && " - Standard priority"}
                              {priority === "LOW" &&
                                " - Can be addressed later"}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Box mb={3}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    display="flex"
                    alignItems="center"
                  >
                    <Label sx={{ mr: 1 }} />
                    Tags (Optional)
                  </Typography>

                  <Autocomplete
                    multiple
                    freeSolo
                    options={suggestedTags}
                    value={selectedTags}
                    onChange={(_, newValue) => setSelectedTags(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select or type tags to categorize your ticket..."
                        helperText="Choose relevant tags or create custom ones"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option}
                          label={option}
                          onDelete={() => removeTag(option)}
                          color="primary"
                          variant="outlined"
                        />
                      ))
                    }
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={
                      isSubmitting ? <CircularProgress size={20} /> : <Send />
                    }
                    disabled={isSubmitting}
                    sx={{ minWidth: 150 }}
                  >
                    {isSubmitting ? "Creating..." : "Create Ticket"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateTicketPage;
