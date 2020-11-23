/**
* @package      jelix
* @subpackage   forms
* @author       Laurent Jouanneau
* @contributor  Julien Issler, Dominique Papin, Litchi, Steven Jehannet, Adrien Lagroy de Croutte
* @copyright    2007-2020 Laurent Jouanneau
* @copyright    2008-2015 Julien Issler, 2008 Dominique Papin, 2011 Steven Jehannet, 2020 Adrien Lagroy de Croutte
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/*
usage :

jFormsJQ.tForm = new jFormsJQForm('name', 'selector','internalid');                         // create a form descriptor
jFormsJQ.tForm.setErrorDecorator(new jFormsJQErrorDecoratorAlert());    // declare an error handler

// declare a form control
var c = new jFormsJQControl('name', 'a label', 'datatype');
c.required = true;
c.errInvalid='';
c.errRequired='';
jFormsJQ.tForm.addControl(c);
...

// declare the form now. A 'submit" event handler will be attached to the corresponding form element
jFormsJQ.declareForm(jFormsJQ.tForm);

properties of a control object
- name
- required
- formName (added by jFormsJQForm)
- [optional] dependencies : list of ref of controls
- readonly
- errRequired (for error decorator in case of error)
- errInvalid (for error decorator in case of error)
- label (for error decorator in case of error)

Methods of a control object
- [optional] mixed getValue() : return the value of the control. If not present, get the value
  from the html element
- bool check(mixed value, jFormsJQForm form)
- [optional] getChild() : for controls that have children (groups, choice..)
-

*/

/**
 * form manager
 */
var jFormsJQ = {
    _forms: {},

    tForm: null,
    selectFillUrl : '',

    config : {},

    _submitListener : function(ev) {
        var frm = jFormsJQ.getForm(ev.target.attributes.getNamedItem("id").value);

        jQuery(ev.target).trigger('jFormsUpdateFields');

        var submitOk = true;
        try {
            for (var i=0; i< frm.preSubmitHandlers.length; i++) {
                if (!frm.preSubmitHandlers[i](ev))
                    submitOk = false;
            }

            if (!jFormsJQ.verifyForm(ev.target))
                submitOk = false;

            for (var j=0; j< frm.postSubmitHandlers.length; j++) {
                if (!frm.postSubmitHandlers[j](ev))
                    submitOk = false;
            }
        }
        catch(e) {
            return false;
        }
        return submitOk;
    },

    /**
     * @param jFormsJQForm aForm
     */
    declareForm : function(aForm){
        this._forms[aForm.name] = aForm;
        jQuery('#'+aForm.name).bind('submit', jFormsJQ._submitListener);
    },

    getForm : function (name) {
        return this._forms[name];
    },

    /**
     *  @param DOMElement frmElt  the <form> element
     */
    verifyForm : function(frmElt) {
        this.tForm = this._forms[frmElt.attributes.getNamedItem("id").value]; // we cannot use getAttribute for id because a bug with IE
        var msg = '';
        var valid = true;
        this.tForm.errorDecorator.start(this.tForm);
        for(var i =0; i < this.tForm.controls.length; i++){
            if (!this.verifyControl(this.tForm.controls[i], this.tForm))
                valid = false;
        }
        if(!valid)
            this.tForm.errorDecorator.end();
        return valid;
    },

    /**
     * @param jFormsJQControl*  ctrl     a jform control
     * @param jFormsJQForm      frm      the jform object
     */
    verifyControl : function (ctrl, frm) {
        var val;
        if(typeof ctrl.getValue == 'function') {
            val = ctrl.getValue();
        }
        else {
            var elt = frm.element.elements[ctrl.name];
            if (!elt) return true; // sometimes, all controls are not generated...
            val = this.getValue(elt);
        }

        if (val === null || val === false) {
            if (ctrl.required) {
                frm.errorDecorator.addError(ctrl, 1);
                return false;
            }
        }
        else {
            if(!ctrl.check(val, frm)){
                if (!("getChild" in ctrl)) {
                    // don't output error for groups/choice, errors on child have already been set
                    frm.errorDecorator.addError(ctrl, 2);
                }
                return false;
            }
        }
        return true;
    },

    /**
     * @param DOMElement elt
     */
    getValue : function (elt){
        if(elt.nodeType) { // this is a node
            switch (elt.nodeName.toLowerCase()) {
                case "input":
                    if(elt.getAttribute('type') == 'checkbox')
                        return elt.checked;
                case "textarea":
                    var val = jQuery.trim(elt.value);
                    return (val !== '' ? val:null);
                case "select":
                    if (!elt.multiple)
                        return (elt.value!==''?elt.value:null);
                    var values = [];
                    for (var i = 0; i < elt.options.length; i++) {
                        if (elt.options[i].selected)
                            values.push(elt.options[i].value);
                    }
                    if(values.length)
                        return values;
                    return null;
            }
        } else if(this.isCollection(elt)){
            // this is a NodeList of radio buttons or multiple checkboxes
            var values = [];
            for (var i = 0; i < elt.length; i++) {
                var item = elt[i];
                if (item.checked)
                    values.push(item.value);
            }
            if(values.length) {
                if (elt[0].getAttribute('type') == 'radio')
                    return values[0];
                return values;
            }
        }
        return null;
    },

    /**
     * @param DOMElement elt
     */
    hasClass: function (elt,clss) {
        return jQuery(elt).hasClass(clss);
    },
    addClass: function (elt,clss) {
        if (this.isCollection(elt)) {
            for(var j=0; j<elt.length;j++) {
                jQuery(elt[j]).addClass(clss);
            }
        } else {
            jQuery(elt).addClass(clss);
        }
    },
    removeClass: function (elt,clss) {
        if (this.isCollection(elt)) {
            for(var j=0; j<elt.length;j++) {
                jQuery(elt[j]).removeClass(clss);
            }
        } else {
            jQuery(elt).removeClass(clss);
        }
    },
    setAttribute: function(elt, name, value){
        if (this.isCollection(elt)) {
            for(var j=0; j<elt.length;j++) {
                elt[j].setAttribute(name, value);
            }
        } else {
            elt.setAttribute(name, value);
        }
    },
    removeAttribute: function(elt, name){
        if (this.isCollection(elt)) {
            for(var j=0; j<elt.length;j++) {
                elt[j].removeAttribute(name);
            }
        } else {
            elt.removeAttribute(name);
        }
    },
    /**
     * @param DOMElement elt
     */
    isCollection: function(elt) {
        if (typeof HTMLCollection != "undefined" && elt instanceof HTMLCollection) {
            return true;
        }
        if (typeof NodeList != "undefined" && elt instanceof NodeList) {
          return true;
        }
        if (elt instanceof Array)
            return true;
        if (elt.length != undefined && (elt.localName == undefined || elt.localName == 'SELECT' || elt.localName != 'select'))
            return true;
        return false;
    }
};

