/**
 * Login Page
 * User authentication form with modern UI
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                        background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(8, 145, 178, 0.3)'
                    }}>
                        🥗
                    </div>
                    <h2 style={{ marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                        Sign in to continue tracking your diet
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
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
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
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ fontWeight: '600' }}>Create one</Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius)',
                    border: '1px dashed var(--gray-300)'
                }}>
                    <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px', textAlign: 'center' }}>
                        Demo Credentials
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', textAlign: 'center' }}>
                        <strong>Admin:</strong> admin@diet.com / admin123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
