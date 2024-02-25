import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'

export default class extends Controller {

    /**
     * This variable represents the padding value (in pixels) for a row.
     * It is used to add spacing between rows in a layout or table.
     *
     * @type {number}
     * @default 20
     * @since 1.0.0
     */
    rowPadding = 20

    /**
     * This variable represents the padding value (in pixels) for a section.
     * It is used to add spacing between sections in a layout or table.
     *
     * @type {number}
     * @default 20
     * @since 1.0.0
     */
    sectionPadding = 20

    /**
     * Represents the current position of a mouse.
     *
     * @type {Object} MousePosition
     * @property {number} left - The horizontal position of the mouse, relative to the left side of the screen.
     * @property {number} top - The vertical position of the mouse, relative to the top side of the screen.
     */
    mousePosition = {left: 0, top: 0}

    /**
     * Represents the button that corresponds to the current section.
     *
     * @type {HTMLElement|null}
     */
    currentSectionBtn = null

    /**
     * Represents a variable storing the current row button element.
     *
     * @type {HTMLElement|null}
     */
    currentRowBtn = null

    /**
     * Connects to [data-controller="builder_row"].
     *
     * Attach event listeners and resize input element.
     * @function
     *
     * @memberOf ClassName
     * @name connect
     *
     * @returns {void}
     */
    connect() {
        this.listeners()
        this.headerIconListeners()
        const input = $(this.element).find('.npb-headband-input-row')
        this.resizeInput(input)
    }

