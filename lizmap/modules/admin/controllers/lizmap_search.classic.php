<?php

use Jelix\IniFile\IniModifier;
use Lizmap\App\LizmapSearch;

/**
 *  .
 *
 * @author    3liz
 * @copyright 2016-2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmap_searchCtrl extends jController
{
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.access'),
    );

    private $lizmapSearch;

    public function __construct($request)
    {
        $this->lizmapSearch = new LizmapSearch(lizmap::getAppContext());

        parent::__construct($request);
    }

    public function show()
    {
        $form = jForms::create('lizmap_search', 'show');
        $hasDedicatedProfile = $this->lizmapSearch->hasProfile();
        if ($hasDedicatedProfile) {
            $this->lizmapSearch->initProfileForm($form);
            $form->deactivate('password');
        }

        /** @var jResponseHtml $resp */
        $resp = $this->getResponse('html');
        $tpl = new jTpl();
        $tpl->assign('form', $form);
        $tpl->assign('isConfOk', $this->lizmapSearch->check(true));
        $tpl->assign('hasDedicatedProfile', $hasDedicatedProfile);
        $resp->body->assign('MAIN', $tpl->fetch('lizmapSearch'));

        return $resp;
    }

    public function pre()
    {
        $form = jForms::create('lizmap_search', 'edit');
        if ($this->lizmapSearch->hasProfile()) {
            $this->lizmapSearch->initProfileForm($form);
        } else {
            $form->deactivate('confirm_invalid');
            $form->deactivate('error_message');
        }

        return $this->redirect('admin~lizmap_search:edit');
    }

    public function edit()
    {
        $form = jForms::get('lizmap_search', 'edit');
        if (is_null($form)) {
            return $this->redirect('admin~lizmap_search:pre');
        }

        /** @var jResponseHtml $resp */
        $resp = $this->getResponse('html');
        $tpl = new jTpl();
        $tpl->assign('form', $form);
        $resp->body->assign('MAIN', $tpl->fetch('lizmapSearch.edit'));

        return $resp;
    }

    public function save()
    {

        $form = jForms::fill('lizmap_search', 'edit');
        if (!$form->check()) {
            return $this->redirect('admin~lizmap_search:edit');
        }

        $profilConfig = array(
            'driver' => 'pgsql',
            'host' => $form->getData('host'),
            'database' => $form->getData('database'),
            'user' => $form->getData('user'),
            'password' => $form->getData('password'),
            'search_path' => $form->getData('search_path'),
        );

        try {
            $confIsOk = jDb::_createConnector(array_merge($profilConfig, array('usepdo' => false, 'dbtype' => 'pgsql')));
            $confIsOk->close();
        } catch (Exception $e) {
            if (!$form->getData('confirm_invalid')) {
                // values does not enable to connect
                $form->deactivate('confirm_invalid', false);
                $form->deactivate('error_message', false);
                $form->setData('error_message', $e->getMessage());
                $form->setErrorOn('confirm_invalid', jLocale::get('admin~lizmap_search.form.error.connection_error'));

                return $this->redirect('admin~lizmap_search:edit');
            }
        }

        $pModifier = new IniModifier(jApp::varConfigPath('profiles.ini.php'));
        $pModifier->setValues($profilConfig, 'jdb:search');
        $pModifier->save();

        jForms::destroy('lizmap_search', 'edit');

        return $this->redirect('admin~lizmap_search:show');

    }
}
