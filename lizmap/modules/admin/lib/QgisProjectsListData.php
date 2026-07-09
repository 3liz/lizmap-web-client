<?php

namespace LizmapAdmin;

use Jelix\Core\Infos\AppInfos;
use Lizmap\App\VersionTools;
use Lizmap\Project\ProjectMetadata;
use Lizmap\Server\Server;

/**
 * Build the data for the administration list of QGIS projects.
 *
 * Gathers the projects metadata and turns each project into a row object
 * (raw value + precomputed CSS class and tooltip per cell) consumed as JSON
 * by DataTables on the admin QGIS projects page.
 *
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class QgisProjectsListData
{
    // Thresholds used to colour the cells (warning/error).
    const WARNING_LAYER_COUNT = 100;
    const ERROR_LAYER_COUNT = 200;
    const WARNING_LOADING_TIME = 30.0;
    const ERROR_LOADING_TIME = 60.0;
    const WARNING_MEMORY = 100;
    const ERROR_MEMORY = 250;
    const OLD_QGIS_VERSION_DELTA = 6;

    /**
     * Context shared by the page shell (help modal, server status banner)
     * and by the per-cell presentation: server versions, thresholds and
     * the required Lizmap/QGIS versions.
     *
     * Note: this creates a Lizmap\Server\Server instance, which performs a
     * request to QGIS Server to retrieve its metadata.
     *
     * @return array
     */
    public function getContext()
    {
        $lizmapTargetVersionInt = \jApp::config()->minimumRequiredVersion['lizmapWebClientTargetVersion'];
        // 31500 - 100 → 31400 → 3.14
        $blockingLizmapVersionInt = ($lizmapTargetVersionInt - 100);
        $humanLizmapTargetVersion = VersionTools::intVersionToHumanString($lizmapTargetVersionInt, true);
        $humanBlockingLizmapTargetVersion = VersionTools::intVersionToHumanString($blockingLizmapVersionInt, true);

        $lizmapDesktopInt = \jApp::config()->minimumRequiredVersion['lizmapDesktopPlugin'];
        $lizmapDesktopRecommended = VersionTools::intVersionToHumanString($lizmapDesktopInt);

        // Get the server metadata
        $server = new Server();
        $data = $server->getMetadata();
        $serverVersions = array(
            'qgis_server_version' => null,
            'qgis_server_version_int' => null,
            'lizmap_plugin_server_version' => null,
            'lizmap_plugin_server_version_int' => null,
        );
        $oldQgisVersionDelta = self::OLD_QGIS_VERSION_DELTA;
        if (!array_key_exists('error', $data['qgis_server_info'])) {
            // QGIS server
            $qgisServerVersion = $data['qgis_server_info']['metadata']['version'];
            $serverVersions['qgis_server_version'] = $qgisServerVersion;
            $explode = explode('.', $qgisServerVersion);
            // Keep only major and minor version
            // Like 3.40
            // Fixme, to move in VersionTools
            $qgisServerVersionInt = intval($explode[0].str_pad($explode[1], 2, '0', STR_PAD_LEFT));
            $serverVersions['qgis_server_version_int'] = $qgisServerVersionInt;
            $serverVersions['qgis_server_version_human_readable'] = VersionTools::qgisMajMinHumanVersion($qgisServerVersionInt);
            $serverVersions['qgis_server_version_old'] = VersionTools::qgisMajMinHumanVersion($qgisServerVersionInt - $oldQgisVersionDelta - 2);
            $serverVersions['qgis_server_version_next'] = VersionTools::qgisMajMinHumanVersion($qgisServerVersionInt + 2);
            // Lizmap server plugin
            $serverVersions['lizmap_plugin_server_version'] = $data['info']['version'];
        }

        // Is QGIS server OK ?
        // We don't care about the reason of the error
        $statusQgisServer = true;

        // Check QGIS server status
        $requiredQgisVersion = \jApp::config()->minimumRequiredVersion['qgisServer'];
        if ($server->versionCompare($server->getQgisServerVersion(), $requiredQgisVersion)) {
            $statusQgisServer = false;
        }

        // Check Lizmap server status
        $requiredLizmapVersion = \jApp::config()->minimumRequiredVersion['lizmapServerPlugin'];
        $currentLizmapVersion = $server->getLizmapPluginServerVersion();
        if ($server->pluginServerNeedsUpdate($currentLizmapVersion, $requiredLizmapVersion)) {
            $statusQgisServer = false;
        }

        $lizmapInfo = AppInfos::load();

        return array(
            'serverVersions' => $serverVersions,
            'qgisServerOk' => $statusQgisServer,
            'oldQgisVersionDiff' => $oldQgisVersionDelta,
            'lizmapVersion' => $lizmapInfo->version,
            'lizmapDesktopRecommended' => $lizmapDesktopRecommended,
            'minimumLizmapTargetVersionRequired' => $humanLizmapTargetVersion,
            'blockingLizmapTargetVersion' => $humanBlockingLizmapTargetVersion,
            'warningLayerCount' => self::WARNING_LAYER_COUNT,
            'errorLayerCount' => self::ERROR_LAYER_COUNT,
            'warningLoadingTime' => self::WARNING_LOADING_TIME,
            'errorLoadingTime' => self::ERROR_LOADING_TIME,
            'warningMemory' => self::WARNING_MEMORY,
            'errorMemory' => self::ERROR_MEMORY,
        );
    }

    /**
     * Build the full payload consumed by DataTables through the JSON endpoint.
     *
     * @return array {
     *                data: array of row objects,
     *                hasInspectionData: bool,
     *                hasSomeProjectsNotDisplayed: bool
     *                }
     */
    public function getData()
    {
        $context = $this->getContext();

        $hasInspectionData = false;
        $hasSomeProjectsNotDisplayed = false;
        $rawItems = $this->gatherRawProjects($hasInspectionData, $hasSomeProjectsNotDisplayed);

        $rows = array();
        foreach ($rawItems as $rawItem) {
            $rows[] = $this->buildRow($rawItem, $context);
        }

        return array(
            'data' => $rows,
            'hasInspectionData' => $hasInspectionData,
            'hasSomeProjectsNotDisplayed' => $hasSomeProjectsNotDisplayed,
        );
    }

    /**
     * Loop over the repositories the user is allowed to see and gather the
     * raw metadata of each project.
     *
     * @param bool $hasInspectionData           Set to true if at least one project has inspection data
     * @param bool $hasSomeProjectsNotDisplayed Set to true if at least one project cannot be displayed
     *
     * @return array The list of raw project items
     */
    private function gatherRawProjects(&$hasInspectionData, &$hasSomeProjectsNotDisplayed)
    {
        $rawItems = array();

        $repositories = \lizmap::getRepositoryList();

        // Get Lizmap services to find the path where are stored the optional inspection data files
        $services = \lizmap::getServices();
        $inspectionDirectoryPath = $services->getQgisProjectsPrivateDataFolder();

        $hasInspectionData = false;
        $hasSomeProjectsNotDisplayed = false;

        // Project ACL are checked
        // But there is an exception for users with lizmap.admin.access or lizmap.admin.server.information.view
        $serverInfoAccess = (\jAcl2::check('lizmap.admin.access') || \jAcl2::check('lizmap.admin.server.information.view'));

        foreach ($repositories as $r) {
            $lizmapRepository = \lizmap::getRepository($r);
            if (!\jAcl2::check('lizmap.repositories.view', $r)) {
                if (!$serverInfoAccess) {
                    continue;
                }
            }
            $repositoryLabel = $lizmapRepository->getLabel();
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
                $projectItem = $this->getProjectListItem($inspectionDirectoryPath, $projectMetadata);
                $projectItem['acl_no_access'] = $hasProjectAcl;
                $projectItem['repository_key'] = $r;
                $projectItem['repository_label'] = $repositoryLabel;

                // If one of the projects has inspection data, set the boolean for the whole table
                if ($projectItem['has_inspection_data']) {
                    $hasInspectionData = true;
                }

                if ($projectItem['needs_update_error']) {
                    $hasSomeProjectsNotDisplayed = true;
                }

                $rawItems[] = $projectItem;
            }
        }

        return $rawItems;
    }

    /**
     * Turn a raw project item into a row object for DataTables.
     *
     * Each presented cell is an array with the raw value `v` and, when needed,
     * a CSS class and a tooltip. Free text is stripped of its HTML tags but
     * NOT HTML-escaped: the browser side escapes it when building the cells
     * (innerHTML) and uses setAttribute for the tooltips.
     *
     * @param array $p       The raw project item
     * @param array $context The shared context (server versions, thresholds)
     *
     * @return array The row object
     */
    private function buildRow($p, $context)
    {
        $serverVersions = $context['serverVersions'];

        // Repository cell
        // Keep the line break after the label to improve the tooltip readability
        $repositoryTitle = '';
        if (!empty($p['repository_label'])) {
            $repositoryTitle = strip_tags($p['repository_label']);
        }
        $repositoryTitle .= "\n".\jLocale::get('admin~admin.project.list.column.path.label').' : '.$p['repository_id'].'/';

        // Project cell
        // Keep the line break after the title to improve the tooltip readability
        $projectTitle = (!empty($p['title']) ? strip_tags($p['title']) : '')
            ."\n"
            .(!empty($p['abstract']) ? $this->truncate(strip_tags($p['abstract']), 150) : '');
        $projectHasNoLink = ($p['needs_update_error'] || $p['acl_no_access']);

        // Layer count
        $layerCount = $this->thresholdCell(
            $p['layer_count'],
            array($context['warningLayerCount'] => 'admin~admin.project.list.column.layers.count.warning.label'),
            array($context['errorLayerCount'] => 'admin~admin.project.list.column.layers.count.error.label')
        );

        // Invalid layers count (inspection)
        $invalidLayersCount = array('v' => $p['invalid_layers_count'], 'class' => '', 'title' => '');
        if ($p['invalid_layers_count'] > 0) {
            $invalidLayersCount['class'] = 'liz-error';
            $invalidLayersCount['title'] = \jLocale::get('admin~admin.project.list.column.invalid.layers.count.error.label');
        }

        // Loading time (inspection)
        $loadingTime = $this->thresholdCell(
            $p['loading_time'],
            array($context['warningLoadingTime'] => 'admin~admin.project.list.column.loading.time.warning.label'),
            array($context['errorLoadingTime'] => 'admin~admin.project.list.column.loading.time.error.label')
        );
        $loadingTime['v'] = !empty($p['loading_time']) ? number_format($p['loading_time'], 2, '.', ' ') : '';

        // Memory usage (inspection)
        $memoryUsage = $this->thresholdCell(
            $p['memory_usage'],
            array($context['warningMemory'] => 'admin~admin.project.list.column.memory.usage.warning.label'),
            array($context['errorMemory'] => 'admin~admin.project.list.column.memory.usage.error.label')
        );
        $memoryUsage['v'] = !empty($p['memory_usage']) ? number_format($p['memory_usage'], 2, '.', ' ') : '';

        // QGIS desktop version
        $qgisVersionClass = '';
        $qgisVersionTitle = '';
        if ($serverVersions['qgis_server_version_int']
            && $serverVersions['qgis_server_version_int'] - $p['qgis_version_int'] > $context['oldQgisVersionDiff']) {
            $qgisVersionClass = 'liz-warning';
            $qgisVersionTitle = \jLocale::get('admin~admin.project.list.column.qgis.desktop.version.too.old')
                .' ('.\jLocale::get('admin~admin.form.admin_services.qgisServerVersion.label').': '.$serverVersions['qgis_server_version'].')';
        }
        if ($serverVersions['qgis_server_version_int']
            && $p['qgis_version_int'] > $serverVersions['qgis_server_version_int']) {
            $qgisVersionClass = 'liz-error';
            $qgisVersionTitle = \jLocale::get('admin~admin.project.list.column.qgis.desktop.version.above.server')
                .' ('.$serverVersions['qgis_server_version'].')';
        }
        if ($qgisVersionTitle != '') {
            $qgisVersionTitle .= ' - ';
        }
        $qgisVersionTitle .= \jLocale::get('admin~admin.project.list.column.lizmap.plugin.version.label').' '.$p['lizmap_plugin_version'];
        if ($p['lizmap_plugin_update']) {
            $qgisVersionTitle .= ' '.\jLocale::get('admin~admin.project.list.column.qgis.desktop.recent.label.html');
        }

        // Target version of Lizmap Web Client
        $targetVersionClass = '';
        $targetVersionTitle = '';
        if ($p['needs_update_error']) {
            $targetVersionClass = 'liz-blocker';
            $targetVersionTitle = \jLocale::get('admin~admin.project.list.column.update.in.qgis.desktop');
        }
        if ($p['needs_update_warning']) {
            $targetVersionClass = 'liz-warning';
            $targetVersionTitle = \jLocale::get('admin~admin.project.list.column.update.soon.in.qgis.desktop');
        }

        // Warnings in the CFG file
        $cfgWarningsClass = '';
        $cfgWarningsTitle = '';
        if ($p['cfg_warnings_count'] >= 1) {
            $cfgWarningsClass = 'liz-warning';
            $cfgWarningsTitle = \jLocale::get('admin~admin.project.list.column.lizmap.warnings.explanations.label').' : ';
            foreach ($p['cfg_warnings'] as $id => $count) {
                $cfgWarningsTitle .= ' '.$id.' ('.$count.'), ';
            }
        }

        // Projection / CRS
        $projectionClass = '';
        $projectionTitle = '';
        if (substr($p['projection'], 0, 4) == 'USER') {
            $projectionClass = 'liz-warning';
            $projectionTitle = \jLocale::get('admin~admin.project.list.column.crs.user.warning.label');
        }

        // Invalid layers list (inspection)
        $invalidLayers = array();
        if ($p['invalid_layers_count'] > 0 && is_array($p['invalid_layers'])) {
            foreach ($p['invalid_layers'] as $properties) {
                $invalidLayers[] = array(
                    'name' => strip_tags($properties['name']),
                    'source' => strip_tags($properties['source']),
                );
            }
        }

        return array(
            // Metadata used to set the <tr> data attributes on the browser side
            'id' => $p['id'],
            'repository_id' => $p['repository_id'],
            // Presented cells, in the table column order
            'repository' => array(
                'v' => $p['repository_key'],
                'url' => $p['url_repository'],
                'title' => $repositoryTitle,
            ),
            'project' => array(
                'v' => $p['id'],
                'url' => $projectHasNoLink ? null : $p['url'],
                'lock' => (bool) $p['acl_no_access'],
                'lock_title' => \jLocale::get('admin~admin.project.list.column.project.acl'),
                'title' => $projectTitle,
            ),
            'layer_count' => $layerCount,
            'invalid_layers_count' => $invalidLayersCount,
            'has_log' => array('v' => (!empty($p['qgis_log']) && trim($p['qgis_log']) !== '')),
            'loading_time' => $loadingTime,
            'memory_usage' => $memoryUsage,
            'qgis_version' => array(
                'v' => $p['qgis_version'],
                'class' => $qgisVersionClass,
                'title' => $qgisVersionTitle,
                'badge' => (bool) $p['lizmap_plugin_update'],
            ),
            'target_version' => array(
                'v' => $p['lizmap_web_client_target_version_display'],
                'class' => $targetVersionClass,
                'title' => $targetVersionTitle,
            ),
            'cfg_warnings' => array(
                'v' => $p['cfg_warnings_count'],
                'class' => $cfgWarningsClass,
                'title' => $cfgWarningsTitle,
            ),
            'hidden' => array(
                'v' => $p['hidden_project']
                    ? \jLocale::get('admin~admin.project.list.column.hidden.project.yes.label')
                    : \jLocale::get('admin~admin.project.list.column.hidden.project.no.label'),
            ),
            'acl_groups' => array('v' => !empty($p['acl_groups']) ? strip_tags($p['acl_groups']) : ''),
            'file_time' => array('v' => !empty($p['file_time']) ? date('Y-m-d H:i:s', (int) $p['file_time']) : ''),
            'inspection_time' => array('v' => !empty($p['inspection_timestamp']) ? date('Y-m-d H:i:s', (int) $p['inspection_timestamp']) : ''),
            'projection' => array(
                'v' => !empty($p['projection']) ? strip_tags($p['projection']) : '',
                'class' => $projectionClass,
                'title' => $projectionTitle,
            ),
            'invalid_layers' => array('v' => $invalidLayers),
            'qgis_log' => array('v' => !empty($p['qgis_log']) ? strip_tags($p['qgis_log']) : ''),
        );
    }

    /**
     * Build a numeric cell with a warning/error CSS class and tooltip
     * depending on the given thresholds.
     *
     * @param mixed $value   The cell value
     * @param array $warning array(threshold => locale key) applied when value > threshold
     * @param array $error   array(threshold => locale key) applied when value > threshold
     *
     * @return array The cell array with v/class/title
     */
    private function thresholdCell($value, $warning, $error)
    {
        $cell = array('v' => $value, 'class' => '', 'title' => '');
        foreach ($warning as $threshold => $localeKey) {
            if ($value > $threshold) {
                $cell['class'] = 'liz-warning';
                $cell['title'] = \jLocale::get($localeKey);
            }
        }
        foreach ($error as $threshold => $localeKey) {
            if ($value > $threshold) {
                $cell['class'] = 'liz-error';
                $cell['title'] = \jLocale::get($localeKey);
            }
        }

        return $cell;
    }

    /**
     * Truncate a string to a maximum length, appending an ellipsis when needed.
     *
     * @param string $string The string to truncate
     * @param int    $length The maximum length
     *
     * @return string
     */
    private function truncate($string, $length)
    {
        if (mb_strlen($string) <= $length) {
            return $string;
        }

        return mb_substr($string, 0, $length).'...';
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
        $rootRepositories = \lizmap::getServices()->getRootRepositories();
        $repository = \lizmap::getRepository($projectMetadata->getRepository())->getOriginalPath();
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
            'url' => \jUrl::get(
                'view~map:index',
                array('repository' => $projectMetadata->getRepository(), 'project' => $projectMetadata->getId())
            ),
            'url_repository' => \jUrl::get(
                'view~default:index',
                array('repository' => $projectMetadata->getRepository())
            ),
            'repository_id' => $repository,
            'cfg_warnings_count' => $projectMetadata->countProjectCfgWarnings(),
            'cfg_warnings' => $projectMetadata->projectCfgWarnings(),
            'lizmap_web_client_target_version' => $projectMetadata->getLizmapWebClientTargetVersion(),
            // convert int to string orderable
            'lizmap_plugin_version' => VersionTools::intVersionToSortableString($projectMetadata->getLizmapPluginVersion()),
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
        // Fixme, to move in VersionTools
        $qgisVersion = substr($qgisVersionInt, 0, 1);
        $qgisVersion .= '.'.ltrim(substr($qgisVersionInt, 1, 2), '');
        $qgisVersion .= '.'.ltrim(substr($qgisVersionInt, 3, 2), '');
        $projectItem['qgis_version'] = $qgisVersion;
        // Integer version: keep only major and minor versions. Ex: 322 for 3.22.04
        $projectItem['qgis_version_int'] = (int) substr($qgisVersionInt, 0, 3);

        // Target Lizmap Web Client version
        $targetVersion = VersionTools::intVersionToSortableString($projectItem['lizmap_web_client_target_version']);
        $projectItem['lizmap_web_client_target_version_display'] = $targetVersion;
        $projectItem['needs_update_error'] = $projectMetadata->needsUpdateError();
        $projectItem['needs_update_warning'] = $projectMetadata->needsUpdateWarning();

        // Add the information based on the qgis-project-validator inspection output
        $services = \lizmap::getServices();
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
        $content = \jFile::read($jsonPath);
        if (empty($content)) {
            return $inspectionData;
        }
        // Try to read the JSON
        $inspection = null;

        try {
            $inspection = json_decode($content);
            if ($inspection === null) {
                throw new \Exception(
                    'The content of the qgis-project-validator JSON file cannot be read: '.$projectRelativePath
                );
            }
        } catch (\Exception $e) {
            \jLog::logEx($e, 'error');

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
                $logContent = \jFile::read($logPath);
                $inspectionData['qgis_log'] = $logContent;
            }
        }

        return $inspectionData;
    }
}
