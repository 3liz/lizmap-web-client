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

        foreach ($repositories as $r) {
            $lrep = lizmap::getRepository($r);
            $mrep = new lizmapMainViewItem($r, $lrep->getLabel());
            $metadata = $lrep->getProjectsMetadata();
            foreach ($metadata as $meta) {
                // Get QGIS project version
                $qgis_version_int = $meta->getQgisProjectVersion();
                $qgis_version = substr($qgis_version_int, 0, 1);
                $qgis_version .= '.'.ltrim(substr($qgis_version_int, 1, 2), '');
                $qgis_version .= '.'.ltrim(substr($qgis_version_int, 3, 2), '');

                // Build the project properties table
                $project_item = array(
                    'id' => $meta->getId(),
                    'title' => $meta->getTitle(),
                    'abstract' => $meta->getAbstract(),
                    'projection' => $meta->getProj(),
                    'url' => jUrl::get(
                        'view~map:index',
                        array('repository' => $meta->getRepository(), 'project' => $meta->getId())
                    ),
                    'image' => jUrl::get(
                        'view~media:illustration',
                        array('repository' => $meta->getRepository(), 'project' => $meta->getId())
                    ),
                    'qgis_version' => $qgis_version,
                    // keep only major and minor versions. Ex: 322 for 3.22.04
                    'qgis_version_int' => (int) substr($qgis_version_int, 0, 3),
                    'lizmap_plugin_version' => $meta->getLizmapPluginVersion(),
                    'file_time' => $meta->getFileTime(),
                    'layer_count' => $meta->getLayerCount(),
                    'acl_groups' => $meta->getAclGroups(),
                    'hidden_project' => $meta->getHidden(),
                );
                $mrep->childItems[] = $project_item;
            }
            $maps[$r] = $mrep;
        }
        $this->_tpl->assign('map_items', $maps);

        // Get the server metadata
        $server = new \Lizmap\Server\Server();
        $data = $server->getMetadata();
        $server_versions = array(
            'qgis_server_version' => null,
            'qgis_server_version_int' => null,
            'lizmap_plugin_server_version' => null,
            'lizmap_plugin_server_version_int' => null,
        );
        if (!array_key_exists('error', $data['qgis_server_info'])) {
            // QGIS server
            $qgis_server_version = $data['qgis_server_info']['metadata']['version'];
            $server_versions['qgis_server_version'] = $qgis_server_version;
            $explode = explode('.', $qgis_server_version);
            // Keep only major and minor version
            $server_versions['qgis_server_version_int'] = (int) $explode[0].str_pad($explode[1], 2, '0', STR_PAD_LEFT);

            // Lizmap server plugin
            $lizmap_version = $data['info']['version'];
            $server_versions['lizmap_plugin_server_version'] = $lizmap_version;
        }
        $this->_tpl->assign('server_versions', $server_versions);

        // Add JS code for datatable
        $bp = jApp::urlBasePath();
    }
}
