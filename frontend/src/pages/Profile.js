/**
 * Profile Page
 * User profile management
 */

import React, { useState, useEffect } from 'react';
import { authAPI, plansAPI } from '../services/api';

const Profile = () => {
    const [profile, setProfile] = useState({
        age: '',
        height: '',
        weight: '',
        goal: 'maintain_weight',
        dailyCalorieTarget: 2000
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            const data = response.data.data;
            setProfile({
                age: data.age || '',
                height: data.height || '',
                weight: data.weight || '',
                goal: data.goal || 'maintain_weight',
                dailyCalorieTarget: data.dailyCalorieTarget || 2000
            });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await authAPI.updateProfile({
                age: parseInt(profile.age) || undefined,
                height: parseFloat(profile.height) || undefined,
                weight: parseFloat(profile.weight) || undefined,
                goal: profile.goal,
                dailyCalorieTarget: parseInt(profile.dailyCalorieTarget)
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const calculateRecommendation = async () => {
        if (!profile.age || !profile.height || !profile.weight) {
            setMessage({ type: 'error', text: 'Please fill in age, height, and weight first' });
            return;
        }

        try {
            const response = await plansAPI.calculateCalories('male');
            setRecommendation(response.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to calculate recommendations' });
        }
    };

    const applyRecommendation = () => {
        if (recommendation) {
            setProfile(prev => ({
                ...prev,
                dailyCalorieTarget: recommendation.dailyCalories
            }));
            setRecommendation(null);
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
            <h1 className="mb-20">My Profile</h1>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Age (years)</label>
                        <input
                            type="number"
                            name="age"
                            value={profile.age}
                            onChange={handleChange}
                            placeholder="Enter your age"
                            min="1"
                            max="150"
                        />
                    </div>

                    <div className="form-group">
                        <label>Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={profile.height}
                            onChange={handleChange}
                            placeholder="Enter your height in cm"
                            min="50"
                            max="300"
                        />
                    </div>

                    <div className="form-group">
                        <label>Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={profile.weight}
                            onChange={handleChange}
                            placeholder="Enter your weight in kg"
                            min="20"
                            max="500"
                            step="0.1"
                        />
                    </div>

                    <div className="form-group">
                        <label>Goal</label>
                        <select name="goal" value={profile.goal} onChange={handleChange}>
                            <option value="lose_weight">Lose Weight</option>
                            <option value="maintain_weight">Maintain Weight</option>
                            <option value="gain_weight">Gain Weight</option>
                            <option value="build_muscle">Build Muscle</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Daily Calorie Target</label>
                        <div className="flex gap-10">
                            <input
                                type="number"
                                name="dailyCalorieTarget"
                                value={profile.dailyCalorieTarget}
                                onChange={handleChange}
                                min="1000"
                                max="10000"
                            />
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={calculateRecommendation}
                            >
                                Get Recommendation
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Recommendation Modal */}
            {recommendation && (
                <div className="card">
                    <h3>Recommended Daily Intake</h3>
                    <div className="mt-20">
                        <p><strong>Calories:</strong> {recommendation.dailyCalories} kcal</p>
                        <p><strong>Protein:</strong> {recommendation.macros.protein}g</p>
                        <p><strong>Carbs:</strong> {recommendation.macros.carbs}g</p>
                        <p><strong>Fats:</strong> {recommendation.macros.fats}g</p>
                    </div>
                    <div className="flex gap-10 mt-20">
                        <button className="btn btn-primary" onClick={applyRecommendation}>
                            Apply Recommendation
                        </button>
                        <button className="btn btn-secondary" onClick={() => setRecommendation(null)}>
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
