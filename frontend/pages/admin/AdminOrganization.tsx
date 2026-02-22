import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Typography, TextField, Button, Stack,
  Alert, CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Iconify } from 'src/components/iconify';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';

interface OrgForm {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  social_instagram: string;
  social_twitter: string;
  social_youtube: string;
  social_facebook: string;
}

const EMPTY: OrgForm = {
  name: '', description: '', address: '', email: '', phone: '',
  social_instagram: '', social_twitter: '', social_youtube: '', social_facebook: '',
};

export const AdminOrganization: React.FC = () => {
  const [orgId, setOrgId] = useState<number | null>(null);
  const [form, setForm] = useState<OrgForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const org = await api.getOrganizationRaw();
      if (org) {
        setOrgId(Number(org.id));
        const sm = org.social_media || {};
        setForm({
          name: org.name || '',
          description: org.description || '',
          address: org.address || '',
          email: org.email || '',
          phone: org.phone || '',
          social_instagram: sm.instagram || '',
          social_twitter: sm.twitter || '',
          social_youtube: sm.youtube || '',
          social_facebook: sm.facebook || '',
        });
      }
    } catch (e) {
      showAlert('error', 'Gagal memuat data organisasi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!orgId || !form.name) return;
    try {
      setSaving(true);
      const social_media: Record<string, string> = {};
      if (form.social_instagram) social_media.instagram = form.social_instagram;
      if (form.social_twitter) social_media.twitter = form.social_twitter;
      if (form.social_youtube) social_media.youtube = form.social_youtube;
      if (form.social_facebook) social_media.facebook = form.social_facebook;

      await api.updateOrganization(orgId, {
        name: form.name,
        description: form.description,
        address: form.address,
        email: form.email,
        phone: form.phone,
        social_media,
      });
      showAlert('success', 'Informasi organisasi berhasil disimpan');
    } catch (e: any) {
      showAlert('error', e?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const f = (field: keyof OrgForm) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value })),
    fullWidth: true,
  });

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
          <Iconify icon="solar:settings-bold-duotone" width={28} sx={{ color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>Informasi Organisasi</Typography>
        </Stack>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
            {alert.msg}
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Informasi Umum</Typography>
          <Stack spacing={2.5}>
            <TextField {...f('name')} label="Nama Organisasi" required />
            <TextField {...f('description')} label="Deskripsi" multiline rows={3} />
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Kontak</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...f('email')} label="Email" type="email" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...f('phone')} label="Nomor Telepon / WhatsApp" />
            </Grid>
            <Grid size={12}>
              <TextField {...f('address')} label="Alamat" multiline rows={2} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Media Sosial</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...f('social_instagram')} label="Instagram" placeholder="@username" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...f('social_twitter')} label="Twitter / X" placeholder="@username" InputProps={{ startAdornment: <Iconify icon="socials:twitter" width={20} sx={{ mr: 1 }} /> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...f('social_youtube')} label="YouTube" placeholder="URL channel" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...f('social_facebook')} label="Facebook" placeholder="URL atau username" InputProps={{ startAdornment: <Iconify icon="socials:facebook" width={20} sx={{ mr: 1 }} /> }} />
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            onClick={save}
            disabled={saving || !form.name}
            startIcon={saving ? <CircularProgress size={18} /> : <Iconify icon="solar:check-circle-bold" width={20} />}
            sx={{ minWidth: 160 }}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </Stack>
      </Box>
    </AdminLayout>
  );
};
