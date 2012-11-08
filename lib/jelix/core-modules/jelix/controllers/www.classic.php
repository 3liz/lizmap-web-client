<?php
/**
* @package    jelix-modules
* @subpackage jelix
* @author     Laurent Jouanneau
* @copyright  2011-2012 Laurent Jouanneau
* @licence    http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

/**
 * @package    jelix-modules
 * @subpackage jelix
 */
class wwwCtrl extends jController {
    
    public function getfile() {
        $module = $this->param('targetmodule');

        if (!jApp::isModuleEnabled($module) || jApp::config()->modules[$module.'.access'] < 2) {
            throw new jException('jelix~errors.module.untrusted',$module);
        }

        $rep = $this->getResponse('binary');
        $rep->doDownload = false;
        $dir = jApp::getModulePath($module).'www/';
        $rep->fileName = realpath($dir.str_replace('..', '', $this->param('file')));

        if (!is_file($rep->fileName)) {
            $rep = $this->getResponse('html', true);
            $rep->bodyTpl = 'jelix~404.html';
            $rep->setHttpStatus('404', 'Not Found');
            return $rep;
        }
        $rep->mimeType = jFile::getMimeTypeFromFilename($rep->fileName);
        return $rep;
    }
}

