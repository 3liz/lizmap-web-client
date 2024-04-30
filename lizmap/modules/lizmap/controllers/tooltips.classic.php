<?php
/**
 * Get all tooltips.
 *
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : https://www.mozilla.org/MPL/
 */
class tooltipsCtrl extends jController
{
    /**
     * Get all tooltips.
     *
     * @urlparam $REPOSITORY Name of the repository
     * @urlparam $PROJECT Name of the project
     * @urlparam $LAYERID Layer Id
     *
     * @return jResponseJson geoJSON content
     */
    public function index()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $content = array();
        $rep->data = $content;

        // Get project and repository, and check rights
        $project = $this->param('project');
        $repository = $this->param('repository');
        $layerId = trim($this->param('layerId', ''));
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return $rep;
            }
        } catch (\Lizmap\Project\UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return $rep;
        }
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return $rep;
        }

        $qgisLayer = $lproj->getLayer($layerId);

        if (!$qgisLayer) {
            jMessage::add('The layer Id '.$layerId.' does not exist !', 'error');

            return $rep;
        }

        $tooltipLayers = $lproj->getTooltipLayers();
        $layerName = $qgisLayer->getName();

        if (isset($tooltipLayers->{$layerName}, $tooltipLayers->{$layerName}->{'template'})) {
            $tooltip = array('tooltip' => $tooltipLayers->{$layerName}->{'template'});

            $data = \qgisExpressionUtils::replaceExpressionText(
                $qgisLayer,
                $tooltip,
            );

            $rep->data = $data;
        }

        return $rep;
    }
}
