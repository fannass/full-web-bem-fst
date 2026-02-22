import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Container,
  Paper,
  alpha,
} from '@mui/material';
import {
  Newspaper as NewspaperIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';

export const AdminDashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState({ posts: 0, cabinet: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const posts = await api.getPosts(1, 1);
        const cabinet = await api.getCabinet();
        setStats({
          posts: posts.meta.total,
          cabinet: cabinet.length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: IconComponent,
    color = '#667eea',
    link,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    link: string;
  }) => (
    <Card
      sx={{
        p: 2.5,
        borderRadius: '12px',
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Accent */}
      <Box
        sx={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: alpha(color, 0.1),
          zIndex: 0,
        }}
      />

      <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            color: '#999',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </Typography>

        {/* Value & Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              fontSize: '32px',
              lineHeight: 1,
            }}
          >
            {loading ? (
              <CircularProgress size={28} />
            ) : (
              value
            )}
          </Typography>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              flexShrink: 0,
            }}
          >
            {IconComponent}
          </Box>
        </Box>

        {/* Action Link */}
        <Button
          component={RouterLink}
          to={link}
          sx={{
            justifyContent: 'flex-start',
            color: color,
            textTransform: 'none',
            fontSize: '12px',
            fontWeight: 600,
            '&:hover': {
              bgcolor: alpha(color, 0.08),
            },
            p: '4px 0',
            ml: 0,
            mt: 0.5,
          }}
        >
          Kelola →
        </Button>
      </Stack>
    </Card>
  );

  return (
    <AdminLayout>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
          pt: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 3, sm: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                mb: 1,
                fontSize: { xs: '24px', sm: '32px' },
              }}
            >
              Selamat datang, {user?.username}! 👋
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: '14px',
              }}
            >
              Kelola website BEM FST UNISA dan dashboard ini
            </Typography>
          </Box>

          {/* Stats Grid - 2 Columns */}
          <Grid
            container
            spacing={3}
            sx={{
              mb: { xs: 4, md: 5 },
            }}
          >
            <Grid item xs={12} sm={6} md={6}>
              <StatCard
                title="Total Berita & Event"
                value={stats.posts}
                icon="📰"
                color="#667eea"
                link="/admin/posts"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <StatCard
                title="Anggota Kabinet"
                value={stats.cabinet}
                icon="👥"
                color="#764ba2"
                link="/admin/cabinet"
              />
            </Grid>
          </Grid>

          {/* Akses Cepat Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                mb: 2.5,
                fontSize: '16px',
              }}
            >
              Akses Cepat
            </Typography>

            <Grid container spacing={3}>
              {/* Posts Card */}
              <Grid item xs={12} md={6}>
                <Card
                  component={RouterLink}
                  to="/admin/posts"
                  sx={{
                    p: { xs: 3, md: 4 },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Box sx={{ fontSize: { xs: '40px', md: '48px' } }}>📰</Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        fontSize: { xs: '16px', md: '18px' },
                      }}
                    >
                      Kelola Berita & Event
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.9,
                        fontSize: '13px',
                      }}
                    >
                      Buat, edit, dan kelola postingan berita atau event
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Cabinet Card */}
              <Grid item xs={12} md={6}>
                <Card
                  component={RouterLink}
                  to="/admin/cabinet"
                  sx={{
                    p: { xs: 3, md: 4 },
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(245, 87, 108, 0.3)',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Box sx={{ fontSize: { xs: '40px', md: '48px' } }}>🎓</Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        fontSize: { xs: '16px', md: '18px' },
                      }}
                    >
                      Kelola Kabinet
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.9,
                        fontSize: '13px',
                      }}
                    >
                      Atur struktur organisasi dan anggota kabinet
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Tips Box */}
          <Paper
            sx={{
              p: 2.5,
              bgcolor: '#f0f4ff',
              border: '1px solid #dde7ff',
              borderRadius: '10px',
              display: 'flex',
              gap: 2,
            }}
          >
            <Box sx={{ fontSize: '24px', flexShrink: 0, mt: 0.2 }}>ℹ️</Box>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 0.5,
                  fontSize: '13px',
                }}
              >
                Tips
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                Gunakan menu navigasi di sisi kiri untuk mengakses fitur lainnya. Semua perubahan akan langsung tersimpan ke database.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AdminLayout>
  );
};

