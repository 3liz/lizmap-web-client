<?php
/**
* @package      jelix
* @subpackage   coord_plugin
* @author       Lepeltier Kévin
* @contributor  Dominique Papin, Laurent Jouanneau, Steven Jehannet
* @copyright  2008 Lepeltier Kévin, 2008 Dominique Papin, 2008 Laurent Jouanneau, 2010 Steven Jehannet
*
* The plugin History is a plugin coord,
* it records the action / settings made during a session and allows for reuse.
*
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
class historyCoordPlugin implements jICoordPlugin {

    public $config;

    function __construct ($conf){
        $this->config = $conf;
    }

    public function beforeAction ($params) {

        if( !empty($params['history.add']) && $params['history.add']
            && $_SERVER['REQUEST_METHOD'] == 'GET') {

            $sname = $this->config['session_name'];

            if( !isset($_SESSION[$sname]) )
                $_SESSION[$sname] = array();

            $history = & $_SESSION[$sname];

            $coord = jApp::coord();
            $page['params'] = $coord->request->params;
            unset( $page['params']['module'] );
            unset( $page['params']['action'] );

            $page['action'] = $coord->action->toString();
            $page['label'] = ( !empty($params['history.label']) )? $params['history.label']:'';
            $page['title'] = ( !empty($params['history.title']) )? $params['history.title']:'';

            if (!count($history)) {
                $history[] = $page;
            } else if ($this->config['double'] || !$this->isLast( $page['action'], $page['params'])) {
                if ($this->config['single']) {
                    foreach ($history as $key=>$valu) if ($valu == $page)
                        array_splice ($history, $key, 1);
                }
                $history[] = $page;
            }

            if (count($history) > $this->config['maxsize']) {
                array_shift($history);
            }
        }

        $stn = $this->config['session_time_name'];
        if ($this->config['time']) {
            if (!isset($_SESSION[$stn]))
                $_SESSION[$stn] = microtime(true);
        } else if (isset($_SESSION[$stn])) {
            unset($_SESSION[$stn]);
        }
    }

    public function isLast($action, $params = NULL) {

        if (!isset($_SESSION[$this->config['session_name']]))
            return false ;

        $lastPage = end($_SESSION[$this->config['session_name']]);
        $isLast = $action == $lastPage['action'];
        if ( $params !== NULL ) {
            $isLast = $isLast && $params == $lastPage['params'];
        }
        return $isLast;
    }


    public function change( $key, $val ) {
        $sn = $this->config['session_name'];
        if (!isset($_SESSION[$sn]))
            return;
        $page = array_pop($_SESSION[$sn]);
        $page[$key] = $val;

        if ($this->config['double'] || end($_SESSION[$sn]) != $page) {
            if ($this->config['single'])
                foreach ($_SESSION[$sn] as $key=>$value) if ($value == $page)
                    array_splice ($_SESSION[$sn], $key, 1);
            $_SESSION[$sn][] = $page;
        }
    }

    public function beforeOutput(){}

    public function afterProcess (){}

    public function reload( $rep ) {
        $last = end($_SESSION[$this->config['session_name']]);
        $rep->action = $last['action'];
        $rep->params = $last['params'];
        return $rep;
    }

    public function back( $rep ) {
        array_pop($_SESSION[$this->config['session_name']]);
        $last = end($_SESSION[$this->config['session_name']]);
        $rep->action = $last['action'];
        $rep->params = $last['params'];
        return $rep;
    }

    public function time() {
        if ($this->config['time'])
            return microtime(true) - $_SESSION[$this->config['session_time_name']];
        return 0;
    }

}


