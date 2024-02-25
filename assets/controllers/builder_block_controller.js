import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'

export default class extends Controller {

    /**
     * The amount of padding (in pixels) for a block.
     *
     * @type {number}
     * @constant
     */
    blockPadding = 20

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
    currentBlockBtn = null

    /**
     * Connects the page builder headband to its listeners and performs necessary initialization tasks.
     *
     * @memberOf PageBuilderHeadband
     *
     * @returns {void}
     */
    connect() {
        this.listeners()
        this.headerIconListeners()
        const input = $(this.element).find('.npb-headband-input-block')
        this.resizeInput(input)
    }

    /**
     * Attaches event listeners to various elements.
     *
     * @returns {void}
     */
    listeners() {

        $(this.element).find('.npb-add-block').off();
        $(this.element).find('.npb-add-block').on('click', (e) => {

            if (e.currentTarget !== this.currentBlockBtn
                || $('.npb-fixed-modal').length === 0) {

                this.currentBlockBtn = e.currentTarget
                $(e.currentTarget).prop('disabled', true)
                $('.npb-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                this.mousePosition = {left: btnPosition.left + this.blockPadding, top: btnPosition.top + this.blockPadding}
                this.ajax('/neo-page-builder/fixed-modal', {type: 'block', isSpecial: $(this.element).closest('.npb-section-special').length > 0})
            }
        });

        if ($(this.element).closest('.npb-row-special').length > 0) {
            this.dragingLogic('.npb-row-special-section.npb-row-section-draggable', '.npb-section-special');
        }

        if ($(this.element).closest('.npb-row-normal').length > 0) {
            this.dragingLogic('.npb-row-normal.npb-row-section-draggable', '.npb-section-standard');
        }

        $(this.element).find('.npb-headband-input-block').off();
        $(this.element).find('.npb-headband-input-block').on('input', (e) => {
            this.resizeInput(e.currentTarget)
        });

        $(this.element).find('.npb-headband-input-block').on('focusout', (e) => {
            this.placeholderIfEmptyValue(e.currentTarget)
        });

        $(this.element).find('.npb-headband-header-expand').off();
        $(this.element).find('.npb-headband-header-expand').on('click', (e) => {
            this.expandElement(e.currentTarget);
        });
    }

    /**
     * Attaches click event listeners to the header icons in the headband container.
     */
    headerIconListeners() {

        $(this.element).find('.npb-headband-header-icon-container').off()
        $(this.element).find('.npb-headband-header-icon-container').on('click', (e) => {

            const elmt = e.currentTarget
            if ($(elmt).hasClass('npb-headband-header-icon-container-trash')
                && $(elmt).closest('.npb-block').length > 0) {

                $('#npb-tooltip').remove()
                const addBlockBtn = $(this.element).closest('.npb-section').find('.npb-initial-add-block-btn')[0]
                const blocks = $(this.element).closest('.npb-section').find('.npb-block')
                $(this.element).remove()

                if ($(blocks).length - 1 < 1) {
                    $(addBlockBtn).removeClass('npb-hide-initial-btn')
                }
            }
        })
    }

    /**
     * Sends an AJAX request to the specified URL with the provided JSON data.
     *
     * @param {string} url - The URL to send the AJAX request to.
     * @param {Object} json - The JSON data to send in the request body.
     * @param {string|null} container - The DOM element selector where the response HTML should be appended to.
     *                                 If null, the response data will be passed to the displayChoices method instead.
     * @param {string|null} after - The DOM element selector after which the response HTML should be inserted.
     *                              This parameter is only used if container is not null.
     * @return {void}
     */
    ajax(url, json, container = null, after = null) {
        $.post(url, json,  (data, status) => {
            if (status === 'success') {
                if (container !== null) {
                    if (after === null) {
                        $(container).append($(data))
                    } else {
                        $(data).insertAfter($(after))
                    }
                } else {
                    this.displayChoices(data)
                }
            } else {
                this.reportMessage('error', status)
            }
        })
    }

    /**
     * Reports a message of a given type and status.
     *
     * @param {string} type - The type of the message.
     * @param {string} status - The status of the message.
     */
    reportMessage(type, status) {
        console.log(status)
    }

    /**
     * Displays choices in a fixed modal on the page.
     *
     * @param {string} html - The HTML content to display in the fixed modal.
     */
    displayChoices(html) {

        $('#npb-wrapper').append(html)

        const width = $('.npb-fixed-modal').width();
        $('.npb-fixed-modal').css({left: this.mousePosition.left - (width / 2), top: this.mousePosition.top})

        $('.npb-fixed-modal-close-wrapper').off()
        $('.npb-fixed-modal-close-wrapper').on('click', () => {
            $('.npb-fixed-modal').remove()
            $(this.currentBlockBtn).prop('disabled', false)
            this.currentBlockBtn = null
        })

        $('.npb-fixed-modal-sections-choices-examples[data-model]').off()
        $('.npb-fixed-modal-sections-choices-examples[data-model]').on('click', (e) => {
            const model = $(e.currentTarget).data('model');
            $('.npb-fixed-modal').remove()
            $(this.currentBlockBtn).prop('disabled', false)
            this.currentBlockBtn = null

            const container = '#' + $(this.element)
                .closest('.npb-section')
                .attr('id');

            const iteration = $(this.element)
                .closest('.npb-section')
                .find('.npb-block')
                .length

            this.ajax(
                '/neo-page-builder/block',
                {
                    iteration: iteration,
                    pattern: model,
                    type: $(this.element)
                        .closest('.npb-row-special-section')
                        .length > 0
                        ? 'special'
                        : 'standard'
                },
                container,
                $(this.element)
            )
        })
    }

    /**
     * Performs drag and drop logic on given elements.
     *
     * @param {string} classes - The CSS class selector for the elements to apply drag and drop logic.
     * @param {string} items - The CSS selector for the draggable items within the elements.
     * @return {void}
     */
    dragingLogic(classes, items) {
        const elmts = $(classes);
        if (elmts.length > 0) {
            let ids = [];
            $(elmts).each(function () {
                ids.push('#' + $(this).attr('id'));
            });
            let option = {
                placeholder: 'npb-block-placeholder',
                items: items,
                handle: '.npb-headband',
                start: function(e, ui ){
                    $(ui.placeholder).css('height', ui.helper.outerHeight())
                    $(ui.item).css('opacity', 0.5)
                },
                stop: (e, ui ) => {
                    if ($(ui.item).data('type') === 'full'
                        && $(ui.item).closest('.npb-row-full').length > 0) {
                        $(ids.join(', ')).sortable('cancel')
                    }
                    $(ui.item).css('opacity', 1)
                    this.checkEmptyRows()
                }
            }
            if (ids.length > 0) {
                option.connectWith = classes
            }
            $(ids.join(', ')).sortable(option).disableSelection()
        }
    }

    /**
     * Resize input element based on its value length.
     *
     * @param {HTMLElement} input - The input element to resize.
     */
    resizeInput(input) {
        let len = ($(input).val().length + 1) * 8 + 'px'
        $(input).css('width', len)
    }

    /**
     * Sets a default value to the input if it is empty.
     * If the input element has no value, the method will set the value to 'section' and resize the input.
     *
     * @param {HTMLElement} input - The input element to check and modify.
     * @return {void}
     */
    placeholderIfEmptyValue(input) {
        let len = $(input).val().length
        if (len === 0) {
            $(input).val('section')
            this.resizeInput(input)
        }
    }
}
