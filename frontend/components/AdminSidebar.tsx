import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  Drawer,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Typography,
  Button,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Newspaper as NewspaperIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

/**
 * Admin Sidebar - Material Kit style
 * - Desktop: Fixed position, 300px width
 * - Mobile: Temporary drawer with close button
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({ open = false, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const { logout, user } = useAdminAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
    { label: 'Berita & Event', path: '/admin/posts', icon: <NewspaperIcon sx={{ fontSize: 20 }} /> },
    { label: 'Kabinet', path: '/admin/cabinet', icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
    { label: 'Periode', path: '/admin/periods', icon: <DateRangeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Organisasi', path: '/admin/organization', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
  ];

  const sidebarContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#fff',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid #f0f0f0`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          📊
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            BEM FST
          </Typography>
          <Typography variant="caption" sx={{ color: '#999', lineHeight: 1.2 }}>
            Admin
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 0 }}>
        {menuItems.map((item, idx) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={() => onClose?.()}
              sx={{
                borderRadius: '8px',
                color: isActive(item.path) ? '#667eea' : '#666',
                bgcolor: isActive(item.path) ? '#f0f4ff' : 'transparent',
                fontWeight: isActive(item.path) ? 600 : 500,
                '&:hover': {
                  bgcolor: isActive(item.path) ? '#f0f4ff' : '#f5f5f5',
                },
                '&.Mui-selected': {
                  bgcolor: '#f0f4ff',
                  color: '#667eea',
                  '&:hover': {
                    bgcolor: '#f0f4ff',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  mr: 2,
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { fontSize: 14, fontWeight: 'inherit' },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Divider */}
      <Divider sx={{ my: 0 }} />

      {/* User Section */}
      <Box sx={{ p: 2 }}>
        {/* User Info */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 700,
            }}
          >
            {user?.username?.[0].toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
              Administrator
            </Typography>
          </Box>
        </Stack>

        {/* Logout Button */}
        <Button
          fullWidth
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
          onClick={() => {
            logout();
            onClose?.();
          }}
          sx={{
            borderColor: '#f0f0f0',
            color: '#666',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            '&:hover': {
              bgcolor: '#fafafa',
              borderColor: '#e0e0e0',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <Box
        sx={{
          width: '300px',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          borderRight: '1px solid #f0f0f0',
          zIndex: 1000,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#ccc',
            borderRadius: '3px',
          },
        }}
      >
        {sidebarContent}
      </Box>
    );
  }

  // Mobile Drawer
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '280px',
          boxSizing: 'border-box',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};
