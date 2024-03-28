<?php

class filterListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        $bp = jApp::config()->urlengine['basePath'];

        // Add JS and CSS for module
        $js = array();
        $jsVars = array();
        $css = array();

        // Check config
        jClasses::inc('filter~filterConfig');
        $dv = new filterConfig($event->repository, $event->project);

        $filterConfigData = array(
            'url' => jUrl::get('filter~service:index', array('repository' => $event->repository, 'project' => $event->project)),
        );
        $jsVars['filterConfigData'] = $filterConfigData;

        // Filter config may be an empty array
        // This means no layers have been set up with the filter by form tool
        // BUT : we still need to return data so that other tools can use the filter methods
        // Ex: timemanager uses the getMinAndMaxValues method of the service controller
        // We add JS and CSS files only if layers have been configured
        // But the filterConfigData url must be set before
        if ($dv->getStatus()) {
            $js = array(
                $bp.'assets/js/filter.js',
            );
            $css = array(
                $bp.'assets/css/filter.css',
            );

            $filterConfig = $dv->getConfig();
            $jsVars['filterConfig'] = $filterConfig;
        }
        $event->add(
            array(
                'js' => $js,
                'jsvars' => $jsVars,
                'css' => $css,
            )
        );
    }
}
