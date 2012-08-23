/**
* @package      jelix
* @subpackage   forms
* @author       Julien Issler
* @contributor
* @copyright    2008-2009 Julien Issler, 2008 Dominique Papin
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

function jelix_datepicker_default(control,locale,basePath){
    if(typeof this._controls !== 'undefined'){
        this._controls.push(control);
        return;
    }

    this._controls = [];
    this._controls.push(control);

    this._config = {locale:locale, basePath:basePath};

    this._jsFiles = [];
    if(typeof jQuery.ui == 'undefined')
        this._jsFiles.push(this._config.basePath+'jelix/jquery/ui/ui.core.min.js');
    if(typeof jQuery.datepicker == 'undefined'){
        jQuery.include(this._config.basePath+'jelix/jquery/themes/default/ui.datepicker.css');
        this._jsFiles.push(this._config.basePath+'jelix/jquery/ui/ui.datepicker.min.js');
        var lang = locale.substr(0,2).toLowerCase();
        if(lang != 'en')
            this._jsFiles.push(this._config.basePath+'jelix/jquery/ui/i18n/ui.datepicker-'+lang+'.js');
    }
    this._loadJS = function (i){
        if(i<this._jsFiles.length){
            jQuery.include(this._jsFiles[i], function(){ this._loadJS(i+1); });
        }
        else
            this._start();
    };

    this._start = function(){
        var config = this._config;
        jQuery.each(
            this._controls,
            function(){
                var control = this;
                if(control.multiFields){
                    var eltId = '#'+control.formName+'_'+control.name;
                    var eltYear = jQuery(eltId+'_year').after('<input type="hidden" disabled="disabled" id="'+control.formName+'_'+control.name+'_hidden" />');
                    var eltMonth = jQuery(eltId+'_month');
                    var eltDay = jQuery(eltId+'_day');
                    var elt = jQuery(eltId+'_hidden');
                }
                else
                    var elt = jQuery('#'+control.formName+'_'+control.name);

                elt.datepicker({
                    showOn: "button",
                    buttonText : '',
                    buttonImageOnly : true,
                    buttonImage : config.basePath+'jelix/design/jforms/calendar.gif',
                    beforeShow : function(){
                        var currentYear = parseInt(new Date().getFullYear(),10);
                        var yearRange = [parseInt(currentYear-10,10), parseInt(currentYear+10,10)];
                        var params = {};
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
                        if(control.multiFields)
                            elt.val(eltYear.val()+'-'+eltMonth.val()+'-'+eltDay.val());
                        return params;
                    },
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
                });
                if(!control.lang)
                    elt.datepicker('change',{dateFormat:'yy-mm-dd'});
                if(control.required)
                    elt.datepicker('change',{mandatory:true});
                elt.blur();
            }
        );
    };
    var me = this;
    jQuery(document).ready(function(){ me._loadJS(0); });
}