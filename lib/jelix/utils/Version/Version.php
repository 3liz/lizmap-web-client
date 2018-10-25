<?php
/**
* @author      Laurent Jouanneau
* @copyright   2016 Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence     MIT
*/

namespace Jelix\Version;

/**
 * Embed version informations.
 */
class Version
{
    private $version = array();

    private $stabilityVersion = array();

    private $buildMetadata = '';

    /**
     * @param int[]    $version          list of numbers of the version
     *                                   (ex: [1,2,3] for 1.2.3)
     * @param string[] $stabilityVersion list of stability informations
     *                                   that are informations following a '-' in a semantic version
     *                                   (ex: ['alpha', '2'] for 1.2.3-alpha.2)
     * @param string  build metadata  the metadata, informations that
     *  are after a '+' in a semantic version
     *     (ex: 'build-56458' for 1.2.3-alpha.2+build-56458)
     */
    public function __construct(array $version,
                                array $stabilityVersion = array(),
                                $buildMetadata = '')
    {
        $this->version = $version;
        $this->stabilityVersion = $stabilityVersion;
        $this->buildMetadata = $buildMetadata;
    }

    public function __toString()
    {
        return $this->toString();
    }

    /**
     * @param bool $withPatch true, it returns always x.y.z even
     *                        if no patch or minor version was given
     */
    public function toString($withPatch = true)
    {
        $version = $this->version;
        if ($withPatch && count($version) < 3) {
            $version = array_pad($version, 3, '0');
        }

        $vers = implode('.', $version);
        if ($this->stabilityVersion) {
            $vers .= '-'.implode('.', $this->stabilityVersion);
        }
        if ($this->buildMetadata) {
            $vers .= '+'.$this->buildMetadata;
        }

        return $vers;
    }

    public function getMajor()
    {
        return $this->version[0];
    }

    public function hasMinor()
    {
        return isset($this->version[1]);
    }

    public function getMinor()
    {
        if (isset($this->version[1])) {
            return $this->version[1];
        }

        return 0;
    }

    public function hasPatch()
    {
        return isset($this->version[2]);
    }

    public function getPatch()
    {
        if (isset($this->version[2])) {
            return $this->version[2];
        }

        return 0;
    }

    public function getTailNumbers()
    {
        if (count($this->version) > 3) {
            return array_slice($this->version, 3);
        }

        return array();
    }

    public function getVersionArray()
    {
        return $this->version;
    }

    public function getBranchVersion()
    {
        return $this->version[0].'.'.$this->getMinor();
    }

    public function getStabilityVersion()
    {
        return $this->stabilityVersion;
    }

    public function getBuildMetadata()
    {
        return $this->buildMetadata;
    }

    /**
     * Returns the next major version
     * 2.1.3 -> 3.0.0
     * 2.1b1.4 -> 3.0.0.
     *
     * @return string the next version
     */
    public function getNextMajorVersion()
    {
        return ($this->version[0] + 1).'.0.0';
    }

    /**
     * Returns the next minor version
     * 2.1.3 -> 2.2
     * 2.1 -> 2.2
     * 2.1b1.4 -> 2.2.
     *
     * @return string the next version
     */
    public function getNextMinorVersion()
    {
        return $this->version[0].'.'.($this->getMinor() + 1).'.0';
    }

    /**
     * Returns the next patch version
     * 2.1.3 -> 2.1.4
     * 2.1b1.4 -> 2.2.
     *
     * @return string the next version
     */
    public function getNextPatchVersion()
    {
        return $this->version[0].'.'.$this->getMinor().'.'.($this->getPatch() + 1);
    }

    /**
     * returns the next version, by incrementing the last
     * number, whatever it is.
     * If the version has a stability information (alpha, beta etc..),
     * it returns only the version without stability version.
     *
     * @return string the next version
     */
    public function getNextTailVersion()
    {
        if (count($this->stabilityVersion) && $this->stabilityVersion[0] != 'stable') {
            return implode('.', $this->version);
        }
        $v = $this->version;
        ++$v[count($v) - 1];

        return implode('.', $v);
    }
}
