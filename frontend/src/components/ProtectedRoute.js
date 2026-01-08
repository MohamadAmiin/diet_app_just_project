/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading, isAdmin } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="container text-center mt-20">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Redirect to dashboard if not admin but admin route
    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default ProtectedRoute;
