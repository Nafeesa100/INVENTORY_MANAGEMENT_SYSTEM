import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Chip, CircularProgress, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Category as CategoryIcon, Inventory2 } from '@mui/icons-material';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = ['category','devices','checkroom','restaurant','chair','fitness_center','local_pharmacy','book','toys','build','shopping_bag','local_grocery_store'];
const PRESET_COLORS = ['#3F72AF','#E91E63','#FF9800','#795548','#4CAF50','#9C27B0','#00BCD4','#F44336','#607D8B','#FF5722'];

const DEFAULT_FORM = { name: '', description: '', icon: 'category', color: '#3F72AF' };

export default function Categories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const canEdit = ['admin', 'staff'].includes(user?.role);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setForm(DEFAULT_FORM); setDialogOpen(true); };
  const openEdit = (cat, e) => { e.stopPropagation(); setEditing(cat); setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || 'category', color: cat.color || '#3F72AF' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/categories/${editing._id}`, form);
        setCategories(prev => prev.map(c => c._id === editing._id ? { ...data.data, productCount: c.productCount } : c));
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
        fetchCategories();
      }
      setDialogOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      setCategories(prev => prev.filter(c => c._id !== cat._id));
      toast.success('Category deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: '#3F72AF' }} /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>Categories</Typography>
          <Typography sx={{ color: '#3F72AF', fontWeight: 500 }}>Click a category to browse its products</Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>
            New Category
          </Button>
        )}
      </Box>

      <Grid container spacing={2.5}>
        {categories.map((cat, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
            <Card
              onClick={() => navigate(`/categories/${cat._id}/products`)}
              sx={{
                cursor: 'pointer', position: 'relative', overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 20px 40px ${cat.color}33` },
                border: `1px solid ${cat.color}30`,
              }}
            >
              {/* Color bar */}
              <Box sx={{ height: 5, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`, borderRadius: '16px 16px 0 0' }} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{
                    width: 54, height: 54, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)`,
                    border: `2px solid ${cat.color}33`,
                  }}>
                    <span className="material-icons" style={{ color: cat.color, fontSize: 26 }}>{cat.icon || 'category'}</span>
                  </Box>
                  {canEdit && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit"><IconButton size="small" onClick={e => openEdit(cat, e)} sx={{ '&:hover': { background: '#EBF2FF' } }}><Edit fontSize="small" sx={{ color: '#3F72AF' }} /></IconButton></Tooltip>
                      {user?.role === 'admin' && <Tooltip title="Delete"><IconButton size="small" onClick={e => handleDelete(cat, e)} sx={{ '&:hover': { background: '#fef2f2' } }}><Delete fontSize="small" sx={{ color: '#ef4444' }} /></IconButton></Tooltip>}
                    </Box>
                  )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#112D4E', mb: 0.5, lineHeight: 1.2 }}>{cat.name}</Typography>
                {cat.description && <Typography variant="body2" sx={{ color: '#3F72AF', mb: 1.5, fontSize: '0.82rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cat.description}</Typography>}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                  <Inventory2 sx={{ fontSize: 14, color: cat.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: cat.color }}>{cat.productCount ?? 0} products</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {categories.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8, color: '#3F72AF' }}>
              <CategoryIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography sx={{ fontWeight: 600 }}>No categories yet</Typography>
              {canEdit && <Button variant="outlined" startIcon={<Add />} onClick={openCreate} sx={{ mt: 2, borderColor: '#3F72AF', color: '#3F72AF' }}>Create First Category</Button>}
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E', pb: 1 }}>
          {editing ? 'Edit Category' : 'New Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Category Name" fullWidth required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#112D4E', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.8 }}>Color</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(c => (
                  <Box key={c} onClick={() => setForm(p => ({ ...p, color: c }))} sx={{
                    width: 28, height: 28, borderRadius: 2, background: c, cursor: 'pointer',
                    border: form.color === c ? '3px solid #112D4E' : '3px solid transparent',
                    boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                    transition: '0.15s',
                  }} />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#112D4E', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.8 }}>Icon</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {CATEGORY_ICONS.map(ic => (
                  <Box key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} sx={{
                    width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    background: form.icon === ic ? '#EBF2FF' : '#F9F7F7',
                    border: `2px solid ${form.icon === ic ? '#3F72AF' : '#DBE2EF'}`,
                    transition: '0.15s',
                  }}>
                    <span className="material-icons" style={{ fontSize: 20, color: form.icon === ic ? '#3F72AF' : '#112D4E' }}>{ic}</span>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderColor: '#DBE2EF', color: '#3F72AF' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
