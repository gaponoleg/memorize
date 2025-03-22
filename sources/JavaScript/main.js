$(document).ready(function($){
	var contentSections = $('.cd-section'),
		navigationItems = $('#cd-vertical-nav a');

	if (Math.random() > 0.5)
	    $('#section1').addClass('black');
	$('h1').addClass('toggle');

	var dots = [];
    var dotsObj = $('li a');
	dotsObj.each(function () {
		dots.push($(this).offset().top - $(window).scrollTop());
    });

	updateNavigation();
	$(window).on('scroll', function(){
		updateNavigation();
		var offset = ($(window).scrollTop() % $(window).height());
		var order = parseInt($(window).scrollTop() / $(window).height(), 10);
        // console.log(offset + ' ' + order);
        if (order % 2 == 0)
		{
            dotsObj.each(function () {
                if (dots[$(this).attr('data-number') - 1] > $(window).height() - offset - 10)
                    $(this).addClass('reversed');
                else
                    $(this).removeClass('reversed');
            });
		}
		else {
            dotsObj.each(function () {
                if (dots[$(this).attr('data-number') - 1] > $(window).height() - offset - 10)
                    $(this).removeClass('reversed');
                else
                    $(this).addClass('reversed');
            });
		}
		if ($(window).scrollTop() > $(window).height()*5 - 50)
        {
            console.log('yas');
            $('.top-menu').addClass('focus');
        }
        else {
            if ($('.top-menu').hasClass('focus'))
                $('.top-menu').removeClass('focus');
        }
        if ($(window).scrollTop() > 150)
        {
            if (!$('.top-menu').hasClass('shrink'))
                $('.top-menu').addClass('shrink');
        }
        else {
            if ($('.top-menu').hasClass('shrink'))
                $('.top-menu').removeClass('shrink');
        }
	});

    var snackbarContainer = document.getElementById('snackbar');
    // console.log(snackbarContainer);
    // // 'use strict';
    // var data = {message: 'Log in failed'};
    //
    // setTimeout(function () {
    //     if (document.querySelector('.login-failed') != null)
    //     {
    //         snackbarContainer.MaterialSnackbar.showSnackbar(data);
    //     }
    // },100);

	//smooth scroll to the section
	navigationItems.on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });
    //smooth scroll to second section
    $('.cd-scroll-down').on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });

    //open-close navigation on touch devices
    $('.touch .cd-nav-trigger').on('click', function(){
    	$('.touch #cd-vertical-nav').toggleClass('open');
  
    });
    //close navigation on touch devices when selectin an elemnt from the list
    $('.touch #cd-vertical-nav a').on('click', function(){
    	$('.touch #cd-vertical-nav').removeClass('open');
    });

	function updateNavigation() {
		contentSections.each(function(){
			$this = $(this);
			var activeSection = $('#cd-vertical-nav a[href="#'+$this.attr('id')+'"]').data('number') - 1;
			if ( ( $this.offset().top - $(window).height()/2 < $(window).scrollTop() ) && ( $this.offset().top + $this.height() - $(window).height()/2 > $(window).scrollTop() ) ) {
				navigationItems.eq(activeSection).addClass('is-selected');
			}else {
				navigationItems.eq(activeSection).removeClass('is-selected');
			}
		});
	}

	function smoothScroll(target) {
        $('body, html').animate(
        	{'scrollTop':target.offset().top},
        	600
        );
	}
});