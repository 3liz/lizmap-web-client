<?php
/**
* @package   admin
* @subpackage jauthdb_admin
* @author    Laurent Jouanneau
* @copyright 2009-2019 Laurent Jouanneau
* @link      http://jelix.org
* @license   http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU Public Licence
*/

/**
 * controller to manage all users
 */
class defaultCtrl extends jController {

    public $sensitiveParameters = array('password', 'password_confirm', 'pwd', 'pwd_confirm');

    public $pluginParams=array(
        'index'        =>array('jacl2.right'=>'auth.users.list'),
        'view'         =>array('jacl2.right'=>'auth.users.view'),
        'precreate'    =>array('jacl2.rights.and'=>array('auth.users.view','auth.users.create')),
        'create'       =>array('jacl2.rights.and'=>array('auth.users.view','auth.users.create')),
        'savecreate'   =>array('jacl2.rights.and'=>array('auth.users.view','auth.users.create')),
        'preupdate'    =>array('jacl2.rights.and'=>array('auth.users.view','auth.users.modify')),
        'editupdate'   =>array('jacl2.rights.and'=>array('auth.users.view','auth.users.modify')),
        'saveupdate'   =>array('jacl2.rights.and'=>array('auth.users.view','auth.users.modify')),
        'deleteconfirm'=>array('jacl2.rights.and'=>array('auth.users.view','auth.users.delete')),
        'delete'       =>array('jacl2.rights.and'=>array('auth.users.view','auth.users.delete')),
    );
    /**
     * selector of the dao to use for the crud.
     * @var string
     */
    protected $dao = '';

    /**
     * selector of the form to use to edit and display a record
     * @var string
     */
    protected $form ='';

    /**
     * the jDb profile to use with the dao
     */
    protected $dbProfile = '';

    protected $listPageSize = 20;

    protected $authConfig = null;

    protected $uploadsDirectory='';

    function __construct ($request){
        parent::__construct($request);
        $plugin = jApp::coord()->getPlugin('auth');
        $driver = $plugin->config['driver'];
        $hasDao = isset($plugin->config[$driver]['dao']) &&  isset($plugin->config[$driver]['compatiblewithdb']) && $plugin->config[$driver]['compatiblewithdb'];
        if (($driver == 'Db') || $hasDao) {
            $this->authConfig = $plugin->config[$driver];
            $this->dao = $this->authConfig['dao'];
            if(isset($this->authConfig['form']))
                $this->form = $this->authConfig['form'];
            $this->dbProfile = $this->authConfig['profile'];
            if(isset($this->authConfig['uploadsDirectory']))
                $this->uploadsDirectory =  $this->authConfig['uploadsDirectory'];
        }
    }

    /**
     * list all users
     */
    function index(){
        $offset = $this->intParam('offset',0,true);

        $rep = $this->getResponse('html');

        if ($this->form == '') {
            $rep->body->assign('MAIN', 'no form defined in the auth plugin');
            $rep->setHttpStatus(500, 'Internal Server Error');
            return $rep;
        }

        $tpl = new jTpl();

        $dao = jDao::get($this->dao, $this->dbProfile);

        $cond = jDao::createConditions();
        $cond->addItemOrder('login', 'asc');
        $tpl->assign('list', $dao->findBy($cond,$offset,$this->listPageSize));

        //$pk = $dao->getPrimaryKeyNames();
        // deprecated. for compatibility with old template from theme, let's indicate the 'login' property
        //$tpl->assign('primarykey', $pk[0]);
        $tpl->assign('primarykey', 'login');

        $tpl->assign('controls', jForms::create($this->form, '___$$$___')->getControls());
        $tpl->assign('listPageSize', $this->listPageSize);
        $tpl->assign('page',$offset);
        $tpl->assign('recordCount',$dao->countAll());
        $tpl->assign('cancreate', jAcl2::check('auth.users.create'));
        $tpl->assign('canview', jAcl2::check('auth.users.view'));
        $rep->body->assign('MAIN', $tpl->fetch('crud_list'));
        $rep->body->assign('selectedMenuItem', 'users');
        jForms::destroy($this->form,  '___$$$___');
        return $rep;
    }

