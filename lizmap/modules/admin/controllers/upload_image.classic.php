<?php

use Jelix\FileUtilities\File;

/**
 * Image upload controller for ckeditor.
 *
 * @author    3liz
 * @copyright 2019 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class upload_imageCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.access'),
    );

    /**
     * @param string $message
     *
     * @return jResponseJson
     */
    protected function uploadError($message)
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array(
            'error' => array(
                'message' => $message,
            ),
        );

        return $rep;
    }

    /**
     * @return jResponseJson
     */
    public function uploadfile()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        $paramName = 'upload';
        $maxSize = 2 * 1024 * 1024; // Mb
        $allowedMimeType = array('image/jpg', 'image/jpeg', 'image/png', 'image/gif');
        $uploadPath = 'live/images/home/';

        $directoryPath = jApp::wwwPath($uploadPath);

        if (!isset($_FILES[$paramName])) {
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.missing'));
        }

        $file = $_FILES[$paramName];
        if (!isset($file['error'])) {
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.missing'));
        }

        switch ($file['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.bigger'));

            case UPLOAD_ERR_PARTIAL:
                return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.partially'));

            case UPLOAD_ERR_NO_FILE:
                return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.none'));

            case UPLOAD_ERR_NO_TMP_DIR:
                return $this->uploadError(jLocale::get('admin~admin.upload.image.error.missing.temp'));

            case UPLOAD_ERR_CANT_WRITE:
                return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.onDisk'));
        }

        if ($maxSize < $file['size']) {
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.bigger'));
        }
        if (!is_uploaded_file($file['tmp_name'])) {
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.invalid'));
        }

        $type = File::getMimeType($file['tmp_name']);
        if ($type == 'application/octet-stream') {
            $type = jFile::getMimeTypeFromFilename($file['name']);
        }
        if (!in_array($type, $allowedMimeType)) {
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.wrongType'));
        }

        // FIXME if JS sends a Blob object after the image resize, i'm not sure
        // we receive a name, so probably $file['name'] is empty. In this case,
        // we should generate one instead of getting $file['name']
        $directoryPath .= $file['name'];
        $webPath = jApp::urlBasePath().$uploadPath.rawurlencode($file['name']);

        if (move_uploaded_file($file['tmp_name'], $directoryPath)) {
            /** @var jResponseJson $rep */
            $rep = $this->getResponse('json');
            $rep->data = array(
                'url' => $webPath,
            );

            return $rep;
        }

        return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.save'));
    }
}
