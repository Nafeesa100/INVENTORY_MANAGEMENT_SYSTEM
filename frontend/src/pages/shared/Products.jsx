import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Chip, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, InputAdornment, CircularProgress,
  Tooltip, Select, FormControl, InputLabel,
} from '@mui/material';
import { Add, Edit, Delete, Search, Inventory2, Warning, ErrorOutline, Refresh } from '@mui/icons-material';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const DEFAULT_FORM = { name: '', sku: '', description: '', category: '', price: '', costPrice: '', stock: '', lowStockThreshold: 10, unit: 'pcs' };

const StockChip = ({ p }) => {
  if (p.stock === 0) return <Chip icon={<ErrorOutline />} label="Out of Stock" size="small" sx={{ background: '#fef2f2', color: '#ef4444', fontWeight: 700, '& .MuiChip-icon': { color: '#ef4444 !important' } }} />;
  if (p.stock <= p.lowStockThreshold) return <Chip icon={<Warning />} label={`Low: ${p.availableStock ?? p.stock}`} size="small" sx={{ background: '#fffbeb', color: '#f59e0b', fontWeight: 700, '& .MuiChip-icon': { color: '#f59e0b !important' } }} />;
  return <Chip label={`${p.availableStock ?? p.stock} ${p.unit || 'pcs'}`} size="small" sx={{ background: '#f0fdf4', color: '#22c55e', fontWeight: 700 }} />;
};

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const canEdit = ['admin', 'staff'].includes(user?.role);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get(`/products?search=${search}&category=${filterCat}&limit=100`),
        api.get('/categories'),
      ]);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [search, filterCat]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditing(null); setForm(DEFAULT_FORM); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku || '', description: p.description || '', category: p.category?._id || '', price: p.price, costPrice: p.costPrice || '', stock: p.stock, lowStockThreshold: p.lowStockThreshold || 10, unit: p.unit || 'pcs' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price) { toast.error('Name, category and price are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/products/${editing._id}`, form);
        setProducts(prev => prev.map(p => p._id === editing._id ? data.data : p));
        toast.success('Product updated');
      } else {
        const { data } = await api.post('/products', form);
        setProducts(prev => [data.data, ...prev]);
        toast.success('Product created');
      }
      setDialogOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Archive "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      setProducts(prev => prev.filter(x => x._id !== p._id));
      toast.success('Product archived');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>Products</Typography>
          <Typography sx={{ color: '#3F72AF', fontWeight: 500 }}>{products.length} products loaded</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton onClick={fetchAll} sx={{ background: '#EBF2FF', color: '#3F72AF', '&:hover': { background: '#DBE2EF' } }}><Refresh /></IconButton>
          {canEdit && <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>New Product</Button>}
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} size="small" sx={{ minWidth: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#3F72AF' }} /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select label="Filter by Category" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress sx={{ color: '#3F72AF' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #DBE2EF', boxShadow: '0 2px 12px rgba(17,45,78,0.06)' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['SKU','Name','Category','Price','Cost','Stock','Reserved','Status','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#112D4E', background: '#F9F7F7', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.8, py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(p => (
                <TableRow key={p._id} sx={{ '&:hover': { background: '#F9F7F7' }, transition: '0.15s' }}>
                  <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', background: '#EBF2FF', color: '#3F72AF', px: 1, py: 0.3, borderRadius: 1, fontWeight: 700 }}>{p.sku}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontWeight: 600, color: '#112D4E', fontSize: '0.9rem' }}>{p.name}</Typography></TableCell>
                  <TableCell>{p.category && <Chip label={p.category.name} size="small" sx={{ background: `${p.category.color}18`, color: p.category.color, fontWeight: 700, fontSize: '0.72rem' }} />}</TableCell>
                  <TableCell><Typography sx={{ fontWeight: 700, color: '#112D4E' }}>${p.price}</Typography></TableCell>
                  <TableCell><Typography sx={{ color: '#3F72AF', fontWeight: 600 }}>${p.costPrice || 0}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontWeight: 700, color: p.stock === 0 ? '#ef4444' : p.stock <= p.lowStockThreshold ? '#f59e0b' : '#112D4E' }}>{p.stock}</Typography></TableCell>
                  <TableCell>
                    {p.reservedStock > 0 ? <Chip label={`🔒 ${p.reservedStock}`} size="small" sx={{ background: '#fffbeb', color: '#f59e0b', fontWeight: 700 }} /> : <Typography variant="caption" sx={{ color: '#3F72AF' }}>—</Typography>}
                  </TableCell>
                  <TableCell><StockChip p={p} /></TableCell>
                  <TableCell>
                    {canEdit && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)} sx={{ '&:hover': { background: '#EBF2FF' } }}><Edit fontSize="small" sx={{ color: '#3F72AF' }} /></IconButton></Tooltip>
                        {user?.role === 'admin' && <Tooltip title="Archive"><IconButton size="small" onClick={() => handleDelete(p)} sx={{ '&:hover': { background: '#fef2f2' } }}><Delete fontSize="small" sx={{ color: '#ef4444' }} /></IconButton></Tooltip>}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={9} sx={{ textAlign: 'center', py: 6, color: '#3F72AF' }}>
                  <Inventory2 sx={{ fontSize: 40, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                  No products found
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Product Name *" fullWidth value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select label="Category *" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Price *" type="number" fullWidth value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
              <TextField label="Cost Price" type="number" fullWidth value={form.costPrice} onChange={e => setForm(p => ({ ...p, costPrice: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Stock" type="number" fullWidth value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
              <TextField label="Low Stock Alert" type="number" fullWidth value={form.lowStockThreshold} onChange={e => setForm(p => ({ ...p, lowStockThreshold: e.target.value }))} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Unit" fullWidth value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="pcs, kg, ltr…" />
              <TextField label="SKU (auto if empty)" fullWidth value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
            </Box>
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderColor: '#DBE2EF', color: '#3F72AF' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
