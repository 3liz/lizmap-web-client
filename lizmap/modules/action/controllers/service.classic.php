<?php
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
     * @urlparam $LAYERID Layer Id
     * @urlparam $FEATUREID Feature Id
     * @urlparam $NAME The action name
     *
     * @return jResponseJson the request response
     */
    public function index()
    {
        // Get parameters
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $featureId = $this->intParam('featureId', 0);

        // Check project, repository and acl
        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                $errors = array(
                    'title' => 'Wrong repository and project !',
                    'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                );

                return $this->error($errors);
            }
        } catch (\Lizmap\Project\UnknownLizmapProjectException $e) {
            $errors = array(
                'title' => 'Wrong repository and project !',
                'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
            );

            return $this->error($errors);
        }

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            $errors = array(
                'title' => 'Access forbiden',
                'detail' => jLocale::get('view~default.repository.access.denied'),
            );

            return $this->error($errors);
        }

        if (!$featureId) {
            $errors = array(
                'title' => 'No feature id given',
                'detail' => 'The feature id must be a positive integer !',
            );

            return $this->error($errors);
        }

        // Check action config
        jClasses::inc('action~actionConfig');
        $actionConfig = new actionConfig($repository, $project);
        if (!$actionConfig->getStatus()) {
            return $this->error($actionConfig->getErrors());
        }
        $config = $actionConfig->getConfig();
        if (empty($config)) {
            return $this->error($actionConfig->getErrors());
        }

        // Check if configuration exists for this layer and name
        $actionName = trim($this->param('name'));
        $action = $actionConfig->getAction($layerId, $actionName);
        if (!$action) {
            $errors = array(
                'title' => 'Action unknown',
                'detail' => 'The action named '.$actionName.' does not exist in the config file for this layer: '.$layerId .' !',
            );

            return $this->error($errors);
        }

        // Check the layer does exists in the given project
        $p = lizmap::getProject($repository.'~'.$project);
        $qgisLayer = $p->getLayer($layerId);
        if ($qgisLayer) {
            $cnx = $qgisLayer->getDatasourceConnection();
        } else {
            $errors = array(
                'title' => 'Layer not in project',
                'detail' => 'The layer with id '.$layerId.' does not exist in this project !',
            );

            return $this->error($errors);
        }

        // Get data
        $data = array();
        $layerName = $qgisLayer->getName();
        $layerDatasource = $qgisLayer->getDatasourceParameters();
        $action_params = array(
            'layer_name' => str_replace("'", "''", $layerName),
            'layer_schema' => $layerDatasource->schema,
            'layer_table' => $layerDatasource->tablename,
            'feature_id' => $featureId,
            'action_name' => $actionName,
        );

        // Get the additional options from the JSON config file
        // Not for any requests parameters !
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
            jLog::log('Error while running the query : '.$sql);
            $errors = array(
                'title' => 'An error occured while running the PostgreSQL query !',
                'detail' => $e->getMessage(),
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
