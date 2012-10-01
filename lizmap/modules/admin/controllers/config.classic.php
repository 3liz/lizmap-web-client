<?php
/**
* Lizmap administration
* @package   lizmap
* @subpackage admin
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class configCtrl extends jController {

  // Configure access via jacl2 rights management
  public $pluginParams = array(
    '*' => array( 'jacl2.right'=>'lizmap.admin.access'),
    'modifyServices' => array( 'jacl2.right'=>'lizmap.admin.services.update'),
    'editServices' => array( 'jacl2.right'=>'lizmap.admin.services.update'),
    'saveServices' => array( 'jacl2.right'=>'lizmap.admin.services.update'),
    'validateServices' => array( 'jacl2.right'=>'lizmap.admin.services.update'),
    'createSection' => array( 'jacl2.right'=>'lizmap.admin.repositories.create'),
    'modifySection' => array( 'jacl2.right'=>'lizmap.admin.repositories.update'),
    'editSection' => array( 'jacl2.rights.or'=>array('lizmap.admin.repositories.create', 'lizmap.admin.repositories.update')),
    'saveSection' => array( 'jacl2.rights.or'=>array('lizmap.admin.repositories.create', 'lizmap.admin.repositories.update')),
    'validateSection' => array( 'jacl2.rights.or'=>array('lizmap.admin.repositories.create', 'lizmap.admin.repositories.update')),
    'removeSection' => array( 'jacl2.right'=>'lizmap.admin.repositories.delete'),
    'removeCache' => array( 'jacl2.right'=>'lizmap.admin.repositories.delete')

  );


  // Prefix of jacl2 subjects corresponding to lizmap web client view interface
  protected $lizmapClientPrefix = 'lizmap.repositories';
  // Black list some non wanted groups
  protected $groupBlacklist = array('users');


  /**
  * Display a summary of the information taken from the ~ configuration file.
  *
  * @return Administration backend for the repositories.
  */
  function index() {
    $rep = $this->getResponse('html');

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Get rights for repositories per subject and groups
    $cnx = jDb::getConnection('jacl2_profile');
    $data = array();
    foreach($lizmapConfig->repositoryList as $repo){
      //$sql = " SELECT r.id_aclsbj, group_concat(g.name, ' - ') AS group_names";
      $sql = " SELECT r.id_aclsbj, g.name AS group_name";
      $sql.= " FROM jacl2_rights r";
      $sql.= " INNER JOIN jacl2_group g ON r.id_aclgrp = g.id_aclgrp";
      $sql.= " WHERE g.grouptype = 0 AND r.id_aclgrp NOT IN ('".implode("','", $this->groupBlacklist)."')";
      $sql.= " AND id_aclres=".$cnx->quote($repo);
      //$sql.= " GROUP BY r.id_aclsbj;";
      $rights = $cnx->query($sql);

      $group_names = array();
      foreach ($rights as $r) {
	if (!array_key_exists($r->id_aclsbj,$group_names))
          $group_names[$r->id_aclsbj] = array();
	$group_names[$r->id_aclsbj][] = $r->group_name;
      }
      foreach ($group_names as $k => $v) {
	$group_names[$k] = implode(' - ', $v);
      }
      $rights = (object) $group_names;

      $data[$repo] = $rights;
    }

    // Subjects labels
    $labels = array();
    $daosubject = jDao::get('jacl2db~jacl2subject','jacl2_profile');
    foreach($daosubject->findAllSubject() as $subject)
      $labels[$subject->id_aclsbj] = $this->getLabel($subject->id_aclsbj, $subject->label_key);

    $tpl = new jTpl();
    $tpl->assign('lizmapConfig', $lizmapConfig);
    $tpl->assign('data', $data);
    $tpl->assign('labels', $labels);
    $rep->body->assign('MAIN', $tpl->fetch('config'));
    $rep->body->assign('selectedMenuItem','lizmap_configuration');

    return $rep;
  }



  /**
  * Modification of the services configuration.
  * @return Redirect to the form display action.
  */
  public function modifyServices(){

    // Get the data
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig("");

    // Create the form
    $form = jForms::create('admin~config_services');

    // Fill the default repository menu list with data from ini file
    $ctrl = new jFormsControlMenulist('defaultRepository');
    $dataSource = new jFormsStaticDatasource();
    $mydata = array();
    foreach($lizmapConfig->repositoryList as $repo)
      $mydata[$repo] = $repo;
    $dataSource->data = $mydata;
    $ctrl->datasource = $dataSource;
    $ctrl->label = jLocale::get("admin~admin.form.admin_services.defaultRepository.label");
    $ctrl->required = true;
    $form->addControl($ctrl);
    $form->setData('defaultRepository', $lizmapConfig->defaultRepository);

    // Set form data values
    foreach($lizmapConfig->servicesPropertyList as $ser)
      $form->setData($ser, $lizmapConfig->$ser);

    // redirect to the form display action
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:editServices";
    return $rep;
  }


  /**
  * Display the form to modify the services.
  * @return Display the form.
  */
  public function editServices(){
    $rep = $this->getResponse('html');

    // Get the form
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig('');
    $form = jForms::get('admin~config_services');

    $ctrl = new jFormsControlMenulist('defaultRepository');
    $dataSource = new jFormsStaticDatasource();
    $mydata = array();
    foreach($lizmapConfig->repositoryList as $repo)
      $mydata[$repo] = $repo;
    $dataSource->data = $mydata;
    $ctrl->datasource = $dataSource;
    $ctrl->label = jLocale::get("admin~admin.form.admin_services.defaultRepository.label");
    $ctrl->required = true;
    $form->addControl($ctrl);

    if ($form) {
      // Display form
      $tpl = new jTpl();
      $tpl->assign('form', $form);
      $rep->body->assign('MAIN', $tpl->fetch('admin~config_services'));
      $rep->body->assign('selectedMenuItem','lizmap_configuration');
      return $rep;
    } else {
      // redirect to default page
      jMessage::add('error in editServices');
      $rep =  $this->getResponse('redirect');
      $rep->action ='admin~config:index';
      return $rep;
    }
  }


  /**
  * Save the data for the services section.
  * @return Redirect to the index.
  */
  function saveServices(){

    // If the section does exists in the ini file : get the data
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig('');
    $form = jForms::get('admin~config_services');

    // token
    $token = $this->param('__JFORMS_TOKEN__');
    if(!$token){
      // redirection vers la page d'erreur
      $rep= $this->getResponse("redirect");
      $rep->action="admin~config:index";
      return $rep;
    }

    // If the form is not defined, redirection
    if(!$form){
      $rep= $this->getResponse("redirect");
      $rep->action="admin~config:index";
      return $rep;
    }

    // Fill the default repository menu list with data from ini file
    $ctrl = new jFormsControlMenulist('defaultRepository');
    $dataSource = new jFormsStaticDatasource();
    $mydata = array();
    foreach($lizmapConfig->repositoryList as $repo)
      $mydata[$repo] = $repo;
    $dataSource->data = $mydata;
    $ctrl->datasource = $dataSource;
    $ctrl->label = jLocale::get("admin~admin.form.admin_services.defaultRepository.label");
    $ctrl->required = true;
    $form->addControl($ctrl);

    // Set form data from request data
    $form->initFromRequest();

    // Check the form
    $ok = true;
    if (!$form->check()) {
      $ok = false;
    }

    // Check that cacheExpiration  is between 0 and 2592000 seconds
    if($form->getData('cacheExpiration') <0 or $form->getData('cacheExpiration') > 2592000){
      $ok = false;
      $form->setErrorOn(
        'cacheExpiration',
        jLocale::get("admin~admin.form.admin_services.message.cacheExpiration.wrong")
      );
    }

    if(!$ok){
      // Errors : redirection to the display action
      $rep = $this->getResponse('redirect');
      $rep->action='admin~config:editServices';
      $rep->params['errors']= "1";
      return $rep;
    }

    // Save the data
    $data = array();
    foreach($lizmapConfig->servicesPropertyList as $prop)
      $data[$prop] = $form->getData($prop);
    $isRepository=false;
    $modifyServices = $lizmapConfig->modifyServices($data);
    if($modifyServices)
      jMessage::add(jLocale::get("admin~admin.form.admin_services.message.data.saved"));

    // Redirect to the validation page
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:validateServices";

    return $rep;
  }


  /**
  * Validate the data for the services section : destroy form and redirect.
  * @return Redirect to the index.
  */
  function validateServices(){

    // Destroy the form
    if($form = jForms::get('admin~config_services')){
      jForms::destroy('admin~config_services');
    }else{
      // undefined form : redirect
      $rep= $this->getResponse("redirect");
      $rep->action="admin~config:index";
      return $rep;
    }

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:index";

    return $rep;
  }



