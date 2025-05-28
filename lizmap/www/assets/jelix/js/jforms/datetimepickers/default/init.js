/**
* @package      jelix
* @subpackage   forms
* @author       Laurent Jouanneau
* @copyright    2017 Laurent Jouanneau
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/
var jelix_datetimepicker_default_Manager = {
    _config : null,

    _initControl: function(control) {
        var disabled = false;

        if(control.multiFields){
            var eltId = '#'+control.formName+'_'+control.name;
            var eltYear = jQuery(eltId+'_year').after('<input type="hidden" disabled="disabled" id="'+control.formName+'_'+control.name+'_hidden" />');
            var eltMonth = jQuery(eltId+'_month');
            var eltDay = jQuery(eltId+'_day');
            var eltHour = jQuery(eltId+'_hour');
            var eltMinute = jQuery(eltId+'_minutes');
            var elt = jQuery(eltId+'_hidden');
            disabled = eltYear.attr('disabled');
        }
        else{
            var elt = jQuery('#'+control.formName+'_'+control.name);
            disabled = elt.attr('disabled');
        }

        var params = {
            changeMonth: true,
            changeYear: true,
            showButtonPanel: true,
            showOn: "button",
            buttonImageOnly: true,
            buttonImage: this._config.jelixWWWPath+'design/jforms/calendar.gif',
            onSelect : function(date){
                if(!control.multiFields)
                    return;
                eltYear.val('');
                eltMonth.val('');
                eltDay.val('');
                eltHour.val('');
                eltMinute.val('');
                var t = date.match(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}).*$/);
                eltYear.val(t[1]);
                eltMonth.val(t[2]);
                eltDay.val(t[3]);
                eltHour.val(t[4]);
                eltMinute.val(t[5]);
            }
        };

        var currentYear = parseInt(new Date().getFullYear(),10);
        var yearRange = [parseInt(currentYear-10,10), parseInt(currentYear+10,10)];
        if(control.minDate){
            var t = control.minDate.match(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}).*$/);
            if(t !== null){
                yearRange[0] = parseInt(t[1],10);
                params.minDate = new Date(parseInt(t[1],10), parseInt(t[2],10)-1, parseInt(t[3],10),
                    parseInt(t[4],10)-1, parseInt(t[5],10));
            }
        }
        if(control.maxDate){
            var t = control.maxDate.match(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}).*$/);
            if(t !== null){
                yearRange[1] = parseInt(t[1],10);
                params.maxDate = new Date(parseInt(t[1],10), parseInt(t[2],10)-1, parseInt(t[3],10),
                    parseInt(t[4],10)-1, parseInt(t[5],10));
            }
        }
        params.yearRange = yearRange.join(':');

        if(control.multiFields) {
            params.beforeShow = function(){
                elt.val(eltYear.val()+'-'+eltMonth.val()+'-'+eltDay.val()+ ' '+eltHour.val()+':'+eltMinute.val());
            };
        }

        // we force the format, it should correspond to the date we give to the widget
        params.dateFormat = 'yy-mm-dd';
        params.timeFormat = "HH:mm";

        let locale = jFormsJQ.config.locale.split('_',2);
        let lang = locale[0];
        if (lang in $.timepicker.regional) {
            $.timepicker.setDefaults($.timepicker.regional[lang]);
        }

        elt.datetimepicker(params);

        jQuery("#ui-datepicker-div").css("z-index",999999);
        var triggerIcon = elt.parent().children('img.ui-datepicker-trigger').eq(0);

        if(!control.required && triggerIcon){
            triggerIcon.after(' <img class="ui-datepicker-reset" src="'+this._config.jelixWWWPath+'design/jforms/cross.png" alt="'+elt.datepicker('option','resetButtonText')+'"  title="'+elt.datepicker('option','resetButtonText')+'" />');
            var cleanTriggerIcon = elt.parent().children('img').eq(1);
            cleanTriggerIcon.click(function(e){
                if(elt.datepicker('isDisabled'))
                    return;
                if(control.multiFields){
                    eltYear.val('');
                    eltMonth.val('');
                    eltDay.val('');
                    eltHour.val('');
                    eltMinute.val('');
                }
                elt.val('');
            });
        }

        if (triggerIcon) {
            triggerIcon.css({'vertical-align':'text-bottom', 'margin-left':'3px'});
        }

        elt.bind('jFormsActivateControl', function(e, val){
            if(val){
                jQuery(this).datepicker('enable');
                if(!control.required && triggerIcon) {
                    cleanTriggerIcon.css('opacity','1');
                }
            }
            else{
                jQuery(this).datepicker('disable');
                if(!control.required && triggerIcon) {
                    cleanTriggerIcon.css('opacity','0.5');
                }
            }
        });

        elt.trigger('jFormsActivateControl', !disabled);
        elt.blur();
    },
    _scriptReady: false,
    _controls : [],

    declareControl : function(aControl) {
        if (this._scriptReady) {
            // for forms or control that are generated dynamically, if the script
            // is already ready, we can init the datepicker
            this._initControl(aControl);
        }
        else {
            // script is not ready yet, we push
            // the control into the stack
            this._controls.push(aControl);
        }
    },
    _start : function() {
        var datapickCtrl = this._controls.shift();
        while(datapickCtrl ) {
            this._initControl(datapickCtrl);
            datapickCtrl = this._controls.shift();
        }
        this._scriptReady = true;
    }
};

function jelix_datetimepicker_default(aControl, config){
    jelix_datetimepicker_default_Manager.declareControl(aControl);

    if (jelix_datetimepicker_default_Manager._controls.length <= 1) {
        // first control, we will wait after the page loading
        jelix_datetimepicker_default_Manager._config = config;

        jQuery(document).ready(function(){
            jelix_datetimepicker_default_Manager._start();
        });
    }
}
