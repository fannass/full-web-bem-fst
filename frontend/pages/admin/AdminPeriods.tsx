import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Typography, Button, Stack, Alert, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, IconButton, Tooltip, Switch, FormControlLabel,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';

interface Period {
  id: number;
  name: string;
  year_start: number;
  year_end: number;
  is_active: boolean;
  description?: string;
}

type PeriodForm = { name: string; year_start: string; year_end: string; is_active: boolean; description: string };
const EMPTY_FORM: PeriodForm = { name: '', year_start: '', year_end: '', is_active: false, description: '' };

export const AdminPeriods: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; edit?: Period }>({ open: false });
  const [form, setForm] = useState<PeriodForm>(EMPTY_FORM);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: Period }>({ open: false });

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPeriods();
      setPeriods(data.map((p: any) => ({ ...p, id: Number(p.id) })));
    } catch {
      showAlert('error', 'Gagal memuat data periode');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setDialog({ open: true });
  };

  const openEdit = (p: Period) => {
    setForm({
      name: p.name,
      year_start: String(p.year_start),
      year_end: String(p.year_end),
      is_active: p.is_active,
      description: p.description || '',
    });
    setDialog({ open: true, edit: p });
  };

  const save = async () => {
    if (!form.name || !form.year_start || !form.year_end) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        year_start: Number(form.year_start),
        year_end: Number(form.year_end),
        is_active: form.is_active,
        description: form.description || undefined,
      };
      if (dialog.edit) {
        await api.updatePeriod(dialog.edit.id, payload);
        showAlert('success', 'Periode berhasil diperbarui');
      } else {
        await api.createPeriod(payload);
        showAlert('success', 'Periode berhasil ditambahkan');
      }
      setDialog({ open: false });
      await load();
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menyimpan periode');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      setSaving(true);
      await api.deletePeriod(deleteDialog.item.id);
      showAlert('success', 'Periode berhasil dihapus');
      setDeleteDialog({ open: false });
      await load();
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menghapus periode');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="solar:clock-circle-outline" width={28} sx={{ color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700}>Manajemen Periode</Typography>
          </Stack>
          <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" width={20} />} onClick={openCreate}>
            Tambah Periode
          </Button>
        </Stack>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
            {alert.msg}
          </Alert>
        )}

        <Card>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Periode</TableCell>
                    <TableCell align="center">Tahun</TableCell>
                    <TableCell>Deskripsi</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Belum ada periode. Tambahkan periode terlebih dahulu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    periods.map(p => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{p.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{p.year_start} / {p.year_end}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 260 }}>
                          <Typography variant="body2" color="text.secondary" noWrap>{p.description || '-'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          {p.is_active ? (
                            <Chip label="Aktif" color="success" size="small" />
                          ) : (
                            <Chip label="Tidak Aktif" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => openEdit(p)}>
                                <Iconify icon="solar:pen-bold" width={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus">
                              <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, item: p })}>
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* FORM DIALOG */}
        <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>{dialog.edit ? 'Edit Periode' : 'Tambah Periode'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField required label="Nama Periode" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth placeholder="cth: Kabinet Loyalist Spectra" />
              <Stack direction="row" spacing={2}>
                <TextField required label="Tahun Mulai" type="number" value={form.year_start} onChange={e => setForm(f => ({ ...f, year_start: e.target.value }))} fullWidth />
                <TextField required label="Tahun Selesai" type="number" value={form.year_end} onChange={e => setForm(f => ({ ...f, year_end: e.target.value }))} fullWidth />
              </Stack>
              <TextField label="Deskripsi" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
              <FormControlLabel
                control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} color="success" />}
                label="Jadikan periode aktif (menggantikan periode aktif saat ini)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialog({ open: false })}>Batal</Button>
            <Button variant="contained" onClick={save} disabled={saving || !form.name || !form.year_start || !form.year_end}>
              {saving ? <CircularProgress size={20} /> : (dialog.edit ? 'Simpan Perubahan' : 'Tambah')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DELETE CONFIRM */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })} maxWidth="xs" fullWidth>
          <DialogTitle>Hapus Periode</DialogTitle>
          <DialogContent>
            <Typography>Yakin hapus periode <strong>{deleteDialog.item?.name}</strong>?</Typography>
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Semua kabinet yang menggunakan periode ini akan ikut terhapus.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteDialog({ open: false })}>Batal</Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Hapus'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};
