<?php
/**
 * Lizmap administration : landing page content.
 *
 * @author    3liz
 * @copyright 2016 3liz
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

        // Create the form
        $form = jForms::create('admin~landing_page_content');

        // Get HTML content
        $HTMLContentFile = jApp::varPath('lizmap-theme-config/landing_page_content.html');
        if (file_exists($HTMLContentFile)) {
            $HTMLContent = jFile::read($HTMLContentFile);
            if ($HTMLContent) {
                $form->setData('HTMLContent', $HTMLContent);
            }
        }

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
        /** @var null|jFormsBase $form */
        $form = jForms::get('admin~landing_page_content');

        // token
        $token = $this->param('__JFORMS_TOKEN__');
        // redirection vers la page d'erreur
        if (!$token) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'landing_page_content:index';

            return $rep;
        }

        // If the form is not defined, redirection
        if (!$form) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'landing_page_content:index';

            return $rep;
        }

        // Set the other form data from the request data
        $form->initFromRequest();

        // Check the form
        $ok = true;
        if (!$form->check()) {
            $ok = false;
        }

        // Errors : redirection
        if (!$ok) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'landing_page_content:index';
            $rep->params['errors'] = '1';

            return $rep;
        }

        // Save HTML content
        $fileWriteOK = jFile::write(jApp::varPath('lizmap-theme-config/landing_page_content.html'), $form->getData('HTMLContent'));

        // Errors : redirection
        if (!$fileWriteOK) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'landing_page_content:index';
            $rep->params['errors'] = '1';

            return $rep;
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the edition page
        $rep->action = 'landing_page_content:index';

        return $rep;
    }
}
