<?php

use Presentation\PresentationConfig;

class presentationDockableListener extends jEventListener
{
    private function checkConfig($event, $dock)
    {
        // Check config
        $presentationConfig = new PresentationConfig($event->repository, $event->project);
        if ($presentationConfig->getStatus()) {
            // Use template presentationConfig
            $assign = array(
                'repository' => $event->repository,
                'project' => $event->project,
            );
            $content = array('presentation~presentation_'.$dock, $assign);
            $dock = new lizmapMapDockItem(
                'presentation',
                jLocale::get('presentation~presentation.dock.title'),
                $content,
                15,
                null, // done with the getMapAdditions event
                null // idem
            );
            $event->add($dock);
        }
    }

    public function onmapDockable($event)
    {
        $this->checkConfig($event, 'dock');
    }
}
