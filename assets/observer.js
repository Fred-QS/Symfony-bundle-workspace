initDomObserver();
let fixedModalTimeout;
let page = [];
let entitiesSettings = {};
let startX, startY, startWidth, startHeight;

/**
 * Initializes the DOM observer to detect and handle changes in the DOM.
 *
 * The observer listens for changes in the DOM, such as nodes being added or
 * attributes being modified. When a change is detected, the observer checks
 * if the target element matches a specific pattern indicating that a page builder
 * is being used. If a match is found, the method refreshOnDOMChanges() is
 * called to handle the changes.
 *
 * Additionally, the observer listens for mousemove and click events on the
 * document. If the mousemove event occurs, the method tooltipPosition() is called
 * to reposition a tooltip. If the click event occurs outside of a specific
 * modal element, the method removeModal() is called to remove the modal element
 * from the DOM, and enable certain disabled buttons.
 *
 * @returns {void}
 */
function initDomObserver() {

    $(document).ready(function(){
        if ($('#npb').length > 0) {
            $.post('/neo-page-builder/page', {}, function(data, status){

                if (status === 'success') {

                    $('#npb').append($(data)).addClass('npb-loaded');
                    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
                    var observer = new MutationObserver(function(mutations, observer) {

                        for (let i = 0; i < mutations.length; i++) {
                            const mutation = mutations[i];
                            if (mutation.target && ($(mutation.target).is('[id^="npb"]') || $(mutation.target).is('[class^="npb"]'))) {
                                refreshOnDOMChanges();
                            }
                        }
                        refreshOnDOMChanges();
                    });

                    observer.observe(document, {
                        subtree: true,
                        attributes: true
                    });

                    $(document).on('mousemove', function (event) {
                        tooltipPosition(event);
                    });

                    $(document).on('click', function (event) {
                        if (!$(event.target).is('.npb-fixed-modal')
                            && $(event.target).closest('.npb-fixed-modal').length === 0) {

                            $('.npb-fixed-modal').remove();

                            if (!$(event.target).is('.npb-add-row:disabled')
                                && $(event.target).closest('.npb-add-row:disabled').length === 0) {
                                $('.npb-add-row').attr('disabled', false);
                            }

                            if (!$(event.target).is('.npb-add-section:disabled')
                                && $(event.target).closest('.npb-add-section:disabled').length === 0) {
                                $('.npb-add-section').attr('disabled', false);
                            }

                            if (!$(event.target).is('.npb-block-section:disabled')
                                && $(event.target).closest('.npb-add-block:disabled').length === 0) {
                                $('.npb-add-block').attr('disabled', false);
                            }
                        }
                    });
                } else {
                    console.log(status);
                }
            });
        }
        $('#display-page-settings').on('click', function (){
            console.log(page)
            console.log(entitiesSettings)
        })
    });
}

$(window).on('scroll', function () {
    clearTimeout(fixedModalTimeout);
    fixedModalTimeout = setTimeout(function() {
        modalPositionOnScroll();
    }, 50)
});

$(window).on('resize', function () {
    interactiveHeaderInputPosition();
});

/**
 * Refreshes the DOM when changes occur.
 *
 * This method is responsible for refreshing the tooltip listener and fixed modal when changes occur in the DOM.
 *
 * @return {void} Returns nothing.
 */
function refreshOnDOMChanges() {
    refreshTooltipListener();
    settingsListener();
    updatePage();
}

/**
 * Refreshes the tooltip listener for the page builder.
 * Whenever a hover event occurs on an element with the 'data-title' attribute,
 * a tooltip is created and displayed if the window width is greater than 780px.
 * If the window width is less than or equal to 780px, the tooltip is removed.
 *
 * @return {void}
 */
function refreshTooltipListener() {

    $('#npb-wrapper [data-title]').on('mouseover', function(){

        if (window.innerWidth > 780) {

            const title = $(this).data('title');
            if ($('#npb-tooltip').length === 0) {
                $('#npb-wrapper').append(`<div id="npb-tooltip"><span>${title}</span></div>`);
            }

        } else {

            $('#npb-tooltip').off();
            $('#npb-tooltip').remove();
        }
    })

    $('#npb-wrapper [data-title]').on('mouseleave', function(){
        $('#npb-tooltip').off();
        $('#npb-tooltip').remove();
    })
}

