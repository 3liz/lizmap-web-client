jQuery(function($){
    var d = $.datepicker.regional['eu'];
    d.buttonText = 'Open the calendar';
    d.resetButtonText = 'Reset the date';
    $.datepicker.setDefaults($.datepicker.regional['eu'])
});