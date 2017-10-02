<?php
/**
* Log lizmap actions.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapLogListener extends jEventListener{

  /**
  * When a user logs in
  * @param string $login The login
  * @param object $user jAuth user
  *
  */
  function onAuthCanLogin($event){

    $key = 'login';
    $data = array(
      'key'=>$key,
      'user' => $event->getParam('login'),
      'repository'=> Null,
      'project'=> Null
    );

    $this->addLog($key, $data);

  }

  /**
  * Event emitted by lizmap controllers
  * @param string $key Key of the log item
  * @param string $content Content to log (optional)
  * @param string $repository Lizmap repository key (optional)
  * @param string $project Lizmap project key (optional)
  *
  */
  function onLizLogItem($event){

    $key = $event->getParam('key');

    // Build data array from event params
    $logItem = lizmap::getLogItem($key);
    $data = array();
    if ( $logItem ) {
      foreach($logItem->getRecordKeys() as $rk){
        if($event->getParam($rk))
          $data[$rk] = $event->getParam($rk);
      }

      // Add log to the database
      $this->addLog($key, $data);

    }

  }

  /**
  * Add log when needed
  * @param string $key Key of the log item to handle.
  * @param array $data Array of data to log for this item.
  *
  */
  function addLog($key, $data){

    // Get log item properties
    $logItem = lizmap::getLogItem($key);

    // Optionnaly log detail
    if( $logItem->getData('logDetail') ){

      // user who modified the line
      if(!array_key_exists('user', $data)){
        $juser = jAuth::getUserSession();
        $data['user'] = $juser->login;
      }

      // Add IP if needed
      if( $logItem->getData('logIp') ){
        $data['ip'] = $_SERVER['REMOTE_ADDR'];
      }

      // Insert log
      $logItem->insertLogDetail($data);

      // Send an email
      if(
        $logItem->getData('logEmail')
        and in_array( $key, array('editionSaveFeature', 'editionDeleteFeature') )
      ){
        $this->sendEmail($key, $data);
      }

    }

    // Optionnaly log count
    if( $logItem->getData('logCounter') ){
      $logItem->increaseLogCounter($data['repository'], $data['project']);
    }

  }


  /**
  * Send an email to the administrator
  *
  * @param string $subject Email subject
  * @param string $body Email body
  */
  private function sendEmail($key, $data){

    $services = lizmap::getServices();
    if( $email = filter_var($services->adminContactEmail, FILTER_VALIDATE_EMAIL) ){

      // Build subject and body
      $subject = "[". $services->appName . "] " . jLocale::get("admin~admin.logs.email.subject");

      $body = jLocale::get("admin~admin.logs.email.$key.body");

      foreach($data as $k=>$v){
        if(empty($v)){
          continue;
        }

        if( $k == 'key'){
          continue;
        }
        else if( $k == 'content'){
          if( $key == 'editionSaveFeature' or $key == 'editionDeleteFeature'){
            $content = array_map('trim', explode(',', $v));
            foreach($content as $item){
              $itemdata = array_map('trim', explode('=', $item));
              if( count($itemdata) == 2){
                $body.= "\r\n" . "  * " . $itemdata[0] . " = " . $itemdata[1];
              }
            }
          }
        }else{
          $body.= "\r\n" . "  * $k = $v";
        }
      }

      // Send email
      $mail = new jMailer();
      $mail->Subject = $subject;
      $mail->Body = $body;
      $mail->AddAddress( $email, 'Lizmap Notifications');
      try{
        $mail->Send();
      }
      catch(Exception $e){
        jLog::log('error while sending email to admin: '. $e->getMessage() );
      }
    }
  }


}
