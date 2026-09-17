<?php

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

use Jelix\FileUtilities\File;
use Random\Randomizer;

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
        $allowedMimeType = array('image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp');
        $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif', 'webp');
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

        $fileName = basename(str_replace('\\', '/', $file['name']));

        if (strpos($fileName, '.php') !== false || strpos($fileName, '.phar') !== false) {
            // if there is a ".php" or ".phar" extension into the filename, it could be executed by PHP
            // when nginx/apache and/or PHP are badly configured.
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.wrongType'));
        }

        // check mime type of the file
        $type = File::getMimeType($file['tmp_name']);
        if ($type == 'application/octet-stream') {
            $type = jFile::getMimeTypeFromFilename($fileName);
        }
        if (!in_array($type, $allowedMimeType)) {
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.wrongType'));
        }

        // check the filename extension
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExtensions)) {
            return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.wrongType'));
        }

        // check the file content, if it does not contain PHP code, in case of badly configured web and PHP servers allowing any file to be executed by PHP
        $handle = fopen($file['tmp_name'], 'rb');
        while (!feof($handle)) {
            $content = fread($handle, 2048);
            if (strpos($content, '<?php') !== false) {
                return $this->uploadError(jLocale::get('admin~admin.upload.image.error.file.wrongType'));
            }
            if (strlen($content) > 5) {
                // `<?php` may have been cut near the end of $content, so rewind a bit...
                fseek($handle, -4, SEEK_CUR);
            }
        }
        fclose($handle);

        // randomize the final filename to avoid collisions with existing files
        if (class_exists(Randomizer::class) && method_exists(Randomizer::class, 'getBytesFromString')) { // PHP 8.3+ only
            $randomizer = new Randomizer();
            $newFileName = $randomizer->getBytesFromString('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_0123456789', 24);
        } else {
            $newFileName = bin2hex(random_bytes(24));
        }
        $newFileName .= '.'.$ext;

        $directoryPath .= $newFileName;
        $webPath = jApp::urlBasePath().$uploadPath.rawurlencode($newFileName);

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
