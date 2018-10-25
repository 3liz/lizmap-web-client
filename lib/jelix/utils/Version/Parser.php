<?php
/**
* @author      Laurent Jouanneau
* @copyright   2016 Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence     MIT
*/

namespace Jelix\Version;

class Parser
{
    private function __construct()
    {
    }

    /**
     * Is able to parse semantic version syntax or any other version syntax.
     *
     * @param string $version
     *
     * @return Version
     */
    public static function parse($version)
    {
        $vers = explode('+', $version, 2);
        $metadata = '';
        if (count($vers) > 1) {
            $metadata = $vers[1];
        }
        $vers = explode('-', $vers[0], 2);
        $stabilityVersion = array();
        if (count($vers) > 1) {
            $stabilityVersion = explode('.', $vers[1]);
        }
        $vers = explode('.', $vers[0]);
        foreach ($vers as $k => $number) {
            if (!is_numeric($number)) {
                if (preg_match('/^([0-9]+)(.*)$/', $number, $m)) {
                    $vers[$k] = $m[1];
                    $stabilityVersion = array_merge(
                                            array($m[2]),
                                            array_slice($vers, $k + 1),
                                            $stabilityVersion
                                        );
                    $vers = array_slice($vers, 0, $k + 1);
                    break;
                } elseif ($number == '*') {
                    $vers = array_slice($vers, 0, $k);
                    break;
                } else {
                    throw new \Exception('Bad version syntax');
                }
            } else {
                $vers[$k] = intval($number);
            }
        }
        $stab = array();
        foreach ($stabilityVersion as $k => $part) {
            if (preg_match('/^[a-z]+$/', $part)) {
                $stab[] = self::normalizeStability($part);
            } elseif (preg_match('/^[0-9]+$/', $part)) {
                $stab[] = $part;
            } else {
                $m = preg_split('/([0-9]+)/', $part, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
                foreach ($m as $p) {
                    $stab[] = self::normalizeStability($p);
                }
            }
        }

        return new Version($vers, $stab, $metadata);
    }

    protected static function normalizeStability($stab)
    {
        $stab = strtolower($stab);
        if ($stab == 'a') {
            $stab = 'alpha';
        }
        if ($stab == 'b') {
            $stab = 'beta';
        }

        return $stab;
    }
}
