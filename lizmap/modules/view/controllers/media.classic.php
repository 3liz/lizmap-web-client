<?php

/**
 * Service to provide media (image, documents).
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

use Jelix\FileUtilities\File;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\RemoteStorageRequest;

class mediaCtrl extends jController
{
    /**
     * Check if cache can be used because it is impossible
     * to use cache on other request type that GET or HEAD.
     *
     * @return bool
     */
    protected function canBeCached()
    {
        return in_array($_SERVER['REQUEST_METHOD'], array('GET', 'HEAD'));
    }

    /**
     * @param jResponse $resp
     * @param string    $etag
     *
     * @return jResponse the response updated
     */
    protected function setEtagCacheHeaders($resp, $etag)
    {
        if ($this->canBeCached()) {
            $resp->addHttpHeader('ETag', $etag);
            $resp->addHttpHeader('Cache-Control', 'no-cache');
        }

        return $resp;
    }

    protected function defaultIllustrationPath()
    {
        // default illustration
        $themePath = jApp::wwwPath().'themes/'.jApp::config()->theme.'/';

        return $themePath.'css/img/250x250_mappemonde.jpg';
    }

    protected function defaultIllustrationEtag()
    {
        if ($this->canBeCached()) {
            $etag = 'default-illustration-';
            $etag .= filemtime($this->defaultIllustrationPath());

            return sha1($etag);
        }

        return '';
    }

    /**
     * Returns error.
     *
     * @param jResponseRedirect $message
     */
    protected function error($message)
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->action = 'view~default:error';
        jMessage::add($message, 'error');

        return $rep;
    }

    /**
     * Return 404.
     *
     * @param jResponseJson $message
     */
    protected function error404($message)
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array('error' => '404 not found (wrong action)', 'message' => $message);
        $rep->setHttpStatus('404', 'Not Found');

        return $rep;
        /*
          $rep = $this->getResponse('text');
          $rep->content = $message  ;
          $rep->setHttpStatus('404', 'Not Found');
          return $rep;
         */
    }

    /**
     * Return 403.
     *
     * @param jResponseJson $message
     */
    protected function error403($message)
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array('error' => '403 forbidden (you\'re not allowed to access to this media)', 'message' => $message);
        $rep->setHttpStatus('403', 'Forbidden');

        return $rep;
    }

    /**
     * Return 401.
     *
     * @param jResponseJson $message
     */
    protected function error401($message)
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array('error' => '401 Unauthorized (authentication is required)', 'message' => $message);
        $rep->setHttpStatus('401', 'Unauthorized');

        return $rep;
    }

    /**
     * Get a media file (image, html, csv, pdf, etc.) store in the repository.
     * Used to display media in the popup, via the information icon, etc.
     *
     * @return jResponseBinary|jResponseJson object The media
     */
    public function getMedia()
    {
        // Get repository data
        $repository = $this->param('repository');

        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            return $this->error404('');
        }
        if (!jAcl2::check('lizmap.repositories.view', $lrep->getKey())) {
            return $this->error403(jLocale::get('view~default.repository.access.denied'));
        }

        // Get the project
        $project = $this->param('project');

        // Get the project
        try {
            $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
            if (!$lproj) {
                return $this->error404('The lizmap project '.strtoupper($project).' does not exist !');
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');

            return $this->error404('The lizmap project '.strtoupper($project).' does not exist !');
        }

        // Redirect if no right to access the project
        if (!$lproj->checkAcl()) {
            return $this->error403(jLocale::get('view~default.repository.access.denied'));
        }

        $finalPath = null;
        $isWebDavResource = false;
        $path = $this->param('path');

        // check if a remote file is requested from WebDAV Storage
        if (strpos($path, RemoteStorageRequest::$davUrlRootPrefix) === 0) {
            // replace the path with the webdav url
            $profile = RemoteStorageRequest::getProfile('webdav');
            if ($profile) {
                $webdavPath = str_replace(RemoteStorageRequest::$davUrlRootPrefix, $profile['baseUri'], $path);
                // assumes that last part of the url is the filename
                $urlPart = explode('/', $webdavPath);
                $fileName = array_pop($urlPart);
                $url = implode('/', $urlPart).'/';

                $tempFileUrl = RemoteStorageRequest::getRemoteFile($url, $fileName);
                if (!is_file($tempFileUrl)) {
                    $content = 'No media file in the specified path: '.$path;

                    return $this->error404($content);
                }
                $isWebDavResource = true;
                $finalPath = $tempFileUrl;
            } else {
                return $this->error404('Unable to get media');
            }
        } else {
            // Get the file
            $repositoryPath = realpath($lrep->getPath());
            $abspath = realpath($repositoryPath.'/'.$path);
            $n_repositoryPath = str_replace('\\', '/', $repositoryPath);
            $n_abspath = $n_repositoryPath.'/'.trim($path, '/');
            // manually canonize path to authorize symlink
            $n_abspath = explode('/', $n_abspath);
            $n_keys = array_keys($n_abspath, '..');
            foreach ($n_keys as $keypos => $key) {
                array_splice($n_abspath, $key - ($keypos * 2 + 1), 2);
            }
            $n_abspath = implode('/', $n_abspath);
            $n_abspath = str_replace('./', '', $n_abspath);

            $ok = true;

            // Only allow files within the repository for safety reasons
            // and in the media folder
            // accept ../media folder to centralize medias
            $repex = explode('/', $n_repositoryPath);
            array_pop($repex);
            $reptest = implode('/', $repex);
            if (!preg_match('#^'.$n_repositoryPath.'(/)?media/#', $n_abspath)
               && !preg_match('#^'.$reptest.'(/)?media/#', $n_abspath)
            ) {
                $ok = false;
            }
            // Check if file exists
            if ($ok && !is_file($abspath)) {
                $ok = false;
            }
            // Redirect if errors
            if (!$ok) {
                $content = 'No media file in the specified path: '.$path;
                if (is_link($repositoryPath.'/'.$path)) {
                    $content .= ' '.readlink($repositoryPath.'/'.$path);
                }

                return $this->error404($content);
            }
            $finalPath = $abspath;
        }

        // Prepare the file to return
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->doDownload = false;
        $rep->fileName = $finalPath;

        // Get the name of the file
        $path_parts = pathinfo($finalPath);
        // If the basename of the path starts with a dot, the following characters are interpreted as extension, and the filename is empty
        if ($path_parts['filename'] !== '') {
            $rep->outputFileName = $path_parts['filename'].'.'.$path_parts['extension'];
        } else {
            $rep->outputFileName = $path_parts['basename'];
        }

        if ($isWebDavResource) {
            // remove uuid from filename
            $name = $rep->outputFileName;
            $nameEx = explode('-', $name);
            array_shift($nameEx);
            $name = implode('-', $nameEx);
            $rep->outputFileName = $name;
        }
        // Get the mime type
        $mime = File::getMimeType($finalPath);
        if ($mime == 'text/plain' || $mime == ''
            || $mime == 'application/octet-stream'
            || in_array(strtolower($path_parts['extension']), array('svg', 'svgz'))
            || ($mime == 'text/html'
                && !in_array($path_parts['extension'], array('html', 'htm')))
        ) {
            $mime = jFile::getMimeTypeFromFilename($finalPath);
        }

        // Handle JavaScript files (.js) & modules (.mjs)
        // as File::getMimeType() returns "text/x-java" for those files
        if (in_array(strtolower($path_parts['extension']), array('js', 'mjs'))) {
            $mime = 'application/javascript';
        }

        $rep->mimeType = $mime;

        $mimeTextArray = array('text/html', 'text/text');
        if (in_array($mime, $mimeTextArray)) {
            $content = jFile::read($finalPath);
            $rep->fileName = '';
            $rep->content = $content;
        }

        $rep->setExpires('+1 days');

        if ($isWebDavResource) {
            $rep->deleteFileAfterSending = true;
        }

        return $rep;
    }

    /**
     * Get illustration image for a specified project.
     *
     * @return jResponseBinary object The image for this project
     */
    public function illustration()
    {
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->doDownload = false;

        // Get repository data
        $repository = $this->param('repository');

        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            return $this->error404('');
        }

        if (!jAcl2::check('lizmap.repositories.view', $lrep->getKey())) {
            return $this->error403(jLocale::get('view~default.repository.access.denied'));
        }

        // Get the project
        $project = $this->param('project');

        // Get the project
        try {
            $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
            if (!$lproj) {
                return $this->error404('The lizmap project '.strtoupper($project).' does not exist !');
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');

            return $this->error404('The lizmap project '.strtoupper($project).' does not exist !');
        }

        // Redirect if no right to access the project
        if (!$lproj->checkAcl()) {
            return $this->error403(jLocale::get('view~default.repository.access.denied'));
        }

        // Get image type
        $type = $this->param('type');

        $imageTypes = array('jpg', 'jpeg', 'png', 'gif', 'webp', 'avif');
        $imageTypes = array_merge($imageTypes, array_map('strtoupper', $imageTypes));

        // If no 'type' param, look for illustration in directory
        if (!$type) {
            $imageFound = false;
            foreach ($imageTypes as $imageType) {
                if (file_exists($lrep->getPath().$project.'.qgs.'.$imageType)) {
                    $type = $imageType;
                    $imageFound = true;

                    break;
                }
            }

            // return default illustration if none has been found
            if (!$imageFound) {
                return $this->defaultIllustration();
            }
        }

        if (!in_array($type, $imageTypes)) {
            return $this->error404('Image type is not correct.');
        }

        // Get project illustration if existing
        if (!file_exists($lrep->getPath().$project.'.qgs.'.$type)) {
            return $this->error404('Image does not exist.');
        }

        $rep->fileName = $lrep->getPath().$project.'.qgs.'.$type;
        $rep->outputFileName = $repository.'_'.$project.'.'.$type;
        $rep->mimeType = 'image/'.$type;

        // Get the mime type
        $mime = File::getMimeType($rep->fileName);
        if ($mime == 'text/plain' || $mime == '') {
            $mime = jFile::getMimeTypeFromFilename($rep->fileName);
        }
        $rep->mimeType = $mime;

        // Etag header and cache control
        $etag = '';
        if ($this->canBeCached()) {
            $etag = 'illustration';
            $etag .= '-'.$lrep->getKey().'~'.$lproj->getKey();
            $etag .= '-'.$type;
            $etag .= '-'.filemtime($rep->fileName);
            $etag = sha1($etag);
        }

        if ($etag !== '' && $rep->isValidCache(null, $etag)) {
            return $rep;
        }

        $rep->setExpires('+1 days');
        if ($etag !== '') {
            $this->setEtagCacheHeaders($rep, $etag);
        }

        return $rep;
    }

    /**
     * Get default illustration image for the Lizmap instance.
     *
     * @return jResponseBinary object The image for this project
     */
    public function defaultIllustration()
    {
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->doDownload = false;

        // default illustration
        $rep->fileName = $this->defaultIllustrationPath();
        $rep->outputFileName = 'lizmap_mappemonde.jpg';
        $rep->mimeType = 'image/jpeg';
        $etag = $this->defaultIllustrationEtag();
        if ($etag !== '' && $rep->isValidCache(null, $etag)) {
            return $rep;
        }

        $rep->setExpires('+7 days');
        if ($etag !== '') {
            $this->setEtagCacheHeaders($rep, $etag);
        }

        return $rep;
    }

    /**
     * Get a CSS file stored in the repository in a "media/themes" folder.
     * Url to images are replaced by getMedia URL.
     *
     * @return jResponseBinary|jResponseText object The transformed CSS file
     */
    public function getCssFile()
    {
        // Get repository data
        $repository = $this->param('repository');

        $lrep = lizmap::getRepository($repository);

        if (!$lrep or !jAcl2::check('lizmap.repositories.view', $lrep->getKey())) {
            $this->error(jLocale::get('view~default.repository.access.denied'));
        }

        // Get the project
        $project = $this->param('project');

        // Get the project
        $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
        if (!$lproj) {
            $this->error('The lizmap project '.strtoupper($project).' does not exist !');
        }

        // Redirect if no right to access the project
        if (!$lproj->checkAcl()) {
            return $this->error(jLocale::get('view~default.repository.access.denied'));
        }

        // Get the file
        $path = $this->param('path');
        $repositoryPath = realpath($lrep->getPath());
        $abspath = realpath($repositoryPath.'/'.$path);
        $n_repositoryPath = str_replace('\\', '/', $repositoryPath);
        $n_abspath = str_replace('\\', '/', $abspath);

        $ok = true;
        // Only allow files within the repository for safety reasons
        // and in the media/themes/ folder
        // accept ../media folder for CSS applying to all repositories in a same directory
        $repex = explode('/', $n_repositoryPath);
        array_pop($repex);
        $reptest = implode('/', $repex);
        if (!preg_match('#^'.$n_repositoryPath.'(/)?media/themes/#', $n_abspath)
            && !preg_match('#^'.$reptest.'(/)?media/themes/#', $n_abspath)
            && !preg_match('#^'.$n_repositoryPath.'(/)?media/js/#', $n_abspath)
            && !preg_match('#^'.$reptest.'(/)?media/js/#', $n_abspath)
        ) {
            $ok = false;
        }

        // Check if file exists
        if ($ok and !file_exists($abspath)) {
            $ok = false;
        }

        // Check if file is CSS
        $path_parts = pathinfo($abspath);
        if (!isset($path_parts['extension'])
            || strtolower($path_parts['extension']) != 'css'
        ) {
            $ok = false;
        }

        // Redirect if errors
        if (!$ok) {
            $content = 'No CSS file in the specified path';

            /** @var jResponseText $rep */
            $rep = $this->getResponse('text');
            $rep->content = $content;

            return $rep;
        }

        // Prepare the file to return
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->doDownload = false;

        // Get the name of the file
        $name = $path_parts['basename'].'.'.$path_parts['extension'];
        $rep->outputFileName = $name;

        // Mime type
        $rep->mimeType = 'text/css';

        // Read content from file
        $content = jFile::read($abspath);

        // Replace relative images URL with getMedia URL
        $newPath = preg_replace('#'.$path_parts['basename'].'$#', '', $path);
        $baseUrl = jUrl::get(
            'view~media:getMedia',
            array(
                'repository' => $lrep->getKey(),
                'project' => $project,
                'path' => $newPath,
            )
        );
        $pattern = 'url\((.+)\)';
        $replacement = 'url('.$baseUrl.'/\1)';
        $content = preg_replace("#{$pattern}#", $replacement, $content);
        $content = str_replace('"', '', $content);
        $rep->content = $content;

        $rep->setExpires('+1 days');

        return $rep;
    }

    /**
     * Get default Lizmap theme as a ZIP file.
     *
     * @return jResponseZip file containing the default theme
     */
    public function getDefaultTheme()
    {
        /** @var jResponseZip $rep */
        $rep = $this->getResponse('zip');
        $rep->zipFilename = 'lizmapWebClient_default_theme.zip';
        $rep->content->addDir(jApp::wwwPath().'/themes/default/', 'default', true);

        return $rep;
    }

    /**
     * Get logo or background image defined in lizmap admin theme configuration.
     *
     * @return jResponseBinary|jResponseJson configured theme logo
     */
    public function themeImage()
    {
        $key = $this->param('key', 'headerLogo');
        if ($key != 'headerLogo' and $key != 'headerBackgroundImage') {
            $key = 'headerLogo';
        }

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->doDownload = false;

        $theme = lizmap::getTheme();
        $imgPath = jApp::varPath('lizmap-theme-config/').$theme->{$key};

        if (is_file($imgPath)) {
            $mime = File::getMimeType($imgPath);
            if ($mime == 'text/plain' || $mime == '') {
                $mime = jFile::getMimeTypeFromFilename($imgPath);
            }
            $rep->mimeType = $mime;
            $rep->fileName = $imgPath;
        } else {
            if ($key == 'headerLogo') {
                $rep->fileName = realpath(jApp::wwwPath('/themes/default/css/img/logo.png'));
                $rep->mimeType = 'image/png';
                $rep->outputFileName = 'logo.png';
            } else {
                return $this->error404('The image file  does not exist !');
            }
        }
        $rep->setExpires('+1 days');

        return $rep;
    }
}
