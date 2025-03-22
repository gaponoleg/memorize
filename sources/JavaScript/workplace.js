//html for a single note card
var cardHtml = '<div class="demo-card-event mdl-card mdl-shadow--2dp mdl-cell--12-col-phone mdl-cell--4-col-tablet mdl-cell mdl-cell--3-col">\n' +
    '                <div class="mdl-card__title mdl-card--expand">\n' +
    '                    <div class="indicator" percent="0"></div>\n' +
    '                    <div class="shadow"></div>\n' +
    '                    <p></p>\n' +
    '                </div>\n' +
    '                <div class="mdl-card__actions mdl-card--border">\n' +
    '                    <a class="mdl-card__title"></a>\n' +
    '                    <div class="mdl-layout-spacer"></div>\n' +
    '                    <div class="note-options">\n' +
    '                        <!--TODO add custom ids-->\n' +
    '                        <button class="note-options-button mdl-button mdl-js-button mdl-button--icon">\n' +
    '                            <i class="material-icons">more_vert</i>\n' +
    '                        </button>\n' +
    '                        <ul class="mdl-menu mdl-menu--top-right mdl-js-menu">\n' +
    '                            <li class="train-op mdl-menu__item">Train</li>\n' +
    '                            <li class="test-op mdl-menu__item">Test knowledge</li>\n' +
    '                            <li class="mark-op mdl-menu__item">Mark as learned</li>\n' +
    '                            <li class="edit-op mdl-menu__item">Edit</li>\n' +
    '                            <li class="delete-op mdl-menu__item">Delete</li>\n' +
    '                        </ul>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        ';

//Yandex SpeechKit API key
var apikey = 'c1b28824-ccd0-41e2-9efa-4b07b4d031b5';
//Speech recognition controller
var streamer;
var is_listening;
//Notification object
var snackbarContainer;
//Popup window object
var popup;
//Currently opened note
var openedNote;

$(document).ready(function () {
    $('.mdl-layout__header').css('overflow-y','unset');
    //set chosen section in side menu
    if (window.location.hash == '')
    {
        $('[href="#all"]').addClass('is-selected');
        $('#all').addClass('is-selected');
    }
    else {
        $('[href="' + window.location.hash + '"]').addClass('is-selected');
        $(window.location.hash).addClass('is-selected');
    }

    snackbarContainer = document.getElementById('snackbar');
    popup = $('.cd-view-popup');
    wireEventsToPopup();
    wireEventsToEditMenu();
    wireEventsToTestMenu();
    wireEventsToTrainMenu();
    wireEventsToCards();
    wireEventsToSideMenu();
    //add new note
    $('#add-button').on('click',function () {
        openNote(null);
        edit();
        popup.toggleClass('is-visible');
    });
});

function wireEventsToTestMenu() {
    $('#mic').on('click', function () {
        if (is_listening == false) //start listening
        {
            $(this).html('<i class="material-icons">mic</i>');
            is_listening = true;
            streamer.start({
                initCallback: function () {
                    $('#mic').attr('chosen', 'true').addClass('pulse-button').parent().attr('data-balloon','Pause listening');
                    snackbarContainer.MaterialSnackbar.showSnackbar({message: 'You can start dictation'});
                },
                dataCallback: function (text, done) {
                    console.log("Text: " + text);
                    console.log("Done:" + done);
                    if (done)
                    {
                        popup.find('.note-text').val(popup.find('.note-text').val() + text);
                    }
                },
                errorCallback: function (err) {
                    console.log("Error: " + err);
                    snackbarContainer.MaterialSnackbar.showSnackbar({message: 'An error occured during dictation'});
                    $('#mic').removeClass('pulse-button').removeAttr('chosen').html('<i class="material-icons">mic_none</i>').parent().attr('data-balloon','Dictate');
                },
                stopCallback: function () {
                    console.log("Stopped");
                    $('#mic').removeClass('pulse-button').removeAttr('chosen').html('<i class="material-icons">mic_none</i>').parent().attr('data-balloon','Dictate');
                },
                partialResults: false,
                utteranceSilence: 60
            });
        }
        else //pause listening
        {
            is_listening = false;
            $(this).html('<i class="material-icons">mic_none</i>').removeAttr('chosen').removeClass('pulse-button');
            $(this).parent().attr('data-balloon','Dictate');
            streamer.stop();
        }
    });
    $('#test-cancel').on('click',function () {
        var note_text_content = openedNote.find('.mdl-card__title p');
        var note_title = openedNote.find('.mdl-card__actions .mdl-card__title');
        popup.find('.note-title input').val(note_title.text().trim());
        popup.find('.note-text').val(note_text_content.html()).attr('text-align', note_text_content.attr('text-align'));
        popup.find('.note-title input').attr('readonly','readonly');
        popup.find('.note-text').attr('readonly','readonly').attr('placeholder', 'Text');
        popup.removeClass('test').removeClass('test-res');
        popup.find('.result, .percent').remove();
        if (streamer != null)
            streamer.abort();
    });
    $('#test-restart').on('click',function () {
        if (streamer != null)
            streamer.abort();
        popup.find('.note-text').val('');
        popup.removeClass('test-res');
        popup.find('.result, .percent').remove();
    });
    $('#test-check').on('click',function () {
        if (streamer != null)
            streamer.stop();
        var original_text = openedNote.find('.mdl-card__title p').html();
        var typed_text = popup.find('.note-text').val();
        checkTest(original_text,typed_text);
    });
}

