<?php
/**
* @package    jelix
* @subpackage utils
* @author Laurent Jouanneau
* @contributor Christophe Thiriot
* @contributor Bastien Jaillot
* @contributor Loic Mathaud
* @contributor Olivier Demah (#733)
* @contributor Cedric (fix bug ticket 56)
* @contributor Julien Issler
* @copyright   2005-2012 Laurent Jouanneau, 2006 Christophe Thiriot, 2006 Loic Mathaud, 2008 Bastien Jaillot, 2008 Olivier Demah, 2009-2010 Julien Issler
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
 * A class helper to read or create files
 * @package    jelix
 * @subpackage utils
 */
class jFile {
    /**
    * Reads the content of a file.
    * @param string $filename the filename we're gonna read
    * @return string the content of the file. false if cannot read the file
    */
    public static function read ($filename){
        return @file_get_contents ($filename, false);
    }

    /**
    * Write a file to the disk.
    * This function is heavily based on the way smarty process its own files.
    * Is using a temporary file and then rename the file. We guess the file system will be smarter than us, avoiding a writing / reading
    *  while renaming the file.
    * This method comes from CopixFile class of Copix framework
    * @author     Gérald Croes
    * @copyright  2001-2005 CopixTeam
    * @link http://www.copix.org
    */
    public static function write ($file, $data, $chmod=null){
        $_dirname = dirname($file);

        //asking to create the directory structure if needed.
        self::createDir ($_dirname);

        if(!@is_writable($_dirname)) {
            // cache_dir not writable, see if it exists
            if(!@is_dir($_dirname)) {
                throw new jException('jelix~errors.file.directory.notexists', array ($_dirname));
            }
            throw new jException('jelix~errors.file.directory.notwritable', array ($file, $_dirname));
        }

        // write to tmp file, then rename it to avoid
        // file locking race condition
        $_tmp_file = tempnam($_dirname, 'wrt');

        if (!($fd = @fopen($_tmp_file, 'wb'))) {
            $_tmp_file = $_dirname . '/' . uniqid('wrt');
            if (!($fd = @fopen($_tmp_file, 'wb'))) {
                throw new jException('jelix~errors.file.write.error', array ($file, $_tmp_file));
            }
        }

        fwrite($fd, $data);
        fclose($fd);

        // Delete the file if it allready exists (this is needed on Win,
        // because it cannot overwrite files with rename()
        if (jApp::config()->isWindows && file_exists($file)) {
            unlink($file);
        }
        rename($_tmp_file, $file);
        if ($chmod) {
            chmod($file, $chmod);
        }
        else {
            chmod($file, jApp::config()->chmodFile);
        }

        return true;
    }

    /**
    * create a directory
    * It creates also all necessary parent directory
    * @param string $dir the path of the directory
    */
    public static function createDir ($dir, $chmod=null){
        // recursive feature on mkdir() is broken with PHP 5.0.4 for Windows
        // so should do own recursion
        if (!file_exists($dir)) {
            self::createDir(dirname($dir), $chmod);
            mkdir($dir, ($chmod?$chmod:jApp::config()->chmodDir));
            // php mkdir apply umask on the given mode, so we must to
            // do a chmod manually.
            chmod($dir, ($chmod?$chmod:jApp::config()->chmodDir));
        }
    }

