=== Customer Reviews Form ===
Tags: customer reviews, testimonial slider, review slider, frontend review form, user reviews,
Requires at least: 5.6
Tested up to: 6.7.2
Stable tag: 2.0
Requires PHP: 7.0
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html
The **Customer Reviews Form** plugin allows you to manage and display customer reviews dynamically on your WordPress site.

## Description

The **Customer Reviews Form** plugin allows you to manage and display customer reviews dynamically on your WordPress site. This plugin provides two primary functionalities:

- A form for customers to submit their reviews.
- A slider to display the customer reviews.

The plugin also supports customization options for displaying the reviews with different designs, including options for background styles and the number of reviews to display. Reviews are saved as drafts in the admin dashboard, and once they are published, they will be displayed in the review slider.

## Features

- **Customer Review Form**: Allows customers to submit reviews through a simple form.
- **Customizable Review Slider**: Displays reviews in a slider, with options for different designs (`home-design` or `book-design`).
- **Drafts and Publishing**: Reviews are saved as drafts in the admin dashboard, and only published reviews appear in the slider.
- **Shortcodes**: Shortcodes are available to display the review form and slider.

## Shortcodes

### 1. `[customer_reviews_form]`

This shortcode will render a form where customers can submit their reviews.

Usage:
```[customer_reviews_form]```

### 2. `[customer_reviews_slider design="home-design" count="5"]`

This shortcode will display a slider for customer reviews with the `home-design` background style. You can also specify how many reviews to display using the `count` attribute.

Attributes:
- `design`: Defines the design of the slider (`home-design` or `book-design`).
- `count`: Specifies the number of reviews to display (default is 5).

Usage:
```[customer_reviews_slider design="home-design" count="5"]```

### 3. `[customer_reviews_slider design="book-design" count="5"]`

This shortcode will display a slider for customer reviews with the `book-design` background style. The `count` attribute is optional and can be used to define the number of reviews.

Attributes:
- `design`: Defines the design of the slider (`home-design` or `book-design`).
- `count`: Specifies the number of reviews to display (default is 5).

Usage:
```[customer_reviews_slider design="book-design" count="5"]```

## Installation

1. Download the plugin ZIP file.
2. Go to your WordPress admin dashboard.
3. Navigate to **Plugins** > **Add New**.
4. Click the **Upload Plugin** button and choose the ZIP file you downloaded.
5. Click **Install Now** and then **Activate** the plugin.

## How It Works

1. **Customer Review Form**:
   - The `customer_reviews_form` shortcode displays a review submission form. Customers can enter their name, email, and review content.
   - Upon submission, the review is saved as a custom post type and set as a draft in the admin dashboard.
   - The review will not appear in the slider until it is published by an admin.

2. **Customer Review Slider**:
   - The `customer_reviews_slider` shortcode displays a slider of customer reviews. Only reviews that are published will be displayed in the slider.
   - The slider can be styled differently based on the `design` attribute, which can be either `home-design` or `book-design`.
   - You can customize the number of reviews displayed by using the `count` attribute.


## License

This plugin is licensed under the [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html).

## Changelog

### 1.0
- Initial release with review form and slider functionality.
- Added the functionality that reviews are saved as drafts in the admin dashboard and only displayed in the slider once published.
### 2.0
- Google Captcha in Customer review form
- Utilise some vendor to enhance the feature
### 2.0.1
- Add constant value for Enqueue scirpt
- Add missing constant value
- Dynamic version for Style and CSS