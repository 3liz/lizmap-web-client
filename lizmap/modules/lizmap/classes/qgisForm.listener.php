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
        /** @var jFormsBase $form */
        $form = $event->getParam('form');

        if ($form->getSelector() != 'view~edition'
            || $form->getData('liz_repository') == ''
            || $form->getData('liz_project') == ''
            || $form->getData('liz_layerId') == ''
        ) {
            // it's not a QGIS Form
            return;
        }

        $repository = $form->getData('liz_repository');
        $project = $form->getData('liz_project');
        $layerId = $form->getData('liz_layerId');
        $featureId = $form->getData('liz_featureId');

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
