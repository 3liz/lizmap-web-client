<?php
/**
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisExpressionUtils
{
    /**
     * Returns criteria dependencies (fields) for a QGIS expression.
     *
     * @param string $exp A QGIS expression string
     *
     * @return array The list of criteria dependencies
     */
    public static function getCriteriaFromExpression($exp)
    {
        if ($exp === null || trim($exp) === '') {
            return array();
        }
        preg_match_all('/"([^"]+)"/', $exp, $matches);
        if (count($matches) < 2) {
            return array();
        }

        return array_values(array_unique($matches[1]));
    }

    /**
     * Returns criteria dependencies (fields) for QGIS expressions.
     *
     * @param array $expressions list of QGIS expressions
     *
     * @return array The list of criteria dependencies
     */
    public static function getCriteriaFromExpressions($expressions)
    {
        $criteriaFrom = array();
        foreach ($expressions as $id => $exp) {
            if ($exp === null || trim($exp) === '') {
                continue;
            }
            $criteriaFrom = array_merge($criteriaFrom, self::getCriteriaFromExpression($exp));
        }

        return array_values(array_unique($criteriaFrom));
    }

    /**
     * Returns criteria dependencies (fields) in current_value() for QGIS
     * expression.
     *
     * @param string $exp A QGIS expression string
     *
     * @return array The list of criteria dependencies
     */
    public static function getCurrentValueCriteriaFromExpression($exp)
    {
        preg_match_all('/\\bcurrent_value\\(\\s*\'([^)]*)\'\\s*\\)/', $exp, $matches);
        if (count($matches) == 2) {
            return array_values(array_unique($matches[1]));
        }

        return array();
    }

    /**
     * Returns true if @current_geometry is in the QGIS expression.
     *
     * @param string $exp A QGIS expression string
     *
     * @return bool @current_geometry is in the QGIS expression
     */
    public static function hasCurrentGeometry($exp)
    {
        return preg_match('/\\B@current_geometry\\b/', $exp) === 1;
    }

    /**
     * Returns the expression used to filter by login the layer.
     *
     * This method combines the attribute and the spatial filter expressions.
     *
     * @param qgisVectorLayer $layer   A QGIS vector layer
     * @param bool            $edition It's for editing
     *
     * @return string the expression to filter by login the layer
     */
    public static function getExpressionByUser($layer, $edition = false)
    {
        $project = $layer->getProject();
        $repository = $project->getRepository();
        // No filter data by login rights
        if (jAcl2::check('lizmap.tools.loginFilteredLayers.override', $repository->getKey())) {
            return '';
        }

        // get login filter
        $loginFilterObj = $project->getLoginFilter($layer->getName(), $edition);
        $loginFilter = '';
        if (!empty($loginFilterObj) && array_key_exists('filter', $loginFilterObj)) {
            $loginFilter = $loginFilterObj['filter'];
        }
        // get polygon filter
        $polygonFilter = $layer->getPolygonFilterExpression($edition);

        // filters are empty
        if (empty($loginFilter) && empty($polygonFilter)) {
            return '';
        }
        // login filter is empty and not the polygon filter
        if (!empty($loginFilter) && empty($polygonFilter)) {
            return $loginFilter;
        }
        // polygon filter is empty and not the login filter
        if (empty($loginFilter)) {
            return $polygonFilter;
        }

        // Combine filters
        return '('.$loginFilter.') AND ('.$polygonFilter.')';
    }

    /**
     * Returns the expression updated if filter by login is applied for the layer.
     *
     * @param qgisVectorLayer $layer      A QGIS vector layer
     * @param string          $expression The expression to update
     * @param bool            $edition    It's for edition
     *
     * @return string the expression updated or not
     */
    public static function updateExpressionByUser($layer, $expression, $edition = false)
    {
        $expByUser = self::getExpressionByUser($layer, $edition);

        if ($expByUser === '') {
            return $expression;
        }

        return '('.$expression.') AND ('.$expByUser.')';
    }

    /**
     * Request QGIS Server and the lizmap plugin calculate virtual fields
     * for the features of a given vector layer.
     *
     * A filter can be used to retrieve the virtual fields values only
     * for a subset of features.
     *
     * @param qgisVectorLayer $layer         A QGIS vector layer
     * @param array           $virtualFields The expressions' list to evaluate as key
     * @param string          $filter        A filter to restrict virtual fields creation
     *
     * @return null|array the features with virtual fields
     */
    public static function virtualFields($layer, $virtualFields, $filter = null)
    {
        // Evaluate the expression by qgis
        $project = $layer->getProject();
        $params = array(
            'service' => 'EXPRESSION',
            'request' => 'VirtualFields',
            'map' => $project->getRelativeQgisPath(),
            'layer' => $layer->getName(),
            'virtuals' => json_encode($virtualFields),
            'with_geometry' => 'true',
        );
        if ($filter) {
            $params['filter'] = $filter;
        }

        // Request virtual fields
        $json = self::request($params, $project);
        if (!$json) {
            return null;
        }
        if (property_exists($json, 'type')
            && $json->type == 'FeatureCollection'
            && property_exists($json, 'features')) {
            // Get results
            return $json->features;
        }

        return null;
    }

    /**
     * Request QGIS Server and the lizmap plugin to evaluate QGIS expressions.
     *
     * @param qgisVectorLayer $layer        A QGIS vector layer
     * @param array           $expressions  The expressions' list to evaluate
     * @param array           $form_feature A feature to add to the evaluation context
     *
     * @return null|object the results of expressions' evaluation
     */
    public static function evaluateExpressions($layer, $expressions, $form_feature = null)
    {
        // Evaluate the expression by qgis
        $project = $layer->getProject();
        $params = array(
            'service' => 'EXPRESSION',
            'request' => 'Evaluate',
            'map' => $project->getRelativeQgisPath(),
            'layer' => $layer->getName(),
            'expressions' => json_encode($expressions),
        );
        if ($form_feature) {
            $params['feature'] = json_encode($form_feature);
            $params['form_scope'] = 'true';
        }

        // Request evaluate expression
        $json = self::request($params, $project);
        if (!$json) {
            return null;
        }
        if (property_exists($json, 'status')
            && $json->status == 'success'
            && property_exists($json, 'results')) {
            // Get results
            return $json->results[0];
        }

        if (property_exists($json, 'data')) {
            // TODO parse errors
            // if (property_exists($json, 'errors')) {
            // }
            jLog::log($json->data, 'error');
        } else {
            // Data not well formed
            jLog::log(json_encode($json), 'error');
        }

        return null;
    }

    /**
     * Request QGIS Server to provide features with a form scope used for drilling down select.
     *
     * @param qgisVectorLayer $layer        A QGIS vector layer
     * @param string          $expression   The expressions' list to evaluate
     * @param array           $form_feature The feature in the form
     * @param array           $fields       List of requested fields
     * @param bool            $edition      It's for edition
     * @param mixed           $expression
     *
     * @return array the features filtered with a form scope
     */
    public static function getFeatureWithFormScope($layer, $expression, $form_feature, $fields, $edition = false)
    {
        $project = $layer->getProject();
        // build parameters
        $params = array(
            'service' => 'EXPRESSION',
            'request' => 'getFeatureWithFormScope',
            'map' => $project->getRelativeQgisPath(),
            'layer' => $layer->getName(),
            'filter' => self::updateExpressionByUser($layer, $expression, $edition),
            'form_feature' => json_encode($form_feature),
            'fields' => implode(',', $fields),
        );

        // Request getFeatureWithFormsScope
        $json = self::request($params, $project);
        if (!$json || !property_exists($json, 'features')) {
            return array();
        }

        return $json->features;
    }

    /**
     * Return form group visibilities.
     *
     * @param qgisAttributeEditorElement $attributeEditorForm
     * @param jFormsBase                 $form
     *
     * @return array visibilities, an associated array with group html id as key and boolean as value
     */
    public static function evaluateGroupVisibilities($attributeEditorForm, $form)
    {
        // QgisForm::getAttributesEditorForm can return null
        if ($attributeEditorForm === null || $form === null) {
            return array();
        }
        // Get criteria and expressions to evaluate
        // and prepare visibilities
        $criteriaFrom = array();
        $expressions = array();
        $visibilities = array();
        $visibilityExpressions = $attributeEditorForm->getGroupVisibilityExpressions();
        foreach ($visibilityExpressions as $id => $exp) {
            $visibilities[$id] = true;

            if ($exp === null || trim($exp) === '') {
                // Expression is empty
                continue;
            }

            $crit = self::getCriteriaFromExpression($exp);
            if (count($crit) === 0) {
                // No criteria dependencies found
                continue;
            }

            $expressions[$id] = $exp;
            $criteriaFrom = array_merge($criteriaFrom, $crit);
        }
        $criteriaFrom = array_values(array_unique($criteriaFrom));

        // No expressions to evaluate or no criteria dependencies.
        if (count($expressions) === 0 || count($criteriaFrom) === 0) {
            return $visibilities;
        }

        // build feature's form
        $geom = null;
        $values = array();
        foreach ($criteriaFrom as $ref) {
            if ($ref == $form->getData('liz_geometryColumn')) {
                // from wkt to geom
                $wkt = trim($form->getData($ref));
                if ($wkt && \lizmapWkt::check($wkt)) {
                    $geom = \lizmapWkt::parse($wkt);
                    if ($geom === null) {
                        \jLog::log('Parsing WKT failed! '.$wkt, 'error');
                    }
                }
            } else {
                // properties
                $values[$ref] = $form->getData($ref);
            }
        }

        $repository = $form->getData('liz_repository');
        $project = $form->getData('liz_project');
        $lproj = lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($form->getData('liz_layerId'));

        // Update expressions with filter by user
        $updatedExp = array();
        foreach ($expressions as $k => $exp) {
            $updatedExp[$k] = self::updateExpressionByUser($layer, $exp);
        }

        $form_feature = array(
            'type' => 'Feature',
            'geometry' => $geom,
            'properties' => $values,
        );

        $params = array(
            'service' => 'EXPRESSION',
            'request' => 'Evaluate',
            'map' => $lproj->getRelativeQgisPath(),
            'layer' => $layer->getName(),
            'expressions' => json_encode($expressions),
            'feature' => json_encode($form_feature),
            'form_scope' => 'true',
        );

        // Request evaluate constraint expressions
        $url = \Lizmap\Request\Proxy::constructUrl($params, lizmap::getServices());
        $options = array('method' => 'post');
        list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($url, $options);

        // Check data from request
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            $json = json_decode($data);
            if (property_exists($json, 'status') && $json->status != 'success') {
                // TODO parse errors
                // if (property_exists($json, 'errors')) {
                // }
                jLog::log($data, 'error');
            } elseif (property_exists($json, 'results')
                && array_key_exists(0, $json->results)) {
                // Get results
                $results = (array) $json->results[0];
                foreach ($results as $id => $result) {
                    if ($result === 0) {
                        $visibilities[$id] = false;
                    }
                }
            } else {
                // Data not well formed
                jLog::log($data, 'error');
            }
        }

        return $visibilities;
    }

    /**
     * Performing the request to QGIS Server.
     *
     * @param array                               $params
     * @param \Lizmap\Project\Project|qgisProject $project
     *
     * @return null|object The response content or null
     */
    protected static function request($params, $project)
    {
        // Add user identification parameters
        $merged_params = array_merge($params, array(
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
        ));

        // Check authentication
        $appContext = $project->getAppContext();
        if ($appContext->UserIsConnected()) {
            // Provide user and groups to lizmap plugin access control
            $user = $appContext->getUserSession();
            $userGroups = $appContext->aclUserPublicGroupsId();
            $loginFilteredOverride = $appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $project->getRepository()->getKey());

            $merged_params = array_merge($params, array(
                'Lizmap_User' => $user->login,
                'Lizmap_User_Groups' => implode(', ', $userGroups),
                'Lizmap_Override_Filter' => $loginFilteredOverride,
            ));
        }
        $url = \Lizmap\Request\Proxy::constructUrl($merged_params, lizmap::getServices());
        // Use POST method as the expressions can be heavy (polygon filter)
        $options = array('method' => 'post');
        list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($url, $options);

        // Check data from request
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            return json_decode($data);
        }

        return null;
    }
}
