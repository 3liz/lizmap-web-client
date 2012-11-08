<?php
/**
* @package   admin
* @subpackage jauthdb_admin
* @author    Laurent Jouanneau
* @copyright 2009 Laurent Jouanneau
* @link      http://jelix.org
* @license   http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU Public Licence
*/

/**
 * controller to manage all users
 */
class defaultCtrl extends jController {

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
        if ($plugin->config['driver'] == 'Db') {
            $this->authConfig = $plugin->config['Db'];
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
            return $rep;
        }

        $tpl = new jTpl();

        $dao = jDao::get($this->dao, $this->dbProfile);

        $cond = jDao::createConditions();
        $cond->addItemOrder('login', 'asc');
        $tpl->assign('list', $dao->findBy($cond,$offset,$this->listPageSize));

        $pk = $dao->getPrimaryKeyNames();
        $tpl->assign('primarykey', $pk[0]);

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
        $id = $this->param('j_user_login');
        if( $id === null ){
            $rep = $this->getResponse('redirect');
            jMessage::add(jLocale::get('crud.message.bad.id', 'null'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }
        $rep = $this->getResponse('html');

        // we're using a form to display a record, to have the portunity to have
        // labels with each values.
        $form = jForms::create($this->form, $id);
        $form->initFromDao($this->dao, $id, $this->dbProfile);

        $tpl = new jTpl();
        $tpl->assign('id', $id);
        $tpl->assign('form',$form);
        $tpl->assign('otherInfo', jEvent::notify('jauthdbAdminGetViewInfo', array('form'=>$form, 'tpl'=>$tpl, 'himself'=>false))->getResponse());
        $form->deactivate('password');
        $form->deactivate('password_confirm');
        $tpl->assign('canDelete', (jAuth::getUserSession()->login != $id) &&  jAcl2::check('auth.users.delete'));
        $tpl->assign('canUpdate', jAcl2::check('auth.users.modify'));
        $tpl->assign('canChangePass', jAcl2::check('auth.users.change.password'));
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
        jEvent::notify('jauthdbAdminEditCreate', array('form'=>$form, 'tpl'=>$tpl));

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
        $form->initFromRequest();
        $evresp = array();
        if($form->check()  && !jEvent::notify('jauthdbAdminCheckCreateForm', array('form'=>$form))->inResponse('check', false, $evresp)){
            $props = jDao::createRecord($this->dao, $this->dbProfile)->getProperties();

            $user = jAuth::createUserObject($form->getData('login'),$form->getData('password'));

            $form->setData('password', $user->password);
            $form->prepareObjectFromControls($user, $props);
            $form->saveAllFiles($this->uploadsDirectory);

            jAuth::saveNewUser($user);

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
        $id = $this->param('j_user_login');
        $rep = $this->getResponse('redirect');

        if( $id === null ){
            jMessage::add(jLocale::get('crud.message.bad.id','null'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }
        $rep->params['j_user_login'] = $id;

        $form = jForms::create($this->form, $id);

        try {
            $rec = $form->initFromDao($this->dao, null, $this->dbProfile);
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
        $id = $this->param('j_user_login');
        $form = jForms::get($this->form,$id);
        if( $form === null || $id === null){
            $rep = $this->getResponse('redirect');
            $rep->action = 'default:index';
            jMessage::add(jLocale::get('crud.message.bad.id', $id), 'error');
            return $rep;
        }
        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', $id);
        $tpl->assign('form',$form);
        jEvent::notify('jauthdbAdminEditUpdate', array('form'=>$form, 'tpl'=>$tpl, 'himself'=>false));
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
        $id = $this->param('j_user_login');

        if( $id === null){
            jMessage::add(jLocale::get('crud.message.bad.id', 'null'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }

        $form = jForms::get($this->form,$id);

        if( $form === null){
            jMessage::add(jLocale::get('crud.message.bad.form'), 'error');
            $rep->action = 'default:index';
            return $rep;
        }

        $form->initFromRequest();

        $evresp = array();
        if($form->check() && !jEvent::notify('jauthdbAdminCheckUpdateForm', array('form'=>$form, 'himself'=>false))->inResponse('check', false, $evresp)){
            $results = $form->prepareDaoFromControls($this->dao,$id,$this->dbProfile);
            extract($results, EXTR_PREFIX_ALL, "form");
            // we call jAuth instead of using jDao, to allow jAuth to do
            // all process, events...
            jAuth::updateUser($form_daorec);

            $form->saveAllFiles($this->uploadsDirectory);
            $rep->action = 'default:view';
            jMessage::add(jLocale::get('crud.message.update.ok', $id), 'notice');
            jForms::destroy($this->form, $id);
        } else {
            $rep->action = 'default:editupdate';
        }
        $rep->params['j_user_login'] = $id;
        return $rep;
    }


    function confirmdelete(){
        $id = $this->param('j_user_login');
        if($id === null){
            jMessage::add(jLocale::get('crud.message.bad.id', 'null'), 'error');
            $rep = $this->getResponse('redirect');
            $rep->action = 'default:index';
            return $rep;
        }
        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', $id);
        $rep->body->assign('MAIN', $tpl->fetch('crud_delete'));
        return $rep;
    }

    /**
     * delete a record
     */
    function delete(){
        $id = $this->param('j_user_login');
        $pwd = $this->param('pwd_confirm');
        $rep = $this->getResponse('redirect');

        if (jAuth::verifyPassword(jAuth::getUserSession()->login, $pwd) == false) {
            jMessage::add(jLocale::get('crud.message.delete.invalid.pwd'), 'error');
            $rep->action = 'default:confirmdelete';
            $rep->params['j_user_login'] = $id;
            return $rep;
        }

        if( $id !== null && jAuth::getUserSession()->login != $id){
            if(jAuth::removeUser($id)) {
                jMessage::add(jLocale::get('crud.message.delete.ok', $id), 'notice');
                $rep->action = 'default:index';
            }
            else{
                jMessage::add(jLocale::get('crud.message.delete.notok'), 'error');
                $rep->action = 'default:view';
                $rep->params['j_user_login'] = $id;
            }
        }
        else {
            jMessage::add(jLocale::get('crud.message.delete.notok'), 'error');
            $rep->action = 'default:index';
        }
        return $rep;
    }

}

