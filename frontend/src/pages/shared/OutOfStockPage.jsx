import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button } from '@mui/material';
import { ErrorOutline, ArrowBack } from '@mui/icons-material';
import api from '../../api/axios';

export default function OutOfStockPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?status=out&limit=100').then(r => setProducts(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ color: '#3F72AF', mb: 2, pl: 0 }}>Dashboard</Button>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ background: '#fef2f2', borderRadius: 3, p: 1.5 }}><ErrorOutline sx={{ color: '#ef4444', fontSize: 28 }} /></Box>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>Out of Stock</Typography>
          <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>{products.length} items need immediate restocking</Typography>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress sx={{ color: '#ef4444' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #fca5a5' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Product','SKU','Category','Cost Price','Sell Price','Status'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#112D4E', background: '#fef2f2', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(p => (
                <TableRow key={p._id} sx={{ '&:hover': { background: '#fef2f250' } }}>
                  <TableCell><Typography sx={{ fontWeight: 700, color: '#112D4E' }}>{p.name}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#3F72AF', background: '#EBF2FF', px: 1, py: 0.25, borderRadius: 1, display: 'inline-block' }}>{p.sku}</Typography></TableCell>
                  <TableCell>{p.category && <Chip label={p.category.name} size="small" sx={{ background: `${p.category.color}18`, color: p.category.color, fontWeight: 700 }} />}</TableCell>
                  <TableCell><Typography sx={{ color: '#3F72AF', fontWeight: 600 }}>${p.costPrice || 0}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontWeight: 700, color: '#112D4E' }}>${p.price}</Typography></TableCell>
                  <TableCell><Chip label="OUT OF STOCK" size="small" sx={{ background: '#fef2f2', color: '#ef4444', fontWeight: 800, border: '1px solid #fca5a5' }} /></TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem' }}>No out-of-stock items!</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
