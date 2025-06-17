<?php
class Review_Assets {
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'conditionally_enqueue_assets'));
    }

    public function conditionally_enqueue_assets() {
        // Check if post has either shortcode
        if (is_singular()) {
            global $post;
            if (has_shortcode($post->post_content, 'customer_reviews_form') || has_shortcode($post->post_content, 'customer_reviews_slider')) {
                $this->enqueue_frontend_assets();
            }
        }
    }

    public function enqueue_frontend_assets() {
        // Enqueue Slick CSS
        wp_enqueue_style(
            'slick-css',
            CRF_URL . 'vendor/slick/slick/slick.css',
            array(),
            CRF_VERSION
        );
        wp_enqueue_style(
            'slick-theme-css',
            CRF_URL . 'vendor/slick/slick/slick-theme.css',
            array('slick-css'),
            CRF_VERSION
        );

        // Enqueue Slick JS
        wp_enqueue_script(
            'slick-js',
            CRF_URL . 'vendor/slick/slick/slick.min.js',
            array('jquery'),
            CRF_VERSION,
            true
        );

        // React Scripts
        wp_enqueue_script('crf-review-form', CRF_URL . 'assets/js/review-form.js', array('wp-element'), CRF_VERSION, true);
        wp_enqueue_script('crf-review-slider', CRF_URL . 'assets/js/review-slider.js', array('wp-element', 'slick-js'), CRF_VERSION, true);

        // Localize data
        wp_localize_script('crf-review-form', 'crf_form_data', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('crf_review_nonce')
        ));
        wp_localize_script('crf-review-slider', 'crf_slider_data', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('crf_nonce')
        ));

        $this->enqueue_tailwind();
    }

    private function enqueue_tailwind() {
        if (!wp_style_is('tailwind-css', 'enqueued')) {
            wp_enqueue_style(
                'tailwind-css',
                CRF_URL . 'vendor/tailwind/tailwind.min.css',
                array(),
                CRF_VERSION
            );
        }
    }
}


new Review_Assets();