#  REPOSITORIES

  /**
  * Get label for a given subject corresponding to passed lablekey.
  * @param string $id Id of the subject
  * @param string $labelKey Label key of the subject
  * @return string Label if found, else key.
  */
  protected function getLabel($id, $labelKey) {
    if ($labelKey) {
      try{
        return jLocale::get($labelKey);
      }
      catch(Exception $e) { }
    }
    return $id;
  }

  /**
  * Add checkboxes controls to a repository form for each lizmap subject.
  * Used to manage rights for each subject and for each group of each repositories.
  * @param object $form Jform object concerned.
  * @param object $repository Repository key.
  * @param boolean $load If true, load data from jacl2 database and set form control data.
  * @return object Modified form.
  */
  protected function populateRepositoryRightsFormControl($form, $repository, $load='db') {
    // Daos to use
    $daosubject = jDao::get('jacl2db~jacl2subject','jacl2_profile');
    $daogroup = jDao::get('jacl2db~jacl2group','jacl2_profile');
    $daoright = jDao::get('jacl2db~jacl2rights','jacl2_profile');
    // Loop through the jacl2 subjects
    foreach($daosubject->findAllSubject() as $subject){
      // Filter only lizmap subjects
      if(preg_match('#^'.$this->lizmapClientPrefix.'#', $subject->id_aclsbj)){
        // Create a new form control
        $ctrl = new jFormsControlCheckboxes($subject->id_aclsbj);
        $ctrl->label = $this->getLabel($subject->id_aclsbj, 'admin~jacl2.'.$subject->id_aclsbj);
        $dataSource = new jFormsStaticDatasource();
        $mydata = array();
        // Initialize future values to set
        $dataValues = array();
        // Loop through each group
        foreach($daogroup->findAll() as $group){
          // Retrieve only normal groups wich are not blacklisted
          if(!in_array($group->id_aclgrp, $this->groupBlacklist) and $group->grouptype == 0){
            $mydata[$group->id_aclgrp] = $group->name;
            // Get rights with resources for the current group
            if($load == 'db'){
              $conditions = jDao::createConditions();
              $conditions->addCondition('id_aclsbj','=',$subject->id_aclsbj);
              $conditions->addCondition('id_aclgrp','=',$group->id_aclgrp);
              $conditions->addCondition('id_aclres','=',$repository);
              $res = $daoright->findBy($conditions);
              foreach($res as $rec)
                $dataValues[] = $rec->id_aclgrp;
            }
          }
        }
        $dataSource->data = $mydata;
        $ctrl->datasource = $dataSource;
        $form->addControl($ctrl);
        // Get data from form on error if needed
        if($load == 'request'){
          global $gJCoord;
          // Edit control ref to get request params
          $param = str_replace('.', '_', $subject->id_aclsbj);
          $dataValues = array_values($gJCoord->request->params[$param]);
        }
        // Set the preselected data if needed
        if($load){
          $form->setData($subject->id_aclsbj, $dataValues);
        }
      }
    }
    return $form;
  }

  /**
  * Save rights for a repository.
  * Used to save rights for each subject and for each group of one repository.
  * @param object $form Jform object concerned.
  * @param object $repository Repository key.
  * @return boolean Success or failure of the saving.
  */
  protected function saveRepositoryRightsFromRequest($form, $repository, $save=false) {
    // Daos to use
    $daoright = jDao::get('jacl2db~jacl2rights','jacl2_profile');
    $daogroup = jDao::get('jacl2db~jacl2group','jacl2_profile');
    // Set groups array if return needed
    if(!$save)
      $groups = array();
    // Data from coordinator
    global $gJCoord;
    // Loop through the form controls
    foreach($form->getControls() as $ctrl){
      // Filter controls corresponding to lizmap subjects
      if(preg_match('#^'.$this->lizmapClientPrefix.'#', $ctrl->ref) and $ctrl->isContainer()){
        $id_aclsbj = $ctrl->ref;
        // Edit control ref to get request params
        $param = str_replace('.', '_', $id_aclsbj);
        // Get values for the selected subject
        $values = array_values($gJCoord->request->params[$param]);
        // Loop through the groups
        foreach($daogroup->findAll() as $group){
          // Retrieve only normal groups wich are not blacklisted
          if(!in_array($group->id_aclgrp, $this->groupBlacklist) and $group->grouptype == 0){
            // Add the right if needed else remove it
            if(in_array($group->id_aclgrp, $values)){
              $groups[] = $group->id_aclgrp;
              if($save)
                jAcl2DbManager::addRight($group->id_aclgrp, $id_aclsbj, $repository);
            }
            else
              if($save)
                $daoright->delete($id_aclsbj, $group->id_aclgrp, $repository);
          }
        }
      }
    }
    if(!$save)
      return $groups;
  }


  /**
  * Creation of a new section.
  *
  * @return Redirect to the form display action.
  */
  public function createSection(){
    // Create the form
    jForms::destroy('admin~config_section');
    $form = jForms::create('admin~config_section');
    $form->setData('new', "1");
    $form->setReadOnly('repository', false);

    // Redirect to the form display action.
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:editSection";
    return $rep;
  }


  /**
  * Modification of a repository.
  * @return Redirect to the form display action.
  */
  public function modifySection(){

    // initialise data
    $repository = $this->param('repository');

    // Get the corresponding repository
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no repository with this key
    if($repository != $lizmapConfig->repositoryKey){
      $rep = $this->getResponse('redirect');
      $rep->action = 'admin~config:index';
      return $rep;
    }

    // Create and fill the form
    $form = jForms::create('admin~config_section');
    $form->setData('new', "0");
    $form->setData('repository', (string)$lizmapConfig->repositoryKey);
    $form->setReadOnly('repository', true);
    // Create and fill form controls relatives to repository data
    foreach($lizmapConfig->repositoryData as $k=>$v){
      // Create form control
      $ctrl = new jFormsControlInput($k);
      $ctrl->label = $k;
      $ctrl->required = true;
      $ctrl->size = 100;
      $datatype = new jDatatypeString();
      $ctrl->datatype=$datatype;
      $form->addControl($ctrl);
      // Set control data from repository data
      $form->setData($k, $v);
    }
    // Create and fill the form control relative to rights for each group for this repository
    $form = $this->populateRepositoryRightsFormControl($form, $lizmapConfig->repositoryKey, 'db');

    // redirect to the form display action
    $rep= $this->getResponse("redirect");
    $rep->params['repository']= $repository;
    $rep->action="admin~config:editSection";
    return $rep;
  }


  /**
  * Display the form to create/modify a Section.
  * @param string $repository (optional) Name of the repository.
  * @return Display the form.
  */
  public function editSection(){
    $rep = $this->getResponse('html');

    $repository = $this->param('repository');
    $new = (bool)$this->param('new');

    // Get repository data
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Get the form
    $form = jForms::get('admin~config_section');

    if ($form) {
      // reconstruct form fields based on repositoryPropertyList
      foreach($lizmapConfig->repositoryPropertyList as $k){
        $ctrl = new jFormsControlInput($k);
        $ctrl->label = $k;
        $ctrl->required = true;
        $ctrl->size = 100;
        $datatype = new jDatatypeString();
        $ctrl->datatype=$datatype;
        $form->addControl($ctrl);
        // if edition, set the form data with the data taken from the ini file
        if(($repository and $new))
          if(array_key_exists($k, $lizmapConfig->repositoryData))
            $form->setData($k, $lizmapConfig->repositoryData[$k]);
      }
      // Create and fill the form control relative to rights for each group for this repository
      if($this->intParam('errors'))
        $form = $this->populateRepositoryRightsFormControl($form, $lizmapConfig->repositoryKey, 'request');
      else
        $form = $this->populateRepositoryRightsFormControl($form, $lizmapConfig->repositoryKey, false);

      // Display form
      $tpl = new jTpl();
      $tpl->assign('form', $form);
      $rep->body->assign('MAIN', $tpl->fetch('config_section'));
      $rep->body->assign('selectedMenuItem','lizmap_configuration');
      return $rep;
    } else {
      // Redirect to default page
      jMessage::add('error in editSection');
      $rep =  $this->getResponse('redirect');
      $rep->action ='admin~config:index';
      return $rep;
    }
  }


  /**
  * Save the data for one section.
  * @return Redirect to the index.
  */
  function saveSection(){

    $repository = $this->param('repository');
    $new = (bool)$this->param('new');

    $ok = true;

    // Repository (first take the default one)
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Get the form
    $form = jForms::get('admin~config_section');

    // token
    $token = $this->param('__JFORMS_TOKEN__');
    if(!$token){
      $ok = false;
      jMessage::add('missing form token');
    }

    // If the form is not defined, redirection
    if(!$form)
      $ok = false;

    // Redirection in case of errors
    if(!$ok){
      $rep= $this->getResponse("redirect");
      $rep->action="admin~config:index";
      return $rep;
    }

    // Rebuild form fields
    foreach($lizmapConfig->repositoryPropertyList as $k){
      $ctrl = new jFormsControlInput($k);
      $ctrl->label = $k;
      $ctrl->required = true;
      $datatype = new jDatatypeString();
      $ctrl->datatype=$datatype;
      $form->addControl($ctrl);
    }
    $form = $this->populateRepositoryRightsFormControl($form, $lizmapConfig->repositoryKey, false);

    // Set form data from request data
    $form->initFromRequest();

    // Check the form
    $ok = true;
    if (!$form->check()) {
      $ok = false;
    }

    // Check paths
    if(in_array('path', $lizmapConfig->repositoryPropertyList))
      if(!file_exists($form->getData('path')) or !is_dir($form->getData('path')) ){
        $form->setErrorOn('path', jLocale::get("admin~admin.form.admin_section.message.path.wrong"));
        $ok = false;
      }

    if(!$ok){
      // Errors : redirection to the display action
      $rep = $this->getResponse('redirect');
      $rep->action='admin~config:editSection';
      $rep->params['repository']= $repository;
      $rep->params['errors']= "1";
      global $gJCoord;
      foreach($gJCoord->request->params as $k=>$v)
        if(preg_match('#^'.$this->lizmapClientPrefix.'#', $k))
          $rep->params[$k] = $v;

      if($new)
        $form->setReadOnly('repository', false);
      return $rep;
    }

    // Save the data
    if($new)
      $lizmapConfig = new lizmapConfig($repository, true);
    // Repository data
    $data = array();
    foreach($lizmapConfig->repositoryPropertyList as $prop)
      $data[$prop] = $form->getData($prop);
    $modifySection = $lizmapConfig->modifyRepository($data);
    jMessage::add(jLocale::get("admin~admin.form.admin_section.message.data.saved"));
    // group rights data
    $save = True;
    $this->saveRepositoryRightsFromRequest($form, $repository, $save);

    // Redirect to the validation page
    $rep= $this->getResponse("redirect");
    $rep->params['repository']= $repository;
    $rep->action="admin~config:validateSection";

    return $rep;
  }


  /**
  * Save the data for one section.
  * @return Redirect to the index.
  */
  function validateSection(){

    $repository = $this->param('repository');

    // Destroy the form
    if($form = jForms::get('admin~config_section')){
      jForms::destroy('admin~config_section');
    }else{
      // undefined form : redirect
      $rep= $this->getResponse("redirect");
      $rep->action="admin~config:index";
      return $rep;
    }

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:index";

    return $rep;
  }



  /**
  * Remove a section.
  * @return Redirect to the index.
  */
  function removeSection(){

    $repository = $this->param('repository');

    // Get config utility
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig(""); // !!! Here it is important to use an empty value !!!
    // Remove the section
    if($lizmapConfig->removeRepository($repository)){
      // Remove rights on this resource
      $daoright = jDao::get('jacl2db~jacl2rights','jacl2_profile');
      $conditions = jDao::createConditions();
      $conditions->addCondition('id_aclres','=',$repository);
      $nbdeleted = $daoright->deleteBy($conditions);
      jMessage::add(jLocale::get("admin~admin.form.admin_section.message.data.removed")." ".jLocale::get("admin~admin.form.admin_section.message.data.removed.groups.concerned", array($nbdeleted)));
    }

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:index";

    return $rep;
  }



  /**
  * Empty a map service cache
  * @param string $repository Repository for which to remove all tile cache
  * @return Redirection to the index
  */
  function removeCache(){

    $repository = $this->param('repository');

    // Get config utility
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Remove the cache for the repository
    if(jFile::removeDir(sys_get_temp_dir().'/'.$lizmapConfig->repositoryKey));
      jMessage::add(jLocale::get("admin~admin.cache.repository.removed", array($lizmapConfig->repositoryKey)));

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:index";

    return $rep;
  }
}
