import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Select, MenuItem, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, Divider, IconButton, Tooltip,
} from '@mui/material';
import { Add, CheckCircle, Cancel, Visibility, Receipt } from '@mui/icons-material';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  reserved:  { label: 'Reserved',  color: '#f59e0b', bg: '#fffbeb' },
  completed: { label: 'Completed', color: '#22c55e', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
  pending:   { label: 'Pending',   color: '#3F72AF', bg: '#EBF2FF' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?status=${filterStatus}&limit=50`);
      setOrders(data.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this order as completed? This will deduct stock.')) return;
    setActionLoading(id + 'complete');
    try {
      const { data } = await api.patch(`/orders/${id}/complete`);
      setOrders(prev => prev.map(o => o._id === id ? data.data : o));
      if (selectedOrder?._id === id) setSelectedOrder(data.data);
      toast.success('✅ Order completed! Stock deducted.');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(''); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order? Reserved stock will be released.')) return;
    setActionLoading(id + 'cancel');
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o._id === id ? data.data : o));
      if (selectedOrder?._id === id) setSelectedOrder(data.data);
      toast.success('Order cancelled. Stock released.');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(''); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>Orders</Typography>
          <Typography sx={{ color: '#3F72AF', fontWeight: 500 }}>{orders.length} orders</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select label="Filter Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/orders/new')} sx={{ background: 'linear-gradient(135deg,#3F72AF,#112D4E)' }}>
            New Order
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress sx={{ color: '#3F72AF' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #DBE2EF', boxShadow: '0 2px 12px rgba(17,45,78,0.06)' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Order #','Customer','Items','Total','Payment','Cashier','Status','Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#112D4E', background: '#F9F7F7', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(o => {
                const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                const isReserved = o.status === 'reserved';
                return (
                  <TableRow key={o._id} sx={{ '&:hover': { background: '#F9F7F7' } }}>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#3F72AF', fontSize: '0.85rem' }}>{o.orderNumber}</Typography>
                      <Typography variant="caption" sx={{ color: '#3F72AF', opacity: 0.7 }}>{new Date(o.createdAt).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600, color: '#112D4E' }}>{o.customerName || '—'}</Typography></TableCell>
                    <TableCell><Typography sx={{ color: '#3F72AF', fontWeight: 600 }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontWeight: 800, color: '#112D4E' }}>${o.totalAmount.toFixed(2)}</Typography></TableCell>
                    <TableCell><Chip label={o.paymentMethod} size="small" sx={{ background: '#EBF2FF', color: '#3F72AF', fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize' }} /></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.85rem', color: '#112D4E', fontWeight: 600 }}>{o.cashier?.name}</Typography></TableCell>
                    <TableCell><Chip label={sc.label} size="small" sx={{ background: sc.bg, color: sc.color, fontWeight: 700 }} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setSelectedOrder(o)} sx={{ '&:hover': { background: '#EBF2FF' } }}>
                            <Visibility fontSize="small" sx={{ color: '#3F72AF' }} />
                          </IconButton>
                        </Tooltip>
                        {isReserved && (
                          <>
                            <Tooltip title="Complete Order">
                              <IconButton size="small" onClick={() => handleComplete(o._id)} disabled={!!actionLoading} sx={{ '&:hover': { background: '#f0fdf4' } }}>
                                {actionLoading === o._id + 'complete' ? <CircularProgress size={16} /> : <CheckCircle fontSize="small" sx={{ color: '#22c55e' }} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Order">
                              <IconButton size="small" onClick={() => handleCancel(o._id)} disabled={!!actionLoading} sx={{ '&:hover': { background: '#fef2f2' } }}>
                                {actionLoading === o._id + 'cancel' ? <CircularProgress size={16} /> : <Cancel fontSize="small" sx={{ color: '#ef4444' }} />}
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#3F72AF' }}>
                  <Receipt sx={{ fontSize: 40, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                  No orders found
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        {selectedOrder && (
          <>
            <DialogTitle sx={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#112D4E' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedOrder.orderNumber}
                <Chip label={STATUS_CONFIG[selectedOrder.status]?.label} sx={{ background: STATUS_CONFIG[selectedOrder.status]?.bg, color: STATUS_CONFIG[selectedOrder.status]?.color, fontWeight: 700 }} />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#3F72AF', fontWeight: 600 }}>Customer: {selectedOrder.customerName || 'Walk-in'}</Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#3F72AF', fontWeight: 600 }}>Cashier: {selectedOrder.cashier?.name}</Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#3F72AF', fontWeight: 600 }}>Date: {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {selectedOrder.items.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #DBE2EF' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#112D4E', fontSize: '0.9rem' }}>{item.name || item.product?.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#3F72AF' }}>Qty: {item.quantity} × ${item.price}</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#112D4E' }}>${(item.quantity * item.price).toFixed(2)}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1 }}>
                <Typography sx={{ fontWeight: 800, color: '#112D4E' }}>Total</Typography>
                <Typography sx={{ fontWeight: 800, color: '#3F72AF', fontSize: '1.1rem' }}>${selectedOrder.totalAmount.toFixed(2)}</Typography>
              </Box>
              {selectedOrder.notes && <Box sx={{ mt: 2, p: 1.5, background: '#F9F7F7', borderRadius: 2 }}><Typography variant="caption" sx={{ color: '#3F72AF' }}>Notes: {selectedOrder.notes}</Typography></Box>}
              {selectedOrder.status === 'reserved' && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                  <Button fullWidth variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleComplete(selectedOrder._id)} sx={{ fontWeight: 700 }}>Complete</Button>
                  <Button fullWidth variant="outlined" color="error" startIcon={<Cancel />} onClick={() => handleCancel(selectedOrder._id)} sx={{ fontWeight: 700 }}>Cancel</Button>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
