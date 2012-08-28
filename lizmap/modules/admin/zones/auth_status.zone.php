<?php
/**
* @package   lizmap
* @subpackage admin
* @author    3liz
* @copyright 2012 3liz
* @link      http://www.3liz.com
* @licence  Mozilla Public Licence - MPL
*/

class auth_statusZone extends jZone {
  protected $_tplname='zone_auth_status';

  protected function _prepareTpl(){
    $content = '';
    $user = jAuth::getUserSession();
    $this->_tpl->assign('user', $user);
  }
}