/**
 * Calculates the position of a tooltip based on the provided event.
 * If the tooltip element exists on the page, it adds the necessary classes
 * and sets the CSS position properties accordingly.
 *
 * @param {Event} event - The event object representing the triggering event.
 */
function tooltipPosition(event) {

    if ($('#npb-tooltip').length > 0) {

        $('#npb-tooltip')
            .removeClass('npb-tooltip-position-top')
            .removeClass('npb-tooltip-position-bottom')
            .removeClass('npb-tooltip-position-center')
            .removeClass('npb-tooltip-position-left')
            .removeClass('npb-tooltip-position-right');

        const tooltipHeight = $('#npb-tooltip').height() + 40;
        const tooltipWidth = $('#npb-tooltip').width() + 40;

        const left = tooltipWidth / 2;
        let position = {left: 'unset', top: 'unset'};

        if (event.clientY > tooltipHeight + 20) {

            position.top = event.clientY - tooltipHeight;
            $('#npb-tooltip').addClass('npb-tooltip-position-top');

            if (event.clientX < left + 20) {
                position.left = event.clientX - 18;
                $('#npb-tooltip').addClass('npb-tooltip-position-left')
            } else if (event.clientX > window.innerWidth - (left + 20)) {
                position.left = event.clientX - (tooltipWidth - 18);
                $('#npb-tooltip').addClass('npb-tooltip-position-right');
            } else {
                position.left = event.clientX - left;
                $('#npb-tooltip').addClass('npb-tooltip-position-center');
            }

        } else {

            position.top = event.clientY + tooltipHeight - 30;
            $('#npb-tooltip').addClass('npb-tooltip-position-bottom');

            if (event.clientX < left + 20) {
                position.left = event.clientX - 18;
                $('#npb-tooltip').addClass('npb-tooltip-position-left');
            } else if (event.clientX > window.innerWidth - (left + 20)) {
                position.left = event.clientX - (tooltipWidth - 18);
                $('#npb-tooltip').addClass('npb-tooltip-position-right');
            } else {
                position.left = event.clientX - left;
                $('#npb-tooltip').addClass('npb-tooltip-position-center');
            }
        }

        $('#npb-tooltip').css(position);
    }
}

/**
 * Checks and updates the position of a fixed modal on scroll event.
 *
 * @function modalPositionOnScroll
 * @description This function checks if a fixed modal element is present and updates its position based on the scroll position of the page.
 *
 * @returns {void} This function does not return a value.
 */
function modalPositionOnScroll() {

    const modal = $('.npb-fixed-modal');
    if (modal.length > 0) {
        const pageY = window.scrollY;
        const windowHeight = window.innerHeight;
        const modalPosY = $(modal).offset().top;
        if (modalPosY - pageY > windowHeight / 2
        ) {
            $(modal).addClass('npb-fixed-modal-above-target');
        } else {
            $(modal).removeClass('npb-fixed-modal-above-target');
        }
    }
}

/**
 * Positions the interactive header input within the header container.
 *
 * This method calculates the width and position of the input element inside each interactive header container
 * and adjusts its position accordingly.
 *
 * @returns {void}
 */
function interactiveHeaderInputPosition() {

    const containers = $('.npb-headband-interactive');
    if (containers.length > 0) {
        for (let i = 0; i < containers.length; i++) {
            const container = containers[i];
            const input = $(container).find('.npb-headband-input-interactive');
            const containerWidth = $(container).width();
            const iconsContainerWidth = $(container).find('.npb-headband-header').width();
            const inputWidth = $(input).width();
            const width = containerWidth - iconsContainerWidth - inputWidth - 44;
            const left = containerWidth / 2 - iconsContainerWidth - (inputWidth + 22) / 2;
            if (width - 44 <= inputWidth + 40) {
                $(input).css({left: 0});
            } else {
                $(input).css({left: left});
            }
        }
    }
}

