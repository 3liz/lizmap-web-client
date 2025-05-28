<?php

use Violet\StreamingJsonEncoder\BufferJsonEncoder;
use Violet\StreamingJsonEncoder\JsonStream;

/**
 * PHP proxy to execute filter request.
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
     * @var filterConfig
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

        // Check filter config
        jClasses::inc('filter~filterConfig');
        $dv = new filterConfig($repository, $project);
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

            case 'getUniqueValues':
                return $this->getUniqueValues();

                break;

            case 'getMinAndMaxValues':
                return $this->getMinAndMaxValues();

                break;

            case 'getExtent':
                return $this->getExtent();

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

    /**
     * Get feature count.
     *
     * @return jResponseJson the feature count response
     */
    public function getFeatureCount()
    {
        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $filter = trim($this->param('filter', null));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource($repository, $project, $layerId);
        $streamedData = $f->getFeatureCount($filter);

        return $this->streamResponse($streamedData);
    }

    /**
     * Get unique values.
     *
     * @return jResponseJson the unique values response
     */
    public function getUniqueValues()
    {
        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $filter = trim($this->param('filter', null));
        $fieldname = trim($this->param('fieldname'));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource($repository, $project, $layerId);
        $streamedData = $f->getUniqueValues($fieldname, $filter);

        return $this->streamResponse($streamedData);
    }

    /**
     * Get min and max values.
     *
     * @return jResponseJson the min and max values response
     */
    public function getMinAndMaxValues()
    {
        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $filter = trim($this->param('filter', null));
        $fieldname = trim($this->param('fieldname'));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource($repository, $project, $layerId);
        $streamedData = $f->getMinAndMaxValues($fieldname, $filter);

        return $this->streamResponse($streamedData);
    }

    /**
     * Get extent.
     *
     * @return jResponseJson the extent response
     */
    public function getExtent()
    {
        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $crs = trim($this->param('crs', 'EPSG:3857'));
        $filter = trim($this->param('filter', null));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource($repository, $project, $layerId);
        $streamedData = $f->getExtent($crs, $filter);

        return $this->streamResponse($streamedData);
    }

    /**
     * stream $streamData in a jResponseStreamed
     * if data is iterable
     * otherwise simple jResponseJson.
     *
     * @param mixed $streamedData
     *
     * @return jResponseBinary|jResponseJson response
     */
    protected function streamResponse($streamedData)
    {
        if (is_iterable($streamedData)) {
            /**
             * @var jResponseBinary $response
             */
            $response = $this->getResponse('binary');
            $response->mimeType = 'application/json';
            $encoder = (new BufferJsonEncoder($streamedData))
                ->setOptions(JSON_PRETTY_PRINT)
            ;

            $stream = new JsonStream($encoder);

            $response->setContentGenerator((function () use ($stream) {
                while (!$stream->eof()) {
                    yield $stream->read(1024 * 8);
                }
            })());
        } else {
            /**
             * @var jResponseJson $response
             */
            $response = $this->getResponse('json');
            $response->data = $streamedData;
        }

        return $response;
    }
}