/**
 * represents a form
 */
function jFormsJQForm(name, selector, id){
    // the jelix selector corresponding to the jforms object
    this.selector = selector;

    // the jforms id (id given to jforms::get)
    this.formId = id;

    // the value of the id attribute
    this.name = name;

    this.controls = [];
    this.errorDecorator =  new jFormsJQErrorDecoratorHtml();
    this.element = jQuery('#'+name).get(0);

    this.allDependencies = {};
    this.updateInProgress = false;
    this.controlsToUpdate = [];
    this.preSubmitHandlers = [];
    this.postSubmitHandlers = [];
};

jFormsJQForm.prototype={
    /**
     * @param jFormsJQControl ctrl
     */
    addControl : function(ctrl){
        this.controls.push(ctrl);
        ctrl.formName = this.name;
    },

    setErrorDecorator : function (decorator){
        this.errorDecorator = decorator;
    },

    /**
     * @return jFormsJQControl
     */
    getControl : function(aControlName) {
        var ctrls = this.controls;
        for(var i=0; i < ctrls.length; i++){
            if (ctrls[i].name == aControlName) {
                return ctrls[i];
            }
            else if (ctrls[i].getChild){
                var child = ctrls[i].getChild(aControlName);
                if (child)
                    return child;
            }
        }
        return null;
    },

    declareDynamicFill : function (controlName) {
        var elt = this.element.elements[controlName];
        var ctrl = this.getControl(controlName);
        if (!ctrl.dependencies)
            return;

        var me = this;
        // the control has some dependencies : we put a listener
        // on these dependencies, so when these dependencies
        // change, we retrieve the new content of the control
        for(var i=0; i< ctrl.dependencies.length; i++) {
            var depName = ctrl.dependencies[i];
            var dep = this.element.elements[depName];
            if (this.allDependencies[depName] === undefined) {
                this.allDependencies[depName] = [controlName];
                jQuery(dep).change(function() {
                    me.updateLinkedElements(depName);
                });
            }
            else {
                this.allDependencies[depName].push(controlName);
            }
        }
    },

    /**
     * update the content of all elements which have the given control
     * as a dependance
     * @param string controlName
     */
    updateLinkedElements : function (controlName) {
        if (this.updateInProgress) // we don't want to call same ajax request...
            return;
        this.updateInProgress = true;
        this.buildOrderedControlsList(controlName);
        // we now have the list of controls to update, in the reverse order
        // let's start the update
        this.dynamicFillAjax();
    },

    buildOrderedControlsList : function(controlName) {
        // we should build a graph, to update elements in the right order
        this.controlsToUpdate = [];
        var alreadyCheckedControls = [];
        var checkedCircularDependency = [];
        var me = this;
        var buildListDependencies = function (controlName) {
            if (checkedCircularDependency[controlName] === true)
                throw "Circular reference !";
            checkedCircularDependency[controlName] = true;

            var list = me.allDependencies[controlName];
            if (list !== undefined) {
                for (var j=0; j< list.length; j++) {
                    if (alreadyCheckedControls[list[j]] !== true) {
                        buildListDependencies(list[j]);
                    }
                }
            }
            checkedCircularDependency[controlName] = false;
            alreadyCheckedControls[controlName] = true;
            me.controlsToUpdate.push(controlName);
        };

        var list = this.allDependencies[controlName];
        if (list !== undefined) {
            for (var i=0; i< list.length; i++) {
                checkedCircularDependency = [];
                if (alreadyCheckedControls[list[i]] !== true) {
                    buildListDependencies(list[i]);
                }
            }
        }
    },

    /**
     * It sends the values of dependencies of a control,
     * and then we retrieve the new values of this control
     */
    dynamicFillAjax : function () {
        var ctrlname = this.controlsToUpdate.pop();
        if (!ctrlname) {
            this.updateInProgress = false;
            this.controlsToUpdate = [];
            return;
        }
        var ctrl = this.getControl(ctrlname);
        var token = this.element.elements['__JFORMS_TOKEN__'];
        if (typeof token == "undefined" ) {
            token = '';
        }
        else
            token = token.value;

        var param = {
            '__form': this.selector,
            '__formid' : this.formId,
            '__JFORMS_TOKEN__' : token,
            '__ref' : ctrl.name.replace('[]','')
        };

        for(var i=0; i< ctrl.dependencies.length; i++) {
            var n = ctrl.dependencies[i];
            param[n] = jFormsJQ.getValue(this.element.elements[n]);
        }

        var elt = this.element.elements[ctrl.name];
        var me = this;

        jQuery.post(jFormsJQ.selectFillUrl, param,
            function(data){
                if(elt.nodeType && elt.nodeName.toLowerCase() == 'select') {
                    var select = jQuery(elt).eq(0);
                    var emptyitem = select.children('option[value=""]').detach();
                    select.empty();
                    if(emptyitem)
                        select.append(emptyitem);
                    jQuery.each(data, function(i, item){
                        if(typeof item.items == 'object'){
                            select.append('<optgroup label="'+item.label+'"/>');
                            var optgroup = select.children('optgroup[label="'+item.label+'"]').eq(0);
                            jQuery.each(item.items, function(i,item){
                                optgroup.append('<option value="'+item.value+'">'+item.label+'</option>');
                            });
                        }
                        else
                            select.append('<option value="'+item.value+'">'+item.label+'</option>');
                    });
                }
                if (me.controlsToUpdate.length) {
                    me.dynamicFillAjax();
                }
                else {
                    me.updateInProgress = false;
                }
            }, "json");
    },

    addSubmitHandler : function (handler, beforeCheck) {
        if (beforeCheck) {
            this.preSubmitHandlers.push(handler);
        }
        else
            this.postSubmitHandlers.push(handler);
    }
};

