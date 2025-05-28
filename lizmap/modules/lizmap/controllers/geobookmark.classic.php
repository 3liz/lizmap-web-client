<?php

/**
 * Lizmap administration.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class geobookmarkCtrl extends jController
{
    protected $whiteParams;

    public function __construct($request)
    {
        $this->whiteParams = array(
            'repository',
            'project',
            'hash',
        );

        parent::__construct($request);
    }

    public function index()
    {
        if (!jAuth::isConnected()) {
            jMessage::add('Geobookmarks - User is not connected', 'error');

            return $this->error();
        }

        if ($this->param('q') == 'add') {
            return $this->add();
        }
        if ($this->param('q') == 'del') {
            return $this->delete();
        }
        if ($this->param('q') == 'get') {
            return $this->getBookmarkParams();
        }

        jMessage::add('Geobookmarks - Wrong parameters given', 'error');

        return $this->error();
    }

    // Handle errors
    public function error()
    {
        $messages = jMessage::getAll();
        jMessage::clearAll();

        $rep = $this->getResponse('json');
        $rep->data = $messages;

        return $rep;
    }

    // Add a geobookmark
    public function add()
    {
        $ok = true;

        // Check name
        $name = htmlspecialchars(strip_tags($this->param('name')));
        if (empty($name)) {
            $ok = false;
            jMessage::add('Please give a name', 'error');
        }

        if ($ok) {
            $dao = jDao::get('lizmap~geobookmark');
            $record = jDao::createRecord('lizmap~geobookmark');
            $record->name = $name;
            $params = array();
            foreach ($this->whiteParams as $param) {
                $val = htmlspecialchars(strip_tags($this->param($param)));
                $params[$param] = $val;
            }
            $record->map = $params['repository'].':'.$params['project'];
            $record->params = json_encode($params);
            $record->login = jAuth::getUserSession()->login;
            // Save the new bookmark
            $id = null;

            try {
                $id = $dao->insert($record);
            } catch (Exception $e) {
                jLog::log('Error while inserting the bookmark', 'lizmapadmin');
                jLog::logEx($e, 'error');
                jMessage::add('Error while inserting the bookmark', 'error');
            }
        }

        return $this->getGeoBookmarks($params['repository'], $params['project']);
    }

    // Get bookmark content from templates
    public function getGeoBookmarks($repository = null, $project = null)
    {
        $rep = $this->getResponse('htmlfragment');

        $tpl = new jTpl();

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        if (!$repository) {
            $repository = $this->param('repository');
        }
        if (!$project) {
            $project = $this->param('project');
        }

        // Get user geobookmarks
        $daogb = jDao::get('lizmap~geobookmark');
        $conditions = jDao::createConditions();
        $conditions->addCondition('login', '=', $usr_login);
        $conditions->addCondition('map', '=', $repository.':'.$project);
        $gbList = $daogb->findBy($conditions);
        $gbCount = $daogb->countBy($conditions);

        // Get html content
        $tpl->assign('gbCount', $gbCount);
        $tpl->assign('gbList', $gbList);
        $html = $tpl->fetch('view~map_geobookmark');

        jMessage::clearAll();

        $rep->addContent($html);

        return $rep;
    }

    // Delete bookmark by id
    public function delete()
    {
        $ok = true;

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        // Bookmark id
        $id = $this->intParam('id');

        // Conditions to get the bookmark
        $daogb = jDao::get('lizmap~geobookmark');
        $conditions = jDao::createConditions();
        $conditions->addCondition('login', '=', $usr_login);
        $conditions->addCondition('id', '=', $id);
        $gbCount = $daogb->countBy($conditions);

        if ($gbCount != 1) {
            $ok = false;
            jMessage::add('Wrong id given', 'error');
        }

        if ($ok) {
            try {
                $daogb->delete($id);
            } catch (Exception $e) {
                jLog::log('Error while deleting the bookmark', 'lizmapadmin');
                jLog::logEx($e, 'error');
                jMessage::add('Error while deleting the bookmark', 'error');
            }
        }

        return $this->getGeoBookmarks($this->param('repository'), $this->param('project'));
    }

    // Get bookmark params
    public function getBookmarkParams()
    {
        $ok = true;

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        // Bookmark id
        $id = $this->intParam('id');

        // Conditions to get the bookmark
        $daogb = jDao::get('lizmap~geobookmark');
        $conditions = jDao::createConditions();
        $conditions->addCondition('login', '=', $usr_login);
        $conditions->addCondition('id', '=', $id);
        $gbCount = $daogb->countBy($conditions);

        if ($gbCount != 1) {
            $ok = false;
            jMessage::add('Wrong id given', 'error');

            return $this->error();
        }
        $gbList = $daogb->findBy($conditions);
        $gbParams = array();
        foreach ($gbList as $gb) {
            $gbParams = json_decode(htmlspecialchars_decode($gb->params, ENT_QUOTES));
        }
        $rep = $this->getResponse('json');
        $rep->data = $gbParams;

        return $rep;
    }
}
