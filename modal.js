;(function() {

    var modalContent;
    var modal;

    $(document).ready(function() {
        injectTemplates();

        modal = $("#modalHolder");
        modalContent = modal.find(".modal-dialog");

        $(document).on('click', '.js-modal', onJsModalClick);
        $(document).on('submit', '.js-form', onJsFormSubmit);
        $(document).on('click', '.js-confirm', onJsConfirmClick);
        $(document).on('bsmodal.js-form.success', onJsFormSuccess);
    });

    function injectTemplates() {
        var modalTemplate =
            '<div class="modal fade message-modal" id="modalHolder" tabindex="-1" role="dialog" aria-hidden="true">' +
                '<div class="modal-dialog"></div>' +
            '</div>';

        if (!$('#bsModalContent').length) {
            modalTemplate += '<div id="bsModalContent" class="hidden"><div class="modal-body">Loading...</div></div>';
        }

        if (!$('#bsModalConfirmContent').length) {
            modalTemplate +=
                '<div id="bsModalConfirmContent" class="hidden">' +
                    '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                            '<span aria-hidden="true">&times;</span>' +
                        '</button>' +
                        '<h4 class="modal-title" id="bsModalTitle"></h4>' +
                    '</div>' +
                    '<div class="modal-body"></div>' +
                '</div>';
        }

        if (!$('#bsModalConfirmButtons').length) {
            modalTemplate +=
                '<div id="bsModalConfirmButtons" class="hidden">' +
                    '<div class="clearfix">' +
                        '<button class="btn btn-primary js-confirm-btn">Confirm</button>' +
                        '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
                    '</div>' +
                '</div>';
        }

        $('body').append(modalTemplate);
    }

    function onJsModalClick(event) {
        var elem = $(this);

        $(document).trigger('bsmodal.js-modal.clicked', [elem]);

        displayDefaultContent($("#bsModalContent"));
        loadModalContent(elem);

        modal.modal('show');

        event.preventDefault();
    }

    function onJsFormSubmit(event) {
        var formData = new FormData(this);

        $(document).trigger('bsmodal.js-form.submitted', [$(this), formData]);

        $.ajax({
            url: $(this).attr("action"),
            type: $(this).attr("method"),
            data: formData,
            processData: false,
            contentType: false,
            success: function(data, status, xhr) {
                $(document).trigger('bsmodal.js-form.success', [data, status, xhr]);
            },
            complete: function() {
                $(document).trigger('bsmodal.js-form.completed');
            }
        });

        event.preventDefault();
    }

    function onJsFormSuccess(event, data, status, xhr) {
        if (xhr.status == 201) {
            modal.modal('hide');

            if (data.redirect) {
                window.location = data.redirect;
            } else {
                window.location.reload();
            }
        } else {
            displayContent(data);
        }
    }

    function onJsConfirmClick(event) {
        var title = $(this).data('title') || 'Delete';
        var text = $(this).data('text') || 'Are you sure you want to remove this item?';
        var that = this;

        displayDefaultContent($('#bsModalConfirmContent'));

        modalContent.find('#bsModalTitle').html(title);
        modalContent.find('.modal-body').html(text + $('#bsModalConfirmButtons').html());
        modal.modal('show');

        modalContent.find('.js-confirm-btn').off().on('click', function() {
            if ($(that).data('no-ajax') || $(that).hasClass('js-no-ajax')) {
                return window.location.href = $(that).attr('href');
            }

            $.ajax({
                url: $(that).attr("href"),
                type: 'GET',
                success: function() {
                    window.location.reload();
                }
            });
        });

        event.preventDefault();
    }

    function loadModalContent(modal) {
        var contentUrl = modal.data('url') || modal.attr('href');

        $.get(contentUrl, function (data) {
            displayContent(data);

            $(document).trigger('bsmodal.js-modal.loaded', [data, contentUrl]);
        });
    }

    function displayDefaultContent(element) {
        displayContent(element ? element.html() : '');
    }

    function displayContent(content) {
        var element = $('<div class="modal-content"></div>');
        modalContent.html(element.append(content));
    }
})();