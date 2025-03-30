import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './review-form.css';

const ReviewForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        name: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.date) newErrors.date = 'Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('action', 'submit_review');
            formDataToSend.append('nonce', window.crf_form_data.nonce);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('date', formData.date);

            const response = await axios.post(window.crf_form_data.ajax_url, formDataToSend);

            if (response.data.success) {
                setSubmitStatus({ type: 'success', message: 'Review submitted successfully!' });
                setFormData({ title: '', description: '', name: '', date: new Date().toISOString().split('T')[0] });
            } else {
                setSubmitStatus({ type: 'error', message: response.data.data || 'Submission failed' });
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', message: 'An error occurred' });
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
            <h2 className="text-2xl font-semibold text-center mb-4">Submit Your Review</h2>
            {submitStatus && (
                <div className={`text-white p-2 rounded-md mb-4 ${submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {submitStatus.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Enter review title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                </div>

                <div>
                    <label className="block text-gray-700 font-medium">Description</label>
                    <textarea
                        name="description"
                        placeholder="Write your review here..."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                </div>

                <div>
                    <label className="block text-gray-700 font-medium">Your Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                </div>

                <div>
                    <label className="block text-gray-700 font-medium">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {errors.date && <span className="text-red-500 text-sm">{errors.date}</span>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Submit Review
                </button>
            </form>
        </div>
    );
};

// Render into a WordPress shortcode container
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('crf-review-form-container');
    if (container) {
        createRoot(container).render(<ReviewForm />);
    }
});
