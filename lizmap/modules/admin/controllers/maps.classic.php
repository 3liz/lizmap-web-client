<?php

use Jelix\FileUtilities\Path;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\Proxy;

/**
 * Lizmap administration.
 *
 * @author    3liz
 * @copyright 2012-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class mapsCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.rights.and' => array('lizmap.admin.access', 'lizmap.admin.repositories.view')),
        'createSection' => array('jacl2.rights' => 'lizmap.admin.repositories.create'),
        'modifySection' => array('jacl2.right' => 'lizmap.admin.repositories.update'),
        'editSection' => array('jacl2.rights.or' => array('lizmap.admin.repositories.create', 'lizmap.admin.repositories.update')),
        'saveSection' => array('jacl2.rights.or' => array('lizmap.admin.repositories.create', 'lizmap.admin.repositories.update')),
        'validateSection' => array('jacl2.rights.or' => array('lizmap.admin.repositories.create', 'lizmap.admin.repositories.update')),
        'removeSection' => array('jacl2.right' => 'lizmap.admin.repositories.delete'),
        'removeCache' => array('jacl2.right' => 'lizmap.admin.repositories.delete'),
        'removeLayerCache' => array('jacl2.right' => 'lizmap.admin.repositories.delete'),
    );

    // Prefix of jacl2 subjects corresponding to lizmap web client view interface
    // used to get only non admin subjects
    protected $lizmapClientPrefix = 'lizmap.repositories|lizmap.tools';

    // The selected admin menu item
    protected $selectedMenuItem = 'lizmap_maps';

    /**
     * Display the list of repositories and maps.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get rights for repositories per subject and groups
        $cnx = jDb::getConnection('jacl2_profile');
        $repositories = array();
        $data = array();
        foreach (lizmap::getRepositoryList() as $repo) {
            // $sql = " SELECT r.id_aclsbj, group_concat(g.name, ' - ') AS group_names";
            $sql = ' SELECT r.id_aclsbj, g.name AS group_name';
            $sql .= ' FROM jacl2_rights r';
            $sql .= ' INNER JOIN jacl2_group g ON r.id_aclgrp = g.id_aclgrp';
            $sql .= ' WHERE (g.grouptype = 0 OR g.grouptype = 1)';
            $sql .= ' AND id_aclres='.$cnx->quote($repo);
            // $sql.= " GROUP BY r.id_aclsbj;";
            $sql .= ' ORDER BY g.name';
            $rights = $cnx->query($sql);

            $group_names = array();
            foreach ($rights as $r) {
                if (!array_key_exists($r->id_aclsbj, $group_names)) {
                    $group_names[$r->id_aclsbj] = array();
                }
                $group_names[$r->id_aclsbj][] = $r->group_name;
            }
            foreach ($group_names as $k => $v) {
                $group_names[$k] = implode(' - ', $v);
            }

            $rights = (object) $group_names;

            $repositories[] = lizmap::getRepository($repo);
            $data[$repo] = $rights;
        }

        // Subjects labels
        $subjects = array();
        $labels = array();
        $daosubject = jDao::get('jacl2db~jacl2subject', 'jacl2_profile');
        foreach ($daosubject->findAllSubject() as $subject) {
            $subjects[] = $subject->id_aclsbj;
            $labels[$subject->id_aclsbj] = $this->getLabel($subject->id_aclsbj, $subject->label_key);
        }

        // Get the data

        $tpl = new jTpl();
        $tpl->assign('repositories', $repositories);
        $tpl->assign('rootRepositories', lizmap::getServices()->getRootRepositories());
        $tpl->assign('data', $data);
        $tpl->assign('subjects', $subjects);
        $tpl->assign('labels', $labels);
        $rep->body->assign('MAIN', $tpl->fetch('maps'));
        $rep->body->assign('selectedMenuItem', $this->selectedMenuItem);

        return $rep;
    }

    /**
     * Get label for a given subject corresponding to passed lablekey.
     *
     * @param string $id       Id of the subject
     * @param string $labelKey Label key of the subject
     *
     * @return string label if found, else key
     */
    protected function getLabel($id, $labelKey)
    {
        if ($labelKey) {
            try {
                return jLocale::get($labelKey);
            } catch (Exception $e) {
            }
        }

        return $id;
    }

    /**
     * Add checkboxes controls to a repository form for each lizmap subject.
     * Used to manage rights for each subject and for each group of each repositories.
     *
     * @param object      $form       jform object concerned
     * @param null|string $repository repository key
     * @param string      $load       if db, load data from jacl2 database and set form control data
     *
     * @return object modified form
     */
    protected function populateRepositoryRightsFormControl($form, $repository = null, $load = 'db')
    {
        // Daos to use
        $daosubject = jDao::get('jacl2db~jacl2subject', 'jacl2_profile');
        $daogroup = jDao::get('jacl2db~jacl2group', 'jacl2_profile');
        $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
        // Loop through the jacl2 subjects
        foreach ($daosubject->findAllSubject() as $subject) {
            // Filter only lizmap subjects
            if (preg_match('#^'.$this->lizmapClientPrefix.'#', $subject->id_aclsbj)) {
                // Create a new form control
                $ctrl = new jFormsControlCheckboxes($subject->id_aclsbj);
                $ctrl->label = $this->getLabel($subject->id_aclsbj, 'admin~jacl2.'.$subject->id_aclsbj);
                $dataSource = new jFormsStaticDatasource();
                $mydata = array();
                // Initialize future values to set
                $dataValues = array();
                $group = $daogroup->get('__anonymous');
                $mydata[$group->id_aclgrp] = $group->name;
                // Loop through each public group
                foreach ($daogroup->findAllPublicGroup() as $group) {
                    $mydata[$group->id_aclgrp] = $group->name.' ('.$group->id_aclgrp.')';
                    if ($group->grouptype == 1) {
                        $mydata[$group->id_aclgrp] .= ' ['.jLocale::get('admin~jacl2.lizmap.admin.grp.default').']';
                    }
                }
                $dataSource->data = $mydata;
                $ctrl->datasource = $dataSource;
                $form->addControl($ctrl);
                // Get default data for new repository
                if ($load == 'default' || !$repository) {
                    // Loop through each default group
                    $defaultGroups = array();
                    // getDefaultGroups is a method defined in dao file
                    // undefined method jDaoFactoryBase::getDefaultGroups()
                    assert(method_exists($daogroup, 'getDefaultGroups'));
                    foreach ($daogroup->getDefaultGroups() as $group) {
                        $defaultGroups[] = $group->id_aclgrp;
                    }
                    if ($subject->id_aclsbj == 'lizmap.repositories.view') {
                        $dataValues = array_merge($defaultGroups, array('__anonymous', 'admins'));
                    } elseif ($subject->id_aclsbj == 'lizmap.tools.edition.use') {
                        $dataValues = array('admins');
                    } elseif ($subject->id_aclsbj != 'lizmap.tools.loginFilteredLayers.override') {
                        $dataValues = array_merge($defaultGroups, array('admins'));
                    }
                }
                // Get data from database
                elseif ($load == 'db' && $repository !== null) {
                    foreach ($mydata as $id_aclgrp => $name_aclgrp) {
                        $conditions = jDao::createConditions();
                        $conditions->addCondition('id_aclsbj', '=', $subject->id_aclsbj);
                        $conditions->addCondition('id_aclgrp', '=', $id_aclgrp);
                        $conditions->addCondition('id_aclres', '=', $repository);
                        $res = $daoright->findBy($conditions);
                        foreach ($res as $rec) {
                            $dataValues[] = $rec->id_aclgrp;
                        }
                    }
                }
                // Get data from form on error if needed
                elseif ($load == 'request') {
                    // Edit control ref to get request params
                    $param = str_replace('.', '_', $subject->id_aclsbj);
                    $dataValues = array_values(jApp::coord()->request->params[$param]);
                }
                // Set the preselected data if needed
                if ($load) {
                    $form->setData($subject->id_aclsbj, $dataValues);
                }
            }
        }

        return $form;
    }

    /**
     * Save rights for a repository.
     * Used to save rights for each subject and for each group of one repository.
     *
     * @param object $form       jform object concerned
     * @param string $repository repository key
     */
    protected function saveRepositoryRightsFromRequest($form, $repository)
    {
        // Daos to use
        $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
        $daogroup = jDao::get('jacl2db~jacl2group', 'jacl2_profile');

        // Loop through the form controls
        foreach ($form->getControls() as $ctrl) {
            // Filter controls corresponding to lizmap subjects
            if (preg_match('#^'.$this->lizmapClientPrefix.'#', $ctrl->ref) && $ctrl->isContainer()) {
                $id_aclsbj = $ctrl->ref;
                // Edit control ref to get request params
                $param = str_replace('.', '_', $id_aclsbj);
                // Get values for the selected subject
                if (isset(jApp::coord()->request->params[$param])) {
                    $values = array_values(jApp::coord()->request->params[$param]);
                } else {
                    // the list in the form may be empty, so no parameters
                    $values = array();
                }
                // Add the anonymous right if needed else remove it
                if (in_array('__anonymous', $values)) {
                    jAcl2DbManager::addRight('__anonymous', $id_aclsbj, $repository);
                } else {
                    $daoright->delete($id_aclsbj, '__anonymous', $repository);
                }
                // Loop through the groups
                foreach ($daogroup->findAllPublicGroup() as $group) {
                    // Add the right if needed else remove it
                    if (in_array($group->id_aclgrp, $values)) {
                        jAcl2DbManager::addRight($group->id_aclgrp, $id_aclsbj, $repository);
                    } else {
                        $daoright->delete($id_aclsbj, $group->id_aclgrp, $repository);
                    }
                }
            }
        }
    }

    /**
     * Creation of a new section.
     *
     * @return jResponseRedirect to the form display action
     */
    public function createSection()
    {
        // Create the form
        jForms::destroy('admin~config_section');
        $form = jForms::create('admin~config_section');
        $form->setData('new', '1');
        $form->setReadOnly('repository', false);
        $form = $this->populateRepositoryRightsFormControl($form, null, 'default');

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the form display action.
        $rep->action = 'admin~maps:editSection';

        return $rep;
    }

    /**
     * Modification of a repository.
     *
     * @return jResponseRedirect to the form display action
     */
    public function modifySection()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        // initialise data
        $repository = $this->param('repository');

        // Get the corresponding repository
        $lizmapRep = lizmap::getRepository($repository);

        // Redirect if no repository with this key
        if (!$lizmapRep || $lizmapRep->getKey() != $repository) {
            $rep->action = 'admin~maps:index';

            return $rep;
        }

        // Get lizmap repository key to create the right form
        $lizmapRepKey = $lizmapRep->getKey();

        // Create and fill the form
        jForms::destroy('admin~config_section', $lizmapRepKey);
        $form = jForms::create('admin~config_section', $lizmapRepKey);
        $form->setData('new', '0');
        $form->setData('repository', (string) $lizmapRepKey);
        $form->setReadOnly('repository', true);
        // Create and fill form controls relatives to repository data
        lizmap::constructRepositoryForm($lizmapRep, $form);
        // Create and fill the form control relative to rights for each group for this repository
        $form = $this->populateRepositoryRightsFormControl($form, $lizmapRepKey, 'db');

        // redirect to the form display action
        $rep->params['repository'] = $repository;
        $rep->action = 'admin~maps:editSection';

        return $rep;
    }

    /**
     * Display the form to create/modify a Section.
     *
     * @urlparam string $repository (optional) Name of the repository
     *
     * @return jResponseHtml|jResponseRedirect the form
     */
    public function editSection()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        $repository = $this->param('repository');

        // Get services data
        $services = lizmap::getServices();
        // Get repository data
        $lizmapRep = lizmap::getRepository($repository);
        // Get lizmap repository key to get the right form
        $lizmapRepKey = null;
        if ($lizmapRep) {
            $lizmapRepKey = $lizmapRep->getKey();
        }

        /** @var null|jFormsBase $form */
        $form = jForms::get('admin~config_section', $lizmapRepKey);
        // get the form

        if ($form) {
            // Create and fill form controls relatives to repository data
            lizmap::constructRepositoryForm($lizmapRep, $form);
            // Create and fill the form control relative to rights for each group for this repository
            if ($this->intParam('errors') && $lizmapRep) {
                $form = $this->populateRepositoryRightsFormControl($form, $lizmapRepKey, 'request');
            } elseif ($lizmapRep) {
                $form = $this->populateRepositoryRightsFormControl($form, $lizmapRepKey, false);
            } else {
                $form = $this->populateRepositoryRightsFormControl($form, null, false);
            }

            // Display form
            $tpl = new jTpl();
            $tpl->assign('form', $form);
            $rep->body->assign('MAIN', $tpl->fetch('config_section'));
            $rep->body->assign('selectedMenuItem', $this->selectedMenuItem);

            return $rep;
        }
        // Redirect to default page
        jMessage::add('error in editSection');

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~maps:index';
        if ($lizmapRep) {
            $rep->anchor = $lizmapRep->getKey();
        }

        return $rep;
    }

    /**
     * Save the data for one section.
     *
     * @return jResponseRedirect to the index
     */
    public function saveSection()
    {
        $repository = $this->param('repository');
        $new = (bool) $this->param('new');

        $ok = true;

        // Get services data
        $services = lizmap::getServices();
        // Repository (first take the default one)
        $lizmapRep = lizmap::getRepository($repository);
        // Get lizmap repository key to get the right form
        $lizmapRepKey = null;
        if ($lizmapRep) {
            $lizmapRepKey = $lizmapRep->getKey();
        }

        /** @var null|jFormsBase $form */
        $form = jForms::get('admin~config_section', $lizmapRepKey);
        // Get the form

        // token
        $token = $this->param('__JFORMS_TOKEN__');
        if (!$token) {
            $ok = false;
            jMessage::add('missing form token');
        }

        // If the form is not defined, redirection
        if (!$form) {
            $ok = false;
        }

        // Redirection in case of errors
        if (!$ok) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~maps:index';
            if (!$new) {
                $rep->anchor = $repository;
            }

            return $rep;
        }

        // Rebuild form fields
        lizmap::constructRepositoryForm($lizmapRep, $form);
        if ($lizmapRep) {
            $form = $this->populateRepositoryRightsFormControl($form, $lizmapRepKey, false);
        } else {
            $form = $this->populateRepositoryRightsFormControl($form, null, false);
        }

        // Set form data from request data
        $form->initFromRequest();

        // Check the form
        $ok = true;
        if (!$form->check()) {
            $ok = false;
        }
        if (!$new && !$lizmapRep) {
            $form->setErrorOn('repository', jLocale::get('admin~admin.form.admin_section.message.repository.wrong'));
            $ok = false;
        }

        // Check paths
        if (in_array('path', lizmapRepository::getProperties())) {
            $npath = $form->getData('path');
            if ($npath[0] != '/' and $npath[1] != ':') {
                $npath = jApp::varPath().$npath;
            }
            if (!file_exists($npath) or !is_dir($npath)) {
                $form->setErrorOn('path', jLocale::get('admin~admin.form.admin_section.message.path.wrong'));
                $ok = false;
            }
            $rootRepositories = $services->getRootRepositories();
            if ($rootRepositories != '') {
                $fullPath = Path::normalizePath(
                    $npath,
                    Path::NORM_ADD_TRAILING_SLASH
                );
                if ($lizmapRep) {
                    $lizmapRepPath = $lizmapRep->getPath();
                    if (substr($lizmapRepPath, 0, strlen($rootRepositories)) !== $rootRepositories) {
                        // original path is outside repositories root, so we keep it
                        $form->setData('path', $lizmapRepPath);
                    } elseif (substr($fullPath, 0, strlen($rootRepositories)) !== $rootRepositories) {
                        // If the given path is outside the repositories root:
                        // we don't accept it
                        $form->setErrorOn('path', jLocale::get('admin~admin.form.admin_section.message.path.not_authorized'));
                        jLog::log('rootRepositories == '.$rootRepositories.', repository '.$lizmapRepKey.' path == '.$fullPath, 'error');
                        $ok = false;
                    }
                } elseif (substr($fullPath, 0, strlen($rootRepositories)) !== $rootRepositories) {
                    // If the given path is outside the repositories root:
                    // we don't accept it
                    $form->setErrorOn('path', jLocale::get('admin~admin.form.admin_section.message.path.not_authorized'));
                    jLog::log('rootRepositories == '.$rootRepositories.', new repository path == '.$fullPath, 'error');
                    $ok = false;
                }
            }
        }

        // checks list of domains for CORS
        $domainListStr = $form->getData('accessControlAllowOrigin');
        if ($domainListStr) {
            $domainList = preg_split('/\s*,\s*/', $domainListStr);
            $okDomain = true;
            $newDomainList = array();
            foreach ($domainList as $domain) {
                if ($domain == '') {
                    continue;
                }
                if (!preg_match('!^(https?://)!', $domain)) {
                    $domain = 'https://'.$domain;
                }
                $urlParts = parse_url($domain);
                if ($urlParts === false) {
                    $form->setErrorOn('accessControlAllowOrigin', jLocale::get('admin~admin.form.admin_section.message.accessControlAllowOrigin.bad.domain'));
                    $ok = $okDomain = false;

                    break;
                }

                // we clean the url
                $newDomain = $urlParts['scheme'].'://'.$urlParts['host'];
                if (isset($urlParts['port']) && $urlParts['port']) {
                    $newDomain .= ':'.$urlParts['port'];
                }
                $newDomainList[] = $newDomain;
            }
            if ($okDomain) {
                $form->setData('accessControlAllowOrigin', implode(',', $newDomainList));
            }
        }

        // Errors : redirection to the display action
        if (!$ok) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~maps:editSection';
            $rep->params['repository'] = $repository;
            $rep->params['errors'] = '1';

            foreach (jApp::coord()->request->params as $k => $v) {
                if (preg_match('#^'.$this->lizmapClientPrefix.'#', $k)) {
                    $rep->params[$k] = $v;
                }
            }

            if ($new) {
                $form->setReadOnly('repository', false);
            }

            return $rep;
        }

        // Repository data
        $data = array();
        foreach (lizmapRepository::getProperties() as $prop) {
            $data[$prop] = $form->getData($prop);
            // Check paths
            if ($prop == 'path') {
                // add a trailing / if needed
                if (!preg_match('#/$#', $data[$prop])) {
                    $data[$prop] .= '/';
                }
            }
        }

        // Save the data
        if ($new && !$lizmapRep) {
            $lizmapRep = lizmap::createRepository($repository, $data);
        } elseif ($lizmapRep) {
            $modifySection = lizmap::updateRepository($lizmapRepKey, $data);
        }
        jMessage::add(jLocale::get('admin~admin.form.admin_section.message.data.saved'));
        // group rights data
        $this->saveRepositoryRightsFromRequest($form, $repository);

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the validation page
        $rep->params['repository'] = $repository;
        $rep->params['new'] = $new;
        $rep->action = 'admin~maps:validateSection';

        return $rep;
    }

    /**
     * Save the data for one section.
     *
     * @return jResponseRedirect to the index
     */
    public function validateSection()
    {
        $repository = $this->param('repository');
        $new = $this->param('new');

        // Repository (first take the default one)
        $lizmapRep = lizmap::getRepository($repository);
        // Get lizmap repository key to get the right form
        $lizmapRepKey = null;
        if (!$new) {
            $lizmapRepKey = $lizmapRep->getKey();
        }

        /** @var null|jFormsBase $form */
        $form = jForms::get('admin~config_section', $lizmapRepKey);
        // Destroy the form
        if ($form) {
            jForms::destroy('admin~config_section', $lizmapRepKey);
        } else {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            // undefined form : redirect
            $rep->action = 'admin~maps:index';

            return $rep;
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the index
        $rep->action = 'admin~maps:index';
        $rep->anchor = $repository;

        return $rep;
    }

    /**
     * Remove a section.
     *
     * @return jResponseRedirect to the index
     */
    public function removeSection()
    {
        $repository = $this->param('repository');

        // Remove the section
        if (lizmap::removeRepository($repository)) {
            // Remove rights on this resource
            $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
            $conditions = jDao::createConditions();
            $conditions->addCondition('id_aclres', '=', $repository);
            $nbdeleted = $daoright->deleteBy($conditions);
            jMessage::add(jLocale::get('admin~admin.form.admin_section.message.data.removed').' '.jLocale::get('admin~admin.form.admin_section.message.data.removed.groups.concerned', array($nbdeleted)));
        } else {
            jMessage::add(jLocale::get('admin~admin.form.admin_section.message.data.removed.failed'), 'error');
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the index
        $rep->action = 'admin~maps:index';

        return $rep;
    }

    /**
     * Empty a map service cache.
     *
     * @urlparam string $repository Repository for which to remove all tile cache
     *
     * @return jResponseRedirect Redirection to the index
     */
    public function removeCache()
    {
        $repository = $this->param('repository');
        $repoKey = Proxy::clearCache(lizmap::getRepository($repository));
        if ($repoKey) {
            jMessage::add(jLocale::get('admin~admin.cache.repository.removed', array($repoKey)));
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Redirect to the index
        $rep->action = 'admin~maps:index';

        return $rep;
    }

    /**
     * Empty a map service cache.
     *
     * @urlparam string $repository Repository for which to remove all tile cache
     *
     * @return jResponseRedirect Redirection to the index
     */
    public function removeLayerCache()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        // Create response to redirect to the index
        $rep->action = 'admin~maps:index';

        $repository = $this->param('repository');
        $lizmapRep = lizmap::getRepository($repository);
        if (!$lizmapRep) {
            jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'error');

            return $rep;
        }

        $project = $this->param('project');

        try {
            $lproj = lizmap::getProject($lizmapRep->getKey().'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'error');

                return $rep;
            }
            $layer = $this->param('layer');

            // Remove project cache
            $lproj->clearCache();

            // Remove the cache for the layer
            Proxy::clearLayerCache($repository, $project, $layer);

            jMessage::add(jLocale::get('admin~admin.cache.layer.removed', array($layer)));

            return $rep;
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jMessage::add('The lizmap project '.$project.' does not exist !', 'error');

            return $rep;
        }
    }
}
