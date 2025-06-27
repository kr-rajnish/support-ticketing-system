import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  ConfirmationNumber,
  People,
  Settings,
  Logout,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";
import { RootState } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";

const drawerWidth = 240;

const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { user } = useSelector((state: RootState) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  // Dummy notification data
  const notifications = [
    { id: 1, message: "New ticket assigned" },
    { id: 2, message: "User registered" },
    { id: 3, message: "Server downtime scheduled" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleViewAllNotifications = () => {
    handleNotificationClose();
    navigate("/allnotifications");
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate("/profile");
    console.log("Profile clicked");
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleProfileMenuClose();
    navigate("/login");
  };

  const getMenuItems = () => {
    const baseItems = [];

    if (user?.role === "ADMIN" || user?.role === "AGENT") {
      baseItems.push({
        text: "Dashboard",
        icon: <Dashboard />,
        path: "/dashboard",
      });
    }

    baseItems.push({
      text: "Tickets",
      icon: <ConfirmationNumber />,
      path: "/tickets",
    });

    if (user?.role === "ADMIN") {
      baseItems.push({ text: "Users", icon: <People />, path: "/users" });
    }

    return baseItems;
  };

  const getCurrentPageTitle = () => {
    const currentItem = getMenuItems().find(
      (item) => item.path === location.pathname
    );
    return currentItem?.text || "Support System";
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Support System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ position: "absolute", bottom: 0, width: "100%", p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {user?.firstName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getCurrentPageTitle()}
          </Typography>

          <Badge color="success" variant="dot" sx={{ mr: 2 }}>
            <Typography variant="body2" color="inherit">
              Online
            </Typography>
          </Badge>

          <IconButton
            color="inherit"
            sx={{ mr: 1 }}
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.[0]}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>

        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleNotificationClose}>
              {notification.message}
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleNotificationClose}>
            No notifications
          </MenuItem>
        )}
        <MenuItem
          sx={{ justifyContent: "center", cursor: "pointer" }}
          onClick={handleViewAllNotifications}
        >
          {"Mark all as read"}
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
