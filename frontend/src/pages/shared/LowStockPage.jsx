import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, LinearProgress, Button } from '@mui/material';
import { Warning, ArrowBack } from '@mui/icons-material';
import api from '../../api/axios';

export default function LowStockPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?status=low&limit=100').then(r => setProducts(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ color: '#3F72AF', mb: 2, pl: 0 }}>Dashboard</Button>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ background: '#fffbeb', borderRadius: 3, p: 1.5 }}><Warning sx={{ color: '#f59e0b', fontSize: 28 }} /></Box>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>Low Stock</Typography>
          <Typography sx={{ color: '#f59e0b', fontWeight: 600 }}>{products.length} items need restocking soon</Typography>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress sx={{ color: '#f59e0b' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #ffe4a0' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Product','SKU','Category','Current Stock','Threshold','Stock Level','Price'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#112D4E', background: '#fffbeb', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(p => {
                const pct = Math.round((p.stock / p.lowStockThreshold) * 100);
                return (
                  <TableRow key={p._id} sx={{ '&:hover': { background: '#fffbeb50' } }}>
                    <TableCell><Typography sx={{ fontWeight: 700, color: '#112D4E' }}>{p.name}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#3F72AF', background: '#EBF2FF', px: 1, py: 0.25, borderRadius: 1, display: 'inline-block' }}>{p.sku}</Typography></TableCell>
                    <TableCell>{p.category && <Chip label={p.category.name} size="small" sx={{ background: `${p.category.color}18`, color: p.category.color, fontWeight: 700 }} />}</TableCell>
                    <TableCell><Typography sx={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>{p.stock}</Typography></TableCell>
                    <TableCell><Typography sx={{ color: '#3F72AF', fontWeight: 600 }}>{p.lowStockThreshold}</Typography></TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{ flex: 1, height: 8, borderRadius: 4, background: '#ffe4a0', '& .MuiLinearProgress-bar': { background: '#f59e0b', borderRadius: 4 } }} />
                        <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700, minWidth: 35 }}>{pct}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography sx={{ fontWeight: 700, color: '#112D4E' }}>${p.price}</Typography></TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem' }}>All stock levels are healthy!</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
