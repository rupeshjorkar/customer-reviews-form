<?php

class Review_Handler {
    public function __construct() {
        add_action('wp_ajax_submit_review', array($this, 'handle_review_submission'));
        add_action('wp_ajax_nopriv_submit_review', array($this, 'handle_review_submission'));
        add_action('wp_ajax_get_published_reviews', array($this, 'get_published_reviews'));
        add_action('wp_ajax_nopriv_get_published_reviews', array($this, 'get_published_reviews'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
    }

    // Handle the AJAX form submission
    public function handle_review_submission() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'crf_review_nonce')) {
            wp_send_json_error('Security check failed', 403);
        }

        // Verify reCAPTCHA
        if (isset($_POST['captcha'])) {
            $captcha_response = sanitize_text_field(wp_unslash($_POST['captcha']));
            
            if (!Review_Settings::verify_recaptcha($captcha_response)) {
                wp_send_json_error('reCAPTCHA verification failed');
            }
        } else {
            wp_send_json_error('reCAPTCHA response is missing');
        }

        // Sanitize and validate input
        $title       = isset($_POST['title']) ? sanitize_text_field(wp_unslash($_POST['title'])) : '';
        $description = isset($_POST['description']) ? sanitize_textarea_field(wp_unslash($_POST['description'])) : '';
        $name        = isset($_POST['name']) ? sanitize_text_field(wp_unslash($_POST['name'])) : '';
        $date        = isset($_POST['date']) ? sanitize_text_field(wp_unslash($_POST['date'])) : '';

        if (empty($title) || empty($description) || empty($name) || empty($date)) {
            wp_send_json_error('All fields are required');
        }

        // Insert review into the database
        $post_id = wp_insert_post(array(
            'post_title'   => $title,
            'post_content' => $description,
            'post_status'  => 'draft',
            'post_type'    => 'review'
        ));

        if ($post_id) {
            update_post_meta($post_id, '_review_name', $name);
            update_post_meta($post_id, '_review_date', $date);
            wp_send_json_success('Review submitted successfully');
        } else {
            wp_send_json_error('Error submitting review');
        }
    }

    // Fetch published reviews
    public function get_published_reviews() {
        // Add nonce verification
        if (!isset($_GET['review_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['review_nonce'])), 'crf_review_nonce')) {
            // Default to 5 if nonce verification fails
            $count = 5;
        } else {
            $count = isset($_GET['count']) ? intval($_GET['count']) : 5;
        }

        $args = [
            'post_type'      => 'review',
            'post_status'    => 'publish',
            'posts_per_page' => $count,
        ];

        $query = new WP_Query($args);
        $reviews = [];

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $reviews[] = [
                    'id'          => get_the_ID(),
                    'title'       => get_the_title(),
                    'description' => get_the_content(),
                    'name'        => get_post_meta(get_the_ID(), '_review_name', true),
                    'date'        => get_the_date('Y-m-d'),
                ];
            }
            wp_reset_postdata();
            wp_send_json_success(['reviews' => $reviews]);
        } else {
            wp_send_json_error('No reviews found', 404);
        }
    }

    // Enqueue frontend assets
    public function enqueue_frontend_assets() {
        wp_enqueue_script(
            'crf-review-form',
            plugin_dir_url(__FILE__) . '../assets/js/review-form.js',
            array('wp-element'),
            '1.0.0',
            true
        );

        wp_enqueue_script(
            'crf-review-slider',
            plugin_dir_url(__FILE__) . '../assets/js/review-slider.js',
            array('wp-element'),
            '1.0.0',
            true
        );

        // Register Google reCAPTCHA script
        wp_register_script(
            'google-recaptcha',
            'https://www.google.com/recaptcha/api.js',
            array(),
            'v2',
            false
        );
        wp_enqueue_script('google-recaptcha');

        // Create a single nonce for both scripts
        $nonce = wp_create_nonce('crf_review_nonce');
        
        wp_localize_script('crf-review-form', 'crf_form_data', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => $nonce,
            'recaptcha_site_key' => Review_Settings::get_site_key(),
        ));

        wp_localize_script('crf-review-slider', 'crf_review_data', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => $nonce  // Add nonce to the review slider data
        ));
    }
}

new Review_Handler();