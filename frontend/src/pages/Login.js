import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await login(email, password);
            if (data.user.is_staff) {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🎓 Voquora AI</h1>
                <h2 style={styles.subtitle}>Welcome Back</h2>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p style={styles.link}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    title: { textAlign: 'center', color: '#4f46e5', marginBottom: '8px' },
    subtitle: { textAlign: 'center', color: '#374151', marginBottom: '24px' },
    error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px' },
    field: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '600' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
    link: { textAlign: 'center', marginTop: '16px', color: '#6b7280' },
};

export default Login;