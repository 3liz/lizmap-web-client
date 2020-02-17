<?php
/**
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapModuleInstaller extends jInstallerModule
{
    public function install()
    {
        $lizmapConfFile = jApp::configPath('lizmapConfig.ini.php');
        if (!file_exists($lizmapConfFile)) {
            $lizmapConfFileDist = jApp::configPath('lizmapConfig.ini.php.dist');
            if (file_exists($lizmapConfFileDist)) {
                copy($lizmapConfFileDist, $lizmapConfFile);
            } else {
                $this->copyFile('config/lizmapConfig.ini.php', $lizmapConfFile);
            }
        }

        $localConfig = jApp::configPath('localconfig.ini.php');
        if (!file_exists($localConfig)) {
            $localConfigDist = jApp::configPath('localconfig.ini.php.dist');
            if (file_exists($localConfigDist)) {
                copy($localConfigDist, $localConfig);
            } else {
                file_put_contents($localConfig, ';<'.'?php die(\'\');?'.'>');
            }
        }
        $ini = new jIniFileModifier($localConfig);
        $ini->setValue('lizmap', 'lizmapConfig.ini.php', 'coordplugins');
        $ini->save();

        if ($this->firstDbExec()) {

            // Add log table
            $this->useDbProfile('lizlog');
            $this->execSQLScript('sql/lizlog');

            // Add geobookmark table
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/lizgeobookmark');
        }
    }
}
