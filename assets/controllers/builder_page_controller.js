import { Controller } from '@hotwired/stimulus';

export default class extends Controller {

    /**
     * Represents the current position of the mouse.
     *
     * @type {Object} MousePosition
     * @property {number} left - The distance in pixels from the left edge of the screen to the mouse cursor.
     * @property {number} top - The distance in pixels from the top edge of the screen to the mouse cursor.
     */
    mousePosition = {left: 0, top: 0}

    /**
     * The variable representing the current row button.
     * @type {null}
     */
    currentRowBtn = null

    /**
     * Connects to [data-controller="builder_page"].
     *
     * @return {void}
     */
    connect() {
        this.listeners()
    }

    /**
     * Attaches a click event listener to the initial add row button.
     * When clicked, it performs certain actions and triggers an AJAX request to retrieve a fixed modal.
     */
    listeners() {

        $(this.element).find('#npb-initial-add-row-btn button').off();
        $(this.element).find('#npb-initial-add-row-btn button').on('click', (e) => {

            if (e.currentTarget !== this.currentRowBtn || $('.npb-fixed-modal').length === 0) {

                this.currentRowBtn = e.currentTarget
                $(e.currentTarget).prop('disabled', true)
                $('.npb-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                this.mousePosition = {left: btnPosition.left + 20, top: btnPosition.top + 20}
                this.ajax('/neo-page-builder/fixed-modal', {type: 'row'})
            }
        });
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
                '#npb-rows-wrapper'
            )
        })
    }

    /**
     * Perform an AJAX request using the POST method.
     *
     * @param {string} url - The URL to send the request to.
     * @param {Object} json - The JSON data to send along with the request.
     * @param {string|null} container - The selector for the container element where the response data should be appended, or null if the response should be handled differently.
     *
     * @return {void}
     */
    ajax(url, json, container = null) {

        $.post(url, json,  (data, status) => {
            if (status === 'success') {
                if (container !== null) {
                    $(container).append($(data))
                    $(this.element).find('#npb-initial-add-row-btn').addClass('npb-hide-initial-btn')
                } else {
                    this.displayChoices(data)
                }
            } else {
                this.reportMessage('error', status)
            }
        })
    }

    /**
     * Reports a message.
     *
     * @param {string} type - The type of the message.
     * @param {string} status - The status of the message.
     *
     * @return {undefined} - No value is returned.
     */
    reportMessage(type, status) {
        console.log(status)
    }
}
