<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Formatting
    |--------------------------------------------------------------------------
    |
    | This file is for various settings for formatting of data in the CMS.
    |
    | This can range from data entry, to display data visually in complex structures.
    |
    */

    /* Date formatting */
    'df' => [

        /* Carbon */
        'default' => [
            'entry' => [
                'date' => 'Y-m-d', // 1975-12-25
                'dateTime' => 'Y-m-d H:i:s' // 1975-12-25 14:15:16
            ],
            'display' => [
                'date' => 'M d, Y', // Dec 25, 1975
                'dateTime' => 'M d, Y g:iA' // Dec 25, 1975 2:15 PM
            ]
        ],

        /* en-GB */
        'british' => [
            'entry' => [
                'date' => 'd/m/Y', // 25/12/1975
                'dateTime' => 'd/m/Y H:i:s' // 25/12/1975 14:15:16
            ],
            'display' => [
                'date' => 'jS M Y', // 25th Dec 1975
                'dateTime' => 'jS M Y g:ia' // 25th Dec 1975 2:00pm
            ]
        ]
    ],

];
