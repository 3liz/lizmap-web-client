<?php

use Lizmap\Project\UnknownLizmapProjectException;

/**
 * PHP proxy to execute action request.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License
 */
class serviceCtrl extends jController
{
    /**
     * Perform the appropriate action depending on the NAME parameter.
     *
     * @urlparam $REPOSITORY Name of the repository
     * @urlparam $PROJECT Name of the project
     * @urlparam $NAME The action name
     * @urlparam $LAYERID Layer Id
     * @urlparam $FEATUREID Feature Id
     * @urlparam $WKT An optional geometry in WKT format
     *
     * @return jResponseJson the request response
     */
    public function index()
    {
        // Get parameters
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = trim($this->param('layerId', ''));
        $featureId = $this->intParam('featureId', -1);

        // Check the project, repository and the access rights
        try {
            $lizmapProject = lizmap::getProject($repository.'~'.$project);
            if (!$lizmapProject) {
                $errors = array(
                    'title' => 'Wrong repository and project !',
                    'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                );

                return $this->error($errors);
            }
        } catch (UnknownLizmapProjectException $e) {
            $errors = array(
                'title' => 'Wrong repository and project !',
                'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
            );

            return $this->error($errors);
        }

        // Redirect if the user has no right to access this repository
        if (!$lizmapProject->checkAcl()) {
            $errors = array(
                'title' => 'Access forbidden',
                'detail' => jLocale::get('view~default.repository.access.denied'),
            );

            return $this->error($errors);
        }

        // Check there is a valid configuration for the action tool
        jClasses::inc('action~actionConfig');
        $actionConfig = new actionConfig($repository, $project);
        if (!$actionConfig->getStatus()) {
            return $this->error($actionConfig->getErrors());
        }
        $config = $actionConfig->getConfig();
        if (empty($config)) {
            return $this->error($actionConfig->getErrors());
        }

        // Check if a configuration exists for the given parameters
        $actionName = trim($this->param('name'));
        $action = $actionConfig->getAction($actionName, $layerId);
        if (!$action) {
            $errors = array(
                'title' => 'Action unknown',
                'detail' => 'The action named '.$actionName.' does not exist in the config file for this layer: '.$layerId.' !',
            );

            return $this->error($errors);
        }

        // Get the action scope
        $scope = $action->scope;

        // Get the PostgreSQL connection for the project scope
        // In this case, we cannot use the layer datasource
        // We choose to use the default PostgreSQL connection
        $cnx = jDb::getConnection();

        // Depending on the scope (project, layer or feature)
        // we must check if the required parameters are given and are valid
        if (in_array($scope, array('layer', 'feature')) && empty($layerId)) {
            $errors = array(
                'title' => 'The layerId must not be empty',
                'detail' => 'The layerId must not be empty !',
            );

            return $this->error($errors);
        }

        // Check the layer does exists in the given project
        // If we find a layer, we override the PostgreSQL database connexion
        // with the one retrieved from the layer data source
        $qgisLayer = null;
        if (in_array($scope, array('layer', 'feature'))) {
            /** @var null|qgisVectorLayer $qgisLayer */
            $qgisLayer = $lizmapProject->getLayer($layerId);
            if ($qgisLayer) {
                $cnx = $qgisLayer->getDatasourceConnection();
            } else {
                $errors = array(
                    'title' => 'Layer not in project',
                    'detail' => 'The layer with id '.$layerId.' does not exist in this project !',
                );

                return $this->error($errors);
            }
        }

        // Test the feature ID
        if ($scope == 'feature' && empty($featureId)) {
            $errors = array(
                'title' => 'No feature id given',
                'detail' => 'The feature id must be a positive integer !',
            );

            return $this->error($errors);
        }
        if ($scope != 'feature') {
            $featureId = '-1';
        }

        // Check the given WKT (optional parameter, but must be valid)
        // Check also the map center and extent (must be valid WKT)
        $wktParameters = array('wkt', 'mapCenter', 'mapExtent');
        $wkt = $mapCenter = $mapExtent = '';
        foreach ($wktParameters as $paramName) {
            $value = trim($this->param($paramName, ''));
            ${$paramName} = $value;
            if (!empty($value) && lizmapWkt::check($value)) {
                $geom = lizmapWkt::parse($value);
                if ($geom === null) {
                    ${$paramName} = '';
                    $errors = array(
                        'title' => 'This given parameter '.$value.' is invalid !',
                        'detail' => 'Please check the value of the '.$value.' parameter is either empty or valid.',
                    );

                    return $this->error($errors);
                }
            } else {
                ${$paramName} = '';
            }
        }

        // Compute the parameters to pass to the PostgreSQL action function
        // depending on the scope and given parameters
        $data = array();
        $action_params = array(
            'lizmap_repository' => $repository,
            'lizmap_project' => $project,
            'action_name' => $actionName,
            'action_scope' => $scope,
            'layer_name' => null,
            'layer_schema' => null,
            'layer_table' => null,
            'feature_id' => null,
            'map_center' => $mapCenter,
            'map_extent' => $mapExtent,
            'wkt' => $wkt,
        );

        if ($qgisLayer && in_array($scope, array('layer', 'feature'))) {
            $layerName = $qgisLayer->getName();
            $layerDatasource = $qgisLayer->getDatasourceParameters();
            $action_params['layer_name'] = str_replace("'", "''", $layerName);
            $action_params['layer_schema'] = $layerDatasource->schema;
            $action_params['layer_table'] = $layerDatasource->tablename;
            $action_params['feature_id'] = $featureId;
        }

        // Get the additional options from the JSON config file
        // Not for any requests parameters !!!
        foreach ($action->options as $k => $v) {
            $action_params[$k] = $v;
        }

        // Run the action
        $sql = "SELECT lizmap_get_data('";
        $sql .= json_encode($action_params);
        $sql .= "') AS data";

        try {
            $res = $cnx->query($sql);
            foreach ($res as $r) {
                $data = json_decode($r->data);
            }
        } catch (Exception $e) {
            jLog::log(
                'Error in project '.$repository.'/'.$project.', layer '.$layerId.', '.
                'while running the action with the PostgreSQL query : '.$sql.' → '.$e->getMessage(),
                'lizmapadmin'
            );
            $errors = array(
                'title' => 'An error occurred while processing the request',
                'detail' => 'Please contact the GIS administrator to look to the administrator logs.',
            );

            return $this->error($errors);
        }

        // Send response
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = $data;

        return $rep;
    }

    /**
     * Provide errors.
     *
     * @param mixed $errors
     *
     * @return jResponseJson the errors response
     */
    public function error($errors)
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array('errors' => $errors);

        return $rep;
    }
}
