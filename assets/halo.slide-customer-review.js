(function ($) {
    var halo = {
        initReviewSlider: function () {
            var policyBlock = $('[data-review-slider]');

            policyBlock.each(function () {
                var self = $(this),
                    rows = parseInt(self.data('row')),
                    centerMode = self.data('center'),
                    row_tablet = (rows > 1 ? parseInt(rows - 1) : 1);

                if (self.not('.slick-initialized')) {
                    self.slick({
                        centerMode: centerMode,
                        slidesToScroll: 2,
                        autoplay: true,
                        speed: 800,
                        dots: true,
                        slidesToShow: 4.5,
                        infinite: false,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,     
                        variableWidth: true,
                        responsive: [{
                                breakpoint: 1200,
                                settings: {
                                    centerMode: false,
                                    arrows: false,
                                    dots: true,
                                    slidesToShow: row_tablet,
                                    slidesToScroll: row_tablet
                                }
                            },
                            {
                                breakpoint: 992,
                                settings: {
                                    centerMode: false,
                                    arrows: false,
                                    dots: true,
                                    slidesToShow: 1,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 768,
                                settings: "unslick"
                            }
                        ]
                    });
                }
            });
        }
    }
    halo.initReviewSlider();
    if ($('body').hasClass('cursor-fixed__show')){
        window.sharedFunctionsAnimation.onEnterButton();
        window.sharedFunctionsAnimation.onLeaveButton();
    }
})(jQuery);