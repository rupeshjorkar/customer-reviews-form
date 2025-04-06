<?php
/**
 * Plugin Name: Customer Reviews Form
 * Plugin URI: 
 * Description: A plugin to manage and display custom reviews.
 * Version: 2.0.1
 * Requires at least: 2.6
 * Requires PHP: 5.6
 * Author: Bible Society
 * Author URI: 
 * License: GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: customer-reviews-form
 */

if (!defined('ABSPATH')) {
    exit;
}


// define('CRF_PLUGIN_URL', plugin_dir_url(__FILE__));

define( 'CRF_VERSION', '2.0' );
define( 'CRF_URL', plugin_dir_url( __FILE__ ) );
define( 'CRF_DIR', plugin_dir_path(__FILE__) );
define( 'CRF_PATH', dirname( __FILE__ ) );
define( 'CRF_TEXT_DOMAIN', 'customer-reviews-form' );


require_once CRF_DIR . 'includes/class-review-post-type.php';
require_once CRF_DIR . 'includes/class-review-assets.php';
require_once CRF_DIR . 'includes/class-review-handler.php';
require_once CRF_DIR . 'includes/class-review-settings.php';

// Initialize settings
function crf_initialize_settings() {
    if (!class_exists('Review_Settings')) {
        return; // Prevent initialization if the class doesn't exist
    }
    $settings = new Review_Settings();
    $settings->init();
}
add_action('plugins_loaded', 'crf_initialize_settings');

function crf_review_form_shortcode() {
    return '<div id="crf-review-form-container"></div>';
    /*  ob_start(); ?>
    <div id="crf-review-form-container"></div>
    <?php return ob_get_clean(); */
}
add_shortcode('customer_reviews_form', 'crf_review_form_shortcode');
 
function crf_review_slider_shortcode($atts) {
    $atts = shortcode_atts(
        [
            'count' => 5,
            'class' => 'slider',
            'design' => ''  // Design attribute (home-design or book-design)
        ],
        $atts,
        'customer_reviews_slider'
    );
    
   // Modify class based on 'design' attribute
    switch ($atts['design']) {
        case 'home-design':
            $atts['class'] = 'slider_with_background';
            break;
        case 'book-design':
            $atts['class'] = 'slider_without_background';
            break;
    }

    // Return the markup for the slider
    return sprintf(
        '<div id="crf-review-slider-container" class="%s" data-count="%d" data-design="%s"></div>',
        esc_attr($atts['class']),
        intval($atts['count']),
        esc_attr($atts['design'])
    );
}
add_shortcode('customer_reviews_slider', 'crf_review_slider_shortcode');