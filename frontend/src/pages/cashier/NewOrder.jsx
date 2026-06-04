import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Button, TextField, Card, Chip, IconButton, Divider,
  CircularProgress, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Alert, Collapse, Avatar,
} from '@mui/material';
import {
  Search, Add, Remove, Delete, ShoppingCart, ArrowBack, Lock,
  Person, Phone, Badge, Home, ExpandMore, ExpandLess,
} from '@mui/icons-material';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function NewOrder() {
  const navigate = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [categories,setCategories]= useState([]);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [cart,      setCart]      = useState([]);
  const [customer,  setCustomer]  = useState({ name:'', phone:'', cnic:'', address:'' });
  const [showCust,  setShowCust]  = useState(true);
  const [notes,     setNotes]     = useState('');
  const [payment,   setPayment]   = useState('cash');
  const [loading,   setLoading]   = useState(false);
  const [submitting,setSubmitting]= useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          api.get('/products?limit=200'),
          api.get('/categories'),
        ]);
        setProducts(pRes.data.data);
        setCategories(cRes.data.data);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.includes(search);
    const mc = !filterCat || p.category?._id === filterCat;
    return ms && mc && (p.stock - p.reservedStock) > 0;
  });

  const inCart    = (id) => cart.find(c => c._id === id);
  const available = (p)  => p.stock - p.reservedStock;

  const addToCart = (product) => {
    const avail = available(product);
    const existing = inCart(product._id);
    if ((existing?.quantity || 0) >= avail) { toast.error(`Only ${avail} available`); return; }
    if (existing) {
      setCart(prev => prev.map(c => c._id === product._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => {
      if (c._id !== id) return c;
      const prod  = products.find(p => p._id === id);
      const max   = available(prod || c);
      const newQty = c.quantity + delta;
      if (newQty > max) { toast.error(`Only ${max} available`); return c; }
      if (newQty < 1) return c;
      return { ...c, quantity: newQty };
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c._id !== id));

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setSubmitting(true);
    try {
      await api.post('/orders', {
        items: cart.map(c => ({ product: c._id, quantity: c.quantity, price: c.price, name: c.name })),
        totalAmount: total,
        paymentMethod: payment,
        customer,
        notes,
      });
      toast.success('Order created & stock reserved!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally { setSubmitting(false); }
  };

  // Format CNIC as XXXXX-XXXXXXX-X
  const formatCnic = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0,5)}-${digits.slice(5)}`;
    return `${digits.slice(0,5)}-${digits.slice(5,12)}-${digits.slice(12)}`;
  };

  // Format phone
  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    return digits;
  };

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:4 }}>
        <Button startIcon={<ArrowBack/>} onClick={()=>navigate('/orders')}
          sx={{ color:'#3F72AF', pl:0, fontWeight:600, '&:hover':{ background:'transparent', color:'#112D4E' } }}>
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#112D4E', lineHeight:1 }}>
            New Order
          </Typography>
          <Typography sx={{ color:'#94a3b8', fontSize:'0.82rem', fontWeight:500 }}>
            Select products and fill customer details
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>

        {/* ── LEFT: Product Selector ── */}
        <Grid item xs={12} md={7}>
          <Card sx={{ overflow:'hidden' }}>
            {/* Card header */}
            <Box sx={{ px:3, py:2.5, background:'linear-gradient(135deg,#112D4E,#1e3d68)', display:'flex', alignItems:'center', gap:2 }}>
              <Typography sx={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#F9F7F7', fontSize:'1rem', flex:1 }}>
                Select Products
              </Typography>
              <Chip label={`${filtered.length} available`} size="small"
                sx={{ background:'rgba(219,226,239,0.15)', color:'#DBE2EF', fontWeight:700, fontSize:'0.7rem' }}/>
            </Box>

            {/* Filters */}
            <Box sx={{ p:2, borderBottom:'1px solid #F0F4F8', display:'flex', gap:1.5, flexWrap:'wrap', background:'#FAFBFC' }}>
              <TextField placeholder="Search by name or SKU…" size="small" value={search}
                onChange={e=>setSearch(e.target.value)} sx={{ flex:1, minWidth:160 }}
                InputProps={{ startAdornment:<InputAdornment position="start"><Search sx={{color:'#3F72AF',fontSize:17}}/></InputAdornment> }}/>
              <FormControl size="small" sx={{ minWidth:150 }}>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {categories.map(c=><MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            {/* Product grid */}
            <Box sx={{ p:2, maxHeight:400, overflowY:'auto' }}>
              {loading ? (
                <Box sx={{ display:'flex', justifyContent:'center', py:6 }}><CircularProgress sx={{color:'#3F72AF'}}/></Box>
              ) : (
                <Grid container spacing={1.5}>
                  {filtered.map(p => {
                    const ci = inCart(p._id);
                    const av = available(p);
                    return (
                      <Grid item xs={12} sm={6} key={p._id}>
                        <Box onClick={()=>addToCart(p)} sx={{
                          p:2, borderRadius:3, cursor:'pointer',
                          border:`2px solid ${ci ? '#3F72AF' : '#E8EDF5'}`,
                          background: ci ? 'linear-gradient(135deg,#EBF2FF,#f0f6ff)' : '#fff',
                          transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                          '&:hover':{ border:'2px solid #3F72AF', transform:'translateY(-2px)', boxShadow:'0 6px 20px rgba(63,114,175,0.14)' },
                        }}>
                          <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.75 }}>
                            <Typography sx={{ fontWeight:700, color:'#112D4E', fontSize:'0.84rem', flex:1, pr:1, lineHeight:1.3 }}>{p.name}</Typography>
                            <Typography sx={{ fontWeight:800, color:'#3F72AF', fontSize:'0.88rem', flexShrink:0 }}>${p.price}</Typography>
                          </Box>
                          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <Chip label={p.category?.name||'—'} size="small"
                              sx={{ height:18, fontSize:'0.62rem', fontWeight:700, background:`${p.category?.color||'#3F72AF'}18`, color:p.category?.color||'#3F72AF' }}/>
                            <Box sx={{ display:'flex', alignItems:'center', gap:0.75 }}>
                              {p.reservedStock > 0 && (
                                <Box sx={{ display:'flex', alignItems:'center', gap:0.3, background:'#fffbeb', borderRadius:1, px:0.75, py:0.2 }}>
                                  <Lock sx={{ fontSize:9, color:'#f59e0b' }}/>
                                  <Typography sx={{ fontSize:'0.6rem', color:'#f59e0b', fontWeight:700 }}>{p.reservedStock}</Typography>
                                </Box>
                              )}
                              <Box sx={{ background:'#ecfdf5', borderRadius:1, px:0.75, py:0.2 }}>
                                <Typography sx={{ fontSize:'0.65rem', color:'#10b981', fontWeight:800 }}>{av} left</Typography>
                              </Box>
                            </Box>
                          </Box>
                          {ci && (
                            <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', gap:1.5, mt:1.5, pt:1.5, borderTop:'1px dashed #DBE2EF' }}>
                              <IconButton size="small" onClick={e=>{e.stopPropagation();updateQty(p._id,-1);}}
                                sx={{ background:'#EBF2FF', color:'#3F72AF', width:26, height:26, '&:hover':{background:'#DBE2EF'} }}>
                                <Remove sx={{fontSize:13}}/>
                              </IconButton>
                              <Typography sx={{ fontWeight:800, color:'#112D4E', minWidth:22, textAlign:'center' }}>{ci.quantity}</Typography>
                              <IconButton size="small" onClick={e=>{e.stopPropagation();updateQty(p._id,1);}}
                                sx={{ background:'#EBF2FF', color:'#3F72AF', width:26, height:26, '&:hover':{background:'#DBE2EF'} }}>
                                <Add sx={{fontSize:13}}/>
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                  {filtered.length === 0 && !loading && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign:'center', py:5 }}>
                        <ShoppingCart sx={{ fontSize:40, color:'#DBE2EF', mb:1 }}/>
                        <Typography sx={{ color:'#94a3b8', fontWeight:600 }}>No products available</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>

        {/* ── RIGHT: Cart + Customer + Payment ── */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display:'flex', flexDirection:'column', gap:2.5, position:'sticky', top:20 }}>

            {/* Cart */}
            <Card sx={{ overflow:'hidden' }}>
              <Box sx={{ px:2.5, py:2, background:'linear-gradient(135deg,#1e3d68,#3F72AF)', display:'flex', alignItems:'center', gap:2 }}>
                <ShoppingCart sx={{ color:'#fff', fontSize:20 }}/>
                <Typography sx={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', fontSize:'1rem', flex:1 }}>Cart</Typography>
                <Chip label={`${cart.length} items`} size="small"
                  sx={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontWeight:800 }}/>
              </Box>

              <Alert severity="info" icon={<Lock sx={{fontSize:15}}/>}
                sx={{ borderRadius:0, border:'none', borderBottom:'1px solid #EBF2FF', background:'#EBF2FF', py:0.6, fontSize:'0.73rem' }}>
                Stock is <strong>reserved immediately</strong> — prevents double-selling
              </Alert>

              <Box sx={{ p:2, maxHeight:200, overflowY:'auto' }}>
                {cart.length === 0 ? (
                  <Box sx={{ textAlign:'center', py:3.5, color:'#94a3b8' }}>
                    <ShoppingCart sx={{ fontSize:34, opacity:0.2, mb:1 }}/>
                    <Typography sx={{ fontWeight:600, fontSize:'0.85rem' }}>Cart is empty</Typography>
                    <Typography variant="caption">Click products to add</Typography>
                  </Box>
                ) : cart.map(item => (
                  <Box key={item._id} sx={{ display:'flex', alignItems:'center', gap:1, py:1.2, borderBottom:'1px solid #F8FAFC' }}>
                    <Avatar sx={{ width:30, height:30, fontSize:'0.7rem', fontWeight:800, flexShrink:0,
                      background:`${item.category?.color||'#3F72AF'}22`, color:item.category?.color||'#3F72AF' }}>
                      {item.name?.[0]}
                    </Avatar>
                    <Box sx={{ flex:1, overflow:'hidden' }}>
                      <Typography sx={{ fontWeight:700, color:'#112D4E', fontSize:'0.8rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color:'#94a3b8', fontWeight:600 }}>
                        ${item.price} × {item.quantity} = <strong style={{color:'#3F72AF'}}>${(item.price*item.quantity).toFixed(2)}</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.4, flexShrink:0 }}>
                      <IconButton size="small" onClick={()=>updateQty(item._id,-1)} sx={{ background:'#F8FAFC', width:22, height:22 }}><Remove sx={{fontSize:11}}/></IconButton>
                      <Typography sx={{ fontWeight:800, minWidth:16, textAlign:'center', fontSize:'0.8rem' }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={()=>updateQty(item._id,1)} sx={{ background:'#F8FAFC', width:22, height:22 }}><Add sx={{fontSize:11}}/></IconButton>
                      <IconButton size="small" onClick={()=>removeFromCart(item._id)} sx={{ color:'#ef4444', width:22, height:22, '&:hover':{background:'#fef2f2'} }}><Delete sx={{fontSize:12}}/></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Total */}
              <Box sx={{ mx:2, mb:2, p:'12px 16px', background:'linear-gradient(135deg,#EBF2FF,#DBE2EF)', borderRadius:2.5, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Typography sx={{ fontWeight:700, color:'#112D4E', fontSize:'0.9rem' }}>Total Amount</Typography>
                <Typography sx={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#3F72AF', fontSize:'1.5rem' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Card>

            {/* ── Customer Info ── */}
            <Card sx={{ overflow:'hidden' }}>
              {/* Toggle header */}
              <Box
                onClick={()=>setShowCust(!showCust)}
                sx={{ px:2.5, py:2, display:'flex', alignItems:'center', gap:1.5, cursor:'pointer',
                  borderBottom: showCust ? '1px solid #F0F4F8' : 'none',
                  '&:hover':{ background:'#FAFBFC' }, transition:'background 0.15s' }}
              >
                <Box sx={{ width:32, height:32, borderRadius:2, background:'#EBF2FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Person sx={{ fontSize:17, color:'#3F72AF' }}/>
                </Box>
                <Box sx={{ flex:1 }}>
                  <Typography sx={{ fontWeight:700, color:'#112D4E', fontSize:'0.9rem', lineHeight:1.2 }}>
                    Customer Info
                  </Typography>
                  <Typography sx={{ fontSize:'0.68rem', color:'#94a3b8', fontWeight:500 }}>
                    {customer.name ? customer.name : 'Optional — fill for record keeping'}
                  </Typography>
                </Box>
                {showCust ? <ExpandLess sx={{color:'#94a3b8'}}/> : <ExpandMore sx={{color:'#94a3b8'}}/>}
              </Box>

              <Collapse in={showCust}>
                <Box sx={{ p:2.5, display:'flex', flexDirection:'column', gap:2 }}>

                  {/* Name */}
                  <TextField size="small" label="Customer Name" fullWidth
                    value={customer.name}
                    onChange={e=>setCustomer(p=>({...p,name:e.target.value}))}
                    placeholder="e.g. Ahmed Ali"
                    InputProps={{ startAdornment:<InputAdornment position="start"><Person sx={{fontSize:16,color:'#3F72AF'}}/></InputAdornment> }}/>

                  {/* Phone */}
                  <TextField size="small" label="Phone Number" fullWidth
                    value={customer.phone}
                    onChange={e=>setCustomer(p=>({...p,phone:formatPhone(e.target.value)}))}
                    placeholder="03XX-XXXXXXX"
                    inputProps={{ maxLength:11 }}
                    InputProps={{ startAdornment:<InputAdornment position="start"><Phone sx={{fontSize:16,color:'#3F72AF'}}/></InputAdornment> }}
                    helperText={customer.phone.length > 0 && customer.phone.length < 11 ? 'Enter 11 digit number' : ''}/>

                  {/* CNIC */}
                  <TextField size="small" label="CNIC" fullWidth
                    value={customer.cnic}
                    onChange={e=>setCustomer(p=>({...p,cnic:formatCnic(e.target.value)}))}
                    placeholder="XXXXX-XXXXXXX-X"
                    inputProps={{ maxLength:15 }}
                    InputProps={{ startAdornment:<InputAdornment position="start"><Badge sx={{fontSize:16,color:'#3F72AF'}}/></InputAdornment> }}
                    helperText={
                      customer.cnic.replace(/\D/g,'').length > 0 && customer.cnic.replace(/\D/g,'').length < 13
                        ? 'CNIC must be 13 digits' : ''
                    }/>

                  {/* Address */}
                  <TextField size="small" label="Address" fullWidth multiline rows={2}
                    value={customer.address}
                    onChange={e=>setCustomer(p=>({...p,address:e.target.value}))}
                    placeholder="Street, City"
                    InputProps={{ startAdornment:<InputAdornment position="start"><Home sx={{fontSize:16,color:'#3F72AF',alignSelf:'flex-start',mt:1}}/></InputAdornment> }}/>

                </Box>
              </Collapse>
            </Card>

            {/* Payment & Notes */}
            <Card sx={{ p:2.5 }}>
              <Typography sx={{ fontWeight:700, color:'#112D4E', fontSize:'0.88rem', mb:2 }}>
                Payment & Notes
              </Typography>
              <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select label="Payment Method" value={payment} onChange={e=>setPayment(e.target.value)}>
                    <MenuItem value="cash">💵 Cash</MenuItem>
                    <MenuItem value="card">💳 Card</MenuItem>
                    <MenuItem value="other">📱 Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" label="Notes (optional)" fullWidth multiline rows={2}
                  value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Special instructions…"/>
              </Box>
            </Card>

            {/* Submit */}
            <Button fullWidth variant="contained" size="large"
              startIcon={submitting ? null : <Lock/>}
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              sx={{
                py:1.9, fontWeight:800, fontSize:'1rem', borderRadius:3,
                background: cart.length === 0 ? undefined : 'linear-gradient(135deg,#3F72AF,#112D4E)',
                boxShadow: cart.length > 0 ? '0 8px 28px rgba(63,114,175,0.38)' : undefined,
                transition:'all 0.3s',
                '&:not(:disabled):hover':{ transform:'translateY(-2px)', boxShadow:'0 12px 36px rgba(63,114,175,0.5)' },
              }}>
              {submitting
                ? <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                    <CircularProgress size={20} sx={{color:'#fff'}}/>
                    <span>Creating…</span>
                  </Box>
                : `Reserve & Create — $${total.toFixed(2)}`}
            </Button>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