function wireEventsToTrainMenu() {
    $('#train-cancel').on('click',function () {
        popup.find('.words *, .text *').remove();
        popup.find('.text').html('');
        popup.removeClass('train');
    });
    $('#train-hint').on('click',function () {
        var next_word = popup.find('.text .word:not(.revealed)').first();
        checkWord($('.words [word="'+next_word.attr('word')+'"]').first());
    });
}

function wireEventsToEditMenu() {
    $('#edit-save').on('click',function () {
        var note_text_content = popup.find('.note-text').val();
        var note_title = popup.find('.note-title input').val();
        var align = popup.find('.note-text').attr('text-align');
        var empty = false;
        if (note_text_content == '')
        {
            popup.find('.note-text').addClass('empty-field');
            empty = true;
        }
        if (note_title == '')
        {
            popup.find('.note-title input').addClass('empty-field');
            empty = true;
        }
        if (!empty) //fulfill saving
        {
            if (openedNote != null) //save changes in existing note
            {
                var align_indicator = align == "left" ? 0 : 1;
                var note_id = openedNote.attr('note-id');
                var note = {"id": note_id, "title":note_title,"text":note_text_content,"align":align_indicator};
                console.log(note);
                $.ajax({
                    type: "POST",
                    url: 'editnote/',
                    data: note,
                    success: function(data, status, xhr)
                    {
                        if (xhr.status == 200) //OK
                        {
                            popup.find('.note-title input').attr('readonly','readonly');
                            popup.find('.note-text').attr('readonly','readonly');
                            $('[note-id="'+openedNote.attr('note-id')+'"]').find('.mdl-card__title p').html(note_text_content).attr('text-align',align);
                            $('[note-id="'+openedNote.attr('note-id')+'"]').find('.mdl-card__actions .mdl-card__title').html(note_title);
                            popup.removeClass('edit');
                            popup.find('[chosen=true]').removeAttr('chosen');
                        }
                        else {
                            console.log(xhr.status);
                            snackbarContainer.MaterialSnackbar.showSnackbar({
                                message: data
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        snackbarContainer.MaterialSnackbar.showSnackbar({
                            message: 'Error',
                            actionHandler: function () {
                                // submit_btn.click();
                            },
                            actionText: 'Retry'
                        });
                    }
                });
            }
            else { //save new note
                var align_indicator = align == "left" ? 0 : 1;
                var newnote = {"title":note_title,"text":note_text_content,"align":align_indicator};
                console.log(newnote);
                $.ajax({
                    url: "newnote/",
                    type: 'POST',
                    data: newnote,
                    success: function(data, status, xhr)
                    {
                        console.log(data);
                        if (xhr.status == 200) //OK
                        {
                            var new_card = $(cardHtml);
                            var id = data;
                            new_card.attr('note-id', id);
                            new_card.find('.mdl-card__title p').html(note_text_content).attr('text-align',popup.find('.note-text').attr('text-align'));
                            new_card.find('.mdl-card__actions .mdl-card__title').html(note_title);
                            new_card.find('.note-options-button').attr('id','a-'+id);
                            new_card.find('.mdl-menu').attr('for','a-'+id);
                            $('#all.page-content').prepend(new_card);
                            var copy = new_card.clone();
                            copy.find('.note-options-button').attr('id','p-'+id);
                            copy.find('.mdl-menu').attr('for','p-'+id);
                            $('#inprocess.page-content').prepend(copy);
                            componentHandler.upgradeDom();
                            wireEventsToCards();
                            popup.toggleClass('is-visible').removeClass('edit').removeClass('test').removeClass('new-note');
                            popup.find('[chosen=true]').removeAttr('chosen');
                        }
                        else {
                            console.log(xhr.status);
                            snackbarContainer.MaterialSnackbar.showSnackbar({
                                message: data
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr.status);
                        console.log(status);
                        console.log(error);
                        snackbarContainer.MaterialSnackbar.showSnackbar({
                            message: 'Error',
                            actionHandler: function () {
                                // submit_btn.click();
                            },
                            actionText: 'Retry'
                        });
                    }
                });
            }
        }
    });
    $('#edit-cancel').on('click',function () {
        if (openedNote != null)
        {
            var note_text_content = openedNote.find('.mdl-card__title p');
            var note_title = openedNote.find('.mdl-card__actions .mdl-card__title');
            popup.find('.note-title input').val(note_title.text().trim());
            popup.find('.note-text').val(note_text_content.html()).attr('text-align', note_text_content.attr('text-align'));
            popup.find('.note-title input').attr('readonly','readonly');
            popup.find('.note-text').attr('readonly','readonly');
            popup.removeClass('edit');
            popup.find('[chosen=true]').removeAttr('chosen');
        }
        else  {
            popup.toggleClass('is-visible').removeClass('edit').removeClass('test').removeClass('new-note');
            popup.find('[chosen=true]').removeAttr('chosen');
        }
    });
    $('#text-align-center').on('click', function () {
        popup.find('.note-text').attr('text-align', 'center');
        $(this).attr('chosen','true');
        $('#text-align-left').removeAttr('chosen');
    });
    $('#text-align-left').on('click', function () {
        popup.find('.note-text').attr('text-align', 'left');
        $(this).attr('chosen','true');
        $('#text-align-center').removeAttr('chosen');
    });
    if (!window.FileReader) { //if API is not supported in the browser
        $('#file-upload').remove();
    }
    else {
        var fileInput = $('#file-upload-input');
        $('#file-upload-btn').click(function() {
            fileInput.click();
        });
        fileInput.on('change', function() {
            var input = fileInput.get(0);
            // Create a reader object
            var reader = new FileReader();
            if (input.files.length) {
                popup.find('.note-title input').val(input.files[0].name.substr(0,input.files[0].name.lastIndexOf('.')));
                var textFile = input.files[0];
                reader.readAsText(textFile);
                $(reader).on('load', function(e) {
                    var file = e.target.result;
                    if (file && file.length) {
                        popup.find('.note-text').val(file);
                    }
                });
            }
        });
    }
}

function wireEventsToPopup() {
    //popup menu on small devices
    $('#more-vert').on('click', function () {
        $('.note-title .note-options').toggleClass('show');
    });
    $('#popup-edit').on('click',function () {
        edit();
    });
    $('#popup-mark').on('click', function () {
        markNote(openedNote, true);
        popup.toggleClass('is-visible').removeClass('edit').removeClass('test').removeClass('new-note');
        popup.find('[chosen=true]').removeAttr('chosen');
    });
    $('#popup-delete').on('click', function () {
        deleteNote(openedNote);
        popup.toggleClass('is-visible').removeClass('edit').removeClass('test').removeClass('new-note');
        popup.find('[chosen=true]').removeAttr('chosen');
    });
    $('#popup-test').on('click', function () {
        test();
    });
    $('#popup-train').on('click', function () {
        train();
    });
    //close popup
    popup.on('click', function (e) {
        var target = $(e.target);
        //close action options on smartphones
        if (target.prop('tagName') !== 'I')
            $('.note-title .note-options').removeClass('show');
        //close popup
        if (target.hasClass('cd-view-popup') && !popup.hasClass('test'))
        {
            popup.toggleClass('is-visible').removeClass('edit').removeClass('test').removeClass('new-note').removeClass('train');;
            popup.find('[chosen=true]').removeAttr('chosen');
            popup.find('.note-title input').attr('readonly','readonly');
            popup.find('.note-text').attr('readonly','readonly');

            is_listening = false;
            $('#mic').html('<i class="material-icons">mic_none</i>').removeAttr('chosen').removeClass('pulse-button').parent().attr('data-balloon','Dictate');
            if (streamer != null)
                streamer.stop();
        }
    });
}

function wireEventsToSideMenu() {
    $('[href="#all"]').on('click',function () {
        $('.mdl-navigation__link').removeClass('is-selected');
        $(this).addClass('is-selected');
        $('.page-content').removeClass('is-selected');
        $('#all').addClass('is-selected');
    });
    $('[href="#inprocess"]').on('click',function () {
        $('.mdl-navigation__link').removeClass('is-selected');
        $(this).addClass('is-selected');
        $('.page-content').removeClass('is-selected');
        $('#inprocess').addClass('is-selected');
    });
    $('[href="#learned"]').on('click',function () {
        $('.mdl-navigation__link').removeClass('is-selected');
        $(this).addClass('is-selected');
        $('.page-content').removeClass('is-selected');
        $('#learned').addClass('is-selected');
    });
    setTimeout(function () {
        $('.mdl-layout__drawer-button').each(function () {
            console.log('e');
            $(this).on('click',function () {
                $('.mdl-layout__drawer').toggleClass('opened');
                $('.mdl-layout__content').toggleClass('opened');
            });
        });
    }, 500);
}

function setIndicator(indicator) {
    var percent = indicator.attr('percent');
    indicator.attr('data-balloon', 'Progress: ' + percent + '%');
    indicator.attr('data-balloon-pos', 'left');
    if (percent == 100)
    {
        indicator.html('<i class="material-icons">check_circle</i>\n'+ '<svg x="0px" y="0px" viewBox="0 0 36 36">\n' +
            '                            <circle fill="none" cx="18" cy="18" r="16" transform="rotate(-90 18 18)"></circle>\n' +
            '                        </svg>');
    }
    else {
        var n = 100 - percent;
        indicator.html('<svg x="0px" y="0px" viewBox="0 0 36 36">\n' +
            '                            <circle fill="none" cx="18" cy="18" r="16" stroke-dasharray="100 100" stroke-dashoffset="' + n + '" transform="rotate(-90 18 18)"></circle>\n' +
            '                        </svg>')
    }
}

function wireEventsToCards() {
    $('.mdl-card:not(.wired-to-events) .indicator').each(function () {
        setIndicator($(this));
    });
    $('.mdl-card:not(.wired-to-events)').on('click',function (e) {
        var target = $(e.target);
        if (target.parents('.note-options').length == 0 && !target.hasClass('indicator'))
        {
            openNote($(this));
            popup.toggleClass('is-visible');
        }
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.edit-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        openNote(target);
        edit();
        popup.toggleClass('is-visible');
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.delete-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        deleteNote(target);
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.mark-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        markNote(target, true);
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.test-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        openNote(target);
        test();
        popup.toggleClass('is-visible');
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.train-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        openNote(target);
        train();
        popup.toggleClass('is-visible');
    }).each(function () {
        $(this).addClass('wired-to-events');
    });
}

function openNote(noteCard) {
    openedNote = noteCard;
    popup.removeClass('learned');
    if (openedNote != null)
    {
        var note_text_content = openedNote.find('.mdl-card__title p');
        var note_title = openedNote.find('.mdl-card__actions .mdl-card__title');
        popup.find('.note-title input').val(note_title.text().trim());
        popup.find('.note-text').val(note_text_content.html()).attr('text-align', note_text_content.attr('text-align'));
        if (openedNote.find('.indicator').attr('percent') == 100)
        {
            popup.addClass('learned');
        }
    }
    else {
        popup.addClass('new-note');
        popup.find('.note-title input').val('');
        popup.find('.note-text').val('').attr('text-align', 'left');
    }
}

var time = 0;

function deleteNote(noteCard) {
    var noteToDelete = noteCard;
    $('[note-id="'+noteToDelete.attr('note-id')+'"]').addClass('deleted');
    console.log(time);
    time += 3000;
    snackbarContainer.MaterialSnackbar.showSnackbar({
        message: 'Note was deleted',
        timeout: 3000,
        actionHandler: function () {
            $('[note-id="'+noteToDelete.attr('note-id')+'"]').removeClass('deleted');
            noteToDelete = null;
            $(snackbarContainer).removeClass('mdl-snackbar--active');
        },
        actionText: 'Undo'
    });
    setTimeout(function () {
       if (noteToDelete != null)
       {
           var note = {"id":noteToDelete.attr('note-id')};
           $.ajax({
               url: "delete/",
               type: 'POST',
               data: note,
               success: function(data, status, xhr)
               {
                   console.log(data);
                   if (xhr.status == 200) //OK
                   {
                       $('[note-id="'+noteToDelete.attr('note-id')+'"]').remove();
                   }
                   else {
                       console.log(xhr.status);
                       snackbarContainer.MaterialSnackbar.showSnackbar({
                           message: data
                       });

                       $('[note-id="'+noteToDelete.attr('note-id')+'"]').removeClass('deleted');
                       noteToDelete = null;
                   }
               },
               error: function (xhr, status, error) {
                   $('[note-id="'+noteToDelete.attr('note-id')+'"]').removeClass('deleted');
                   noteToDelete = null;

                   console.log(xhr.status);
                   console.log(status);
                   console.log(error);
                   snackbarContainer.MaterialSnackbar.showSnackbar({
                       message: 'Error',
                       actionHandler: function () {
                           // submit_btn.click();
                       },
                       actionText: 'Retry'
                   });
               }
           });

       }
    }, time);
    setTimeout(function () {
        time -= 3000;
    }, 3000)
}

function markNote(noteCard, with_query) {
    var noteToMark = noteCard;
    //hide note from in process section
    $('.page-content').find('[note-id="'+noteToMark.attr('note-id')+'"]').addClass('learned');
    //work with note in all section
    var percent = noteCard.find('.indicator').attr('percent');
    setIndicator($('#all.page-content').find('[note-id="'+noteCard.attr('note-id')+'"]').find('.indicator').attr('percent', '100'));
    // $('#all.page-content').find('[note-id="'+noteCard.attr('note-id')+'"]').find('.mdl-menu__item:not(.delete-op)').addClass('hidden');
    var learned_card = $(cardHtml);
    learned_card.attr('note-id', noteCard.attr('note-id'));
    learned_card.find('.mdl-card__title p').html(noteCard.find('.mdl-card__title p').html())
        .attr('text-align',noteCard.find('.mdl-card__title p').attr('text-align'));
    learned_card.find('.mdl-card__actions .mdl-card__title').html(noteCard.find('.mdl-card__actions .mdl-card__title').html());
    learned_card.find('.note-options-button').attr('id','l-'+noteCard.attr('note-id'));
    learned_card.find('.mdl-menu').attr('for','l-'+noteCard.attr('note-id'));
    learned_card.find('.mdl-menu__item:not(.delete-op)').remove();
    learned_card.find('.indicator').attr('percent',100);
    $('#learned.page-content').prepend(learned_card);
    componentHandler.upgradeDom();
    wireEventsToCards();
    if (with_query) {
        time += 3000;
        snackbarContainer.MaterialSnackbar.showSnackbar({
            message: 'Note was added to learned',
            timeout: 3000,
            actionHandler: function () {
                $('[note-id="'+noteToMark.attr('note-id')+'"]').removeClass('learned');
                $('#learned.page-content').find('[note-id="'+noteToMark.attr('note-id')+'"]').remove();
                setIndicator($('#all.page-content').find('[note-id="'+noteCard.attr('note-id')+'"]').find('.indicator').attr('percent', percent));
                noteToMark = null;
                $(snackbarContainer).removeClass('mdl-snackbar--active');
            },
            actionText: 'Undo'
        });
        setTimeout(function () {
            if (noteToMark != null)
            {
                var note = {"id":noteToMark.attr('note-id')};
                $.ajax({
                    url: "learned/",
                    type: 'POST',
                    data: note,
                    success: function(data, status, xhr)
                    {
                        console.log(data);
                        if (xhr.status == 200) //OK
                        {
                            $('#inprocess.page-content').find('[note-id="'+noteToMark.attr('note-id')+'"]').remove();
                            $('#all.page-content').find('[note-id="'+noteCard.attr('note-id')+'"]').find('.mdl-menu__item:not(.delete-op)').remove();
                        }
                        else {
                            console.log(xhr.status);
                            snackbarContainer.MaterialSnackbar.showSnackbar({
                                message: data
                            });

                            $('[note-id="'+noteToMark.attr('note-id')+'"]').removeClass('learned');
                            $('#learned.page-content').find('[note-id="'+noteToMark.attr('note-id')+'"]').remove();
                            setIndicator($('#all.page-content').find('[note-id="'+noteCard.attr('note-id')+'"]').find('.indicator').attr('percent', percent));
                            noteToMark = null;
                        }
                    },
                    error: function (xhr, status, error) {
                        $('[note-id="'+noteToMark.attr('note-id')+'"]').removeClass('learned');
                        $('#learned.page-content').find('[note-id="'+noteToMark.attr('note-id')+'"]').remove();
                        setIndicator($('#all.page-content').find('[note-id="'+noteCard.attr('note-id')+'"]').find('.indicator').attr('percent', percent));
                        noteToMark = null;

                        console.log(xhr.status);
                        console.log(status);
                        console.log(error);
                        snackbarContainer.MaterialSnackbar.showSnackbar({
                            message: 'Error',
                            actionHandler: function () {
                                // submit_btn.click();
                            },
                            actionText: 'Retry'
                        });
                    }
                });
            }
        }, time);
        setTimeout(function () {
            time -= 3000;
        }, 3000);
    }
}

function edit() {
    popup.addClass('edit');
    popup.find('.note-title input').removeAttr('readonly');
    popup.find('.note-text').removeAttr('readonly');
    popup.find('#text-align-' + popup.find('.note-text').attr('text-align')).attr('chosen', 'true');
}

function test() {
    if (streamer == null)
        streamer = new ya.speechkit.SpeechRecognition();
    window.ya.speechkit.settings.apikey = apikey;
    is_listening = false;
    popup.addClass('test');
    popup.find('.note-text').val('').removeAttr('readonly').attr('placeholder','Type text here');
}

function checkTest(original_text,typed_text) {
    var original_split = original_text.replace(/[^A-Za-zЁА-яёа-я0-9\s]/g,' ').split(/\s/);
    var original_words = [];
    for(var i = 0; i < original_split.length; i++)
    {
        if (original_split[i] != '')
            original_words.push(original_split[i].toLowerCase());
    }
    var typed_split = typed_text.replace(/[^A-Za-zЁА-яёа-я0-9\s]/g,' ').split(/\s/);
    var typed_words = [];
    for(var i = 0; i < typed_split.length; i++)
    {
        if (typed_split[i] != '')
            typed_words.push(typed_split[i].toLowerCase());
    }
    var sm = new difflib.SequenceMatcher(original_words, typed_words);

    var opcodes = sm.get_opcodes();
    //generate difference review
    var pos = 0;
    var res = original_text;
    for (var i = 0; i < opcodes.length; i++)
    {
        for (var j = opcodes[i][1]; j < opcodes[i][2];j++)
        {
            var replace = true;
            res = res.replace(new RegExp(original_words[j], 'gi'),function (match, offset) {
                if (offset >= pos && replace)
                {
                    replace = false;
                    switch (opcodes[i][0]) {
                        case 'equal':
                            pos = offset + match.length + 17;
                            return '<b class="g">' + match + '</b>';
                        case 'delete':
                            pos = offset + match.length + 17;
                            return '<b class="r">' + match + '</b>';
                        case 'replace':
                            pos = offset + match.length + 17;
                            return '<b class="y">' + match + '</b>';
                    }
                }
                else return match;
            });
        }
    }
    popup.addClass('test-res');
    var result_view = $('<p class="result"></p>')
        .attr('text-align',popup.find('.note-text').attr('text-align'))
        .html(res);
    $('.note-text-container').append(result_view);
    var percent = Math.round(sm.ratio()*100);
    console.log(percent);
    var percent_view = $('<div class="percent">Percent of match: ' + percent + '%</div>');
    if (percent < 50)
        percent_view.addClass('r');
    else if (percent > 50 && percent < 80)
        percent_view.addClass('y');
    else
        percent_view.addClass('g');
    $('.note-title').append(percent_view);
    var current_progress = openedNote.find('.indicator').attr('percent');
    var note = {"id":openedNote.attr('note-id'),"percent":percent,"progress":current_progress};
    $.ajax({
        url: "updateprogress/",
        type: 'POST',
        data: note,
        success: function(data, status, xhr)
        {
            console.log(data);
            if (xhr.status == 200) //OK
            {
                if (data < 100)
                {
                    var indicator = openedNote.find('.indicator');
                    indicator.attr('percent',data);
                    setIndicator(indicator);
                    snackbarContainer.MaterialSnackbar.showSnackbar({
                        message: 'Learning progress has been updated'
                    });
                }
                else {
                    popup.addClass('learned');
                    markNote(openedNote, false);
                    snackbarContainer.MaterialSnackbar.showSnackbar({
                        message: 'Learning process is completed'
                    });
                }
            }
            else {
                console.log(xhr.status);
                snackbarContainer.MaterialSnackbar.showSnackbar({
                    message: data
                });
            }
        },
        error: function (xhr, status, error) {
            snackbarContainer.MaterialSnackbar.showSnackbar({
                message: 'Error',
                actionHandler: function () {
                    // submit_btn.click();
                },
                actionText: 'Retry'
            });
        }
    });
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function checkWord(word,check) {
    var next_word = popup.find('.text .word:not(.revealed)').first();
    console.log('');
    if (!check || word.html() == next_word.attr('word').toLowerCase()) {
        next_word.html(next_word.attr('word')).addClass('revealed');
        word.remove();
        if (popup.find('.words .word').length == 0)
        {
            train_text_pos++;
            if (train_text.length == train_text_pos)
            {
                //exit training mode
                snackbarContainer.MaterialSnackbar.showSnackbar({
                    message: 'Good job'
                });
                setTimeout(function () {
                    popup.removeClass('train');
                }, 1000);
            }
            else {
                addWords(train_text[train_text_pos]);
            }
        }
    }
    else {
        word.addClass('wrong');
        setTimeout(function () {
            word.removeClass('wrong');
        },100);
    }
}

function addWords(text) {
    popup.find('.words *, .text *').remove();
    popup.find('.text').html('');
    var text_split = text.replace(/[^A-Za-zЁА-яёа-я0-9\s]/g,' ').split(/\s/);
    var words = [];
    for(var i = 0; i < text_split.length; i++)
    {
        if (text_split[i] != '')
        {
            words.push(text_split[i]);
        }
    }
    shuffle(words);
    for(var i = 0; i < words.length; i++)
    {
        popup.find('.words').append('<span class="word" word="'+words[i]+'">'+ words[i].toLowerCase() +'</span>')
    }
    popup.find('.words .word').on('click', function () {
        checkWord($(this),true);
    });
    var replaced = text.replace(/([A-Za-zЁА-яёа-я0-9])+/g,function (match) {
        return '<span class="word">'+ match + '</span>';
    });
    popup.find('.text').html(replaced);
    popup.find('.text .word').each(function () {
        $(this).attr('word',$(this).html());
    });
    setTimeout(function () {
        $('.text .word:not(.revealed)').each(function () {
            $(this).width($(this).width()).html(' ');
        })
    },1000);
}

var train_text;
var train_text_pos;

function train() {
    var text = popup.find('.note-text');
    popup.find('.text').attr('text-align',text.attr('text-align'));
    var newline_pos = text.val().search(/\n[\s*]*\n/);
    if (newline_pos > -1)
    {
        train_text = text.val().split(/\n[\s*]*\n/);
    }
    else {
        train_text = text.val().split(/[.][\s]*/);
        for(var i = 0; i < train_text.length; i++)
            train_text[i] = train_text[i] + '.';
    }
    train_text_pos = 0;
    addWords(train_text[0]);
    popup.addClass('train');
}