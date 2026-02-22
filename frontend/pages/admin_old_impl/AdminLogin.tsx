import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Link as MuiLink,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLogin: React.FC = () => {
  const { isAuthenticated, login, isLoading } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f6fa',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexGrow: 1,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <Stack spacing={3} sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: '32px',
              }}
            >
              ⚙️
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Admin Panel
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
              BEM FST UNISA
            </Typography>
          </Stack>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Username */}
              <TextField
                fullWidth
                label="Username"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                placeholder="Masukkan password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={submitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              {/* Forgot Password Link */}
              <Box sx={{ textAlign: 'right' }}>
                <MuiLink
                  href="#"
                  variant="body2"
                  sx={{
                    color: '#667eea',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                    fontSize: '12px',
                  }}
                >
                  Lupa password?
                </MuiLink>
              </Box>

              {/* Login Button */}
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={submitting || !username || !password}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '16px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3a8f 100%)',
                  },
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>

              {/* Demo Credentials */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: '#f5f6fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              >
                <Typography variant="caption" sx={{ color: '#666', fontSize: '11px', display: 'block', mb: 1 }}>
                  Demo Credentials:
                </Typography>
                <Typography variant="caption" sx={{ color: '#333', fontSize: '12px', fontWeight: 600 }}>
                  Username: <code>admin</code> | Password: <code>admin123</code>
                </Typography>
              </Paper>
            </Stack>
          </form>
        </Card>
      </Container>
    </Box>
  );
};
