/**
 * Logs Page
 * Meal logging and viewing
 */

import React, { useState, useEffect } from 'react';
import { logsAPI, foodsAPI } from '../services/api';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [foods, setFoods] = useState([]);
    const [todayTotals, setTodayTotals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // New log form
    const [showNewLog, setShowNewLog] = useState(false);
    const [newLog, setNewLog] = useState({
        foodId: '',
        quantity: 1,
        mealType: 'breakfast'
    });

    // Date filter
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, foodsRes, totalsRes] = await Promise.all([
                logsAPI.getByDate(selectedDate),
                foodsAPI.getAll(),
                logsAPI.getTotalsByDate(selectedDate)
            ]);
            setLogs(logsRes.data.data);
            setFoods(foodsRes.data.data);
            setTodayTotals(totalsRes.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const createLog = async (e) => {
        e.preventDefault();
        if (!newLog.foodId) {
            setMessage({ type: 'error', text: 'Please select a food' });
            return;
        }

        try {
            const response = await logsAPI.create({
                ...newLog,
                date: new Date(selectedDate)
            });
            setLogs([response.data.data, ...logs]);
            setNewLog({ foodId: '', quantity: 1, mealType: 'breakfast' });
            setShowNewLog(false);
            fetchData(); // Refresh totals
            setMessage({ type: 'success', text: 'Meal logged!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to log meal' });
        }
    };

    const deleteLog = async (logId) => {
        if (!window.confirm('Delete this log?')) return;

        try {
            await logsAPI.delete(logId);
            setLogs(logs.filter(l => l._id !== logId));
            fetchData(); // Refresh totals
            setMessage({ type: 'success', text: 'Log deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete log' });
        }
    };

    const groupLogsByMeal = () => {
        const grouped = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: []
        };
        logs.forEach(log => {
            if (grouped[log.mealType]) {
                grouped[log.mealType].push(log);
            }
        });
        return grouped;
    };

    if (loading) {
        return (
            <div className="container text-center mt-20">
                <div className="spinner"></div>
            </div>
        );
    }

    const groupedLogs = groupLogsByMeal();

    return (
        <div className="container">
            <div className="flex-between mb-20">
                <h1>Meal Logs</h1>
                <button className="btn btn-primary" onClick={() => setShowNewLog(true)}>
                    + Log Meal
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Date Selector */}
            <div className="card">
                <div className="form-group">
                    <label>Select Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Daily Totals */}
            {todayTotals && (
                <div className="card">
                    <h3>Daily Totals - {selectedDate}</h3>
                    <div className="flex gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
                        <div className="card" style={{ flex: 1, minWidth: '100px' }}>
                            <strong>Calories</strong>
                            <p>{todayTotals.totalCalories || 0}</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '100px' }}>
                            <strong>Protein</strong>
                            <p>{todayTotals.totalProtein || 0}g</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '100px' }}>
                            <strong>Carbs</strong>
                            <p>{todayTotals.totalCarbs || 0}g</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '100px' }}>
                            <strong>Fats</strong>
                            <p>{todayTotals.totalFats || 0}g</p>
                        </div>
                        <div className="card" style={{ flex: 1, minWidth: '100px' }}>
                            <strong>Meals</strong>
                            <p>{todayTotals.mealsCount || 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* New Log Form */}
            {showNewLog && (
                <div className="card">
                    <h3>Log a Meal</h3>
                    <form onSubmit={createLog}>
                        <div className="form-group">
                            <label>Food</label>
                            <select
                                value={newLog.foodId}
                                onChange={(e) => setNewLog({ ...newLog, foodId: e.target.value })}
                                required
                            >
                                <option value="">Select food...</option>
                                {foods.map(food => (
                                    <option key={food._id} value={food._id}>
                                        {food.name} ({food.calories} kcal)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                value={newLog.quantity}
                                onChange={(e) => setNewLog({ ...newLog, quantity: parseFloat(e.target.value) })}
                                min="0.1"
                                step="0.1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Meal Type</label>
                            <select
                                value={newLog.mealType}
                                onChange={(e) => setNewLog({ ...newLog, mealType: e.target.value })}
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                        <div className="flex gap-10">
                            <button type="submit" className="btn btn-primary">Log Meal</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowNewLog(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Logs by Meal Type */}
            {logs.length === 0 ? (
                <div className="card text-center">
                    <p>No meals logged for this date. Start logging!</p>
                </div>
            ) : (
                <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                        <div key={mealType} className="card" style={{ flex: 1, minWidth: '250px' }}>
                            <h3 style={{ textTransform: 'capitalize' }}>{mealType}</h3>
                            {groupedLogs[mealType].length === 0 ? (
                                <p className="mt-20">No {mealType} logged</p>
                            ) : (
                                <div className="mt-20">
                                    {groupedLogs[mealType].map(log => (
                                        <div key={log._id} className="card">
                                            <div className="flex-between">
                                                <div>
                                                    <strong>{log.foodId?.name || 'Unknown'}</strong>
                                                    <p>Qty: {log.quantity}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p>{log.calories} kcal</p>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                                        onClick={() => deleteLog(log._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Logs;
