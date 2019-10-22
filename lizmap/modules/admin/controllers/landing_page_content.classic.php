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
        '*' => array('jacl2.right' => 'lizmap.admin.access'),
    );

    /**
     * Display a wysiwyg editor.
     */
    public function index()
    {
        $rep = $this->getResponse('html');

        // Create the form
        $form = jForms::create('admin~landing_page_content');

        // Get HTML content
        $HTMLContent = jFile::read(jApp::varPath('lizmap-theme-config/landing_page_content.html'));
        if($HTMLContent){
            $form->setData( "HTMLContent", $HTMLContent );
        }

        $tpl = new jTpl();

        $tpl->assign('form', $form);
        $rep->body->assign('MAIN', $tpl->fetch('landing_page_content'));
        $rep->body->assign('selectedMenuItem', 'lizmap_landing_page_content');

        return $rep;
    }

    /**
     * Save wysiwyg editor content in ini file.
     */
    public function save()
    {
        $form = jForms::get('admin~landing_page_content');

        // token
        $token = $this->param('__JFORMS_TOKEN__');
        if (!$token) {
            // redirection vers la page d'erreur
            $rep = $this->getResponse('redirect');
            $rep->action = 'landing_page_content:index';

            return $rep;
        }

        // If the form is not defined, redirection
        if (!$form) {
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

        if (!$ok) {
            // Errors : redirection
            $rep = $this->getResponse('redirect');
            $rep->action = 'landing_page_content:index';
            $rep->params['errors'] = '1';

            return $rep;
        }

        // Save HTML content
        $fileWriteOK = jFile::write(jApp::varPath('lizmap-theme-config/landing_page_content.html'), $form->getData('HTMLContent'));

        if(!$fileWriteOK){
            // Errors : redirection
            $rep = $this->getResponse('redirect');
            $rep->action = 'landing_page_content:index';
            $rep->params['errors'] = '1';

            return $rep;
        }

        // Redirect to the edition page
        $rep = $this->getResponse('redirect');
        $rep->action = 'landing_page_content:index';

        return $rep;

    }

}
