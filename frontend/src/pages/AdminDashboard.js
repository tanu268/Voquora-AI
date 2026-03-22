import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const COLORS = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

const EMPTY_EXERCISE = {
    topic: '',
    exercise_type: 'mcq',
    question: '',
    answer: '',
    options: '',
    explanation: '',
    difficulty: 1,
    xp_reward: 10,
    is_active: true,
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [topics, setTopics] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [formData, setFormData] = useState(EMPTY_EXERCISE);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [statsRes, usersRes, exRes, topRes] = await Promise.all([
                api.get('/auth/admin/stats/'),
                api.get('/auth/admin/users/'),
                api.get('/learning/admin/exercises/'),
                api.get('/learning/admin/topics/'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.results || usersRes.data);
            setExercises(exRes.data);
            setTopics(topRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleDeleteUser = async (pk) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/auth/admin/users/${pk}/`);
            setUsers(users.filter((u) => u.id !== pk));
        } catch (err) {
            alert('Failed to delete user.');
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEditExercise = (exercise) => {
        setEditingExercise(exercise.id);
        setFormData({
            topic: exercise.topic,
            exercise_type: exercise.exercise_type,
            question: exercise.question,
            answer: exercise.answer,
            options: exercise.options ? exercise.options.join(', ') : '',
            explanation: exercise.explanation,
            difficulty: exercise.difficulty,
            xp_reward: exercise.xp_reward,
            is_active: exercise.is_active,
        });
        setShowForm(true);
        setFormError('');
        setFormSuccess('');
    };

    const handleNewExercise = () => {
        setEditingExercise(null);
        setFormData(EMPTY_EXERCISE);
        setShowForm(true);
        setFormError('');
        setFormSuccess('');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        const payload = {
            ...formData,
            options: formData.exercise_type === 'mcq' && formData.options
                ? formData.options.split(',').map((o) => o.trim())
                : null,
        };

        try {
            if (editingExercise) {
                await api.put(`/learning/admin/exercises/${editingExercise}/`, payload);
                setFormSuccess('Exercise updated successfully!');
            } else {
                await api.post('/learning/admin/exercises/', payload);
                setFormSuccess('Exercise created successfully!');
            }
            const exRes = await api.get('/learning/admin/exercises/');
            setExercises(exRes.data);
            setTimeout(() => {
                setShowForm(false);
                setFormSuccess('');
            }, 1500);
        } catch (err) {
            setFormError('Failed to save exercise. Check all fields.');
        }
    };

    const handleDeleteExercise = async (pk) => {
        if (!window.confirm('Delete this exercise?')) return;
        try {
            await api.delete(`/learning/admin/exercises/${pk}/`);
            setExercises(exercises.filter((e) => e.id !== pk));
        } catch (err) {
            alert('Failed to delete exercise.');
        }
    };

    if (loading) return <div style={styles.loading}>Loading admin dashboard...</div>;

    const weaknessChartData = stats?.top_weaknesses?.map((w) => ({
        name: w.error_type.replace('_', ' '),
        value: w.total,
    })) || [];

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <h1 style={styles.logo}>🎓 Voquora AI — Admin</h1>
                <div style={styles.navRight}>
                    <span style={styles.adminBadge}>👑 {user?.username}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                {['overview', 'users', 'exercises'].map((tab) => (
                    <button
                        key={tab}
                        style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'overview' ? '📊 Overview' : tab === 'users' ? '👥 Users' : '📝 Exercises'}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <>
                        <div style={styles.statsGrid}>
                            {[
                                { icon: '👥', value: stats?.total_users || 0, label: 'Total Users' },
                                { icon: '📝', value: stats?.total_exercises || 0, label: 'Total Exercises' },
                                { icon: '🎯', value: stats?.total_attempts || 0, label: 'Total Attempts' },
                                { icon: '✅', value: `${stats?.accuracy_percent || 0}%`, label: 'Overall Accuracy' },
                            ].map((s, i) => (
                                <div key={i} style={styles.statCard}>
                                    <div style={styles.statIcon}>{s.icon}</div>
                                    <div style={styles.statValue}>{s.value}</div>
                                    <div style={styles.statLabel}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={styles.twoCol}>
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>🏆 Top Users by XP</h3>
                                {stats?.top_users?.length === 0
                                    ? <p style={styles.empty}>No users yet.</p>
                                    : stats?.top_users?.map((u, i) => (
                                        <div key={u.id} style={styles.userRow}>
                                            <span style={styles.rank}>#{i + 1}</span>
                                            <span style={styles.userName}>{u.username}</span>
                                            <span style={styles.userLevel}>{u.level}</span>
                                            <span style={styles.userXp}>⭐ {u.total_xp}</span>
                                        </div>
                                    ))
                                }
                            </div>
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>⚠️ Common Weaknesses</h3>
                                {weaknessChartData.length === 0
                                    ? <p style={styles.empty}>No weakness data yet.</p>
                                    : (
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={weaknessChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                                                    {weaknessChartData.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )
                                }
                            </div>
                        </div>
                    </>
                )}

                {/* ── Users Tab ── */}
                {activeTab === 'users' && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>👥 All Users</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    {['Username', 'Email', 'Level', 'XP', 'Joined', 'Actions'].map((h) => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} style={styles.tableRow}>
                                        <td style={styles.td}>{u.username}</td>
                                        <td style={styles.td}>{u.email}</td>
                                        <td style={styles.td}>{u.level}</td>
                                        <td style={styles.td}>⭐ {u.total_xp}</td>
                                        <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <button style={styles.deleteBtn} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Exercises Tab ── */}
                {activeTab === 'exercises' && (
                    <>
                        <div style={styles.exerciseHeader}>
                            <h3 style={{ margin: 0 }}>📝 Exercises ({exercises.length})</h3>
                            <button style={styles.addBtn} onClick={handleNewExercise}>+ Add Exercise</button>
                        </div>

                        {/* Exercise Form */}
                        {showForm && (
                            <div style={styles.formCard}>
                                <h3 style={styles.cardTitle}>{editingExercise ? '✏️ Edit Exercise' : '➕ New Exercise'}</h3>
                                {formError && <div style={styles.formError}>{formError}</div>}
                                {formSuccess && <div style={styles.formSuccess}>{formSuccess}</div>}
                                <form onSubmit={handleFormSubmit}>
                                    <div style={styles.formGrid}>
                                        <div style={styles.formField}>
                                            <label style={styles.label}>Topic</label>
                                            <select style={styles.input} name="topic" value={formData.topic} onChange={handleFormChange} required>
                                                <option value="">Select topic</option>
                                                {topics.map((t) => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={styles.formField}>
                                            <label style={styles.label}>Exercise Type</label>
                                            <select style={styles.input} name="exercise_type" value={formData.exercise_type} onChange={handleFormChange}>
                                                <option value="mcq">Multiple Choice</option>
                                                <option value="fill_blank">Fill in the Blank</option>
                                                <option value="error_correction">Error Correction</option>
                                                <option value="sentence_rewrite">Sentence Rewrite</option>
                                            </select>
                                        </div>
                                        <div style={styles.formField}>
                                            <label style={styles.label}>Difficulty</label>
                                            <select style={styles.input} name="difficulty" value={formData.difficulty} onChange={handleFormChange}>
                                                <option value={1}>1 - Beginner</option>
                                                <option value={2}>2 - Elementary</option>
                                                <option value={3}>3 - Intermediate</option>
                                                <option value={4}>4 - Upper Intermediate</option>
                                                <option value={5}>5 - Advanced</option>
                                            </select>
                                        </div>
                                        <div style={styles.formField}>
                                            <label style={styles.label}>XP Reward</label>
                                            <input style={styles.input} type="number" name="xp_reward" value={formData.xp_reward} onChange={handleFormChange} min="1" />
                                        </div>
                                    </div>
                                    <div style={styles.formField}>
                                        <label style={styles.label}>Question</label>
                                        <textarea style={styles.textarea} name="question" value={formData.question} onChange={handleFormChange} rows={3} required />
                                    </div>
                                    <div style={styles.formField}>
                                        <label style={styles.label}>Correct Answer</label>
                                        <input style={styles.input} name="answer" value={formData.answer} onChange={handleFormChange} required />
                                    </div>
                                    {formData.exercise_type === 'mcq' && (
                                        <div style={styles.formField}>
                                            <label style={styles.label}>Options (comma separated)</label>
                                            <input style={styles.input} name="options" value={formData.options} onChange={handleFormChange} placeholder="option1, option2, option3, option4" />
                                        </div>
                                    )}
                                    <div style={styles.formField}>
                                        <label style={styles.label}>Explanation</label>
                                        <textarea style={styles.textarea} name="explanation" value={formData.explanation} onChange={handleFormChange} rows={2} />
                                    </div>
                                    <div style={styles.formActions}>
                                        <button type="submit" style={styles.saveBtn}>
                                            {editingExercise ? 'Update Exercise' : 'Create Exercise'}
                                        </button>
                                        <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Exercise List */}
                        <div style={styles.card}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        {['Question', 'Topic', 'Type', 'Difficulty', 'XP', 'Active', 'Actions'].map((h) => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {exercises.map((ex) => (
                                        <tr key={ex.id} style={styles.tableRow}>
                                            <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.question}</td>
                                            <td style={styles.td}>{ex.topic_name}</td>
                                            <td style={styles.td}>{ex.exercise_type_label}</td>
                                            <td style={styles.td}>{ex.difficulty}</td>
                                            <td style={styles.td}>⭐ {ex.xp_reward}</td>
                                            <td style={styles.td}>{ex.is_active ? '✅' : '❌'}</td>
                                            <td style={styles.td}>
                                                <button style={styles.editBtn} onClick={() => handleEditExercise(ex)}>Edit</button>
                                                <button style={styles.deleteBtn} onClick={() => handleDeleteExercise(ex.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    navbar: { backgroundColor: '#1e1b4b', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { color: 'white', margin: 0 },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    adminBadge: { color: '#fbbf24', fontWeight: '700', fontSize: '16px' },
    logoutBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer' },
    tabs: { backgroundColor: 'white', padding: '0 32px', display: 'flex', gap: '4px', borderBottom: '2px solid #e5e7eb' },
    tab: { padding: '16px 24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '15px', color: '#6b7280', fontWeight: '600' },
    activeTab: { color: '#4f46e5', borderBottom: '3px solid #4f46e5' },
    content: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '20px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    statIcon: { fontSize: '32px', marginBottom: '8px' },
    statValue: { fontSize: '32px', fontWeight: '700', color: '#4f46e5' },
    statLabel: { color: '#6b7280', marginTop: '4px' },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
    cardTitle: { marginTop: 0, color: '#374151', marginBottom: '16px' },
    empty: { color: '#9ca3af', fontStyle: 'italic' },
    userRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
    rank: { fontWeight: '700', color: '#4f46e5', width: '30px' },
    userName: { flex: 1, fontWeight: '600', color: '#374151' },
    userLevel: { color: '#6b7280', fontSize: '14px', width: '120px' },
    userXp: { color: '#f59e0b', fontWeight: '600' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f9fafb' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' },
    tableRow: { borderBottom: '1px solid #f3f4f6' },
    td: { padding: '12px 16px', color: '#374151', fontSize: '14px' },
    deleteBtn: { padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginLeft: '6px' },
    editBtn: { padding: '6px 12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    exerciseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    addBtn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    formCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formField: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '600', fontSize: '14px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' },
    formActions: { display: 'flex', gap: '12px', marginTop: '8px' },
    saveBtn: { padding: '10px 24px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    cancelBtn: { padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    formError: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '12px' },
    formSuccess: { backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '12px' },
};

export default AdminDashboard;