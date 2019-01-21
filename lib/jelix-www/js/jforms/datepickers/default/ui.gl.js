jQuery(function($){
    var d = $.datepicker.regional['gl'];
    d.buttonText = 'Abrir o calendario';
    d.resetButtonText = 'Restablecer a data';
    $.datepicker.setDefaults($.datepicker.regional['gl'])
});