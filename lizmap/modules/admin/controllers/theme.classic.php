<?php
/**
* Lizmap administration : theme
* @package   lizmap
* @subpackage admin
* @author    3liz
* @copyright 2016 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class themeCtrl extends jController {

  // Configure access via jacl2 rights management
  public $pluginParams = array(
    '*' => array( 'jacl2.right'=>'lizmap.admin.access')
  );


  /**
  * Display a summary of the theme
  *
  *
  */
  function index() {
    $rep = $this->getResponse('html');

    // Get the data
    $theme = lizmap::getTheme();

    // Create the form
    $form = jForms::create('admin~theme');

    // Set form data values
    foreach($theme->getProperties() as $ser){
      $val = $theme->$ser;
      if( $ser == 'additionalCss' ){
        $val =  html_entity_decode( $val );
      }
      $form->setData($ser, $val);
    }

    $tpl = new jTpl();
    $tpl->assign('theme', lizmap::getTheme());
    $tpl->assign('themeForm', $form);
    $hasHeaderImage = array(
      'headerLogo' => is_file(jApp::varPath('lizmap-theme-config/') . $theme->headerLogo),
      'headerBackgroundImage' => is_file(jApp::varPath('lizmap-theme-config/') . $theme->headerBackgroundImage)
    );
    $tpl->assign('hasHeaderImage', $hasHeaderImage );
    $rep->body->assign('MAIN', $tpl->fetch('theme'));
    $rep->body->assign('selectedMenuItem','lizmap_theme');

    return $rep;
  }

  /**
   * Modify the theme
   *
   *
   */
  function modify(){

    $rep = $this->getResponse('redirect');

    // Get the data
    $theme = lizmap::getTheme();

    // Create the form
    $form = jForms::create('theme');

    // Set form data values
    foreach($theme->getProperties() as $ser){
      $val = $theme->$ser;
      if( $ser == 'additionalCss' ){
        $val =  html_entity_decode( $val );
      }
      $form->setData($ser, $val);
    }

    $rep->action="theme:edit";
    return $rep;

  }

  /**
  * Display the form to modify the theme.
  * @return Display the form.
  */
  public function edit(){
    $rep = $this->getResponse('html');

    // Get the form
    $form = jForms::get('theme');

    if ($form) {
      // Display form
      $tpl = new jTpl();
      $tpl->assign('form', $form);
      $rep->body->assign('MAIN', $tpl->fetch('config_theme'));
      $rep->body->assign('selectedMenuItem','lizmap_theme');
      return $rep;
    } else {
      // redirect to default page
      jMessage::add('error in theme edition');
      $rep =  $this->getResponse('redirect');
      $rep->action ='theme:index';
      return $rep;
    }
  }

  /**
  * Save the data for the theme section.
  * @return Redirect to the index.
  */
  function save(){

    // If the section does exists in the ini file : get the data
    $theme = lizmap::getTheme();
    $form = jForms::get('theme');

    // token
    $token = $this->param('__JFORMS_TOKEN__');
    if(!$token){
      // redirection vers la page d'erreur
      $rep= $this->getResponse("redirect");
      $rep->action="theme:index";
      return $rep;
    }

    // If the form is not defined, redirection
    if(!$form){
      $rep= $this->getResponse("redirect");
      $rep->action="theme:index";
      return $rep;
    }

    // Set the other form data from the request data
    $form->initFromRequest();

    // Check the form
    $ok = true;
    if (!$form->check()) {
      $ok = false;
    }

    if(!$ok){
      // Errors : redirection to the display action
      $rep = $this->getResponse('redirect');
      $rep->action='theme:edit';
      $rep->params['errors']= "1";
      return $rep;
    }

    // Save the data
    $data = array();
    foreach($theme->getProperties() as $prop){
      $data[$prop] = $form->getData($prop);
      if( $prop == 'headerLogo' or $prop == 'headerBackgroundImage'){
        $hl = $form->getData($prop);
        if(!empty($hl) ){
          // Remove previous theme image file
          if( file_exists(jApp::varPath('lizmap-theme-config/') . $theme->$prop)
            and is_file(jApp::varPath('lizmap-theme-config/') . $theme->$prop)
          ){
            unlink(jApp::varPath('lizmap-theme-config/') . $theme->$prop );
          }
          // Save new file in theme folder
          $form->saveFile($prop, jApp::varPath('lizmap-theme-config'));
        }
        else{
          // keep previous theme image path if not changed
          $data[$prop] = $theme->$prop;
        }
      }
      if( $prop == 'additionalCss'){
        $data[$prop] = htmlentities( $data[$prop] );
      }
    }

    // Modify class properties
    $modifytheme = $theme->update($data);
    if($modifytheme)
      jMessage::add(jLocale::get("admin~admin.form.admin_theme.message.data.saved"));

    // Redirect to the validation page
    $rep= $this->getResponse("redirect");
    $rep->action="theme:validate";

    return $rep;
  }


  /**
  * Validate the data for the theme section : destroy form and redirect.
  * @return Redirect to the index.
  */
  function validate(){

    // Destroy the form
    if($form = jForms::get('theme')){
      jForms::destroy('theme');
    }

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="theme:index";
    return $rep;
  }

  function removeThemeImage(){
    $theme = lizmap::getTheme();
    $prop = $this->param('key', 'headerLogo');
    if( $prop != 'headerLogo' and $prop != 'headerBackgroundImage')
      $prop = 'headerLogo';

    // empty property
    $data[$prop] = '';

    // also empty logo width
    if( $prop == 'headerLogo')
      $data['headerLogoWidth'] = '';

    // remove file
    if( file_exists(jApp::varPath('lizmap-theme-config/') . $theme->$prop) ){
      unlink(jApp::varPath('lizmap-theme-config/') . $theme->$prop );
    }

    // update theme
    $modifytheme = $theme->update($data);

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="theme:index";
    return $rep;

  }


}
