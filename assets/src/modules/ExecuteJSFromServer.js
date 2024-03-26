export default function executeJSFromServer () {
    if (document.body.dataset.lizmapPluginWarningUrl){
        var message = lizDict['project.has.warnings'];
        message += `<br><a href="${document.body.dataset.lizmapPluginWarningUrl}">`;
        message += lizDict['project.has.warnings.link'];
        message += '</a>'
        lizMap.addMessage(message, 'warning', true).attr('id', 'lizmap-warning-message');
    }

    if (document.body.dataset.lizmapHideLegend){
        document.querySelector('li.switcher.active #button-switcher').click();
    }
}