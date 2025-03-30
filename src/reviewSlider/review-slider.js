import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './review-slider.css';


const ReviewSlider = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!window.crf_slider_data || !window.crf_slider_data.ajax_url) {
                console.error("crf_slider_data is not defined.");
                setError("Configuration error: Reviews cannot be loaded.");
                setLoading(false);
                return;
            }

            // Get the count from the container div
            const container = document.getElementById('crf-review-slider-container');
            const count = container ? container.getAttribute('data-count') || 5 : 5;

            try {
                const response = await fetch(`${window.crf_slider_data.ajax_url}?action=get_published_reviews&count=${count}&nonce=${window.crf_slider_data.nonce}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success && Array.isArray(data.data.reviews)) {
                    setReviews(data.data.reviews);
                } else {
                    setError("No reviews found.");
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError("Failed to load reviews.");
            }
            setLoading(false);
        };

        fetchReviews();
    }, []);

    useEffect(() => {
        if (typeof jQuery === 'undefined' || !jQuery.fn.slick) {
            console.error('jQuery or Slick Slider is not loaded');
            return;
        }

        if (reviews.length > 0) {
            const $slider = jQuery('#crf-review-slider');

            if ($slider.hasClass('slick-initialized')) {
                $slider.slick('unslick');
            }

            $slider.slick({
                dots: true,                 
                infinite: true,             
                speed: 500,                
                slidesToShow: 1,            
                slidesToScroll: 1,          
                autoplay: true,            
                autoplaySpeed: 3000,        
                arrows: true,           
            });
        }

        return () => {
            const $slider = jQuery('#crf-review-slider');
            if ($slider.length && $slider.hasClass('slick-initialized')) {
                try {
                    $slider.slick('unslick');
                } catch (error) {
                    console.warn('Error during slider cleanup:', error);
                }
            }
        };
    }, [reviews]);

    if (loading) return <div>Loading reviews...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!reviews.length) return <div>No reviews available.</div>;

    return (                           
             <div id="crf-review-slider">
                {reviews.map((review) => (
                    <div key={review.id} className="slider_wrap">
                        <div className="quote_icon"><h2>“</h2></div>
                        <h3 className="title">
                        “{review.title}”</h3>
                        <p className="Description"><span>““</span>{review.description}<span>””</span></p>
                        <div className="seperator"></div>
                        <p className="User_name">{review.name}<span>, {review.date}</span></p>
                    </div>
                ))}
            </div>                 
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('crf-review-slider-container');
    if (container) {
        createRoot(container).render(<ReviewSlider />);
    }
});

export default ReviewSlider;
