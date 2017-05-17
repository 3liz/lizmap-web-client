<?php
/**
* Construct the view list for ajax.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

class ajax_viewZone extends jZone {

   protected $_tplname='view';

   protected function _prepareTpl(){
        $protocol = jApp::coord()->request->getProtocol();
        $this->_tpl->assign('protocol', $protocol);
        $domain = jApp::coord()->request->getDomainName();
        $this->_tpl->assign('domain', $domain);

        $maps = array();

        // Get repository data
        $repository = $this->param('repository');

        $repositories = Array();
        if ($repository != null && jAcl2::check('lizmap.repositories.view', $repository)){
          $repositories[] = $repository;
        } else {
          $repositories = lizmap::getRepositoryList();
        }

        foreach ($repositories as $r) {
          if(jAcl2::check('lizmap.repositories.view', $r)){
            $lrep = lizmap::getRepository($r);
            $mrep = new lizmapMainViewItem($r, $lrep->getData('label'));
            $lprojects = $lrep->getProjects();
            foreach ($lprojects as $p) {
              if ( !$p->checkAcl() )
                continue;
              $mrep->childItems[] = new lizmapMainViewItem(
                $p->getData('id'),
                $p->getData('title'),
                $p->getData('abstract'),
                $p->getData('proj'),
                $p->getData('bbox'),
                jUrl::getFull('view~map:index', array("repository"=>$p->getData('repository'),"project"=>$p->getData('id'))),
                jUrl::getFull('view~media:illustration', array("repository"=>$p->getData('repository'),"project"=>$p->getData('id'))),
                0,
                $r,
                'map'
              );
            }
            $maps[$r] = $mrep;
          }
        }

        $req = jApp::coord()->request;
        $items = jEvent::notify('mainviewGetMaps')->getResponse();

        foreach ($items as $item) {
            if($item->parentId) {
                if(!isset($maps[$item->parentId])) {
                  $maps[$item->parentId] = new lizmapMainViewItem($item->parentId, '', '');
                }
                $replaced = false;
                foreach( $maps[$item->parentId]->childItems as $k => $i ) {
                  if ( $i->id == $item->id ) {
                    if (!preg_match('/^http/', $item->img))
                      $item->img = $req->getServerURI().$item->img;
                    if (!preg_match('/^http/', $item->url))
                      $item->url = $req->getServerURI().$item->url;
                    $maps[$item->parentId]->childItems[$k] = $item;
                    $replaced = true;
                  }
                }
                if( !$replaced )
                  $maps[$item->parentId]->childItems[] = $item;
            }
            else {
                if(isset($maps[$item->id])) {
                  $item->img = $maps[$item->id]->img;
                  $maps[$item->id]->copyFrom($item);
                }
                else {
                    $maps[$item->id] = $item;
                }
            }
        }

        usort($maps, "lizmapMainViewItem::mainViewItemSort");
        foreach($maps as $topitem) {
            usort($topitem->childItems, "lizmapMainViewItem::mainViewItemSort");
        }
        $this->_tpl->assign('mapitems', $maps);

   }
}
