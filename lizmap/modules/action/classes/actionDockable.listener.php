<?php

class actionDockableListener extends jEventListener
{
    private function checkConfig($event, $dock)
    {
        // Check config
        jClasses::inc('action~actionConfig');
        $actionConfig = new actionConfig($event->repository, $event->project);

        // Show the dock with the list of project actions only
        // if the configuration is valid and there are some project actions
        if ($actionConfig->getStatus()) {

            // Use template actionConfig
            $assign = array();
            $projectActions = $actionConfig->getActionsByScope('project');
            // We also get the layer actions because the dock contains
            // the html template which is the source of the web component HTML
            $layerActions = $actionConfig->getActionsByScope('layer');
            if (count($projectActions) > 0 || count($layerActions) > 0) {
                $assign['actions'] = $projectActions;
                $content = array('action~action_'.$dock, $assign);
                $dock = new lizmapMapDockItem(
                    'action',
                    jLocale::get('action~action.dock.title'),
                    $content,
                    15,
                    null, // fait via getMapAdditions
                    null,
                    array('type' => 'module')
                );
                $event->add($dock);
            }
        }
    }

    public function onmapMiniDockable($event)
    {
        $this->checkConfig($event, 'dock');
    }
}
