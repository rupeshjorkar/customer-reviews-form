<?php
if (!class_exists('Review_Post_Type')) {
    class Review_Post_Type {
        public function __construct() {
            add_action('init', array($this, 'register_review_post_type'));
            add_action('add_meta_boxes', array($this, 'add_review_meta_boxes'));
            add_action('save_post', array($this, 'save_review_meta'), 10, 2);
            add_filter('manage_edit-review_columns', array($this, 'set_custom_columns'));
            add_action('manage_review_posts_custom_column', array($this, 'custom_column_content'), 10, 2);
        }

        public function register_review_post_type() {
            $args = array(
                'public' => true,
                'labels' => array(
                    'name'               => 'Reviews',
                    'singular_name'      => 'Review',
                    'add_new'            => 'Add New Review',
                    'add_new_item'       => 'Add New Review',
                    'edit_item'          => 'Edit Review',
                    'new_item'           => 'New Review',
                    'view_item'          => 'View Review',
                    'search_items'       => 'Search Reviews',
                    'not_found'          => 'No reviews found',
                    'not_found_in_trash' => 'No reviews found in Trash',
                ),
                'supports' => array('title', 'editor'),
                'capability_type' => 'post',
                'map_meta_cap' => true,
                'show_in_menu' => true,
                'menu_icon' => 'dashicons-star-filled',
            );
            register_post_type('review', $args);
        }

        public function add_review_meta_boxes() {
            add_meta_box(
                'review_details_meta',
                'Review Details',
                array($this, 'render_review_meta_box'),
                'review',
                'normal',
                'default'
            );
        }

        public function render_review_meta_box($post) {
            $name = get_post_meta($post->ID, '_review_name', true);
            $date = get_post_meta($post->ID, '_review_date', true);
            ?>
            <p>
                <label for="review_name">Reviewer Name:</label>
                <input type="text" id="review_name" name="review_name" value="<?php echo esc_attr($name); ?>" class="widefat">
            </p>
            <p>
                <label for="review_date">Review Date:</label>
                <input type="date" id="review_date" name="review_date" value="<?php echo esc_attr($date); ?>" class="widefat">
            </p>
            <?php
        }

        public function save_review_meta($post_id, $post) {
            if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
            if (!isset($_POST['review_name']) || !isset($_POST['review_date'])) return;
            if (!current_user_can('edit_post', $post_id)) return;

            update_post_meta($post_id, '_review_name', sanitize_text_field($_POST['review_name']));
            update_post_meta($post_id, '_review_date', sanitize_text_field($_POST['review_date']));
        }

        // Modify the admin columns
        public function set_custom_columns($columns) {
            unset($columns['date']); // Remove default date column
            $columns['reviewer_name'] = 'Reviewer Name';
            $columns['review_date'] = 'Review Date';
            $columns['description'] = 'Description';
            return $columns;
        }

        // Populate the custom columns with data
        public function custom_column_content($column, $post_id) {
            switch ($column) {
                case 'reviewer_name':
                    $name = get_post_meta($post_id, '_review_name', true);
                    echo esc_html($name ? $name : '—');
                    break;
                case 'review_date':
                    $date = get_post_meta($post_id, '_review_date', true);
                    echo esc_html($date ? $date : '—');
                    break;
                case 'description':
                    $excerpt = get_the_excerpt($post_id);
                    echo esc_html($excerpt ? $excerpt : '—');
                    break;
            }
        }
    }
}

add_action('plugins_loaded', function () {
    new Review_Post_Type();
});
