import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { RootState } from "@/store";
import { mockDashboardStats } from "@/utils/mockData";

const COLORS = {
  OPEN: "#2196f3",
  IN_PROGRESS: "#ff9800",
  RESOLVED: "#4caf50",
  CLOSED: "#9e9e9e",
  LOW: "#9e9e9e",
  MEDIUM: "#2196f3",
  HIGH: "#ff9800",
  URGENT: "#f44336",
};

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const stats = mockDashboardStats;

  const statusData = Object.entries(stats.ticketsByStatus).map(
    ([status, count]) => ({
      name: status.replace("_", " "),
      value: count,
      fill: COLORS[status as keyof typeof COLORS],
    })
  );

  const priorityData = Object.entries(stats.ticketsByPriority).map(
    ([priority, count]) => ({
      name: priority,
      count,
      fill: COLORS[priority as keyof typeof COLORS],
    })
  );

  const trendData = [
    { date: "Mon", created: 2, resolved: 1 },
    { date: "Tue", created: 3, resolved: 2 },
    { date: "Wed", created: 1, resolved: 3 },
    { date: "Thu", created: 4, resolved: 2 },
    { date: "Fri", created: 2, resolved: 4 },
    { date: "Sat", created: 1, resolved: 1 },
    { date: "Sun", created: 1, resolved: 0 },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tickets
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Tickets
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                {stats.openTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved Tickets
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {stats.resolvedTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Resolution Time
              </Typography>
              <Typography variant="h4" component="div">
                {stats.averageResolutionTime}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tickets by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tickets by Priority
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ticket Trends (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Created"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {user?.role === "ADMIN" && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Agent Performance
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Agent</TableCell>
                        <TableCell align="right">Assigned</TableCell>
                        <TableCell align="right">Resolved</TableCell>
                        <TableCell align="right">
                          Avg Resolution (days)
                        </TableCell>
                        <TableCell align="right">Satisfaction</TableCell>
                        <TableCell align="right">Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.agentPerformance.map((agent) => {
                        const resolutionRate =
                          (agent.resolvedTickets / agent.assignedTickets) * 100;
                        return (
                          <TableRow key={agent.agentId}>
                            <TableCell component="th" scope="row">
                              {agent.agentName}
                            </TableCell>
                            <TableCell align="right">
                              {agent.assignedTickets}
                            </TableCell>
                            <TableCell align="right">
                              {agent.resolvedTickets}
                            </TableCell>
                            <TableCell align="right">
                              {agent.averageResolutionTime}
                            </TableCell>
                            <TableCell align="right">
                              <Box display="flex" alignItems="center">
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {agent.customerSatisfaction}/5
                                </Typography>
                                <Chip
                                  label={
                                    agent.customerSatisfaction >= 4.5
                                      ? "Excellent"
                                      : agent.customerSatisfaction >= 4.0
                                      ? "Good"
                                      : "Average"
                                  }
                                  color={
                                    agent.customerSatisfaction >= 4.5
                                      ? "success"
                                      : agent.customerSatisfaction >= 4.0
                                      ? "primary"
                                      : "default"
                                  }
                                  size="small"
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ width: 100 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={resolutionRate}
                                  color={
                                    resolutionRate >= 80
                                      ? "success"
                                      : resolutionRate >= 60
                                      ? "primary"
                                      : "warning"
                                  }
                                />
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {resolutionRate.toFixed(0)}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