function settingsListener() {

    $('.npb-headband-header-icon-container-draggable-modal').off()
    $('.npb-headband-header-icon-container-draggable-modal').on('click', function () {

        const type = $(this).data('title').includes('cog') ? 'settings' : 'revisions';
        let elementType = 'page';
        let elementID = null;
        let elementPattern = null;
        let data = null;
        let friendlyName = 'Page';

        if ($(this).closest('.npb-block').length > 0) {

            elementType = 'block';
            elementID = $(this).closest('.npb-block').data('uuid');
            elementPattern = $(this).closest('.npb-block').data('pattern');
            data = entitiesSettings[$(this).closest('.npb-block').data('pattern')] ?? null;
            friendlyName = $($(this).closest('.npb-block').find('.npb-headband-input')[0]).val();

        } else if ($(this).closest('.npb-section').length > 0) {

            elementType = 'section';
            elementID = $(this).closest('.npb-section').data('uuid');
            elementPattern = $(this).closest('.npb-section').data('pattern');
            data = entitiesSettings[$(this).closest('.npb-section').data('pattern')] ?? null;
            friendlyName = $($(this).closest('.npb-section').find('.npb-headband-input')[0]).val();

        } else if ($(this).closest('.npb-row').length > 0) {

            elementType = 'row';
            elementID = $(this).closest('.npb-row').data('uuid');
            elementPattern = $(this).closest('.npb-row').data('pattern');
            data = entitiesSettings[$(this).closest('.npb-row').data('pattern')] ?? null;
            friendlyName = $($(this).closest('.npb-row').find('.npb-headband-input')[0]).val();
        }

        let info = {elementID, elementType, elementPattern, data, friendlyName};
        $.post('/neo-page-builder/resizable-modal', {type: type, info: info}, function(data, status){
            if (status === 'success') {
                $('#npb').append($(data));
                $('#npb-resizable-modal-container').draggable({
                    containment: 'window',
                    handle: '#npb-resizable-modal-header',
                    iframeFix: true,
                });

                $('#npb-resizable-modal-resizer').off();
                $('#npb-resizable-modal-resizer').on('mousedown', function(e){

                    $(this).addClass('npb-resizable-modal-resizer-show');
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt($('#npb-resizable-modal-container').width(), 10);
                    startHeight = parseInt($('#npb-resizable-modal-container').height(), 10);
                    $(document).on('mousemove', startDragModal);
                    $(document).on('mouseup', stopDragModal);
                });

            } else {
                console.log(data);
            }
        });
    });
}

/**
 * Updates the page data based on the current state of the HTML elements.
 *
 * @return {void}
 */
