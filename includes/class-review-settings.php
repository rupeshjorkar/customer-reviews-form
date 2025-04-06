<?php
/**
 * Review Settings
 * 
 * Handles the plugin settings page for reCAPTCHA configuration
 */

if (!defined('ABSPATH')) {
    exit;
}

class Review_Settings {

    private $options;

    public function init() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
        add_filter('script_loader_tag', array($this, 'add_recaptcha_script'), 10, 3);
    }

    public function add_settings_page() {
        add_submenu_page(
            'edit.php?post_type=review',
            'Review Settings',
            'Settings',
            'manage_options',
            'review-settings',
            array($this, 'render_settings_page')
        );
    }


    public function register_settings() {
        // First, remove your existing validate_settings method setup
        function crf_sanitize_recaptcha_settings($input) {
            $sanitized = array();
            
            if (isset($input['site_key'])) {
                $sanitized['site_key'] = sanitize_text_field($input['site_key']);
            } else {
                $sanitized['site_key'] = '';
            }
            
            if (isset($input['secret_key'])) {
                $sanitized['secret_key'] = sanitize_text_field($input['secret_key']);
            } else {
                $sanitized['secret_key'] = '';
            }

            // Add success message
            add_settings_error(
                'crf_recaptcha_settings',
                esc_attr('settings_updated'),
                'Settings saved successfully.',
                'updated'
            );
            
            return $sanitized;
        }
        
        // Register with direct function reference
        register_setting(
            'crf_settings_group',
            'crf_recaptcha_settings',
            'crf_sanitize_recaptcha_settings'
        );
        
        // Rest of your code for sections and fields...
        add_settings_section(
            'crf_recaptcha_section',
            'Google reCAPTCHA Settings',
            array($this, 'render_section_info'),
            'review-settings'
        );
        
        // Add other settings fields...
        add_settings_section(
            'crf_recaptcha_section',
            'Google reCAPTCHA Settings',
            array($this, 'render_section_info'),
            'review-settings'
        );

        add_settings_field(
            'crf_recaptcha_site_key',
            'Site Key',
            array($this, 'render_site_key_field'),
            'review-settings',
            'crf_recaptcha_section'
        );

        add_settings_field(
            'crf_recaptcha_secret_key',
            'Secret Key',
            array($this, 'render_secret_key_field'),
            'review-settings',
            'crf_recaptcha_section'
        );
    }


    public function render_section_info() {
        echo '<p>Enter your Google reCAPTCHA keys below. You can obtain these from the <a href="https://www.google.com/recaptcha/admin" target="_blank">Google reCAPTCHA Admin Console</a>.</p>';
    }

    public function render_site_key_field() {
        $options = get_option('crf_recaptcha_settings', array('site_key' => ''));
        ?>
        <input type="text" id="crf_recaptcha_site_key" name="crf_recaptcha_settings[site_key]" value="<?php echo esc_attr($options['site_key']); ?>" class="regular-text" />
        <p class="description">The site key is used in the HTML code your site serves to users.</p>
        <?php
    }

    public function render_secret_key_field() {
        $options = get_option('crf_recaptcha_settings', array('secret_key' => ''));
        ?>
        <input type="password" id="crf_recaptcha_secret_key" name="crf_recaptcha_settings[secret_key]" value="<?php echo esc_attr($options['secret_key']); ?>" class="regular-text" />
        <p class="description">The secret key is used for communication between your site and Google. Keep it safe!</p>
        <?php
    }

    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Review Form Settings</h1>
            <?php settings_errors('crf_recaptcha_settings'); ?>
            <form method="post" action="options.php">
                <?php
                settings_fields('crf_settings_group');
                do_settings_sections('review-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    // Add recaptcha verification to server-side
    public static function verify_recaptcha($captcha_response) {
        $options = get_option('crf_recaptcha_settings');

        if (empty($options['secret_key']) || empty($captcha_response)) {
            return false;
        }

        $verify_url = 'https://www.google.com/recaptcha/api/siteverify';
        $data = array(
            'secret' => $options['secret_key'],
            'response' => $captcha_response,
            'remoteip' => isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : ''
        );

        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($data)
            )
        );

        $context  = stream_context_create($options);
        $result = file_get_contents($verify_url, false, $context);

        if ($result === false) {
            return false;
        }

        $result_data = json_decode($result);
        return $result_data->success;
    }

    // Get the site key for the front-end
    public static function get_site_key() {
        $options = get_option('crf_recaptcha_settings', array('site_key' => ''));
        return isset($options['site_key']) ? $options['site_key'] : '';
    }

    // Add async and defer to recaptcha script
    public function add_recaptcha_script($tag, $handle, $src) {
        if ('google-recaptcha' !== $handle) {
            return $tag;
        }

        return str_replace(' src', ' async defer src', $tag);
    }
}
