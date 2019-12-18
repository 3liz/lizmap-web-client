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
class mapsCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.rights.and' => ['lizmap.admin.access', 'lizmap.admin.repositories.view']),
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

    /**
     * Display the list of repositories and maps
     */
    public function index()
    {
        $rep = $this->getResponse('html');

        // Get rights for repositories per subject and groups
        $cnx = jDb::getConnection('jacl2_profile');
        $repositories = array();
        $data = array();
        foreach (lizmap::getRepositoryList() as $repo) {
            //$sql = " SELECT r.id_aclsbj, group_concat(g.name, ' - ') AS group_names";
            $sql = ' SELECT r.id_aclsbj, g.name AS group_name';
            $sql .= ' FROM jacl2_rights r';
            $sql .= ' INNER JOIN jacl2_group g ON r.id_aclgrp = g.id_aclgrp';
            $sql .= ' WHERE (g.grouptype = 0 OR g.grouptype = 1)';
            $sql .= ' AND id_aclres='.$cnx->quote($repo);
            //$sql.= " GROUP BY r.id_aclsbj;";
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
        $rep->body->assign('selectedMenuItem', 'lizmap_maps');

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
     * @param object $form       jform object concerned
     * @param object $repository repository key
     * @param bool   $load       if true, load data from jacl2 database and set form control data
     *
     * @return object modified form
     */
    protected function populateRepositoryRightsFormControl($form, $repository, $load = 'db')
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
                if ($load == 'db') {
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
                $dataSource->data = $mydata;
                $ctrl->datasource = $dataSource;
                $form->addControl($ctrl);
                // Get data from form on error if needed
                if ($load == 'request') {
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
     * @param object $repository repository key
     *
     * @return bool success or failure of the saving
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
     * @return Redirect to the form display action
     */
    public function createSection()
    {
        // Create the form
        jForms::destroy('admin~config_section');
        $form = jForms::create('admin~config_section');
        $form->setData('new', '1');
        $form->setReadOnly('repository', false);

        // Redirect to the form display action.
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~maps:editSection';

        return $rep;
    }

    /**
     * Modification of a repository.
     *
     * @return Redirect to the form display action
     */
    public function modifySection()
    {

    // initialise data
        $repository = $this->param('repository');
        // Get the corresponding repository
        $lrep = lizmap::getRepository($repository);

        // Redirect if no repository with this key
        if (!$lrep || $lrep->getKey() != $repository) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~maps:index';

            return $rep;
        }

        // Create and fill the form
        $form = jForms::create('admin~config_section');
        $form->setData('new', '0');
        $form->setData('repository', (string) $lrep->getKey());
        $form->setReadOnly('repository', true);
        // Create and fill form controls relatives to repository data
        lizmap::constructRepositoryForm($lrep, $form);
        // Create and fill the form control relative to rights for each group for this repository
        $form = $this->populateRepositoryRightsFormControl($form, $lrep->getKey(), 'db');

        // redirect to the form display action
        $rep = $this->getResponse('redirect');
        $rep->params['repository'] = $repository;
        $rep->action = 'admin~maps:editSection';

        return $rep;
    }

    /**
     * Display the form to create/modify a Section.
     *
     * @param string $repository (optional) Name of the repository
     *
     * @return Display the form
     */
    public function editSection()
    {
        $rep = $this->getResponse('html');

        $repository = $this->param('repository');
        $new = (bool) $this->param('new');

        // Get services data
        $services = lizmap::getServices();
        // Get repository data
        $lrep = lizmap::getRepository($repository);
        // what to do if it's a new one!

        // Get the form
        $form = jForms::get('admin~config_section');

        if ($form) {
            // Create and fill form controls relatives to repository data
            lizmap::constructRepositoryForm($lrep, $form);
            // Create and fill the form control relative to rights for each group for this repository
            if ($this->intParam('errors') && $lrep) {
                $form = $this->populateRepositoryRightsFormControl($form, $lrep->getKey(), 'request');
            } elseif ($lrep) {
                $form = $this->populateRepositoryRightsFormControl($form, $lrep->getKey(), false);
            }

            // Display form
            $tpl = new jTpl();
            $tpl->assign('form', $form);
            $rep->body->assign('MAIN', $tpl->fetch('config_section'));
            $rep->body->assign('selectedMenuItem', 'lizmap_configuration');

            return $rep;
        }
        // Redirect to default page
        jMessage::add('error in editSection');
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~maps:index';

        return $rep;
    }

    /**
     * Save the data for one section.
     *
     * @return Redirect to the index
     */
    public function saveSection()
    {
        $repository = $this->param('repository');
        $new = (bool) $this->param('new');

        $ok = true;

        // Get services data
        $services = lizmap::getServices();
        // Repository (first take the default one)
        $lrep = lizmap::getRepository($repository);
        // what to do if it's a new one!

        // Get the form
        $form = jForms::get('admin~config_section');

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
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~maps:index';

            return $rep;
        }

        // Rebuild form fields
        /*foreach(lizmap::getRepositoryProperties() as $k){
          if ( $propertiesOptions[$k]['fieldType'] == 'checkbox' ) {
            $ctrl = new jFormsControlCheckbox($k);
          }
          else {
            $ctrl = new jFormsControlInput($k);
          }
          $ctrl->required = $propertiesOptions[$k]['required'];
          $ctrl->label = jLocale::get("admin~admin.form.admin_section.repository.".$k.".label");
          $datatype = new jDatatypeString();
          $ctrl->datatype=$datatype;
          $form->addControl($ctrl);
        }*/
        lizmap::constructRepositoryForm($lrep, $form);
        if ($lrep) {
            $form = $this->populateRepositoryRightsFormControl($form, $lrep->getKey(), false);
        }

        // Set form data from request data
        $form->initFromRequest();

        // Check the form
        $ok = true;
        if (!$form->check()) {
            $ok = false;
        }
        if (!$new && !$lrep) {
            $form->setErrorOn('repository', jLocale::get('admin~admin.form.admin_section.message.repository.wrong'));
            $ok = false;
        }

        // Check paths
        if (in_array('path', lizmap::getRepositoryProperties())) {
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
                if ($lrep && substr($lrep->getPath(), 0, strlen($rootRepositories)) !== $rootRepositories) {
                    //Can't update path
                    $form->setData('path', $lrep->getData('path'));
                } elseif ($lrep && substr($lrep->getPath(), 0, strlen($rootRepositories)) === $rootRepositories && substr(realpath($npath), 0, strlen($rootRepositories)) !== $rootRepositories) {
                    $form->setErrorOn('path', jLocale::get('admin~admin.form.admin_section.message.path.not_authorized'));
                    jLog::log('rootRepositories == '.$rootRepositories.', repository '.$lrep->getKey().' path == '.realpath($npath));
                    $ok = false;
                } elseif ($lrep == null && substr(realpath($npath), 0, strlen($rootRepositories)) !== $rootRepositories) {
                    $form->setErrorOn('path', jLocale::get('admin~admin.form.admin_section.message.path.not_authorized'));
                    jLog::log('rootRepositories == '.$rootRepositories.', new repository path == '.realpath($npath));
                    $ok = false;
                }
            }
        }

        if (!$ok) {
            // Errors : redirection to the display action
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
        foreach (lizmap::getRepositoryProperties() as $prop) {
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
        if ($new && !$lrep) {
            $lrep = lizmap::createRepository($repository, $data);
        } elseif ($lrep) {
            $modifySection = $lrep->update($data);
        }
        jMessage::add(jLocale::get('admin~admin.form.admin_section.message.data.saved'));
        // group rights data
        $this->saveRepositoryRightsFromRequest($form, $repository);

        // Redirect to the validation page
        $rep = $this->getResponse('redirect');
        $rep->params['repository'] = $repository;
        if ($new) {
            $rep->params['new'] = 1;
        }
        $rep->action = 'admin~maps:validateSection';

        return $rep;
    }

    /**
     * Save the data for one section.
     *
     * @return Redirect to the index
     */
    public function validateSection()
    {
        $repository = $this->param('repository');
        $new = $this->intParam('new');

        // Destroy the form
        if ($form = jForms::get('admin~config_section')) {
            jForms::destroy('admin~config_section');
        } else {
            // undefined form : redirect
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~config:index';

            return $rep;
        }

        // Redirect to the index
        $rep = $this->getResponse('redirect');

        if ($new) {
            jMessage::add(jLocale::get('admin~admin.form.admin_section.message.configure.rights'));
            $rep->action = 'admin~maps:modifySection';
            $rep->params['repository'] = $repository;
        } else {
            $rep->action = 'admin~maps:index';
        }

        return $rep;
    }

    /**
     * Remove a section.
     *
     * @return Redirect to the index
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

        // Redirect to the index
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~maps:index';

        return $rep;
    }

    /**
     * Empty a map service cache.
     *
     * @param string $repository Repository for which to remove all tile cache
     *
     * @return jResponseRedirect Redirection to the index
     */
    public function removeCache()
    {
        $repository = $this->param('repository');
        $repoKey = lizmapProxy::clearCache($repository);
        if ($repoKey) {
            jMessage::add(jLocale::get('admin~admin.cache.repository.removed', array($repoKey)));
        }

        // Redirect to the index
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~maps:index';

        return $rep;
    }

    /**
     * Empty a map service cache.
     *
     * @param string $repository Repository for which to remove all tile cache
     *
     * @return jResponseRedirect Redirection to the index
     */
    public function removeLayerCache()
    {
        // Create response to redirect to the index
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~maps:index';

        $repository = $this->param('repository');
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'error');

            return $rep;
        }

        $project = $this->param('project');

        try {
            $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'error');

                return $rep;
            }
            $layer = $this->param('layer');

            // Remove project cache
            $lproj->clearCache();

            // Remove the cache for the layer
            lizmapProxy::clearLayerCache($repository, $project, $layer);

            jMessage::add(jLocale::get('admin~admin.cache.layer.removed', array($layer)));

            return $rep;
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'error');

            return $rep;
        }

        return $rep;
    }
}