    /**
     * displays a user
     */
    function view(){
        $login = $this->param('j_user_login');
        if( $login === null ){
            $rep = $this->getResponse('redirect');
            jMessage::add(jLocale::get('crud.message.bad.id', 'null'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }
        $dao = jDao::create($this->dao, $this->dbProfile);
        $daorec = $dao->getByLogin($login);
        if(!$daorec) {
            $rep = $this->getResponse('redirect');
            jMessage::add(jLocale::get('crud.message.bad.id', $login), 'error');
            $rep->action = 'default:index';
            return $rep;
        }

        $rep = $this->getResponse('html');

        // we're using a form to display a record, to have the opportunity to have
        // labels with each values.
        $form = jForms::create($this->form, $login);
        $form->initFromDao($daorec, null, $this->dbProfile);

        $tpl = new jTpl();
        $tpl->assign('id', $login);
        $tpl->assign('form',$form);
        $tpl->assign('canDelete', (jAuth::getUserSession()->login != $login) &&
            jAcl2::check('auth.users.delete'));
        $tpl->assign('canUpdate', jAcl2::check('auth.users.modify'));
        $tpl->assign('canChangePass', jAcl2::check('auth.users.change.password') &&
            jAuth::canChangePassword($login));
        $tpl->assign('otherLinks', array());
        $tpl->assign('otherInfo', jEvent::notify('jauthdbAdminGetViewInfo',
            array('form'=>$form, 'tpl'=>$tpl, 'himself'=>false))->getResponse());
        $form->deactivate('password');
        $form->deactivate('password_confirm');
        $rep->body->assign('MAIN', $tpl->fetch('crud_view'));
        return $rep;
    }

    /**
     * prepare a form to create a record.
     */
    function precreate() {
        $form = jForms::create($this->form);
        $form->deactivate('password', false);
        $form->deactivate('password_confirm', false);
        jEvent::notify('jauthdbAdminPrepareCreate', array('form'=>$form));

        $rep = $this->getResponse('redirect');
        $rep->action = 'default:create';
        return $rep;
    }

    /**
     * display a form to create a record
     */
    function create(){
        $form = jForms::get($this->form);
        if($form == null){
            $form = jForms::create($this->form);
        }
        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', null);
        $tpl->assign('form',$form);
        $tpl->assign('randomPwd', jAuth::getRandomPassword());
        $tpl->assign('otherInfo', jEvent::notify(
            'jauthdbAdminEditCreate',
            array('form' => $form, 'tpl' => $tpl))->getResponse());

        $rep->body->assign('MAIN', $tpl->fetch('crud_edit'));
        return $rep;
    }

    /**
     * save data of a form in a new record
     */
    function savecreate(){
        $form =  jForms::get($this->form);
        $rep = $this->getResponse('redirect');
        if($form == null){
            jMessage::add(jLocale::get('crud.message.bad.form'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }
        jEvent::notify('jauthdbAdminBeforeCheckCreateForm', array('form'=>$form));

        $form->initFromRequest();

        $login = $form->getData('login');
        if (jAuth::getUser($login)) {
            $form->setErrorOn('login', jLocale::get('crud.message.create.existing.user', $login));
            $rep->action = 'default:create';
            return $rep;
        }

        $evresp = array();
        if ($form->check()  &&
            !jEvent::notify('jauthdbAdminCheckCreateForm', array('form'=>$form))
                ->inResponse('check', false, $evresp)
        ){
            $props = jDao::createRecord($this->dao, $this->dbProfile)->getProperties();

            $user = jAuth::createUserObject($form->getData('login'),$form->getData('password'));

            $form->setData('password', $user->password);
            $form->prepareObjectFromControls($user, $props);
            $form->saveAllFiles($this->uploadsDirectory);

            jAuth::saveNewUser($user);
            jEvent::notify('jauthdbAdminAfterCreate', array('form' => $form, 'user'=>$user));

            jForms::destroy($this->form);
            jMessage::add(jLocale::get('crud.message.create.ok', $user->login), 'notice');
            $rep->action = 'default:view';
            $rep->params['j_user_login'] = $user->login;
            return $rep;
        } else {
            $rep->action = 'default:create';
            return $rep;
        }
    }


    /**
     * prepare a form in order to edit an existing record, and redirect to the editupdate action
     */
    function preupdate(){
        $login = $this->param('j_user_login');
        $rep = $this->getResponse('redirect');

        if( $login === null ){
            jMessage::add(jLocale::get('crud.message.bad.id','null'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }

        $dao = jDao::create($this->dao, $this->dbProfile);
        $daoUser = $dao->getByLogin($login);
        if (!$daoUser) {
            $rep = $this->getResponse('redirect');
            jMessage::add(jLocale::get('crud.message.bad.id', $login), 'error');
            $rep->action = 'default:index';

            return $rep;
        }

        $rep->params['j_user_login'] = $login;

        $form = jForms::create($this->form, $login);

        try {
            $rec = $form->initFromDao($daoUser, null, $this->dbProfile);
            foreach($rec->getPrimaryKeyNames() as $pkn) {
                $c = $form->getControl($pkn);
                if($c !==null) {
                    $c->setReadOnly(true);
                }
            }
        }catch(Exception $e){
            $rep->action = 'default:view';
            return $rep;
        }

        jEvent::notify('jauthdbAdminPrepareUpdate', array('form'=>$form, 'himself'=>false));
        $form->setReadOnly('login');
        $form->deactivate('password');
        $form->deactivate('password_confirm');
        $rep->action = 'default:editupdate';
        return $rep;
    }


    /**
     * displays a forms to edit an existing record. The form should be
     * prepared with the preupdate before, so a refresh of the page
     * won't cause a reset of the form
     */
    function editupdate(){
        $login = $this->param('j_user_login');
        $form = jForms::get($this->form, $login);
        if ($form === null || $login === null) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'default:index';
            jMessage::add(jLocale::get('crud.message.bad.id', $login), 'error');
            return $rep;
        }
        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', $login);
        $tpl->assign('form',$form);
        $tpl->assign('otherInfo', jEvent::notify(
            'jauthdbAdminEditUpdate',
            array('form' => $form, 'tpl' => $tpl, 'himself' => false))->getResponse());
        $form->deactivate('password'); //for security
        $form->deactivate('password_confirm');
        $form->setReadOnly('login');
        $rep->body->assign('MAIN', $tpl->fetch('crud_edit'));
        return $rep;
    }


    /**
     * save data of a form in a new record
     */
    function saveupdate(){
        $rep = $this->getResponse('redirect');
        $login = $this->param('j_user_login');

        if ($login === null) {
            jMessage::add(jLocale::get('crud.message.bad.id', 'null'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }

        $dao = jDao::create($this->dao, $this->dbProfile);
        /** @var jDaoRecordBase $daoUser */
        $daoUser = $dao->getByLogin($login);
        if (!$daoUser) {
            $rep = $this->getResponse('redirect');
            jMessage::add(jLocale::get('crud.message.bad.id', $login), 'error');
            $rep->action = 'default:index';

            return $rep;
        }

        $form = jForms::get($this->form, $login);

        if( $form === null){
            jMessage::add(jLocale::get('crud.message.bad.form'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }

        jEvent::notify('jauthdbAdminBeforeCheckUpdateForm', array('form'=>$form, 'himself'=>false));

        $form->initFromRequest();

        $evresp = array();
        if ($form->check() &&
            !jEvent::notify('jauthdbAdminCheckUpdateForm', array('form'=>$form, 'himself'=>false))
                ->inResponse('check', false, $evresp)
        ){
            $form->prepareObjectFromControls($daoUser, $daoUser->getProperties());

            // we call jAuth instead of using jDao, to allow jAuth to do
            // all process, events...
            jAuth::updateUser($daoUser);

            $form->saveAllFiles($this->uploadsDirectory);
            $rep->action = 'default:view';
            jMessage::add(jLocale::get('crud.message.update.ok', $login), 'notice');
            jForms::destroy($this->form, $login);
        } else {
            $rep->action = 'default:editupdate';
        }
        $rep->params['j_user_login'] = $login;
        return $rep;
    }


    function confirmdelete(){
        $login = $this->param('j_user_login');
        if($login === null){
            jMessage::add(jLocale::get('crud.message.bad.id', 'null'), 'error');
            $rep = $this->getResponse('redirect');
            $rep->action = 'default:index';
            return $rep;
        }

        $dao = jDao::create($this->dao, $this->dbProfile);
        /** @var jDaoRecordBase $daoUser */
        $daoUser = $dao->getByLogin($login);
        if (!$daoUser) {
            $rep = $this->getResponse('redirect');
            jMessage::add(jLocale::get('crud.message.bad.id', $login), 'error');
            $rep->action = 'default:index';

            return $rep;
        }

        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', $login);
        $rep->body->assign('MAIN', $tpl->fetch('crud_delete'));
        return $rep;
    }

    /**
     * delete a record
     */
    function delete(){
        $login = $this->param('j_user_login');
        $pwd = $this->param('pwd_confirm');
        $rep = $this->getResponse('redirect');

        if (jAuth::verifyPassword(jAuth::getUserSession()->login, $pwd) == false) {
            jMessage::add(jLocale::get('crud.message.delete.invalid.pwd'), 'error');
            $rep->action = 'default:confirmdelete';
            $rep->params['j_user_login'] = $login;
            return $rep;
        }

        if( $login !== null && jAuth::getUserSession()->login != $login){
            if(jAuth::removeUser($login)) {
                jMessage::add(jLocale::get('crud.message.delete.ok', $login), 'notice');
                $rep->action = 'default:index';
            }
            else{
                jMessage::add(jLocale::get('crud.message.delete.notok'), 'error');
                $rep->action = 'default:view';
                $rep->params['j_user_login'] = $login;
            }
        }
        else {
            jMessage::add(jLocale::get('crud.message.delete.notok'), 'error');
            $rep->action = 'default:index';
        }
        return $rep;
    }

}

