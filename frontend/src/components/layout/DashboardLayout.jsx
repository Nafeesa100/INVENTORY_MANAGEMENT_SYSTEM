import { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar, Tooltip,
  Chip, Popover, TextField, Button, CircularProgress, Badge, Fade,
  Menu, MenuItem as MuiMenuItem, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Logout, Inventory2Rounded, NotificationsNone, WarningAmber,
  ErrorOutline, Edit, PhotoCamera, Close, KeyboardArrowDown, Save,
  Menu as MenuIcon, GridView, Inventory2, Category, ShoppingCart,
  People, ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ROLE = {
  admin: { color: '#ef4444', bg: '#fef2f2', label: 'Admin', emoji: '👑' },
  staff: { color: '#10b981', bg: '#ecfdf5', label: 'Staff', emoji: '📦' },
  cashier: { color: '#f59e0b', bg: '#fffbeb', label: 'Cashier', emoji: '🧾' },
};

const resizeImg = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 220, c = document.createElement('canvas');
      let [w, h] = [img.width, img.height];
      if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
      else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      res(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = rej; img.src = e.target.result;
  };
  r.onerror = rej; r.readAsDataURL(file);
});

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const fileRef = useRef();

  const rm = ROLE[user?.role] || ROLE.staff;
  const profileOpen = Boolean(profileAnchor);

  const isActive = (path) => loc.pathname === path || loc.pathname.startsWith(path + '/');

  const doLogout = () => { logout(); toast.success('Goodbye!'); nav('/login'); };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) { toast.error('Select an image'); return; }
    setUploading(true);
    try {
      const b64 = await resizeImg(file);
      setAvatar(b64);
      await api.put(`/users/${user._id}`, { avatar: b64 });
      const s = JSON.parse(localStorage.getItem('user') || '{}');
      s.avatar = b64;
      localStorage.setItem('user', JSON.stringify(s));
      toast.success('Photo updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
      setAvatar(user?.avatar || '');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveProfile = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await api.put(`/users/${user._id}`, { name: form.name, email: form.email });
      const s = JSON.parse(localStorage.getItem('user') || '{}');
      Object.assign(s, { name: form.name, email: form.email });
      localStorage.setItem('user', JSON.stringify(s));
      toast.success('Saved!');
      setEditMode(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const navItems = [
    ...(user?.role !== 'cashier' ? [{ label: 'Dashboard', icon: <GridView sx={{ fontSize: 18 }} />, path: '/dashboard', accent: '#6366f1' }] : []),
    { label: 'Products', icon: <Inventory2 sx={{ fontSize: 18 }} />, path: '/products', accent: '#3F72AF' },
    { label: 'Categories', icon: <Category sx={{ fontSize: 18 }} />, path: '/categories', accent: '#8b5cf6' },
    ...(user?.role !== 'staff' ? [{ label: 'Orders', icon: <ShoppingCart sx={{ fontSize: 18 }} />, path: '/orders', accent: '#f59e0b' }] : []),
    ...(user?.role === 'admin' ? [{ label: 'Users', icon: <People sx={{ fontSize: 18 }} />, path: '/users', accent: '#10b981' }] : []),
  ];

  const alertItems = user?.role !== 'cashier' ? [
    { label: 'Low Stock', icon: <WarningAmber sx={{ fontSize: 18 }} />, path: '/stock/low', accent: '#f59e0b' },
    { label: 'Out of Stock', icon: <ErrorOutline sx={{ fontSize: 18 }} />, path: '/stock/out', accent: '#ef4444' },
  ] : [];

  const allItems = [...navItems, ...alertItems];

  /* ── Profile Popover ── */
  const ProfilePopover = () => (
    <Popover
      open={profileOpen} anchorEl={profileAnchor}
      onClose={() => { setProfileAnchor(null); setEditMode(false); }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={Fade}
      sx={{ mt: 1.5 }}
      PaperProps={{ sx: { width: 300, borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 60px rgba(17,45,78,0.2)', border: '1px solid rgba(219,226,239,0.5)' } }}
    >
      {/* Gradient header */}
      <Box sx={{ background: 'linear-gradient(140deg,#112D4E,#3F72AF)', p: 3, pb: 4.5, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        <IconButton size="small" onClick={() => { setProfileAnchor(null); setEditMode(false); }}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' }, borderRadius: 1.5 }}>
          <Close sx={{ fontSize: 15 }} />
        </IconButton>

        <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => !uploading && fileRef.current?.click()}>
          <Avatar sx={{ width: 76, height: 76, fontSize: '1.9rem', fontWeight: 800, background: `linear-gradient(135deg,${rm.color},${rm.color}77)`, border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}>
            {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: uploading ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', '&:hover': { background: 'rgba(0,0,0,0.45)' }, '&:hover .cam': { opacity: 1 } }}>
            {uploading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : <PhotoCamera className="cam" sx={{ color: '#fff', fontSize: 20, opacity: 0, transition: '0.2s' }} />}
          </Box>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadPhoto} />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontFamily: "'Syne',sans-serif", fontSize: '1rem' }}>{user?.name}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{user?.email}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`${rm.emoji} ${rm.label}`} size="small" sx={{ background: rm.bg, color: rm.color, fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
          <Box sx={{ background: 'rgba(255,255,255,0.08)', borderRadius: 1, px: 1, py: 0.3 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(219,226,239,0.5)', fontWeight: 700 }}>{user?.employeeId}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Info card floating */}
      <Box sx={{ mx: 2, mt: -3, mb: 0, p: 2, background: '#fff', borderRadius: 3, boxShadow: '0 6px 24px rgba(17,45,78,0.1)', border: '1px solid rgba(219,226,239,0.6)', position: 'relative', zIndex: 1 }}>
        {!editMode ? (
          <>
            {[['Name', user?.name], ['Email', user?.email]].map(([k, v], i) => (
              <Box key={k}>
                {i > 0 && <Box sx={{ height: '1px', background: '#F0F4F8', my: 1 }} />}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#3F72AF', textTransform: 'uppercase', letterSpacing: 1 }}>{k}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#112D4E', maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</Typography>
                </Box>
              </Box>
            ))}
            <Button fullWidth size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => setEditMode(true)}
              sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: '0.78rem', border: '1.5px solid #DBE2EF', color: '#3F72AF', '&:hover': { borderColor: '#3F72AF', background: '#EBF2FF' } }}>
              Edit Profile
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField size="small" label="Name" fullWidth value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
            <TextField size="small" label="Email" type="email" fullWidth value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" fullWidth onClick={() => setEditMode(false)} sx={{ borderRadius: 2, fontWeight: 700, borderColor: '#DBE2EF', color: '#3F72AF' }}>Cancel</Button>
              <Button size="small" variant="contained" fullWidth onClick={saveProfile} disabled={saving}
                startIcon={saving ? null : <Save sx={{ fontSize: 14 }} />}
                sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>
                {saving ? <CircularProgress size={13} sx={{ color: '#fff' }} /> : 'Save'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2, pt: 2.5 }}>
        <Button fullWidth variant="contained" startIcon={<Logout sx={{ fontSize: 16 }} />} onClick={doLogout}
          sx={{ borderRadius: 2.5, fontWeight: 700, py: 1.1, background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.28)', '&:hover': { boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transform: 'translateY(-1px)' } }}>
          Sign Out
        </Button>
      </Box>
    </Popover>
  );

  /* ── Mobile Drawer ── */
  const MobileDrawer = () => (
    <Drawer open={mobileDrawer} onClose={() => setMobileDrawer(false)} anchor="left"
      PaperProps={{ sx: { width: 260, background: 'linear-gradient(160deg,#0a1929,#112D4E)', border: 'none' } }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(219,226,239,0.08)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ background: 'linear-gradient(135deg,#3F72AF,#6495d4)', borderRadius: 2, p: 1 }}>
          <Inventory2Rounded sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#F9F7F7', fontSize: '0.95rem' }}>Hisaab Kitaab</Typography>
        <IconButton size="small" onClick={() => setMobileDrawer(false)} sx={{ ml: 'auto', color: 'rgba(219,226,239,0.4)' }}>
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
      <List sx={{ px: 1.5, pt: 2 }}>
        {allItems.map(({ label, icon, path, accent }) => {
          const on = isActive(path);
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton component={Link} to={path} onClick={() => setMobileDrawer(false)}
                sx={{ borderRadius: 2.5, py: 1, background: on ? `${accent}20` : 'transparent', border: `1px solid ${on ? accent + '30' : 'transparent'}`, '&:hover': { background: `${accent}14` } }}>
                <ListItemIcon sx={{ color: on ? accent : 'rgba(219,226,239,0.4)', minWidth: 36 }}>{icon}</ListItemIcon>
                <ListItemText primary={label} sx={{ '& .MuiListItemText-primary': { color: on ? '#F9F7F7' : 'rgba(219,226,239,0.6)', fontWeight: on ? 700 : 500, fontSize: '0.875rem' } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F4F8' }}>

      {/* ── TOP NAVBAR ── */}
      <AppBar position="sticky" elevation={0} sx={{
        background: 'rgba(17,45,78,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(63,114,175,0.2)',
        zIndex: 1200,
      }}>
        <Toolbar sx={{ gap: 1, minHeight: '62px !important', px: { xs: 2, md: 3 } }}>

          {/* Mobile hamburger */}
          <IconButton onClick={() => setMobileDrawer(true)} sx={{ display: { md: 'none' }, color: '#DBE2EF', mr: 0.5 }}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: { xs: 0, md: 3 } }}>
            <Box sx={{ background: 'linear-gradient(135deg,#3F72AF,#6495d4)', borderRadius: 2, p: '7px', display: 'flex', flexShrink: 0, boxShadow: '0 4px 12px rgba(63,114,175,0.4)' }}>
              <Inventory2Rounded sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#F9F7F7', fontSize: '1rem', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
              Hisaab Kitaab
            </Typography>
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, flex: 1 }}>
            {navItems.map(({ label, icon, path, accent }) => {
              const on = isActive(path);
              return (
                <Button
                  key={path}
                  component={Link}
                  to={path}
                  startIcon={icon}
                  sx={{
                    color: on ? '#fff' : 'rgba(219,226,239,0.6)',
                    fontWeight: on ? 700 : 500,
                    fontSize: '0.82rem',
                    px: 1.5, py: 0.9,
                    borderRadius: 2.5,
                    background: on ? `${accent}25` : 'transparent',
                    border: `1px solid ${on ? accent + '40' : 'transparent'}`,
                    transition: 'all 0.2s',
                    minWidth: 'auto',
                    '&:hover': { background: `${accent}18`, color: '#fff', border: `1px solid ${accent}25` },
                    '& .MuiButton-startIcon': { mr: 0.6, '& svg': { fontSize: '17px !important' } },
                  }}
                >
                  {label}
                </Button>
              );
            })}

            {/* Alerts dropdown */}
            {alertItems.length > 0 && (
              <AlertsMenu alertItems={alertItems} isActive={isActive} />
            )}
          </Box>

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Tooltip title="Notifications" arrow>
              <IconButton sx={{ color: 'rgba(219,226,239,0.6)', background: 'rgba(219,226,239,0.06)', borderRadius: 2, p: 0.9, '&:hover': { background: 'rgba(219,226,239,0.12)', color: '#DBE2EF' } }}>
                <Badge badgeContent={0} color="error"><NotificationsNone sx={{ fontSize: 19 }} /></Badge>
              </IconButton>
            </Tooltip>

            {/* Profile chip */}
            <Box
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer',
                px: 1.2, py: 0.6, borderRadius: 10,
                background: profileOpen ? 'rgba(219,226,239,0.15)' : 'rgba(219,226,239,0.07)',
                border: `1px solid ${profileOpen ? 'rgba(219,226,239,0.35)' : 'rgba(219,226,239,0.12)'}`,
                transition: 'all 0.2s',
                '&:hover': { background: 'rgba(219,226,239,0.13)', border: '1px solid rgba(219,226,239,0.3)' },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{ width: 30, height: 30, background: `linear-gradient(135deg,${rm.color},${rm.color}88)`, fontSize: '0.78rem', fontWeight: 800 }}>
                  {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: '#10b981', border: '1.5px solid #112D4E' }} />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 700, color: '#F9F7F7', fontSize: '0.78rem', lineHeight: 1.2 }}>{user?.name}</Typography>
                <Typography sx={{ fontSize: '0.6rem', color: rm.color, fontWeight: 700 }}>{rm.emoji} {rm.label}</Typography>
              </Box>
              <KeyboardArrowDown sx={{ fontSize: 14, color: 'rgba(219,226,239,0.5)', transition: '0.25s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <ProfilePopover />
      <MobileDrawer />

      {/* Page content */}
      <Box className="page-enter" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}

/* ── Alerts dropdown menu ── */
function AlertsMenu({ alertItems, isActive }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchor);
  const anyActive = alertItems.some(a => isActive(a.path));

  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<ExpandMore sx={{ fontSize: '14px !important', transition: '0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />}
        sx={{
          color: anyActive ? '#fff' : 'rgba(219,226,239,0.6)',
          fontWeight: anyActive ? 700 : 500,
          fontSize: '0.82rem', px: 1.5, py: 0.9, borderRadius: 2.5,
          background: open ? 'rgba(219,226,239,0.12)' : 'transparent',
          border: `1px solid ${open ? 'rgba(219,226,239,0.25)' : 'transparent'}`,
          transition: 'all 0.2s', minWidth: 'auto',
          '&:hover': { background: 'rgba(219,226,239,0.1)', color: '#fff' },
        }}
      >
        Alerts
      </Button>
      <Menu
        anchorEl={anchor} open={open} onClose={() => setAnchor(null)}
        TransitionComponent={Fade}
        PaperProps={{ sx: { mt: 1, borderRadius: 3, minWidth: 180, boxShadow: '0 12px 40px rgba(17,45,78,0.2)', border: '1px solid #DBE2EF', overflow: 'hidden' } }}
      >
        {alertItems.map(({ label, icon, path, accent }) => (
          <MuiMenuItem key={path} onClick={() => { navigate(path); setAnchor(null); }}
            sx={{ gap: 1.5, py: 1.2, color: isActive(path) ? accent : '#112D4E', fontWeight: isActive(path) ? 700 : 500, background: isActive(path) ? `${accent}10` : 'transparent', fontSize: '0.85rem', '&:hover': { background: `${accent}14`, color: accent } }}>
            <Box sx={{ color: accent }}>{icon}</Box>
            {label}
          </MuiMenuItem>
        ))}
      </Menu>
    </>
  );
}
