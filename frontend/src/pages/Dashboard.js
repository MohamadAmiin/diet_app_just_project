/**
 * Dashboard Page
 * Main dashboard showing today's summary with modern UI
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logsAPI, progressAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
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
            // Fetch data individually to handle partial failures gracefully
            let totalsData = null;
            let profileData = null;
            let goalData = null;

            try {
                const totalsRes = await logsAPI.getTodayTotals();
                totalsData = totalsRes.data.data;
            } catch (e) {
                console.log('Could not fetch totals');
            }

            try {
                const profileRes = await authAPI.getProfile();
                profileData = profileRes.data.data;
            } catch (e) {
                console.log('Could not fetch profile');
            }

            try {
                const goalRes = await progressAPI.getGoal();
                goalData = goalRes.data.data;
            } catch (e) {
                console.log('Could not fetch goal');
            }

            setTodayTotals(totalsData);
            setProfile(profileData);
            setGoalProgress(goalData);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getGoalCardClass = () => {
        if (!goalProgress) return '';
        if (goalProgress.status === 'off_track') return 'off-track';
        if (goalProgress.status === 'attention') return 'attention';
        return '';
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
    const caloriesRemaining = Math.max(calorieTarget - caloriesConsumed, 0);

    // Calculate circular progress
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

    return (
        <div className="container">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Hero Section */}
            <div className="hero-section">
                <h1>{getGreeting()}, {user?.email?.split('@')[0] || 'User'}!</h1>
                <p>Track your nutrition and reach your health goals</p>
            </div>

            {/* Main Stats Section */}
            <div className="card">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
                    {/* Circular Progress */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="circular-progress">
                            <svg width="160" height="160">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0891b2" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="progress-text">
                                <span className="progress-value">{Math.round(caloriePercentage)}%</span>
                                <span className="progress-label">of daily goal</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                                <strong style={{ color: 'var(--gray-800)', fontSize: '18px' }}>{caloriesRemaining}</strong> kcal remaining
                            </p>
                        </div>
                    </div>

                    {/* Calorie Details */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Today's Calories</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: 'var(--gray-600)' }}>Consumed</span>
                            <span style={{ fontWeight: '700', color: 'var(--primary-600)' }}>{caloriesConsumed} kcal</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: 'var(--gray-600)' }}>Target</span>
                            <span style={{ fontWeight: '700' }}>{calorieTarget} kcal</span>
                        </div>
                        <div className="divider" style={{ margin: '16px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--gray-600)' }}>Remaining</span>
                            <span style={{ fontWeight: '700', color: caloriesRemaining > 0 ? 'var(--success)' : 'var(--error)' }}>
                                {caloriesRemaining} kcal
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Macro Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-box protein">
                    <div className="stat-value">{todayTotals?.totalProtein || 0}g</div>
                    <div className="stat-label">Protein</div>
                </div>
                <div className="stat-box carbs">
                    <div className="stat-value">{todayTotals?.totalCarbs || 0}g</div>
                    <div className="stat-label">Carbs</div>
                </div>
                <div className="stat-box fats">
                    <div className="stat-value">{todayTotals?.totalFats || 0}g</div>
                    <div className="stat-label">Fats</div>
                </div>
                <div className="stat-box calories">
                    <div className="stat-value">{todayTotals?.mealsCount || 0}</div>
                    <div className="stat-label">Meals Logged</div>
                </div>
            </div>

            {/* Goal Progress */}
            {goalProgress && (
                <div className={`goal-card ${getGoalCardClass()}`} style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h3 style={{ marginBottom: '8px', color: 'var(--gray-800)' }}>Goal Progress</h3>
                            <p style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>
                                <strong>Goal:</strong> {goalProgress.goal?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                            </p>
                            <p style={{ color: 'var(--gray-600)' }}>{goalProgress.message}</p>
                        </div>
                        <div className="goal-status">
                            {goalProgress.status === 'on_track' && '✓ '}
                            {goalProgress.status === 'off_track' && '⚠ '}
                            {goalProgress.status === 'attention' && '! '}
                            {goalProgress.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
                <div className="quick-actions">
                    <Link to="/logs" className="action-btn">
                        <div className="action-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                            +
                        </div>
                        <span>Log Meal</span>
                    </Link>
                    <Link to="/plans" className="action-btn">
                        <div className="action-icon" style={{ background: 'var(--secondary-100)', color: 'var(--secondary-600)' }}>
                            📋
                        </div>
                        <span>View Plans</span>
                    </Link>
                    <Link to="/progress" className="action-btn">
                        <div className="action-icon" style={{ background: 'var(--success-light)', color: 'var(--success-dark)' }}>
                            📈
                        </div>
                        <span>Progress</span>
                    </Link>
                    <Link to="/profile" className="action-btn">
                        <div className="action-icon" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                            👤
                        </div>
                        <span>Profile</span>
                    </Link>
                </div>
            </div>

            {/* Profile Reminder */}
            {(!profile?.age || !profile?.height || !profile?.weight) && (
                <div className="alert alert-info" style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '20px' }}>💡</span>
                    Complete your <Link to="/profile" style={{ fontWeight: '600' }}>profile</Link> to get personalized calorie recommendations!
                </div>
            )}
        </div>
    );
};

export default Dashboard;
