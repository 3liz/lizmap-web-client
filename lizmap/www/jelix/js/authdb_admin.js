$("document").ready( function () {
    $("#search-login").autocomplete({
        source: $("#search-login").data('link')
    });
}); 
