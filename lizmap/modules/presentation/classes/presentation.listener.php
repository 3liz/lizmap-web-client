<?php

use Presentation\PresentationConfig;

/**
 * @author    Michaël DOUCHIN - 3Liz
 * @copyright 2011-2024 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class presentationListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        // Check presentation can be used by the current user
        $presentationConfig = new PresentationConfig($event->repository, $event->project);
        if (!$presentationConfig->getStatus()) {
            return;
        }

        // Add JSON configuration
        $presentationData = array();
        $presentationData['url'] = jUrl::get(
            'presentation~presentation:index',
            array(
                'repository' => $event->repository,
                'project' => $event->project,
            )
        );
        $jsCode = array();
        $jsCode[] = 'const presentationConfig = '.json_encode($presentationData).';';

        // Lizmap application URL basepath
        $basePath = jApp::urlBasePath();

        // Add JS files
        $js = array();
        $js[] = $basePath.'modules-assets/presentation/js/Presentation.js';
        $js[] = $basePath.'modules-assets/presentation/js/PresentationPage.js';
        $js[] = $basePath.'modules-assets/presentation/js/PresentationCards.js';

        // Add CSS file
        $css = array();
        $css[] = $basePath.'modules-assets/presentation/css/presentation.css';

        // add presentation form needed JS and CSS
        $form = jForms::create('presentation~presentation');
        $form->getBuilder('html')->outputMetaContent(null);
        $formPage = jForms::create('presentation~presentation_page');
        $formPage->getBuilder('html')->outputMetaContent(null);

        // Add event JS & CSS
        $event->add(
            array(
                'js' => $js,
                'jscode' => $jsCode,
                'css' => $css,
            )
        );
    }
}
