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
class presentationModuleUpgrader_1_1_5__1_2_0 extends Installer
{
    public $targetVersions = array(
        '1.2.0',
    );

    public $date = '2024-10-31';

    public function install(InstallHelpers $helpers)
    {
        $helpers->database()->useDbProfile('auth');

        // Get SQL template file
        $sql_file = $this->getPath().'install/sql/upgrade/upgrade_1.1.5_1.2.0.sql';
        $sql = jFile::read($sql_file);
        $db = $helpers->database()->dbConnection();
        $db->exec($sql);
    }
}
