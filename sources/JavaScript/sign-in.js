(function(){
    function ModalSignin( element ) {
        this.element = element;
        try {
            this.hidePassword = this.element.getElementsByClassName('js-hide-password');
            this.blocks = this.element.getElementsByClassName('js-signin-modal-block');
            this.switchers = this.element.getElementsByClassName('js-signin-modal-switcher')[0].getElementsByTagName('a');
            this.triggers = document.getElementsByClassName('js-signin-modal-trigger');
        }
        catch (err) {

        }
        this.init();
    }

    ModalSignin.prototype.init = function() {
        var self = this;
        //open modal/switch form
        try {
            $('.js-signin-modal-trigger').on('click', function () {
                self.showSigninForm($(this).attr('data-signin'));
            });
            for(var i =0; i < this.triggers.length; i++) {
                (function(i){
                    self.triggers[i].addEventListener('click', function(event){
                        if( event.target.hasAttribute('data-signin') ) {
                            // event.preventDefault();
                            self.showSigninForm(event.target.getAttribute('data-signin'));
                        }
                    });
                })(i);
            }


            //close modal
            this.element.addEventListener('click', function(event){
                if( $(event.target).hasClass('js-signin-modal') || $(event.target).hasClass('js-close') ) {
                    event.preventDefault();
                    $(self.element).removeClass('cd-signin-modal--is-visible');
                }
            });
            //close modal when clicking the esc keyboard button
            $(document).on('keydown', function(event){
                if (event.which=='27')
                    $(self.element).removeClass('cd-signin-modal--is-visible');
            });
        }
        catch (err) {

        }

        //hide/show password
        for(var i =0; i < this.hidePassword.length; i++) {
            (function(i){
                self.hidePassword[i].addEventListener('click', function(event){
                    self.togglePassword(self.hidePassword[i]);
                });
            })(i);
        }
    };

    ModalSignin.prototype.togglePassword = function(target) {
        var password = target.previousElementSibling;
        ( 'password' == password.getAttribute('type') ) ? password.setAttribute('type', 'text') : password.setAttribute('type', 'password');
        $(target).toggleClass('visibility').toggleClass('visibility-off');
        putCursorAtEnd(password);
    };

    ModalSignin.prototype.showSigninForm = function(type) {
        // show modal if not visible
        if (!$(this.element).hasClass('cd-signin-modal--is-visible'))
            $(this.element).addClass('cd-signin-modal--is-visible');
        // show selected form
        for( var i=0; i < this.blocks.length; i++ ) {
            this.blocks[i].getAttribute('data-type') == type ? $(this.blocks[i]).addClass('cd-signin-modal__block--is-selected') : $(this.blocks[i]).removeClass('cd-signin-modal__block--is-selected');
        }
        //update switcher appearance
        var switcherType = (type == 'signup') ? 'signup' : 'login';
        for( var i=0; i < this.switchers.length; i++ ) {
            this.switchers[i].getAttribute('data-type') == switcherType ? $(this.switchers[i]).addClass('cd-selected') : $(this.switchers[i]).removeClass('cd-selected');
        }
    };

    var signinModal = $('.js-signin-modal')[0];
    if( signinModal ) {
        new ModalSignin(signinModal);
    }

    //credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
    function putCursorAtEnd(el) {
        if (el.setSelectionRange) {
            var len = el.value.length * 2;
            el.focus();
            el.setSelectionRange(len, len);
        } else {
            el.value = el.value;
        }
    }
})();