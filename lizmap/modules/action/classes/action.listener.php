<?php

class actionListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        $basePath = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for module
        $js = array();
        $jsCode = array();
        $css = array();

        // Check config
        jClasses::inc('action~actionConfig');
        $actionConfigInstance = new actionConfig($event->repository, $event->project);
        if ($actionConfigInstance->getStatus()) {
            $js = array(
                $basePath.'assets/js/action.js',
            );
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

        // Warn the administrator that the action JSON configuration
        // is written in the old type
        if (\jAcl2::check('lizmap.admin.access') && $actionConfigInstance->oldConfigConversionDone) {
            $url = 'https://docs.lizmap.com/current/en/publish/configuration/action_popup.html';
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
                'js' => $js,
                'jscode' => $jsCode,
                'css' => $css,
            )
        );
    }
}
