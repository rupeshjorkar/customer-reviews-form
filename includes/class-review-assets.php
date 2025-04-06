<?php
class Review_Assets {
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
    }

    public function enqueue_frontend_assets() {
        // Enqueue Slick Slider CSS
        wp_enqueue_style(
            'slick-css', 
            CRF_PLUGIN_URL . 'vendor/slick/slick/slick.css',
            array(),
            '1.8.1'
        );
        wp_enqueue_style(
            'slick-theme-css', 
            CRF_PLUGIN_URL . 'vendor/slick/slick/slick-theme.css',
            array('slick-css'),
            '1.8.1'
        );

        wp_enqueue_script(
            'slick-js', 
            CRF_PLUGIN_URL . 'vendor/slick/slick/slick.min.js',
            array('jquery'), 
            '1.8.1', 
            true
        );

        // Enqueue React scripts using WordPress-bundled wp-element
        wp_enqueue_script('crf-review-form', CRF_PLUGIN_URL . 'assets/js/review-form.js', array('wp-element'), '1.0.0', true);
        wp_enqueue_script('crf-review-slider', CRF_PLUGIN_URL . 'assets/js/review-slider.js', array('wp-element', 'slick-js'), '1.0.0', true);

        // Localize scripts with data and nonces
        wp_localize_script('crf-review-form', 'crf_form_data', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('crf_review_nonce')
        ));
        wp_localize_script('crf-review-slider', 'crf_slider_data', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('crf_nonce'),
        ]);

        // Conditionally enqueue Tailwind CSS
        $this->enqueue_tailwind();
    }

    /**
     * Safely enqueue Tailwind CSS
     */
    private function enqueue_tailwind() {
        if (!wp_style_is('tailwind-css', 'enqueued')) {
            wp_enqueue_style(
                'tailwind-css', 
                CRF_PLUGIN_URL . 'vendor/tailwind/tailwind.min.css',
                array(), 
                '2.2.19'
            );
        }
    }
}

new Review_Assets();