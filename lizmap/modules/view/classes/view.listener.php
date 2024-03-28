<?php

class viewListener extends jEventListener
{
    public function onmasteradminGetInfoBoxContent($event)
    {
        $home = new masterAdminMenuItem('home', jLocale::get('view~default.home.title'), jUrl::get('view~default:index'));
        $home->icon = true;
        $event->add($home);
    }

    public function ongetMapAdditions($event)
    {
        /*
        Use this listener in your modules to make Lizmap
        load javascripts and css files in the map
        You should pass an array like this
        $js = array(
            $bp.'js/example/example.js'
        );
        $jsVars['somevar'] = "something");
        $css = array(
            $bp.'css/example/example.css'
        );
        The listed files must be added by the module in lizmap/www by the installation script
        */
        $js = array();
        $jsVars = array();
        $css = array();
        $event->add(
            array(
                'js' => $js,
                'jsvars' => $jsVars,
                'css' => $css,
            )
        );
    }

    public function onsearchServiceItem($event)
    {

        /*
         * Use this listener in your modules to make Lizmap
         * add search services based on an URL
         * The parameters for searches are the same as search
         * based on QuickFinder database
         * lizmap/controllers/search.classic.php
         * - repository
         * - project
         * - query: the search string
         * - bbox: max extent in wgs84
         *
         * $event->add(
         *     array(
         *         'type' => 'QuickFinder',
         *         'service' => 'lizmapQuickFinder',
         *         'url' => jUrl::get('lizmap~search:get')
         *     )
         * );
         *
         * */
    }
}
