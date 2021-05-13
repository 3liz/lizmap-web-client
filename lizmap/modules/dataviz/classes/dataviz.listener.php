<?php

class datavizListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        $bp = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for dataviz module
        $js = array();
        $jscode = array();
        $css = array();

        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($event->repository, $event->project);

        if ($dv->getStatus()) {
            $locale = substr(jApp::config()->locale, 0, 2);
            $js = array(
                $bp.'assets/js/dataviz/plotly-latest.min.js',
                $bp.'assets/js/dataviz/dataviz.js',
            );
            if (in_array($locale, array('de', 'el', 'es', 'fr', 'it', 'nl', 'ro'))) {
                $js[] = $bp.'assets/js/dataviz/plotly-locale-'.$locale.'-latest.js';
            }
            $datavizConfig = array(
                'url' => jUrl::get('dataviz~service:index', array('repository' => $event->repository, 'project' => $event->project)),
            );
            $jscode = array(
                'var datavizConfig = '.json_encode($datavizConfig),
            );
            $css = array(
                $bp.'assets/css/dataviz/dataviz.css',
            );
        }
        $event->add(
            array(
                'js' => $js,
                'jscode' => $jscode,
                'css' => $css,
            )
        );
    }
}
