<?php
/**
* Lizmap administration
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class geobookmarkCtrl extends jController {


    function __construct($request){

        $this->whiteParams = array(
            'repository',
            'project',
            'bbox',
            'layers',
            'crs',
            'layerStyles',
            'filter'
        );

        parent::__construct($request);
    }


    function index(){
        if( !jAuth::isConnected() ){
            jMessage::add('Geobookmarks - User is not connected', 'error');
            return $this->error;
        }

        if( $this->param('q') == 'add' )
            return $this->add();
        else if ( $this->param('q') == 'del' )
            return $this->delete();
        else if ( $this->param('q') == 'get' )
            return $this->getBookmarkParams();
        else{
            jMessage::add('Geobookmarks - Wrong parameters given', 'error');
            return $this->error();
        }
        return $rep;

    }


    /*
     * Handle errors
     *
     */
    function error(){

        $messages = jMessage::getAll();
        jMessage::clearAll();

        $rep = $this->getResponse('json');
        $rep->data = $messages;
        return $rep;
    }


    /*
     * Add a geobookmark
     *
     */
    function add(){
        $ok = True;

        // Check name
        $name = filter_var( $this->param('name'), FILTER_SANITIZE_STRING );
        if( empty($name) ){
            $ok = False;
            jMessage::add('Please give a name', 'error');
        }

        if( $ok ){
            $dao = jDao::get('lizmap~geobookmark');
            $record = jDao::createRecord('lizmap~geobookmark');
            $record->name = $name;
            $params = array();
            foreach( $this->whiteParams as $param ){
                $val = filter_var( $this->param($param), FILTER_SANITIZE_STRING );
                $params[$param] = $val;
            }
            $record->map = $params['repository'] . ':' . $params['project'];
            $record->params = json_encode( $params );
            $record->login = jAuth::getUserSession()->login;
            // Save the new bookmark
            $id = Null;
            try{
                $id = $dao->insert($record);
            }catch(Exception $e){
                jLog::log( 'Error while inserting the bookmark');
                jLog::log( $e->getMessage());
                jMessage::add( 'Error while inserting the bookmark', 'error' );
            }
        }

        return $this->getGeoBookmarks( $params['repository'], $params['project'] );
    }


    /*
     * Get bookmark content from templates
     *
     */
    function getGeoBookmarks( $repository=Null, $project=Null ){

        $rep = $this->getResponse('htmlfragment');

        $tpl = new jTpl();

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        if( !$repository)
            $repository = $this->param('repository');
        if( !$project)
            $project = $this->param('project');

        // Get user geobookmarks
        $daogb = jDao::get('lizmap~geobookmark');
        $conditions = jDao::createConditions();
        $conditions->addCondition('login','=',$usr_login);
        $conditions->addCondition('map','=',$repository.':'.$project);
        $gbList = $daogb->findBy($conditions);
        $gbCount = $daogb->countBy($conditions);

        // Get html content
        $tpl->assign( 'gbCount', $gbCount );
        $tpl->assign( 'gbList', $gbList );
        $html = $tpl->fetch('view~map_geobookmark');

        jMessage::clearAll();

        $rep->addContent( $html );
        return $rep;
    }


    /*
     * Delete bookmark by id
     *
     */
    function delete(){
        $ok = True;

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        // Bookmark id
        $id = $this->intParam('id');

        // Conditions to get the bookmark
        $daogb = jDao::get('lizmap~geobookmark');
        $conditions = jDao::createConditions();
        $conditions->addCondition('login','=',$usr_login);
        $conditions->addCondition('id','=',$id);
        $gbCount = $daogb->countBy($conditions);

        if( $gbCount != 1 ){
            $ok = False;
            jMessage::add('Wrong id given', 'error');
        }

        if( $ok ){
            try{
                $daogb->delete($id);
            }catch(Exception $e){
                jLog::log( 'Error while deleting the bookmark');
                jLog::log( $e->getMessage());
                jMessage::add( 'Error while deleting the bookmark', 'error' );
            }
        }

        return $this->getGeoBookmarks( $this->param('repository'), $this->param('project'));
    }

    /*
     * Get bookmark params
     *
     */
    function getBookmarkParams(){

        $ok = True;

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        // Bookmark id
        $id = $this->intParam('id');

        // Conditions to get the bookmark
        $daogb = jDao::get('lizmap~geobookmark');
        $conditions = jDao::createConditions();
        $conditions->addCondition('login','=',$usr_login);
        $conditions->addCondition('id','=',$id);
        $gbCount = $daogb->countBy($conditions);

        if( $gbCount != 1 ){
            $ok = False;
            jMessage::add('Wrong id given', 'error');
            return $this->error();
        }else{
            $gbList = $daogb->findBy($conditions);
            $gbParams = array();
            foreach( $gbList as $gb ){
                $gbParams = json_decode(htmlspecialchars_decode($gb->params,ENT_QUOTES ));
            }
            $rep = $this->getResponse('json');
            $rep->data = $gbParams;
            return $rep;
        }

    }



}
