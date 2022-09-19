jQuery(function($){
  var d = $.datepicker.regional['fr'];
  d.buttonText = 'Ouvrir le calendrier';
  d.resetButtonText = 'Effacer la date';
  $.datepicker.setDefaults($.datepicker.regional['fr']);
});