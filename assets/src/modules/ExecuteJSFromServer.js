export default function executeJSFromServer() {
    lizMap.events.on({
        uicreated: () => {
            if (document.body.dataset.lizmapPluginWarningUrl) {
                var message = lizDict['project.has.warnings'];
                message += `<br><a href="${document.body.dataset.lizmapPluginWarningUrl}">`;
                message += lizDict['project.has.warnings.link'];
                message += '</a>'
                lizMap.addMessage(message, 'warning', true).attr('id', 'lizmap-warning-message');
            }

            if (document.body.dataset.lizmapHideLegend) {
                document.querySelector('li.switcher.active #button-switcher').click();
            }
        }
    });

    if (document.body.dataset.lizmapEmbed) {
        lizMap.events.on({
            uicreated: () => {
                // it's an embedded content
                $('#content').addClass('embed');

                // move tooltip placement
                $('#mapmenu .nav-list > li > a').tooltip('destroy').tooltip({ placement: 'bottom' });

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
                if ($('#mapmenu li.locate').hasClass('active'))
                    $('#button-locate').click();
                if ($('#mapmenu li.switcher').hasClass('active'))
                    $('#button-switcher').click();

                $('#mapmenu .nav-list > li.permaLink a').attr('data-original-title', lizDict['embed.open.map']);
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