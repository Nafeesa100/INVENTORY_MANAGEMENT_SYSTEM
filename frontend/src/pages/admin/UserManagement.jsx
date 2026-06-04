import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip,
  CircularProgress, Avatar, Switch, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, People, VpnKey } from '@mui/icons-material';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  admin:   { color: '#ef4444', bg: '#fef2f2', label: 'Admin' },
  staff:   { color: '#22c55e', bg: '#f0fdf4', label: 'Staff' },
  cashier: { color: '#f59e0b', bg: '#fffbeb', label: 'Cashier' },
};

const DEFAULT_FORM = { name: '', email: '', password: '', role: 'staff', isActive: true };

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditing(null); setForm(DEFAULT_FORM); setDialogOpen(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!editing && !form.password) { toast.error('Password is required for new users'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
      if (form.password) payload.password = form.password;
      if (editing) {
        const { data } = await api.put(`/users/${editing._id}`, payload);
        setUsers(prev => prev.map(u => u._id === editing._id ? data.data : u));
        toast.success('User updated');
      } else {
        const { data } = await api.post('/users', payload);
        toast.success(`User created! ID: ${data.data.employeeId}`);
        fetchUsers();
      }
      setDialogOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving user'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u) => {
    if (u._id === currentUser._id) { toast.error("Cannot delete your own account"); return; }
    if (!window.confirm(`Delete "${u.name}"?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setUsers(prev => prev.filter(x => x._id !== u._id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleToggleActive = async (u) => {
    if (u._id === currentUser._id) { toast.error("Cannot change your own status"); return; }
    try {
      const { data } = await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      setUsers(prev => prev.map(x => x._id === u._id ? data.data : x));
      toast.success(`User ${!u.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const roleStats = ['admin', 'staff', 'cashier'].map(role => ({
    role, count: users.filter(u => u.role === role && u.isActive).length,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>User Management</Typography>
          <Typography sx={{ color: '#3F72AF', fontWeight: 500 }}>Admin-controlled — no self-registration</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>
          Add Employee
        </Button>
      </Box>

      {/* Role stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {roleStats.map(({ role, count }) => {
          const rc = ROLE_CONFIG[role];
          return (
            <Box key={role} sx={{ flex: '1 1 150px', p: 2.5, borderRadius: 3, border: `2px solid ${rc.bg}`, background: rc.bg, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ background: rc.color, width: 44, height: 44, fontSize: '1.1rem' }}>
                {role === 'admin' ? '👑' : role === 'cashier' ? '🧾' : '📦'}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, color: rc.color, fontSize: '1.6rem', lineHeight: 1 }}>{count}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: rc.color, textTransform: 'capitalize' }}>{role}s</Typography>
              </Box>
            </Box>
          );
        })}
        <Box sx={{ flex: '1 1 150px', p: 2.5, borderRadius: 3, border: '2px solid #DBE2EF', background: '#F9F7F7', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ background: '#3F72AF', width: 44, height: 44 }}><People /></Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#112D4E', fontSize: '1.6rem', lineHeight: 1 }}>{users.length}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#3F72AF' }}>Total</Typography>
          </Box>
        </Box>
      </Box>

      {/* Security notice */}
      <Box sx={{ p: 2, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg,#EBF2FF,#DBE2EF)', border: '1px solid #3F72AF33', display: 'flex', alignItems: 'center', gap: 2 }}>
        <VpnKey sx={{ color: '#3F72AF' }} />
        <Typography sx={{ color: '#112D4E', fontWeight: 600, fontSize: '0.88rem' }}>
          🔒 <strong>Secure Access Model:</strong> Employees cannot self-register. Only admins can create, modify, or deactivate accounts. Employee IDs are auto-generated.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress sx={{ color: '#3F72AF' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #DBE2EF', boxShadow: '0 2px 12px rgba(17,45,78,0.06)' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Employee','Employee ID','Role','Created By','Status','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#112D4E', background: '#F9F7F7', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => {
                const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.staff;
                const isSelf = u._id === currentUser._id;
                return (
                  <TableRow key={u._id} sx={{ '&:hover': { background: '#F9F7F7' }, opacity: u.isActive ? 1 : 0.55 }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700, background: `linear-gradient(135deg,${rc.color},${rc.color}88)` }}>
                          {u.name[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#112D4E', fontSize: '0.9rem' }}>
                            {u.name} {isSelf && <Chip label="You" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', background: '#EBF2FF', color: '#3F72AF', fontWeight: 700 }} />}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#3F72AF' }}>{u.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#3F72AF', fontSize: '0.82rem', background: '#EBF2FF', px: 1, py: 0.25, borderRadius: 1, display: 'inline-block' }}>
                        {u.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell><Chip label={rc.label} size="small" sx={{ background: rc.bg, color: rc.color, fontWeight: 700 }} /></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.82rem', color: '#3F72AF' }}>{u.createdBy?.name || 'System'}</Typography></TableCell>
                    <TableCell>
                      <Tooltip title={isSelf ? "Cannot change own status" : u.isActive ? 'Click to deactivate' : 'Click to activate'}>
                        <Box component="span">
                          <Switch checked={u.isActive} size="small" disabled={isSelf} onChange={() => handleToggleActive(u)}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#22c55e' } }} />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(u)} sx={{ '&:hover': { background: '#EBF2FF' } }}><Edit fontSize="small" sx={{ color: '#3F72AF' }} /></IconButton></Tooltip>
                        {!isSelf && <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(u)} sx={{ '&:hover': { background: '#fef2f2' } }}><Delete fontSize="small" sx={{ color: '#ef4444' }} /></IconButton></Tooltip>}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#3F72AF' }}>
                  <People sx={{ fontSize: 40, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />No users found
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>
          {editing ? `Edit — ${editing.name}` : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            <TextField label="Full Name *" fullWidth value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <TextField label="Email Address *" type="email" fullWidth value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Role *</InputLabel>
              <Select label="Role *" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <MenuItem value="admin">👑 Admin — Full access</MenuItem>
                <MenuItem value="staff">📦 Staff — Inventory management</MenuItem>
                <MenuItem value="cashier">🧾 Cashier — Orders & POS</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={editing ? "New Password (leave blank to keep)" : "Password *"} type="password" fullWidth
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              helperText={editing ? '' : 'Min 6 characters. Share securely with the employee.'}
            />
            {editing && (
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#22c55e' } }} />}
                label={<Typography sx={{ fontWeight: 600, color: form.isActive ? '#22c55e' : '#ef4444' }}>{form.isActive ? 'Account Active' : 'Account Deactivated'}</Typography>}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderColor: '#DBE2EF', color: '#3F72AF' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