    /**
     * Attaches event listeners to various elements.
     *
     * @returns {void}
     */
    listeners() {

        $(this.element).find('.add-row').off();
        $(this.element).find('.add-row').on('click', (e) => {

            if (e.currentTarget !== this.currentRowBtn
                || $('.npb-fixed-modal').length === 0) {

                this.currentRowBtn = e.currentTarget
                $(e.currentTarget).prop('disabled', true)
                $('.npb-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                this.mousePosition = {left: btnPosition.left + this.rowPadding, top: btnPosition.top + this.rowPadding}
                this.ajax('/neo-page-builder/fixed-modal', {type: 'row'})
            }
        });

        $(this.element).find('.npb-initial-add-section-btn .add-section').off();
        $(this.element).find('.npb-initial-add-section-btn .add-section').on('click', (e) => {

            if (e.currentTarget !== this.currentSectionBtn
                || $('.npb-fixed-modal').length === 0) {

                this.currentSectionBtn = e.currentTarget
                $(e.currentTarget).prop('disabled', true)
                $('.npb-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                this.mousePosition = {left: btnPosition.left + this.sectionPadding, top: btnPosition.top + this.sectionPadding}
                this.ajax('/neo-page-builder/fixed-modal', {type: 'section', isSpecial: $(this.element).hasClass('npb-row-special')})
            }
        });

        this.dragingLogic('#npb-rows-wrapper');

        $(this.element).find('.npb-headband-input-row').off();
        $(this.element).find('.npb-headband-input-row').on('input', (e) => {
            this.resizeInput(e.currentTarget)
        });

        $(this.element).find('.npb-headband-input-row').on('focusout', (e) => {
            this.placeholderIfEmptyValue(e.currentTarget)
        });

        $(this.element).find('.npb-headband-header-expand').off();
        $(this.element).find('.npb-headband-header-expand').on('click', (e) => {
            this.expandElement(e.currentTarget);
        });

        if ($(this.element).find('.npb-section').length === 0 && $(this.element).hasClass('npb-new-row')) {
            this.autoAddSection()
        }
    }

    /**
     * Attach click event listeners to header icons in the headband.
     */
    headerIconListeners() {

        $(this.element).find('.npb-headband-header-icon-container').off()
        $(this.element).find('.npb-headband-header-icon-container').on('click', (e) => {

            const elmt = e.currentTarget
            if ($(elmt).hasClass('npb-headband-header-icon-container-trash')
                && $(elmt).closest('.npb-row').length > 0) {

                $('#npb-tooltip').remove()
                $(this.element).remove()
                if ($('#npb-rows-wrapper').children().length === 0) {
                    const addRowBtn = $('#npb-initial-add-row-btn')[0]
                    $(addRowBtn).removeClass('npb-hide-initial-btn')
                }
            }
        })
    }

    /**
     * Automatically opens the section selection modal when adding a row.
     *
     * @method autoAddSection
     * @returns {void}
     */
    autoAddSection() {

        const addSectionBtn = $(this.element).find('.npb-initial-add-section-btn .add-section')
        if (addSectionBtn.length > 0) {
            $(this.element).removeClass('npb-new-row')
            const addSectionPosition = $(addSectionBtn[0]).offset()

            this.currentSectionBtn = addSectionBtn[0]
            $(addSectionBtn).prop('disabled', true)
            $('.npb-fixed-modal').remove()

            this.mousePosition = {top: addSectionPosition.top + this.rowPadding, left: addSectionPosition.left + this.rowPadding}
            this.ajax('/neo-page-builder/fixed-modal', {type: 'section', isSpecial: $(this.element).hasClass('npb-row-special')})
        }
    }

    /**
     * Makes an AJAX request to the specified URL with the provided JSON data.
     *
     * @param {string} url - The URL to send the request to.
     * @param {object} json - The JSON data to include in the request.
     * @param {string|null} container - The HTML container to append the response to. If null, the response is handled differently.
     * @param {string|null} after - The HTML element to insert the response after, if container is not null.
     * @return {void}
     */
    ajax(url, json, container = null, after = null, type = 'row') {

        $.post(url, json,  (data, status) => {
            if (status === 'success') {
                if (container !== null) {
                    if (after === null) {
                        $(container).append($(data))
                        if (type === 'section') {
                            $(this.element).find('.npb-initial-add-section-btn').addClass('npb-hide-initial-btn')
                        }
                    } else {
                        $(data).insertAfter($(after))
                    }
                } else {
                    this.displayChoices(data)
                }
            } else {
                this.reportMessage('type', status)
            }
        })
    }

    /**
     * Reports a message with the given type and status.
     *
     * @param {string} type - The type of the message.
     * @param {string} status - The status of the message.
     *
     * @return {undefined}
     */
    reportMessage(type, status) {
        console.log(status)
    }

    /**
     * Display choices in a fixed modal.
     * @param {string} html - The HTML content to be appended to the page builder wrapper.
     * @return {void}
     */
    displayChoices(html) {

        $('#npb-wrapper').append(html)

        const width = $('.npb-fixed-modal').width();
        $('.npb-fixed-modal').css({left: this.mousePosition.left - (width / 2), top: this.mousePosition.top})

        $('.npb-fixed-modal-close-wrapper').off()
        $('.npb-fixed-modal-close-wrapper').on('click', () => {
            $('.npb-fixed-modal').remove()
            $(this.currentRowBtn).prop('disabled', false)
            this.currentRowBtn = null
            $(this.currentSectionBtn).prop('disabled', false)
            this.currentSectionBtn = null
        })

        $('.npb-fixed-modal-choices-examples-special').off()
        $('.npb-fixed-modal-choices-examples-special').on('click', (e) => {
            $(e.currentTarget).parent().children().addClass('npb-fixed-modal-hide-elements')
            $('.npb-fixed-modal-choices-examples-special-details').removeClass('npb-fixed-modal-hide-elements')
            $('.npb-fixed-modal-title svg').removeClass('npb-fixed-modal-hide-elements')
        })

        $('.npb-fixed-modal-title svg').off()
        $('.npb-fixed-modal-title svg').on('click', () => {
            $('.npb-fixed-modal-choices-examples-special').parent().children().removeClass('npb-fixed-modal-hide-elements')
            $('.npb-fixed-modal-choices-examples-special-details').addClass('npb-fixed-modal-hide-elements')
            $('.npb-fixed-modal-title svg').addClass('npb-fixed-modal-hide-elements')
        })

        $('.npb-fixed-modal-choices-examples[data-model]').off()
        $('.npb-fixed-modal-choices-examples[data-model]').on('click', (e) => {
            const model = $(e.currentTarget).data('model');
            $('.npb-fixed-modal').remove()
            $(this.currentRowBtn).prop('disabled', false)
            this.currentRowBtn = null
            this.ajax(
                '/neo-page-builder/row',
                {pattern: model},
                '#npb-rows-wrapper',
                $(this.element)
            )
        })

        $('.npb-fixed-modal-sections-choices-examples[data-model]').off()
        $('.npb-fixed-modal-sections-choices-examples[data-model]').on('click', (e) => {
            const model = $(e.currentTarget).data('model');
            $('.npb-fixed-modal').remove()
            $(this.currentSectionBtn).prop('disabled', false)
            this.currentSectionBtn = null
            const container = $(this.element).find('.npb-row-special-section').length === 0
                ? '#' + $(this.element).attr('id') + ':not(.npb-row-special-section)'
                : '#' + $(this.element).attr('id') + ' .npb-row-special-section';
            this.ajax(
                '/neo-page-builder/section',
                {
                    pattern: model,
                    type: $(this.element).find('.npb-row-special-section').length === 0 ? 'standard' : 'special'
                },
                container,
                null,
                'section'
            )
        })
    }

    /**
     * Dragging logic for elements with specified classes.
     *
     * @param {string} classes - The classes of elements to enable dragging on.
     * @param {null|Array} items - Optional. The items to be dragged. Default is null.
     *
     * @return {void}
     */
    dragingLogic(classes, items = null) {
        const elmts = $(classes);
        if (elmts.length > 0) {
            let ids = [];
            $(elmts).each(function () {
                ids.push('#' + $(this).attr('id'));
            });
            let option = {
                placeholder: 'npb-placeholder',
                handle: '.npb-headband',
                start: function(e, ui ){
                    let classe = 'npb-placeholder-row-normal'
                    if ($(ui.item).hasClass('npb-row-full')) {
                        classe = 'npb-placeholder-row-full'
                    } else if ($(ui.item).hasClass('npb-row-special')) {
                        classe = 'npb-placeholder-row-special'
                    }
                    $(ui.placeholder).css('height', ui.helper.outerHeight()).addClass(classe)
                    $(ui.item).css('opacity', 0.5)
                },
                stop: function(e, ui ){
                    $(ui.item).css('opacity', 1)
                }
            }
            if (ids.length > 0) {
                option.connectWith = classes;
            }
            $(ids.join(', ')).sortable(option).disableSelection();
        }
    }

    /**
     * Resizes the width of the input element based on its value length.
     *
     * @param {string} input - The input element to resize.
     * @return {undefined}
     */
    resizeInput(input) {
        let len = ($(input).val().length + 1) * 8 + 'px'
        $(input).css('width', len)
    }

    /**
     * Sets a placeholder value if the input field is empty.
     * If the input field is empty, it sets the value to 'row' and triggers the resizeInput() method.
     *
     * @param {string|object} input - The input field element or its selector.
     */
    placeholderIfEmptyValue(input) {
        let len = $(input).val().length
        if (len === 0) {
            $(input).val('row')
            this.resizeInput(input)
        }
    }

    /**
     * Expands or collapses the specified element.
     *
     * @param {Element} elmt - The element to expand or collapse.
     */
    expandElement(elmt) {
        if ($(elmt).attr('aria-expanded') === 'true') {
            $(elmt).attr('aria-expanded', 'false')
            $(this.element).closest('.npb-row').addClass('npb-hide-expanded')
        } else {
            $(elmt).attr('aria-expanded', 'true')
            $(this.element).closest('.npb-row').removeClass('npb-hide-expanded')
        }
    }
}
