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


    function add_booking_interface() {
        add_menu_page(
            'Booking Slots', // Page title
            'Booking Slots', // Menu title
            'manage_options', // Capability
            'booking-slots', // Menu slug
            'render_booking_interface' // Callback
        );
    }
    add_action('admin_menu', 'add_booking_interface');
    
function render_booking_interface() {
    ?>
    <div class="wrap">
        <h1>Booking Slots</h1>
        <form method="post" action="">
            <label for="booking_date">Select Date:</label>
            <input type="date" id="booking_date" name="booking_date" required>
            
            <h3>Select Time Slots:</h3>
            <?php 
            $time_slots = [
                '08:15', '09:15', '10:15', '11:15', 
                '12:15', '13:15', '14:15', '15:15', 
                '16:15', '17:15', '18:15'
            ];
            foreach ($time_slots as $time) {
                echo "<input type='checkbox' name='time_slots[]' value='$time'> $time<br>";
            }
            ?>
            <br>
            <button type="submit" name="create_bookings" class="button button-primary">Create Bookings</button>
        </form>
    </div>
    <?php
}

function handle_booking_submission() {
    if (isset($_POST['create_bookings'])) {
        $date = sanitize_text_field($_POST['booking_date']);
        $time_slots = $_POST['time_slots'] ?? [];

        if ($date && !empty($time_slots)) {
            foreach ($time_slots as $time) {
                $post_data = [
                    'post_title' => "Booking on $date at $time",
                    'post_type' => 'booking', // Your custom post type
                    'post_status' => 'publish',
                    'meta_input' => [
                        'day' => $date,
                        'time' => $time,
                    ],
                ];
                wp_insert_post($post_data);
            }
            echo '<div class="notice notice-success is-dismissible"><p>Bookings created successfully!</p></div>';
        }
    }
}
add_action('admin_notices', 'handle_booking_submission');

function allow_public_rest_api_access($result) {

    $allowed_endpoints = [
        '/wp-json/custom/v1/presentation-times',
        '/wp-json/custom/v1/book-time',
        '/wp-json/custom/v1/check-code',
        '/wp-json/custom/v1/cancel-booking',
        '/wp-json/custom/v1/get-bookings',
        '/wp-json/custom/v1/make-booking',
        '/wp-json/custom/v1/delete-all-bookings',
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

function register_get_bookings_route() {
    register_rest_route('custom/v1', '/get-bookings', array(
        'methods' => 'GET',
        'callback' => 'get_future_bookings',
        'permission_callback' => '__return_true' // Allow public access
    ));
}
add_action('rest_api_init', 'register_get_bookings_route');

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/make-booking', array(
        'methods' => 'POST',
        'callback' => 'make_booking',
        'permission_callback' => '__return_true',
    ));
});


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

function get_future_bookings($request) {
    // Get the current date
    $current_date = date('Y-m-d');

    // Query for bookings with a date greater than or equal to the current date
    $args = array(
        'post_type' => 'booking',
        'meta_query' => array(
            array(
                'key' => 'day',
                'value' => $current_date,
                'compare' => '>=',
                'type' => 'DATE'
            )
        ),
        'posts_per_page' => -1, // Get all matching posts
        'orderby' => array(
            'meta_value' => 'ASC', // Order by day
            'time' => 'ASC' // Order by time
        ),
        'meta_key' => 'day',
    );

    $query = new WP_Query($args);
    $bookings = array();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $day = get_post_meta(get_the_ID(), 'day', true);
            $thesis = get_post_meta(get_the_ID(), 'thesis', true);

            // Extract the ID from the thesis post object
            $thesis_id = isset($thesis['ID']) ? $thesis['ID'] : null;
            if ($thesis_id) {
                $thesis_id = hash_data($thesis_id);
            }

            $booking = array(
                'id' => get_the_ID(),
                'time' => get_post_meta(get_the_ID(), 'time', true),
                'thesis' => $thesis_id, // Ensure only the ID is returned
                'thesis_author' => get_post_meta(get_the_ID(), 'thesis_author', true),
                'booked' => get_post_meta(get_the_ID(), 'booked', true),
            );

            if (!isset($bookings[$day])) {
                $bookings[$day] = array();
            }
            $bookings[$day][] = $booking;
        }
        wp_reset_postdata();
    }

    // Sort bookings by time within each day
    foreach ($bookings as &$day_bookings) {
        usort($day_bookings, function($a, $b) {
            return strcmp($a['time'], $b['time']);
        });
    }

    return new WP_REST_Response($bookings, 200);
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
        $subject = "Ditt examensarbete har blivit godkänt och din exjobbskod är $random_code";
        $message = "Ditt examensarbete: '$post_title' har blivit godkänt.\n\nDin exjobbskod är $random_code.\n\nDet är viktigt att du sparar denna kod då den behövs vid bokning av presentationstid senare.";

        /* $subject = "Ditt examensarbete har blivit godkänt";
        $message = "Ditt examensarbete: '$post_title' har blivit godkänt."; */
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
        'callback' => 'check_code',
        'permission_callback' => '__return_true',
    ));
});

