/**
 * Plans Page
 * Diet plan management
 */

import React, { useState, useEffect } from 'react';
import { plansAPI, foodsAPI } from '../services/api';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [foods, setFoods] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // New plan form
    const [showNewPlan, setShowNewPlan] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');

    // Add item form
    const [showAddItem, setShowAddItem] = useState(false);
    const [newItem, setNewItem] = useState({
        foodId: '',
        quantity: 1,
        mealType: 'breakfast'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [plansRes, foodsRes] = await Promise.all([
                plansAPI.getAll(),
                foodsAPI.getAll()
            ]);
            setPlans(plansRes.data.data);
            setFoods(foodsRes.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const createPlan = async (e) => {
        e.preventDefault();
        try {
            const response = await plansAPI.create({ name: newPlanName || 'My Diet Plan' });
            setPlans([response.data.data, ...plans]);
            setNewPlanName('');
            setShowNewPlan(false);
            setMessage({ type: 'success', text: 'Plan created!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create plan' });
        }
    };

    const deletePlan = async (planId) => {
        if (!window.confirm('Delete this plan?')) return;

        try {
            await plansAPI.delete(planId);
            setPlans(plans.filter(p => p._id !== planId));
            if (selectedPlan?._id === planId) setSelectedPlan(null);
            setMessage({ type: 'success', text: 'Plan deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete plan' });
        }
    };

    const activatePlan = async (planId) => {
        try {
            await plansAPI.activate(planId);
            setPlans(plans.map(p => ({
                ...p,
                isActive: p._id === planId
            })));
            setMessage({ type: 'success', text: 'Plan activated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to activate plan' });
        }
    };

    const addItemToPlan = async (e) => {
        e.preventDefault();
        if (!selectedPlan || !newItem.foodId) return;

        try {
            const response = await plansAPI.addItem(selectedPlan._id, newItem);
            setSelectedPlan(response.data.data);
            setPlans(plans.map(p => p._id === selectedPlan._id ? response.data.data : p));
            setNewItem({ foodId: '', quantity: 1, mealType: 'breakfast' });
            setShowAddItem(false);
            setMessage({ type: 'success', text: 'Item added!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add item' });
        }
    };

    const removeItem = async (itemId) => {
        if (!selectedPlan) return;

        try {
            const response = await plansAPI.removeItem(selectedPlan._id, itemId);
            setSelectedPlan(response.data.data);
            setPlans(plans.map(p => p._id === selectedPlan._id ? response.data.data : p));
            setMessage({ type: 'success', text: 'Item removed!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to remove item' });
        }
    };

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
                <h1>My Diet Plans</h1>
                <button className="btn btn-primary" onClick={() => setShowNewPlan(true)}>
                    + New Plan
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* New Plan Form */}
            {showNewPlan && (
                <div className="card">
                    <h3>Create New Plan</h3>
                    <form onSubmit={createPlan}>
                        <div className="form-group">
                            <label>Plan Name</label>
                            <input
                                type="text"
                                value={newPlanName}
                                onChange={(e) => setNewPlanName(e.target.value)}
                                placeholder="My Diet Plan"
                            />
                        </div>
                        <div className="flex gap-10">
                            <button type="submit" className="btn btn-primary">Create</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowNewPlan(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                {/* Plans List */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div className="card">
                        <h3>Plans ({plans.length})</h3>
                        {plans.length === 0 ? (
                            <p className="mt-20">No plans yet. Create one!</p>
                        ) : (
                            <div className="mt-20">
                                {plans.map(plan => (
                                    <div
                                        key={plan._id}
                                        className="card"
                                        style={{
                                            cursor: 'pointer',
                                            border: selectedPlan?._id === plan._id ? '2px solid var(--primary-500)' : 'none'
                                        }}
                                        onClick={() => setSelectedPlan(plan)}
                                    >
                                        <div className="flex-between">
                                            <div>
                                                <strong>{plan.name}</strong>
                                                {plan.isActive && <span style={{ color: 'var(--success-500)' }}> (Active)</span>}
                                            </div>
                                            <span>{plan.totalCalories} kcal</span>
                                        </div>
                                        <div className="flex gap-10 mt-20">
                                            {!plan.isActive && (
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={(e) => { e.stopPropagation(); activatePlan(plan._id); }}
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => { e.stopPropagation(); deletePlan(plan._id); }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Plan Details */}
                <div style={{ flex: 2, minWidth: '400px' }}>
                    {selectedPlan ? (
                        <div className="card">
                            <div className="flex-between">
                                <h2>{selectedPlan.name}</h2>
                                <button className="btn btn-primary" onClick={() => setShowAddItem(true)}>
                                    + Add Food
                                </button>
                            </div>

                            <div className="flex gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
                                <div className="card" style={{ flex: 1 }}>
                                    <strong>Calories</strong>
                                    <p>{selectedPlan.totalCalories}</p>
                                </div>
                                <div className="card" style={{ flex: 1 }}>
                                    <strong>Protein</strong>
                                    <p>{selectedPlan.totalProtein}g</p>
                                </div>
                                <div className="card" style={{ flex: 1 }}>
                                    <strong>Carbs</strong>
                                    <p>{selectedPlan.totalCarbs}g</p>
                                </div>
                                <div className="card" style={{ flex: 1 }}>
                                    <strong>Fats</strong>
                                    <p>{selectedPlan.totalFats}g</p>
                                </div>
                            </div>

                            {/* Add Item Form */}
                            {showAddItem && (
                                <div className="card mt-20">
                                    <h4>Add Food to Plan</h4>
                                    <form onSubmit={addItemToPlan}>
                                        <div className="form-group">
                                            <label>Food</label>
                                            <select
                                                value={newItem.foodId}
                                                onChange={(e) => setNewItem({ ...newItem, foodId: e.target.value })}
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
                                                value={newItem.quantity}
                                                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                                                min="0.1"
                                                step="0.1"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Meal Type</label>
                                            <select
                                                value={newItem.mealType}
                                                onChange={(e) => setNewItem({ ...newItem, mealType: e.target.value })}
                                            >
                                                <option value="breakfast">Breakfast</option>
                                                <option value="lunch">Lunch</option>
                                                <option value="dinner">Dinner</option>
                                                <option value="snack">Snack</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-10">
                                            <button type="submit" className="btn btn-primary">Add</button>
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddItem(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Plan Items */}
                            <h4 className="mt-20">Plan Items</h4>
                            {selectedPlan.items?.length > 0 ? (
                                <table className="mt-20">
                                    <thead>
                                        <tr>
                                            <th>Food</th>
                                            <th>Meal</th>
                                            <th>Qty</th>
                                            <th>Calories</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPlan.items.map(item => (
                                            <tr key={item._id}>
                                                <td>{item.foodId?.name || 'Unknown'}</td>
                                                <td>{item.mealType}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.calories}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => removeItem(item._id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="mt-20">No items in this plan. Add some foods!</p>
                            )}
                        </div>
                    ) : (
                        <div className="card text-center">
                            <p>Select a plan to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Plans;
