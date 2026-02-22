import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import { CabinetMember, Division } from '../../types';

// ----------------------------------------------------------------------

const DEPT_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Pimpinan: 'error',
  BPH: 'warning',
};
const getDeptColor = (dept: string) => DEPT_COLORS[dept] || 'info';

type MemberForm = { division_id: number; name: string; position: string; prodi: string; bio: string; instagram: string; linkedin: string; order: number };
type DivisionForm = { cabinet_id: number; name: string; description: string; order: number };
type CabinetForm = { period_id: number; name: string; tagline: string; vision: string; mission: string; description: string };

const EMPTY_MEMBER: MemberForm = { division_id: 0, name: '', position: '', prodi: '', bio: '', instagram: '', linkedin: '', order: 0 };
const EMPTY_CABINET: CabinetForm = { period_id: 0, name: '', tagline: '', vision: '', mission: '', description: '' };

// ----------------------------------------------------------------------

export const AdminCabinet: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [members, setMembers] = useState<CabinetMember[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [cabinets, setCabinets] = useState<{ id: number; name: string }[]>([]);
  const [periods, setPeriods] = useState<{ id: number; name: string; year_start: number; year_end: number; is_active: boolean }[]>([]);
  const [cabinetsFull, setCabinetsFull] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Members state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [filterName, setFilterName] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [memberDialog, setMemberDialog] = useState<{ open: boolean; edit?: CabinetMember }>({ open: false });
  const [memberForm, setMemberForm] = useState<MemberForm>(EMPTY_MEMBER);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: number; name?: string; type: 'member' | 'division' }>({ open: false, type: 'member' });

  // Divisions state
  const [divDialog, setDivDialog] = useState<{ open: boolean; edit?: Division }>({ open: false });
  const [divForm, setDivForm] = useState<DivisionForm>({ cabinet_id: 0, name: '', description: '', order: 0 });

  // Cabinets state
  const [cabinetDialog, setCabinetDialog] = useState<{ open: boolean; edit?: any }>({ open: false });
  const [cabinetForm, setCabinetForm] = useState<CabinetForm>(EMPTY_CABINET);
  const [deleteCabinetDialog, setDeleteCabinetDialog] = useState<{ open: boolean; item?: any }>({ open: false });

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [membersData, divisionsData, cabinetsData, periodsData] = await Promise.all([
        api.getAllMembersAdmin(), // all members across all cabinets
        api.getDivisions(),
        api.getCabinets(),
        api.getPeriods(),
      ]);
      setMembers(membersData);
      setDivisions(divisionsData);
      setCabinets(cabinetsData);
      setPeriods(periodsData.map((p: any) => ({ ...p, id: Number(p.id) })));
      setCabinetsFull(cabinetsData.map((c: any) => ({ ...c })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // ── MEMBER CRUD ──────────────────────────────────────────────

  const openCreateMember = () => {
    const defaultDivId = divisions[0]?.id ?? 0;
    setMemberForm({ ...EMPTY_MEMBER, division_id: defaultDivId });
    setMemberDialog({ open: true });
  };

  const openEditMember = (m: CabinetMember) => {
    const divId = m.division_id ?? divisions.find(d => d.name === m.department)?.id ?? 0;
    setMemberForm({ division_id: divId, name: m.name, position: m.position, prodi: m.prodi || '', bio: m.bio || '', instagram: m.instagram || '', linkedin: m.linkedin || '', order: m.order ?? 0 });
    setMemberDialog({ open: true, edit: m });
  };

  const saveMember = async () => {
    if (!memberForm.name || !memberForm.position || !memberForm.division_id) return;
    try {
      setSaving(true);
      if (memberDialog.edit) {
        await api.updateMember(memberDialog.edit.id, memberForm);
        showAlert('success', 'Anggota berhasil diperbarui');
      } else {
        await api.createMember(memberForm);
        showAlert('success', 'Anggota berhasil ditambahkan');
      }
      api.clearCache('/cabinet');
      setMemberDialog({ open: false });
      await loadAll();
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menyimpan anggota');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteMember = (m: CabinetMember) => setDeleteDialog({ open: true, id: m.id, name: m.name, type: 'member' });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return;
    try {
      setSaving(true);
      if (deleteDialog.type === 'member') {
        await api.deleteMember(deleteDialog.id);
        showAlert('success', 'Anggota berhasil dihapus');
      } else {
        await api.deleteDivision(deleteDialog.id);
        showAlert('success', 'Departemen berhasil dihapus');
      }
      api.clearCache('/cabinet');
      setDeleteDialog({ open: false, type: 'member' });
      await loadAll();
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menghapus');
    } finally {
      setSaving(false);
    }
  };

  // ── DIVISION CRUD ─────────────────────────────────────────────

  const openCreateDiv = () => {
    setDivForm({ cabinet_id: cabinets[0]?.id ?? 0, name: '', description: '', order: 0 });
    setDivDialog({ open: true });
  };

  const openEditDiv = (d: Division) => {
    setDivForm({ cabinet_id: d.cabinet_id, name: d.name, description: d.description || '', order: d.order ?? 0 });
    setDivDialog({ open: true, edit: d });
  };

  const saveDiv = async () => {
    if (!divForm.name || !divForm.cabinet_id) return;
    try {
      setSaving(true);
      if (divDialog.edit) {
        await api.updateDivision(divDialog.edit.id, { name: divForm.name, description: divForm.description, order: divForm.order });
        showAlert('success', 'Departemen berhasil diperbarui');
      } else {
        await api.createDivision(divForm);
        showAlert('success', 'Departemen berhasil ditambahkan');
      }
      setDivDialog({ open: false });
      await loadAll();
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menyimpan departemen');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteDiv = (d: Division) => setDeleteDialog({ open: true, id: d.id, name: d.name, type: 'division' });

  // ── CABINET CRUD ──────────────────────────────────────────────

  const openCreateCabinet = () => {
    const defaultPeriod = periods[0]?.id ?? 0;
    setCabinetForm({ ...EMPTY_CABINET, period_id: defaultPeriod });
    setCabinetDialog({ open: true });
  };

  const openEditCabinet = (c: any) => {
    setCabinetForm({ period_id: Number(c.period_id) || 0, name: c.name || '', tagline: c.tagline || '', vision: c.vision || '', mission: c.mission || '', description: c.description || '' });
    setCabinetDialog({ open: true, edit: c });
  };

  const saveCabinet = async () => {
    if (!cabinetForm.name || !cabinetForm.period_id) return;
    try {
      setSaving(true);
      const payload = { period_id: cabinetForm.period_id, name: cabinetForm.name, tagline: cabinetForm.tagline || undefined, vision: cabinetForm.vision || undefined, mission: cabinetForm.mission || undefined, description: cabinetForm.description || undefined };
      if (cabinetDialog.edit) {
        await api.updateCabinet(Number(cabinetDialog.edit.id), payload);
        showAlert('success', 'Kabinet berhasil diperbarui');
      } else {
        await api.createCabinet(payload);
        showAlert('success', 'Kabinet berhasil ditambahkan');
      }
      api.clearCache('/cabinet');
      setCabinetDialog({ open: false });
      await loadAll();
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menyimpan kabinet');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCabinet = async () => {
    if (!deleteCabinetDialog.item) return;
    try {
      setSaving(true);
      await api.deleteCabinet(Number(deleteCabinetDialog.item.id));
      api.clearCache('/cabinet');
      showAlert('success', 'Kabinet berhasil dihapus');
      setDeleteCabinetDialog({ open: false });
      await loadAll();
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menghapus kabinet');
    } finally {
      setSaving(false);
    }
  };

  const uniqueDepts = Array.from(new Set(members.map(m => m.department || 'Umum')));

  const dataFiltered = members.filter(m => {
    const matchName = !filterName || m.name.toLowerCase().includes(filterName.toLowerCase()) || (m.position || '').toLowerCase().includes(filterName.toLowerCase());
    const matchDept = !filterDept || (m.department || 'Umum') === filterDept;
    return matchName && matchDept;
  });

  const paginated = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── RENDER ────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <DashboardContent>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">Anggota Kabinet</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {members.length} anggota · {divisions.length} departemen · {cabinetsFull.length} kabinet
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {tab === 0 ? (
            <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreateMember}>
              Tambah Anggota
            </Button>
          ) : tab === 1 ? (
            <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreateDiv}>
              Tambah Departemen
            </Button>
          ) : (
            <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreateCabinet}>
              Tambah Kabinet
            </Button>
          )}
        </Box>

        {/* Alert */}
        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
            {alert.msg}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Anggota (${members.length})`} />
          <Tab label={`Departemen (${divisions.length})`} />
          <Tab label={`Kabinet (${cabinetsFull.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          // ── TAB ANGGOTA ──────────────────────────────────────
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
              <OutlinedInput
                value={filterName}
                onChange={(e) => { setFilterName(e.target.value); setPage(0); }}
                placeholder="Cari nama atau jabatan..."
                startAdornment={<InputAdornment position="start"><Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} /></InputAdornment>}
                sx={{ maxWidth: 360 }}
              />
            </Stack>

            <Box sx={{ mb: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label={`Semua (${members.length})`} onClick={() => { setFilterDept(''); setPage(0); }} color={filterDept === '' ? 'primary' : 'default'} variant={filterDept === '' ? 'filled' : 'outlined'} size="small" />
              {uniqueDepts.map(dept => (
                <Chip key={dept} label={`${dept} (${members.filter(m => (m.department || 'Umum') === dept).length})`} onClick={() => { setFilterDept(dept === filterDept ? '' : dept); setPage(0); }} color={filterDept === dept ? 'primary' : 'default'} variant={filterDept === dept ? 'filled' : 'outlined'} size="small" />
              ))}
            </Box>

            {dataFiltered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Iconify icon="solar:users-group-rounded-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  {filterName || filterDept ? 'Tidak ada hasil yang cocok' : 'Belum ada anggota'}
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={2.5}>
                  {paginated.map((member) => (
                    <Grid key={member.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                          <Avatar
                            alt={member.name}
                            src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=128`}
                            sx={{ width: 72, height: 72, mx: 'auto', mb: 1.5 }}
                          />
                          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>{member.name}</Typography>
                          <Typography variant="body2" noWrap sx={{ color: 'text.secondary', mb: 1.5 }}>{member.position || '-'}</Typography>
                          <Label color={getDeptColor(member.department || 'Umum')}>{member.department || 'Umum'}</Label>
                          {member.prodi && (
                            <Typography variant="caption" display="block" sx={{ color: 'text.disabled', mt: 0.5 }}>{member.prodi}</Typography>
                          )}
                        </CardContent>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEditMember(member)}>
                              <Iconify icon="solar:pen-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus">
                            <IconButton size="small" color="error" onClick={() => confirmDeleteMember(member)}>
                              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <TablePagination
                  component="div"
                  page={page}
                  count={dataFiltered.length}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(_, v) => setPage(v)}
                  rowsPerPageOptions={[12, 24, 48]}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  sx={{ mt: 3 }}
                />
              </>
            )}
          </>
        ) : tab === 1 ? (
          // ── TAB DEPARTEMEN ───────────────────────────────────
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Departemen</TableCell>
                    <TableCell>Kabinet</TableCell>
                    <TableCell>Deskripsi</TableCell>
                    <TableCell align="center">Jumlah Anggota</TableCell>
                    <TableCell align="center">Urutan</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {divisions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        Belum ada departemen
                      </TableCell>
                    </TableRow>
                  ) : (
                    divisions.map(d => (
                      <TableRow key={d.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{d.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{d.cabinet_name || '-'}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 240 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>{d.description || '-'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Label color="info">{d.member_count ?? 0}</Label>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{d.order ?? 0}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => openEditDiv(d)}>
                                <Iconify icon="solar:pen-bold" width={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus">
                              <IconButton size="small" color="error" onClick={() => confirmDeleteDiv(d)}>
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : tab === 2 ? (
          // ── TAB KABINET ──────────────────────────────────────
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Kabinet</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Tagline</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cabinetsFull.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Belum ada kabinet. Buat kabinet baru di atas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cabinetsFull.map((c: any) => (
                      <TableRow key={c.id} hover>
                        <TableCell><Typography variant="subtitle2">{c.name}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{periods.find(p => p.id === Number(c.period_id))?.name || `Periode #${c.period_id}`}</Typography></TableCell>
                        <TableCell sx={{ maxWidth: 240 }}><Typography variant="body2" color="text.secondary" noWrap>{c.tagline || '-'}</Typography></TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEditCabinet(c)}><Iconify icon="solar:pen-bold" width={18} /></IconButton></Tooltip>
                            <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => setDeleteCabinetDialog({ open: true, item: c })}><Iconify icon="solar:trash-bin-trash-bold" width={18} /></IconButton></Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : null}

        {/* ── CABINET DIALOG ────────────────────────────── */}
        <Dialog open={cabinetDialog.open} onClose={() => setCabinetDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>{cabinetDialog.edit ? 'Edit Kabinet' : 'Tambah Kabinet'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Periode</InputLabel>
                <Select value={cabinetForm.period_id || ''} label="Periode" onChange={(e) => setCabinetForm(f => ({ ...f, period_id: Number(e.target.value) }))}>
                  {periods.map(p => <MenuItem key={p.id} value={p.id}>{p.name} ({p.year_start}/{p.year_end})</MenuItem>)}
                </Select>
              </FormControl>
              <TextField required label="Nama Kabinet" value={cabinetForm.name} onChange={e => setCabinetForm(f => ({ ...f, name: e.target.value }))} fullWidth />
              <TextField label="Tagline" value={cabinetForm.tagline} onChange={e => setCabinetForm(f => ({ ...f, tagline: e.target.value }))} fullWidth />
              <TextField label="Visi" value={cabinetForm.vision} onChange={e => setCabinetForm(f => ({ ...f, vision: e.target.value }))} fullWidth multiline rows={2} />
              <TextField label="Misi" value={cabinetForm.mission} onChange={e => setCabinetForm(f => ({ ...f, mission: e.target.value }))} fullWidth multiline rows={3} placeholder="Pisahkan setiap misi dengan baris baru" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCabinetDialog({ open: false })}>Batal</Button>
            <Button variant="contained" onClick={saveCabinet} disabled={saving || !cabinetForm.name || !cabinetForm.period_id}>
              {saving ? <CircularProgress size={20} /> : (cabinetDialog.edit ? 'Simpan Perubahan' : 'Tambah')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── DELETE CABINET CONFIRM ─────────────────────── */}
        <Dialog open={deleteCabinetDialog.open} onClose={() => setDeleteCabinetDialog({ open: false })} maxWidth="xs" fullWidth>
          <DialogTitle>Hapus Kabinet</DialogTitle>
          <DialogContent>
            <DialogContentText>Yakin hapus kabinet <strong>{deleteCabinetDialog.item?.name}</strong>?</DialogContentText>
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>Semua departemen dan anggota di kabinet ini akan ikut terhapus.</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteCabinetDialog({ open: false })}>Batal</Button>
            <Button variant="contained" color="error" onClick={handleDeleteCabinet} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Hapus'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={memberDialog.open} onClose={() => setMemberDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>{memberDialog.edit ? 'Edit Anggota' : 'Tambah Anggota'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Departemen</InputLabel>
                <Select
                  value={memberForm.division_id || ''}
                  label="Departemen"
                  onChange={(e) => setMemberForm(f => ({ ...f, division_id: Number(e.target.value) }))}
                >
                  {divisions.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField required label="Nama Lengkap" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} fullWidth />
              <TextField required label="Jabatan" value={memberForm.position} onChange={e => setMemberForm(f => ({ ...f, position: e.target.value }))} fullWidth />
              <TextField label="Program Studi" value={memberForm.prodi} onChange={e => setMemberForm(f => ({ ...f, prodi: e.target.value }))} fullWidth />
              <TextField label="Urutan Tampil" type="number" value={memberForm.order} onChange={e => setMemberForm(f => ({ ...f, order: Number(e.target.value) }))} fullWidth helperText="Angka kecil tampil lebih dahulu (0 = otomatis)" InputProps={{ inputProps: { min: 0 } }} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setMemberDialog({ open: false })}>Batal</Button>
            <Button variant="contained" onClick={saveMember} disabled={saving || !memberForm.name || !memberForm.position || !memberForm.division_id}>
              {saving ? <CircularProgress size={20} /> : (memberDialog.edit ? 'Simpan Perubahan' : 'Tambah')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── DIVISION DIALOG ───────────────────────────── */}
        <Dialog open={divDialog.open} onClose={() => setDivDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>{divDialog.edit ? 'Edit Departemen' : 'Tambah Departemen'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {!divDialog.edit && (
                <FormControl fullWidth required>
                  <InputLabel>Kabinet</InputLabel>
                  <Select
                    value={divForm.cabinet_id || ''}
                    label="Kabinet"
                    onChange={(e) => setDivForm(f => ({ ...f, cabinet_id: Number(e.target.value) }))}
                  >
                    {cabinets.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField required label="Nama Departemen" value={divForm.name} onChange={e => setDivForm(f => ({ ...f, name: e.target.value }))} fullWidth />
              <TextField label="Deskripsi" value={divForm.description} onChange={e => setDivForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
              <TextField label="Urutan Tampil" type="number" value={divForm.order} onChange={e => setDivForm(f => ({ ...f, order: Number(e.target.value) }))} fullWidth inputProps={{ min: 0 }} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDivDialog({ open: false })}>Batal</Button>
            <Button variant="contained" onClick={saveDiv} disabled={saving || !divForm.name || !divForm.cabinet_id}>
              {saving ? <CircularProgress size={20} /> : (divDialog.edit ? 'Simpan Perubahan' : 'Tambah')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── DELETE CONFIRM ────────────────────────────── */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: 'member' })} maxWidth="xs" fullWidth>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Hapus <strong>{deleteDialog.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              {deleteDialog.type === 'division' && ' Semua anggota di departemen ini juga akan terhapus.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteDialog({ open: false, type: 'member' })}>Batal</Button>
            <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Hapus'}
            </Button>
          </DialogActions>
        </Dialog>

      </DashboardContent>
    </AdminLayout>
  );
};