/**
 * control with string
 */
function jFormsJQControlString(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.minLength = -1;
    this.maxLength = -1;
    this.regexp = null;
    this.readOnly = false;
};
jFormsJQControlString.prototype.check = function (val, jfrm) {
    if(this.minLength != -1 && val.length < this.minLength)
        return false;
    if(this.maxLength != -1 && val.length > this.maxLength)
        return false;
    if (this.regexp && !this.regexp.test(val))
        return false;
    return true;
};

/**
 * control with HTML content generated by a wysiwyg editor
 */
function jFormsJQControlHtml(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.minLength = -1;
    this.maxLength = -1;
    this.readOnly = false;
};
jFormsJQControlHtml.prototype.check = function (val, jfrm) {
    if(this.minLength != -1 && val.length < this.minLength)
        return false;
    if(this.maxLength != -1 && val.length > this.maxLength)
        return false;
    return true;
};
jFormsJQControlHtml.prototype.getValue = function () {
    var frm = jFormsJQ.getForm(this.formName);
    var elt = frm.element.elements[this.name];
    if (!elt) return null;
    val = jFormsJQ.getValue(elt);
    if (val == null)
        return null;
    val = val.replace(/<(img|object|video|svg|embed)[^>]*>/gi, 'TAG'); //tags which are contents
    val = val.replace(/<\/?[\S][^>]*>/gi, '');
    val = val.replace(/&[a-z]+;/gi, '');
    val = jQuery.trim(val);
    if (val=='')
        return null;
    return val;
};


