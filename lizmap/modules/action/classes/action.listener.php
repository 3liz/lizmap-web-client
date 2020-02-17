<?php
class actionListener extends jEventListener{

    function ongetMapAdditions ($event) {
        $bp = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for module
        $js = array();
        $jscode = array();
        $css = array();

        // Check config
        jClasses::inc('action~actionConfig');
        $dv = new actionConfig($event->repository, $event->project);
        if($dv->getStatus()){
            $js = array(
                $bp.'assets/js/action.js'
            );
            $actionConfig = $dv->getConfig();
            $actionConfigData = array(
                'url'=>jUrl::get('action~service:index', array(
                    'repository'=>$event->repository,
                    'project'=>$event->project )
                )
            );

            $jscode = array(
                'var actionConfig = ' . json_encode($actionConfig),
                'var actionConfigData = ' . json_encode($actionConfigData)
            );
            $css = array(
                $bp.'assets/css/action.css'
            );
        }
        $event->add(
            array(
                'js' => $js,
                'jscode' => $jscode,
                'css' => $css
            )
        );
    }
}
?>