    /**
     * Recursive function deleting a directory
     *
     * @param string $path The path of the directory to remove recursively
     * @param boolean $deleteParent If the path must be deleted too
     * @param array $except filenames and suffix of filename, for files to NOT delete
     * @return bool true if all the content has been removed
     * @throws jException
     * @since 1.0b1
     * @author Loic Mathaud
     */
    public static function removeDir($path, $deleteParent=true, $except=array()) {

        if($path == '' || $path == '/' || $path == DIRECTORY_SEPARATOR)
            throw new jException('jelix~errors.file.directory.cannot.remove.fs.root'); //see ticket #840

        if (!file_exists($path))
            return true;

        $allIsDeleted = true;

        $dir = new DirectoryIterator($path);
        foreach ($dir as $dirContent) {
            if (count($except)) {
                // test if the basename matches one of patterns
                $exception = false;
                foreach($except as $pattern) {
                    if ($pattern[0] == '*') { // for pattern like *.foo
                        if ($dirContent->getBasename() != $dirContent->getBasename(substr($pattern, 1))) {
                            $allIsDeleted = false;
                            $exception = true;
                            break;
                        }
                    }
                    else if ($pattern == $dirContent->getBasename()) {
                        $allIsDeleted = false;
                        $exception = true;
                        break;
                    }
                }
                if ($exception)
                    continue;
            }
            // file deletion
            if ($dirContent->isFile() || $dirContent->isLink()) {
                    unlink($dirContent->getPathName());
            } else {
                // recursive directory deletion
                if (!$dirContent->isDot() && $dirContent->isDir()) {
                    $removed = self::removeDir($dirContent->getPathName(), true, $except);
                    if (!$removed)
                        $allIsDeleted = false;
                }
            }
        }
        unset($dir); // see bug #733
        unset($dirContent);

        // removes the parent directory
        if ($deleteParent && $allIsDeleted) {
            rmdir($path);
        }
        return $allIsDeleted;
    }

    /**
     * get the MIME Type of a file
     *
     * @param string $file The full path of the file
     * @return string the MIME type of the file
     * @since 1.1.6
     */
    public static function getMimeType($file){
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $type = finfo_file($finfo, $file);
        finfo_close($finfo);
        return $type;
    }

    /**
     * get the MIME Type of a file, only with its name
     *
     * @param string $fileName the file name
     * @return string the MIME type of the file
     * @since 1.1.10
     */
    public static function getMimeTypeFromFilename($fileName){
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (array_key_exists($ext, self::$mimeTypes)) {
            return self::$mimeTypes[$ext];
        }
        else
            return 'application/octet-stream';
    }

    /**
     * parse a path replacing Jelix shortcuts parts (var:, temp:, www:, app:, lib:)
     *
     * @param string $path the path with parts to replace
     * @return string the path which is a system valid path
     */
    public static function parseJelixPath($path){
        return str_replace(
            array('lib:', 'app:', 'var:', 'temp:', 'www:'),
            array(LIB_PATH, jApp::appPath(), jApp::varPath(), jApp::tempPath(), jApp::wwwPath()),
            $path );
    }

    /**
     * replace a path with Jelix shortcuts parts (var:, temp:, www: app:, lib:)
     *
     * @param string $path the system valid path
     * @param string $beforeShortcut a string to be output before the Jelix shortcut
     * @param string $afterShortcut a string to be output after the Jelix shortcut
     * @return string the path with Jelix shortcuts parts
     */
    public static function unparseJelixPath($path, $beforeShortcut='', $afterShortcut=''){

        if (strpos($path, LIB_PATH) === 0) {
            $shortcutPath = LIB_PATH;
            $shortcut = 'lib:';
        }
        elseif (strpos($path, jApp::tempPath()) === 0) {
            $shortcutPath = jApp::tempPath();
            $shortcut = 'temp:';
        }
        elseif (strpos($path, jApp::wwwPath()) === 0) {
            $shortcutPath = jApp::wwwPath();
            $shortcut = 'www:';
        }
        elseif (strpos($path, jApp::varPath()) === 0) {
            $shortcutPath = jApp::varPath();
            $shortcut = 'var:';
        }
        elseif (strpos($path, jApp::appPath()) === 0) {
            $shortcutPath = jApp::appPath();
            $shortcut = 'app:';
        }
        else {
            $shortcutPath = dirname(jApp::appPath());
            $shortcut = 'app:';
            while ($shortcutPath != '.' && $shortcutPath != '') {
                $shortcut .= '../';
                if (strpos($path, $shortcutPath) === 0) {
                    break;
                }
                $shortcutPath = dirname($shortcutPath);
            }
            if ($shortcutPath =='.')
                $shortcutPath = '';
        }
        if ($shortcutPath != '') {
            $cut = ($shortcutPath[0] == '/'?0:1);
            $path = $beforeShortcut.$shortcut.$afterShortcut.substr($path, strlen($path)+$cut);
        }

        return $path;
    }


