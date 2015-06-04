<?php
/**
* @package     jelix
* @subpackage  junittests
* @author      Laurent Jouanneau
* @contributor Rahal Aboulfeth
* @copyright   2007-2012 Laurent Jouanneau, 2007-2011 Rahal Aboulfeth
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class defaultCtrl extends jController {

    /**
    *
    */
    function index() {
        $conf = jApp::config();
        if(!isset($conf->enableTests) || !$conf->enableTests){
            // security
            $rep = $this->getResponse('html', true);
            $rep->title = 'Error';
            $rep->setHttpStatus('404', 'Not found');
            $rep->addContent('<p>404 Not Found</p>');
            return $rep;
        }

        $rep = $this->_prepareResponse();

        return $this->_finishResponse($rep);
    }

    function all() {
        $conf = jApp::config();
        if(!isset($conf->enableTests) || !$conf->enableTests){
            // security
            $rep = $this->getResponse('html', true);
            $rep->title = 'Error';
            $rep->setHttpStatus('404', 'Not found');
            $rep->addContent('<p>404 Not Found</p>');
            return $rep;
        }

        $rep = $this->_prepareResponse();
        jClasses::inc("junittests~jhtmlrespreporter");
        jClasses::inc('junittests~junittestcase');
        jClasses::inc('junittests~junittestcasedb');
        $category = $this->category ? ' ('.$this->category .')' : '';
        if (count ($this->testsList)){
            foreach($this->testsList as $module=>$tests){
                $reporter = new jhtmlrespreporter();
                $reporter->setResponse($rep);
    
                jApp::pushCurrentModule($module);
                $group = new TestSuite('Tests'.$category.' on module '.$module);
                foreach($this->testsList[$module] as $test){
                    $group->addFile($conf->_modulesPathList[$module].'tests/'.$test[0]);
                }
                $group->run($reporter);
                jApp::popCurrentModule();
            }
        } else {
                $rep->body->assign ('MAIN','<p>no'.$category.' tests available.</p>');
        }
        return $this->_finishResponse($rep);
    }


    function module() {
        $conf = jApp::config();
        if(!isset($conf->enableTests) || !$conf->enableTests){
            // security
            $rep = $this->getResponse('html', true);
            $rep->title = 'Error';
            $rep->setHttpStatus('404', 'Not found');
            $rep->addContent('<p>404 Not Found</p>');
            return $rep;
        }
        $rep = $this->_prepareResponse();
        $category = $this->category ? ' '.$this->category : '';
        $module = $this->param('mod');
        if(isset($this->testsList[$module])){
            $reporter = jClasses::create("junittests~jhtmlrespreporter");
            jClasses::inc('junittests~junittestcase');
            jClasses::inc('junittests~junittestcasedb');
            $reporter->setResponse($rep);

            $group = new TestSuite('All'.$category.' tests in "'.$module. '" module');
            foreach($this->testsList[$module] as $test){
                $group->addFile($conf->_modulesPathList[$module].'tests/'.$test[0]);
            }
            jApp::pushCurrentModule($module);
            $group->run($reporter);
            jApp::popCurrentModule();
        } else {
            $rep->body->assign ('MAIN','<p>no'.$category.' tests for "'.$module.'" module.</p>');
        }
        return $this->_finishResponse($rep);
    }


    function single() {
        $conf = jApp::config();
        if(!isset($conf->enableTests) || !$conf->enableTests){
            // security
            $rep = $this->getResponse('html', true);
            $rep->title = 'Error';
            $rep->setHttpStatus('404', 'Not found');
            $rep->addContent('<p>404 Not Found</p>');
            return $rep;
        }
        $rep = $this->_prepareResponse();

        $module = $this->param('mod');
        $testname = $this->param('test');

        if(isset($this->testsList[$module])){
            $reporter = jClasses::create("junittests~jhtmlrespreporter");
            jClasses::inc('junittests~junittestcase');
            jClasses::inc('junittests~junittestcasedb');
            $reporter->setResponse($rep);

            foreach($this->testsList[$module] as $test){
                if($test[1] == $testname){
                    $group = new TestSuite('"'.$module. '" module , '.$test[2]);
                    $group->addFile($conf->_modulesPathList[$module].'tests/'.$test[0]);
                    jApp::pushCurrentModule($module);
                    $group->run($reporter);
                    jApp::popCurrentModule();
                    break;
                }
            }
        }else
            $rep->body->assign ('MAIN','<p>no tests for "'.$module.'" module.</p>');
        return $this->_finishResponse($rep);
    }
    
    protected $allTestsList = array();
    protected $testsList = array();
    protected $category =false;

    protected function _prepareResponse(){
        $rep = $this->getResponse('html', true);
        $rep->bodyTpl = 'junittests~main';

        $rep->body->assign('page_title', 'Unit Tests');
        $rep->body->assign('versionphp',phpversion());
        $rep->body->assign('versionjelix',JELIX_VERSION);
        $rep->body->assign('basepath', jApp::urlBasePath());
        $rep->body->assign('isurlsig', jApp::config()->urlengine['engine'] == 'significant');

        $runnerPreparer = jClasses::create('junittests~jrunnerpreparer');
        $this->allTestsList = $runnerPreparer->getTestsList('html');
        $this->category = $this->param('categ' , false );
        $this->testsList = $runnerPreparer->filterTestsByCategory($this->category , $this->allTestsList );
        $rep->body->assign('modules', $this->allTestsList);

        return $rep;
    }

    protected function _finishResponse($rep){

        $rep->title .= ($rep->title !=''?' - ':'').' Unit Tests';
        $rep->body->assignIfNone('MAIN','<p>Welcome to unit tests</p>');
        return $rep;
    }
}
?>
