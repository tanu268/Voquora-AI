import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProgressSummary, getWeaknesses, getRecommendations } from '../services/api';
import ProgressChart from '../components/ProgressChart';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [weaknesses, setWeaknesses] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, weaknessRes, recRes] = await Promise.all([
                    getProgressSummary(),
                    getWeaknesses(),
                    getRecommendations(),
                ]);
                setSummary(summaryRes.data);
                setWeaknesses(weaknessRes.data.results || weaknessRes.data);
                setRecommendations(recRes.data.recommendations || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <h1 style={styles.logo}>🎓 Voquora AI</h1>
                <div style={styles.navRight}>
                    <span style={styles.username}>👋 {user?.username}</span>
                    <button style={styles.practiceBtn} onClick={() => navigate('/practice')}>Practice</button>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.content}>
                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📝</div>
                        <div style={styles.statValue}>{summary?.total_attempts || 0}</div>
                        <div style={styles.statLabel}>Total Attempts</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>✅</div>
                        <div style={styles.statValue}>{summary?.correct_answers || 0}</div>
                        <div style={styles.statLabel}>Correct Answers</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🎯</div>
                        <div style={styles.statValue}>{summary?.accuracy_percent || 0}%</div>
                        <div style={styles.statLabel}>Accuracy</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⭐</div>
                        <div style={styles.statValue}>{user?.total_xp || 0}</div>
                        <div style={styles.statLabel}>Total XP</div>
                    </div>
                </div>

                <div style={styles.twoCol}>
                    {/* Weaknesses */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>⚠️ Your Weaknesses</h2>
                        {weaknesses.length === 0 ? (
                            <p style={styles.empty}>No weaknesses detected yet. Keep practicing!</p>
                        ) : (
                            weaknesses.map((w) => (
                                <div key={w.id} style={styles.weaknessItem}>
                                    <span style={styles.weaknessLabel}>{w.error_type_label}</span>
                                    <div style={styles.progressBar}>
                                        <div style={{ ...styles.progressFill, width: `${Math.min(w.frequency * 10, 100)}%` }} />
                                    </div>
                                    <span style={styles.weaknessCount}>{w.frequency}x</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Recommendations */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>💡 Recommended Exercises</h2>
                        {recommendations.length === 0 ? (
                            <p style={styles.empty}>No recommendations yet.</p>
                        ) : (
                            recommendations.slice(0, 3).map((rec, i) => (
                                <div key={i} style={styles.recItem}>
                                    <div style={styles.recTopic}>{rec.weakness}</div>
                                    <div style={styles.recCount}>{rec.exercises?.length || 0} exercises</div>
                                    <button style={styles.recBtn} onClick={() => navigate('/practice')}>
                                        Start →
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Level Info */}
                <div style={styles.levelCard}>
                    <h2 style={styles.cardTitle}>🏆 Your Profile</h2>
                    <p><strong>Level:</strong> {user?.level?.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Topics Practiced:</strong> {summary?.topics_practiced?.join(', ') || 'None yet'}</p>
                    <p><strong>Streak:</strong> {user?.streak_days || 0} days 🔥</p>
                </div>
               <ProgressChart /> 
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    navbar: { backgroundColor: '#4f46e5', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { color: 'white', margin: 0 },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    username: { color: 'white', fontWeight: '600' },
    practiceBtn: { padding: '8px 16px', backgroundColor: 'white', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    logoutBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer' },
    content: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '20px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    statIcon: { fontSize: '32px', marginBottom: '8px' },
    statValue: { fontSize: '32px', fontWeight: '700', color: '#4f46e5' },
    statLabel: { color: '#6b7280', marginTop: '4px' },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    cardTitle: { marginTop: 0, color: '#374151', marginBottom: '16px' },
    empty: { color: '#9ca3af', fontStyle: 'italic' },
    weaknessItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    weaknessLabel: { width: '150px', fontSize: '14px', color: '#374151' },
    progressBar: { flex: 1, backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' },
    progressFill: { backgroundColor: '#ef4444', height: '8px', borderRadius: '4px' },
    weaknessCount: { fontSize: '14px', color: '#6b7280', width: '30px' },
    recItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '8px' },
    recTopic: { fontWeight: '600', color: '#374151' },
    recCount: { color: '#6b7280', fontSize: '14px' },
    recBtn: { padding: '6px 12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    levelCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
};

export default Dashboard;