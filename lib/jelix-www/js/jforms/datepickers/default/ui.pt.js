jQuery(function($){
    var d = $.datepicker.regional['pt'];
    d.buttonText = 'Abrir o calendário';
    d.resetButtonText = 'Apagar a data';
    $.datepicker.setDefaults($.datepicker.regional['pt'])
});