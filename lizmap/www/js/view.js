(function ($) {
    $.fn.uniformHeight = function () {
        var maxHeight = 0,
            wrapper,
            wrapperHeight;
        return this.each(function () {
            // Applying a wrapper to the contents of the current element to get reliable height
            wrapper = $(this).wrapInner('<div class="wrapper" />').children('.wrapper');
            wrapperHeight = wrapper.outerHeight();
            maxHeight = Math.max(maxHeight, wrapperHeight);
            // Remove the wrapper
            wrapper.children().unwrap();
        }).height(maxHeight);
    }
})(jQuery);

addDescriptionSlider = function(){
    $('.liz-project-img').parent().mouseenter(function(){
      var self = $(this);
      self.find('.liz-project-desc').slideDown();
      self.css('cursor','pointer');
    }).mouseleave(function(){
      var self = $(this);
      self.find('.liz-project-desc').hide();
    }).click(function(){
      var self = $(this);
      window.location = self.parent().find('a.liz-project-view').attr('href');
      return false;
    });
}

resizeThumbnails = function(){
    $(".thumbnail h5").height('auto');
    $('.thumbnails').height('auto');
    $('.thumbnails').each(function () {
        $(this).find('.thumbnail h5').height(Math.max.apply(null, $(this).find('.thumbnail h5').map(function() { return $(this).height(); })));
        $(this).find('.thumbnail').uniformHeight();
    });
}




$( window ).load(function() {
    addDescriptionSlider();
    resizeThumbnails();
});

$(window).resize(function () {
    resizeThumbnails();
});
