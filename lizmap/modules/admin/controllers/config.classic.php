<?php
/**
* Lizmap administration
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class configCtrl extends jController {

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
    
    $tpl = new jTpl();
    $tpl->assign('lizmapConfig', $lizmapConfig);
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
    $lizmapConfig = new lizmapConfig($repository);
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
    $lizmapConfig = new lizmapConfig($repository);   
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
 
    if(!$ok){
      // Errors : redirection to the display action
      $rep = $this->getResponse('redirect');
      $rep->action='admin~config:editServices';
      $rep->params['repository']= $repository;
      return $rep;
    }
 
    // Save the data
    $data = array();
    foreach($lizmapConfig->servicesPropertyList as $prop)
      $data[$prop] = $form->getData($prop);
    $isRepository=false;
    $modifySection = $lizmapConfig->modifyServices($data);
    if($modifySection)
      jMessage::add(jLocale::get("admin~admin.form.admin_services.message.data.saved"));
 
    // Redirect to the validation page
    $rep= $this->getResponse("redirect");
    $rep->params['repository']= $repository;
    $rep->action="admin~config:validateServices";
 
    return $rep;
  }
  
  
  /**
  * Validate the data for the services section : destroy form and redirect.
  * @return Redirect to the index.
  */
  function validateServices(){
 
    // Get the form
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);   
    
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
    
    foreach($lizmapConfig->repositoryData as $k=>$v){
      $ctrl = new jFormsControlInput($k);
      $ctrl->label = $k;
      $ctrl->required = true;
      $ctrl->size = 100;
      $datatype = new jDatatypeString();
      $ctrl->datatype=$datatype;
      $form->addControl($ctrl);
      $form->setData($k, $v);
    }
 
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
          if(array_key_exists($k, $lizmapConfig->repositoryData)){
            $form->setData($k, $lizmapConfig->repositoryData[$k]);
          }
      }
            
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
    
    // Repository
    jClasses::inc('lizmap~lizmapConfig');
    if($new)
      $lizmapConfig = new lizmapConfig($repository);
    else
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
#      $rep->params['new']= $this->param('new');
      if($new)
        $form->setReadOnly('repository', false);
      return $rep;
    }
 
    // Save the data
    if($new)
      $lizmapConfig = new lizmapConfig($repository, true);
    $data = array();
    foreach($lizmapConfig->repositoryPropertyList as $prop)
      $data[$prop] = $form->getData($prop);
    $modifySection = $lizmapConfig->modifyRepository($data);
    if($modifySection)
      jMessage::add(jLocale::get("admin~admin.form.admin_section.message.data.saved"));

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
    $lizmapConfig = new lizmapConfig("");
    // Remove the section
    if($lizmapConfig->removeRepository($repository))
      jMessage::add(jLocale::get("admin~admin.form.admin_section.message.data.removed"));
 
    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="admin~config:index";
 
    return $rep;
  }

}
