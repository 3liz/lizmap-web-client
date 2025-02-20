<?php

/**
 * Lizmap administration : theme.
 *
 * @author    3liz
 * @copyright 2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class themeCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.theme.view'),
        'modify' => array('jacl2.right' => 'lizmap.admin.theme.update'),
        'edit' => array('jacl2.right' => 'lizmap.admin.theme.update'),
        'save' => array('jacl2.right' => 'lizmap.admin.theme.update'),
        'validate' => array('jacl2.right' => 'lizmap.admin.theme.update'),
        'removeThemeImage' => array('jacl2.right' => 'lizmap.admin.theme.update'),
    );

    /**
     * Display a summary of the theme.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get the data
        $theme = lizmap::getTheme();

        // Create the form
        $form = jForms::create('admin~theme');

        // Set form data values
        foreach ($theme->getProperties() as $ser) {
            $val = $theme->{$ser};
            if ($ser == 'additionalCss') {
                $val = html_entity_decode($val);
            }
            $form->setData($ser, $val);
        }

        $tpl = new jTpl();
        $tpl->assign('theme', lizmap::getTheme());
        $tpl->assign('themeForm', $form);
        $hasHeaderImage = array(
            'headerLogo' => is_file(jApp::varPath('lizmap-theme-config/').$theme->headerLogo),
            'headerBackgroundImage' => is_file(jApp::varPath('lizmap-theme-config/').$theme->headerBackgroundImage),
        );
        $tpl->assign('hasHeaderImage', $hasHeaderImage);
        $rep->body->assign('MAIN', $tpl->fetch('theme'));
        $rep->body->assign('selectedMenuItem', 'lizmap_theme');

        return $rep;
    }

    /**
     * Modify the theme.
     *
     * @return jResponseRedirect
     */
    public function modify()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        // Get the data
        $theme = lizmap::getTheme();

        // Create the form
        $form = jForms::create('theme');

        // Set form data values
        foreach ($theme->getProperties() as $ser) {
            $val = $theme->{$ser};
            if ($ser == 'additionalCss') {
                $val = html_entity_decode($val);
            }
            $form->setData($ser, $val);
        }

        $rep->action = 'theme:edit';

        return $rep;
    }

    /**
     * Display the form to modify the theme.
     *
     * @return jResponseHtml|jResponseRedirect the form
     */
    public function edit()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        /** @var null|jFormsBase $form */
        $form = jForms::get('theme');
        // Get the form

        if ($form) {
            // Display form
            $tpl = new jTpl();
            $tpl->assign('form', $form);
            $rep->body->assign('MAIN', $tpl->fetch('config_theme'));
            $rep->body->assign('selectedMenuItem', 'lizmap_theme');

            return $rep;
        }
        // redirect to default page
        jMessage::add('error in theme edition');

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->action = 'theme:index';

        return $rep;
    }

    /**
     * Save the data for the theme section.
     *
     * @return jResponseRedirect to the index
     */
    public function save()
    {
        // If the section does exists in the ini file : get the data
        $theme = lizmap::getTheme();

        /** @var null|jFormsBase $form */
        $form = jForms::get('theme');

        // token
        $token = $this->param('__JFORMS_TOKEN__');
        // redirection vers la page d'erreur
        if (!$token) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'theme:index';

            return $rep;
        }

        // If the form is not defined, redirection
        if (!$form) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'theme:index';

            return $rep;
        }

        // Set the other form data from the request data
        $form->initFromRequest();

        // Check the form
        $ok = true;
        if (!$form->check()) {
            $ok = false;
        }

        // Errors : redirection to the display action
        if (!$ok) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'theme:edit';
            $rep->params['errors'] = '1';

            return $rep;
        }

        // Save the data
        $data = array();
        foreach ($theme->getProperties() as $prop) {
            $data[$prop] = $form->getData($prop);
            if ($prop == 'headerLogo' or $prop == 'headerBackgroundImage') {
                $hl = $form->getData($prop);
                if (!empty($hl)) {
                    // Remove previous theme image file
                    if (file_exists(jApp::varPath('lizmap-theme-config/').$theme->{$prop})
                        && is_file(jApp::varPath('lizmap-theme-config/').$theme->{$prop})
                    ) {
                        unlink(jApp::varPath('lizmap-theme-config/').$theme->{$prop});
                    }
                    // Save new file in theme folder
                    $form->saveFile($prop, jApp::varPath('lizmap-theme-config'));
                } else {
                    // keep previous theme image path if not changed
                    $data[$prop] = $theme->{$prop};
                }
            }
            if ($prop == 'additionalCss') {
                $data[$prop] = htmlentities($data[$prop]);
            }
        }

        // Modify class properties
        if ($theme->update($data)) {
            jMessage::add(jLocale::get('admin~admin.form.admin_theme.message.data.saved'));
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the validation page
        $rep->action = 'theme:validate';

        return $rep;
    }

    /**
     * Validate the data for the theme section : destroy form and redirect.
     *
     * @return jResponseRedirect to the index
     */
    public function validate()
    {
        /** @var null|jFormsBase $form */
        $form = jForms::get('theme');
        // Destroy the form
        if ($form) {
            jForms::destroy('theme');
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the index
        $rep->action = 'theme:index';

        return $rep;
    }

    /**
     * @return jResponseRedirect
     */
    public function removeThemeImage()
    {
        $theme = lizmap::getTheme();
        $prop = $this->param('key', 'headerLogo');
        if ($prop != 'headerLogo' and $prop != 'headerBackgroundImage') {
            $prop = 'headerLogo';
        }

        // empty property
        $data[$prop] = '';

        // also empty logo width
        if ($prop == 'headerLogo') {
            $data['headerLogoWidth'] = '';
        }

        // remove file
        if (file_exists(jApp::varPath('lizmap-theme-config/').$theme->{$prop})) {
            unlink(jApp::varPath('lizmap-theme-config/').$theme->{$prop});
        }

        // update theme
        $theme->update($data);

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the index
        $rep->action = 'theme:index';

        return $rep;
    }
}
