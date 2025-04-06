import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import './review-form.css';

const ReviewForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        name: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});
    const [captchaValue, setCaptchaValue] = useState(null);
    const recaptchaRef = useRef(null);

    useEffect(() => {
        // console.log('WordPress data available:', {
        //     ajax_url: window.crf_form_data?.ajax_url || 'undefined',
        //     nonce: window.crf_form_data?.nonce || 'undefined'
        // });
        
        // Check if the AJAX URL is responding
        if (window.crf_form_data?.ajax_url) {
            fetch(window.crf_form_data.ajax_url)
                .then(response => console.log('AJAX endpoint test:', response.status))
                .catch(error => console.error('AJAX endpoint test failed:', error));
        }
    }, []);

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
        if (!captchaValue) newErrors.captcha = 'Please complete the reCAPTCHA';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({ 
            title: '', 
            description: '', 
            name: '', 
            date: new Date().toISOString().split('T')[0] 
        });
        setCaptchaValue(null);
        
        // Make sure to reset reCAPTCHA
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
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
            formDataToSend.append('captcha', captchaValue);

            console.log('Attempting to submit to:', window.crf_form_data.ajax_url);
            console.log('Sending form data:', Object.fromEntries(formDataToSend));
            
            // Set a longer timeout and add headers
            const response = await axios.post(
                window.crf_form_data.ajax_url, 
                formDataToSend,
                {
                    timeout: 10000, // 10 seconds timeout
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            
            console.log('Response received:', response);
            
            if (response.data && response.data.success) {
                setSubmitStatus({ type: 'success', message: 'Review submitted successfully!' });
                resetForm(); 
            } else {
                const errorMessage = response.data && response.data.data 
                    ? response.data.data 
                    : 'Submission failed: Server did not return success status';
                console.error('Error details:', response.data);
                setSubmitStatus({ type: 'error', message: errorMessage });
                
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                    setCaptchaValue(null);
                }
            }
        } catch (error) {
            console.error('Request failed:', error);
            
            let errorMessage = 'Network error occurred';
            
            if (error.response) {
                
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                errorMessage = 'No response received from server';
                console.error('Request details:', error.request);
            } else {
                errorMessage = `Error: ${error.message}`;
            }
            
            setSubmitStatus({ type: 'error', message: errorMessage });
            
            // Reset the reCAPTCHA even on error
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setCaptchaValue(null);
            }
        }
    };

    // Check if reCAPTCHA site key is available
    const recaptchaSiteKey = window.crf_form_data?.recaptcha_site_key || '';
    const showRecaptcha = recaptchaSiteKey !== '';

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

                {/* Google reCAPTCHA */}
                {showRecaptcha ? (
                    <div className="Recaptcha">
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={recaptchaSiteKey}
                            onChange={(value) => setCaptchaValue(value)}
                        />
                        {errors.captcha && <span className="text-red-500 text-sm">{errors.captcha}</span>}
                    </div>
                ) : (
                    <div className="text-red-500 text-sm">
                        reCAPTCHA site key is not configured. Please configure it in the plugin settings.
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                    disabled={!showRecaptcha}
                >
                    Submit Review
                </button>
            </form>
        </div>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('crf-review-form-container');
    if (container) {
        createRoot(container).render(<ReviewForm />);
    }
});