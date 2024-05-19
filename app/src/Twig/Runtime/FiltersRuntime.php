<?php

namespace App\Twig\Runtime;

use App\IntegrityChecks\Constants;
use Twig\Extension\RuntimeExtensionInterface;
use Symfony\Component\Uid\Uuid;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Request;

class FiltersRuntime implements RuntimeExtensionInterface
{
    public function __construct()
    {
        // Inject dependencies if needed
    }

    /**
     * Retrieves the current timestamp in the format of a UUID version 4.
     *
     * @return string The current timestamp represented as a UUID version 4.
     */
    public function getTimestamp(): string
    {
        return Uuid::v4();
    }

    /**
     * Retrieves the block choices based on the specified screen mode.
     *
     * @param bool $isFullScreen Specifies whether the screen is in full-screen mode.
     *                           - true: Full-screen mode
     *                           - false: Normal mode
     *
     * @return array The array of block choices based on the screen mode.
     */
    public function getBlockChoices(bool $isFullScreen): array
    {
        return $isFullScreen === true ? Constants::BLOCK_FULLSCREEN_TYPES : Constants::BLOCK_TYPES;
    }

    /**
     * Humanizes the given string by replacing dashes and underscores with spaces and capitalizing the first letter.
     *
     * @param string $string The string to be humanized.
     *
     * @return string The humanized string.
     */
    public function humanizeChars(string $string): string
    {
        $cleaner = str_replace(['-', '_'], ' ', $string);
        return ucfirst($cleaner);
    }

    /**
     * Retrieves the revisions from the specified JSON string.
     *
     * @param string|null $revisions The JSON string containing the revisions.
     * @return array|null The array of revisions or null if the JSON is invalid.
     */
    public function getRevisions(string|null $revisions): array|null
    {
        return json_decode($revisions, true);
    }

    public function parseTimestamp(string $timestamp, string $locale): string
    {
        $year = substr($timestamp, 0, 4);
        $month = substr($timestamp, 4, 2);
        $date = substr($timestamp, 6, 2);
        $hour = substr($timestamp, 8, 2);
        $minutes = substr($timestamp, 10, 2);
        $seconds = substr($timestamp, 12, 2);
        $formatted = sprintf('%s-%s-%s %s:%s:%s', $year, $month, $date, $hour, $minutes, $seconds);
        return lcfirst(Carbon::parse($formatted)->locale($locale)->calendar());
    }
}
