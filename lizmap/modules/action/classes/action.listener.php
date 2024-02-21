<?php

class actionListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        $basePath = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for module
        $jsCode = array();
        $css = array();

        // Check config
        jClasses::inc('action~actionConfig');
        $actionConfigInstance = new actionConfig($event->repository, $event->project);
        if ($actionConfigInstance->getStatus()) {
            $actionConfig = $actionConfigInstance->getConfig();
            $actionConfigData = array(
                'url' => jUrl::get(
                    'action~service:index',
                    array(
                        'repository' => $event->repository,
                        'project' => $event->project,
                    )
                ),
            );

            $jsCode = array(
                'var actionConfig = '.json_encode($actionConfig),
                'var actionConfigData = '.json_encode($actionConfigData),
            );
            $css = array(
                $basePath.'assets/css/action.css',
            );
        }

        // Warn the publisher/administrator that the action JSON configuration
        // is written in the old type
        $serverInfoAccess = (\jAcl2::check('lizmap.admin.access') || \jAcl2::check('lizmap.admin.server.information.view'));
        if ($serverInfoAccess && $actionConfigInstance->oldConfigConversionDone) {
            $url = 'https://docs.lizmap.com/current/en/publish/lizmap_plugin/actions.html';
            $message = \jLocale::get('action~action.warning.converted.from.old.configuration',array($url));
            $jsCode[] = "
            lizMap.events.on(
                {
                    'uicreated':function(evt){
                        lizMap.addMessage('$message','info',true).attr('id','lizmap-action-message');
                    }
                }
            );
            ";
            \jLog::log("$event->repository/$event->project : action module - " . strip_tags($message), 'lizmapadmin');
        }

        $event->add(
            array(
                'jscode' => $jsCode,
                'css' => $css,
            )
        );
    }
}
