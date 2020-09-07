<?php
/**
 * QGIS Form listener
 *
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisFormListener extends jEventListener
{

    public function onjformsPrepareToFillDynamicList($event)
    {
        $form = $event->getParam('form');
        $privateData = $form->getContainer()->privateData;

        $repository = $privateData['liz_repository'];
        $project = $privateData['liz_project'];
        $layerId = $privateData['liz_layerId'];
        $featureId = $privateData['liz_featureId'];

        $lrep = lizmap::getRepository($repository);
        $lproj = lizmap::getProject($repository.'~'.$project);
        $layer = $lproj->getLayer($layerId);

        $qgisForm = new qgisForm($layer, $form, $featureId, jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey()));
    }

}