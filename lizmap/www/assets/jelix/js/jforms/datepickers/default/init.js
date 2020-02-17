/**
* @package      jelix
* @subpackage   forms
* @author       Julien Issler
* @contributor  Dominique Papin, Laurent Jouanneau
* @copyright    2008-2010 Julien Issler, 2008 Dominique Papin, 2016 Laurent Jouanneau
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

function jelix_datepicker_default(aControl, config){

    var me = this;

    this._initControl = function(control) {

        var disabled = false;

        if(control.multiFields){
            var eltId = '#'+control.formName+'_'+control.name;
            var eltYear = jQuery(eltId+'_year').after('<input type="hidden" disabled="disabled" id="'+control.formName+'_'+control.name+'_hidden" />');
            var eltMonth = jQuery(eltId+'_month');
            var eltDay = jQuery(eltId+'_day');
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
            buttonImage: me._config.jelixWWWPath+'design/jforms/calendar.gif',
            onSelect : function(date){
                if(!control.multiFields)
                    return;
                eltYear.val('');
                eltMonth.val('');
                eltDay.val('');
                date = date.split('-');
                eltYear.val(date[0]);
                eltMonth.val(date[1]);
                eltDay.val(date[2]);
            }
        };

        var currentYear = parseInt(new Date().getFullYear(),10);
        var yearRange = [parseInt(currentYear-10,10), parseInt(currentYear+10,10)];
        if(control.minDate){
            var t = control.minDate.match(/^(\d{4})\-(\d{2})\-(\d{2}).*$/);
            if(t !== null){
                yearRange[0] = parseInt(t[1],10);
                params.minDate = new Date(parseInt(t[1],10), parseInt(t[2],10)-1, parseInt(t[3],10));
            }
        }
        if(control.maxDate){
            var t = control.maxDate.match(/^(\d{4})\-(\d{2})\-(\d{2}).*$/);
            if(t !== null){
                yearRange[1] = parseInt(t[1],10);
                params.maxDate = new Date(parseInt(t[1],10), parseInt(t[2],10)-1, parseInt(t[3],10));
            }
        }
        params.yearRange = yearRange.join(':');

        if(control.multiFields) {
            params.beforeShow = function(){
                elt.val(eltYear.val()+'-'+eltMonth.val()+'-'+eltDay.val());
            };
        }

        if(!control.lang) {
            params.dateFormat = 'yy-mm-dd';
        }

        elt.datepicker(params);

        jQuery("#ui-datepicker-div").css("z-index",999999);
        var triggerIcon = elt.parent().children('img.ui-datepicker-trigger').eq(0);

        if(!control.required && triggerIcon){
            triggerIcon.after(' <img class="ui-datepicker-reset" src="'+me._config.jelixWWWPath+'design/jforms/cross.png" alt="'+elt.datepicker('option','resetButtonText')+'"  title="'+elt.datepicker('option','resetButtonText')+'" />');
            var cleanTriggerIcon = elt.parent().children('img').eq(1);
            cleanTriggerIcon.click(function(e){
                if(elt.datepicker('isDisabled'))
                    return;
                if(control.multiFields){
                    eltYear.val('');
                    eltMonth.val('');
                    eltDay.val('');
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
    };

    if(typeof this._scriptLoaded === 'undefined') {
        this._scriptLoaded = false;
    }

    if (typeof this._controls !== 'undefined') {
        if (this._scriptLoaded) {
            // for forms or control that are generated dynamically, if scripts
            // are already loaded, we can init the datepicker
            this._initControl(aControl);
        }
        else {
            // scripts are not already loaded, we push
            // the control into the stack
            this._controls.push(aControl);
        }
        return;
    }

    // here, this is the first call of jelix_datepicker_default
    this._controls = [];
    this._controls.push(aControl);

    this._config = config;

    this._start = function(){
        me._scriptLoaded = true;
        var datapickCtrl = me._controls.shift();
        while(datapickCtrl ) {
            me._initControl(datapickCtrl);
            datapickCtrl = me._controls.shift();
        }
    };

    jQuery(document).ready(function(){
        me._start();
    });
}
