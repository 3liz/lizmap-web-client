jQuery(function($){
    var d = $.datepicker.regional['pt_BR'];
    d.buttonText = 'Open the calendar';
    d.resetButtonText = 'Reset the date';
    $.datepicker.setDefaults($.datepicker.regional['pt_BR'])
});