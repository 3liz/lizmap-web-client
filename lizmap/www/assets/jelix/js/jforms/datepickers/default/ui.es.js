jQuery(function($){
    var d = $.datepicker.regional['es'];
    d.buttonText = 'Open the calendar';
    d.resetButtonText = 'Reset the date';
    $.datepicker.setDefaults($.datepicker.regional['es'])
});