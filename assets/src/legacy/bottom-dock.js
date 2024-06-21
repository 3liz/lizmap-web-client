/**
 * @module legacy/bottom-dock.js
 * @name BottomDock
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

var bottomDockFunction = function() {

    lizMap.events.on({
        'uicreated':function(){

            // Attributes
            var bottomDockFullsize = false;

            // Bind bottom dock buttons actions

            // Close button
            $('#bottom-dock .btn-bottomdock-clear')
                .click(function() {
                    document.querySelector('#mapmenu li.nav-bottomdock.active').classList.remove('active');
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-danger'); },
                    function(){ $(this).removeClass('btn-danger'); }
                );

            // Size button
            $('#bottom-dock .btn-bottomdock-size')
                .click(function() {
                    if ( bottomDockFullsize ) {
                        bottomDockFullsize = false;
                        $(this)
                            .removeClass('active')
                            .attr(
                                'title',
                                lizDict['bottomdock.toolbar.btn.size.maximize.title']
                            )
                            .html(lizDict['bottomdock.toolbar.btn.size.maximize.title']);
                        $('#bottom-dock').removeClass('fullsize');
                        lizMap.events.triggerEvent('bottomdocksizechanged', {'size': 'half'} );
                    }
                    else {
                        bottomDockFullsize = true;
                        $(this).addClass('active')
                            .attr(
                                'title',
                                lizDict['bottomdock.toolbar.btn.size.minimize.title']
                            )
                            .html(lizDict['bottomdock.toolbar.btn.size.minimize.title']);
                        $('#bottom-dock').addClass('fullsize');
                        lizMap.events.triggerEvent('bottomdocksizechanged', {'size': 'full'} );
                    }
                    return false;
                })
                .hover(
                    function(){
                        if( bottomDockFullsize ){
                            $(this)
                                .removeClass('btn-primary')
                                .attr('title', lizDict['bottomdock.toolbar.btn.size.minimize.title'])
                                .html(lizDict['bottomdock.toolbar.btn.size.minimize.title']);
                        }
                        else{
                            $(this)
                                .addClass('btn-primary')
                                .attr('title', lizDict['bottomdock.toolbar.btn.size.maximize.title'])
                                .html(lizDict['bottomdock.toolbar.btn.size.maximize.title']);
                        }
                        return false;
                    },
                    function(){
                        if (bottomDockFullsize ){
                            $(this)
                                .addClass('btn-primary')
                                .attr('title', lizDict['bottomdock.toolbar.btn.size.minimize.title'])
                                .html(lizDict['bottomdock.toolbar.btn.size.minimize.title']);
                        }
                        else{
                            $(this)
                                .removeClass('btn-primary')
                                .attr('title', lizDict['bottomdock.toolbar.btn.size.maximize.title'])
                                .html(lizDict['bottomdock.toolbar.btn.size.maximize.title']);
                        }
                        return false;
                    }
                );

            document.querySelectorAll('#mapmenu li.nav-bottomdock > a').forEach(link => {
                link.addEventListener('click', evt => {
                    evt.preventDefault();
                    // document.getElementById('bottom-dock').classList.remove('hide');
                    // document.getElementById('bottom-dock').classList.add('visible');
                    const linkClicked = evt.currentTarget;
                    const dockId = linkClicked.dataset.dockid;
                    const parentElement = linkClicked.parentElement;
                    const wasActive = parentElement.classList.contains('active');

                    document.querySelectorAll('#mapmenu .nav-bottomdock').forEach(element => element.classList.remove('active'));
                    // document.querySelectorAll('#bottomdock-content > div').forEach(element => element.classList.add('hide'));
                    parentElement.classList.toggle('active', !wasActive);
                    document.getElementById(dockId).classList.toggle('hide', wasActive);

                    const lizmapEvent = wasActive ? 'bottomdockclosed' : 'bottomdockopened';
                    lizMap.events.triggerEvent(lizmapEvent, { 'id': dockId });

                    return false;
                });
            });

            /**
             *
             */
            function showBottomDockContent(){
                $('#bottom-dock').addClass('visible');
                lizMap.events.triggerEvent('bottomdocksizechanged', {'size': 'unknown'} );
                return false;
            }
            /**
             *
             */
            function hideBottomDockContent(){
                $('#bottom-dock').removeClass('visible').focus();
                return false;
            }

        } // uicreated
    });


}();
