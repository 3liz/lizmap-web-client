<?php

    class presentationDockableListener extends jEventListener
    {
        private function checkConfig($event, $dock)
        {
            $project = $event->getParam('project');
            $repository = $event->getParam('repository');

            // Check config
            jClasses::inc('presentation~presentationConfig');
            $dv = new presentationConfig($event->repository, $event->project);

            if ($dv->getStatus()) {
                // Use template presentationConfig
                $assign = array();
                $content = array('presentation~presentation_'.$dock, $assign);
                $dock = new lizmapMapDockItem(
                    'presentation',
                    jLocale::get('presentation~presentation.dock.title'),
                    $content,
                    15,
                    null, // done getMapAdditions event
                    null
                );
                $event->add($dock);
            }
        }

        public function onmapDockable($event)
        {
            $this->checkConfig($event, 'dock');
        }
    }
