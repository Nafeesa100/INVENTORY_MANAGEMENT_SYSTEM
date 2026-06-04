import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, Chip, Avatar, CircularProgress,
} from '@mui/material';
import {
  Inventory2, Category, People, Warning, ErrorOutline,
  AttachMoney, TrendingUp, ShoppingCart, ArrowUpward, ArrowDownward,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Animated number counter
function useCounter(target, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}

const STAT_CONFIG = [
  { key: 'totalProducts', label: 'Total Products', icon: <Inventory2 />, accent: '#3F72AF', bg: '#EBF2FF', path: '/products', trend: '+12%' },
  { key: 'totalCategories', label: 'Categories', icon: <Category />, accent: '#8b5cf6', bg: '#f5f3ff', path: '/categories', trend: '+2%' },
  { key: 'inventoryValue', label: 'Inventory Value', icon: <AttachMoney />, accent: '#10b981', bg: '#ecfdf5', path: null, trend: '+8%', currency: true },
  { key: 'todayRevenue', label: "Today's Revenue", icon: <TrendingUp />, accent: '#f59e0b', bg: '#fffbeb', path: null, trend: '+5%', currency: true },
  { key: 'totalUsers', label: 'Team Members', icon: <People />, accent: '#6366f1', bg: '#eef2ff', path: '/users', trend: '0%' },
  { key: 'reservedOrders', label: 'Reserved Orders', icon: <ShoppingCart />, accent: '#3F72AF', bg: '#EBF2FF', path: '/orders', trend: 'Live' },
  { key: 'lowStock', label: 'Low Stock', icon: <Warning />, accent: '#f59e0b', bg: '#fffbeb', path: '/stock/low', trend: '!' },
  { key: 'outOfStock', label: 'Out of Stock', icon: <ErrorOutline />, accent: '#ef4444', bg: '#fef2f2', path: '/stock/out', trend: '!!' },
];

function StatCard({ config, value, index }) {
  const { label, icon, accent, bg, path, trend, currency } = config;
  const nav = useNavigate();
  const counted = useCounter(value, 900 + index * 80);
  const isAlert = accent === '#f59e0b' || accent === '#ef4444';

  return (
    <Card
      onClick={() => path && nav(path)}
      sx={{
        cursor: path ? 'pointer' : 'default',
        transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
        '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        '&:hover': path ? {
          transform: 'translateY(-5px)',
          boxShadow: `0 16px 40px ${accent}22`,
          borderColor: `${accent}40`,
        } : {},
        border: `1px solid ${bg}`,
        background: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Accent top bar */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}55)`, borderRadius: '18px 18px 0 0' }} />
      {/* BG blob */}
      <Box sx={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <CardContent sx={{ p: '20px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, mb: 1 }}>
              {label}
            </Typography>
            <Typography sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E', fontSize: '1.9rem', lineHeight: 1, mb: 0.5 }}>
              {currency ? `$${counted.toLocaleString()}` : counted.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend === 'Live' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box className="pulse" sx={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  <Typography sx={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>Live</Typography>
                </Box>
              ) : trend === '!' || trend === '!!' ? (
                <Typography sx={{ fontSize: '0.68rem', color: accent, fontWeight: 700 }}>
                  {value > 0 ? `${value} need attention` : 'All good ✓'}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <ArrowUpward sx={{ fontSize: 11, color: '#10b981' }} />
                  <Typography sx={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>{trend}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Avatar sx={{ background: `linear-gradient(135deg,${accent}22,${accent}44)`, color: accent, width: 46, height: 46, borderRadius: 3, '& .MuiSvgIcon-root': { fontSize: 22 } }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 12, gap: 2 }}>
      <CircularProgress sx={{ color: '#3F72AF' }} size={40} />
      <Typography sx={{ color: '#3F72AF', fontWeight: 600, fontSize: '0.9rem' }}>Loading dashboard…</Typography>
    </Box>
  );

  if (!data) return null;
  const { stats, monthlyRevenue, topProducts, lowStockProducts, outOfStockProducts } = data;

  const chartLabels = monthlyRevenue.map(m => MONTHS[m._id.month - 1]);
  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Revenue ($)',
      data: monthlyRevenue.map(m => m.revenue),
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, 'rgba(63,114,175,0.7)');
        g.addColorStop(1, 'rgba(63,114,175,0.05)');
        return g;
      },
      borderColor: '#3F72AF',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#112D4E',
        titleFont: { family: "'Syne',sans-serif", weight: 'bold', size: 13 },
        bodyFont: { family: "'Plus Jakarta Sans',sans-serif", size: 12 },
        padding: 12, cornerRadius: 10, displayColors: false,
        callbacks: { label: (c) => ` $${c.raw.toLocaleString()}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans',sans-serif", weight: '600', size: 11 } }, border: { display: false } },
      y: { grid: { color: 'rgba(219,226,239,0.5)', drawBorder: false }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v) => '$' + v }, border: { display: false } },
    },
  };

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E', mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Chip
          label="● Live Data"
          sx={{
            background: '#ecfdf5', color: '#10b981', fontWeight: 700, border: '1px solid #a7f3d0', fontSize: '0.75rem',
            '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 }
          }}
        />
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {STAT_CONFIG.map((cfg, i) => (
          <Grid item xs={12} sm={6} md={3} key={cfg.key}>
            <StatCard config={cfg} value={stats[cfg.key] ?? 0} index={i} />
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, animation: 'fadeUp 0.5s ease 0.3s both', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#112D4E' }}>Monthly Revenue</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Last 6 months performance</Typography>
              </Box>
              <Chip label="Revenue" size="small" sx={{ background: '#EBF2FF', color: '#3F72AF', fontWeight: 700 }} />
            </Box>
            <Box sx={{ height: 240 }}>
              {monthlyRevenue.length > 0
                ? <Bar data={chartData} options={chartOpts} />
                : <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}><Typography>No revenue data yet</Typography></Box>}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', animation: 'fadeUp 0.5s ease 0.35s both', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#112D4E', mb: 0.5 }}>Top Products</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mb: 2 }}>By units sold</Typography>
            {topProducts.length === 0
              ? <Typography sx={{ color: '#94a3b8', fontSize: '0.88rem' }}>No sales yet</Typography>
              : topProducts.map((p, i) => (
                <Box key={p._id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.72rem', fontWeight: 800, background: ['linear-gradient(135deg,#f59e0b,#d97706)', 'linear-gradient(135deg,#94a3b8,#64748b)', 'linear-gradient(135deg,#cd7c2f,#a96526)', 'linear-gradient(135deg,#3F72AF,#112D4E)', 'linear-gradient(135deg,#8b5cf6,#6d28d9)'][i] || '#EBF2FF', color: '#fff' }}>
                    {i + 1}
                  </Avatar>
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#112D4E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{p.totalQty} units</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.82rem', flexShrink: 0 }}>
                    ${(p.totalRevenue || 0).toFixed(0)}
                  </Typography>
                </Box>
              ))}
          </Card>
        </Grid>
      </Grid>

      {/* Stock alerts row */}
      <Grid container spacing={2.5}>
        {[
          { title: '⚠️ Low Stock', items: lowStockProducts, emptyMsg: 'All stock levels healthy ✓', emptyColor: '#10b981', chipBg: '#fffbeb', chipColor: '#f59e0b', path: '/stock/low', badgeColor: '#f59e0b', getValue: (p) => `${p.stock} left` },
          { title: '🚫 Out of Stock', items: outOfStockProducts, emptyMsg: 'No out-of-stock items ✓', emptyColor: '#10b981', chipBg: '#fef2f2', chipColor: '#ef4444', path: '/stock/out', badgeColor: '#ef4444', getValue: () => 'OUT' },
        ].map(({ title, items, emptyMsg, emptyColor, chipBg, chipColor, path, badgeColor, getValue }) => (
          <Grid item xs={12} md={6} key={title}>
            <Card sx={{ p: 3, animation: 'fadeUp 0.5s ease 0.4s both', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, cursor: 'pointer' }} onClick={() => nav(path)}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#112D4E' }}>{title}</Typography>
                <Chip label="View All →" size="small" onClick={() => nav(path)} sx={{ background: chipBg, color: chipColor, fontWeight: 700, cursor: 'pointer', '&:hover': { opacity: 0.8 } }} />
              </Box>
              {items.length === 0 ? (
                <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: emptyColor, fontWeight: 700 }}>{emptyMsg}</Typography>
                </Box>
              ) : items.slice(0, 5).map(p => (
                <Box key={p._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid #F0F4F8', '&:last-child': { borderBottom: 'none' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: badgeColor, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#112D4E', fontSize: '0.85rem' }}>{p.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{p.category?.name}</Typography>
                    </Box>
                  </Box>
                  <Chip label={getValue(p)} size="small" sx={{ background: chipBg, color: chipColor, fontWeight: 800, fontSize: '0.7rem' }} />
                </Box>
              ))}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
