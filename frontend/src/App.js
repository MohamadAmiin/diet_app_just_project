/**
 * Main App Component
 * Sets up routing and authentication context
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import Logs from './pages/Logs';
import Progress from './pages/Progress';
import Foods from './pages/Foods';

// Home component - redirects based on auth status
const Home = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="container text-center mt-20">
                <div className="spinner"></div>
            </div>
        );
    }

    return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <main>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/plans"
                                element={
                                    <ProtectedRoute>
                                        <Plans />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/logs"
                                element={
                                    <ProtectedRoute>
                                        <Logs />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/progress"
                                element={
                                    <ProtectedRoute>
                                        <Progress />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin Routes */}
                            <Route
                                path="/foods"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <Foods />
                                    </ProtectedRoute>
                                }
                            />

                            {/* 404 Route */}
                            <Route
                                path="*"
                                element={
                                    <div className="container text-center mt-20">
                                        <h1>404 - Page Not Found</h1>
                                        <p>The page you're looking for doesn't exist.</p>
                                    </div>
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