/**
 * control for secret input
 */
function jFormsJQControlSecret(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.minLength = -1;
    this.maxLength = -1;
    this.regexp = null;
    this.readOnly = false;
};
jFormsJQControlSecret.prototype.check = function (val, jfrm) {
    if(this.minLength != -1 && val.length < this.minLength)
        return false;
    if(this.maxLength != -1 && val.length > this.maxLength)
        return false;
    if (this.regexp && !this.regexp.test(val))
        return false;
    return true;
};

/**
 * confirm control
 */
function jFormsJQControlConfirm(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this._masterControl = name.replace(/_confirm$/,'');
};
jFormsJQControlConfirm.prototype.check = function(val, jfrm) {
    if(jFormsJQ.getValue(jfrm.element.elements[this._masterControl]) !== val)
        return false;
    return true;
};

/**
 * control with boolean
 */
function jFormsJQControlBoolean(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlBoolean.prototype.check = function (val, jfrm) {
    return (val == true || val == false);
};

/**
 * control with Decimal
 */
function jFormsJQControlDecimal(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.minValue = -1;
    this.maxValue = -1;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlDecimal.prototype.check = function (val, jfrm) {
    if (!(-1 != val.search(/^\s*[\+\-]?\d+(\.\d+)?\s*$/))) return false;
    if (this.minValue != -1 && parseFloat(val) < this.minValue) return false;
    if (this.maxValue != -1 && parseFloat(val) > this.maxValue) return false;
    return true;
};

/**
 * control with Integer
 */
function jFormsJQControlInteger(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.minValue = -1;
    this.maxValue = -1;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlInteger.prototype.check = function (val, jfrm) {
    if (!(-1 != val.search(/^\s*[\+\-]?\d+\s*$/))) return false;
    if (this.minValue != -1 && parseInt(val) < this.minValue) return false;
    if (this.maxValue != -1 && parseInt(val) > this.maxValue) return false;
    return true;
};

/**
 * control with Hexadecimal
 */
function jFormsJQControlHexadecimal(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlHexadecimal.prototype.check = function (val, jfrm) {
  return (val.search(/^0x[a-f0-9A-F]+$/) != -1);
};

/**
 * control with Datetime
 */
function jFormsJQControlDatetime(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.minDate = null;
    this.maxDate = null;
    this.multiFields = false;
    this.readOnly = false;
};
jFormsJQControlDatetime.prototype.check = function (val, jfrm) {
    var t = val.match(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2})(:(\d{2}))?$/);
    if(t == null) return false;
    var yy = parseInt(t[1],10);
    var mm = parseInt(t[2],10) -1;
    var dd = parseInt(t[3],10);
    var th = parseInt(t[4],10);
    var tm = parseInt(t[5],10);
    var ts = 0;
    if(t[7] != null && t[7] != "")
        ts = parseInt(t[7],10);
    var dt = new Date(yy,mm,dd,th,tm,ts);
    if(yy != dt.getFullYear() || mm != dt.getMonth() || dd != dt.getDate() || th != dt.getHours() || tm != dt.getMinutes() || ts != dt.getSeconds())
        return false;
    else if((this.minDate !== null && val < this.minDate) || (this.maxDate !== null && val > this.maxDate))
        return false;
    return true;
};
jFormsJQControlDatetime.prototype.getValue = function(){
    if (!this.multiFields) {
        var val = jQuery.trim(jQuery('#'+this.formName+'_'+this.name).val());
        return (val!==''?val:null);
    }

    var controlId = '#'+this.formName+'_'+this.name;
    var v = jQuery(controlId+'_year').val() + '-'
        + jQuery(controlId+'_month').val() + '-'
        + jQuery(controlId+'_day').val() + ' '
        + jQuery(controlId+'_hour').val() + ':'
        + jQuery(controlId+'_minutes').val();

    var secondsControl = jQuery('#'+this.formName+'_'+this.name+'_seconds');
    if(secondsControl.attr('type') !== 'hidden'){
        v += ':'+secondsControl.val();
        if(v == '-- ::')
            return null;
    }
    else if(v == '-- :')
        return null;
    return v;
};
jFormsJQControlDatetime.prototype.deactivate = function(deactivate){
    var controlId = '#'+this.formName+'_'+this.name;
    if(deactivate){
        if (!this.multiFields)
            jQuery(controlId).attr('disabled','disabled').addClass('jforms-disabled').trigger('jFormsActivateControl', false);
        else{
            jQuery(controlId+'_year').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_month').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_day').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_hour').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_minutes').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_seconds').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_hidden').trigger('jFormsActivateControl', false);
        }
    }
    else{
        if (!this.multiFields)
            jQuery(controlId).removeAttr('disabled').removeClass('jforms-disabled').trigger('jFormsActivateControl', true);
        else{
            jQuery(controlId+'_year').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_month').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_day').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_hour').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_minutes').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_seconds').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_hidden').trigger('jFormsActivateControl', true);
        }
    }
};

