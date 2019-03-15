<?php
class filterListener extends jEventListener{

    function ongetMapAdditions ($event) {
        $bp = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for module
        $js = array();
        $jscode = array();
        $css = array();

        // Check config
        jClasses::inc('filter~filterConfig');
        $dv = new filterConfig($event->repository, $event->project);
        if($dv->getStatus()){
            $js = array(
                $bp.'js/filter.js'
            );
            $filterConfig = $dv->getConfig();
            $filterConfigData = array(
                'url'=>jUrl::get('filter~service:index', array('repository'=>$event->repository, 'project'=>$event->project ))
            );

            $jscode = array(
                'var filterConfig = ' . json_encode($filterConfig),
                'var filterConfigData = ' . json_encode($filterConfigData)
            );
            $css = array(
                $bp.'css/filter.css'
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
