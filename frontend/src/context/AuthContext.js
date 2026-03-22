import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            getProfile()
                .then((res) => setUser(res.data))
                .catch(() => localStorage.clear())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await loginUser({ email, password });
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (data) => {
        const res = await registerUser(data);
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            await logoutUser({ refresh });
        } catch (err) {}
        localStorage.clear();
        setUser(null);
    };

    const isAdmin = user?.is_staff === true;

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);