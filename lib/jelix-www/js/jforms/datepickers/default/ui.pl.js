jQuery(function($){
    var d = $.datepicker.regional['pl'];
    d.buttonText = 'Otwórz kalendarz';
    d.resetButtonText = 'Zresetuj datę';
    $.datepicker.setDefaults($.datepicker.regional['pl'])
});