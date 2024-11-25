<?php

class datavizDockableListener extends jEventListener
{
    public function onmapDockable($event)
    {
        $project = $event->getParam('project');
        $repository = $event->getParam('repository');
        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($event->repository, $event->project);

        if ($dv->getStatus()) {
            // Use appropriate dock
            $config = $dv->getConfig();
            $location = $config['dataviz']['location'];
            $theme = $config['dataviz']['theme'];
            if ($location == 'dock') {
                // Use template dataviz-dock
                $assign = array('theme' => $theme);
                $content = array('dataviz~dataviz_dock', $assign);
                $dock = new lizmapMapDockItem(
                    'dataviz',
                    jLocale::get('dataviz~dataviz.dock.title'),
                    $content,
                    15,
                    null, // fait via getMapAdditions
                    null
                );
                $event->add($dock);
            }
        }
    }

    public function onmapBottomDockable($event)
    {
        $project = $event->getParam('project');
        $repository = $event->getParam('repository');
        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($event->repository, $event->project);

        if ($dv->getStatus()) {
            // Use appropriate dock
            $config = $dv->getConfig();
            $location = $config['dataviz']['location'];
            $theme = $config['dataviz']['theme'];
            if ($location == 'bottomdock') {
                // Use template dataviz-dock
                $assign = array('theme' => $theme);
                $content = array('dataviz~dataviz_bottomdock', $assign);
                $dock = new lizmapMapDockItem(
                    'dataviz',
                    jLocale::get('dataviz~dataviz.dock.title'),
                    $content,
                    15,
                    null, // fait via getMapAdditions
                    null
                );
                $event->add($dock);
            }
        }
    }

    public function onmapRightDockable($event)
    {
        $project = $event->getParam('project');
        $repository = $event->getParam('repository');
        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($event->repository, $event->project);

        if ($dv->getStatus()) {
            // Use appropriate dock
            $config = $dv->getConfig();
            $location = $config['dataviz']['location'];
            $theme = $config['dataviz']['theme'];
            if ($location == 'right-dock') {
                // Use template dataviz-dock
                $assign = array('theme' => $theme);
                $content = array('dataviz~dataviz_rightdock', $assign);
                $dock = new lizmapMapDockItem(
                    'dataviz',
                    jLocale::get('dataviz~dataviz.dock.title'),
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
