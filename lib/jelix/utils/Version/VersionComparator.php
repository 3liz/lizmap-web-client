<?php
/**
* @author      Laurent Jouanneau
* @copyright   2008-2017 Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence     MIT
*/

namespace Jelix\Version;

/**
 * class to compare version numbers. it supports the following keywords:
 * "pre", "-dev", "b", "beta", "a", "alpha".
 * It supports also the "*" wilcard. This wilcard must be the last part
 * of the version number.
 */
class VersionComparator
{
    /**
     * Compare two version objects.
     *
     * @return int
     *             - 0 if versions are equals
     *             - -1 if $version1 is lower than $version2
     *             - 1 if $version1 is higher than $version2
     */
    public static function compare(Version $version1, Version $version2)
    {
        if ($version1->toString() == $version2->toString()) {
            return 0;
        }

        $v1 = $version1->getVersionArray();
        $v2 = $version2->getVersionArray();

        if (count($v1) > count($v2)) {
            $v2 = array_pad($v2, count($v1), 0);
        } elseif (count($v1) < count($v2)) {
            $v1 = array_pad($v1, count($v2), 0);
        }

        // version comparison
        foreach ($v1 as $k => $v) {
            if ($v == $v2[$k]) {
                continue;
            }
            if ($v < $v2[$k]) {
                return -1;
            } else {
                return 1;
            }
        }

        // stability comparison
        $s1 = $version1->getStabilityVersion();
        $s2 = $version2->getStabilityVersion();
        if (count($s1) > count($s2)) {
            $s2 = array_pad($s2, count($s1), '');
        } elseif (count($s1) < count($s2)) {
            $s1 = array_pad($s1, count($s2), '');
        }

        foreach ($s1 as $k => $v) {
            if ($v == '*' || $s2[$k] == '*') {
                return 0;
            }
            if ($v === $s2[$k]) {
                continue;
            }
            if ($v === '') {
                if (!is_numeric($s2[$k])) {
                    return 1;
                } else {
                    $v = '0';
                }
            } elseif ($s2[$k] === '') {
                if (!is_numeric($v)) {
                    return -1;
                } else {
                    $s2[$k] = '0';
                }
            }
            if (is_numeric($v)) {
                if (is_numeric($s2[$k])) {
                    $v1 = intval($v);
                    $v2 = intval($s2[$k]);
                    if ($v1 == $v2) {
                        continue;
                    }
                    if ($v1 < $v2) {
                        return -1;
                    }
                    return 1;
                } else {
                    return 1;
                }
            } elseif (is_numeric($s2[$k])) {
                return -1;
            } else {
                if ($v == 'dev' || $v == 'pre') {
                    $v = 'aaaaaaaaaa';
                }
                $v2 = $s2[$k];
                if ($v2 == 'dev' || $v2 == 'pre') {
                    $v2 = 'aaaaaaaaaa';
                }
                $r = strcmp($v, $v2);
                if ($r > 0) {
                    return 1;
                } elseif ($r < 0) {
                    return -1;
                }
            }
        }

        return 0;
    }

    /**
     * Compare two version as string.
     *
     * It supports wildcard in one of the version
     *
     * @param string $version1
     * @param string $version2
     *
     * @return int 0 if equal, -1 if $version1 < $version2, 1 if $version1 > $version2
     */
    public static function compareVersion($version1, $version2)
    {
        if ($version1 == $version2) {
            return 0;
        }

        $v1 = Parser::parse($version1);
        $v2 = Parser::parse($version2);

        return self::compare($v1, $v2);
    }

    protected static function normalizeVersionNumber(&$n)
    {
        $n[2] = strtolower($n[2]);
        if ($n[2] == 'pre' || $n[2] == 'dev' || $n[2] == '-dev') {
            $n[2] = '_';
            $n[3] = '';
            $n[4] = 'dev';
        }
        if (!isset($n[4])) {
            $n[4] = '';
        } else {
            $n[4] = strtolower($n[4]);
            if ($n[4] == 'pre' || $n[4] == '-dev') {
                $n[4] = 'dev';
            }
        }

        if ($n[2] == 'a') {
            $n[2] = 'alpha';
        } elseif ($n[2] == 'b') {
            $n[2] = 'beta';
        } elseif ($n[2] == '') {
            $n[2] = 'zzz';
        }
    }

