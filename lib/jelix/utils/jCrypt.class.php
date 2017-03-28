<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Antoine Detante
* @contributor Laurent Jouanneau
* @contributor Hadrien Lanneau <hadrien at over-blog dot com>
* @copyright   2007 Antoine Detante, 2009-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
**/

/** 
* Static methods help to encrypt and decrypt string. mCrypt is used if it is
* installed, else a basic algorithm is used.
* @package     jelix
* @subpackage  utils
* @deprecated
*/
class jCrypt {

    /**
     * Decrypt a string with a specific key.
     *
     * Use mCrypt if it is installed, else a basic algorithm.
     * @param string $string the string to decrypt
     * @param string $key the key used to decrypt. If not given, use the key indicated in the configuration
     * @return string decrypted string
     */
    public static function decrypt($string,$key=''){
        $decrypted=null;
        $decodedString=base64_decode($string);
        // Check if mcrypt is installed, and if WAKE algo exists
        if(function_exists("mcrypt_generic")&&mcrypt_module_self_test(MCRYPT_WAKE))
            $decrypted=jCrypt::mcryptDecrypt($decodedString,$key);
        else
            $decrypted=jCrypt::simpleCrypt($decodedString,$key);
        return $decrypted;
    }

    /**
     * Encrypt a string with a specific key
     *
     * Use mCrypt if it is installed, else a basic algorithm.
     * @param string $string the string to encrypt
     * @param string $key the key used to encrypt. If not given, use the key indicated in the configuration
     * @return string encrypted string
     */
    public static function encrypt($string,$key=''){
        $encrypted=null;
        // Check if mcrypt is installed, and if WAKE algo exists
        if(function_exists("mcrypt_generic")&&mcrypt_module_self_test(MCRYPT_WAKE))
            $encrypted=jCrypt::mcryptEncrypt($string,$key);
        else
            $encrypted=jCrypt::simpleCrypt($string,$key);
        return base64_encode($encrypted);
    }

    /**
     * Encrypt a string with mCrypt.
     * @param string $string the string to encrypt
     * @param string $key the key used to encrypt string. If not given, use
     *      the key indicated in the configuration
     * @return string encrypted string
     * @throws jException
     */
    public static function mcryptEncrypt($string, $key='') {
        if ($key=='')
            throw new jException('jelix~auth.error.key.empty');
        if (strlen($key)<15)
            throw new jException('jelix~auth.error.key.tooshort',15);
        $td = mcrypt_module_open(MCRYPT_WAKE, '', MCRYPT_MODE_STREAM, '');
        $ks = mcrypt_enc_get_key_size($td);
        $key = substr($key, 0, $ks);
        mcrypt_generic_init($td, $key, null);
        $encrypted = mcrypt_generic($td, $string);
        mcrypt_generic_deinit($td);
        mcrypt_module_close($td);
        return $encrypted;
    }

    /**
     * Decrypt a string with mCrypt.
     * @param string $string the string to decrypt
     * @param string $key the key used to decrypt string. If not given, use
     * the key indicated in the configuration
     * @return string decrypted string
     * @throws jException
     */
    public static function mcryptDecrypt($string,$key=''){
        if($key=='')
            throw new jException('jelix~auth.error.key.empty');
        $td = mcrypt_module_open(MCRYPT_WAKE, '', MCRYPT_MODE_STREAM, '');
        $ks = mcrypt_enc_get_key_size($td);
        $key = substr($key, 0, $ks);
        mcrypt_generic_init($td, $key, null);
        $decrypted = mdecrypt_generic($td, $string);
        mcrypt_generic_deinit($td);
        mcrypt_module_close($td);
        return $decrypted;
    }

    /**
     * Basic encrypt/decrypt algorithm.
     * @author halojoy
     * @see http://www.phpbuilder.com/board/showthread.php?t=10326721
     * @param string $str the string to encrypt/decrypt
     * @param string $key the key used to encrypt/decrypt string (must be >= 8 characters).
     * If not given, use the key indicated in the configuration
     * @return string encrypted/decrypted string
     * @throws jException
     */
    protected static function simpleCrypt($str,$key=''){
        if($key=='')
            throw new jException('jelix~auth.error.key.empty');
        $key=str_replace(chr(32),'',$key);
        if(strlen($key)<8)
            throw new jException('jelix~auth.error.key.tooshort',8);
        $kl=strlen($key)<32?strlen($key):32;
        $k=array();
        for($i=0;$i<$kl;$i++){
            $k[$i]=ord($key[$i])&0x1F;
        }
        $j=0;
        for($i=0;$i<strlen($str);$i++){
            $e=ord($str[$i]);
            $str[$i]=$e&0xE0?chr($e^$k[$j]):chr($e);
            $j++;$j=$j==$kl?0:$j;
        }
        return $str;
    }

    /**
     * Get default key in config
     * @return string
     * @throws jException
     * @author Hadrien Lanneau <hadrien at over-blog dot com>
     */
    private static function _getDefaultKey() {
        $conf = jApp::config()->jcrypt;
        if (isset($conf['defaultkey']) && $conf['defaultkey'] !='') {
            return $conf['defaultkey'];
        }
        throw new jException('jelix~auth.error.key.empty');
    }
}

