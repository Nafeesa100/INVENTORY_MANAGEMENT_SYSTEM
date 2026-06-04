import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/shared/LoginPage';
import Dashboard from './pages/shared/Dashboard';
import Products from './pages/shared/Products';
import Categories from './pages/shared/Categories';
import CategoryProducts from './pages/shared/CategoryProducts';
import Orders from './pages/cashier/Orders';
import NewOrder from './pages/cashier/NewOrder';
import UserManagement from './pages/admin/UserManagement';
import LowStockPage from './pages/shared/LowStockPage';
import OutOfStockPage from './pages/shared/OutOfStockPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'staff']}><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/categories/:id/products" element={<ProtectedRoute><CategoryProducts /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['cashier', 'admin']}><Orders /></ProtectedRoute>} />
        <Route path="/orders/new" element={<ProtectedRoute roles={['cashier', 'admin']}><NewOrder /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/stock/low" element={<ProtectedRoute roles={['admin', 'staff']}><LowStockPage /></ProtectedRoute>} />
        <Route path="/stock/out" element={<ProtectedRoute roles={['admin', 'staff']}><OutOfStockPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                borderRadius: 12,
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
