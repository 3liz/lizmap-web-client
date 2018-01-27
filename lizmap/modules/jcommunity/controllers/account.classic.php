<?php
/**
* @package      jcommunity
* @subpackage   
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2008 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

include(dirname(__FILE__).'/../classes/defines.php');

class accountCtrl extends jController {

    public $pluginParams = array(
      '*'=>array('auth.required'=>true),
      'show'=>array('auth.required'=>false)
    );

    protected function getDaoName() {
        $plugin = jApp::coord()->getPlugin('auth');
        if($plugin === null)
            throw new jException('jelix~auth.error.plugin.missing');
        return $plugin->config['Db']['dao'];
    }

    protected function getProfileName() {
        $plugin = jApp::coord()->getPlugin('auth');
        if($plugin === null)
            throw new jException('jelix~auth.error.plugin.missing');
        return $plugin->config['Db']['profile'];
    }

    /**
    * show informations about a user
    */
    function show() {
        $rep = $this->getResponse('html');
        $tpl = new jTpl();
        $tpl->assign('username',$this->param('user'));

        $users = jDao::get($this->getDaoName(), $this->getProfileName());

        $user = $users->getByLogin($this->param('user'));
        if(!$user || $user->status < JCOMMUNITY_STATUS_VALID) {
            $rep->body->assign('MAIN',$tpl->fetch('account_unknow'));
            return $rep;
        }

        $rep->title = jLocale::get('account.profile.of',array($user->login));
        $tpl->assign('user',$user);
        $tpl->assign('himself', (jAuth::isConnected() && jAuth::getUserSession()->login == $user->login));
        $tpl->assign('additionnalContent','');
        $tpl->assign('otherInfos',array()); // 'label'=>'value'
        $tpl->assign('otherPrivateActions',array()); // 'link'=>'label'
        jEvent::notify('jcommunity_account_show', array('login'=>$user->login, 'user'=>$user,'tpl'=>$tpl));
        $rep->body->assign('MAIN',$tpl->fetch('account_show'));
        return $rep;
    }

    function prepareEdit() {
        $user = $this->param('user');
        $rep = $this->getResponse('redirect');
        $rep->action = 'jcommunity~account:show';
        $rep->params=array('user'=>$user);

        if(!jAuth::isConnected() || jAuth::getUserSession()->login != $user) {
            return $rep;
        }

        $form = jForms::create('account', $this->param('user'));

        jEvent::notify('jcommunity_init_edit_form_account', array('login'=>$user,'form'=>$form));

        try {
            $form->initFromDao('user',null, $this->getProfileName());
        }catch(Exception $e){
            return $rep;
        }

        jEvent::notify('jcommunity_prepare_edit_account', array('login'=>$user,'form'=>$form));

        $rep->action = 'jcommunity~account:edit';
        return $rep;
    }

    function edit() {
        $user = $this->param('user');
        if($user == '' || !jAuth::isConnected() || jAuth::getUserSession()->login != $user) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'jcommunity~account:show';
            $rep->params=array('user'=>$user);
            return $rep;
        }

        $form = jForms::get('account', $user);
        if(!$form) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'jcommunity~account:show';
            $rep->params=array('user'=>$user);
            return $rep;
        }

        jEvent::notify('jcommunity_init_edit_form_account', array('login'=>$user,'form'=>$form));

        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('username', $user);
        $tpl->assign('form', $form);

        jEvent::notify('jcommunity_edit_account', array('login'=>$user,'rep'=>$rep, 'form'=>$form, 'tpl'=>$tpl));

        $rep->body->assign('MAIN', $tpl->fetch('account_edit'));

        return $rep;
    }

    function save() {
        $user = $this->param('user');
        $config = new \Jelix\JCommunity\Config();

        $rep = $this->getResponse('redirect');
        $rep->action = 'jcommunity~account:show';
        $rep->params=array('user'=>$user);

        if($user == '' || !jAuth::isConnected() || jAuth::getUserSession()->login != $user) {
            return $rep;
        }
        $form = jForms::get('account', $user);
        if(!$form) {
            return $rep;
        }
        jEvent::notify('jcommunity_init_edit_form_account', array('login'=>$user,'form'=>$form));

        $form->initFromRequest();
        $form->check();
        $accountFact = jDao::get($this->getDaoName(), $this->getProfileName());

        if ($config->verifyNickname() &&
            $form->getControl('nickname') !== null &&
            $accountFact->verifyNickname($user, $form->getData('nickname'))
        ) {
            $form->setErrorOn('nickname', jLocale::get('account.error.dup.nickname'));
        }

        jEvent::notify('jcommunity_check_before_save_account', array('login'=>$user,'form'=>$form));
        if(count($form->getErrors())){
            $rep->action = 'jcommunity~account:edit';
        } else {
            extract($form->prepareDaoFromControls($this->getDaoName(), null, $this->getProfileName()),EXTR_PREFIX_ALL, "form");
            jEvent::notify('jcommunity_save_account', array('login'=>$user,'form'=>$form,'factory'=>$form_dao,'record'=>$form_daorec, 'to_insert'=>$form_toInsert));
            if($form_toInsert)
                $form_dao->insert($form_daorec);
            else
                $form_dao->update($form_daorec);
            jForms::destroy('account', $user);
        }

        return $rep;
    }


    function destroy() {
        $user = $this->param('user');
        if($user == '' || !jAuth::isConnected() || jAuth::getUserSession()->login != $user) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'jcommunity~account:show';
            $rep->params=array('user'=>$user);
            return $rep;
        }
        $rep = $this->getResponse('html');
        $tpl = new jTpl();
        $tpl->assign('username',$user);
        $rep->body->assign('MAIN', $tpl->fetch('account_destroy'));
        return $rep;
    }


    function dodestroy() {
        $user = $this->param('user');
        $rep = $this->getResponse('redirect');
        $rep->action = 'jcommunity~account:show';
        $rep->params = array('user'=>$user);

        if($user == '' || !jAuth::isConnected() || jAuth::getUserSession()->login != $user) {
            return $rep;
        }

        $rep = $this->getResponse('html');
        $tpl = new jTpl();
        $tpl->assign('username',$user);

        if(jAuth::removeUser($user)) {
            jAuth::logout();
            $rep->body->assign('MAIN', $tpl->fetch('account_destroy_done'));
        } else {
            $rep->body->assign('MAIN', $tpl->fetch('account_destroy_cancel'));
        }

        return $rep;
    }

}
