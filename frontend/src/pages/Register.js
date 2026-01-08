/**
 * Register Page
 * User registration form with modern UI
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo/Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)'
                    }}>
                        🍎
                    </div>
                    <h2 style={{ marginBottom: '8px' }}>Create Account</h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                        Start your journey to better health
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px', padding: '14px' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                                Creating account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ fontWeight: '600' }}>Sign in</Link>
                    </p>
                </div>

                {/* Benefits */}
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius)'
                }}>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '12px', fontWeight: '600' }}>
                        What you'll get:
                    </p>
                    <ul style={{ fontSize: '13px', color: 'var(--gray-500)', paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '6px' }}>Personalized diet plans</li>
                        <li style={{ marginBottom: '6px' }}>Track your daily meals</li>
                        <li>Monitor your progress</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Register;
