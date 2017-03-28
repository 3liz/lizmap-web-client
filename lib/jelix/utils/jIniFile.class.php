<?php
/**
* @package    jelix
* @subpackage utils
* @author     Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright  2006 Loic Mathaud, 2008-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* utility class to read and write an ini file
* @package    jelix
* @subpackage utils
* @since 1.0b1
*/
class jIniFile {

    /**
     * read an ini file
     * @param string $filename the path and the name of the file to read
     * @return array|false the content of the file or false if the ini format is invalid
     */
    public static function read($filename) {
        if ( file_exists ($filename) ) {
            return parse_ini_file($filename, true);
        } else {
            return false;
        }
    }

    /**
     * write some data in an ini file
     * the data array should follow the same structure returned by
     * the read method (or parse_ini_file)
     * @param array $array the content of an ini file
     * @param string $filename the path and the name of the file use to store the content
     * @param string $header some content to insert at the begining of the file
     * @param integer $chmod
     * @throws Exception
     * @throws jException
     */
    public static function write($array, $filename, $header='', $chmod=null) {
        $result='';
        foreach ($array as $k => $v) {
            if (is_array($v)) {
                $result.='['.$k."]\n";
                foreach($v as $k2 => $v2){
                    $result .= self::_iniValue($k2,$v2);
                }
            } else {
                // we put simple values at the beginning of the file.
                $result = self::_iniValue($k,$v).$result;
            }
        }

        if ($f = @fopen($filename, 'wb')) {
            fwrite($f, $header.$result);
            fclose($f);
            if ($chmod) {
                chmod($f, $chmod);
            }
        } else {
            // jIniFile is used by the configs compiler. There is no configuration
            // object in that case. we need to generate an error without using jLocale
            if(jApp::config()){
                throw new jException('jelix~errors.inifile.write.error', array ($filename));
            }else{
                throw new Exception('(24)Error while writing ini file '.$filename);
            }
        }
    }

    /**
     * format a value to store in a ini file
     * @param string $value the value
     * @return string the formated value
     */
    static private function _iniValue($key, $value){
        if(is_array($value)) {
            $res = '';
            foreach($value as $v)
                $res.=self::_iniValue($key.'[]', $v);
            return $res;
        } else if ($value == ''
                  || is_numeric($value)
                  || (preg_match("/^[\w-.]*$/", $value) && strpos("\n",$value) === false)) {
            return $key.'='.$value."\n";
        } else if($value === false) {
            return $key."=0\n";
        } else if($value === true) {
            return $key."=1\n";
        } else {
            return $key.'="'.$value."\"\n";
        }
    }
}


