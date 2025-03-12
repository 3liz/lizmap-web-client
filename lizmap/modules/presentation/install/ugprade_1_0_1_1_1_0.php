<?php

use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\Module\Installer;

/**
 * @author    3liz
 * @copyright 2011-24 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class presentationModuleUpgrader_1_0_1_1_1_0 extends Installer
{
    public $targetVersions = array(
        '1.1.0',
    );

    public $date = '2024-06-28';

    public function install(InstallHelpers $helpers)
    {
        $helpers->database()->useDbProfile('auth');

        // Get SQL template file
        $sql_file = $this->getPath().'install/sql/upgrade/upgrade_1.0.1_1.1.0.sql';
        $sql = jFile::read($sql_file);
        $db = $helpers->database()->dbConnection();
        $db->exec($sql);
    }
}
