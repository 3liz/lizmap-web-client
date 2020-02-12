/**
 * @package      jelix
 * @subpackage   forms
 * @author       Laurent Jouanneau
 * @copyright    2020 Laurent Jouanneau
 * @link         https://jelix.org
 * @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Initialize a choice control for jForms
 *
 * @param {String} ulSelector
 * @param {jFormsJQ} jformsManager
 * @param {Function} callbackActivate
 */
function jFormsInitChoiceControl(ulSelector, jformsManager, callbackActivate) {

    var ul = document.querySelector(ulSelector);

    var choiceProp = JSON.parse(ul.dataset.jformsChoiceProps);

    var formName = choiceProp.jformsName;
    var radioName = choiceProp.radioName;
    var itemIdPrefix = choiceProp.itemIdPrefix;

    var c = new jFormsJQControlChoice(radioName, choiceProp.label);
    if (choiceProp.readOnly) {
        c.readOnly = true;
    }
    c.required = true;
    jformsManager.tForm.addControl(c);
    var c2 = c;

    var itemKeepItem = document.getElementById(itemIdPrefix+'keep_item');
    if (itemKeepItem) {
        itemKeepItem.addEventListener('click', function(ev) {
            jformsManager.getForm(formName).getControl(radioName).activate('keep');
            if (callbackActivate) {
                callbackActivate('keep')
            }
        }, false);
        c2.items['keep']=[];
    }
    var item = document.getElementById(itemIdPrefix+'keepnew_item');
    if (item) {
        item.addEventListener('click', function(ev) {
            jformsManager.getForm(formName).getControl(radioName).activate('keepnew');
            if (callbackActivate) {
                callbackActivate('keepnew')
            }
        }, false);
        c2.items['keepnew']=[];
    }
    item = document.getElementById(itemIdPrefix+'new_item');
    if (item) {
        item.addEventListener('click', function(ev) {
            jformsManager.getForm(formName).getControl(radioName).activate('new');
            if (callbackActivate) {
                callbackActivate('new')
            }
        }, false);
        c = new jFormsJQControlString(choiceProp.ref);
        c.readOnly = choiceProp.readOnly;
        c.required = choiceProp.required;
        c.errRequired = choiceProp.alertRequired;
        c.errInvalid = choiceProp.alertInvalid;
        c2.addControl(c, 'new');

        /*if (itemKeepItem) {
            var btnModify = ul.querySelector('.jforms-image-modify-btn');
            if (btnModify) {
                btnModify.addEventListener('click', function(ev) {

                }, false);
            }
        }*/
    }

    item = document.getElementById(itemIdPrefix+'del_item');
    if (item) {
        item.addEventListener('click', function(ev) {
            jformsManager.getForm(formName).getControl(radioName).activate('del');
            if (callbackActivate) {
                callbackActivate('del')
            }
        }, false);
        c2.items['del']=[];
    }

    if (choiceProp.currentAction) {
        c2.activate(choiceProp.currentAction);
        if (callbackActivate) {
            callbackActivate(choiceProp.currentAction)
        }
    }
}

/**
 * Initialize an input when the choice control is empty
 *
 * @param {String} inputSelector
 * @param {jFormsJQ} jformsManager
 */
function jFormsInitChoiceControlSingleItem(inputSelector, jformsManager) {
    var input = document.querySelector(inputSelector);
    var props = JSON.parse(input.dataset.jformsInputProps);
    var c = new jFormsJQControlString(props.ref, props.label);
    c.readOnly = props.readOnly;
    c.required = props.required;
    c.errRequired = props.alertRequired;
    c.errInvalid = props.alertInvalid;
    jformsManager.tForm.addControl(c);
}