/* add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/get-bookings', array(
        'methods' => 'GET',
        'callback' => 'get_bookings_by_unique_code',
        'permission_callback' => '__return_true',
    ));
}); */

function hash_data($data) {
    $salt = '9Shpt5SB97tbHpY6gCcDrzUlYayAzgVp';
    return hash('sha256', $data . $salt);
}

function check_unique_code($unique_code) {
    if (empty($unique_code)) {
        return new WP_REST_Response(array('message' => 'Unique code is required'), 400);
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

    return $related_post[0]->ID;
}

function check_code(WP_REST_Request $request) {
    $unique_code = $request->get_param('unique_code');

    // Check if the unique code is valid and check return value for error
    $related_post_id = check_unique_code($unique_code);
    if ($related_post_id instanceof WP_REST_Response) {
        return $related_post_id;
    }

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

    $hashed_thesis_id = hash_data($related_post_id);

    # Get the bookings associated with the unique code
    $args = array(
        'post_type' => 'booking',
        'meta_query' => array(
            array(
                'key' => 'thesis',
                'value' => $related_post_id,
                'compare' => '='
            )
        ),
        'posts_per_page' => -1
    );

    # and return the bookings, if any
    $query = new WP_Query($args);
    $bookings = array();
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $bookings[] = array(
                'id' => get_the_ID(),
                'date'  => get_post_meta(get_the_ID(), 'day', true),
                'time' => get_post_meta(get_the_ID(), 'time', true),
                'thesis_author' => get_post_meta(get_the_ID(), 'thesis_author', true),
                'booked' => get_post_meta(get_the_ID(), 'booked', true),
            );
        }
        wp_reset_postdata();
    }

    $data = array(
        'authors' => $authors,
        'title' => $title,
        'thesis_id' => $hashed_thesis_id,
        'bookings' => $bookings
    );

    return new WP_REST_Response($data, 200);
}


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
/* 
function get_bookings_by_unique_code($unique_code) {
    if (empty($unique_code)) {
        return new WP_REST_Response(['message' => 'Unique code is required'], 400);
    }

    // Find the examensarbete post by unique code
    $examensarbete = get_posts([
        'post_type' => 'examensarbete',
        'meta_key' => 'random_code',
        'meta_value' => $unique_code,
        'numberposts' => 1,
    ]);

    if (empty($examensarbete)) {
        return new WP_REST_Response(['message' => 'No examensarbete found for this unique code'], 404);
    }

    $related_post_id = $examensarbete[0]->ID;

    // Query all presentation times posts
    $presentation_posts = get_posts([
        'post_type' => 'presentation_times',
        'posts_per_page' => -1, // Get all presentation posts
        'meta_query' => [
            [
                'key' => 'exjobb_tid_%', // Match any "exjobb_*" meta keys
                'value' => $related_post_id,
                'compare' => '='
            ],
        ],
    ]);

    $bookings = [];

    foreach ($presentation_posts as $post) {
        $booked_slots = [];

        // Loop through valid time fields
        $valid_times = ['tid_8', 'tid_9', 'tid_10', 'tid_11', 'tid_12', 'tid_13', 'tid_14', 'tid_15', 'tid_16', 'tid_17', 'tid_18'];
        foreach ($valid_times as $time_field) {
            $thesis_meta_key = 'exjobb_' . $time_field;
            $linked_post_id = get_post_meta($post->ID, $thesis_meta_key, true);

            // If this slot is booked with the related post ID, add it to the results
            if ($linked_post_id == $related_post_id) {
                $booked_slots[] = [
                    'time' => get_post_meta($post->ID, $time_field, true),
                    'field' => $time_field,
                ];
            }
        }

        if (!empty($booked_slots)) {
            $bookings[] = [
                'presentation_post_id' => $post->ID,
                'date' => get_post_meta($post->ID, 'booking_date', true);
                'booked_slots' => $booked_slots,
            ];
        }
    }

    return new WP_REST_Response(['bookings' => $bookings], 200);
}
 */


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


