function bootstrapErrorDecoratorHtml(){
    this.message = '';
};

bootstrapErrorDecoratorHtml.prototype = {
    start : function(form){
        this.message = '';
        this.form = form;
    },
    addError : function(control, messageType){
        if(messageType == 1){
            this.message += '<p class="error"> '+control.errRequired + "</p>";
        }else if(messageType == 2){
            this.message += '<p class="error"> ' +control.errInvalid + "</p>";
        }else{
            this.message += '<p class="error"> Error on \''+control.label+"' </p>";
        }
    },
    end : function(){
        var errid = this.form.name+'_errors';
        var div = document.getElementById(errid);
        if(this.message != ''){
            if (!div) {
                div = document.createElement('div');
                div.setAttribute('class', 'alert alert-danger jforms-error-list');
                div.setAttribute('id', errid);
                this.form.element.firstChild.insertBefore(div, this.form.element.firstChild.firstChild);
            }
            //location.href="#"+errid;
            div.innerHTML = this.message;
        }
        else if (div) {
            div.style.display='none';
        }
    }
};
