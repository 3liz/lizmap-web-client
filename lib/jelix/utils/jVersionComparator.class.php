<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @copyright   2008-2018 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once (__DIR__.'/Version/Parser.php');
require_once (__DIR__.'/Version/Version.php');
require_once (__DIR__.'/Version/VersionComparator.php');

/**
 * class to compare version numbers. it supports the following keywords:
 * "pre", "-dev", "b", "beta", "a", "alpha".
 * It supports also the "*" wilcard. This wilcard must be the last part
 * of the version number
 * @since 1.2
 */
class jVersionComparator {

    /**
     * @param $version1
     * @param $version2
     * @return int 0 if equal, -1 if $version1 < $version2, 1 if $version1 > $version2
     * @throws Exception
     */
    static function compareVersion($version1, $version2) {
        $hasWildcard1 = (strpos($version1, '*') !== false);
        $hasWildcard2 = (strpos($version2, '*') !== false);
        if ($hasWildcard1 && $hasWildcard2) {
            $version1 = str_replace('*', '0', $version1);
            $hasWildcard1 = false;
        }
        if ($hasWildcard1) {
            $result = Jelix\Version\VersionComparator::compareVersionRange($version2, $version1);
            if ($result) {
                return 0;
            }
            $version1 = str_replace('*', '0', $version1);
        }
        else if ($hasWildcard2) {
            $result = Jelix\Version\VersionComparator::compareVersionRange($version1, $version2);
            if ($result) {
                return 0;
            }
            $version2 = str_replace('*', '0', $version2);
        }
        $v1 = Jelix\Version\Parser::parse($version1);
        $v2 = Jelix\Version\Parser::parse($version2);
        return Jelix\Version\VersionComparator::compare($v1,$v2);
    }

    static public function getBranchVersion($version) {
        $v1 = Jelix\Version\Parser::parse($version);
        return $v1->getBranchVersion();
    }

    static protected function normalizeVersionNumber(&$n)
    {
        $n[2] = strtolower($n[2]);
        if ($n[2] == 'pre' || $n[2] == 'dev' || $n[2] == '-dev') {
            $n[2] = '_';
            $n[3] = '';
            $n[4] = 'dev';
        }
        if (!isset($n[4]))
            $n[4] = '';
        else {
            $n[4] = strtolower($n[4]);
            if ($n[4] == 'pre' || $n[4] == '-dev') $n[4] = 'dev';
        }

        if ($n[2] == 'a') $n[2] = 'alpha';
        elseif ($n[2] == 'b') $n[2] = 'beta';
        elseif ($n[2] == '') $n[2] = 'zzz';
    }

    /**
     * create a string representing a version number in a manner that it could
     * be easily to be compared with an other serialized version. useful to
     * do comparison in a database for example.
     * @param string $version
     * @param int $starReplacement 1 if it should replace by max value, 0 for min value
     * @param int $pad
     * @return string the serialized version
     * @throws Exception
     */
    static public function serializeVersion($version, $starReplacement = 0, $pad=4) {
        $vers = explode('.', $version);
        $r = '/^([0-9]+)([a-zA-Z]*|pre|-?dev)([0-9]*)(pre|-?dev)?$/';

        $sver = '';

        foreach ($vers as $k=>$v) {
            if ($v == '*') {
                $k--;
                break;
            }

            $pm = preg_match($r, $v, $m);
            if ($pm) {
                self::normalizeVersionNumber($m);

                $m[1] = str_pad($m[1], ($k > 1 ? 10:3), '0', STR_PAD_LEFT);
                $m[2] = substr($m[2],0,1); // alpha/beta
                $m[3] = ($m[3] == '' ? '99': str_pad($m[3], 2, '0', STR_PAD_LEFT)); // alpha/beta number
                $m[4] = ($m[4] == 'dev'? 'd':'z');
                if ($k)
                    $sver.='.';
                $sver.= $m[1].$m[2].$m[3].$m[4];
            }
            else {
                throw new Exception ("version number '" . $version . "' cannot be serialized");
            }
        }
        for($i=$k+1; $i<$pad; $i++) {
            if ($i >0)
                $sver.='.';
            if ($starReplacement > 0)
                $sver.= ($i > 1 ? '9999999999':'999').'z99z';
            else
                $sver.= ($i > 1 ? '0000000000':'000').'a00a';
        }

        return $sver;
    }
}
