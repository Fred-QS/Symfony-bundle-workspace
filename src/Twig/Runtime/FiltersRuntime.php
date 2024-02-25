<?php

namespace App\Twig\Runtime;

use Twig\Extension\RuntimeExtensionInterface;
use Symfony\Component\Uid\Uuid;

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
}
