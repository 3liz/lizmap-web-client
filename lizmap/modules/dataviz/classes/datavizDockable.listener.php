<?php
    class datavizDockableListener extends jEventListener{

        function onmapDockable ($event) {

            $project = $event->getParam( 'project' );
            $repository = $event->getParam( 'repository' );
            // Check dataviz config
            jClasses::inc('dataviz~datavizConfig');
            $dv = new datavizConfig($event->repository, $event->project);

            if($dv->getStatus()){
                // Use appropriate dock
                $config = $dv->getConfig();
                $location = $config['dataviz']['location'];
                if( $location == 'dock'){
                    // Use template dataviz-dock
                    $assign = array();
                    $content = array( 'dataviz~dataviz_dock', $assign );
                    $dock = new lizmapMapDockItem(
                        'dataviz',
                        jLocale::get("dataviz~dataviz.dock.title"),
                        $content,
                        15,
                        null, // fait via getMapAdditions
                        null
                    );
                    $event->add($dock);
                }
            }
        }

        function onmapBottomDockable ($event) {

            $project = $event->getParam( 'project' );
            $repository = $event->getParam( 'repository' );
            // Check dataviz config
            jClasses::inc('dataviz~datavizConfig');
            $dv = new datavizConfig($event->repository, $event->project);

            if($dv->getStatus()){
                // Use appropriate dock
                $config = $dv->getConfig();
                $location = $config['dataviz']['location'];
                if( $location == 'bottomdock'){
                    // Use template dataviz-dock
                    $assign = array();
                    $content = array( 'dataviz~dataviz_bottomdock', $assign );
                    $dock = new lizmapMapDockItem(
                        'dataviz',
                        jLocale::get("dataviz~dataviz.dock.title"),
                        $content,
                        15,
                        null, // fait via getMapAdditions
                        null
                    );
                    $event->add($dock);
                }
            }
        }

        function onmapRightDockable ($event) {

            $project = $event->getParam( 'project' );
            $repository = $event->getParam( 'repository' );
            // Check dataviz config
            jClasses::inc('dataviz~datavizConfig');
            $dv = new datavizConfig($event->repository, $event->project);

            if($dv->getStatus()){
                // Use appropriate dock
                $config = $dv->getConfig();
                $location = $config['dataviz']['location'];
                if( $location == 'right-dock'){
                    // Use template dataviz-dock
                    $assign = array();
                    $content = array( 'dataviz~dataviz_rightdock', $assign );
                    $dock = new lizmapMapDockItem(
                        'dataviz',
                        jLocale::get("dataviz~dataviz.dock.title"),
                        $content,
                        15,
                        null, // fait via getMapAdditions
                        null
                    );
                    $event->add($dock);
                }
            }
        }

    }

?>
