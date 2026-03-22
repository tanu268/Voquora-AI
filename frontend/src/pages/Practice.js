import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercises, submitAnswer, getTopics, getProgressHistory } from '../services/api';

const Practice = () => {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [topics, setTopics] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [completedIds, setCompletedIds] = useState(new Set());
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (topicId = '') => {
        setLoading(true);
        try {
            const [exRes, topRes, progRes] = await Promise.all([
                getExercises(topicId ? { topic: topicId } : {}),
                getTopics(),
                getProgressHistory(),
            ]);

            const allExercises = exRes.data.results || exRes.data;
            setTopics(topRes.data.results || topRes.data);

            // Get IDs of correctly answered exercises
            const history = progRes.data.results || progRes.data;
            const correctIds = new Set(
                history.filter((p) => p.is_correct).map((p) => p.exercise)
            );
            setCompletedIds(correctIds);

            // Filter out correctly answered exercises
            const pending = allExercises.filter((ex) => !correctIds.has(ex.id));
            setExercises(pending.length > 0 ? pending : allExercises);
            setCurrentIndex(0);
            setResult(null);
            setUserAnswer('');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterByTopic = (topicId) => {
        setSelectedTopic(topicId);
        fetchData(topicId);
    };

    const handleSubmit = async () => {
        if (!userAnswer.trim()) return;
        setSubmitting(true);
        try {
            const exercise = exercises[currentIndex];
            const res = await submitAnswer({
                exercise_id: exercise.id,
                user_answer: userAnswer,
            });
            setResult(res.data);
            setSessionStats((prev) => ({
                correct: prev.correct + (res.data.is_correct ? 1 : 0),
                total: prev.total + 1,
            }));
            if (res.data.is_correct) {
                setCompletedIds((prev) => new Set([...prev, exercise.id]));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        setResult(null);
        setUserAnswer('');
        // Move to next exercise, skip completed ones
        let nextIndex = currentIndex + 1;
        while (nextIndex < exercises.length && completedIds.has(exercises[nextIndex]?.id)) {
            nextIndex++;
        }
        if (nextIndex >= exercises.length) {
            nextIndex = 0;
        }
        setCurrentIndex(nextIndex);
    };

    const handleSkip = () => {
        setResult(null);
        setUserAnswer('');
        const nextIndex = (currentIndex + 1) % exercises.length;
        setCurrentIndex(nextIndex);
    };

    if (loading) return <div style={styles.loading}>Loading exercises...</div>;

    const exercise = exercises[currentIndex];
    const pendingCount = exercises.filter((ex) => !completedIds.has(ex.id)).length;

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <h1 style={styles.logo}>🎓 Voquora AI</h1>
                <div style={styles.navRight}>
                    <span style={styles.sessionStat}>✅ {sessionStats.correct}/{sessionStats.total} this session</span>
                    <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
                </div>
            </div>

            <div style={styles.content}>
                {/* Topic Filter */}
                <div style={styles.filterBar}>
                    <span style={styles.filterLabel}>Filter by Topic:</span>
                    <select style={styles.select} value={selectedTopic} onChange={(e) => filterByTopic(e.target.value)}>
                        <option value="">All Topics</option>
                        {topics.map((t) => (
                            <option key={t.id} value={t.id}>{t.name} ({t.exercise_count})</option>
                        ))}
                    </select>
                    <span style={styles.counter}>
                        {pendingCount} exercises remaining
                    </span>
                </div>

                {exercises.length === 0 ? (
                    <div style={styles.card}>
                        <p style={styles.empty}>No exercises found. Ask admin to add some!</p>
                    </div>
                ) : pendingCount === 0 ? (
                    <div style={styles.completedCard}>
                        <div style={styles.completedIcon}>🎉</div>
                        <h2>All exercises completed!</h2>
                        <p>You have answered all exercises correctly. Great job!</p>
                        <button style={styles.submitBtn} onClick={() => fetchData(selectedTopic)}>
                            Practice Again
                        </button>
                    </div>
                ) : (
                    <div style={styles.card}>
                        {/* Exercise Info */}
                        <div style={styles.exerciseMeta}>
                            <span style={styles.badge}>{exercise.topic_name}</span>
                            <span style={styles.badge}>{exercise.exercise_type_label}</span>
                            <span style={styles.badge}>⭐ {exercise.xp_reward} XP</span>
                            <span style={styles.badge}>Level {exercise.difficulty}</span>
                            {completedIds.has(exercise.id) && (
                                <span style={{ ...styles.badge, backgroundColor: '#d1fae5', color: '#065f46' }}>✅ Completed</span>
                            )}
                        </div>

                        {/* Question */}
                        <h2 style={styles.question}>{exercise.question}</h2>

                        {/* MCQ Options */}
                        {exercise.exercise_type === 'mcq' && exercise.options && (
                            <div style={styles.optionsGrid}>
                                {exercise.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        style={{
                                            ...styles.optionBtn,
                                            backgroundColor: userAnswer === opt ? '#4f46e5' : 'white',
                                            color: userAnswer === opt ? 'white' : '#374151',
                                        }}
                                        onClick={() => !result && setUserAnswer(opt)}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Text Answer */}
                        {exercise.exercise_type !== 'mcq' && (
                            <textarea
                                style={styles.textarea}
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                disabled={!!result}
                                rows={3}
                            />
                        )}

                        {/* Buttons */}
                        {!result && (
                            <div style={styles.btnRow}>
                                <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting || !userAnswer.trim()}>
                                    {submitting ? 'Checking...' : 'Submit Answer'}
                                </button>
                                <button style={styles.skipBtn} onClick={handleSkip}>
                                    Skip →
                                </button>
                            </div>
                        )}

                        {/* Result */}
                        {result && (
                            <div style={{ ...styles.result, backgroundColor: result.is_correct ? '#d1fae5' : '#fee2e2' }}>
                                <div style={styles.resultTitle}>
                                    {result.is_correct ? '✅ Correct! +' + result.score + ' XP' : '❌ Incorrect'}
                                </div>
                                <p><strong>Correct Answer:</strong> {result.correct_answer}</p>
                                {result.explanation && <p><strong>Explanation:</strong> {result.explanation}</p>}
                                {result.feedback && <p><strong>Feedback:</strong> {result.feedback}</p>}
                                <button style={styles.nextBtn} onClick={handleNext}>
                                    {result.is_correct ? 'Next Exercise →' : 'Try Next →'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    navbar: { backgroundColor: '#4f46e5', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { color: 'white', margin: 0 },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    sessionStat: { color: 'white', fontSize: '14px', fontWeight: '600' },
    navBtn: { padding: '8px 16px', backgroundColor: 'white', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    content: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '20px' },
    filterBar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
    filterLabel: { fontWeight: '600', color: '#374151' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
    counter: { marginLeft: 'auto', color: '#6b7280', fontSize: '14px', fontWeight: '600' },
    card: { backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    completedCard: { backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    completedIcon: { fontSize: '64px', marginBottom: '16px' },
    exerciseMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
    badge: { backgroundColor: '#ede9fe', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    question: { fontSize: '20px', color: '#111827', marginBottom: '24px', lineHeight: '1.6' },
    optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
    optionBtn: { padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
    textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box', marginBottom: '16px', resize: 'vertical' },
    btnRow: { display: 'flex', gap: '12px' },
    submitBtn: { flex: 1, padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
    skipBtn: { padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
    result: { padding: '20px', borderRadius: '8px', marginTop: '16px' },
    resultTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '12px' },
    nextBtn: { marginTop: '12px', padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
    empty: { textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' },
};

export default Practice;