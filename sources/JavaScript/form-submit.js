$(document).ready(function () {
    var snackbarContainer = document.getElementById('snackbar');

    $('button[type="ajax-submit"]').each(function () {
        $(this).attr('type','button');
        $(this).on('click',function () {
            var submit_btn = $(this);
            var form = $(this).parents('form');
            var filled = true;
            var inputs = form.find('input').attr('required','true');
            for(var i = 0; i < inputs.length; i++)
            {
                if (!inputs[i].checkValidity())
                {
                    filled = false;
                    var input = $(inputs[i]);
                    input.parent().addClass('is-invalid');
                }
            }
            if (filled)
            {
                $.ajax({
                    type: "POST",
                    url: form.attr('action'),
                    data: form.serialize(),
                    success: function(data, status, xhr)
                    {
                        if (xhr.status == 200) //OK
                        {
                            snackbarContainer.MaterialSnackbar.showSnackbar({
                                message: data
                            });
                        }
                        else {
                            console.log(xhr.status);
                            snackbarContainer.MaterialSnackbar.showSnackbar({
                                message: data
                            });
                        }
                    },
                    error: function () {
                        snackbarContainer.MaterialSnackbar.showSnackbar({
                            message: 'Error',
                            actionHandler: function () {
                                submit_btn.click();
                            },
                            actionText: 'Retry'
                        });
                    }
                });
            }
        });
    });


    $('button[type="login-submit"]').each(function () {
        $(this).attr('type','button');
        $(this).on('click',function () {
            var submit_btn = $(this);
            var form = $(this).parents('form');
            var filled = true;
            var inputs = form.find('[checking]').attr('required','true');
            for(var i = 0; i < inputs.length; i++)
            {
                if (!inputs[i].checkValidity())
                {
                    filled = false;
                    var input = $(inputs[i]);
                    input.parent().addClass('is-invalid');
                }
            }
            if (filled)
            {
                console.log(form.serialize());
                $.ajax({
                    type: "POST",
                    url: form.attr('action'),
                    data: form.serialize(),
                    success: function(data, status, xhr)
                    {
                        if (xhr.status == 200) //OK
                        {
                            window.location.href='u/';
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
                                submit_btn.click();
                            },
                            actionText: 'Retry'
                        });
                    }
                });
            }
        });
    });

    $('button[type="delete-account-submit"]').each(function () {
        $(this).attr('type','button');
        $(this).on('click',function () {
            var submit_btn = $(this);
            var form = $(this).parents('form');
            var filled = true;
            var inputs = form.find('[checking]').attr('required','true');
            for(var i = 0; i < inputs.length; i++)
            {
                if (!inputs[i].checkValidity())
                {
                    filled = false;
                    var input = $(inputs[i]);
                    input.parent().addClass('is-invalid');
                }
            }
            if (filled)
            {
                console.log(form.serialize());
                $.ajax({
                    type: "POST",
                    url: form.attr('action'),
                    data: form.serialize(),
                    success: function(data, status, xhr)
                    {
                        if (xhr.status == 200) //OK
                        {
                            window.location.reload();
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
                                submit_btn.click();
                            },
                            actionText: 'Retry'
                        });
                    }
                });
            }
        });
    });
});