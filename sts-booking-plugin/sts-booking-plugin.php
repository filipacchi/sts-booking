<?php
/*
Plugin Name: STS Booking Plugin
Plugin URI: 
Description: Bokningssystem plugin för att boka presentationstider för sts examensarbeten.
Version: 1.0
Author: Ludvig Bennbom
Author URI: ludvig.bennbom@gmail.com
License: GPL2
*/

// 2024-09-26 11:17
function sts_booking_plugin_init() {

function allow_public_rest_api_access($result) {

    $allowed_endpoints = [
        '/wp-json/custom/v1/presentation-times',
        '/wp-json/custom/v1/book-time',
        '/wp-json/custom/v1/check-code',
        '/wp-json/custom/v1/cancel-booking',
        // Add other endpoints here
    ];
    // Check if the request is for our specific endpoint
    if (in_array($_SERVER['REQUEST_URI'], $allowed_endpoints)) {
        if (is_wp_error($result) && $result->get_error_code() === 'rest_not_logged_in') {
            return true; // Bypass authentication for this endpoint
        }
    }
    return $result;
}
add_filter('rest_authentication_errors', 'allow_public_rest_api_access');

function register_presentation_times_route() {
    register_rest_route('custom/v1', '/presentation-times', array(
        'methods' => 'GET',
        'callback' => 'get_presentation_times_after_now',
        'permission_callback' => '__return_true' // Allow public access
    ));
}
add_action('rest_api_init', 'register_presentation_times_route');


function get_presentation_times_after_now() {
    $current_time = current_time('Y-m-d H:i:s');

    $args = array(
        'post_type' => 'presentation_time',
        'meta_query' => array(
            array(
                'key' => 'booking_date', // Replace 'booking_date' with the actual meta key of your date field
                'value' => $current_time,
                'compare' => '>',
                'type' => 'DATE'
            ),
        ),
        'orderby' => 'meta_value',
        'order' => 'ASC',
    );

    $query = new WP_Query($args);

    if ($query->have_posts()) {
        $posts = array();

        while ($query->have_posts()) {
            $query->the_post();
            $posts[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'presentation_datetime' => get_post_meta(get_the_ID(), 'presentation_datetime', true),
                'booking_date' => get_post_meta(get_the_ID(), 'booking_date', true),
                'on_site' => get_post_meta(get_the_ID(), 'on_site', true),
                'time_slots' => array(
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_8', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_8', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_9', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_9', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_10', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_10', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_11', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_11', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_12', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_12', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_13', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_13', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_14', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_14', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_15', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_15', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_16', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_16', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_17', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_17', true)
    ),
    array(
        'time' => get_post_meta(get_the_ID(), 'tid_18', true),
        'author' => get_post_meta(get_the_ID(), 'author_tid_18', true)
    )
    ),
                'link' => get_permalink(),
                'permission_callback' => '__return_true',
            );
        }

        wp_reset_postdata();

        return new WP_REST_Response($posts, 200);
    } else {
        return new WP_REST_Response(array('message' => 'No posts found'), 404);
    }
}


function generate_unique_random_code() {
    global $wpdb;

    do {
        $random_code = rand(10000, 99999);
        $code_exists = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_id FROM $wpdb->postmeta WHERE meta_key = 'random_code' AND meta_value = %s",
            $random_code
        ));
    } while ($code_exists);

    return $random_code;
}


