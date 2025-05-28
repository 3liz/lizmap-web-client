<?php

use LizmapAdmin\LandingContent;

/**
 * Lizmap administration : landing page content.
 *
 * @author    3liz
 * @copyright 2016-2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class landing_page_contentCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.home.page.update'),
    );

    /**
     * Display a wysiwyg editor.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Create the form, or get the existing one if we are here because of
        // a failed check
        /** @var null|jFormsBase $form */
        $form = jForms::get('admin~landing_page_content');
        if (!$form) {
            $form = jForms::create('admin~landing_page_content');
        }

        $landingContentService = new LandingContent();

        $landingContentService->initForm($form);
        $tpl = new jTpl();

        $tpl->assign('form', $form);
        $rep->body->assign('MAIN', $tpl->fetch('landing_page_content'));
        $rep->body->assign('selectedMenuItem', 'lizmap_landing_page_content');

        return $rep;
    }

    /**
     * Save wysiwyg editor content in ini file.
     *
     * @return jResponseRedirect
     */
    public function save()
    {
        try {
            $form = jForms::fill('admin~landing_page_content');

            /** @var null|jFormsBase $form */
            if (!$form || !$form->check()) {
                // no form... this was a direct call to the save action
                // or content is invalid
                return $this->redirect('landing_page_content:index');
            }
        } catch (jException $e) {
            // invalid CSRF token or other technical errors
            jMessage::add(jLocale::get('admin~admin.landingPageContent.error.submit'), 'error');

            return $this->redirect('landing_page_content:index');
        }

        // Save HTML content
        $landingContentService = new LandingContent();
        $fileWriteOK = $landingContentService->saveForm($form);
        if ($fileWriteOK) {
            jMessage::add(jLocale::get('admin~admin.landingPageContent.saved'), 'ok');
            jForms::destroy('admin~landing_page_content');
        }

        return $this->redirect('landing_page_content:index');
    }
}
