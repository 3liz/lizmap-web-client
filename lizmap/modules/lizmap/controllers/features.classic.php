<?php

use Lizmap\App\Checker;
use Lizmap\App\ControllerTools;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\Proxy;

/**
 * Get features from QGIS Server with the help of expressions.
 *
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : https://www.mozilla.org/MPL/
 */
class featuresCtrl extends jController
{
    /**
     * Get all tooltips of a given layer.
     *
     * @urlparam $REPOSITORY Name of the repository
     * @urlparam $PROJECT Name of the project
     * @urlparam $LAYERID Layer Id
     *
     * @return jResponseJson geoJSON content
     */
    public function tooltips()
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
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return $rep;
        }
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return $rep;
        }

        /**
         * @var null|qgisVectorLayer
         */
        $qgisLayer = $lproj->getLayer($layerId);
        if (!$qgisLayer) {
            jMessage::add('The layer Id '.$layerId.' does not exist !', 'error');

            return $rep;
        }

        $tooltipLayers = $lproj->getTooltipLayers();
        $layerName = $qgisLayer->getName();
        if (!isset($tooltipLayers->{$layerName})) {
            jMessage::add('No tooltip configuration has been found for the layer '.$layerName.' !', 'error');

            return $rep;
        }

        // Since LWC 3.8, tooltip can use HTML templates
        // If no template is found but instead a list of fields,
        // convert it to an HTML template
        if (isset($tooltipLayers->{$layerName}->{'template'})
            && !empty(trim($tooltipLayers->{$layerName}->{'template'}))
        ) {
            $template = trim($tooltipLayers->{$layerName}->{'template'});
        } else {
            // Default template : use layer display expressions
            $template = '[% display_expression() %]';

            // If some fields have been configured in the interface
            // create a table listing fields values
            if (isset($tooltipLayers->{$layerName}->{'fields'})) {
                $fields = trim($tooltipLayers->{$layerName}->{'fields'});
                $expFields = explode(',', $fields);
                if (!empty($fields)) {
                    // Build the table
                    $template = '<table class="lizmapPopupTable table table-condensed table-bordered table-striped">';

                    // Get fields aliases
                    $aliases = $qgisLayer->getAliasFields();

                    // Add each field as a table line
                    foreach ($expFields as $field) {
                        $template .= '<tr><th>'.($aliases[$field] ?: $field).'</th><td>[% "'.$field.'" %]</td></tr>';
                    }
                    $template .= '</table>';
                }
            }
        }

        $tooltip = array(
            // Get tooltip in HTML
            'tooltip' => $template,
        );

        $data = qgisExpressionUtils::replaceExpressionText(
            $qgisLayer,
            $tooltip,
        );

        $rep->data = $data;

        return $rep;
    }

    /**
     * Get display expressions evaluated for the given layer and parameters.
     *
     * @urlparam string  $REPOSITORY Name of the repository
     * @urlparam string  $PROJECT Name of the project
     * @urlparam string  $LAYERID Layer Id
     * @urlparam string  $EXP_FILTER QGIS expression filter
     * @urlparam string  $WITH_GEOMETRY If we need to get the features geometries
     * @urlparam string  $FIELDS List of field names separated by comma
     *
     * @return jResponseJson geoJSON content
     */
    public function displayExpression()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $content = array(
            'status' => 'error',
            'data' => null,
            'error' => 'An unexpected error occurred preventing to fetch the data',
        );
        $rep->data = $content;

        // Optional BASIC authentication
        $ok = Checker::checkCredentials($_SERVER);
        if (!$ok) {
            $content['error'] = jLocale::get('view~default.service.access.wrong_credentials.title');
            $rep->data = $content;

            // 401 : AuthorizationRequired
            $rep->setHttpStatus(401, Proxy::getHttpStatusMsg(401));

            // Add WWW-Authenticate header only for external clients
            // To avoid web browser to ask for login/password when session expires
            $addHeader = !ControllerTools::clientIsABrowser();
            // Add WWW-Authenticate header
            if ($addHeader) {
                $rep->addHttpHeader('WWW-Authenticate', 'Basic realm="LizmapWebClient", charset="UTF-8"');
            }

            return $rep;
        }

        // Get project and repository, and check rights
        $project = $this->param('project');
        $repository = $this->param('repository');
        $layerId = trim($this->param('layerId', ''));
        $withGeometry = trim($this->param('with_geometry', 'false'));
        if (!in_array(strtolower($withGeometry), array('true', 'false'))) {
            $withGeometry = 'false';
        }
        $fields = trim($this->param('fields', 'null'));
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                $content['error'] = 'The lizmap project '.strtoupper($project).' does not exist !';
                $rep->data = $content;

                return $rep;
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            $content['error'] = 'The lizmap project '.strtoupper($project).' does not exist !';
            $rep->data = $content;

            return $rep;
        }
        if (!$lproj->checkAcl()) {
            $content['error'] = jLocale::get('view~default.repository.access.denied');
            $rep->data = $content;

            return $rep;
        }

        /** @var null|qgisVectorLayer $qgisLayer */
        $qgisLayer = $lproj->getLayer($layerId);

        if ($qgisLayer === null) {
            $content['error'] = 'The layer Id '.$layerId.' does not exist !';
            $rep->data = $content;

            return $rep;
        }

        // Use Lizmap server plugin to evaluate the display expression & feature ID
        $expressions = array(
            // Get feature id
            'feature_id' => '@id',
            // Get display expression
            'display_expression' => 'display_expression()',
        );

        // Filter
        $exp_filter = trim($this->param('exp_filter', 'FALSE'));

        // AdditionalFields
        try {
            $additionalFields = json_decode($this->param('additionalFields', '[]'), true);
        } catch (Exception $e) {
            $content['error'] = 'An error occurred while evaluating additional fields';
            $rep->data = $content;

            return $rep;
        }

        $sortingField = trim($this->param('sorting_field', null));

        $sortingOrder = trim($this->param('sorting_order', 'asc'));

        // Limit
        $limit = trim($this->param('limit', 1000));

        // Get the evaluated features for the given layer and parameters
        $getDisplayExpressions = qgisExpressionUtils::virtualFields(
            $qgisLayer,
            $expressions,
            $exp_filter,
            $withGeometry,
            $fields,
            $limit,
            $sortingField,
            $sortingOrder,
            $additionalFields,
        );

        // If the returned content is null, an error occurred
        // while getting the data from QGIS Server lizmap plugin
        if ($getDisplayExpressions === null) {
            $content['error'] = 'An error occurred while getting the display name for the features !';
            $rep->data = $content;

            return $rep;
        }

        // Send the data on success
        $content = array(
            'status' => 'success',
            'data' => $getDisplayExpressions,
            'error' => null,
        );
        $rep->data = $content;

        return $rep;
    }
}
