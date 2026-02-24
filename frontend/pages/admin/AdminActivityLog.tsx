// cspell:disable
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Toolbar from '@mui/material/Toolbar';

import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import type { IconifyName } from 'src/components/iconify/register-icons';
import { Scrollbar } from 'src/components/scrollbar';

import { AdminLayout } from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';

// ----------------------------------------------------------------------

interface ActivityLogEntry {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_title: string | null;
  actor: string;
  ip_address: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

// Action display config
const ACTION_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'info' | 'warning' | 'default'; icon: string }> = {
  'post.created':      { label: 'Artikel Dibuat',     color: 'success', icon: 'solar:document-add-bold' },
  'post.updated':      { label: 'Artikel Diedit',     color: 'info',    icon: 'solar:pen-bold' },
  'post.published':    { label: 'Artikel Dipublish',  color: 'success', icon: 'solar:upload-bold' },
  'post.deleted':      { label: 'Artikel Dihapus',    color: 'error',   icon: 'solar:trash-bin-trash-bold' },
  'auth.login':        { label: 'Login Berhasil',     color: 'info',    icon: 'solar:login-2-bold' },
  'auth.login_failed': { label: 'Login Gagal',        color: 'error',   icon: 'solar:shield-warning-bold' },
};

const getActionConfig = (action: string) =>
  ACTION_CONFIG[action] ?? { label: action, color: 'default' as const, icon: 'solar:info-circle-bold' };

// ----------------------------------------------------------------------

export const AdminActivityLog: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();

  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filterText, setFilterText] = useState('');
  const LIMIT = 30;

  const loadLogs = useCallback(async (p = 0) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.getActivityLogs(p + 1, LIMIT);
      setLogs(result.data);
      setTotal(result.meta.total);
    } catch {
      setError('Gagal memuat activity log');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadLogs(page);
  }, [page, loadLogs]);

  const handleClearOld = async () => {
    if (!window.confirm('Hapus semua log yang lebih dari 180 hari? Aksi ini tidak bisa dibatalkan.')) return;
    try {
      await api.clearOldLogs(180);
      setSuccess('Log lama berhasil dihapus');
      loadLogs(0);
    } catch {
      setError('Gagal menghapus log lama');
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      l.action.includes(q) ||
      l.entity_title?.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      l.ip_address?.includes(q)
    );
  });

  // Stats
  const loginFailed  = logs.filter(l => l.action === 'auth.login_failed').length;
  const articlesCreated = logs.filter(l => l.action === 'post.created').length;
  const articlesDeleted = logs.filter(l => l.action === 'post.deleted').length;

  return (
    <AdminLayout>
      <DashboardContent>

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={800}>Activity Log</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Riwayat semua aksi sistem — login, artikel, dan perubahan konten
            </Typography>
          </Box>
          <Stack direction="row" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={"solar:restart-bold" as IconifyName} />}
              onClick={() => loadLogs(page)}
              disabled={loading}
            >
              Refresh
            </Button>
            <Tooltip title="Hapus log lebih dari 180 hari">
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={handleClearOld}
              >
                Bersihkan Log Lama
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Stats row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {[
            { label: 'Total Log',          value: total,           icon: 'solar:document-text-bold', color: '#6366f1', bg: '#6366f115' },
            { label: 'Artikel Dibuat',     value: articlesCreated, icon: 'solar:document-add-bold',  color: '#22c55e', bg: '#22c55e15' },
            { label: 'Artikel Dihapus',    value: articlesDeleted, icon: 'solar:trash-bin-trash-bold',color: '#ef4444', bg: '#ef444415' },
            { label: 'Login Gagal',        value: loginFailed,     icon: 'solar:shield-warning-bold', color: '#f59e0b', bg: '#f59e0b15' },
          ].map((s) => (
            <Card key={s.label} variant="outlined" sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Iconify icon={s.icon as unknown as IconifyName} width={22} sx={{ color: s.color }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} lineHeight={1.1}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Table card */}
        <Card>
          <Toolbar sx={{ height: 72, px: 2, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <OutlinedInput
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter aksi, judul, aktor, IP..."
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <Iconify width={18} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              }
              sx={{ maxWidth: 320 }}
            />
            <Typography variant="caption" color="text.secondary">
              Menampilkan {LIMIT} log terbaru per halaman
            </Typography>
          </Toolbar>

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Aksi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Aktor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Waktu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                          Memuat log...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Iconify icon="solar:document-text-bold" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {filterText ? 'Tidak ada hasil untuk filter ini' : 'Belum ada activity log'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => {
                      const cfg = getActionConfig(log.action);
                      return (
                        <TableRow hover key={log.id} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Box sx={{
                                width: 32, height: 32, borderRadius: 1, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: cfg.color === 'error' ? '#ef444415'
                                       : cfg.color === 'success' ? '#22c55e15'
                                       : cfg.color === 'warning' ? '#f59e0b15'
                                       : '#6366f115',
                              }}>
                                <Iconify
                                  icon={cfg.icon as unknown as IconifyName}
                                  width={16}
                                  sx={{ color: cfg.color === 'error' ? '#ef4444'
                                              : cfg.color === 'success' ? '#22c55e'
                                              : cfg.color === 'warning' ? '#f59e0b'
                                              : '#6366f1' }}
                                />
                              </Box>
                              <Label color={cfg.color} sx={{ fontWeight: 600 }}>
                                {cfg.label}
                              </Label>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {log.entity_title ? (
                              <Box>
                                <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 240 }}>
                                  {log.entity_title}
                                </Typography>
                                {log.entity_type && (
                                  <Typography variant="caption" color="text.disabled">
                                    {log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Iconify icon="solar:users-group-rounded-bold" width={15} sx={{ color: 'text.disabled' }} />
                              <Typography variant="body2">{log.actor}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {log.ip_address ? (
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'background.neutral', px: 1, py: 0.25, borderRadius: 0.75 }}>
                                {log.ip_address === '::1' || log.ip_address === '127.0.0.1' ? 'localhost' : log.ip_address}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip title={new Date(log.created_at).toLocaleString('id-ID')}>
                              <Box>
                                <Typography variant="caption" display="block" fontWeight={500}>
                                  {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            page={page}
            count={total}
            rowsPerPage={LIMIT}
            rowsPerPageOptions={[LIMIT]}
            onPageChange={(_, newPage) => { setPage(newPage); }}
          />
        </Card>
      </DashboardContent>
    </AdminLayout>
  );
};
