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

searchProjects = function(){
    var $rows = $("#content.container li .liz-project-title");
    if ( $rows.length == 0 ) {
        $("#search-project").hide();
        return;
    }

   $("#search-project").keyup(function() {
       var val = $.trim(this.value).toUpperCase();
       // If the search bar is empty, show everything
       if (val === "")
       {
           $("#content.container .liz-repository-project-item").show();
           $( "#content.container .liz-repository-title" ).show();
        }
        // Hide everything then show projects and titles corresponding to the search bar
       else {
           $("#content.container .liz-repository-project-item").hide();
           $( "#content.container .liz-repository-title" ).hide();

           val = val.toUpperCase();
           $rows.filter(function() {
                return -1 != $(this).text().toUpperCase().indexOf(val);
            }).closest('.liz-repository-project-item').show();

            $rows.filter(function() {
                return -1 != $(this).text().toUpperCase().indexOf(val);
            }).closest('.liz-repository-project-list').prev('.liz-repository-title').show();

       }
   });

}



$( window ).load(function() {
    addDescriptionSlider();
    resizeThumbnails();
    searchProjects();
});

$(window).resize(function () {
    resizeThumbnails();
});
