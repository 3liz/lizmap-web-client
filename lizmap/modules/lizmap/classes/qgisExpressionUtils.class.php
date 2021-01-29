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
     * @param qgisVectorLayer $layer   A QGIS vector layer
     * @param bool            $edition It's for editon
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
        $loginFilter = $project->getLoginFilter($layer->getName(), $edition);

        // login filters array is empty
        if (empty($loginFilter)) {
            return '';
        }

        // layer not in login filters array
        if (!array_key_exists('filter', $loginFilter)) {
            return '';
        }

        return $loginFilter['filter'];
    }

    /**
     * Returns the expression updated if filter by login is applied for the layer.
     *
     * @param qgisVectorLayer $layer      A QGIS vector layer
     * @param string          $expresion  The expression to update
     * @param bool            $edition    It's for editon
     * @param mixed           $expression
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
     * Request QGIS Server and the lizmap plugin to evaluate QGIS expressions.
     *
     * @param qgisVectorLayer $layer        A QGIS vector layer
     * @param array()         $expresions   The expressions' list to evaluate
     * @param array()         $form_feature A feature to add to the evaluation context
     * @param mixed           $expressions
     *
     * @return array() the results of expressions' evalutaion
     */
    public static function evaluateExpressions($layer, $expressions, $form_feature = null)
    {
        // Evaluate the expression by qgis
        $project = $layer->getProject();
        $plugins = $project->getQgisServerPlugins();
        if (array_key_exists('Lizmap', $plugins)) {
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
            $json = self::request($params);
            if (!$json) {
                return null;
            }
            if (property_exists($json, 'status') && $json->status != 'success') {
                // TODO parse errors
                // if (property_exists($json, 'errors')) {
                // }
                jLog::log($json->data, 'error');
            } elseif (property_exists($json, 'results')
                && array_key_exists(0, $json->results)) {
                // Get results
                return $json->results[0];
            } else {
                // Data not well formed
                jLog::log($json->data, 'error');
            }
        }

        return null;
    }

    /**
     * Request QGIS Server to provide features with a form scope used for drilling down select.
     *
     * @param qgisVectorLayer $layer        A QGIS vector layer
     * @param string          $expresion    The expressions' list to evaluate
     * @param array()         $form_feature The feature in the form
     * @param array()         $fields       List of requested fields
     * @param bool            $edition      It's for editon
     * @param mixed           $expression
     *
     * @return array() the features filtered with a form scope
     */
    public static function getFeatureWithFormScope($layer, $expression, $form_feature, $fields, $edition = false)
    {
        $project = $layer->getProject();
        $plugins = $project->getQgisServerPlugins();
        if (array_key_exists('Lizmap', $plugins)) {
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
            $json = self::request($params);
            if (!$json || !property_exists($json, 'features')) {
                return array();
            }

            return $json->features;
        }

        return array();
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
        // Get criterias and expressions to evaluate
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
                $geom = lizmapWkt::parse($wkt);
            } else {
                // properties
                $values[$ref] = $form->getData($ref);
            }
        }

        $privateData = $form->getContainer()->privateData;
        $repository = $privateData['liz_repository'];
        $project = $privateData['liz_project'];
        $lproj = lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($privateData['liz_layerId']);

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
        list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($url);

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

    protected static function request($params)
    {
        $url = \Lizmap\Request\Proxy::constructUrl($params, lizmap::getServices());
        list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($url);

        // Check data from request
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            return json_decode($data);
        }

        return null;
    }
}
