<?php

/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Server;

use Jelix\Core\Infos\AppInfos;
use Lizmap\Request\Proxy;
use LizmapAdmin\ModulesInfo\ModulesChecker;

class Server
{
    /**
     * @var array Metadata about LWC installation & QGIS Server status and configuration
     */
    protected $metadata;

    /**
     * constructor.
     */
    public function __construct()
    {
        $lizmap_data = $this->getLizmapMetadata();
        $lizmap_data['qgis_server_info'] = $this->getQgisServerMetadata();

        // The lizmap plugin is not installed or not well configured
        // We try QGIS Server with a WMS GetCapabilities without map parameter
        if (array_key_exists('error', $lizmap_data['qgis_server_info'])) {
            $lizmap_data['qgis_server'] = $this->tryQgisServer();
        }

        $this->metadata = $lizmap_data;
    }

    /** Get the server metadata.
     *
     */
    public function getMetadata()
    {
        return $this->metadata;
    }

    /** Get the current Lizmap server version.
     *
     * @return null|string String containing the current Lizmap QGIS server version or null
     */
    public function getLizmapPluginServerVersion()
    {
        if (array_key_exists('error', $this->metadata['qgis_server_info'])) {
            return null;
        }

        return $this->metadata['qgis_server_info']['plugins']['lizmap_server']['version'];
    }

    /** Get the current QGIS server version.
     *
     * @return null|string String containing the current QGIS server version or null
     */
    public function getQgisServerVersion()
    {
        if (array_key_exists('error', $this->metadata['qgis_server_info'])) {
            return null;
        }

        return $this->metadata['qgis_server_info']['metadata']['version'];
    }

    /** Check if a QGIS server plugin needs to be updated.
     *
     * @param string $currentVersion  The current version to check
     * @param string $requiredVersion The minimum required version
     *
     * @return bool boolean If the plugin needs to be updated
     */
    public function pluginServerNeedsUpdate($currentVersion, $requiredVersion)
    {
        if ($currentVersion == 'master' || $currentVersion == 'dev') {
            return false;
        }

        return $this->versionCompare($currentVersion, $requiredVersion);
    }

    /** Compare two versions and return true if the second parameter is greater or equal to the first parameter.
     *
     * @param null|string $currentVersion  The current version to check
     * @param string      $requiredVersion The minimum required version
     *
     * @return bool boolean If the software needs to be updated or True if the current version is null
     */
    public function versionCompare($currentVersion, $requiredVersion)
    {
        if (is_null($currentVersion)) {
            return true;
        }

        return version_compare($currentVersion, $requiredVersion) < 0;
    }

    /** Get the current recommended/required Lizmap desktop plugin.
     * This value is only forward to the plugin thanks to the server metadata. The plugin will decide if it's
     * recommended or required.
     *
     * This is experimental for now on the plugin side.
     *
     * @return string String containing the version
     */
    public function getLizmapPluginDesktopVersion()
    {
        return \jApp::config()->minimumRequiredVersion['lizmapDesktopPlugin'];
    }

    /**
     * Get the list of groups having the given right
     * for the given repository.
     *
     * It helps to list all the groups which can edit
     * or view the projects for a repository
     *
     * @param string $repositoryKey The repository key
     * @param string $rightSubject  The right subject key
     *
     * @return array The list of groups
     */
    private function getRepositoryAuthorizedGroupsForRight($repositoryKey, $rightSubject)
    {
        $daoRight = \jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
        $conditions = \jDao::createConditions();
        $conditions->addCondition('id_aclsbj', '=', $rightSubject);
        $conditions->addCondition('id_aclres', '=', $repositoryKey);
        $res = $daoRight->findBy($conditions);
        $groups = array();
        foreach ($res as $rec) {
            $groups[] = $rec->id_aclgrp;
        }

        return $groups;
    }

    /**
     * Get the data on Lizmap repositories.
     *
     * Fetch the key, label and relative path
     *
     * @return array List of Lizmap repositories
     */
    private function getLizmapRepositories()
    {
        $repositories = array();
        $services = \lizmap::getServices();
        $rootRepositories = $services->getRootRepositories();
        foreach (\lizmap::getRepositoryList() as $repositoryKey) {
            // Get the repository instance
            $lizmapRepository = \lizmap::getRepository($repositoryKey);
            if (!$lizmapRepository) {
                continue;
            }

            // Do not add the repository if the connected user cannot access it
            if (!\jAcl2::check('lizmap.repositories.view', $repositoryKey)) {
                continue;
            }

            // Prepare the repository data to return
            $repositories[$repositoryKey] = array(
                'label' => $lizmapRepository->getLabel(),
                'path' => $lizmapRepository->getPath(),
            );

            // Compute the relative repository path
            $path = $lizmapRepository->getPath();
            if (substr($path, 0, strlen($rootRepositories)) === $rootRepositories) {
                $relativePath = str_replace($rootRepositories, '', $path);
                $repositories[$repositoryKey]['path'] = $relativePath;
            }

            // Add the authorized groups
            $authorizedGroups = $this->getRepositoryAuthorizedGroupsForRight(
                $repositoryKey,
                'lizmap.repositories.view'
            );
            $repositories[$repositoryKey]['authorized_groups'] = $authorizedGroups;

            // Add the editing authorized groups
            $editingAuthorizedGroups = $this->getRepositoryAuthorizedGroupsForRight(
                $repositoryKey,
                'lizmap.tools.edition.use'
            );
            $repositories[$repositoryKey]['editing_authorized_groups'] = $editingAuthorizedGroups;

            // Add the projects
            $repositoryProjects = $lizmapRepository->getProjectsMainData();
            $projects = array();
            foreach ($repositoryProjects as $project) {
                if (!$project->getAcl()) {
                    continue;
                }
                $projects[$project->getId()] = array(
                    'title' => $project->getTitle(),
                );
            }
            $repositories[$repositoryKey]['projects'] = $projects;
        }

        return $repositories;
    }

