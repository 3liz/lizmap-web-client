<?php
/**
* @package   lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

require_once (dirname(__FILE__).'./../application.init.php');

$installer = new jInstaller(new textInstallReporter());

$installer->installApplication();