function updatePage() {

    let updatedPage = [];
    const rows = $('#npb-rows-wrapper > .npb-row');
    for (let i = 0; i < rows.length; i++) {

        let row = rows[i];
        let rowData = {
            elementType: 'row',
            elementID: $(row).data('uuid'),
            elementPattern: $(row).data('pattern'),
            friendlyName: $($(row).find('.npb-headband-input')[0]).val(),
            children: []
        };

        if (rowData.elementPattern.includes('special')) {

            let children = $(row).children().map(function() {
                if ($(this).hasClass('npb-row-special-blocks') || $(this).hasClass('npb-row-special-section')) {
                    return this;
                }
            }).get();

            for (let j = 0; j < children.length; j++) {
                if ($(children[j]).hasClass('npb-row-special-blocks')) {

                    let blocksWrappers = $(children[j]).find('.npb-blocks-wrapper');
                    for (let l = 0; l < blocksWrappers.length; l++) {

                        let blocks = $(blocksWrappers[l]).find('.npb-block');
                        let wrapper = {
                            type: 'blocks-wrapper',
                            entities: []
                        };

                        for (let k = 0; k < blocks.length; k++) {
                            wrapper.entities.push({
                                elementType: 'block',
                                elementID: $(blocks[k]).data('uuid'),
                                elementPattern: $(blocks[k]).data('pattern'),
                                friendlyName: $($(blocks[k]).find('.npb-headband-input')[0]).val(),
                            });
                        }
                        rowData.children.push(wrapper);
                    }

                } else if ($(children[j]).hasClass('npb-row-special-section')) {

                    let sections = $(children[j]).find('.npb-section-special').map(function() {

                        let section = {
                            elementType: 'section',
                            elementID: $(this).data('uuid'),
                            elementPattern: $(this).data('pattern'),
                            friendlyName: $($(this).find('.npb-headband-input')[0]).val(),
                            children: []
                        };

                        let blocksWrappers = $(this).find('.npb-blocks-wrapper');
                        for (let l = 0; l < blocksWrappers.length; l++) {

                            let blocks = $(blocksWrappers[l]).find('.npb-block');
                            let wrapper = {
                                type: 'blocks-wrapper',
                                entities: []
                            };

                            for (let k = 0; k < blocks.length; k++) {
                                wrapper.entities.push({
                                    elementType: 'block',
                                    elementID: $(blocks[k]).data('uuid'),
                                    elementPattern: $(blocks[k]).data('pattern'),
                                    friendlyName: $($(blocks[k]).find('.npb-headband-input')[0]).val(),
                                });
                            }
                            section.children.push(wrapper);
                        }
                        return section;
                    }).get();
                    rowData.children.push({type: 'sections', entities: sections});
                }
            }

        } else if (rowData.elementPattern === 'full') {

            let blocks = $(row).find('.npb-block').map(function() {
                return {
                    elementType: 'block',
                    elementID: $(this).data('uuid'),
                    elementPattern: $(this).data('pattern'),
                    friendlyName: $($(this).find('.npb-headband-input')[0]).val(),
                };
            }).get();

            rowData.children = [{
                elementType: 'blocks-wrapper',
                children: blocks
            }];

        } else {

            let sections = $(row).find('.npb-section').map(function() {

                let section = {
                    elementType: 'section',
                    elementID: $(this).data('uuid'),
                    elementPattern: $(this).data('pattern'),
                    friendlyName: $($(this).find('.npb-headband-input')[0]).val(),
                    children: []
                };

                let blocksWrappers = $(this).find('.npb-blocks-wrapper');
                for (let j = 0; j < blocksWrappers.length; j++) {

                    let blocks = $(blocksWrappers[j]).find('.npb-block');
                    let wrapper = {
                        type: 'blocks-wrapper',
                        entities: []
                    };

                    for (let k = 0; k < blocks.length; k++) {
                        wrapper.entities.push({
                            elementType: 'block',
                            elementID: $(blocks[k]).data('uuid'),
                            elementPattern: $(blocks[k]).data('pattern'),
                            friendlyName: $($(blocks[k]).find('.npb-headband-input')[0]).val()
                        });
                    }
                    section.children.push(wrapper);
                }
                return section;
            }).get();
            rowData.children = sections;
        }
        updatedPage.push(rowData);
    }
    page = updatedPage;
}

/**
 * Function to handle drag event and resize the element accordingly.
 *
 * @param {MouseEvent} e - The drag event object.
 * @return {void} - This method does not return anything.
 */
function startDragModal(e) {
    let w = startWidth + e.clientX - startX;
    let h = startHeight + e.clientY - startY;
    let offset = $('#npb-resizable-modal-container').offset();
    if (w >= 380 && offset.left + w < window.innerWidth) {
        $('#npb-resizable-modal-container').css({width: w});
    }
    if (h >= 195 && offset.top + h < window.innerHeight) {
        $('#npb-resizable-modal-container').css({height: h});
    }
}

/**
 * Stops the dragging functionality.
 *
 * @param {Event} e - The event object.
 * @return {void}
 */
function stopDragModal(e) {
    $('#npb-resizable-modal-resizer').removeClass('npb-resizable-modal-resizer-show');
    $(document).off('mousemove');
    $(document).off('mouseup');
}