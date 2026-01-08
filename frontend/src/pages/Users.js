/**
 * Users Page (Admin Only)
 * User management for administrators
 */

import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filter
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Edit user form
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        role: 'user',
        age: '',
        height: '',
        weight: '',
        goal: 'maintain_weight',
        dailyCalorieTarget: 2000
    });

    const roles = ['user', 'admin'];
    const goals = ['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await authAPI.getAllUsers();
            setUsers(response.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            role: 'user',
            age: '',
            height: '',
            weight: '',
            goal: 'maintain_weight',
            dailyCalorieTarget: 2000
        });
        setEditingUser(null);
        setShowForm(false);
    };

    const openEditForm = async (user) => {
        try {
            const response = await authAPI.getUserById(user._id);
            const userData = response.data.data;

            setFormData({
                email: userData.email || '',
                role: userData.role || 'user',
                age: userData.profile?.age || '',
                height: userData.profile?.height || '',
                weight: userData.profile?.weight || '',
                goal: userData.profile?.goal || 'maintain_weight',
                dailyCalorieTarget: userData.profile?.dailyCalorieTarget || 2000
            });
            setEditingUser(user);
            setShowForm(true);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load user details' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            email: formData.email,
            role: formData.role,
            age: formData.age ? parseInt(formData.age) : undefined,
            height: formData.height ? parseFloat(formData.height) : undefined,
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            goal: formData.goal,
            dailyCalorieTarget: parseInt(formData.dailyCalorieTarget)
        };

        try {
            const response = await authAPI.updateUser(editingUser._id, data);
            setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...response.data.data } : u));
            setMessage({ type: 'success', text: 'User updated successfully!' });
            resetForm();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update user' });
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This will also delete all their data (plans, logs, weight entries).')) return;

        try {
            await authAPI.deleteUser(userId);
            setUsers(users.filter(u => u._id !== userId));
            setMessage({ type: 'success', text: 'User deleted successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete user' });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

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
                <h1>User Management (Admin)</h1>
                <span className="badge" style={{
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: '600'
                }}>
                    {users.length} Users
                </span>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Filters */}
            <div className="card">
                <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                        <label>Search by Email</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                        <label>Role</label>
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            {showForm && editingUser && (
                <div className="card">
                    <h3>Edit User: {editingUser.email}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                                <label>Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <h4 className="mt-20">Profile Information</h4>
                        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    min="1"
                                    max="150"
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Height (cm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    min="50"
                                    max="300"
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    min="20"
                                    max="500"
                                    step="0.1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                                <label>Goal</label>
                                <select
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                >
                                    {goals.map(goal => (
                                        <option key={goal} value={goal}>
                                            {goal.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                                <label>Daily Calorie Target</label>
                                <input
                                    type="number"
                                    value={formData.dailyCalorieTarget}
                                    onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: e.target.value })}
                                    min="1000"
                                    max="10000"
                                />
                            </div>
                        </div>
                        <div className="flex gap-10 mt-20">
                            <button type="submit" className="btn btn-primary">
                                Update User
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="card">
                <h3>Users ({filteredUsers.length})</h3>
                {filteredUsers.length === 0 ? (
                    <p className="mt-20">No users found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="mt-20">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.email}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: user.role === 'admin'
                                                    ? 'var(--secondary-100)'
                                                    : 'var(--gray-100)',
                                                color: user.role === 'admin'
                                                    ? 'var(--secondary-700)'
                                                    : 'var(--gray-700)'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className="flex gap-10">
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    onClick={() => openEditForm(user)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    onClick={() => deleteUser(user._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
