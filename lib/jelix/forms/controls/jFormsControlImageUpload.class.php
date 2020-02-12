<?php
/**
 * @package     jelix
 * @subpackage  forms
 * @author      Laurent Jouanneau
 * @copyright   2020 Laurent Jouanneau
 * @link        https://jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

require_once(__DIR__.'/jFormsControlUpload2.class.php');

/**
 *
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlImageUpload extends jFormsControlUpload2 {

    protected function processNewFile() {
        $this->error = null;

        $inputRef = $this->ref.'_jforms_edited_image';

        if (!array_key_exists($inputRef, $_POST)) {
            return parent::processNewFile();
        }
        $this->fileInfo = @json_decode($_POST[$inputRef], true);

        if (!$this->fileInfo) {
            $this->fileInfo = array('name'=>'','type'=>'','size'=>0,
                'tmp_name'=>'', 'error'=>UPLOAD_ERR_NO_FILE);
            if ($this->required) {
                $this->error = \jForms::ERRDATA_REQUIRED;
            }
            return null;
        }

        $content = '';
        if (isset($this->fileInfo['content'])) {
            $content = $this->fileInfo['content'];
            unset($this->fileInfo['content']);
        }


        if ($content != '') {
            $content = @base64_decode($content, true);
            if ($content === false) {
                $this->error = \jForms::ERRDATA_INVALID;
                return null;
            }
        }
        else {
            if ($this->required) {
                $this->error = \jForms::ERRDATA_REQUIRED;
            }
            return null;
        }

        $filePath = $this->getTempFile($this->fileInfo['name']);
        $size = file_put_contents($filePath, $content);

        if ($size === false) {
            $this->error = \jForms::ERRDATA_FILE_UPLOAD_ERROR;
            return null;
        }

        if ($this->maxsize && $size > $this->maxsize) {
            $this->error = \jForms::ERRDATA_INVALID_FILE_SIZE;
            unlink($filePath);
            return null;
        }


        if (count($this->mimetype)) {
            $this->fileInfo['type'] = \jFile::getMimeType($filePath);
            if ($this->fileInfo['type'] == 'application/octet-stream') {
                // let's try with the name
                $this->fileInfo['type'] = \jFile::getMimeTypeFromFilename($this->fileInfo['name']);
            }

            if (!in_array($this->fileInfo['type'], $this->mimetype)) {
                $this->error = \jForms::ERRDATA_INVALID_FILE_TYPE;
                unlink($filePath);
                return null;
            }
        }

        return $this->fileInfo['name'];
    }


    function getWidgetType() {
        return 'imageupload';
    }
}