function make_booking(WP_REST_Request $request){
    $date = $request->get_param('date');
    $bookings = $request->get_param('bookings');
    $unique_code = $request->get_param('unique_code');
    $reverse_author = $request->get_param('reverse_author');

    if (empty($date) || empty($bookings) || !is_array($bookings)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Invalid input parameters'
        ), 400);
    }

    if (count($bookings) > 2) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Maximum of 2 bookings allowed'
        ), 400);
    }

    $processedBookings = [];
    foreach ($bookings as $booking) {
        $booking_post = get_post($booking['id']);
        
        if (!$booking_post) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Invalid booking ID: ' . $booking['id']
            ), 400);
        }
    
        $booking['time'] = get_post_meta($booking['id'], 'time', true);
        
        // Check if the booking is already booked
        $existing_thesis = get_post_meta($booking['id'], 'thesis', true);
        $existing_booked = get_post_meta($booking['id'], 'booked', true);
        
        if (!empty($existing_thesis) || $existing_booked === '1') {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Booking ' . $booking['id'] . ' is already booked'
            ), 400);
        }
    
        $processedBookings[] = $booking;
    }
    
    $bookings = $processedBookings;



    if (count($bookings) == 2) {
        // Find the earliest and latest booked times
        $sortedTimes = array_column($bookings, 'time');
        sort($sortedTimes);
        
        $timeDiff = (strtotime($sortedTimes[1]) - strtotime($sortedTimes[0])) / 3600; // Difference in hours
        
        if ($timeDiff != 1) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Bookings must be consecutive time slots'
            ), 400);
        }
    }

    $related_post_id = check_unique_code($unique_code);
    if ($related_post_id instanceof WP_REST_Response) {
        return $related_post_id;
    }

    // Get authors from related post
    if ($reverse_author) {
        $author1 = get_post_field('forfattare_2', $related_post_id);
        $author2 = get_post_field('forfattare_1', $related_post_id);
    } else {
        $author1 = get_post_field('forfattare_1', $related_post_id);
        $author2 = get_post_field('forfattare_2', $related_post_id);
    }

    // Validate time and author combinations
    if (empty($author2) && count($bookings) == 2) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'The second time slot must be empty'
        ), 400);
    }

    if (!empty($author2) && count($bookings) == 1) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'The second time slot must be provided'
        ), 400);
    }

    foreach ($bookings as $index => $booking) {
        update_post_meta($booking['id'], 'thesis', $related_post_id);
        update_post_meta($booking['id'], 'booked', '1');
        if ($index == 0) {
            update_post_meta($booking['id'], 'thesis_author', $author1);
        } else {
            update_post_meta($booking['id'], 'thesis_author', $author2);
        }
    }

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Bookings made successfully',
        'bookings' => $bookings,
    ), 200);
}
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
            $thesis_time1 = 'exjobb_' . $valid_time;

            // If time2 is provided, check if it's consecutive to time1
            if (!empty($time2)) {
                if (isset($valid_times[$index + 1]) && get_post_meta($post_id, $valid_times[$index + 1], true) == $time2) {
                    $time_meta_key2 = 'author_' . $valid_times[$index + 1];
                    $thesis_time2 = 'exjobb_' . $valid_times[$index + 1];
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
    if ($reverse_author) {
        $author1 = get_post_field('forfattare_2', $related_post_id);
        $author2 = get_post_field('forfattare_1', $related_post_id);
    } else {
        $author1 = get_post_field('forfattare_1', $related_post_id);
        $author2 = get_post_field('forfattare_2', $related_post_id);
    }

    // Validate the time and author combinations
    if (empty($author2) && !empty($time2)) {
        return new WP_REST_Response(array('message' => 'The second time slot must be empty'), 400);
    }

    if (!empty($author2) && empty($time2)) {
        return new WP_REST_Response(array('message' => 'The second time slot must be provided'), 400);
    }

    // Update the post meta with the retrieved author(s)
    update_post_meta($post_id, $time_meta_key1, sanitize_text_field($author1));
    update_post_meta($post_id, $thesis_time1, $related_post_id);

    if (!empty($time_meta_key2) && !empty($author2)) {
        update_post_meta($post_id, $time_meta_key2, sanitize_text_field($author2));
        update_post_meta($post_id, $thesis_time2, $related_post_id);
    }

    // Update the presentation_post_id in the examensarbete post

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

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/delete-booking', array(
        'methods' => 'DELETE',
        'callback' => 'delete_booking',
        'permission_callback' => '__return_true', // Adjust for better security
    ));
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/delete-all-bookings', array(
        'methods' => 'POST',
        'callback' => 'delete_all_bookings',
        'permission_callback' => '__return_true', // Adjust for better security
    ));
});