function add_unique_random_code_to_post($post_id, $post, $update) {
    // Generate and save the random code when the post is first created
    if (!$update) {
        // Check if the post type is your custom post type
        if ($post->post_type == 'examensarbete') {
            // Generate a unique random code
            $random_code = generate_unique_random_code();

            // Save the random code in the custom field
            update_post_meta($post_id, 'random_code', $random_code);
        }
    }

    // Only send the email when the post is published
    if ($post->post_type == 'examensarbete' && $post->post_status == 'publish' && get_post_meta($post_id, '_unique_random_code_sent', true) != 'yes') {
        // Retrieve the email from the custom field
        $author_email = get_post_meta($post_id, 'user_email', true);

        // Retrieve the random code that was saved earlier
        $random_code = get_post_meta($post_id, 'random_code', true);

        // Prepare email details
        $post_title = get_the_title($post_id);
/*         $subject = "Ditt examensarbete har blivit godkänt och din exjobbskod är $random_code";
        $message = "Ditt examensarbete: '$post_title' har blivit godkänt.\n\nDin exjobbskod är $random_code.\n\nDet är viktigt att du sparar denna kod då den behövs vid bokning av presentationstid senare.";
 */
        $subject = "Ditt examensarbete har blivit godkänt";
        $message = "Ditt examensarbete: '$post_title' har blivit godkänt.";
        // Send the email
        wp_mail($author_email, $subject, $message);

        // Mark that the email has been sent
        update_post_meta($post_id, '_unique_random_code_sent', 'yes');
    }
}
add_action('save_post', 'add_unique_random_code_to_post', 10, 3);



add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/book-time', array(
        'methods' => 'POST',
        'callback' => 'update_author_field',
        'permission_callback' => '__return_true',
    ));
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/check-code', array(
        'methods' => 'POST',
        'callback' => 'check_code_get_authors',
        'permission_callback' => '__return_true',
    ));
});

function check_code_get_authors(WP_REST_Request $request) {
    $unique_code = $request->get_param('unique_code');

    if (empty($unique_code)) {
        return new WP_REST_Response(array('message' => 'Missing parameters'), 400);
    }

    if (!is_numeric($unique_code) || strlen($unique_code) !== 5) {
        return new WP_REST_Response(array('message' => 'Invalid unique code'), 400);
    }

    $related_post = get_posts(array(
        'post_type' => 'examensarbete',
        'meta_key' => 'random_code',
        'meta_value' => $unique_code,
        'numberposts' => 1
    ));

    if (empty($related_post)) {
        return new WP_REST_Response(array('message' => 'Invalid unique code'), 400);
    }

    $related_post_id = $related_post[0]->ID;
    $author_1 = get_post_field('forfattare_1', $related_post_id);
    $author_2 = get_post_field('forfattare_2', $related_post_id);
    $title = get_the_title($related_post_id);

    $authors = array();
    if (!empty($author_1)) {
        $authors[] = $author_1;
    }
    if (!empty($author_2)) {
        $authors[] = $author_2;
    }

    // Retrieve the presentation post ID from the relationship field
    $presentation_post_id = get_field('presentation_post_id', $related_post_id);

    if (!empty($presentation_post_id)) {
        // Example: Check if the presentation post has any bookings for each author
        $booked_times = array();
        $valid_times = array('tid_8', 'tid_9', 'tid_10', 'tid_11', 'tid_12', 'tid_13', 'tid_14', 'tid_15', 'tid_16', 'tid_17', 'tid_18');

        foreach ($valid_times as $time_key) {
            $author_at_time = get_post_meta($presentation_post_id, 'author_' . $time_key, true);

            if (!empty($author_at_time)) {
                // Check if the booking matches one of the authors
                if (in_array($author_at_time, $authors)) {
                    $booked_times[$time_key] = $author_at_time;
                }
            }
        }

        if (count($authors) == 2 && count($booked_times) != 2) {
            return new WP_REST_Response(array(
                'message' => 'Two authors detected but bookings do not match. Authors count: ' . count($authors) . ', Booked times count: ' . count($booked_times)
            ), 400);
        }
        

        if (count($authors) == 1 && count($booked_times) != 1) {
            return new WP_REST_Response(array('message' => 'Single author detected but multiple bookings found'), 400);
        }

        $data = array(
            'authors' => $authors,
            'title' => $title,
            'presentation_post_id' => $presentation_post_id,
            'booked_times' => $booked_times
        );
    } else {
        $data = array(
            'authors' => $authors,
            'title' => $title,
            'message' => 'No presentation post associated'
        );
    }

    return new WP_REST_Response($data, 200);
}



