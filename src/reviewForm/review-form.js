import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
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
    const [captchaLoading, setCaptchaLoading] = useState(true);
    const captchaContainer = useRef(null);
    const widgetId = useRef(null);

    // Get the reCAPTCHA site key
    const recaptchaSiteKey = window.crf_form_data?.recaptcha_site_key || '';
    const showRecaptcha = recaptchaSiteKey !== '';

    // Function to render reCAPTCHA
    const renderReCaptcha = () => {
        // Clear any existing content
        if (captchaContainer.current) {
            captchaContainer.current.innerHTML = '';
        }

        // Only proceed if window.grecaptcha is defined and the container exists
        if (window.grecaptcha && captchaContainer.current) {
            try {
                console.log('Rendering reCAPTCHA with site key:', recaptchaSiteKey);
                widgetId.current = window.grecaptcha.render(captchaContainer.current, {
                    'sitekey': recaptchaSiteKey,
                    'callback': (response) => {
                        console.log('reCAPTCHA callback received');
                        setCaptchaValue(response);
                        // Clear captcha error if it exists
                        if (errors.captcha) {
                            setErrors(prev => {
                                const newErrors = {...prev};
                                delete newErrors.captcha;
                                return newErrors;
                            });
                        }
                    },
                    'expired-callback': () => {
                        console.log('reCAPTCHA expired');
                        setCaptchaValue(null);
                    },
                    'error-callback': () => {
                        console.error('reCAPTCHA error occurred');
                        setErrors(prev => ({...prev, captcha: 'reCAPTCHA error occurred. Please try again.'}));
                    }
                });
                console.log('reCAPTCHA widget rendered with ID:', widgetId.current);
                setCaptchaLoading(false);
            } catch (error) {
                console.error('Error rendering reCAPTCHA:', error);
                setErrors(prev => ({...prev, captcha: 'Failed to load reCAPTCHA. Please refresh the page.'}));
                setCaptchaLoading(false);
            }
        }
    };

    // Function to load reCAPTCHA script
    const loadReCaptchaScript = () => {
        // Check if the script already exists
        const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
        
        if (existingScript) {
            // If script exists, wait for it to load
            if (window.grecaptcha && window.grecaptcha.render) {
                console.log('reCAPTCHA already loaded, rendering immediately');
                renderReCaptcha();
            } else {
                console.log('reCAPTCHA script exists but not loaded yet, waiting...');
                const checkRecaptchaLoaded = setInterval(() => {
                    if (window.grecaptcha && window.grecaptcha.render) {
                        clearInterval(checkRecaptchaLoaded);
                        console.log('reCAPTCHA detected as loaded, rendering now');
                        renderReCaptcha();
                    }
                }, 100);
                
                // Set a timeout to avoid infinite waiting
                setTimeout(() => {
                    clearInterval(checkRecaptchaLoaded);
                    if (!window.grecaptcha || !window.grecaptcha.render) {
                        console.error('reCAPTCHA failed to load after timeout');
                        setCaptchaLoading(false);
                        setErrors(prev => ({...prev, captcha: 'reCAPTCHA failed to load. Please refresh the page.'}));
                    }
                }, 10000); // 10 second timeout
            }
        } else {
            // Create and inject the script if it doesn't exist
            console.log('Adding reCAPTCHA script to page');
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit`;
            script.async = true;
            script.defer = true;
            
            // Define the callback globally
            window.onloadCallback = () => {
                console.log('reCAPTCHA script loaded via callback');
                renderReCaptcha();
            };
            
            script.onerror = () => {
                console.error('Failed to load reCAPTCHA script');
                setCaptchaLoading(false);
                setErrors(prev => ({...prev, captcha: 'Failed to load reCAPTCHA. Please check your internet connection and refresh the page.'}));
            };
            
            document.head.appendChild(script);
        }
    };

    useEffect(() => {
        // Only attempt to load reCAPTCHA if we have a site key
        if (showRecaptcha) {
            loadReCaptchaScript();
        } else {
            setCaptchaLoading(false);
        }
        
        // Check if AJAX URL is valid
        if (window.crf_form_data?.ajax_url) {
            // Test AJAX endpoint is accessible
            fetch(window.crf_form_data.ajax_url)
                .then(response => console.log('AJAX endpoint test:', response.status))
                .catch(error => console.error('AJAX endpoint test failed:', error));
        }
        
        // Clean up function
        return () => {
            // Remove global callback if it exists
            if (window.onloadCallback) {
                window.onloadCallback = undefined;
            }
        };
    }, [showRecaptcha]);

    // Reset reCAPTCHA
    const resetCaptcha = () => {
        if (window.grecaptcha && widgetId.current !== null) {
            try {
                window.grecaptcha.reset(widgetId.current);
                setCaptchaValue(null);
            } catch (error) {
                console.error('Error resetting reCAPTCHA:', error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.date) newErrors.date = 'Date is required';
        
        // Only validate captcha if we're showing it
        if (showRecaptcha && !captchaValue) {
            newErrors.captcha = 'Please complete the reCAPTCHA';
        }

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
        resetCaptcha();
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate the form before submission
        if (!validateForm()) {
            // Scroll to the first error if any
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField && document.querySelector(`[name="${firstErrorField}"]`)) {
                document.querySelector(`[name="${firstErrorField}"]`).focus();
            }
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('action', 'submit_review');
            formDataToSend.append('nonce', window.crf_form_data?.nonce || '');
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('date', formData.date);
            
            // Only append captcha if we have a value
            if (captchaValue) {
                formDataToSend.append('captcha', captchaValue);
            }

            console.log('Submitting to:', window.crf_form_data?.ajax_url);
            
            const response = await axios.post(
                window.crf_form_data?.ajax_url || '', 
                formDataToSend,
                {
                    timeout: 10000, // 10 seconds timeout
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            
            if (response.data && response.data.success) {
                setSubmitStatus({ type: 'success', message: 'Review submitted successfully!' });
                resetForm(); 
            } else {
                const errorMessage = response.data && response.data.data 
                    ? response.data.data 
                    : 'Submission failed: Server did not return success status';
                console.error('Error details:', response.data);
                setSubmitStatus({ type: 'error', message: errorMessage });
                resetCaptcha();
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
            resetCaptcha();
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
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.title ? 'border-red-500' : ''}`}
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
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.description ? 'border-red-500' : ''}`}
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
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.name ? 'border-red-500' : ''}`}
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
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.date ? 'border-red-500' : ''}`}
                    />
                    {errors.date && <span className="text-red-500 text-sm">{errors.date}</span>}
                </div>

                {/* Google reCAPTCHA */}
                <div className="recaptcha-wrapper" style={{ minHeight: '100px' }}>
                    {showRecaptcha ? (
                        <>
                            {captchaLoading && (
                                <div className="text-gray-500 text-sm py-4 flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading reCAPTCHA...
                                </div>
                            )}
                            <div 
                                id="recaptcha-container" 
                                className="g-recaptcha" 
                                ref={captchaContainer}
                                style={{ display: captchaLoading ? 'none' : 'block' }}
                            ></div>
                            {errors.captcha && <span className="text-red-500 text-sm block mt-1">{errors.captcha}</span>}
                        </>
                    ) : (
                        <div className="text-red-500 text-sm py-4">
                            reCAPTCHA site key is not configured. Please configure it in the plugin settings.
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                    disabled={showRecaptcha && captchaLoading}
                >
                    {captchaLoading && showRecaptcha ? 'Loading...' : 'Submit Review'}
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