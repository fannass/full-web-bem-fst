import React, { useState, useEffect, useCallback } from 'react';

import dayjs from 'dayjs';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsNews } from 'src/sections/overview/analytics-news';
import { AnalyticsTasks } from 'src/sections/overview/analytics-tasks';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics-current-visits';
import { AnalyticsOrderTimeline } from 'src/sections/overview/analytics-order-timeline';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics-website-visits';
import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics-widget-summary';

import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';

// ----------------------------------------------------------------------

const MONTHS = 9;

const getLastMonths = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    dayjs()
      .subtract(n - 1 - i, 'month')
      .format('MMM')
  );

const countByMonth = (posts: any[], category: string | null, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const month = dayjs().subtract(n - 1 - i, 'month');
    return posts.filter((p) => {
      const created = dayjs(p.created_at);
      const matchMonth =
        created.month() === month.month() && created.year() === month.year();
      return category ? matchMonth && p.category === category : matchMonth;
    }).length;
  });

const calcPercent = (series: number[]) => {
  const cur = series[series.length - 1] ?? 0;
  const prev = series[series.length - 2] ?? 0;
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
};

// ----------------------------------------------------------------------

export const AdminDashboard: React.FC = () => {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [totalCabinet, setTotalCabinet] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [postsResult, cabinetResult] = await Promise.all([
        api.getPosts(1, 999, true), // skip cache – realtime
        api.getCabinet(),
      ]);
      setAllPosts(postsResult.data);
      setTotalCabinet(cabinetResult.length);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000); // refresh setiap 30 detik
    return () => clearInterval(interval);
  }, [loadData]);

  // --- computed stats dari data realtime ---
  const monthLabels = getLastMonths(MONTHS);
  const totalPosts = allPosts.length;
  const published = allPosts.filter((p) => p.status === 'published').length;
  const draft = allPosts.filter((p) => p.status === 'draft').length;
  const beritaCount = allPosts.filter((p) => p.category === 'Berita').length;
  const eventCount = allPosts.filter((p) => p.category === 'Event').length;

  const totalMonthly = countByMonth(allPosts, null, MONTHS);
  const publishedMonthly = countByMonth(
    allPosts.filter((p) => p.status === 'published'),
    null,
    MONTHS
  );
  const beritaMonthly = countByMonth(allPosts, 'Berita', MONTHS);
  const eventMonthly = countByMonth(allPosts, 'Event', MONTHS);

  // 5 berita terbaru untuk widget
  const recentPosts = allPosts.slice(0, 5).map((post: any, idx: number) => ({
    id: String(post.id),
    title: post.title,
    description: post.excerpt || post.content?.substring(0, 100) || '',
    coverUrl: post.image_url || `/assets/images/cover/cover-${(idx % 24) + 1}.webp`,
    postedAt: post.created_at,
  }));

  // Timeline dari 5 post terakhir
  const timelineList = allPosts.slice(0, 5).map((post: any, idx: number) => ({
    id: String(post.id),
    type: `order${(idx % 5) + 1}` as any,
    title: `${post.category}: ${post.title}`,
    time: dayjs(post.created_at).format('DD MMM YYYY, HH:mm'),
  }));

  return (
    <AdminLayout>
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Hai, Selamat datang kembali 👋
        </Typography>

        <Grid container spacing={3}>
          {/* --- Summary Cards --- */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnalyticsWidgetSummary
              title="Total Berita & Event"
              percent={calcPercent(totalMonthly)}
              total={loading ? 0 : totalPosts}
              icon={<Iconify icon="solar:document-text-bold" width={48} />}
              chart={{ categories: monthLabels, series: totalMonthly }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnalyticsWidgetSummary
              title="Anggota Kabinet"
              percent={0}
              total={loading ? 0 : totalCabinet}
              color="secondary"
              icon={<Iconify icon="solar:users-group-rounded-bold" width={48} />}
              chart={{ categories: monthLabels, series: Array(MONTHS).fill(totalCabinet) }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnalyticsWidgetSummary
              title="Konten Dipublikasi"
              percent={calcPercent(publishedMonthly)}
              total={loading ? 0 : published}
              color="warning"
              icon={<Iconify icon="solar:check-circle-bold" width={48} />}
              chart={{ categories: monthLabels, series: publishedMonthly }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnalyticsWidgetSummary
              title="Draft"
              percent={0}
              total={loading ? 0 : draft}
              color="error"
              icon={<Iconify icon="solar:pen-bold" width={48} />}
              chart={{ categories: monthLabels, series: Array(MONTHS).fill(Math.ceil(draft / MONTHS)) }}
            />
          </Grid>

          {/* --- Charts --- */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <AnalyticsCurrentVisits
              title="Kategori Konten"
              chart={{
                series: [
                  { label: 'Berita', value: beritaCount || 0 },
                  { label: 'Event', value: eventCount || 0 },
                ],
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <AnalyticsWebsiteVisits
              title="Aktivitas Konten"
              subheader="Total konten yang dibuat per bulan"
              chart={{
                categories: monthLabels,
                series: [
                  { name: 'Berita', data: beritaMonthly },
                  { name: 'Event', data: eventMonthly },
                ],
              }}
            />
          </Grid>

          {/* --- Berita Terbaru --- */}
          {recentPosts.length > 0 && (
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <AnalyticsNews title="Berita Terbaru" list={recentPosts} />
            </Grid>
          )}

          {/* --- Timeline dari post terbaru --- */}
          {timelineList.length > 0 && (
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <AnalyticsOrderTimeline title="Aktivitas Terakhir" list={timelineList} />
            </Grid>
          )}

          {/* --- Task list (static) --- */}
          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <AnalyticsTasks
              title="Tugas Pengelolaan"
              list={[
                { id: '1', name: 'Buat konten berita terbaru' },
                { id: '2', name: 'Update anggota kabinet' },
                { id: '3', name: 'Review draft postingan' },
                { id: '4', name: 'Publikasi event mendatang' },
                { id: '5', name: 'Backup database website' },
              ]}
            />
          </Grid>
        </Grid>
      </DashboardContent>
    </AdminLayout>
  );
};
