<?php

namespace App\IntegrityChecks;

class Constants
{
    /**
     * Constants representing different row types with their configurations.
     *
     * The ROW_TYPES array holds configurations for various row types. Each row type is represented by a key,
     * with the value being an array of blocks and sections. Each block or section is represented as an associative array,
     * with 'type' indicating the type of the element and 'size' indicating the size of the element.
     *
     * Available row types:
     * - 'full': a row with a single block occupying 100% of the width.
     * - 'normal': a row with a single section occupying 100% of the width.
     * - 'special-pattern-a': a row with a section occupying 50% of the width and a block occupying the remaining 50%.
     * - 'special-pattern-b': a row with a block occupying 50% of the width and a section occupying the remaining 50%.
     * - 'special-pattern-c': a row with a section occupying 75% of the width and a block occupying the remaining 25%.
     * - 'special-pattern-d': a row with a block occupying 25% of the width and a section occupying the remaining 75%.
     * - 'special-pattern-e': a row with a block occupying 25% of the width, a section occupying 50% of the width,
     *                         and another block occupying the remaining 25% of the width.
     * - 'special-pattern-f': a row with a block occupying 25% of the width, another block occupying 25% of the width,
     *                         and a section occupying the remaining 50% of the width.
     * - 'special-pattern-g': a row with a section occupying 50% of the width, a block occupying 25% of the width,
     *                         and another block occupying the remaining 25% of the width.
     * - 'special-pattern-h': a row with a section occupying approximately 66.66% of the width and a block occupying
     *                         approximately 33.33% of the width.
     * - 'special-pattern-i': a row with a block occupying approximately 33.33% of the width and a section occupying
     *                         approximately 66.66% of the width.
     *
     * @var array
     */
    public const ROW_TYPES = [
        'full' => [
            ['type' => 'blocks', 'size' => 100]
        ],
        'normal'  => [
            ['type' => 'section', 'size' => 100]
        ],
        'special-pattern-a'  => [
            ['type' => 'section', 'size' => 50],
            ['type' => 'blocks', 'size' => 50]
        ],
        'special-pattern-b'  => [
            ['type' => 'blocks', 'size' => 50],
            ['type' => 'section', 'size' => 50]
        ],
        'special-pattern-c'  => [
            ['type' => 'section', 'size' => 75],
            ['type' => 'blocks', 'size' => 25]
        ],
        'special-pattern-d'  => [
            ['type' => 'blocks', 'size' => 25],
            ['type' => 'section', 'size' => 75]
        ],
        'special-pattern-e'  => [
            ['type' => 'blocks', 'size' => 25],
            ['type' => 'section', 'size' => 50],
            ['type' => 'blocks', 'size' => 25]
        ],
        'special-pattern-f'  => [
            ['type' => 'blocks', 'size' => 25],
            ['type' => 'blocks', 'size' => 25],
            ['type' => 'section', 'size' => 50]
        ],
        'special-pattern-g'  => [
            ['type' => 'section', 'size' => 50],
            ['type' => 'blocks', 'size' => 25],
            ['type' => 'blocks', 'size' => 25]
        ],
        'special-pattern-h'  => [
            ['type' => 'section', 'size' => 66.6666],
            ['type' => 'blocks', 'size' => 33.3333]
        ],
        'special-pattern-i'  => [
            ['type' => 'blocks', 'size' => 33.3333],
            ['type' => 'section', 'size' => 66.6666]
        ]
    ];

    /**
     * Constant array containing different patterns of sections.
     *
     * Each pattern is represented as a key-value pair, where the key is the pattern name
     * and the value is an array containing the width percentages of each section in the pattern.
     *
     * @var array
     */
    public const SECTION_TYPES = [
        'pattern-a'  => [100],
        'pattern-b'  => [50, 50],
        'pattern-c'  => [33.3333, 33.3333, 33.3333],
        'pattern-d'  => [25, 25, 25, 25],
        'pattern-e'  => [20, 20, 20, 20, 20],
        'pattern-f'  => [16.6666, 16.6666, 16.6666, 16.6666, 16.6666, 16.6666],
        'pattern-g'  => [33.3333, 66.6666],
        'pattern-h'  => [66.6666, 33.3333],
        'pattern-i'  => [25, 75],
        'pattern-j'  => [75, 25],
        'pattern-k'  => [20, 80],
        'pattern-l'  => [80, 20],
        'pattern-m'  => [25, 50, 25],
        'pattern-n'  => [20, 60, 20],
        'pattern-o'  => [25, 25, 50],
        'pattern-p'  => [50, 25, 25],
        'pattern-q'  => [20, 20, 60],
        'pattern-r'  => [60, 20, 20],
        'pattern-s'  => [16.6666, 16.6666, 16.6666, 50],
        'pattern-t'  => [50, 16.6666, 16.6666, 16.6666]
    ];

    public const BLOCK_TYPES = [

    ];

    public const SECTION_SPECIAL_TYPE = ['pattern-a', 'pattern-b', 'pattern-c'];
}