/**
 * control with Date
 */
function jFormsJQControlDate(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.multiFields = false;
    this.minDate = null;
    this.maxDate = null;
    this.readOnly = false;
};
jFormsJQControlDate.prototype.check = function (val, jfrm) {
    var t = val.match(/^(\d{4})\-(\d{2})\-(\d{2})$/);
    if(t == null) return false;
    var yy = parseInt(t[1],10);
    var mm = parseInt(t[2],10) -1;
    var dd = parseInt(t[3],10);
    var dt = new Date(yy,mm,dd,0,0,0);
    if(yy != dt.getFullYear() || mm != dt.getMonth() || dd != dt.getDate())
        return false;
    else if((this.minDate !== null && val < this.minDate) || (this.maxDate !== null && val > this.maxDate))
        return false;
    return true;
};
jFormsJQControlDate.prototype.getValue = function(){
    if (!this.multiFields) {
        var val = jQuery.trim(jQuery('#'+this.formName+'_'+this.name).val());
        return (val!==''?val:null);
    }

    var controlId = '#'+this.formName+'_'+this.name;
    var v = jQuery(controlId+'_year').val() + '-'
        + jQuery(controlId+'_month').val() + '-'
        + jQuery(controlId+'_day').val();
    if(v == '--')
        return null;
    return v;
};
jFormsJQControlDate.prototype.deactivate = function(deactivate){
    var controlId = '#'+this.formName+'_'+this.name;
    if(deactivate){
        if (!this.multiFields)
            jQuery(controlId).attr('disabled','disabled').addClass('jforms-disabled').trigger('jFormsActivateControl', false);
        else{
            jQuery(controlId+'_year').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_month').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_day').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_hidden').trigger('jFormsActivateControl', false);
        }
    }
    else{
        if (!this.multiFields)
            jQuery(controlId).removeAttr('disabled').removeClass('jforms-disabled').trigger('jFormsActivateControl', true);
        else{
            jQuery(controlId+'_year').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_month').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_day').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_hidden').trigger('jFormsActivateControl', true);
        }
    }
};

/**
 * control with time
 */
function jFormsJQControlTime(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
};
jFormsJQControlTime.prototype.check = function (val, jfrm) {
    var t = val.match(/^(\d{2}):(\d{2})(:(\d{2}))?$/);
    if(t == null) return false;
    var th = parseInt(t[1],10);
    var tm = parseInt(t[2],10);
    var ts = 0;
    if(t[4] != null)
        ts = parseInt(t[4],10);
    var dt = new Date(2007,5,2,th,tm,ts);
    if(th != dt.getHours() || tm != dt.getMinutes() || ts != dt.getSeconds())
        return false;
    else if((this.minTime !== null && val < this.minTime) || (this.maxTime !== null && val > this.maxTime))
        return false;
    else
        return true;
};

/**
 * control with time for jForms
 */
