/**
 * Navbar Component
 * Navigation bar with links and logout button
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="flex gap-10">
                <Link to="/" className="navbar-brand">Diet Manager</Link>
                {user && (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/plans">Plans</Link>
                        <Link to="/logs">Meal Logs</Link>
                        <Link to="/progress">Progress</Link>
                        <Link to="/profile">Profile</Link>
                        {isAdmin && <Link to="/foods">Foods (Admin)</Link>}
                    </>
                )}
            </div>
            <div>
                {user ? (
                    <div className="flex gap-10">
                        <span>Welcome, {user.email}</span>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-10">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
