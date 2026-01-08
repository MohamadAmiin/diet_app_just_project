/**
 * Progress Page
 * Weight tracking and progress visualization
 */

import React, { useState, useEffect } from 'react';
import { progressAPI } from '../services/api';

const Progress = () => {
    const [summary, setSummary] = useState(null);
    const [weightHistory, setWeightHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // New weight form
    const [showNewWeight, setShowNewWeight] = useState(false);
    const [newWeight, setNewWeight] = useState({
        value: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [summaryRes, weightRes] = await Promise.all([
                progressAPI.getSummary(),
                progressAPI.getWeight(30)
            ]);
            setSummary(summaryRes.data.data);
            setWeightHistory(weightRes.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load progress data' });
        } finally {
            setLoading(false);
        }
    };

    const logWeight = async (e) => {
        e.preventDefault();
        if (!newWeight.value) {
            setMessage({ type: 'error', text: 'Please enter a weight value' });
            return;
        }

        try {
            const response = await progressAPI.logWeight({
                value: parseFloat(newWeight.value),
                notes: newWeight.notes
            });
            setWeightHistory([response.data.data, ...weightHistory]);
            setNewWeight({ value: '', notes: '' });
            setShowNewWeight(false);
            fetchData(); // Refresh summary
            setMessage({ type: 'success', text: 'Weight logged!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to log weight' });
        }
    };

    const deleteWeight = async (weightId) => {
        if (!window.confirm('Delete this weight entry?')) return;

        try {
            await progressAPI.deleteWeight(weightId);
            setWeightHistory(weightHistory.filter(w => w._id !== weightId));
            fetchData(); // Refresh summary
            setMessage({ type: 'success', text: 'Weight entry deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete weight' });
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'losing': return '↓';
            case 'gaining': return '↑';
            case 'stable': return '→';
            default: return '?';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="container text-center mt-20">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="flex-between mb-20">
                <h1>My Progress</h1>
                <button className="btn btn-primary" onClick={() => setShowNewWeight(true)}>
                    + Log Weight
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* New Weight Form */}
            {showNewWeight && (
                <div className="card">
                    <h3>Log Weight</h3>
                    <form onSubmit={logWeight}>
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                value={newWeight.value}
                                onChange={(e) => setNewWeight({ ...newWeight, value: e.target.value })}
                                placeholder="Enter your weight"
                                min="20"
                                max="500"
                                step="0.1"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes (optional)</label>
                            <input
                                type="text"
                                value={newWeight.notes}
                                onChange={(e) => setNewWeight({ ...newWeight, notes: e.target.value })}
                                placeholder="Any notes..."
                            />
                        </div>
                        <div className="flex gap-10">
                            <button type="submit" className="btn btn-primary">Log Weight</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowNewWeight(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goal Progress */}
            {summary?.goal && (
                <div className="card">
                    <h2>Goal Progress</h2>
                    <div className="mt-20">
                        <p><strong>Goal:</strong> {summary.goal.goal?.replace('_', ' ') || 'Not set'}</p>
                        <p><strong>Status:</strong> {summary.goal.status}</p>
                        <p>{summary.goal.message}</p>
                        {summary.goal.calorieTarget && (
                            <p><strong>Calorie Target:</strong> {summary.goal.calorieTarget} kcal/day</p>
                        )}
                    </div>
                </div>
            )}

            {/* Weight Progress */}
            {summary?.weight && (
                <div className="card">
                    <h2>Weight Progress</h2>
                    <div className="flex gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
                        <div className="card" style={{ flex: 1, minWidth: '150px' }}>
                            <strong>Current Weight</strong>
                            <p style={{ fontSize: '24px' }}>
                                {summary.weight.currentWeight ? `${summary.weight.currentWeight} kg` : 'No data'}
                            </p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '150px' }}>
                            <strong>Starting Weight</strong>
                            <p style={{ fontSize: '24px' }}>
                                {summary.weight.startWeight ? `${summary.weight.startWeight} kg` : 'No data'}
                            </p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '150px' }}>
                            <strong>Total Change</strong>
                            <p style={{ fontSize: '24px', color: summary.weight.totalChange > 0 ? 'var(--error-500)' : 'var(--success-500)' }}>
                                {summary.weight.totalChange > 0 ? '+' : ''}{summary.weight.totalChange} kg
                            </p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '150px' }}>
                            <strong>Trend</strong>
                            <p style={{ fontSize: '24px' }}>
                                {getTrendIcon(summary.weight.trend)} {summary.weight.trend}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nutrition Progress */}
            {summary?.nutrition && summary.nutrition.daysTracked > 0 && (
                <div className="card">
                    <h2>Nutrition (Last 7 Days)</h2>
                    <div className="flex gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
                        <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                            <strong>Avg Calories</strong>
                            <p>{summary.nutrition.averageCalories}</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                            <strong>Avg Protein</strong>
                            <p>{summary.nutrition.averageProtein}g</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                            <strong>Avg Carbs</strong>
                            <p>{summary.nutrition.averageCarbs}g</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                            <strong>Avg Fats</strong>
                            <p>{summary.nutrition.averageFats}g</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                            <strong>Days Tracked</strong>
                            <p>{summary.nutrition.daysTracked}</p>
                        </div>
                    </div>

                    {/* Simple chart representation */}
                    {summary.nutrition.history.length > 0 && (
                        <div className="mt-20">
                            <h4>Daily Calories</h4>
                            <div className="flex gap-10 mt-20" style={{ alignItems: 'flex-end', height: '150px' }}>
                                {summary.nutrition.history.slice(-7).map((day, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '100%',
                                                backgroundColor: 'var(--primary-500)',
                                                height: `${Math.min((day.calories / 3000) * 100, 100)}%`,
                                                minHeight: '10px',
                                                borderRadius: '4px 4px 0 0'
                                            }}
                                        ></div>
                                        <small>{day.calories}</small>
                                        <small>{formatDate(day.date).split('/').slice(0, 2).join('/')}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Weight History */}
            <div className="card">
                <h2>Weight History</h2>
                {weightHistory.length === 0 ? (
                    <p className="mt-20">No weight entries yet. Start logging!</p>
                ) : (
                    <table className="mt-20">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Weight (kg)</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weightHistory.map(entry => (
                                <tr key={entry._id}>
                                    <td>{formatDate(entry.date)}</td>
                                    <td>{entry.value}</td>
                                    <td>{entry.notes || '-'}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '5px 10px', fontSize: '12px' }}
                                            onClick={() => deleteWeight(entry._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Progress;