/* function update_author_field(WP_REST_Request $request) {
    // Retrieve parameters from the request
    $post_id = $request->get_param('post_id');
    $time = $request->get_param('time');
    $unique_code = $request->get_param('unique_code');

    // Check for missing parameters
    if (empty($post_id) || empty($time) || empty($unique_code)) {
        return new WP_REST_Response(array('message' => 'Missing parameters'), 400);
    }

    // Define valid times and initialize the meta key
    $valid_times = array('tid_8', 'tid_9', 'tid_10', 'tid_11', 'tid_12', 'tid_13', 'tid_14', 'tid_15', 'tid_16', 'tid_17', 'tid_18');
    $time_meta_key = '';

    // Check if the time parameter is valid and set the appropriate meta key
    foreach ($valid_times as $valid_time) {
        if (get_post_meta($post_id, $valid_time, true) == $time) {
            $time_meta_key = 'author_' . $valid_time;
            break;
        }
    }

    // Return an error if the time parameter is invalid
    if (empty($time_meta_key)) {
        return new WP_REST_Response(array('message' => 'Invalid time parameter'), 400);
    }

    // Identify the post using the unique code (assuming unique code is stored in a custom field 'unique_code')
    $related_post = get_posts(array(
        'post_type' => 'examensarbete', // Replace with your actual post type
        'meta_key' => 'random_code',
        'meta_value' => $unique_code,
        'numberposts' => 1
    ));

    // Check if the related post was found
    if (empty($related_post)) {
        return new WP_REST_Response(array('message' => 'Invalid unique code'), 400);
    }

    // Get the author from the related post
    $related_post_id = $related_post[0]->ID;
    $author = get_post_field('forfattare_1', $related_post_id);

    // Update the post meta with the retrieved author
    update_post_meta($post_id, $time_meta_key, sanitize_text_field($author));

    // Return a success response
    return new WP_REST_Response(array('message' => 'Author updated successfully'), 200);
} */
function update_author_field(WP_REST_Request $request) {
    // Retrieve parameters from the request
    $post_id = $request->get_param('post_id');
    $time1 = $request->get_param('time1');
    $time2 = $request->get_param('time2');
    $unique_code = $request->get_param('unique_code');

    // Check for missing parameters
    if (empty($post_id) || empty($time1) || empty($unique_code)) {
        return new WP_REST_Response(array('message' => 'Missing parameters'), 400);
    }

    // Define valid times and initialize the meta keys
    $valid_times = array('tid_8', 'tid_9', 'tid_10', 'tid_11', 'tid_12', 'tid_13', 'tid_14', 'tid_15', 'tid_16', 'tid_17', 'tid_18');
    $time_meta_key1 = '';
    $time_meta_key2 = '';

    // Check if the first time parameter is valid and set the appropriate meta key
    foreach ($valid_times as $index => $valid_time) {
        if (get_post_meta($post_id, $valid_time, true) == $time1) {
            $time_meta_key1 = 'author_' . $valid_time;

            // If time2 is provided, check if it's consecutive to time1
            if (!empty($time2)) {
                if (isset($valid_times[$index + 1]) && get_post_meta($post_id, $valid_times[$index + 1], true) == $time2) {
                    $time_meta_key2 = 'author_' . $valid_times[$index + 1];
                } else {
                    return new WP_REST_Response(array('message' => 'Time slots must be consecutive'), 400);
                }
            }
            break;
        }
    }

    // Return an error if the first time parameter is invalid
    if (empty($time_meta_key1)) {
        return new WP_REST_Response(array('message' => 'Invalid first time parameter'), 400);
    }

    // Check if the time slots are already booked
    if (!empty(get_post_meta($post_id, $time_meta_key1, true))) {
        return new WP_REST_Response(array('message' => 'The first time slot is already booked'), 400);
    }
    if (!empty($time_meta_key2) && !empty(get_post_meta($post_id, $time_meta_key2, true))) {
        return new WP_REST_Response(array('message' => 'The second time slot is already booked'), 400);
    }

    // Identify the post using the unique code (assuming unique code is stored in a custom field 'random_code')
    $related_post = get_posts(array(
        'post_type' => 'examensarbete',
        'meta_key' => 'random_code',
        'meta_value' => $unique_code,
        'numberposts' => 1
    ));

    // Check if the related post was found
    if (empty($related_post)) {
        return new WP_REST_Response(array('message' => 'Invalid unique code'), 400);
    }

    // Get authors from the related post
    $related_post_id = $related_post[0]->ID;
    $author1 = get_post_field('forfattare_1', $related_post_id);
    $author2 = get_post_field('forfattare_2', $related_post_id); 

    // Validate the time and author combinations
    if (empty($author2) && !empty($time2)) {
        return new WP_REST_Response(array('message' => 'The second time slot must be empty'), 400);
    }

    if (!empty($author2) && empty($time2)) {
        return new WP_REST_Response(array('message' => 'The second time slot must be provided'), 400);
    }

    // Update the post meta with the retrieved author(s)
    update_post_meta($post_id, $time_meta_key1, sanitize_text_field($author1));

    if (!empty($time_meta_key2) && !empty($author2)) {
        update_post_meta($post_id, $time_meta_key2, sanitize_text_field($author2));
    }

    // Update the presentation_post_id in the examensarbete post
    update_post_meta($related_post_id, 'presentation_post_id', $post_id);

    // Return a success response
    return new WP_REST_Response(array('message' => 'Author(s) and presentation post ID updated successfully'), 200);
}


