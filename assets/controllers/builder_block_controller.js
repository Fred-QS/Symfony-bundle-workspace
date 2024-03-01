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
     * Represents the button that corresponds to the current header button.
     *
     * @type {HTMLElement|null}
     */
    currentHeaderBtn = null

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

        if ($(this.element).closest('.npb-row-full').length > 0) {
            this.dragingLogic('.npb-row-full .npb-blocks-draggable-container', '.npb-block-fullscreen');
        } else if ($(this.element).closest('.npb-section').length > 0 || $(this.element).closest('.npb-blocks-wrapper').length > 0) {
            this.dragingLogic('.npb-row:not(.npb-row-full) .npb-blocks-draggable-container', '.npb-block-regular');
        }

        $(this.element).find('.npb-headband-input-block').off();
        $(this.element).find('.npb-headband-input-block').on('input', (e) => {
            this.resizeInput(e.currentTarget)
        });

        $(this.element).find('.npb-headband-input-block').on('focusout', (e) => {
            this.placeholderIfEmptyValue(e.currentTarget)
        });
    }

    /**
     * Attaches click event listeners to the header icons in the headband container.
     */
    headerIconListeners() {

        $(this.element).find('.npb-headband-header-icon-container').off('click')
        $(this.element).find('.npb-headband-header-icon-container').on('click', (e) => {

            const elmt = e.currentTarget
            if ($(elmt).hasClass('npb-headband-header-icon-container-trash')
                && $(elmt).closest('.npb-block').length > 0
            ) {

                $('#npb-tooltip').remove()
                const addBlockBtn = $(this.element).closest('.npb-section').find('.npb-initial-add-block-btn')[0]
                const blocks = $(this.element).closest('.npb-section').find('.npb-block')
                $(this.element).remove()

                if ($(blocks).length - 1 < 1) {
                    $(addBlockBtn).removeClass('npb-hide-initial-btn')
                }

            } else if ($(elmt).hasClass('npb-headband-header-icon-container-save')
                || $(elmt).hasClass('npb-headband-header-icon-container-dots')
            ) {

                if (elmt !== this.currentHeaderBtn || $('.npb-fixed-modal').length === 0) {

                    if (this.currentHeaderBtn !== null) {
                        $(this.currentHeaderBtn).prop('disabled', false);
                    }

                    this.currentHeaderBtn = elmt
                    $(elmt).prop('disabled', true)
                    $('.npb-fixed-modal').remove()

                    const btnPosition = $(elmt).offset()
                    const npbContainerTop = $('#npb').offset().top
                    this.mousePosition = {
                        left: btnPosition.left + this.blockPadding - 5,
                        top: btnPosition.top - npbContainerTop
                    }

                    const uuid = $(elmt).closest('[data-uuid]').attr('data-uuid')
                    $.post(
                        '/neo-page-builder/header-fixed-modal',
                        {type: $(elmt).hasClass('npb-headband-header-icon-container-save') ? 'save' : 'dots', uuid},
                        (data, status) => {
                            if (status === 'success') {
                                this.displayModal(data, elmt)
                            } else {
                                this.reportMessage('error', status)
                            }
                        }
                    )
                }
            }
        })
    }

    /**
     * Sends an AJAX request to the specified URL with the provided JSON data.
     *
     * @param {string} url - The URL to send the AJAX request to.
     * @param {Object} json - The JSON data to send in the request body.
     * @param {Element} elmt - The triggered button element.
     * @return {void}
     */
    ajax(url, json, elmt) {
        $.post(url, json,  (data, status) => {
            if (status === 'success') {
                this.displayModal(elmt)
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

    displayModal(html, elmt) {

        $('#npb-wrapper').append(html)

        const width = $('.npb-fixed-modal').width();
        const position = {
            left: this.mousePosition.left - (width / 2),
            top: this.mousePosition.top
        }

        if (this.mousePosition.left + width / 2 > $('#npb-wrapper').width()) {
            position.left = $('#npb-wrapper').width() - width + this.blockPadding
            $('.npb-fixed-modal').removeClass('nbp-fixed-modal-leftside').addClass('nbp-fixed-modal-rightside')
        }

        if (this.mousePosition.left - width / 2 < this.blockPadding * 2) {
            position.left = this.blockPadding
            $('.npb-fixed-modal').addClass('nbp-fixed-modal-leftside').removeClass('nbp-fixed-modal-rightside')
        }

        const pad = $('#npb-fixed-modal-header-action').length > 0 ? 3 : 10
        position['--npb-left-value'] = ($(elmt).offset().left - position.left + pad) + 'px'

        $('.npb-fixed-modal')
            .css(position)
            .attr('data-ref', $(elmt).attr('id'))

        this.modalPosition()

        $(window).on('resize', () => {

            if ($('.npb-fixed-modal').length > 0
                && elmt !== null
                && $(elmt).attr('id') === $('.npb-fixed-modal').attr('data-ref')
            ) {

                const npbContainerTop = $('#npb').offset().top
                let size = $(elmt).offset()
                const position = {
                    left: size.left - (width / 2) + this.blockPadding,
                    top: size.top + this.blockPadding - npbContainerTop
                }

                if ($('#npb-fixed-modal-header-action').length > 0) {
                    position.left -= 5
                }

                if (size.left + width / 2 > $('#npb-wrapper').width()) {
                    position.left = $('#npb-wrapper').width() - width + this.blockPadding
                    $('.npb-fixed-modal').removeClass('nbp-fixed-modal-leftside').addClass('nbp-fixed-modal-rightside')
                }

                if (size.left - width / 2 < this.blockPadding) {
                    position.left = this.blockPadding
                    $('.npb-fixed-modal').addClass('nbp-fixed-modal-leftside').removeClass('nbp-fixed-modal-rightside')
                }

                const padLeft = $('#npb-fixed-modal-header-action').length > 0 ? 3 : 10
                const padTop = $('#npb-fixed-modal-header-action').length > 0 ? 20 : 0

                position.top -= padTop
                position['--npb-left-value'] = ($(elmt).offset().left - position.left + padLeft) + 'px'

                $('.npb-fixed-modal').css(position)
            }
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
                placeholder: $(this.element).hasClass('npb-block-fullscreen') ? 'npb-block-placeholder-fullscreen' : 'npb-block-placeholder-regular',
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
        let len = (($(input).val().length + 1) * 8 + 20) + 'px'
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

    /**
     * The modal will be dynamically positioned either above or below the scroll target based on its visibility in the viewport.
     *
     * @returns {void}
     */
    modalPosition() {

        const modal = $('.npb-fixed-modal')
        if (modal.length > 0) {
            const windowHeight = window.innerHeight
            const modalPosY = $(modal).offset().top
            const modalHeight = $(modal).height()
            if (modalPosY + modalHeight > windowHeight
            ) {
                $(modal).addClass('npb-fixed-modal-above-target')
            } else {
                $(modal).removeClass('npb-fixed-modal-above-target')
            }
        }
    }
}
