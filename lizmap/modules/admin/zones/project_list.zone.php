<?php

use Jelix\Core\Infos\AppInfos;
use Lizmap\Project\ProjectMetadata;
use Lizmap\Server\Server;

/**
 * Construct a list of Lizmap projects.
 *
 * @author    3liz
 * @copyright 2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class project_listZone extends jZone
{
    protected $_tplname = 'project_list_zone';

    protected function _prepareTpl()
    {
        $maps = array();
        // Get repository data
        $repository = $this->param('repository');

        $repositories = array();
        if ($repository != null) {
            $repositories[] = $repository;
        } else {
            $repositories = lizmap::getRepositoryList();
        }

        // Get Lizmap services to find the path where are stored the optional inspection data files
        $services = lizmap::getServices();
        $inspectionDirectoryPath = $services->getQgisProjectsPrivateDataFolder();

        // Loop for each repository and find projects
        $hasInspectionData = false;
        $hasSomeProjectsNotDisplayed = false;

        // Project ACL are checked
        // But there is an exception for users with lizmap.admin.access or lizmap.admin.server.information.view
        $serverInfoAccess = (jAcl2::check('lizmap.admin.access') || jAcl2::check('lizmap.admin.server.information.view'));

        foreach ($repositories as $r) {
            $lizmapRepository = lizmap::getRepository($r);
            if (!jAcl2::check('lizmap.repositories.view', $r)) {
                if (!$serverInfoAccess) {
                    continue;
                }
            }
            $lizmapViewItem = new lizmapMainViewItem($r, $lizmapRepository->getLabel());
            $metadata = $lizmapRepository->getProjectsMetadata(false);
            foreach ($metadata as $projectMetadata) {
                $hasProjectAcl = false;
                // Do not add the project if the authenticated user
                // has no access to it (except for an admin)
                if (!$projectMetadata->getAcl()) {
                    if (!$serverInfoAccess) {
                        continue;
                    }
                    $hasProjectAcl = true;
                }

                // Get the projects data needed for the administration list table
                /** @var ProjectMetadata $projectItem */
                $projectItem = $this->getProjectListItem($inspectionDirectoryPath, $projectMetadata);
                $projectItem['acl_no_access'] = $hasProjectAcl;

                // If one of the projects has inspection data, set the boolean for the whole table
                if ($projectItem['has_inspection_data']) {
                    $hasInspectionData = true;
                }

                if ($projectItem['needs_update_error']) {
                    $hasSomeProjectsNotDisplayed = true;
                }

                $lizmapViewItem->childItems[] = $projectItem;
            }
            $maps[$r] = $lizmapViewItem;
        }
        $lizmapTargetVersionInt = jApp::config()->minimumRequiredVersion['lizmapWebClientTargetVersion'];
        $humanLizmapTargetVersion = substr($lizmapTargetVersionInt, 0, 1);  // Major
        $humanLizmapTargetVersion .= '.'.ltrim(substr($lizmapTargetVersionInt, 2, 1), ''); // Minor

        $lizmapDesktopInt = jApp::config()->minimumRequiredVersion['lizmapDesktopPlugin'];
        $lizmapDesktopRecommended = substr($lizmapDesktopInt, 0, 1);  // Major
        $lizmapDesktopRecommended .= '.'.ltrim(substr($lizmapDesktopInt, 2, 1), '');  // Minor
        $lizmapDesktopRecommended .= '.'.ltrim(substr($lizmapDesktopInt, 3, 2), '');  // Bugfix

        $this->_tpl->assign('mapItems', $maps);
        $this->_tpl->assign('hasInspectionData', $hasInspectionData);
        $this->_tpl->assign('minimumLizmapTargetVersionRequired', $humanLizmapTargetVersion);

        // Add an warning message when some projects cannot be displayed in LWC
        if ($hasSomeProjectsNotDisplayed) {
            jMessage::add(
                jLocale::get(
                    'admin~admin.project.error.some.projects.not.displayed',
                    array(jLocale::get('admin~admin.project.modal.title'))
                ),
                'warning'
            );
        }

        // Get the server metadata
        $server = new Server();
        $data = $server->getMetadata();
        $serverVersions = array(
            'qgis_server_version' => null,
            'qgis_server_version_int' => null,
            'lizmap_plugin_server_version' => null,
            'lizmap_plugin_server_version_int' => null,
        );
        $oldQgisVersionDelta = 6;
        if (!array_key_exists('error', $data['qgis_server_info'])) {
            // QGIS server
            $qgisServerVersion = $data['qgis_server_info']['metadata']['version'];
            $serverVersions['qgis_server_version'] = $qgisServerVersion;
            $explode = explode('.', $qgisServerVersion);
            // Keep only major and minor version
            $qgisServerVersionInt = intval($explode[0].str_pad($explode[1], 2, '0', STR_PAD_LEFT));
            $serverVersions['qgis_server_version_int'] = $qgisServerVersionInt;
            $serverVersions['qgis_server_version_human_readable'] = $this->qgisMajMinHumanVersion($qgisServerVersionInt);
            $serverVersions['qgis_server_version_old'] = $this->qgisMajMinHumanVersion($qgisServerVersionInt - $oldQgisVersionDelta - 2);
            $serverVersions['qgis_server_version_next'] = $this->qgisMajMinHumanVersion($qgisServerVersionInt + 2);
            // Lizmap server plugin
            $serverVersions['lizmap_plugin_server_version'] = $data['info']['version'];
        }
        $this->_tpl->assign('serverVersions', $serverVersions);

        // Is QGIS server OK ?
        // We don't care about the reason of the error
        $statusQgisServer = true;

        // Check QGIS server status
        $requiredQgisVersion = jApp::config()->minimumRequiredVersion['qgisServer'];
        if ($server->versionCompare($server->getQgisServerVersion(), $requiredQgisVersion)) {
            $statusQgisServer = false;
        }

        // Check Lizmap server status
        $requiredLizmapVersion = jApp::config()->minimumRequiredVersion['lizmapServerPlugin'];
        $currentLizmapVersion = $server->getLizmapPluginServerVersion();

        if ($server->pluginServerNeedsUpdate($currentLizmapVersion, $requiredLizmapVersion)) {
            $statusQgisServer = false;
        }
        $this->_tpl->assign('qgisServerOk', $statusQgisServer);

        $lizmapInfo = AppInfos::load();
        $this->_tpl->assign('lizmapVersion', $lizmapInfo->version);
        $this->_tpl->assign('oldQgisVersionDiff', $oldQgisVersionDelta);
        $this->_tpl->assign('lizmapDesktopRecommended', $lizmapDesktopRecommended);
        // Add the application base path to let the template load the CSS and JS assets
        $basePath = jApp::urlBasePath();
        $this->_tpl->assign('basePath', $basePath);
    }

    /**
     * Get the QGIS project properties which must be displayed
     * in the administration project list table.
     *
     * @param string          $inspectionDirectoryPath The path where the inspection files are stored
     * @param ProjectMetadata $projectMetadata         The QGIS project metadata instance
     *
     * @return array The QGIS project properties
     */
    private function getProjectListItem($inspectionDirectoryPath, $projectMetadata)
    {
        $rootRepositories = lizmap::getServices()->getRootRepositories();
        $repository = lizmap::getRepository($projectMetadata->getRepository())->getOriginalPath();
        if ($rootRepositories != '' && strpos($repository, $rootRepositories) === 0) {
            $repository = basename($repository);
        }

        // Build the project properties table
        $projectItem = array(
            'id' => $projectMetadata->getId(),
            'relative_path' => $projectMetadata->getMap(),
            'title' => $projectMetadata->getTitle(),
            'abstract' => $projectMetadata->getAbstract(),
            'projection' => $projectMetadata->getProj(),
            'url' => jUrl::get(
                'view~map:index',
                array('repository' => $projectMetadata->getRepository(), 'project' => $projectMetadata->getId())
            ),
            'url_repository' => jUrl::get(
                'view~default:index',
                array('repository' => $projectMetadata->getRepository())
            ),
            'repository_id' => $repository,
            'cfg_warnings_count' => $projectMetadata->countProjectCfgWarnings(),
            'cfg_warnings' => $projectMetadata->projectCfgWarnings(),
            'lizmap_web_client_target_version' => $projectMetadata->getLizmapWebClientTargetVersion(),
            // convert int to string orderable
            'lizmap_plugin_version' => $this->pluginIntVersionToSortableString($projectMetadata->getLizmapPluginVersion()),
            'lizmap_plugin_update' => $projectMetadata->qgisLizmapPluginUpdateNeeded(),
            'file_time' => $projectMetadata->getFileTime(),
            'layer_count' => $projectMetadata->getLayerCount(),
            'acl_groups' => $projectMetadata->getAclGroups(),
            'hidden_project' => $projectMetadata->getHidden(),
        );

        // Get QGIS project version
        $qgisVersionInt = $projectMetadata->getQgisProjectVersion();
        // Create a human readable version, but suitable for string ordering
        // Ex: 3.06.02 instead of 3.6.2
        $qgisVersion = substr($qgisVersionInt, 0, 1);
        $qgisVersion .= '.'.ltrim(substr($qgisVersionInt, 1, 2), '');
        $qgisVersion .= '.'.ltrim(substr($qgisVersionInt, 3, 2), '');
        $projectItem['qgis_version'] = $qgisVersion;
        // Integer version: keep only major and minor versions. Ex: 322 for 3.22.04
        $projectItem['qgis_version_int'] = (int) substr($qgisVersionInt, 0, 3);

        // Target Lizmap Web Client version
        $targetVersion = substr($projectItem['lizmap_web_client_target_version'], 0, 1);
        $targetVersion .= '.'.ltrim(substr($projectItem['lizmap_web_client_target_version'], 2, 1), '');
        $projectItem['lizmap_web_client_target_version_display'] = $targetVersion;
        $projectItem['needs_update_error'] = $projectMetadata->needsUpdateError();
        $projectItem['needs_update_warning'] = $projectMetadata->needsUpdateWarning();

        // Add the information based on the qgis-project-validator inspection output
        $services = lizmap::getServices();
        $rootRepositories = $services->getRootRepositories();
        $mapParam = $projectMetadata->getMap();
        if ($rootRepositories != '' && strpos($mapParam, $rootRepositories) === 0) {
            $mapParam = str_replace($rootRepositories, '', $mapParam);
            $mapParam = ltrim($mapParam, '/');
        }
        $inspectionData = $this->getProjectInspection(
            $inspectionDirectoryPath,
            $mapParam
        );
        foreach ($inspectionData as $key => $val) {
            $projectItem[$key] = $val;
        }

        return $projectItem;
    }

    /**
     * Get the QGIS project inspection data
     * pre-generated by the 3liz qgis-project-validator inspection command.
     *
     * It returns the project loading time, memory consumption, invalid layers
     *
     * @param string $inspectionDirectoryPath The path where the inspection files are stored
     * @param string $projectRelativePath     The QGIS project relative path
     *
     * @return array The data from inspection
     */
    private function getProjectInspection($inspectionDirectoryPath, $projectRelativePath)
    {
        // Default empty values
        $inspectionData = array(
            'inspection_timestamp' => null,
            'has_inspection_data' => false,
            'loading_time' => 0,
            'memory_usage' => null,
            'invalid_layers_count' => null,
            'invalid_layers' => '',
            'qgis_log' => null,
        );

        // Directory where to find the JSON and LOG files
        $pathParts = pathinfo($projectRelativePath);

        // Check that the optional side JSON file exists
        $jsonPath = $inspectionDirectoryPath.$pathParts['dirname'].'/.'.$pathParts['basename'].'.json';
        if (!is_file($jsonPath)) {
            return $inspectionData;
        }
        $content = jFile::read($jsonPath);
        if (empty($content)) {
            return $inspectionData;
        }
        // Try to read the JSON
        $inspection = null;

        try {
            $inspection = json_decode($content);
            if ($inspection === null) {
                throw new Exception(
                    'The content of the qgis-project-validator JSON file cannot be read: '.$projectRelativePath
                );
            }
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return $inspectionData;
        }

        // Add inspection data
        $inspectionData['has_inspection_data'] = true;

        $inspectionData['inspection_timestamp'] = filemtime($jsonPath);
        if (property_exists($inspection, 'loading_infos')) {
            $inspectionData['loading_time'] = $inspection->loading_infos->loading_time_ms / 1000;
            $inspectionData['memory_usage'] = $inspection->loading_infos->memory_footprint / 1024 / 2024;
        }

        if (property_exists($inspection, 'bad_layers_count')) {
            $inspectionData['invalid_layers_count'] = $inspection->bad_layers_count;
            if ($inspection->bad_layers_count > 0) {
                $invalidLayers = array();
                foreach ($inspection->layers as $id => $properties) {
                    if (!$properties->valid) {
                        $invalidLayers[] = (array) $properties;
                    }
                }
                $inspectionData['invalid_layers'] = $invalidLayers;

                // Read the QGIS log content for this project
                $logPath = $inspectionDirectoryPath.$pathParts['dirname'].'/.'.$pathParts['basename'].'.log';
                $logContent = jFile::read($logPath);
                $inspectionData['qgis_log'] = $logContent;
            }
        }

        return $inspectionData;
    }

    private function qgisMajMinHumanVersion($qgisIntVersion): string
    {
        // NOTE Will work as long a Major version is on 1 Digit
        return substr($qgisIntVersion, 0, 1).'.'.substr($qgisIntVersion, -2);
    }

    /**
     * Transform int formatted version (from 5 or 6 integer) to sortable string .
     *
     * Transform "10102" into "01.01.02"
     * Transform "050912" into "05.09.12"
     *
     * @param string $intVersion the lizmap QGIS plugin version (not always int !!)
     *
     * @return string the version as sortable string
     */
    private function pluginIntVersionToSortableString(string $intVersion): string
    {
        if ($intVersion == 'master' || $intVersion == 'dev') {
            return '00.00.00';
        }

        // in some old plugin the version is already human readable
        if (strpos($intVersion, '.') != false) {
            list($majorVersion, $minorVersion, $patchVersion) = explode('.', $intVersion);
            // add 0 to 1 digit version
            $majorVersion = (strlen($majorVersion) == 1 ? '0'.$majorVersion : $majorVersion);
            $minorVersion = (strlen($minorVersion) == 1 ? '0'.$minorVersion : $minorVersion);
            $patchVersion = (strlen($patchVersion) == 1 ? '0'.$patchVersion : $patchVersion);
        } else {
            $intVersion6Digit = (strlen($intVersion) == 6 ? $intVersion : '0'.$intVersion);
            list($majorVersion, $minorVersion, $patchVersion) = str_split($intVersion6Digit, 2);
        }

        return $majorVersion.'.'.$minorVersion.'.'.$patchVersion;
    }
}