function jFormsJQControlTime2(name, label) {
    this.name = name;
    this.label = label;
    this.multiFields = false;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.minTime = null;
    this.maxTime = null;
    this.readOnly = false;
};
jFormsJQControlTime2.prototype.check = function (val, jfrm) {
    var t = val.match(/^(\d{2}):(\d{2})(:(\d{2}))?$/);
    if(t == null) return false;
    var th = parseInt(t[1],10);
    var tm = parseInt(t[2],10);
    var ts = 0;
    if(t[4] != null)
        ts = parseInt(t[4],10);
    var dt = new Date(2007,5,2,th,tm,ts);
    if(th != dt.getHours() || tm != dt.getMinutes() || ts != dt.getSeconds())
        return false;
    else
        return true;
};
jFormsJQControlTime2.prototype.getValue = function(){
    if (!this.multiFields) {
        var val = jQuery.trim(jQuery('#'+this.formName+'_'+this.name).val());
        return (val !=='' ? val : null);
    }

    var controlId = '#' + this.formName + '_' + this.name;
    var v = jQuery(controlId+'_hour').val() + ':'
        + jQuery(controlId+'_minutes').val();

    var secondsControl = jQuery('#'+this.formName+'_'+this.name+'_seconds');
    if(secondsControl.attr('type') !== 'hidden'){
        v += ':'+secondsControl.val();
        if(v == '::')
            return null;
    }
    else if(v == ':')
        return null;
    return v;
};
jFormsJQControlTime2.prototype.deactivate = function(deactivate){
    var controlId = '#' + this.formName + '_' + this.name;
    if(deactivate){
        if (!this.multiFields)
            jQuery(controlId).attr('disabled','disabled').addClass('jforms-disabled').trigger('jFormsActivateControl', false);
        else{
            jQuery(controlId+'_hour').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_minutes').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_seconds').attr('disabled','disabled').addClass('jforms-disabled');
            jQuery(controlId+'_hidden').trigger('jFormsActivateControl', false);
        }
    }
    else{
        if (!this.multiFields)
            jQuery(controlId).removeAttr('disabled').removeClass('jforms-disabled').trigger('jFormsActivateControl', true);
        else{
            jQuery(controlId+'_hour').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_minutes').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_seconds').removeAttr('disabled').removeClass('jforms-disabled');
            jQuery(controlId+'_hidden').trigger('jFormsActivateControl', true);
        }
    }
};

/**
 * control with LocaleDateTime
 */
function jFormsJQControlLocaleDatetime(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.lang='';
    this.readOnly = false;
};
jFormsJQControlLocaleDatetime.prototype.check = function (val, jfrm) {
    var yy, mm, dd, th, tm, ts;
    if(this.lang.indexOf('fr_') == 0) {
        var t = val.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})(:(\d{2}))?$/);
        if(t == null) return false;
        yy = parseInt(t[3],10);
        mm = parseInt(t[2],10) -1;
        dd = parseInt(t[1],10);
        th = parseInt(t[4],10);
        tm = parseInt(t[5],10);
        ts = 0;
        if(t[7] != null)
            ts = parseInt(t[7],10);
    }else{
        //default is en_* format
        var t = val.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})(:(\d{2}))?$/);
        if(t == null) return false;
        yy = parseInt(t[3],10);
        mm = parseInt(t[1],10) -1;
        dd = parseInt(t[2],10);
        th = parseInt(t[4],10);
        tm = parseInt(t[5],10);
        ts = 0;
        if(t[7] != null)
            ts = parseInt(t[7],10);
    }
    var dt = new Date(yy,mm,dd,th,tm,ts);
    if(yy != dt.getFullYear() || mm != dt.getMonth() || dd != dt.getDate() || th != dt.getHours() || tm != dt.getMinutes() || ts != dt.getSeconds())
        return false;
    else
        return true;
};

/**
 * control with localedate
 */
function jFormsJQControlLocaleDate(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.lang='';
    this.readOnly = false;
};
jFormsJQControlLocaleDate.prototype.check = function (val, jfrm) {
    var yy, mm, dd;
    if(this.lang.indexOf('fr_') == 0) {
        var t = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if(t == null) return false;
        yy = parseInt(t[3],10);
        mm = parseInt(t[2],10) -1;
        dd = parseInt(t[1],10);
    }else{
        //default is en_* format
        var t = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if(t == null) return false;
        yy = parseInt(t[3],10);
        mm = parseInt(t[1],10) -1;
        dd = parseInt(t[2],10);
    }
    var dt = new Date(yy,mm,dd,0,0,0);
    if(yy != dt.getFullYear() || mm != dt.getMonth() || dd != dt.getDate())
        return false;
    else
        return true;
};

