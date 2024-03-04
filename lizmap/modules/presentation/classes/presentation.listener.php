<?php

class presentationListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        $basePath = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for module
        $jsCode = array();
        $css = array();

        // Check config
        jClasses::inc('presentation~presentationConfig');
        $presentationConfigInstance = new presentationConfig($event->repository, $event->project);
        if ($presentationConfigInstance->getStatus()) {
            $presentationConfig = $presentationConfigInstance->getConfig();
            $presentationConfigData = array(
                'url' => jUrl::get(
                    'presentation~service:index',
                    array(
                        'repository' => $event->repository,
                        'project' => $event->project,
                    )
                ),
            );

            $jsCode = array(
                'var presentationConfig = '.json_encode($presentationConfig),
                'var presentationConfigData = '.json_encode($presentationConfigData),
            );
            $css = array(
                $basePath.'assets/css/presentation.css',
            );
        }

        $event->add(
            array(
                'jscode' => $jsCode,
                'css' => $css,
            )
        );
    }
}
