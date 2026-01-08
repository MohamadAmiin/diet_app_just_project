/**
 * Dashboard Page
 * Main dashboard showing today's summary
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logsAPI, progressAPI, authAPI } from '../services/api';

const Dashboard = () => {
    const [todayTotals, setTodayTotals] = useState(null);
    const [profile, setProfile] = useState(null);
    const [goalProgress, setGoalProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [totalsRes, profileRes, goalRes] = await Promise.all([
                logsAPI.getTodayTotals(),
                authAPI.getProfile(),
                progressAPI.getGoal()
            ]);

            setTodayTotals(totalsRes.data.data);
            setProfile(profileRes.data.data);
            setGoalProgress(goalRes.data.data);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container text-center mt-20">
                <div className="spinner"></div>
            </div>
        );
    }

    const calorieTarget = profile?.dailyCalorieTarget || 2000;
    const caloriesConsumed = todayTotals?.totalCalories || 0;
    const caloriePercentage = Math.min((caloriesConsumed / calorieTarget) * 100, 100);

    return (
        <div className="container">
            <h1 className="mb-20">Dashboard</h1>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Today's Summary */}
            <div className="card">
                <h2>Today's Summary</h2>
                <div className="mt-20">
                    <div className="flex-between mb-20">
                        <span>Calories: {caloriesConsumed} / {calorieTarget}</span>
                        <span>{Math.round(caloriePercentage)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${caloriePercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
                    <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                        <h4>Protein</h4>
                        <p>{todayTotals?.totalProtein || 0}g</p>
                    </div>
                    <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                        <h4>Carbs</h4>
                        <p>{todayTotals?.totalCarbs || 0}g</p>
                    </div>
                    <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                        <h4>Fats</h4>
                        <p>{todayTotals?.totalFats || 0}g</p>
                    </div>
                    <div className="card" style={{ flex: 1, minWidth: '120px' }}>
                        <h4>Meals</h4>
                        <p>{todayTotals?.mealsCount || 0}</p>
                    </div>
                </div>
            </div>

            {/* Goal Progress */}
            {goalProgress && (
                <div className="card">
                    <h2>Goal Progress</h2>
                    <div className="mt-20">
                        <p><strong>Goal:</strong> {goalProgress.goal?.replace('_', ' ') || 'Not set'}</p>
                        <p><strong>Status:</strong> {goalProgress.status}</p>
                        <p>{goalProgress.message}</p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <h2>Quick Actions</h2>
                <div className="flex gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
                    <Link to="/logs" className="btn btn-primary">Log a Meal</Link>
                    <Link to="/plans" className="btn btn-secondary">View Plans</Link>
                    <Link to="/progress" className="btn btn-secondary">View Progress</Link>
                    <Link to="/profile" className="btn btn-secondary">Update Profile</Link>
                </div>
            </div>

            {/* Profile Reminder */}
            {(!profile?.age || !profile?.height || !profile?.weight) && (
                <div className="alert alert-info">
                    Complete your <Link to="/profile">profile</Link> to get personalized calorie recommendations!
                </div>
            )}
        </div>
    );
};

export default Dashboard;
