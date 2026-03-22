import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { getWeaknesses, getProgressHistory } from '../services/api';

const COLORS = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const ProgressChart = () => {
    const [weaknesses, setWeaknesses] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [weakRes, progRes] = await Promise.all([
                    getWeaknesses(),
                    getProgressHistory(),
                ]);

                const weakData = (weakRes.data.results || weakRes.data).map((w) => ({
                    name: w.error_type_label,
                    frequency: w.frequency,
                }));
                setWeaknesses(weakData);

                // Process progress by date
                const history = progRes.data.results || progRes.data;
                const dateMap = {};
                history.forEach((p) => {
                    const date = new Date(p.attempted_at).toLocaleDateString();
                    if (!dateMap[date]) {
                        dateMap[date] = { date, attempts: 0, correct: 0 };
                    }
                    dateMap[date].attempts += 1;
                    if (p.is_correct) dateMap[date].correct += 1;
                });
                setProgressData(Object.values(dateMap).slice(-7));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={styles.loading}>Loading charts...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.sectionTitle}>📊 Analytics & Performance</h2>

            <div style={styles.chartsGrid}>
                {/* Weakness Bar Chart */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>⚠️ Weakness Areas</h3>
                    {weaknesses.length === 0 ? (
                        <p style={styles.empty}>No data yet. Start practicing!</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={weaknesses}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="frequency" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Progress Line Chart */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>📈 Daily Progress</h3>
                    {progressData.length === 0 ? (
                        <p style={styles.empty}>No data yet. Start practicing!</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="attempts" stroke="#4f46e5" strokeWidth={2} />
                                <Line type="monotone" dataKey="correct" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>🥧 Weakness Distribution</h3>
                    {weaknesses.length === 0 ? (
                        <p style={styles.empty}>No data yet. Start practicing!</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={weaknesses}
                                    dataKey="frequency"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name }) => name}
                                >
                                    {weaknesses.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Accuracy Chart */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>🎯 Daily Accuracy</h3>
                    {progressData.length === 0 ? (
                        <p style={styles.empty}>No data yet. Start practicing!</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={progressData.map(d => ({
                                date: d.date,
                                accuracy: d.attempts > 0 ? Math.round((d.correct / d.attempts) * 100) : 0
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis unit="%" />
                                <Tooltip formatter={(val) => `${val}%`} />
                                <Bar dataKey="accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { marginTop: '32px' },
    sectionTitle: { color: '#374151', marginBottom: '24px' },
    chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    chartCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    chartTitle: { marginTop: 0, color: '#374151', marginBottom: '16px' },
    empty: { color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' },
    loading: { textAlign: 'center', padding: '40px', color: '#6b7280' },
};

export default ProgressChart;