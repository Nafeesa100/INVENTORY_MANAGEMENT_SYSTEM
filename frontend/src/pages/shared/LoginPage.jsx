import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, InputAdornment,
  IconButton, CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, LockOutlined, EmailOutlined,
  Inventory2Rounded, TrendingUp, Security, Speed,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/* ── Floating particle ── */
function Particle({ style }) {
  return (
    <Box sx={{
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(219,226,239,0.15)',
      animation: 'floatP 6s ease-in-out infinite alternate',
      '@keyframes floatP': {
        from: { transform: 'translateY(0) rotate(0deg)', opacity: 0.6 },
        to: { transform: 'translateY(-40px) rotate(180deg)', opacity: 0.15 },
      },
      ...style,
    }} />
  );
}

/* ── Stat pill ── */
function StatPill({ icon, label, value, delay }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      background: 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 3, px: 2.5, py: 1.5,
      animation: `slideInLeft 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s both`,
      '@keyframes slideInLeft': {
        from: { opacity: 0, transform: 'translateX(-30px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
    }}>
      <Box sx={{ color: '#DBE2EF', fontSize: 20 }}>{icon}</Box>
      <Box>
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>{value}</Typography>
        <Typography sx={{ color: 'rgba(219,226,239,0.55)', fontSize: '0.7rem', fontWeight: 600 }}>{label}</Typography>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('login-scroll-container');
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 80);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Enter both email and password'); return; }
    setLoading(true); setError('');
    try {
      const u = await login(form.email.trim().toLowerCase(), form.password);
      toast.success(`Welcome, ${u.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const scrollToLogin = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Box id="login-scroll-container" sx={{
      height: '100vh', overflowY: 'auto', overflowX: 'hidden',
      background: 'linear-gradient(160deg, #060e1a 0%, #0d2137 35%, #112D4E 65%, #1a3f6f 100%)',
      scrollSnapType: 'y mandatory',
      '&::-webkit-scrollbar': { display: 'none' },
    }}>

      {/* ══ SECTION 1 — Hero ══ */}
      <Box sx={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        scrollSnapAlign: 'start',
        px: 3,
      }}>
        {/* Grid overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(63,114,175,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(63,114,175,0.07) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Radial glow */}
        <Box sx={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,114,175,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Particles */}
        {[
          { width: 12, height: 12, top: '15%', left: '10%', animationDelay: '0s', animationDuration: '5s' },
          { width: 8, height: 8, top: '70%', left: '85%', animationDelay: '1s', animationDuration: '7s' },
          { width: 16, height: 16, top: '80%', left: '15%', animationDelay: '2s', animationDuration: '6s' },
          { width: 6, height: 6, top: '25%', left: '80%', animationDelay: '0.5s', animationDuration: '8s' },
          { width: 10, height: 10, top: '55%', left: '5%', animationDelay: '3s', animationDuration: '5.5s' },
          { width: 14, height: 14, top: '10%', left: '60%', animationDelay: '1.5s', animationDuration: '6.5s' },
          { width: 5, height: 5, top: '90%', left: '45%', animationDelay: '2.5s', animationDuration: '7.5s' },
        ].map((p, i) => <Particle key={i} style={p} />)}

        {/* Logo */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2, mb: 5,
          animation: 'fadeDown 0.8s cubic-bezier(0.4,0,0.2,1) both',
          '@keyframes fadeDown': { from: { opacity: 0, transform: 'translateY(-20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        }}>
          <Box sx={{ background: 'linear-gradient(135deg,#3F72AF,#6495d4)', borderRadius: 3, p: 1.5, boxShadow: '0 8px 32px rgba(63,114,175,0.6)', display: 'flex' }}>
            <Inventory2Rounded sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#F9F7F7', fontSize: '1.5rem', letterSpacing: '-0.5px', lineHeight: 1 }}>
              Hisaab Kitaab
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: 'rgba(219,226,239,0.4)', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>
              Management System
            </Typography>
          </Box>
        </Box>

        {/* Hero heading */}
        <Box sx={{
          textAlign: 'center', maxWidth: 680, mb: 4,
          animation: 'fadeUp 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s both',
          '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        }}>
          <Typography sx={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: { xs: '2.4rem', sm: '3rem', md: '3.8rem' },
            color: '#F9F7F7', lineHeight: 1.05, mb: 2, letterSpacing: '-1px',
          }}>
            Manage Stock with
            <Box component="span" sx={{
              display: 'block',
              background: 'linear-gradient(90deg, #DBE2EF, #3F72AF, #DBE2EF)',
              backgroundClip: 'text', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'gradientShift 3s linear infinite',
              '@keyframes gradientShift': { from: { backgroundPosition: '0% center' }, to: { backgroundPosition: '200% center' } },
            }}>
              Confidence
            </Box>
          </Typography>
          <Typography sx={{ color: 'rgba(219,226,239,0.6)', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7, fontWeight: 400 }}>
            Track stock in real-time, manage orders with smart reservation,<br />
            and run your business with complete control.
          </Typography>
        </Box>

        {/* Stat pills */}
        <Box sx={{
          display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 6,
          animation: 'fadeUp 0.9s cubic-bezier(0.4,0,0.2,1) 0.25s both',
        }}>
          <StatPill icon={<TrendingUp />} label="Revenue Tracked" value="$0 to ∞" delay={0.3} />
          <StatPill icon={<Security />} label="Role-Based Access" value="3 Roles" delay={0.4} />
          <StatPill icon={<Speed />} label="Real-time Updates" value="Live" delay={0.5} />
        </Box>

        {/* CTA button */}
        <Box sx={{ animation: 'fadeUp 0.9s cubic-bezier(0.4,0,0.2,1) 0.4s both' }}>
          <Button
            onClick={scrollToLogin}
            variant="contained"
            size="large"
            sx={{
              px: 5, py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: 50,
              background: 'linear-gradient(135deg, #3F72AF, #DBE2EF)',
              color: '#112D4E',
              boxShadow: '0 8px 32px rgba(63,114,175,0.5)',
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-3px) scale(1.03)', boxShadow: '0 16px 48px rgba(63,114,175,0.6)' },
            }}
          >
            Get Started →
          </Button>
        </Box>

        {/* Scroll indicator */}
        <Box sx={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          animation: 'bounce 2s ease-in-out infinite',
          '@keyframes bounce': { '0%,100%': { transform: 'translateX(-50%) translateY(0)' }, '50%': { transform: 'translateX(-50%) translateY(-8px)' } },
          opacity: 0.5, cursor: 'pointer',
        }} onClick={scrollToLogin}>
          <Typography sx={{ color: '#DBE2EF', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            Sign In
          </Typography>
          <Box sx={{ width: 1.5, height: 32, background: 'linear-gradient(180deg,#DBE2EF,transparent)', borderRadius: 1 }} />
        </Box>
      </Box>

      {/* ══ SECTION 2 — Login Form ══ */}
      <Box ref={formRef} sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', px: 3, py: 8,
        scrollSnapAlign: 'start',
        background: 'linear-gradient(180deg, transparent 0%, rgba(6,14,26,0.6) 100%)',
      }}>
        {/* Subtle glow behind card */}
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,114,175,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <Box sx={{
          width: '100%', maxWidth: 440, position: 'relative', zIndex: 1,
          animation: 'cardIn 0.6s cubic-bezier(0.4,0,0.2,1) both',
          '@keyframes cardIn': { from: { opacity: 0, transform: 'translateY(40px) scale(0.97)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
        }}>
          {/* Glass card */}
          <Box sx={{
            background: 'rgba(249,247,247,0.97)',
            borderRadius: 5, overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(219,226,239,0.2)',
          }}>
            {/* Card top accent */}
            <Box sx={{ height: 4, background: 'linear-gradient(90deg, #112D4E, #3F72AF, #DBE2EF, #3F72AF, #112D4E)', backgroundSize: '200% auto', animation: 'gradientShift 3s linear infinite', '@keyframes gradientShift': { from: { backgroundPosition: '0% center' }, to: { backgroundPosition: '200% center' } } }} />

            <Box sx={{ p: { xs: 4, md: 5 } }}>
              {/* Logo inside card */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
                <Box sx={{ background: 'linear-gradient(135deg,#112D4E,#3F72AF)', borderRadius: 2, p: 1, display: 'flex' }}>
                  <Inventory2Rounded sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E', fontSize: '1rem', lineHeight: 1 }}>
                    Hisaab Kitaab
                  </Typography>
                  <Typography sx={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    Employee Portal
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", color: '#112D4E', fontWeight: 800, mb: 0.5 }}>
                Welcome back
              </Typography>
              <Typography sx={{ color: '#94a3b8', mb: 3.5, fontWeight: 500, fontSize: '0.88rem' }}>
                Sign in to access your workspace
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5, fontSize: '0.83rem' }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email Address" type="email" fullWidth required
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: '#3F72AF', fontSize: 18 }} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Password" fullWidth required
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#3F72AF', fontSize: 18 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                          {showPass ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                  sx={{
                    mt: 0.5, py: 1.7, fontSize: '0.95rem', fontWeight: 700, borderRadius: 3,
                    background: 'linear-gradient(135deg, #3F72AF, #112D4E)',
                    boxShadow: '0 8px 24px rgba(63,114,175,0.4)',
                    '&:hover': { background: 'linear-gradient(135deg,#2d5a8e,#0a1f38)', transform: 'translateY(-2px)', boxShadow: '0 14px 36px rgba(63,114,175,0.5)' },
                    '&:active': { transform: 'translateY(0)' },
                  }}>
                  {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In →'}
                </Button>
              </Box>

              <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid #F0F4F8', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LockOutlined sx={{ fontSize: 16, color: '#3F72AF' }} />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>
                  Access is <strong style={{ color: '#112D4E' }}>admin-controlled</strong> only.<br />
                  Contact your administrator if you need access.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Below card */}
          <Typography sx={{ textAlign: 'center', mt: 2.5, fontSize: '0.7rem', color: 'rgba(219,226,239,0.3)', fontWeight: 500 }}>
            © {new Date().getFullYear()} Hisaab Kitaab — All rights reserved
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
