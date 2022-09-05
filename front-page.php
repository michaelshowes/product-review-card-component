<?php
/**
 * Home Page
 */
$context         = Timber::context();
$post            = Timber::get_post();
$context['post'] = $post;

Timber::render( 'src/pages/home.twig', $context );
