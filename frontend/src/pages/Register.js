import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        level: 'beginner',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (formData.password !== formData.password2) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.email?.[0] || data?.username?.[0] || data?.password?.[0] || 'Registration failed.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🎓 Voquora AI</h1>
                <h2 style={styles.subtitle}>Create Account</h2>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Username</label>
                        <input style={styles.input} name="username" value={formData.username} onChange={handleChange} placeholder="Enter username" required />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" required />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Level</label>
                        <select style={styles.input} name="level" value={formData.level} onChange={handleChange}>
                            <option value="beginner">Beginner</option>
                            <option value="elementary">Elementary</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="upper_intermediate">Upper Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input style={styles.input} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Confirm Password</label>
                        <input style={styles.input} type="password" name="password2" value={formData.password2} onChange={handleChange} placeholder="Confirm password" required />
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
                <p style={styles.link}>
                    Already have an account? <Link to="/login">Login</Link>
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

export default Register;