<?php
    class filterDockableListener extends jEventListener{

        private function checkConfig($event, $dock){
            $project = $event->getParam( 'project' );
            $repository = $event->getParam( 'repository' );

            // Check config
            jClasses::inc('filter~filterConfig');
            $dv = new filterConfig($event->repository, $event->project);

            if($dv->getStatus()){

                // Use template filterConfig
                $assign = array();
                $content = array( 'filter~filter_' . $dock, $assign );
                $dock = new lizmapMapDockItem(
                    'filter',
                    jLocale::get("filter~filter.dock.title"),
                    $content,
                    15,
                    null, // fait via getMapAdditions
                    null
                );
                $event->add($dock);
            }
        }

        function onmapDockable ($event) {
            $this->checkConfig($event, 'dock');
        }

    }

?>
