<?php
/**
 * Construct the main view list.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class main_viewZone extends jZone
{
    protected $_tplname = 'view';

    protected function _prepareTpl()
    {
        $protocol = jApp::coord()->request->getProtocol();
        $this->_tpl->assign('protocol', $protocol);
        $domain = jApp::coord()->request->getDomainName();
        $this->_tpl->assign('domain', $domain);
        $this->_tpl->assign('auth_url_return', $this->param('auth_url_return'));
        $this->_tpl->assign('hide_header', $this->param('hide_header'));
        $this->_tpl->assign('isConnected', jAuth::isConnected());

        // Get lizmap services
        $services = lizmap::getServices();
        $this->_tpl->assign('allowUserAccountRequests', $services->allowUserAccountRequests);

        $maps = array();

        // Get repository data
        $repository = $this->param('repository');

        $repositories = array();
        if ($repository != null && jAcl2::check('lizmap.repositories.view', $repository)) {
            $repositories[] = $repository;
        } else {
            $repositories = lizmap::getRepositoryList();
        }

        // Get excluded project
        $excludedProject = $this->param('excludedProject');
        foreach ($repositories as $r) {
            if (jAcl2::check('lizmap.repositories.view', $r)) {
                $lrep = lizmap::getRepository($r);
                $mrep = new lizmapMainViewItem($r, $lrep->getData('label'));

                // WMS GetCapabilities Url
                $wmsGetCapabilitiesUrl = jAcl2::check(
                    'lizmap.tools.displayGetCapabilitiesLinks',
                    $lrep->getKey()
                );
                $wmtsGetCapabilitiesUrl = $wmsGetCapabilitiesUrl;

                $metadata = $lrep->getProjectsMetadata();
                foreach ($metadata as $meta) {
                    // Avoid project with no access rights
                    if (!$meta->getAcl()) {
                        continue;
                    }

                    // Hide project with option "hideProject"
                    if ($meta->getHidden()) {
                        continue;
                    }

                    // Get project information
                    if ($wmsGetCapabilitiesUrl) {
                        $wmsGetCapabilitiesUrl = $meta->getWMSGetCapabilitiesUrl();
                        $wmtsGetCapabilitiesUrl = $meta->getWMTSGetCapabilitiesUrl();
                    }
                    if ($lrep->getKey().'~'.$meta->getId() != $excludedProject) {
                        $mrep->childItems[] = new lizmapMainViewItem(
                            $meta->getId(),
                            $meta->getTitle(),
                            $meta->getAbstract(),
                            $meta->getKeywordList(),
                            $meta->getProj(),
                            $meta->getBbox(),
                            jUrl::get('view~map:index', array('repository' => $meta->getRepository(), 'project' => $meta->getId())),
                            jUrl::get('view~media:illustration', array('repository' => $meta->getRepository(), 'project' => $meta->getId())),
                            0,
                            $r,
                            'map',
                            $wmsGetCapabilitiesUrl,
                            $wmtsGetCapabilitiesUrl
                        );
                        /*} else {
                          $this->_tpl->assign('auth_url_return', jUrl::get('view~map:index',
                            array(
                              "repository"=>$lrep->getKey(),
                              "project"=>$meta->getId(),
                            )
                          ) );*/
                    }
                }
                if (count($mrep->childItems) != 0) {
                    usort($mrep->childItems, 'lizmapMainViewItem::mainViewItemSort');
                    $maps[$r] = $mrep;
                }
            }
        }

        $items = jEvent::notify('mainviewGetMaps')->getResponse();

        foreach ($items as $item) {
            if ($item->parentId) {
                if ($item->parentId.'~'.$item->id == $excludedProject) {
                    continue;
                }
                if (!isset($maps[$item->parentId])) {
                    $maps[$item->parentId] = new lizmapMainViewItem($item->parentId, '', '');
                }
                $replaced = false;
                foreach ($maps[$item->parentId]->childItems as $k => $i) {
                    if ($i->id == $item->id) {
                        $maps[$item->parentId]->childItems[$k] = $item;
                        $replaced = true;
                    }
                }
                if (!$replaced) {
                    $maps[$item->parentId]->childItems[] = $item;
                    usort($maps[$item->parentId]->childItems, 'lizmapMainViewItem::mainViewItemSort');
                }
            } else {
                if (isset($maps[$item->id])) {
                    $maps[$item->id]->copyFrom($item);
                } else {
                    $maps[$item->id] = $item;
                }
            }
        }

        usort($maps, 'lizmapMainViewItem::mainViewItemSort');
        foreach ($maps as $topitem) {
            usort($topitem->childItems, 'lizmapMainViewItem::mainViewItemSort');
        }
        $this->_tpl->assign('mapitems', $maps);
        $this->_tpl->assign('onlyMaps', $this->param('onlyMaps', false));
    }
}