/**
 * control with Url
 */
function jFormsJQControlUrl(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlUrl.prototype.check = function (val, jfrm) {
    return (val.search(/^[a-z]+:\/\/((((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9])))|((([A-Za-z0-9\-])+\.)+[A-Za-z\-]+))((\/)|$)/) != -1);
};

/**
 * control with email
 */
function jFormsJQControlEmail(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlEmail.prototype.check = function (val, jfrm) {
    return (val.search(/^((\"[^\"f\n\r\t\b]+\")|([\w\!\#\$\%\&\'\*\+\-\~\/\^\`\|\{\}]+(\.[\w\!\#\$\%\&\'\*\+\-\~\/\^\`\|\{\}]+)*))@((\[(((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9])))\])|(((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9])))|((([A-Za-z0-9\-])+\.)+[A-Za-z\-]+))$/) != -1);
};


/**
 * control with ipv4
 */
function jFormsJQControlIpv4(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlIpv4.prototype.check = function (val, jfrm) {
    var t = val.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if(t)
        return (t[1] < 256 && t[2] < 256 && t[3] < 256 && t[4] < 256);
    return false;
};

/**
 * control with ipv6
 */
function jFormsJQControlIpv6(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
};
jFormsJQControlIpv6.prototype.check = function (val, jfrm) {
    return (val.search(/^([a-f0-9]{1,4})(:([a-f0-9]{1,4})){7}$/i) != -1);
};

/**
 * choice control
 */
function jFormsJQControlChoice(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.items = {};
    this.readOnly = false;
};
jFormsJQControlChoice.prototype = {
    addControl : function (ctrl, itemValue) {
        if (this.items[itemValue] === undefined) {
            this.items[itemValue] = [];
        }
        if (ctrl) { // a choice item can be empty
            this.items[itemValue].push(ctrl);
            ctrl.formName = this.formName;
        }
    },
    getChild : function (aControlName) {
        for (var it in this.items) {
            for (var i=0; i < this.items[it].length; i++) {
                var c = this.items[it][i];
                if (c.name == aControlName)
                    return c;
            }
        }
        return null;
    },
    check : function (val, jfrm) {
        if(this.items[val] == undefined)
            return false;

        var list = this.items[val];
        var valid = true;
        for(var i=0; i < list.length; i++) {
            var ctrlvalid = jFormsJQ.verifyControl(list[i], jfrm);
            if (!ctrlvalid)
                valid = false;
        }
        return valid;
    },
    activate : function (val) {
        var frmElt = document.getElementById(this.formName);
        for(var j in this.items) {
            var list = this.items[j];
            var htmlItem = document.getElementById(this.formName+'_'+this.name+'_'+j+'_item');
            if (htmlItem) {
                if (val == j) {
                    jFormsJQ.addClass(htmlItem, "jforms-selected");
                    jFormsJQ.removeClass(htmlItem, "jforms-notselected");
                }
                else {
                    jFormsJQ.removeClass(htmlItem, "jforms-selected");
                    jFormsJQ.addClass(htmlItem, "jforms-notselected");
                }
            }
            for(var i=0; i < list.length; i++) {
                var ctl = list[i];
                if(typeof ctl.deactivate == 'function'){
                    if (ctl.readOnly)
                        ctl.deactivate(true);
                    else
                        ctl.deactivate(val != j);
                    continue;
                }
                var elt = frmElt.elements[ctl.name];
                if (val == j && !ctl.readOnly) {
                    jFormsJQ.removeAttribute(elt, "disabled");
                    jFormsJQ.removeClass(elt, "jforms-disabled");
                } else {
                    jFormsJQ.setAttribute(elt, "disabled", "disabled");
                    jFormsJQ.addClass(elt, "jforms-disabled");
                }
            }
        }
    }
};

/**
 * group control
 */
function jFormsJQControlGroup(name, label) {
    this.name = name;
    this.label = label;
    this.required = false;
    this.errInvalid = '';
    this.errRequired = '';
    this.readOnly = false;
    this.children = [];
    this.hasCheckbox = false;
};
jFormsJQControlGroup.prototype = {
    addControl : function (ctrl, itemValue) {
        this.children.push(ctrl);
        ctrl.formName = this.formName;
    },
    getChild : function (aControlName) {
        for (var i=0; i < this.children.length; i++) {
            var c = this.children[i];
            if (c.name == aControlName)
                return c;
        }
        return null;
    },
    check : function (val, jfrm) {
        if (this.hasCheckbox) {
            var chk = document.getElementById(this.formName+'_'+this.name+'_checkbox');
            if (!chk.checked) {
                return true;
            }
        }
        var valid = true;
        for(var i=0; i < this.children.length; i++) {
            var ctrlvalid = jFormsJQ.verifyControl(this.children[i], jfrm);
            if (!ctrlvalid) {
                valid = false;
            }
        }
        return valid;
    },
    activate: function(yes) {
        var checkboxItem = document.getElementById(this.formName+'_'+this.name+'_checkbox');
        if (checkboxItem) {
            if (yes) {
                checkboxItem.setAttribute('checked', 'true');
            }
            else {
                checkboxItem.removeAttribute('checked');
            }
            this.showActivate();
        }
    },
    showActivate : function () {
        var checkboxItem = document.getElementById(this.formName+'_'+this.name+'_checkbox');
        if (!this.hasCheckbox || !checkboxItem) {
            return;
        }
        var fieldset = document.getElementById(this.formName+'_'+this.name);
        var frmElt = document.getElementById(this.formName);

        var toactivate = checkboxItem.checked;
        if (toactivate) {
            jFormsJQ.removeClass(fieldset, "jforms-notselected");
        }
        else {
            jFormsJQ.addClass(fieldset, "jforms-notselected");
        }
        for(var i=0; i < this.children.length; i++) {
            var ctl = this.children[i];
            if(typeof ctl.deactivate == 'function'){
                if (ctl.readOnly) {
                    ctl.deactivate(true);
                } else {
                    ctl.deactivate(!toactivate);
                }
                continue;
            }
            var elt = frmElt.elements[ctl.name];
            if (toactivate && !ctl.readOnly) {
                jFormsJQ.removeAttribute(elt, "disabled");
                jFormsJQ.removeClass(elt, "jforms-disabled");
            } else {
                jFormsJQ.setAttribute(elt, "disabled", "disabled");
                jFormsJQ.addClass(elt, "jforms-disabled");
            }
        }
    }
};




/**
 * Decorator to display errors in an alert dialog box
 */
function jFormsJQErrorDecoratorAlert(){
    this.message = '';
};

jFormsJQErrorDecoratorAlert.prototype = {
    start : function(form){
        this.message = '';
    },
    addError : function(control, messageType){
        if(messageType == 1){
            this.message  +="* "+control.errRequired + "\n";
        }else if(messageType == 2){
            this.message  +="* "+control.errInvalid + "\n";
        }else{
            this.message  += "* Error on '"+control.label+"' field\n";
        }
    },
    end : function(){
        if(this.message != ''){
            alert(this.message);
        }
    }
};

function jFormsJQErrorDecoratorHtml(){
    this.message = '';
};

jFormsJQErrorDecoratorHtml.prototype = {
    start : function(form){
        this.message = '';
        this.form = form;
        jQuery("#"+form.name+" .jforms-error").removeClass('jforms-error');
        $('#'+this.form.name+'_errors').empty().hide();
    },
    addError : function(control, messageType){
        var elt = this.form.element.elements[control.name];
        if (elt && elt.nodeType) {
            jQuery(elt).addClass('jforms-error');
        }
        var name = control.name.replace(/\[\]/, '');
        jQuery("#"+this.form.name+"_"+name+"_label").addClass('jforms-error');

        if(messageType == 1){
            this.message  += '<li class="error"> '+control.errRequired + "</li>";
        }else if(messageType == 2){
            this.message  += '<li class="error"> ' +control.errInvalid + "</li>";
        }else{
            this.message  += '<li class="error"> Error on \''+control.label+"' </li>";
        }
    },
    end : function(){
        var errid = this.form.name+'_errors';
        var ul = document.getElementById(errid);
        if(this.message != ''){
            if (!ul) {
                ul = document.createElement('ul');
                ul.setAttribute('class', 'jforms-error-list');
                ul.setAttribute('id', errid);
                jQuery(this.form.element).first().before(ul);
            }
            var jul = jQuery(ul);
            location.hash = "#"+errid;
            jul.hide().html(this.message).fadeIn();
        }
        else if (ul) {
            jQuery(ul).hide();
        }
    }
};
