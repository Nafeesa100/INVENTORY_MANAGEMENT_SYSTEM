import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, CircularProgress, Card, Grid, Avatar } from '@mui/material';
import { ArrowBack, Inventory2, Warning, ErrorOutline, Add } from '@mui/icons-material';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

export default function CategoryProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products?category=${id}&limit=100`),
        ]);
        const cat = catRes.data.data.find(c => c._id === id);
        setCategory(cat);
        setProducts(prodRes.data.data);
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const getStockStatus = (p) => {
    if (p.stock === 0) return { label: 'Out of Stock', color: '#ef4444', bg: '#fef2f2' };
    if (p.stock <= p.lowStockThreshold) return { label: 'Low Stock', color: '#f59e0b', bg: '#fffbeb' };
    return { label: 'In Stock', color: '#22c55e', bg: '#f0fdf4' };
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: '#3F72AF' }} /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/categories')} sx={{ color: '#3F72AF', mb: 1.5, pl: 0 }}>Back to Categories</Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${category?.color}22, ${category?.color}44)`, border: `2px solid ${category?.color}44` }}>
              <span className="material-icons" style={{ color: category?.color, fontSize: 28 }}>{category?.icon || 'category'}</span>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>{category?.name}</Typography>
              <Typography sx={{ color: '#3F72AF', fontWeight: 500 }}>{products.length} products in this category</Typography>
            </Box>
          </Box>
          {['admin','staff'].includes(user?.role) && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/products')} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>Add Product</Button>
          )}
        </Box>
      </Box>

      {/* Stock summary chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`${products.filter(p => p.stock > p.lowStockThreshold).length} In Stock`} sx={{ background: '#f0fdf4', color: '#22c55e', fontWeight: 700 }} />
        <Chip label={`${products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length} Low Stock`} icon={<Warning sx={{ color: '#f59e0b !important', fontSize: '16px !important' }} />} sx={{ background: '#fffbeb', color: '#f59e0b', fontWeight: 700 }} />
        <Chip label={`${products.filter(p => p.stock === 0).length} Out of Stock`} icon={<ErrorOutline sx={{ color: '#ef4444 !important', fontSize: '16px !important' }} />} sx={{ background: '#fef2f2', color: '#ef4444', fontWeight: 700 }} />
      </Box>

      {products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, color: '#3F72AF' }}>
          <Inventory2 sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
          <Typography sx={{ fontWeight: 600 }}>No products in this category</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {products.map(p => {
            const status = getStockStatus(p);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
                <Card sx={{ p: 2.5, transition: 'all 0.25s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(17,45,78,0.1)' }, border: `1px solid ${status.bg}`, cursor: 'default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar sx={{ background: `linear-gradient(135deg, ${category?.color}22, ${category?.color}44)`, color: category?.color, width: 40, height: 40, fontSize: '0.8rem', fontWeight: 700 }}>
                      {p.name?.[0]}
                    </Avatar>
                    <Chip label={status.label} size="small" sx={{ background: status.bg, color: status.color, fontWeight: 700, fontSize: '0.7rem' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#112D4E', mb: 0.25, fontSize: '0.95rem' }}>{p.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#3F72AF', fontWeight: 600 }}>{p.sku}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid #DBE2EF' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#3F72AF' }}>Price</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#112D4E', fontSize: '1rem' }}>${p.price}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#3F72AF' }}>Stock</Typography>
                      <Typography sx={{ fontWeight: 800, color: status.color, fontSize: '1rem' }}>{p.availableStock ?? p.stock}</Typography>
                    </Box>
                  </Box>
                  {p.reservedStock > 0 && (
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600, display: 'block', mt: 0.5 }}>
                      🔒 {p.reservedStock} reserved
                    </Typography>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
