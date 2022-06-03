<?php

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

        // Get Lizmap services to find the path where are stored the optionnal inspection data files
        $services = lizmap::getServices();
        $inspectionDirectoryPath = $services->getQgisProjectsPrivateDataFolder();

        // Loop for each repository and find projects
        $hasInspectionData = false;
        foreach ($repositories as $r) {
            $lrep = lizmap::getRepository($r);
            $mrep = new lizmapMainViewItem($r, $lrep->getLabel());
            $metadata = $lrep->getProjectsMetadata();
            foreach ($metadata as $projectMetadata) {

                // Get the projects data needed for the administration list table
                /** @var Lizmap\Project\ProjectMetadata $projectItem */
                $projectItem = $this->getProjectListItem($inspectionDirectoryPath, $projectMetadata);

                // If one of the projects has inspection data, set the boolean for the whole table
                if ($projectItem['has_inspection_data']) {
                    $hasInspectionData = true;
                }

                $mrep->childItems[] = $projectItem;
            }
            $maps[$r] = $mrep;
        }
        $this->_tpl->assign('mapItems', $maps);
        $this->_tpl->assign('hasInspectionData', $hasInspectionData);

        // Get the server metadata
        $server = new \Lizmap\Server\Server();
        $data = $server->getMetadata();
        $serverVersions = array(
            'qgis_server_version' => null,
            'qgis_server_version_int' => null,
            'lizmap_plugin_server_version' => null,
            'lizmap_plugin_server_version_int' => null,
        );
        if (!array_key_exists('error', $data['qgis_server_info'])) {
            // QGIS server
            $qgisServerVersion = $data['qgis_server_info']['metadata']['version'];
            $serverVersions['qgis_server_version'] = $qgisServerVersion;
            $explode = explode('.', $qgisServerVersion);
            // Keep only major and minor version
            $serverVersions['qgis_server_version_int'] = (int) $explode[0].str_pad($explode[1], 2, '0', STR_PAD_LEFT);

            // Lizmap server plugin
            $lizmapVersion = $data['info']['version'];
            $serverVersions['lizmap_plugin_server_version'] = $lizmapVersion;
        }
        $this->_tpl->assign('serverVersions', $serverVersions);

        // Add the application base path to let the template load the CSS and JS assets
        $basePath = jApp::urlBasePath();
        $this->_tpl->assign('basePath', $basePath);
    }

    /**
     * Get the QGIS project properties which must be displayed
     * in the administration project list table.
     *
     * @param string                         $inspectionDirectoryPath The path where the inspection files are stored
     * @param Lizmap\Project\ProjectMetadata $projectMetadata         The QGIS project metadata instance
     *
     * @return array The QGIS project properties
     */
    private function getProjectListItem($inspectionDirectoryPath, $projectMetadata)
    {
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
            'image' => jUrl::get(
                'view~media:illustration',
                array('repository' => $projectMetadata->getRepository(), 'project' => $projectMetadata->getId())
            ),
            'lizmap_plugin_version' => $projectMetadata->getLizmapPluginVersion(),
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
            \jLog::log($e->getMessage());

            return $inspectionData;
        }

        // Add the information
        $inspectionData['has_inspection_data'] = true;
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
}
