<?php

namespace App\IntegrityChecks;

use App\IntegrityChecks\Constants;

class PatternValidator
{
    /**
     * Validates a given pattern against a specific type.
     *
     * @param string $pattern The pattern to validate.
     * @param string $type The type against which the pattern should be validated.
     *
     * @return bool Returns true if the pattern is valid for the given type, false otherwise.
     */
    public static function patternValidation(string $pattern, string $type, bool $isFullScreen = false): bool
    {
        $reference = match ($type) {
            'row' => Constants::ROW_TYPES,
            'section' => Constants::SECTION_TYPES,
            'block' => $isFullScreen === true ? Constants::BLOCK_FULLSCREEN_TYPES : Constants::BLOCK_TYPES,
        };
        if ($type === 'block') {
            return in_array($pattern, $reference, true);
        }
        $patterns = array_keys($reference);
        return in_array($pattern, $patterns, true);
    }

    /**
     * Retrieves the configuration for a given pattern and type.
     *
     * @param string $pattern The pattern to retrieve the configuration for.
     * @param string $type The type to retrieve the configuration for.
     *
     * @return array The configuration for the provided pattern and type.
     */
    public static function getPatternConfig(string $pattern, string $type): array
    {
        return match ($type) {
            'row' => Constants::ROW_TYPES[$pattern],
            'section' => Constants::SECTION_TYPES[$pattern],
            'block' => Constants::BLOCK_TYPES[$pattern],
        };
    }

    /**
     * Returns the pattern based on the provided pattern name and type.
     *
     * This method takes a pattern name and type as input and returns the corresponding pattern.
     * The type should be one of the following: 'row', 'section', or 'block'.
     * The pattern name should exist in the Constants class for the specified type.
     *
     * @param string $pattern The name of the pattern to retrieve.
     * @param string $type The type of pattern to retrieve.
     * @return string The pattern corresponding to the provided name and type.
     * If the pattern name is found for the given type, the pattern name will be returned.
     * If the pattern name is not found for the given type, the string 'normal' will be returned.
     */
    public static function getPattern(string $pattern, string $type): string
    {
        $reference = match ($type) {
            'row' => Constants::ROW_TYPES,
            'section' => Constants::SECTION_TYPES,
            'block' => Constants::BLOCK_TYPES,
        };

        return isset($reference[$pattern]) ? $pattern : 'normal';
    }

    /**
     * Returns the complexity level of a section based on the provided pattern.
     *
     * This method takes a pattern name as input and determines the complexity level of the section.
     * The pattern should be one of the special types defined in the Constants class for sections.
     *
     * @param string $pattern The name of the pattern to analyze.
     * @return string The complexity level of the section determined by the provided pattern.
     * If the pattern is one of the special types defined in the Constants class for sections, the string 'simple' will be returned.
     * If the pattern is not one of the special types defined in the Constants class for sections, the string 'complex' will be returned.
     */
    public static function sectionComplexityLevel(string $pattern): string
    {
        return in_array($pattern, Constants::SECTION_SPECIAL_TYPE, true) ? 'simple' : 'complex';
    }
}