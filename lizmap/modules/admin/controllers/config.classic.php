<?php

/**
 * Lizmap administration.
 *
 * @author    3liz
 * @copyright 2012-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class configCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.access'),
        'index' => array('jacl2.rights.and' => array('lizmap.admin.access', 'lizmap.admin.services.view')),
        'modifyServices' => array('jacl2.right' => 'lizmap.admin.services.update'),
        'editServices' => array('jacl2.right' => 'lizmap.admin.services.update'),
        'saveServices' => array('jacl2.right' => 'lizmap.admin.services.update'),
    );

    protected function prepareServicesForm(jFormsBase $form, lizmapServices $services)
    {
        // Set form data values
        foreach ($services->getProperties() as $ser) {
            switch ($ser) {
                case 'allowUserAccountRequests':
                    $form->setReadOnly('allowUserAccountRequests', $services->isLdapEnabled());

                    // no break
                case 'onlyMaps':
                    $form->setData($ser, $services->{$ser} ? 'on' : 'off');

                    break;

                case 'projectSwitcher':
                    $form->setData($ser, $services->{$ser} ? 'on' : 'off');

                    break;

                default:
                    /** @var null|jFormsControl $ctrl */
                    $ctrl = $form->getControl($ser);
                    if ($ctrl) {
                        $form->setData($ser, $services->{$ser});
                    }
            }
        }

        // hide sensitive services properties
        if ($services->hideSensitiveProperties()) {
            foreach ($services->getSensitiveProperties() as $ser) {
                /** @var null|jFormsControl $ctrl */
                $ctrl = $form->getControl($ser);
                if (!$ctrl) {
                    continue;
                }
                if ($ser == 'adminSenderEmail') {
                    $form->setReadOnly($ser, true);
                } else {
                    $form->deactivate($ser);
                }
            }
        }
    }

    /**
     * Display a summary of the information taken from the ~ configuration file.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get Lizmap version from project.xml
        $xmlPath = jApp::appPath('project.xml');
        $xmlLoad = simplexml_load_file($xmlPath);
        $version = (string) $xmlLoad->info->version;

        // Get the data
        $services = lizmap::getServices();

        // Create the form
        $form = jForms::create('admin~config_services');

        $this->prepareServicesForm($form, $services);

        $tpl = new jTpl();
        $tpl->assign('showSystem', !lizmap::getServices()->hideSensitiveProperties());
        $tpl->assign('servicesForm', $form);
        $tpl->assign('version', $version);
        $rep->body->assign('MAIN', $tpl->fetch('config'));
        $rep->body->assign('selectedMenuItem', 'lizmap_configuration');

        return $rep;
    }

    /**
     * Modification of the services configuration.
     *
     * @return jResponseRedirect Redirect to the form display action
     */
    public function modifyServices()
    {

        // Get the data
        $services = lizmap::getServices();

        // Create the form
        $form = jForms::create('admin~config_services');

        $this->prepareServicesForm($form, $services);

        // If wrong cacheRootDirectory, use the system temporary directory
        $cacheRootDirectory = $form->getData('cacheRootDirectory');
        if (!is_dir($cacheRootDirectory) or !is_writable($cacheRootDirectory)) {
            $form->setData('cacheRootDirectory', sys_get_temp_dir());
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // redirect to the form display action
        $rep->action = 'admin~config:editServices';

        return $rep;
    }

    /**
     * Display the form to modify the services.
     *
     * @return jResponseHtml|jResponseRedirect display the form
     */
    public function editServices()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get the form
        $form = jForms::get('admin~config_services');

        /** @var null|jFormsBase $form */
        if ($form) {
            $hasSenderEmail = ($form->getData('adminSenderEmail') != '');
            if (lizmap::getServices()->isLdapEnabled()) {
                $ctrl = $form->getControl('allowUserAccountRequests');
                $ctrl->help = jLocale::get('admin~admin.configuration.services.allowUserAccountRequests.help.deactivated');
            }
            if ($form->getData('allowUserAccountRequests') == 'on'
                || $form->getData('adminContactEmail') != ''
            ) {
                $form->getControl('adminSenderEmail')->required = true;
            }
            if (lizmap::getServices()->hideSensitiveProperties()) {
                if (!$hasSenderEmail) {
                    $form->getControl('allowUserAccountRequests')->setReadOnly();
                    $form->getControl('allowUserAccountRequests')->help = jLocale::get('admin~admin.config.services.allowUserAccountRequest.noemail');
                }
                $form->getControl('adminSenderEmail')->help = jLocale::get('admin~admin.form.admin_services.adminSenderEmail.readonly.help');
            }

            $qgisMinimumVersionRequired = jApp::config()->minimumRequiredVersion['qgisServer'];
            $lizmapPluginMinimumVersionRequired = jApp::config()->minimumRequiredVersion['lizmapServerPlugin'];
            $form->getControl('lizmapPluginAPIURL')->help = jLocale::get(
                'admin~admin.form.admin_services.lizmapPluginAPIURL.help',
                array(
                    $qgisMinimumVersionRequired,
                    $lizmapPluginMinimumVersionRequired,
                )
            );

            // Display form
            $tpl = new jTpl();
            $tpl->assign('form', $form);
            $tpl->assign('hasSenderEmail', $hasSenderEmail);
            $tpl->assign('showSystem', !lizmap::getServices()->hideSensitiveProperties());
            $tpl->assign('smtpEnabled', lizmap::getServices()->isSmtpEnabled());
            $rep->body->assign('MAIN', $tpl->fetch('admin~config_services'));
            $rep->body->assign('selectedMenuItem', 'lizmap_configuration');

            return $rep;
        }
        // redirect to default page
        jMessage::add('error in editServices');

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~config:index';

        return $rep;
    }

    /**
     * Save the data for the services section.
     *
     * @return jResponseRedirect redirect to the index
     */
    public function saveServices()
    {

        // If the section does exists in the ini file : get the data
        $services = lizmap::getServices();

        /** @var null|jFormsBase $form */
        $form = jForms::get('admin~config_services');

        // token
        $token = $this->param('__JFORMS_TOKEN__');
        // redirection vers la page d'erreur
        if (!$token) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~config:index';

            return $rep;
        }

        // If the form is not defined, redirection
        if (!$form) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~config:index';

            return $rep;
        }

        // Set the other form data from the request data
        $form->initFromRequest();

        // force sensitive services properties
        if ($services->hideSensitiveProperties()) {
            foreach ($services->getSensitiveProperties() as $ser) {
                /** @var null|jFormsControl $ctrl */
                $ctrl = $form->getControl($ser);
                if ($ctrl) {
                    $form->setData($ser, $services->{$ser});
                }
            }
        }

        if ($form->getData('allowUserAccountRequests') == 'on'
            || $form->getData('adminContactEmail') != ''
        ) {
            $form->getControl('adminSenderEmail')->required = true;
        }

        // Check the form
        $ok = true;
        if (!$form->check()) {
            $ok = false;
        }

        // Check the cacheRootDirectory : must be writable
        $cacheStorageType = $form->getData('cacheStorageType');
        if ($cacheStorageType != 'redis') {
            $cacheRootDirectory = $form->getData('cacheRootDirectory');
            if (!is_dir($cacheRootDirectory) or !is_writable($cacheRootDirectory)) {
                $ok = false;
                $form->setErrorOn(
                    'cacheRootDirectory',
                    jLocale::get('admin~admin.form.admin_services.message.cacheRootDirectory.wrong', array(sys_get_temp_dir()))
                );
            }
        }

        // Check that cacheExpiration is between 0 and 2592000 seconds
        if (intval($form->getData('cacheExpiration')) < 0 or intval($form->getData('cacheExpiration')) > 2592000) {
            $ok = false;
            $form->setErrorOn(
                'cacheExpiration',
                jLocale::get('admin~admin.form.admin_services.message.cacheExpiration.wrong')
            );
        }
        // Check the wmsPublicUrlList : must sub-domain
        $wmsPublicUrlList = $form->getData('wmsPublicUrlList');
        if ($wmsPublicUrlList != '') {
            $domain = jApp::coord()->request->getDomainName();
            $pattern = '/.*\.'.$domain.'$/';
            $publicUrlList = explode(',', $wmsPublicUrlList);
            foreach ($publicUrlList as $publicUrl) {
                if (preg_match($pattern, trim($publicUrl))) {
                    continue;
                }

                $ok = false;
                $form->setErrorOn(
                    'wmsPublicUrlList',
                    jLocale::get('admin~admin.form.admin_services.message.wmsPublicUrlList.wrong')
                );

                break;
            }
        }

        // Errors : redirection to the display action
        if (!$ok) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~config:editServices';
            $rep->params['errors'] = '1';

            return $rep;
        }

        // Save the data
        $data = array();
        foreach ($services->getProperties() as $prop) {
            /** @var null|jFormsControl $ctrl */
            $ctrl = $form->getControl($prop);
            if ($ctrl) {
                $data[$prop] = $form->getData($prop);
            }
        }

        $modifyServices = $services->modify($data);
        if ($modifyServices) {
            $modifyServices = lizmap::saveServices();
        }
        if ($modifyServices) {
            jMessage::add(jLocale::get('admin~admin.form.admin_services.message.data.saved'));
        }

        jForms::destroy('admin~config_services');

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the validation page
        $rep->action = 'admin~config:index';

        return $rep;
    }
}