add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/cancel-booking', array(
        'methods' => 'DELETE',
        'callback' => 'cancel_booking',
        'permission_callback' => '__return_true', // Adjust for better security
    ));
});

// Callback function to handle the booking cancellation
function cancel_booking(WP_REST_Request $request) {
    // Retrieve the necessary parameters from the request
    $post_id = $request->get_param('post_id');
    $unique_code = $request->get_param('unique_code');
    
    // Check for missing parameters
    if (empty($post_id) || empty($unique_code)) {
        return new WP_REST_Response(array('message' => 'Missing parameters'), 400);
    }

    // Identify the related post using the unique code
    $related_post = get_posts(array(
        'post_type' => 'examensarbete', // Replace with your actual post type
        'meta_key' => 'random_code',
        'meta_value' => $unique_code,
        'numberposts' => 1
    ));

    // Check if the related post was found
    if (empty($related_post)) {
        return new WP_REST_Response(array('message' => 'Invalid unique code'), 400);
    }

    // Get the authors from the related post
    $related_post_id = $related_post[0]->ID;
    $author1 = get_post_field('forfattare_1', $related_post_id);
    $author2 = get_post_field('forfattare_2', $related_post_id);

    // Retrieve the valid times for the booking
    $valid_times = array('tid_8', 'tid_9', 'tid_10', 'tid_11', 'tid_12', 'tid_13', 'tid_14', 'tid_15', 'tid_16', 'tid_17', 'tid_18');
    $canceled_count = 0;

    foreach ($valid_times as $valid_time) {
        $author_meta_key = 'author_' . $valid_time;

        // Cancel booking for author1
        if (!empty($author1) && get_post_meta($post_id, $author_meta_key, true) === $author1) {
            delete_post_meta($post_id, $author_meta_key);
            $canceled_count++;
        }

        // Cancel booking for author2 if present
        if (!empty($author2) && get_post_meta($post_id, $author_meta_key, true) === $author2) {
            delete_post_meta($post_id, $author_meta_key);
            $canceled_count++;
        }
    }

    // If no bookings were found and canceled, return an error response
    if ($canceled_count === 0) {
        return new WP_REST_Response(array('message' => 'No booking found to cancel'), 404);
    }

    // Return a success response
    return new WP_REST_Response(array('message' => "Booking(s) canceled successfully for $canceled_count time(s)"), 200);
}


}

add_action('init', 'sts_booking_plugin_init');