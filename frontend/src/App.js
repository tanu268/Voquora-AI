import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (!user.is_staff) return <Navigate to="/dashboard" />;
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/practice" element={<PrivateRoute><Practice /></PrivateRoute>} />
                <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;