    /**
     * Get the list of modules.
     *
     * @return array List of modules
     */
    private function getModules()
    {
        $data = array();
        $modules = new ModulesChecker();

        foreach ($modules->getList(false) as $info) {
            $data[$info->slug] = array(
                'version' => $info->version,
                'core' => $info->isCore,
            );
        }

        return $data;
    }

    /**
     * Get the data on Lizmap groups of users.
     *
     * Fetch the key and label of the user groups
     *
     * @return array List of groups of users
     */
    private function getAclGroups()
    {
        $groups = array();
        // Get all the groups
        $aclGroupList = \jAcl2DbUserGroup::getGroupList();
        foreach ($aclGroupList as $group) {
            $groups[$group->id_aclgrp] = array(
                'label' => $group->name,
                // "default" => ($group->grouptype == \jAcl2DbUserGroup::GROUPTYPE_PRIVATE)
            );
        }

        return $groups;
    }

    /**
     * Get Lizmap Web Client metadata.
     *
     * @return array Array containing the Lizmap Web Client installation metadata
     */
    private function getLizmapMetadata()
    {
        $data = array();

        // Get Lizmap version from project.xml
        $projectInfos = AppInfos::load();
        // Version
        $data['info'] = array();
        $data['info']['version'] = $projectInfos->version;
        $data['info']['date'] = $projectInfos->versionDate;
        $data['info']['commit'] = \jApp::config()->commitSha;

        $jelixVersion = \jFramework::version();

        // Dependencies
        $data['dependencies'] = array(
            'jelix' => array(
                'version' => $jelixVersion,
                // @deprecated
                'minversion' => $jelixVersion,
                // @deprecated
                'maxversion' => $jelixVersion,
            ),
        );

        // Add information about available APIs
        $data['api'] = array(
            'dataviz' => array(
                // Version of the dataviz API
                // (allowing to get a plot data by posting the configuration)
                'version' => '1.0.0',
            ),
        );

        $serverInfoAccess = (\jAcl2::check('lizmap.admin.access') || \jAcl2::check('lizmap.admin.server.information.view'));
        if ($serverInfoAccess) {
            if (isset(\jApp::config()->lizmap['hosting'])) {
                $data['hosting'] = \jApp::config()->lizmap['hosting'];
            }

            // Add the list of repositories
            $data['repositories'] = $this->getLizmapRepositories();

            // Add the list of modules
            $data['modules'] = $this->getModules();

            $data['lizmap_desktop_plugin_version'] = $this->getLizmapPluginDesktopVersion();

            // Add the list of user groups
            $data['acl'] = array(
                'groups' => $this->getAclGroups(),
            );
        }

        return $data;
    }

    /**
     * Get QGIS Server status and metadata.
     * We use the new entrypoint /lizmap/server.json.
     *
     * @return array QGIS Server and plugins metadata. In case of error, it contains
     *               a 'error' key.
     */
    private function getQgisServerMetadata()
    {
        // Get Lizmap services
        $services = \lizmap::getServices();

        // Get the data from the QGIS Server Lizmap plugin
        list($resp, $mime, $code) = Proxy::getRemoteData($services->getUrlLizmapQgisServerMetadata());
        if ($code == 200 && $mime == 'application/json' && strpos((string) $resp, 'metadata') !== false) {
            // Convert the JSON to an associative array
            $qgis_server_data = json_decode($resp, true);
            if (!empty($qgis_server_data) && array_key_exists('qgis_server', $qgis_server_data)) {
                $data = $qgis_server_data['qgis_server'];
            } else {
                $data = array('error' => 'BAD_DATA');
            }
        } else {
            $data = array('error' => 'HTTP_ERROR', 'error_http_code' => $code, 'error_message' => $resp);
        }

        return $data;
    }

    /**
     * Try QGIS Server with a WMS GetCapabilities without MAP parameter.
     *
     * @return array Array containing try information
     */
    private function tryQgisServer()
    {
        // Get Lizmap services
        $services = \lizmap::getServices();

        // Try a request to QGIS Server
        $data = array();
        $params = array(
            'service' => 'WMS',
            'request' => 'GetCapabilities',
        );
        $url = Proxy::constructUrl($params, $services);
        list($resp, $mime, $code) = Proxy::getRemoteData($url);
        if (
            preg_match('#ServerException#i', $resp)
            || preg_match('#ServiceExceptionReport#i', $resp)
            || preg_match('#WMS_Capabilities#i', $resp)
        ) {
            $data['test'] = 'OK';
        } else {
            $data['test'] = 'ERROR';
        }
        $data['mime_type'] = $mime;
        if (\jAcl2::check('lizmap.admin.server.information.view')) {
            $data['http_code'] = $code;
            $data['response'] = $resp;
        }

        return $data;
    }
}
