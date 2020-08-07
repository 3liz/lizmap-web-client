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
     * Return criteria dependencies (fields) for a QGIS expression
     *
     * @param string $exp A QGIS expression string
     *
     * @return array The list of criteria dependencies
     *
     */
    static public function getCriteriaFromExpression($exp)
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
     * Return criteria dependencies (fields) for QGIS expressions
     *
     * @param array $expressions list of QGIS expressions
     *
     * @return array The list of criteria dependencies
     *
     */
    static public function getCriteriaFromExpressions($expressions)
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

    static public function updateExpressionByUser($layer, $expression)
    {
        $project = $layer->getProject();
        $repository = $project->getRepository();
        // No filter data by login rights
        if (jAcl2::check('lizmap.tools.loginFilteredLayers.override', $repository->getKey())) {
            return $expression;
        }

        // get login filters
        $loginFilters = $project->getLoginFilters(array($layer->getName()));

        // login filters array is empty
        if (empty($loginFilters)) {
            return $expression;
        }

        // layer not in login filters array
        if (array_key_exists($layer->getName(), $loginFilters)) {
            return $expression;
        }

        return '('.$expression.') AND ('.$loginFilters[$layer->getName()].')';
    }

    static public function evaluateExpressions($layer, $expressions, $form_feature=null)
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
                jLog::log($data, 'error');
            } else if (property_exists($json, 'results') &&
                array_key_exists(0, $json->results)) {
                // Get results
                return $json->results[0];
            } else {
                // Data not well formed
                jLog::log($data, 'error');
            }
        }
        return null;
    }

    /**
     * Return form group visibilities.
     *
     * @param qgisAttributeEditorElement $attributeEditorForm
     * @param jFormsBase                 $form
     *
     * @return array Visibilities, an associated array with group html id as key and boolean as value.
     *
     */
    static public function evaluateGroupVisibilities($attributeEditorForm, $form)
    {
        // qgisForm::getAttributesEditorForm can return null
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
            $visibilities[$id] = True;

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

        $form_feature = array(
            'type' => 'Feature',
            'geometry' => $geom,
            'properties' => $values
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
        $url = lizmapProxy::constructUrl($params, array('method' => 'post'));
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

        // Check data from request
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            $json = json_decode($data);
            if (property_exists($json, 'status') && $json->status != 'success') {
                // TODO parse errors
                // if (property_exists($json, 'errors')) {
                // }
                jLog::log($data, 'error');
            } else if (property_exists($json, 'results') &&
                array_key_exists(0, $json->results)) {
                // Get results
                $results = (array) $json->results[0];
                foreach ($results as $id => $result) {
                    if ($result === 0) {
                        $visibilities[$id] = False;
                    }
                }
            } else {
                // Data not well formed
                jLog::log($data, 'error');
            }
        }

        return $visibilities;
    }

    static protected function request($params)
    {
        $url = lizmapProxy::constructUrl($params, array('method' => 'post'));
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

        // Check data from request
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            return json_decode($data);
        }

        return null;
    }
}