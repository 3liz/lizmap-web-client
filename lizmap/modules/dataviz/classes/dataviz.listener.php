<?php
class datavizListener extends jEventListener{

    function ongetMapAdditions ($event) {
        $bp = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for dataviz module
        $js = array();
        $jscode = array();
        $css = array();

        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($event->repository, $event->project);

        if($dv->getStatus()){
            $js = array(
                $bp.'js/dataviz/plotly-latest.min.js',
                $bp.'js/dataviz/dataviz.js'
            );
            $datavizConfig = array(
                'url' => jUrl::get('dataviz~service:index', array('repository'=>$event->repository, 'project'=>$event->project )),
            );
            $jscode = array(
                'var datavizConfig = ' . json_encode($datavizConfig)
            );
            $css = array(
                $bp.'css/dataviz/dataviz.css'
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
