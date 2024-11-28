
var JelixPasswordEditor = {

    initEditor: function (passwordGroup, ctrl) {
        const buttonRegen = passwordGroup.querySelector('.jforms-password-regenerate');
        const buttonCopy = passwordGroup.querySelector('.jforms-password-copy');
        const buttonToggleVisibility = passwordGroup.querySelector('.jforms-password-toggle-visibility');
        const inputEl = passwordGroup.querySelector('input');
        const scoreLabel = passwordGroup.querySelector('.jforms-password-score');
        let minlength = 12;
        let maxlength = 120;

        let timerID = null;

        if (inputEl.minLength > 0) {
            minlength = inputEl.minLength;
        }
        if (inputEl.maxLength > 0) {
            maxlength = inputEl.maxLength;
        }

        let launchTimerListener = function() {
            if (timerID) {
                window.clearTimeout(timerID);
            }
            timerID = window.setTimeout(function(){
                timerID = null;
                JelixPasswordEditor.showScore(inputEl.value, scoreLabel, minlength, maxlength);
            }, 500);
        };

        let activateButtons = function() {
            buttonRegen.removeAttribute('disabled');
            buttonCopy.removeAttribute('disabled');
            buttonToggleVisibility.removeAttribute('disabled');
        };

        let deactivateButtons = function() {
            buttonRegen.setAttribute('disabled','disabled');
            buttonCopy.setAttribute('disabled','disabled');
            buttonToggleVisibility.setAttribute('disabled','disabled');
        };

        if (inputEl.hasAttribute('disabled')) {
            deactivateButtons();
        }

        buttonRegen.addEventListener('click',  function () {
            let password = JelixPasswordEditor.generatePassword(minlength, Math.min(maxlength, 30));
            inputEl.setAttribute('value', password);
            inputEl.value = password;
            launchTimerListener();
        });
        buttonToggleVisibility.addEventListener('click', function () {
            JelixPasswordEditor.togglePasswordVisibility(inputEl, buttonToggleVisibility, ctrl);
        })

        if (typeof(navigator.clipboard) === "undefined" || navigator.clipboard === null) {
            buttonCopy.style.display = "none";
        }
        else {
            buttonCopy.addEventListener('click', function () {
                navigator.clipboard.writeText(inputEl.value)
            });
        }


        inputEl.addEventListener('keyup', function () {
            launchTimerListener();
        });

        /*inputEl.addEventListener('change', function () {
            JelixPasswordEditor.showScore(inputEl.value, scoreLabel);
        });*/

        inputEl.addEventListener('focus', function () {
            launchTimerListener();
        });

        inputEl.addEventListener('blur', function () {
            launchTimerListener();
        });

        ctrl.check = (function (val, jfrm) {
            if(this.minLength != -1 && val.length < this.minLength)
                return false;
            if(this.maxLength != -1 && val.length > this.maxLength)
                return false;

            let score = JelixPasswordEditor.scorePassword(inputEl.value, this.minLength, this.maxLength);
            return (score === 'good' || score === 'strong');
        }).bind(ctrl);

        ctrl.deactivate = (function(deactivate){
            if(deactivate){
                deactivateButtons();
            }
            else{
                activateButtons();
            }
        }).bind(ctrl);

    },

    initSimple: function (passwordGroup, ctrl) {

        const buttonToggleVisibility = passwordGroup.querySelector('.jforms-password-toggle-visibility');
        const inputEl = passwordGroup.querySelector('input');

        let activateButtons = function() {
            buttonToggleVisibility.removeAttribute('disabled');
        };

        let deactivateButtons = function() {
            buttonToggleVisibility.setAttribute('disabled','disabled');
        };

        if (inputEl.hasAttribute('disabled')) {
            deactivateButtons();
        }

        buttonToggleVisibility.addEventListener('click', function () {
            JelixPasswordEditor.togglePasswordVisibility(inputEl, buttonToggleVisibility, ctrl);
        })

        ctrl.deactivate = (function(deactivate){
            if(deactivate){
                deactivateButtons();
            }
            else{
                activateButtons();
            }
        }).bind(ctrl);

    },

    generatePassword: function(minLength, maxLength) {
        const length = Math.floor((Math.random() * (maxLength - minLength)) + minLength);
        const charset = "abcdefghijklmnopqrstuvwxyz!=()-_abcdefghijklmnopqrstuvwxyz%#[]{}ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\$*%?;ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:, <>";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },

    togglePasswordVisibility: function (inputEl, buttonToggleVisibility, ctrl)
    {
        if (inputEl.type === "password") {
            inputEl.type = "text";

            ctrl.toggleEyeDesign(buttonToggleVisibility, 'show');
        } else {
            inputEl.type = "password";
            ctrl.toggleEyeDesign(buttonToggleVisibility, 'hide');
        }
    },

    showScore: function(pass, scoreLabel, minLength, maxLength)
    {
        scoreLabel.classList.remove('score-strong');
        scoreLabel.classList.remove('score-good');
        scoreLabel.classList.remove('score-weak');
        scoreLabel.classList.remove('score-poor');
        scoreLabel.classList.remove('score-badpass');

        let score = this.scorePassword(pass, minLength, maxLength);
        if (score != '') {
            scoreLabel.textContent = scoreLabel.dataset[score+'Score'];
            scoreLabel.classList.add('score-'+score);
        }
        else {
            scoreLabel.textContent = '';
        }
    },
    scorePassword : function (pass, minLength, maxLength) {
        let score = 0;

        if (pass == '')
            return "";

        if (minLength > 0 && pass.length < minLength)
            return "poor";


        let poolSize = 0;
        poolSize += /[A-Z]/.test(pass) ? 26 : 0;
        poolSize += /[a-z]/.test(pass) ? 26 : 0;
        poolSize += /[0-9]/.test(pass) ? 10 : 0;
        poolSize += /_/.test(pass) ? 1 : 0;
        poolSize += / /.test(pass) ? 1 : 0;
        poolSize += /@/.test(pass) ? 1 : 0;
        poolSize += /[éèêÈÉÊçÇàÀßùÙ]/.test(pass) ? 13 : 0;
        poolSize += /[îûôâëäöïüÿðÂÛÎÔÖÏÜËÄŸ]/.test(pass) ? 21 : 0;
        poolSize += /[æœÆŒ]/.test(pass) ? 4 : 0;
        poolSize += /[\-−‑–—]/.test(pass) ? 5 : 0;
        poolSize += /["'()!:;,?«»¿¡‚„“”…]/.test(pass) ? 18 : 0;
        poolSize += /[+*/×÷≠]/.test(pass) ? 6 : 0;
        poolSize += /[&$£%µ€#¢]/.test(pass) ? 7 : 0;
        poolSize += /[²Ø~©®™]/.test(pass) ? 6 : 0;
        poolSize += /[¬ ÞĿÐ¥þ↓←↑→⋅∕]/.test(pass) ? 13 : 0;
        poolSize += /[\[\]{}|]/.test(pass) ? 5 : 0;

        let entropy =  pass.length * Math.log2(poolSize);

        if (entropy < 25)
            return "poor";
        if (entropy < 50)
            return "weak";

        if (JelixPasswordEditorPasswords.some((badpassword) => {
            return (new RegExp("(^|\\s)"+badpassword+"($|\\s)")).test(pass);

        })) {
            return "badpass"
        }

        if (entropy < 100)
            return "good";
        return "strong";
    }

}



