<?php
    class actionDockableListener extends jEventListener{

        private function checkConfig($event, $dock){
            $project = $event->getParam( 'project' );
            $repository = $event->getParam( 'repository' );

            // Check config
            jClasses::inc('action~actionConfig');
            $dv = new actionConfig($event->repository, $event->project);

            if($dv->getStatus()){

                // Use template actionConfig
                $assign = array();
                $content = array( 'action~action_' . $dock, $assign );
                $dock = new lizmapMapDockItem(
                    'action',
                    jLocale::get("action~action.dock.title"),
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