    /**
     * create a string representing a version number in a manner that it could
     * be easily to be compared with an other serialized version. useful to
     * do comparison in a database for example.
     *
     * It doesn't support all version notation. Use serializeVersion2 instead.
     *
     * @param int $starReplacement 1 if it should replace by max value, 0 for min value
     * @deprecated
     */
    public static function serializeVersion($version, $starReplacement = 0, $pad = 4)
    {
        $vers = explode('.', $version);
        $r = '/^([0-9]+)([a-zA-Z]*|pre|-?dev)([0-9]*)(pre|-?dev)?$/';
        $sver = '';

        foreach ($vers as $k => $v) {
            if ($v == '*') {
                --$k;
                break;
            }

            $pm = preg_match($r, $v, $m);
            if ($pm) {
                self::normalizeVersionNumber($m);

                $m[1] = str_pad($m[1], ($k > 1 ? 10 : 3), '0', STR_PAD_LEFT);
                $m[2] = substr($m[2], 0, 1); // alpha/beta
                $m[3] = ($m[3] == '' ? '99' : str_pad($m[3], 2, '0', STR_PAD_LEFT)); // alpha/beta number
                $m[4] = ($m[4] == 'dev' ? 'd' : 'z');
                if ($k) {
                    $sver .= '.';
                }
                $sver .= $m[1].$m[2].$m[3].$m[4];
            } else {
                throw new \Exception('bad version number');
            }
        }
        for ($i = $k + 1; $i < $pad; ++$i) {
            if ($i > 0) {
                $sver .= '.';
            }
            if ($starReplacement > 0) {
                $sver .= ($i > 1 ? '9999999999' : '999').'z99z';
            } else {
                $sver .= ($i > 1 ? '0000000000' : '000').'a00a';
            }
        }

        return $sver;
    }

    /**
     * create a string representing a version number in a manner that it could
     * be easily to be compared with an other serialized version. useful to
     * do comparison in a database for example.
     *
     * @param int $starReplacement 1 if it should replace '*' by max value, 0 for min value
     */
    public static function serializeVersion2($version, $starReplacement = 0, $maxpad = 10)
    {
        $version = preg_replace("/([0-9])([a-z])/i", "\\1-\\2", $version);
        $version = preg_replace("/([a-z])([0-9])/i", "\\1.\\2", $version);
        $extensions = explode('-', $version, 3);
        $serial = '';
        $extensions = array_pad($extensions, 3, '0');
        foreach ($extensions as $ext) {
            $vers = explode('.', $ext);
            $vers = array_pad($vers, 5, "0");

            foreach($vers as $k => $v) {
                $pad = ($k > 1 ? $maxpad : 3);
                if ($v == '*') {
                    if ($starReplacement > 0) {
                        $vers[$k] = ($k > 1 ? 'z9999999999' : 'z999');
                    } else {
                        $vers[$k] = ($k > 1 ? 'z0000000000' : 'z000');
                    }
                }
                else if (is_numeric($v)) {
                    $vers[$k] = 'z'.str_pad($v, $pad, '0', STR_PAD_LEFT);
                }
                else if ($v == 'dev' || $v == 'pre') {
                    $vers[$k] = '_'.str_pad('', $pad, '0');
                }
                else {
                    $vers[$k] = strtolower(substr($v, 0, 1)).str_repeat('0', $pad);
                }
            }
            if ($serial) {
                $serial .= '-';
            }
            $serial .= implode('', $vers);
        }
        return $serial;
    }

    /**
     * @param string $version a version number
     * @param string $range   a version expression respecting Composer range syntax
     *
     * @return bool true if the given version match the given range
     */
    public static function compareVersionRange($version, $range)
    {
        if ($version == $range || $range == '' || $version == '') {
            return true;
        }

        $expression = self::compileRange($range);
        $v1 = Parser::parse($version);

        return $expression->compare($v1);
    }

