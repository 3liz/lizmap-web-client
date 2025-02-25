/**
 * Execute JS from server
 */
export default function executeJSFromServer() {
    lizMap.events.on({
        uicreated: () => {
            // skipWarningsDisplay is used in tests, to skip a possible warnings about old QGIS plugin used
            if (!document.body.dataset.skipWarningsDisplay){
                displayWarningsAdministrator();
            }

            if (document.body.dataset.lizmapHideLegend) {
                document.querySelector('li.switcher.active #button-switcher')?.click();
            }
        }
    });

    if (document.body.dataset.lizmapEmbed) {
        lizMap.events.on({
            uicreated: () => {
                // it's an embedded content
                $('#content').addClass('embed');

                // move tooltip placement to bottom
                const tooltipTriggerList = document.querySelectorAll('#mapmenu .nav-list > li > a');
                [...tooltipTriggerList].map(tooltipTriggerEl => {
                    bootstrap.Tooltip.getInstance(tooltipTriggerEl).dispose();
                    new bootstrap.Tooltip(tooltipTriggerEl, { placement: 'bottom', trigger: 'hover' });
                });

                // move search tool
                var search = $('#nominatim-search');
                if (search.length != 0) {
                    $('#mapmenu').append(search);
                    $('#nominatim-search div.dropdown-menu').removeClass('pull-right').addClass('pull-left');
                }

                //calculate dock position and size
                $('#dock').css('top', ($('#mapmenu').height() + 10) + 'px');
                lizMap.updateContentSize();

                // force mini-dock and sub-dock position
                $('#mini-dock').css('top', $('#dock').css('top'));
                $('#sub-dock').css('top', $('#dock').css('top'));

                // Force display popup on the map
                lizMap.config.options.popupLocation = 'map';

                // Force close tools
                if ($('#mapmenu li.locate').hasClass('active')){
                    document.getElementById('button-locate')?.click();
                }
                if ($('#mapmenu li.switcher').hasClass('active')){
                    document.getElementById('button-switcher')?.click();
                }

                $('#mapmenu .nav-list > li.permaLink a').attr('data-bs-toggle', 'tooltip').attr('data-bs-title', lizDict['embed.open.map']);
            },
            dockopened: () => {
                // one tool at a time
                var activeMenu = $('#mapmenu ul li.nav-minidock.active a');
                if (activeMenu.length != 0)
                    activeMenu.click();
            },
            minidockopened: evt => {
                // one tool at a time
                var activeMenu = $('#mapmenu ul li.nav-dock.active a');
                if (activeMenu.length != 0)
                    activeMenu.click();

                // adapte locateByLayer display
                if (evt.id == 'locate') {
                    // autocompletion items for locatebylayer feature
                    $('div.locate-layer select').hide();
                    $('span.custom-combobox').show();
                    $('#locate div.locate-layer input.custom-combobox-input').autocomplete('option', 'position', { my: 'left top', at: 'left bottom' });
                }

                if (evt.id == 'permaLink') {
                    window.open(window.location.href.replace('embed', 'map'));
                    $('#mapmenu ul li.nav-minidock.active a').click();
                    return false;
                }
            }
        });
    }
}

/**
 * Display messages to the user about deprecated features or outdated versions.
 */
function displayWarningsAdministrator() {
    if (document.body.dataset.lizmapPluginUpdateWarningUrl) {
        var messageOutdatedWarning = lizDict['project.plugin.outdated.warning'];
        messageOutdatedWarning += `<br><a href="${document.body.dataset.lizmapPluginUpdateWarningUrl}">`;
        messageOutdatedWarning += lizDict['visit.admin.panel.project.page'];
        messageOutdatedWarning += '</a>';
        messageOutdatedWarning += '<br>';
        messageOutdatedWarning += lizDict['project.admin.panel.info'];
        // The plugin can be easily updated, the popup can not be closed
        lizMap.addMessage(messageOutdatedWarning, 'warning', false).attr('id', 'lizmap-warning-message');
    } else if (document.body.dataset.lizmapPluginHasWarningsUrl) {
        var messageHasWarnings = lizDict['project.has.warnings'];
        messageHasWarnings += `<br><a href="${document.body.dataset.lizmapPluginHasWarningsUrl}">`;
        messageHasWarnings += lizDict['visit.admin.panel.project.page'];
        messageHasWarnings += '</a>';
        messageHasWarnings += '<br>';
        messageHasWarnings += lizDict['project.admin.panel.info'];
        // It can take times to fix these issues, the popup can be closed
        lizMap.addMessage(messageHasWarnings, 'warning', true).attr('id', 'lizmap-warning-message');
    }

    if (document.body.dataset.lizmapActionWarningOld) {
        lizMap.addMessage(document.body.dataset.lizmapActionWarningOld,'info',true).attr('id','lizmap-action-message');
    }
}
