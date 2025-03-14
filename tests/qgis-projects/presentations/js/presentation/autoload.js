// Javascript file to hide buttons which are not necessary for the demonstration
// or to activate a key feature by default in the project
lizMap.events.on({
    'uicreated': function(){
        $('#button-switcher').hide();
        $('#button-metadata').hide();
        $('#button-attributeLayers').hide();
        $('#button-altiProfil').hide();
        $('#button-permaLink').hide();
        $('#button-presentation').click();
    }
});
