import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import OutlinedInput from '@mui/material/OutlinedInput';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Toolbar from '@mui/material/Toolbar';

import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { AdminLayout } from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { Post } from '../../types';

import { UserTableHead } from 'src/sections/user/user-table-head';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import { TableNoData } from 'src/sections/user/table-no-data';
import { emptyRows } from 'src/sections/user/utils';

// ----------------------------------------------------------------------

export const AdminPosts: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'news' as 'news' | 'event',
    status: 'draft' as 'draft' | 'published',
    featured_image: null as File | null,
  });

  useEffect(() => {
    loadPosts();
  }, [page, rowsPerPage]);

  const loadPosts = async (skipCache = false) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const result = await api.getPosts(page + 1, rowsPerPage, skipCache);
      setPosts(result.data);
      setTotal(result.meta.total);
    } catch (error) {
      setError('Gagal memuat posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus post ini?')) return;
    try {
      await api.deletePost(id);
      setSuccess('Post berhasil dihapus');
      setTimeout(() => loadPosts(true), 300);
    } catch {
      setError('Gagal menghapus post');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (!formData.title.trim() || formData.title.trim().length < 5) {
        throw new Error('Judul minimal 5 karakter');
      }
      if (!formData.content.trim() || formData.content.trim().length < 10) {
        throw new Error('Konten minimal 10 karakter');
      }
      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        status: formData.status,
      };
      if (editingId) {
        await api.updatePost(editingId, payload, formData.featured_image || undefined);
        setSuccess('Post berhasil diperbarui!');
      } else {
        await api.createPost(payload, formData.featured_image || undefined);
        setSuccess('Post berhasil dibuat!');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', excerpt: '', content: '', category: 'news', status: 'draft', featured_image: null });
      await loadPosts(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan post');
    } finally {
      setSubmitting(false);
    }
  };

  const onSort = useCallback((id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  }, [order, orderBy]);

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    setSelected(checked ? newSelecteds : []);
  }, []);

  const onSelectRow = useCallback((id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  }, []);

  const dataFiltered = posts.filter(p =>
    !filterName || p.title.toLowerCase().includes(filterName.toLowerCase())
  );
  const notFound = !dataFiltered.length && !!filterName;

  const openEditForm = (post: Post) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category === 'Berita' ? 'news' : 'event',
      status: 'draft',
      featured_image: null,
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingId(null);
    setFormData({ title: '', excerpt: '', content: '', category: 'news', status: 'draft', featured_image: null });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  return (
    <AdminLayout>
      <DashboardContent>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Kelola Berita &amp; Event
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openNewForm}
          >
            Post Baru
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Card>
          {/* Toolbar */}
          <Toolbar
            sx={{
              height: 96,
              display: 'flex',
              justifyContent: 'space-between',
              p: (theme) => theme.spacing(0, 1, 0, 3),
              ...(selected.length > 0 && { color: 'primary.main', bgcolor: 'primary.lighter' }),
            }}
          >
            {selected.length > 0 ? (
              <Typography component="div" variant="subtitle1">{selected.length} dipilih</Typography>
            ) : (
              <OutlinedInput
                fullWidth
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Cari post..."
                startAdornment={
                  <InputAdornment position="start">
                    <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                }
                sx={{ maxWidth: 320 }}
              />
            )}
            {selected.length > 0 ? (
              <IconButton onClick={() => selected.forEach(id => handleDelete(Number(id)))}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            ) : (
              <IconButton>
                <Iconify icon="ic:round-filter-list" />
              </IconButton>
            )}
          </Toolbar>

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={posts.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) => onSelectAllRows(checked, posts.map(p => String(p.id)))}
                  headLabel={[
                    { id: 'title', label: 'Judul' },
                    { id: 'category', label: 'Kategori' },
                    { id: 'status', label: 'Status' },
                    { id: 'created_at', label: 'Tanggal' },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataFiltered.map((post) => (
                      <TableRow hover key={post.id} tabIndex={-1} role="checkbox" selected={selected.includes(String(post.id))}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            disableRipple
                            checked={selected.includes(String(post.id))}
                            onChange={() => onSelectRow(String(post.id))}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={post.featured_image_url || `/assets/images/cover/cover-1.webp`}
                              alt={post.title}
                              sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                            />
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {post.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Label color={post.category === 'Berita' ? 'info' : 'warning'}>
                            {post.category}
                          </Label>
                        </TableCell>
                        <TableCell>
                          <Label color="success">Published</Label>
                        </TableCell>
                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <IconButton onClick={() => openEditForm(post)} size="small" color="primary">
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(post.id)} size="small" color="error">
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableEmptyRows height={68} emptyRows={emptyRows(page, rowsPerPage, total)} />
                  {notFound && <TableNoData searchQuery={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            page={page}
            count={total}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingId ? 'Edit Post' : 'Post Baru'}</DialogTitle>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" id="post-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Judul *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={submitting}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    label="Kategori"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    disabled={submitting}
                  >
                    <MenuItem value="news">Berita</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    disabled={submitting}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                fullWidth
                label="Excerpt / Ringkasan"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                multiline
                rows={2}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Konten *"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={8}
                disabled={submitting}
              />
              <Button component="label" variant="outlined" startIcon={<Iconify icon="solar:upload-bold" />}>
                Upload Gambar
                <input type="file" hidden accept="image/*" onChange={(e) => setFormData({ ...formData, featured_image: e.target.files?.[0] || null })} />
              </Button>
              {formData.featured_image && (
                <Typography variant="caption" color="success.main">✓ {formData.featured_image.name}</Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)} disabled={submitting}>Batal</Button>
            <Button
              form="post-form"
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : undefined}
            >
              {submitting ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardContent>
    </AdminLayout>
  );
};
