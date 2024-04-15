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
        $getConfig = new presentationConfig($event->repository, $event->project);
        if ($getConfig->getStatus()) {
            $presentationConfig = array(
                'url' => jUrl::get(
                    'presentation~presentation:index',
                    array(
                        'repository' => $event->repository,
                        'project' => $event->project,
                    )
                ),
            );

            $jsCode = array(
                'var presentationConfig = '.json_encode($presentationConfig),
            );
            $css = array(
                $basePath.'assets/css/presentation.css',
            );
        }

        // add presentation form needed JS and CSS
        $form = jForms::create('presentation~presentation');
        $form->getBuilder('html')->outputMetaContent(null);
        $formPage = jForms::create('presentation~presentation_page');
        $formPage->getBuilder('html')->outputMetaContent(null);

        $event->add(
            array(
                'jscode' => $jsCode,
                'css' => $css,
            )
        );
    }
}
