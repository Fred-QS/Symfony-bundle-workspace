<?php

namespace App\Twig\Extension;

use App\Twig\Runtime\FiltersRuntime;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class FiltersExtension extends AbstractExtension
{
    /**
     * Returns an array of TwigFilter objects.
     *
     * @return array An array of TwigFilter objects.
     *
     * This method returns an array of TwigFilter objects that define
     * the available filters in the Twig template engine. Each TwigFilter
     * object represents a filter and its corresponding callback function or method.
     *
     * The array returned by this method should be assigned to the filters
     * property of a Twig_Environment or Twig_Extension object in order to
     * register the available filters.
     *
     * Please note that if your filter generates SAFE HTML, you should
     * add a third parameter to the filter declaration: ['is_safe' => ['html']].
     * This will prevent the automatic escaping of HTML content.
     *
     * For more information, please refer to the Twig documentation
     * at https://twig.symfony.com/doc/3.x/advanced.html#automatic-escaping.
     *
     * @see TwigFilter
     */
    public function getFilters(): array
    {
        return [
            // If your filter generates SAFE HTML, you should add a third
            // parameter: ['is_safe' => ['html']]
            // Reference: https://twig.symfony.com/doc/3.x/advanced.html#automatic-escaping
            new TwigFilter('humanize_chars', [FiltersRuntime::class, 'humanizeChars']),
        ];
    }

    /**
     * Returns an array of TwigFunction objects.
     *
     * @return array An array of TwigFunction objects.
     *
     * This method returns an array of TwigFunction objects that define
     * the available functions in the Twig template engine. Each TwigFunction
     * object represents a function and its corresponding callback function or method.
     *
     * The array returned by this method should be assigned to the functions
     * property of a Twig_Environment or Twig_Extension object in order to
     * register the available functions.
     *
     * @see TwigFunction
     */
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_timestamp', [FiltersRuntime::class, 'getTimeStamp']),
            new TwigFunction('get_block_choices', [FiltersRuntime::class, 'getBlockChoices']),
        ];
    }
}
