import React, { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Toolbar from '@mui/material/Toolbar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

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
import { RichTextEditor } from '../../components/RichTextEditor';

// ----------------------------------------------------------------------

type ViewMode = 'list' | 'editor';

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  category: 'news' as 'news' | 'event',
  status: 'draft' as 'draft' | 'published',
  author: '',
  featured_image: null as File | null,
  featured_image_preview: '' as string,
  meta_title: '',
  meta_description: '',
  og_image: '',
  canonical_url: '',
};

// ----------------------------------------------------------------------

export const AdminPosts: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── List state ──
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [totalPublished, setTotalPublished] = useState(0);
  const [totalDraft, setTotalDraft] = useState(0);

  // ── Editor state ──
  const [view, setView] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ ...emptyForm });

  // ── Load posts ──
  useEffect(() => {
    loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const loadPosts = async (skipCache = false) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const result = await api.getPosts(page + 1, rowsPerPage, skipCache, false);
      setPosts(result.data);
      setTotal(result.meta.total);
      setTotalPublished(result.data.filter((p: Post) => p.status === 'published').length);
      setTotalDraft(result.data.filter((p: Post) => p.status !== 'published').length);
    } catch {
      setError('Gagal memuat posts');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit (save draft or publish) ──
  const handleSubmit = async (publishNow?: boolean) => {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (!formData.title.trim() || formData.title.trim().length < 5)
        throw new Error('Judul minimal 5 karakter');
      if (!formData.content.trim() || formData.content.replace(/<[^>]*>/g, '').trim().length < 10)
        throw new Error('Konten terlalu pendek, minimal 10 karakter');

      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        status: publishNow ? 'published' : formData.status,
        author: formData.author.trim() || 'Admin BEM',
        meta_title: formData.meta_title.trim() || formData.title.trim(),
        meta_description: formData.meta_description.trim(),
        og_image: formData.og_image.trim(),
        canonical_url: formData.canonical_url.trim(),
      };

      if (editingId) {
        await api.updatePost(editingId, payload, formData.featured_image || undefined);
      } else {
        await api.createPost(payload, formData.featured_image || undefined);
      }

      if (publishNow) setFormData(f => ({ ...f, status: 'published' }));
      setSuccess(publishNow ? 'Artikel berhasil dipublish! 🎉' : 'Draft tersimpan ✓');
      await loadPosts(true);

      if (publishNow) {
        setTimeout(() => { setView('list'); setSuccess(''); }, 1800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus artikel ini?')) return;
    try {
      await api.deletePost(id);
      setSuccess('Artikel dihapus');
      setTimeout(() => loadPosts(true), 300);
    } catch {
      setError('Gagal menghapus');
    }
  };

  // ── Open editor ──
  const openEditor = (post?: Post) => {
    setError('');
    setSuccess('');
    if (post) {
      setEditingId(post.id);
      setFormData({
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category === 'Berita' ? 'news' : 'event',
        status: (post.status as 'draft' | 'published') || 'draft',
        author: post.author || '',
        featured_image: null,
        featured_image_preview: post.image_url || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        og_image: post.og_image || '',
        canonical_url: post.canonical_url || '',
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm });
    }
    setView('editor');
  };

  const goBackToList = () => {
    setView('list');
    setError('');
    setSuccess('');
  };

  // ── Image handling ──
  const handleImageFile = (file: File) => {
    const preview = URL.createObjectURL(file);
    setFormData(f => ({ ...f, featured_image: file, featured_image_preview: preview }));
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  };

  // ── Table sorting/selection ──
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
  const isPublished = formData.status === 'published';

  // ══════════════════════════════════════════════
  // EDITOR VIEW — full-page blog editor
  // ══════════════════════════════════════════════
  if (view === 'editor') {
    return (
      <AdminLayout>
        <DashboardContent sx={{ p: 0 }}>

          {/* ── Sticky top bar ── */}
          <Box sx={{
            px: 2,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            flexWrap: 'wrap',
          }}>
            <Tooltip title="Kembali ke daftar artikel">
              <IconButton onClick={goBackToList} size="small" sx={{ mr: 0.5 }}>
                <Iconify icon="eva:arrow-back-fill" width={20} />
              </IconButton>
            </Tooltip>

            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
              {editingId ? 'Edit Artikel' : 'Artikel Baru'}
            </Typography>

            <Chip
              size="small"
              label={isPublished ? '● Published' : '○ Draft'}
              color={isPublished ? 'success' : 'default'}
              sx={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.3 }}
            />

            {error && (
              <Alert severity="error" sx={{ py: 0.25, px: 1.5, fontSize: 12, maxWidth: 300 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ py: 0.25, px: 1.5, fontSize: 12, maxWidth: 300 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <Button
              variant="outlined"
              size="small"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              startIcon={submitting ? <CircularProgress size={13} /> : <Iconify icon="solar:diskette-bold" width={16} />}
              sx={{ minWidth: 110 }}
            >
              Simpan Draft
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              startIcon={<Iconify icon="solar:upload-bold" width={16} />}
              color="primary"
              sx={{ minWidth: 130 }}
            >
              {isPublished ? 'Update & Publish' : 'Publish Sekarang'}
            </Button>
          </Box>

          {/* ── Two-column editor body ── */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
            minHeight: 'calc(100vh - 130px)',
            alignItems: 'start',
          }}>

            {/* ── LEFT: Writing area ── */}
            <Box sx={{
              p: { xs: 2.5, md: 4, lg: 5 },
              borderRight: { lg: '1px solid' },
              borderColor: 'divider',
            }}>
              {/* Big title */}
              <TextField
                fullWidth
                variant="standard"
                placeholder="Tulis judul artikel di sini..."
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                disabled={submitting}
                InputProps={{
                  disableUnderline: false,
                  sx: {
                    fontSize: { xs: 22, md: 30, lg: 34 },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: 'text.primary',
                    '&::before': { borderBottomColor: 'transparent' },
                    '&:hover:not(.Mui-disabled)::before': { borderBottomColor: 'divider' },
                    '&.Mui-focused::after': { borderBottomColor: 'primary.main' },
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              {/* Category + Author inline */}
              <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    label="Kategori"
                    onChange={(e) => setFormData(f => ({ ...f, category: e.target.value as any }))}
                    disabled={submitting}
                  >
                    <MenuItem value="news">📰 Berita</MenuItem>
                    <MenuItem value="event">📅 Event</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Nama Penulis"
                  value={formData.author}
                  onChange={(e) => setFormData(f => ({ ...f, author: e.target.value }))}
                  placeholder="Admin BEM"
                  disabled={submitting}
                  sx={{ minWidth: 200 }}
                />
              </Stack>

              {/* Excerpt */}
              <TextField
                fullWidth
                label="Ringkasan / Excerpt"
                placeholder="Tulis ringkasan singkat yang menarik (akan tampil di daftar berita)..."
                value={formData.excerpt}
                onChange={(e) => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                multiline
                rows={2}
                disabled={submitting}
                sx={{ mb: 3 }}
              />

              {/* Divider */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Konten Artikel
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>

              {/* Rich text editor */}
              <RichTextEditor
                value={formData.content}
                onChange={(html) => setFormData(f => ({ ...f, content: html }))}
                placeholder="Mulai tulis konten artikel di sini... Gunakan toolbar untuk heading, bold, list, link, dan lainnya."
                disabled={submitting}
                minHeight={520}
              />
            </Box>

            {/* ── RIGHT: Settings sidebar ── */}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, position: { lg: 'sticky' }, top: { lg: 64 } }}>

              {/* Status card */}
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="solar:settings-bold" width={16} sx={{ color: 'text.secondary' }} />
                  Status Publikasi
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData(f => ({ ...f, status: e.target.value as any }))}
                    disabled={submitting}
                  >
                    <MenuItem value="draft">
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>Draft</Typography>
                          <Typography variant="caption" color="text.secondary">Belum tampil di publik</Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="published">
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>Published</Typography>
                          <Typography variant="caption" color="text.secondary">Tampil di halaman publik</Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Card>

              {/* Featured image card */}
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Iconify icon="solar:gallery-bold" width={16} sx={{ color: 'text.secondary' }} />
                  Gambar Utama
                </Typography>

                <Box
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    minHeight: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.neutral',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                  }}
                >
                  {formData.featured_image_preview ? (
                    <>
                      <Box
                        component="img"
                        src={formData.featured_image_preview}
                        sx={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }}
                      />
                      <Box sx={{
                        position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                      }}>
                        <Stack alignItems="center" gap={0.5}>
                          <Iconify icon="solar:camera-add-bold" width={28} sx={{ color: 'white' }} />
                          <Typography variant="caption" color="white" fontWeight={600}>Ganti Gambar</Typography>
                        </Stack>
                      </Box>
                    </>
                  ) : (
                    <Stack alignItems="center" gap={1} sx={{ p: 2 }}>
                      <Iconify icon="solar:gallery-add-bold" width={36} sx={{ color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Klik atau drag gambar
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        JPG, PNG, WebP — maks. 5MB
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                    e.target.value = '';
                  }}
                />

                {formData.featured_image && (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="caption" color="success.main" noWrap sx={{ maxWidth: 220 }}>
                      ✓ {formData.featured_image.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(f => ({ ...f, featured_image: null, featured_image_preview: '' }));
                      }}
                    >
                      <Iconify icon="eva:close-fill" width={15} />
                    </IconButton>
                  </Stack>
                )}
              </Card>

              {/* SEO accordion */}
              <Accordion
                variant="outlined"
                disableGutters
                sx={{ borderRadius: '8px !important', '&:before': { display: 'none' } }}
              >
                <AccordionSummary
                  expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={18} />}
                  sx={{ borderRadius: 1 }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Iconify icon="solar:chart-2-bold" width={18} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={700}>Pengaturan SEO</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Meta Title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(f => ({ ...f, meta_title: e.target.value }))}
                    placeholder="Default: judul artikel"
                    inputProps={{ maxLength: 60 }}
                    helperText={
                      <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Ideal 50–60 karakter</span>
                        <span style={{ color: formData.meta_title.length > 55 ? '#f59e0b' : undefined }}>
                          {formData.meta_title.length}/60
                        </span>
                      </Box>
                    }
                    disabled={submitting}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Meta Description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(f => ({ ...f, meta_description: e.target.value }))}
                    placeholder="Deskripsi untuk Google & social media"
                    multiline
                    rows={3}
                    inputProps={{ maxLength: 160 }}
                    helperText={
                      <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Ideal 120–160 karakter</span>
                        <span style={{ color: formData.meta_description.length > 150 ? '#f59e0b' : undefined }}>
                          {formData.meta_description.length}/160
                        </span>
                      </Box>
                    }
                    disabled={submitting}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="OG Image URL"
                    value={formData.og_image}
                    onChange={(e) => setFormData(f => ({ ...f, og_image: e.target.value }))}
                    placeholder="URL gambar sosial (1200×630)"
                    disabled={submitting}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Canonical URL"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData(f => ({ ...f, canonical_url: e.target.value }))}
                    placeholder="https://... (opsional)"
                    disabled={submitting}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Bottom action buttons (visible on mobile) */}
              <Stack direction="row" spacing={1} sx={{ display: { lg: 'none' } }}>
                <Button fullWidth variant="outlined" disabled={submitting} onClick={() => handleSubmit(false)}>
                  Simpan Draft
                </Button>
                <Button fullWidth variant="contained" disabled={submitting} onClick={() => handleSubmit(true)}>
                  Publish
                </Button>
              </Stack>
            </Box>
          </Box>
        </DashboardContent>
      </AdminLayout>
    );
  }

  // ══════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════
  return (
    <AdminLayout>
      <DashboardContent>

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={800}>Kelola Artikel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Buat, edit, dan kelola semua berita &amp; event BEM FST UNISA
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => openEditor()}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            Tulis Artikel Baru
          </Button>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Stats row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {[
            { label: 'Total Artikel', value: total, icon: 'solar:document-text-bold', color: '#6366f1', bg: '#6366f115' },
            { label: 'Published', value: totalPublished, icon: 'solar:check-circle-bold', color: '#22c55e', bg: '#22c55e15' },
            { label: 'Draft', value: totalDraft, icon: 'solar:pen-bold', color: '#f59e0b', bg: '#f59e0b15' },
          ].map((stat) => (
            <Card key={stat.label} variant="outlined" sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 46, height: 46,
                borderRadius: 2,
                bgcolor: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Iconify icon={stat.icon} width={22} sx={{ color: stat.color }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} lineHeight={1.1}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Table card */}
        <Card>
          {/* Search toolbar */}
          <Toolbar
            sx={{
              height: 80,
              display: 'flex',
              justifyContent: 'space-between',
              px: 2,
              gap: 2,
              ...(selected.length > 0 && { color: 'primary.main', bgcolor: 'primary.lighter' }),
            }}
          >
            {selected.length > 0 ? (
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{selected.length} artikel dipilih</Typography>
            ) : (
              <OutlinedInput
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Cari judul artikel..."
                size="small"
                startAdornment={
                  <InputAdornment position="start">
                    <Iconify width={18} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                }
                sx={{ maxWidth: 300 }}
              />
            )}
            {selected.length > 0 ? (
              <Tooltip title="Hapus yang dipilih">
                <IconButton color="error" onClick={() => selected.forEach(id => handleDelete(Number(id)))}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Filter">
                <IconButton>
                  <Iconify icon="ic:round-filter-list" />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 750 }}>
                <UserTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={posts.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) => onSelectAllRows(checked, posts.map(p => String(p.id)))}
                  headLabel={[
                    { id: 'title', label: 'Artikel' },
                    { id: 'category', label: 'Kategori' },
                    { id: 'status', label: 'Status' },
                    { id: 'created_at', label: 'Tanggal' },
                    { id: '', label: '' },
                  ]}
                />
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                          Memuat artikel...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataFiltered.map((post) => (
                      <TableRow
                        hover
                        key={post.id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selected.includes(String(post.id))}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => openEditor(post)}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
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
                              src={post.image_url || `/assets/images/cover/cover-1.webp`}
                              alt={post.title}
                              sx={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0, border: '1px solid', borderColor: 'divider' }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 290 }}>
                                {post.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 290, display: 'block' }}>
                                {post.excerpt || '—'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Label color={post.category === 'Berita' ? 'info' : 'warning'}>
                            {post.category}
                          </Label>
                        </TableCell>
                        <TableCell>
                          <Label color={post.status === 'published' ? 'success' : 'default'}>
                            {post.status === 'published' ? 'Published' : 'Draft'}
                          </Label>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(post.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                            <Tooltip title="Edit artikel">
                              <IconButton
                                onClick={() => openEditor(post)}
                                size="small"
                                color="primary"
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus artikel">
                              <IconButton
                                onClick={() => handleDelete(post.id)}
                                size="small"
                                color="error"
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableEmptyRows height={72} emptyRows={emptyRows(page, rowsPerPage, total)} />
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
      </DashboardContent>
    </AdminLayout>
  );
};
