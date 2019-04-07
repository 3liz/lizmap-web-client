<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @copyright   2006-2018 Laurent Jouanneau
* @copyright   2009 Julien Issler
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlUpload2 extends jFormsControl {

    public $type='upload';

    public $mimetype=array();

    public $maxsize=0;

    public $accept = '';

    public $capture = '';

    public $fileInfo = array();

    protected $error = null;


    function setForm($form) {
        parent::setForm($form);
        if (!isset($this->container->privateData[$this->ref]['newfile'])) {
            $this->container->privateData[$this->ref]['newfile'] = '';
        }
        if (!isset($this->container->privateData[$this->ref]['originalfile'])) {
            $this->container->privateData[$this->ref]['originalfile'] = '';
        }
    }

    public function getOriginalFile() {
        if (isset($this->container->privateData[$this->ref]['originalfile'])) {
            return $this->container->privateData[$this->ref]['originalfile'];
        }
        return '';
    }

    public function getNewFile() {
        if (isset($this->container->privateData[$this->ref]['newfile'])) {
            return $this->container->privateData[$this->ref]['newfile'];
        }
        return '';
    }

    protected function getTempFile($file) {
        jFile::createDir(jApp::tempPath('uploads/'));
        $tmpFile = jApp::tempPath('uploads/'.session_id().'-'.
            $this->form->getSelector().'-'.$this->form->id().'-'.
            $this->ref.'-'.$file);
        return $tmpFile;
    }


    protected function deleteNewFile() {
        if ($this->container->privateData[$this->ref]['newfile'] != '') {
            $file = $this->getTempFile($this->container->privateData[$this->ref]['newfile']);
            if (is_file($file)) {
                unlink($file);
            }
            $this->container->privateData[$this->ref]['newfile'] = '';
        }
    }

    function setDataFromDao($value, $daoDatatype) {
        $this->deleteNewFile();
        $this->container->privateData[$this->ref]['originalfile'] = $value;
        $this->container->data[$this->ref] = $value;
    }

    /**
     * @param jRequest $request
     */
    function setValueFromRequest($request) {
        $action = $request->getParam($this->ref.'_jf_action', '');

        if ($this->isReadOnly()) {
            $action = 'keep';
        }

        switch($action) {
            case 'keep':
                $this->deleteNewFile();
                $this->error = null;
                $this->container->data[$this->ref] = $this->container->privateData[$this->ref]['originalfile'];
                break;
            case 'keepnew':
                if ($this->container->privateData[$this->ref]['newfile'] != '' &&
                    file_exists($this->getTempFile($this->container->privateData[$this->ref]['newfile']))
                ) {
                    $this->container->data[$this->ref] = $this->container->privateData[$this->ref]['newfile'];
                }
                else {
                    $this->container->data[$this->ref] = $this->container->privateData[$this->ref]['originalfile'];
                }
                break;
            case 'new':
                $fileName = $this->processNewFile();
                if ($fileName) {
                    if ($this->container->privateData[$this->ref]['newfile'] != $fileName) {
                        $this->deleteNewFile();
                    }
                    $this->container->privateData[$this->ref]['newfile'] = $fileName;
                    $this->container->data[$this->ref] = $fileName;
                }
                elseif ($this->container->privateData[$this->ref]['newfile'] != '') {
                    $this->container->data[$this->ref] = $this->container->privateData[$this->ref]['newfile'];
                }
                else {
                    $this->container->privateData[$this->ref]['newfile'] = '';
                    $this->container->data[$this->ref] = $this->container->privateData[$this->ref]['originalfile'];
                }
                break;
            case 'del':
                $this->deleteNewFile();
                if (!$this->required) {
                    $this->container->data[$this->ref] = '';
                }
                break;
            default:
        }
        $this->container->privateData[$this->ref]['action'] = $action;
    }

    protected function processNewFile() {
        $this->error = null;

        if (isset($_FILES[$this->ref])) {
            $this->fileInfo = $_FILES[$this->ref];
        }
        else {
            $this->fileInfo = array('name'=>'','type'=>'','size'=>0,
                'tmp_name'=>'', 'error'=>UPLOAD_ERR_NO_FILE);
        }

        if ($this->fileInfo['error'] == UPLOAD_ERR_NO_FILE) {
            if ($this->required) {
                $this->error = jForms::ERRDATA_REQUIRED;
            }
        } else {
            if ($this->fileInfo['error'] == UPLOAD_ERR_NO_TMP_DIR ||
                $this->fileInfo['error'] == UPLOAD_ERR_CANT_WRITE
            ) {
                $this->error = jForms::ERRDATA_FILE_UPLOAD_ERROR;
            }

            if ($this->fileInfo['error'] == UPLOAD_ERR_INI_SIZE ||
                $this->fileInfo['error'] == UPLOAD_ERR_FORM_SIZE ||
                ($this->maxsize && $this->fileInfo['size'] > $this->maxsize)
            ) {
                $this->error = jForms::ERRDATA_INVALID_FILE_SIZE;
            }

            if ($this->fileInfo['error'] == UPLOAD_ERR_PARTIAL ||
                !is_uploaded_file($this->fileInfo['tmp_name'])
            ) {
                $this->error = jForms::ERRDATA_INVALID;
            }

            if (count($this->mimetype)) {
                $this->fileInfo['type'] = jFile::getMimeType($this->fileInfo['tmp_name']);
                if ($this->fileInfo['type'] == 'application/octet-stream') {
                    // let's try with the name
                    $this->fileInfo['type'] = jFile::getMimeTypeFromFilename($this->fileInfo['name']);
                }

                if (!in_array($this->fileInfo['type'], $this->mimetype)) {
                    $this->error = jForms::ERRDATA_INVALID_FILE_TYPE;
                }
            }
        }
        if ($this->error === null) {
            $filePath = $this->getTempFile($_FILES[$this->ref]['name']);
            if (move_uploaded_file($_FILES[$this->ref]['tmp_name'], $filePath)) {
                return $_FILES[$this->ref]['name'];
            }
            $this->error = jForms::ERRDATA_FILE_UPLOAD_ERROR;
        }
        return null;
    }

    function setNewFile($fileName) {
        if ($fileName) {
            if ($this->container->privateData[$this->ref]['newfile'] != $fileName) {
                $this->deleteNewFile();
            }
            $this->container->privateData[$this->ref]['newfile'] = $fileName;
            $this->container->data[$this->ref] = $fileName;
        }
        elseif ($this->container->privateData[$this->ref]['newfile'] != '') {
            $this->deleteNewFile();
            $this->container->data[$this->ref] = '';
        }
        else {
            $this->container->data[$this->ref] = '';
        }
    }

    function check() {
        if ($this->error) {
            return $this->container->errors[$this->ref] = $this->error;
        }
        return null;
    }

    function getUniqueFileName($directoryPath, $alternateName='') {
        if ($alternateName == '') {
            $alternateName = $this->container->privateData[$this->ref]['newfile'];
            if ($alternateName == '') {
                return '';
            }
        }
        $directoryPath = rtrim($directoryPath, '/').'/';
        $path = $directoryPath . $alternateName;
        $filename = basename($path);
        $dir = rtrim(dirname($path), '/');
        $idx = 0;
        $originalName = $filename;
        while (file_exists($dir.'/'.$filename)) {
            ++$idx;
            $splitValue = explode('.', $originalName);
            $splitValue[0] = $splitValue[0].$idx;
            $filename = implode('.', $splitValue);
        }
        return substr($dir.'/'.$filename, strlen($directoryPath));
    }

    function saveFile($directoryPath, $alternateName='') {

        if (isset($this->container->errors[$this->ref]) &&
            $this->container->errors[$this->ref] != ''
        ) {
            return false;
        }

        if ($this->container->privateData[$this->ref]['newfile']) {
            if ($this->container->privateData[$this->ref]['originalfile']) {
                $originalFile = $directoryPath.$this->container->privateData[$this->ref]['originalfile'];
                if (file_exists($originalFile)) {
                    unlink($originalFile);
                }
            }
            if ($alternateName == '') {
                $alternateName = $this->container->privateData[$this->ref]['newfile'];
            }
            $newFileToCopy = $this->getTempFile($this->container->privateData[$this->ref]['newfile']);
            $dir = dirname($directoryPath . $alternateName);
            jFile::createDir($dir);
            rename($newFileToCopy, $directoryPath . $alternateName);
            $this->container->privateData[$this->ref]['originalfile'] = $alternateName;
            $this->container->data[$this->ref] = $alternateName;
            $this->container->privateData[$this->ref]['newfile'] = '';
        }
        elseif ($this->container->data[$this->ref] == '' &&
            $this->container->privateData[$this->ref]['originalfile']
        ) {
            $originalFile = $directoryPath.$this->container->privateData[$this->ref]['originalfile'];
            if (file_exists($originalFile)) {
                unlink($originalFile);
            }
            $this->container->privateData[$this->ref]['originalfile'] = '';
        }
        return true;
    }

    function deleteFile($directoryPath) {
        if ($this->container->data[$this->ref] != '') {
            $file = $directoryPath.$this->container->data[$this->ref];
            if (file_exists($file)) {
                unlink($file);
            }
            $this->container->data[$this->ref] = '';
        }
    }


    function getWidgetType() {
        return 'upload2';
    }
}
