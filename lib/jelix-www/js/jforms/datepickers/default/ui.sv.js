jQuery(function($){
    var d = $.datepicker.regional['sv'];
    d.buttonText = 'Open the calendar';
    d.resetButtonText = 'Reset the date';
    $.datepicker.setDefaults($.datepicker.regional['sv'])
});