/**
 * Foods Page (Admin Only)
 * Food management for administrators
 */

import React, { useState, useEffect } from 'react';
import { foodsAPI } from '../services/api';

const Foods = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filter
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    // New/Edit food form
    const [showForm, setShowForm] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        servingSize: '100g',
        category: 'other'
    });

    const categories = ['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'fats', 'snacks', 'beverages', 'other'];

    useEffect(() => {
        fetchFoods();
    }, [search, category]);

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const response = await foodsAPI.getAll({ search, category: category || undefined });
            setFoods(response.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load foods' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            calories: '',
            protein: '',
            carbs: '',
            fats: '',
            servingSize: '100g',
            category: 'other'
        });
        setEditingFood(null);
        setShowForm(false);
    };

    const openEditForm = (food) => {
        setFormData({
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats,
            servingSize: food.servingSize || '100g',
            category: food.category || 'other'
        });
        setEditingFood(food);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            name: formData.name,
            calories: parseFloat(formData.calories),
            protein: parseFloat(formData.protein),
            carbs: parseFloat(formData.carbs),
            fats: parseFloat(formData.fats),
            servingSize: formData.servingSize,
            category: formData.category
        };

        try {
            if (editingFood) {
                const response = await foodsAPI.update(editingFood._id, data);
                setFoods(foods.map(f => f._id === editingFood._id ? response.data.data : f));
                setMessage({ type: 'success', text: 'Food updated!' });
            } else {
                const response = await foodsAPI.create(data);
                setFoods([response.data.data, ...foods]);
                setMessage({ type: 'success', text: 'Food created!' });
            }
            resetForm();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save food' });
        }
    };

    const deleteFood = async (foodId) => {
        if (!window.confirm('Delete this food?')) return;

        try {
            await foodsAPI.delete(foodId);
            setFoods(foods.filter(f => f._id !== foodId));
            setMessage({ type: 'success', text: 'Food deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete food' });
        }
    };

    if (loading && foods.length === 0) {
        return (
            <div className="container text-center mt-20">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="flex-between mb-20">
                <h1>Food Management (Admin)</h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    + Add Food
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Filters */}
            <div className="card">
                <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                        <label>Search</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search foods..."
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card">
                    <h3>{editingFood ? 'Edit Food' : 'Add New Food'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Calories *</label>
                                <input
                                    type="number"
                                    value={formData.calories}
                                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Protein (g) *</label>
                                <input
                                    type="number"
                                    value={formData.protein}
                                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                                    min="0"
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Carbs (g) *</label>
                                <input
                                    type="number"
                                    value={formData.carbs}
                                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                                    min="0"
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Fats (g) *</label>
                                <input
                                    type="number"
                                    value={formData.fats}
                                    onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                                    min="0"
                                    step="0.1"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                                <label>Serving Size</label>
                                <input
                                    type="text"
                                    value={formData.servingSize}
                                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-10">
                            <button type="submit" className="btn btn-primary">
                                {editingFood ? 'Update' : 'Create'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Foods Table */}
            <div className="card">
                <h3>Foods ({foods.length})</h3>
                {foods.length === 0 ? (
                    <p className="mt-20">No foods found. Add some!</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="mt-20">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Calories</th>
                                    <th>Protein</th>
                                    <th>Carbs</th>
                                    <th>Fats</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foods.map(food => (
                                    <tr key={food._id}>
                                        <td>{food.name}</td>
                                        <td>{food.calories}</td>
                                        <td>{food.protein}g</td>
                                        <td>{food.carbs}g</td>
                                        <td>{food.fats}g</td>
                                        <td>{food.category}</td>
                                        <td>
                                            <div className="flex gap-10">
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    onClick={() => openEditForm(food)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    onClick={() => deleteFood(food._id)}
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

export default Foods;
