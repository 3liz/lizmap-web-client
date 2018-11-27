<?php
/**
* Manage user public views : account creation demand, etc.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class userCtrl extends jController {

  /**
  * Create the form to resquest an account.
  *
  * @return Redirect to the form display action.
  */
  function createAccount() {

    $rep = $this->getResponse('redirect');
    $rep->action = 'view~default:index';

    // Get lizmap services
    $services = lizmap::getServices();
    // Redirect if not active
    if( !$services->allowUserAccountRequests ){
      return $rep;
    }
    // Redirect if already a logged user
    if( jAuth::isConnected() ){
      jMessage::add(jLocale::get("view~user.already.logged"));
      return $rep;
    }

    // Create the form
    $form = jForms::create('view~lizmap_user');

    // redirect to the form display action
    $rep= $this->getResponse("redirect");
    $rep->action="view~user:editAccount";
    return $rep;
  }


  /**
  * Display the form to resquest an account.
  *
  * @return Redirect to the form display action.
  */
  function editAccount() {

    // Get lizmap services
    $services = lizmap::getServices();

    $rep = $this->getResponse('redirect');
    $rep->action = 'view~default:index';
    // Redirect if not active
    if( !$services->allowUserAccountRequests ){
      return $rep;
    }
    // Redirect if already a logged user
    if( jAuth::isConnected() ){
      jMessage::add(jLocale::get("view~user.already.logged"));
      return $rep;
    }

    if ($this->param('theme')) {
      jApp::config()->theme = $this->param('theme');
    }

    // Prepare html response
    $rep = $this->getResponse('html');

    // Get lizmap services
    $services = lizmap::getServices();
    $title = jLocale::get("view~user.title").' - '.$services->appName;

    $rep->title = $title;
    $rep->body->assign('repositoryLabel', $title);

    // Get the form
    $form = jForms::get('view~lizmap_user');

    if ($form) {
      // Display form
      $tpl = new jTpl();
      $tpl->assign('form', $form);
      $rep->body->assign('MAIN', $tpl->fetch('view~lizmap_user_form'));
    } else {
      // redirect to default page
      $rep =  $this->getResponse('redirect');
      $rep->action ='view~user:createAccount';
      return $rep;
    }
    $rep->body->assign('isConnected', jAuth::isConnected());
    $rep->body->assign('user', jAuth::getUserSession());


    return $rep;

  }


  /**
  * Save the data for the services section.
  * @return Redirect to the index.
  */
  function saveAccount(){

    // Get lizmap services
    $services = lizmap::getServices();

    $rep = $this->getResponse('redirect');
    $rep->action = 'view~default:index';

    // Redirect if option not active
    if( !$services->allowUserAccountRequests ){
      return $rep;
    }
    // Redirect if already a logged user
    if( jAuth::isConnected() ){
      jMessage::add(jLocale::get("view~user.already.logged"));
      return $rep;
    }

    // Get the form
    $form = jForms::get('view~lizmap_user');

    // token
    $token = $this->param('__JFORMS_TOKEN__');
    if(!$token){
      $rep->action="view~user:createAccount";
      return $rep;
    }

    // If the form is not defined, redirection
    if(!$form){
      $rep->action="view~user:createAccount";
      return $rep;
    }

    // Set the other form data from the request data
    $form->initFromRequest();

    // Check the form
    $ok = true;
    if (!$form->check()) {
      $ok = false;
    }

    // Check the honey pot. Redirect if filled (means robot)
    $honey = $form->getData('name');
    if($honey and !empty($honey)){
      $rep->action="view~user:createAccount";
      return $rep;
    }

    if(!$ok){
      // Errors : redirection to the display action
      $rep->action='view~user:editAccount';
      return $rep;
    }

    // Save the data
    $evresp = array();
    if(!jEvent::notify('jauthdbAdminCheckCreateForm', array('form'=>$form))->inResponse('check', false, $evresp)){
      // Sanitize some fields
      $sanitize = array('login', 'firstname', 'lastname', 'organization', 'phonenumber', 'street', 'postcode', 'city', 'country', 'comment');
      foreach( $sanitize as $field ){
        $form->setData(
          $field,
          filter_var($form->getData($field), FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)
        );
      }
      // Add user to database via jAuth methods
      try{
        $props = jDao::createRecord('jauthdb~jelixuser', 'jauth')->getProperties();
        $user = jAuth::createUserObject($form->getData('login'),$form->getData('password'));
        $form->setData('password', $user->password);
        $form->prepareObjectFromControls($user, $props);
        jAuth::saveNewUser($user);
        jMessage::add(jLocale::get("view~user.form.message.saved"));
        $ok = true;
        $rep->action="view~user:validateAccount";
      }
      catch(exception $e){
        $ok = false;
        jMessage::add(jLocale::get("view~user.form.message.not.saved"));
        $rep->action="view~user:editAccount";
      }

      // Send email to the administrator
      if($ok){
        try{
          $this->sendEmailToAdmin($user);
        }
        catch(Exception $e){
          jLog::log('error while sending email to admin: '. $e->getMessage() );
        }
      }

    }
    return $rep;
  }

  /**
  * Send an email to the administrator
  *
  * @param objet $user jAuth user for the created user
  */
  private function sendEmailToAdmin($user){

    $services = lizmap::getServices();

    if( $email = filter_var($services->adminContactEmail, FILTER_VALIDATE_EMAIL) ){
      $mail = new jMailer();
      $mail->Subject = jLocale::get("view~user.email.admin.subject");
      $mail->Body = jLocale::get("view~user.email.admin.body", array($user->login, $user->email));
      $mail->AddAddress( $email, 'Lizmap Notifications');
      $mail->Send();
    }
  }


  /**
  * Confirm form submission and destroy form.
  * @return Redirect to the index.
  */
  function validateAccount(){

    // Destroy the form
    if($form = jForms::get('view~lizmap_user')){
      jForms::destroy('view~lizmap_user');
    }

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="view~default:index";

    return $rep;
  }

}