    protected static $mimeTypes = array(

        'txt' => 'text/plain',
        'htm' => 'text/html',
        'html' => 'text/html',
        'xhtml' => 'application/xhtml+xml',
        'xht' => 'application/xhtml+xml',
        'php' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'xml' => 'application/xml',
        'xslt' => 'application/xslt+xml',
        'xsl' => 'application/xml',
        'dtd' => 'application/xml-dtd',
        'atom'=>'application/atom+xml',
        'mathml'=>'application/mathml+xml',
        'rdf'=>'application/rdf+xml',
        'smi'=>'application/smil',
        'smil'=>'application/smil',
        'vxml'=>'application/voicexml+xml',
        'latex'=>'application/x-latex',
        'tcl'=>'application/x-tcl',
        'tex'=>'application/x-tex',
        'texinfo'=>'application/x-texinfo',
        'wrl'=>'model/vrml',
        'wrml'=>'model/vrml',
        'ics'=>'text/calendar',
        'ifb'=>'text/calendar',
        'sgml'=>'text/sgml',
        'htc'=>'text/x-component',

        // images
        'png' => 'image/png',
        'jpe' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'jpg' => 'image/jpeg',
        'gif' => 'image/gif',
        'bmp' => 'image/bmp',
        'ico' => 'image/x-icon',
        'tiff' => 'image/tiff',
        'tif' => 'image/tiff',
        'svg' => 'image/svg+xml',
        'svgz' => 'image/svg+xml',
        'djvu' => 'image/vnd.djvu',
        'djv'  => 'image/vnd.djvu',

        // archives
        'zip' => 'application/zip',
        'rar' => 'application/x-rar-compressed',
        'exe' => 'application/x-msdownload',
        'msi' => 'application/x-msdownload',
        'cab' => 'application/vnd.ms-cab-compressed',
        'tar' => 'application/x-tar',
        'gz'  => 'application/x-gzip',
        'tgz'  => 'application/x-gzip',

        // audio/video
        'mp2' => 'audio/mpeg',
        'mp3' => 'audio/mpeg',
        'qt' => 'video/quicktime',
        'mov' => 'video/quicktime',
        'mpeg' => 'video/mpeg',
        'mpg' => 'video/mpeg',
        'mpe' => 'video/mpeg',
        'wav' => 'audio/wav',
        'aiff' => 'audio/aiff',
        'aif' => 'audio/aiff',
        'avi' => 'video/msvideo',
        'wmv' => 'video/x-ms-wmv',
        'ogg' => 'application/ogg',
        'flv' => 'video/x-flv',
        'dvi' => 'application/x-dvi',
        'au'=> 'audio/basic',
        'snd'=> 'audio/basic',
        'mid' => 'audio/midi',
        'midi' => 'audio/midi',
        'm3u' => 'audio/x-mpegurl',
        'm4u' => 'video/vnd.mpegurl',
        'ram' => 'audio/x-pn-realaudio',
        'ra' => 'audio/x-pn-realaudio',
        'rm' => 'application/vnd.rn-realmedia',

        // adobe
        'pdf' => 'application/pdf',
        'psd' => 'image/vnd.adobe.photoshop',
        'ai' => 'application/postscript',
        'eps' => 'application/postscript',
        'ps' => 'application/postscript',
        'swf' => 'application/x-shockwave-flash',

        // ms office
        'doc' => 'application/msword',
        'docx' => 'application/msword',
        'rtf' => 'application/rtf',
        'xls' => 'application/vnd.ms-excel',
        'xlm' => 'application/vnd.ms-excel',
        'xla' => 'application/vnd.ms-excel',
        'xld' => 'application/vnd.ms-excel',
        'xlt' => 'application/vnd.ms-excel',
        'xlc' => 'application/vnd.ms-excel',
        'xlw' => 'application/vnd.ms-excel',
        'xll' => 'application/vnd.ms-excel',
        'ppt' => 'application/vnd.ms-powerpoint',
        'pps' => 'application/vnd.ms-powerpoint',

        // open office
        'odt' => 'application/vnd.oasis.opendocument.text',
        'ods' => 'application/vnd.oasis.opendocument.spreadsheet',
    );
}