    /**
     * @return VersionRangeOperatorInterface
     */
    protected static function compileRange($range)
    {
        $or = preg_split('/\s*\|\|\s*/', $range, 2);
        if (count($or) > 1) {
            $left = self::compileRange($or[0]);
            $right = self::compileRange($or[1]);

            return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_OR, $left, $right);
        }
        $or = preg_split('/\s*\|\s*/', $range, 2);
        if (count($or) > 1) {
            $left = self::compileRange($or[0]);
            $right = self::compileRange($or[1]);

            return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_OR, $left, $right);
        }
        $and = preg_split("/\\s*,\\s*/", $range, 2);
        if (count($and) > 1) {
            $left = self::compileRange($and[0]);
            $right = self::compileRange($and[1]);

            return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_AND, $left, $right);
        }
        $and = preg_split("/(?<!-)\\s+(?!-)/", $range, 2);
        if (count($and) > 1) {
            $left = self::compileRange($and[0]);
            $right = self::compileRange($and[1]);

            return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_AND, $left, $right);
        }
        $between = preg_split("/\\s+\\-\\s+/", $range, 2);
        if (count($between) > 1) {
            // 1.0 - 2.0 is equivalent to >=1.0.0 <2.1
            // 1.0.0 - 2.1.0 is equivalent to >=1.0.0 <=2.1.0
            $v1 = Parser::parse($between[0]);
            $left = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_GTE, $v1);
            $v2 = Parser::parse($between[1]);
            if ($v2->hasPatch()) {
                $right = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_LTE, $v2);
            } elseif ($v2->hasMinor()) {
                $v2 = Parser::parse($v2->getNextMinorVersion());
                $right = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_LT, $v2);
            } else {
                $v2 = Parser::parse($v2->getNextMajorVersion());
                $right = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_LT, $v2);
            }

            return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_AND, $left, $right);
        }
        $val = trim($range);
        if (preg_match("/^([\\!>=<~^]+)(.*)$/", $val, $m)) {
            switch ($m[1]) {
                case '=':
                    $op = versionRangeUnaryOperator::OP_EQ;
                    break;
                case '<':
                    $op = versionRangeUnaryOperator::OP_LT;
                    break;
                case '>':
                    $op = versionRangeUnaryOperator::OP_GT;
                    break;
                case '<=':
                    $op = versionRangeUnaryOperator::OP_LTE;
                    break;
                case '>=':
                    $op = versionRangeUnaryOperator::OP_GTE;
                    break;
                case '!=':
                    $op = versionRangeUnaryOperator::OP_DIFF;
                    break;
                case '~':
                    // ~1.2 is equivalent to >=1.2 <2.0.0
                    // ~1.2.3 is equivalent to >=1.2.3 <1.3.0
                    $v1 = Parser::parse($m[2]);
                    if ($v1->hasPatch()) {
                        $v2 = Parser::parse($v1->getNextMinorVersion().'-dev');
                    } else {
                        $v2 = Parser::parse($v1->getNextMajorVersion().'-dev');
                    }
                    $left = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_GTE, $v1);
                    $right = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_LT, $v2);

                    return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_AND, $left, $right);
                case '^':
                    // ^1.2.3 is equivalent to >=1.2.3 <0.3.0
                    // ^0.3    as >=0.3.0 <0.4.0
                    $v1 = Parser::parse($m[2]);
                    $v2 = Parser::parse($v1->getNextMinorVersion().'-dev');
                    $left = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_GTE, $v1);
                    $right = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_LT, $v2);

                    return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_AND, $left, $right);
                default:
                    throw new \Exception('Version comparator: bad operator in the range '.$range);
            }

            return new versionRangeUnaryOperator($op, Parser::parse($m[2]));
        } elseif ($val == '*') {
            return new versionRangeTrueOperator();
        } elseif (preg_match('/^(.+)(\.\*)$/', $val, $m)) {
            // 1.2.* ->  >= 1.2.0 <1.3.0
            // 1.2.3.* ->  >= 1.2.3.0 <1.2.4
            $v1 = Parser::parse(str_replace('.*', '', $val));
            $v2 = Parser::parse($v1->getNextTailVersion());
            $left = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_GTE, $v1);
            $right = new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_LT, $v2);

            return new versionRangeBinaryOperator(versionRangeBinaryOperator::OP_AND, $left, $right);
        }

        return new versionRangeUnaryOperator(versionRangeUnaryOperator::OP_EQ, Parser::parse($range));
    }
}

interface VersionRangeOperatorInterface
{
    /**
     * @return bool
     */
    public function compare(Version $value);
}

/**
 * Represents a binary operator (AND or OR) in a version range expression.
 */
class versionRangeBinaryOperator implements VersionRangeOperatorInterface
{
    const OP_OR = 0;

    const OP_AND = 1;

    protected $op = -1;

    protected $left = null;

    protected $right = null;

    /**
     * @param int $operator one of OP_*
     */
    public function __construct($operator,
                         VersionRangeOperatorInterface $left,
                         VersionRangeOperatorInterface $right)
    {
        $this->op = $operator;
        $this->left = $left;
        $this->right = $right;
    }

    public function compare(Version $value)
    {
        if ($this->op == self::OP_OR) {
            if ($this->left->compare($value)) {
                return true;
            }
            if ($this->right->compare($value)) {
                return true;
            }

            return false;
        }
        if (!$this->left->compare($value)) {
            return false;
        }
        if (!$this->right->compare($value)) {
            return false;
        }

        return true;
    }
}

/**
 * Represents an unary operator (>,<,=,!=,<=,>=,~) in a version range expression.
 */
class versionRangeUnaryOperator implements VersionRangeOperatorInterface
{
    const OP_EQ = 0;
    const OP_LT = 1;
    const OP_GT = 2;
    const OP_GTE = 3;
    const OP_LTE = 4;
    const OP_DIFF = 5;

    protected $op = -1;

    protected $operand = null;

    /**
     * @param int     $operator one of OP_*
     * @param Version $version  the version used to compare
     */
    public function __construct($operator, Version $version)
    {
        $this->op = $operator;
        $this->operand = $version;
    }

    public function compare(Version $value)
    {
        $result = VersionComparator::compare($value, $this->operand);
        switch ($this->op) {
            case self::OP_EQ:
                return $result === 0;
            case self::OP_LT:
                return $result === -1;
            case self::OP_GT:
                return $result === 1;
            case self::OP_LTE:
                return $result < 1;
                break;
            case self::OP_GTE:
                return $result > -1;
                break;
            case self::OP_DIFF:
                return $result != 0;
        }

        return false;
    }
}

class versionRangeTrueOperator implements VersionRangeOperatorInterface
{
    public function compare(Version $value)
    {
        return true;
    }
}