function delete_booking(WP_REST_Request $request) {
    $unique_code = $request->get_param('unique_code');
    $bookings = $request->get_param('bookings');

    if (empty($unique_code) || empty($bookings) || !is_array($bookings)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Invalid input parameters'
        ), 400);
    }

    $related_post_id = check_unique_code($unique_code);
    if ($related_post_id instanceof WP_REST_Response) {
        return $related_post_id;
    }

    #Loop through the bookings and delete the booking, also check so that the booking is actually booked by the related post
    foreach ($bookings as $booking) {
        $booking_post = get_post($booking['id']);
        
        if (!$booking_post) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Invalid booking ID: ' . $booking['id']
            ), 400);
        }
    
        $existing_thesis = get_post_meta($booking['id'], 'thesis', true);
        $existing_booked = get_post_meta($booking['id'], 'booked', true);
        $thesis_id = isset($existing_thesis['ID']) ? $existing_thesis['ID'] : null;
        
        if (empty($existing_thesis) || $existing_booked !== '1') {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Booking ' . $booking['id'] . ' is not booked'
            ), 400);
        }

        if ($thesis_id != $related_post_id) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Booking ' . $booking['id'] . ' is not booked by the related post'
            ), 400);
        }

        delete_post_meta($booking['id'], 'thesis');
        delete_post_meta($booking['id'], 'booked');
        delete_post_meta($booking['id'], 'thesis_author');
    }

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Bookings deleted successfully',
        'bookings' => $bookings,
    ), 200);
}

function delete_all_bookings(WP_REST_Request $request) {

    //Take unique code and find all bookings with that related post(get related post from unqiuecode) and delete all those bookings
    $unique_code = $request->get_param('unique_code');

    $related_post_id = check_unique_code($unique_code);
    if ($related_post_id instanceof WP_REST_Response) {
        return $related_post_id;
    }

    $args = array(
        'post_type' => 'booking',
        'meta_query' => array(
            array(
                'key' => 'thesis',
                'value' => $related_post_id,
                'compare' => '='
            )
        ),
        'posts_per_page' => -1
    );

    $query = new WP_Query($args);

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            delete_post_meta(get_the_ID(), 'thesis');
            delete_post_meta(get_the_ID(), 'booked');
            delete_post_meta(get_the_ID(), 'thesis_author');
        }
        wp_reset_postdata();
    }

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'All bookings deleted successfully',
    ), 200);


}

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