<?php

/**
 * PHP proxy to execute presentation request.
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
     * @var null|string the lizmap repository key
     */
    private $repository;

    /**
     * @var null|string the qgis project key
     */
    private $project;

    /**
     * @var presentationConfig
     */
    private $config;

    /**
     * Redirect to the appropriate action depending on the REQUEST parameter.
     *
     * @urlparam $REPOSITORY Name of the repository
     * @urlparam $PROJECT Name of the project
     * @urlparam $REQUEST Request type
     *
     * @return jResponseJson the request response
     */
    public function index()
    {
        // Check project
        $repository = $this->param('repository');
        $project = $this->param('project');

        // Check presentation config
        jClasses::inc('presentation~presentationConfig');
        $dv = new presentationConfig($repository, $project);
        if (!$dv->getStatus()) {
            return $this->error($dv->getErrors());
        }
        $config = $dv->getConfig();
        if (empty($config)) {
            return $this->error($dv->getErrors());
        }
        $this->repository = $repository;
        $this->project = $project;
        $this->config = $config;

        // Redirect to method corresponding on REQUEST param
        $request = $this->param('request', 'getFeatureCount');

        switch ($request) {
            case 'getFeatureCount':
                return $this->getFeatureCount();

                break;
        }

        return $this->error(
            array(
                'title' => 'Not supported request',
                'detail' => 'The request "'.$request.'" is not supported!',
            ),
        );
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
