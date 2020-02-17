jQuery(function($){
    var d = $.datepicker.regional['el'];
    d.buttonText = 'Open the calendar';
    d.resetButtonText = 'Reset the date';
    $.datepicker.setDefaults($.datepicker.regional['el'])
});