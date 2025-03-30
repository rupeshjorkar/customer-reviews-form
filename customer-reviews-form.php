<?php
/*
Plugin Name: Customer Review Forms
Description: A plugin to manage and display reviews.
Version: 1.0
Author: Lalit Kumar
*/

if (!defined('ABSPATH')) {
    exit;
}

define('CRF_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CRF_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once CRF_PLUGIN_DIR . 'includes/class-review-post-type.php';
require_once CRF_PLUGIN_DIR . 'includes/class-review-assets.php';
require_once CRF_PLUGIN_DIR . 'includes/class-review-handler.php';

function crf_review_form_shortcode() {
    ob_start(); ?>
    <div id="crf-review-form-container"></div>
    <?php return ob_get_clean();
}
add_shortcode('review_form', 'crf_review_form_shortcode');

function crf_review_slider_shortcode($atts) {
    $atts = shortcode_atts([
        'count' => 5,
        'class' => 'slider-one'
    ], $atts, 'review_slider');

    ob_start(); ?>
    <div id="crf-review-slider-container" class="<?php echo esc_attr($atts['class']); ?>" data-count="<?php echo esc_attr($atts['count']); ?>"></div>
    <?php return ob_get_clean();
}
add_shortcode('review_slider', 'crf_review_slider_shortcode');

