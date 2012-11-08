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
 * controller to allow a user to edit his own profile in the admin
 */
class userCtrl extends jController {
   
    public $pluginParams=array(
        'view'         =>array('jacl2.right'=>'auth.user.view'),
        'preupdate'    =>array('jacl2.rights.and'=>array('auth.user.view','auth.user.modify')),
        'editupdate'   =>array('jacl2.rights.and'=>array('auth.user.view','auth.user.modify')),
        'saveupdate'   =>array('jacl2.rights.and'=>array('auth.user.view','auth.user.modify')),
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
     * 
     */
    function index(){
        $id = $this->param('j_user_login');
        if( $id === null ){
            $rep = $this->getResponse('redirect');
            $rep->action = 'master_admin~default:index';
            return $rep;
        }
        
        if ($id != jAuth::getUserSession()->login) {
            jMessage::add(jLocale::get('jelix~errors.acl.action.right.needed'), 'error');
            $rep = $this->getResponse('redirect');
            $rep->action = 'master_admin~default:index';
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
        $tpl->assign('personalview', true);
        $tpl->assign('otherInfo', jEvent::notify('jauthdbAdminGetViewInfo', array('form'=>$form, 'tpl'=>$tpl, 'himself'=>true))->getResponse());
        $form->deactivate('password');
        $form->deactivate('password_confirm');
        $tpl->assign('canUpdate', jAcl2::check('auth.user.modify'));
        $tpl->assign('canChangePass', jAcl2::check('auth.user.change.password'));
        $rep->body->assign('MAIN', $tpl->fetch('user_view'));
        return $rep;
    }


    /**
     * prepare a form in order to edit an existing record, and redirect to the editupdate action
     */
    function preupdate(){
        $id = $this->param('j_user_login');
        $rep = $this->getResponse('redirect');

        if( $id === null ){
            $rep->action = 'master_admin~default:index';
            return $rep;
        }

        if ($id != jAuth::getUserSession()->login) {
            jMessage::add(jLocale::get('jelix~errors.acl.action.right.needed'), 'error');
            $rep->action = 'master_admin~default:index';
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

        jEvent::notify('jauthdbAdminPrepareUpdate', array('form'=>$form, 'himself'=>true));
        $form->setReadOnly('login');
        $form->deactivate('password');
        $form->deactivate('password_confirm');
        $rep->action = 'user:editupdate';        
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
            $rep->action = 'master_admin~default:index';
            return $rep;
        }

        if ($id != jAuth::getUserSession()->login) {
            jMessage::add(jLocale::get('jelix~errors.acl.action.right.needed'), 'error');
            $rep = $this->getResponse('redirect');
            $rep->action = 'master_admin~default:index';
            return $rep;
        }

        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', $id);
        $tpl->assign('form',$form);
        $tpl->assign('saveaction', 'user:saveupdate');
        $tpl->assign('viewaction', 'user:index');
        jEvent::notify('jauthdbAdminEditUpdate', array('form'=>$form, 'tpl'=>$tpl, 'himself'=>true));
        $form->deactivate('password'); //for security
        $form->deactivate('password_confirm');
        $form->setReadOnly('login');
        $rep->body->assign('MAIN', $tpl->fetch('user_edit'));
        return $rep;
    }

    /**
     * save data of a form in a new record
     */
    function saveupdate(){
        $rep = $this->getResponse('redirect');
        $id = $this->param('j_user_login');

        if ($id != jAuth::getUserSession()->login) {
            jMessage::add(jLocale::get('jelix~errors.acl.action.right.needed'), 'error');
            $rep = $this->getResponse('redirect');
            $rep->action = 'master_admin~default:index';
            return $rep;
        }

        $form = jForms::get($this->form, $id);
        $form->initFromRequest();

        if( $form === null || $id === null){
            $rep->action = 'master_admin~default:index';
            return $rep;
        }
        $evresp = array();
        if($form->check() && !jEvent::notify('jauthdbAdminCheckUpdateForm', array('form'=>$form, 'himself'=>true))->inResponse('check', false, $evresp)){
            $results = $form->prepareDaoFromControls($this->dao,$id,$this->dbProfile);
            extract($results, EXTR_PREFIX_ALL, "form");
            // we call jAuth instead of using jDao, to allow jAuth to do
            // all process, events...
            jAuth::updateUser($form_daorec);

            $form->saveAllFiles($this->uploadsDirectory);
            $rep->action = 'user:index';
            jMessage::add(jLocale::get('crud.message.update.ok', $id), 'notice');
            jForms::destroy($this->form, $id);
        } else {
            $rep->action = 'user:editupdate';
        }
        $rep->params['j_user_login'] = $id;
        return $rep;
    }
}

