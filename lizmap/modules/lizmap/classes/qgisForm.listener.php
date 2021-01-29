<?php
/**
 * QGIS Form listener.
 *
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

use Lizmap\Form;

class qgisFormListener extends jEventListener
{
    public function onjformsPrepareToFillDynamicList($event)
    {
        $form = $event->getParam('form');
        $privateData = $form->getContainer()->privateData;
        if (!$privateData
            || !array_key_exists('liz_repository', $privateData)
            || !array_key_exists('liz_project', $privateData)
            || !array_key_exists('liz_layerId', $privateData)) {
            // it's not a QGIS Form
            return;
        }

        $repository = $privateData['liz_repository'];
        $project = $privateData['liz_project'];
        $layerId = $privateData['liz_layerId'];
        $featureId = $privateData['liz_featureId'];

        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            // Unknown repository
            return;
        }
        $lproj = lizmap::getProject($repository.'~'.$project);
        if (!$lproj) {
            // Unknown project
            return;
        }
        $layer = $lproj->getLayer($layerId);
        if (!$layer) {
            // Unknown layer
            return;
        }

        $qgisForm = new Form\QgisForm($layer, $form, $featureId, jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey()), lizmap::getAppContext());
    }
}
