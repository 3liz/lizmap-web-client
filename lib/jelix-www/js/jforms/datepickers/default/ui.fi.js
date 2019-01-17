jQuery(function($){
    var d = $.datepicker.regional['fi'];
    d.buttonText = 'Open the calendar';
    d.resetButtonText = 'Reset the date';
    $.datepicker.setDefaults($.datepicker.regional['fi'])
});