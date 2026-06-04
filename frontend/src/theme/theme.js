import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3F72AF', dark: '#112D4E', light: '#DBE2EF', contrastText: '#fff' },
    secondary: { main: '#112D4E', contrastText: '#fff' },
    background: { default: '#F0F4F8', paper: '#ffffff' },
    divider: '#DBE2EF',
    text: { primary: '#112D4E', secondary: '#3F72AF' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3F72AF' },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h1: { fontFamily: "'Syne', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Syne', sans-serif", fontWeight: 800 },
    h3: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0.2 },
  },
  shape: { borderRadius: 14 },
  shadows: [
    'none',
    '0 1px 4px rgba(17,45,78,0.06)',
    '0 2px 10px rgba(17,45,78,0.08)',
    '0 4px 20px rgba(17,45,78,0.10)',
    '0 8px 30px rgba(17,45,78,0.12)',
    '0 12px 40px rgba(17,45,78,0.14)',
    ...Array(19).fill('0 16px 50px rgba(17,45,78,0.16)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '9px 22px',
          fontWeight: 700,
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(63,114,175,0.3)',
          '&:hover': {
            boxShadow: '0 8px 22px rgba(63,114,175,0.45)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
        },
        outlined: {
          '&:hover': { transform: 'translateY(-1px)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: '1px solid rgba(219,226,239,0.8)',
          boxShadow: '0 2px 16px rgba(17,45,78,0.06)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 8, fontSize: '0.75rem' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: '#fff',
            transition: 'box-shadow 0.2s',
            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(63,114,175,0.12)' },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, background: '#F8FAFC', color: '#112D4E', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
        root: { borderBottom: '1px solid #F0F4F8', padding: '12px 16px' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { transition: 'background 0.15s', '&:hover': { background: '#F8FAFC' } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem', background: '#112D4E', padding: '6px 12px' },
        arrow: { color: '#112D4E' },
      },
    },
  },
});

export default theme;