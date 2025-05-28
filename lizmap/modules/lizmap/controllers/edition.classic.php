<?php

/**
 * Edition tool web services.
 *
 * @author    3liz
 * @copyright 2011-2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

use GuzzleHttp\Psr7\Utils as Psr7Utils;
use Lizmap\Form;
use Lizmap\Project\Project;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\WFSRequest;

class editionCtrl extends jController
{
    /** @var null|Project */
    private $project;

    /** @var lizmapRepository */
    private $repository;

    /** @var string layer id in the QGIS project file */
    private $layerId = '';

    /** @var string layer name (<layername> in QGIS project) */
    private $layerName = '';

    /** @var string featureId parameter from the request, an integer or a string with coma separated integers */
    private $featureIdParam;

    /** @var int|string an integer or an array of integers */
    private $featureId;

    /** @var null|object feature data as a PHP object from GeoJSON via json_decode */
    private $featureData;

    /** @var SimpleXMLElement Layer data as simpleXml object */
    private $layerXml = '';

    /** @var qgisVectorLayer Layer data */
    private $layer = '';

    /** @var string[] Primary key for getWfsFeature */
    private $primaryKeys = array();

    /** @var string Geometry column for form */
    private $geometryColumn = '';

    // Geometry srid for form
    private $srid = '';

    // Geometry proj4 string for form
    private $proj4 = '';

    /** @var bool Filter override flag */
    private $loginFilteredOverride = false;

    /**
     * @var string error message during responses processing
     */
    private $errorMessage = '';

    /**
     * @var string error type during responses processing
     */
    private $errorType = 'default';

    protected function setErrorMessage($message, $type = 'default')
    {
        $this->errorMessage = $message;
        $this->errorType = $type;
    }

    /**
     * Send an answer.
     *
     * @return jResponseHtmlFragment HTML fragment
     */
    protected function serviceAnswer()
    {
        if ($this->errorMessage !== '') {
            jMessage::add($this->errorMessage, $this->errorType);
        }
        $title = jLocale::get('view~edition.modal.title.default');

        // Get title layer
        if ($this->layer) {
            $_title = $this->layer->getTitle();
            if ($_title && $_title != '') {
                $title = $_title;
            }
        }

        /** @var jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $tpl = new jTpl();
        $tpl->assign('title', $title);
        $content = $tpl->fetch('view~jmessage_answer');
        $rep->addContent($content);
        jMessage::clearAll();

        return $rep;
    }

    /**
     * Get parameters and set classes for the project and repository given.
     *
     * @param bool $save If true, we have to save the form. So take liz_repository and others instead of repository from request parameters.
     *
     * @return bool
     */
    private function getEditionParameters($save = false)
    {
        // Get the project
        if ($save) {
            $project = $this->param('liz_project');
            $repository = $this->param('liz_repository');
            $layerId = $this->param('liz_layerId');
            $featureIdParam = $this->param('liz_featureId');
        } else {
            $project = $this->param('project');
            $repository = $this->param('repository');
            $layerId = $this->param('layerId');
            $featureIdParam = $this->param('featureId');
        }

        if (!$project) {
            $this->setErrorMessage(jLocale::get('view~edition.message.error.parameter.project'), 'ProjectNotDefined');

            return false;
        }

        // Get repository data
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            $this->setErrorMessage('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');

            return false;
        }
        // Get the project data
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                $this->setErrorMessage('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return false;
            }
        } catch (UnknownLizmapProjectException $e) {
            $this->setErrorMessage('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return false;
        }

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            $this->setErrorMessage(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return false;
        }

        // Redirect if no rights to use the edition tool
        if (!jAcl2::check('lizmap.tools.edition.use', $lrep->getKey())) {
            $this->setErrorMessage(jLocale::get('view~edition.access.denied'), 'AuthorizationRequired');

            return false;
        }
        $layerEditionParameters = $this->getLayerEditionParameter($lproj, $layerId, $featureIdParam);

        if (!$layerEditionParameters) {
            return false;
        }

        // Define class private properties
        $this->project = $lproj;
        $this->repository = $lrep;
        $this->layerId = $layerId;

        $this->featureId = $layerEditionParameters['featureId'];
        $this->featureIdParam = $layerEditionParameters['featureIdParam'];
        $this->layer = $layerEditionParameters['layer'];
        $this->layerXml = $layerEditionParameters['layerXml'];
        $this->layerName = $layerEditionParameters['layerName'];

        // Optionally filter data by login or/and by polygon
        $this->loginFilteredOverride = jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey());

        $dbFieldsInfo = $this->layer->getDbFieldsInfo();
        $this->primaryKeys = $layerEditionParameters['primaryKeys'];
        $this->geometryColumn = $layerEditionParameters['geometryColumn'];
        $this->srid = $layerEditionParameters['srid'];
        $this->proj4 = $layerEditionParameters['proj4'];

        return true;
    }

    /**
     * Get layer parameters and returns layers info for edition.
     *
     * @param null|Project         $proj       the project
     * @param null|string          $lid        the layer id
     * @param null|string|string[] $fIdParams  the feature ids
     * @param bool                 $setMessage set/not set error message
     *
     * @return null|array{'layer': qgisVectorLayer, 'layerXml': simpleXMLElement, 'layerName': string, 'featureId': mixed, 'featureIdParam': string, 'dbFieldsInfo': qgisLayerDbFieldsInfo, 'primaryKeys': string[], 'geometryColumn': string, 'srid': mixed, 'proj4': mixed}
     */
    protected function getLayerEditionParameter($proj, $lid, $fIdParams, $setMessage = true)
    {
        if (!$proj || !$lid) {
            return null;
        }

        /** @var null|qgisVectorLayer $player The QGIS vector layer instance */
        $player = $proj->getLayer($lid);

        if (!$player) {
            if ($setMessage) {
                $this->setErrorMessage(jLocale::get('view~edition.message.error.layer.editable'), 'LayerNotEditable');
            }

            return null;
        }

        $layerXml = $player->getXmlLayer();
        $layerName = $player->getName();

        // Verifying if the layer is editable
        if (!$player->isEditable()) {
            if ($setMessage) {
                $this->setErrorMessage(jLocale::get('view~edition.message.error.layer.editable'), 'LayerNotEditable');
            }

            return null;
        }

        if (!$player->canCurrentUserEdit()) {
            if ($setMessage) {
                $this->setErrorMessage(jLocale::get('view~edition.access.denied'), 'AuthorizationRequired');
            }

            return null;
        }

        // feature Id (optional, only for edition and save)
        $featureId = $fIdParams;
        if ($fIdParams) {
            if (strpos($fIdParams, ',') !== false) {
                $featureId = preg_split('#,#', $fIdParams);
            } elseif (strpos($fIdParams, '@@') !== false) {
                $featureId = preg_split('#@@#', $fIdParams);
            }
        }

        $dbFieldsInfo = $player->getDbFieldsInfo();
        $primaryKeys = $dbFieldsInfo->primaryKeys;
        $geometryColumn = $dbFieldsInfo->geometryColumn;
        $srid = $player->getSrid();
        $proj4 = $player->getProj4();

        return array(
            'layer' => $player,
            'layerXml' => $layerXml,
            'layerName' => $layerName,
            'featureId' => $featureId,
            'featureIdParam' => $fIdParams,
            'dbFieldsInfo' => $dbFieldsInfo,
            'primaryKeys' => $primaryKeys,
            'geometryColumn' => $geometryColumn,
            'srid' => $srid,
            'proj4' => $proj4,
        );
    }

    /**
     * Get the WFS feature for the editing object
     * and return featureData object.
     *
     * This method will always return an object if the feature exists in the layer
     * even if there are some filters by login or by polygon !
     * /!\ This is not the responsibility of this method to know if the user has the right to edit !
     *
     * @param null|qgisVectorLayer $layer      the qgis vector layer
     * @param mixed                $featureId  the value to search
     * @param null|mixed           $keys       primary keys or attribute filter
     * @param string               $exp_filter filter for attributes
     *
     * @return mixed
     */
    private function getWfsFeature($layer, $featureId, $keys, $exp_filter = null)
    {
        if (!$layer || !$keys) {
            return null;
        }

        // Get features primary key field values corresponding to featureId(s)
        if (!empty($featureId) || $featureId === 0 || $featureId === '0') {
            $typename = $layer->getShortName();
            if (!$typename || $typename == '') {
                $typename = str_replace(' ', '_', $layer->getName());
            }
            if (is_array($featureId)) {
                // QGIS3 (at least <=3.4) doesn't support pk with multiple fields
                // but 2.18 supports it.
                $featureId = $typename.'.'.implode('@@', $featureId);
            } else {
                $featureId = $typename.'.'.$featureId;
            }

            // We must give the fields used in the filters (featureid and exp_filter)
            $propertyName = array_merge(array(), $keys);

            if (!$this->loginFilteredOverride) {
                // login filter
                $loginFilteredConfig = $this->project->getLoginFilteredConfig($layer->getName(), true);
                if ($loginFilteredConfig && property_exists($loginFilteredConfig, 'filterAttribute')) {
                    $propertyName[] = $loginFilteredConfig->filterAttribute;
                }

                // polygon filter
                $polygonFilter = $this->project->getLayerPolygonFilterConfig($layer->getName(), true);
                if ($polygonFilter && !in_array($polygonFilter['primary_key'], $propertyName)) {
                    $propertyName[] = $polygonFilter['primary_key'];
                }
            }

            // Build the WFS request
            $wfs_params = array(
                'SERVICE' => 'WFS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetFeature',
                'TYPENAME' => $typename,
                'OUTPUTFORMAT' => 'GeoJSON',
                'GEOMETRYNAME' => 'none',
                'PROPERTYNAME' => implode(',', $propertyName),
                'FEATUREID' => $featureId,
            );

            if ($exp_filter) {
                $wfs_params['EXP_FILTER'] = $exp_filter;
                unset($wfs_params['FEATUREID']);
            }

            $wfs_request = new WFSRequest(
                $this->project,
                $wfs_params,
                lizmap::getServices()
            );

            $featureData = null;

            $wfs_response = $wfs_request->process();
            // Check code
            if (floor($wfs_response->getCode() / 100) >= 4) {
                return;
            }
            // Check mime/type
            if (in_array(strtolower($wfs_response->getMime()), array('text/html', 'text/xml'))) {
                return;
            }

            $featureData = json_decode($wfs_response->getBodyAsString());
            if (empty($featureData)) {
                $featureData = null;
            } elseif (empty($featureData->features)) {
                $featureData = null;
            }

            return $featureData;
        }

        return null;
    }

    /**
     * Check if the WFS feature is editable by the authenticated user
     * We check the filter by login & the filter by polygon.
     *
     * @return bool
     */
    private function featureIsEditable()
    {
        return $this->layer->isFeatureEditable($this->featureData->features[0]);
    }

    /**
     * @param jFormsBase $form
     * @param mixed      $forCreation
     */
    private function initializeForm($form, $forCreation = true)
    {
        $form->setData('liz_future_action', $this->param('liz_future_action', 'close'));

        // Set lizmap form controls (hard-coded in the form xml file)
        $form->setData('liz_repository', $this->repository->getKey());
        $form->setData('liz_project', $this->project->getKey());
        $form->setData('liz_layerId', $this->layerId);
        $form->setData('liz_featureId', $this->featureIdParam);

        // Set data for the layer geometry: srid, proj4 and geometryColumn
        $form->setData('liz_srid', $this->srid);
        $form->setData('liz_proj4', $this->proj4);
        $form->setData('liz_geometryColumn', $this->geometryColumn);

        $eventParams = array(
            'form' => $form,
            'action' => 'create',
            'project' => $this->project,
            'repository' => $this->repository,
            'layer' => $this->layer,
            'status' => $this->param('status', 0),
        );

        if (!$forCreation) {
            $eventParams['action'] = 'modify';
            $eventParams['featureId'] = $this->featureId;
            $eventParams['featureData'] = $this->featureData;
        }

        // event to add custom field in the jForms form
        jEvent::notify('LizmapEditionCreateForm', $eventParams);

        try {
            $qgisForm = new Form\QgisForm($this->layer, $form, $this->featureId, $this->loginFilteredOverride, lizmap::getAppContext());
        } catch (Exception $e) {
            jMessage::add($e->getMessage(), 'error');

            return null;
        }

        // SELECT data from the database and set the form data accordingly

        $qgisForm->setFormDataFromDefault();
        if ($this->featureId || $this->featureId === 0 || $this->featureId === '0') {
            $qgisForm->setFormDataFromFields($this->featureData->features[0]);
            $form->initModifiedControlsList();
        }

        return $qgisForm;
    }

    /**
     * Create a feature form based on the edition layer.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Qgis id of the layer
     *
     * @return jResponseHtmlFragment|jResponseRedirect redirect to the display action
     */
    public function createFeature()
    {
        // Get repository, project data and do some right checking
        if (!$this->getEditionParameters()) {
            return $this->serviceAnswer();
        }

        // Get editLayer capabilities
        $eCapabilities = $this->layer->getRealEditionCapabilities();
        if ($eCapabilities->createFeature != 'True') {
            jMessage::add(jLocale::get('view~edition.message.error.layer.editable.create'), 'LayerNotEditable');

            return $this->serviceAnswer();
        }

        jForms::destroy('view~edition', $this->featureId);
        // Create form instance
        $form = jForms::create('view~edition', $this->featureId);

        if (!$this->initializeForm($form)) {
            return $this->serviceAnswer();
        }

        // Redirect to the display action
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->params = array(
            'project' => $this->project->getKey(),
            'repository' => $this->repository->getKey(),
            'layerId' => $this->layerId,
            'status' => $this->param('status', 0),
        );
        $rep->action = 'lizmap~edition:editFeature';

        return $rep;
    }

    /**
     * Modify a feature.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Qgis id of the layer
     * @urlparam integer $featureId Id of the feature.
     *
     * @return jResponseHtmlFragment|jResponseRedirect redirect to the display action
     */
    public function modifyFeature()
    {
        // Get repository, project data and do some right checking
        if (!$this->getEditionParameters()) {
            return $this->serviceAnswer();
        }

        // Check if data has been fetched via WFS for the feature
        $this->featureData = $this->getWfsFeature($this->layer, $this->featureId, $this->primaryKeys);
        if (!$this->featureData) {
            jMessage::add(jLocale::get('view~edition.message.error.feature.get'), 'featureNotFoundViaWfs');

            return $this->serviceAnswer();
        }

        if (!$this->loginFilteredOverride) {
            $is_editable = $this->featureIsEditable();
            if (!$is_editable) {
                $this->setErrorMessage(jLocale::get('view~edition.message.error.feature.editable'), 'FeatureNotEditable');

                return $this->serviceAnswer();
            }
        }

        // Create form instance
        $form = jForms::create('view~edition', $this->featureId);
        if (!$form) {
            jMessage::add(jLocale::get('view~edition.message.error.form.get'), 'formNotDefined');

            return $this->serviceAnswer();
        }

        if (!$this->initializeForm($form)) {
            return $this->serviceAnswer();
        }

        // Redirect to the display action
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->params = array(
            'project' => $this->project->getKey(),
            'repository' => $this->repository->getKey(),
            'layerId' => $this->layerId,
            'featureId' => $this->featureIdParam,
            'status' => $this->param('status', 0),
        );

        $rep->action = 'lizmap~edition:editFeature';

        return $rep;
    }

    /**
     * Display the edition form (output as html fragment).
     *
     * @return jResponseHtmlFragment|jResponseRedirect HTML code containing the form
     */
    public function editFeature()
    {
        // Get repository, project data and do some right checking
        if (!$this->getEditionParameters()) {
            return $this->serviceAnswer();
        }

        // Check if data has been fetched via WFS for the feature
        $this->featureData = $this->getWfsFeature($this->layer, $this->featureId, $this->primaryKeys);
        if (($this->featureId || $this->featureId === 0 || $this->featureId === '0') && !$this->featureData) {
            jMessage::add(jLocale::get('view~edition.message.error.feature.get'), 'featureNotFoundViaWfs');

            return $this->serviceAnswer();
        }

        if (!$this->loginFilteredOverride
            && ($this->featureId || $this->featureId === 0 || $this->featureId === '0')
            && $this->featureData) {
            $is_editable = $this->featureIsEditable();
            if (!$is_editable) {
                $this->setErrorMessage(jLocale::get('view~edition.message.error.feature.editable'), 'FeatureNotEditable');

                return $this->serviceAnswer();
            }
        }

        // Get the form instance
        $form = jForms::get('view~edition', $this->featureId);
        if (!$form) {
            jMessage::add(jLocale::get('view~edition.message.error.form.get'), 'formNotDefined');

            return $this->serviceAnswer();
        }

        // event to add custom field into the jForms form before setting data in it
        $eventParams = array(
            'form' => $form,
            'project' => $this->project,
            'repository' => $this->repository,
            'layer' => $this->layer,
            'featureId' => $this->featureId,
            'featureData' => $this->featureData,
            'status' => $this->param('status', 0),
        );
        jEvent::notify('LizmapEditionEditGetForm', $eventParams);

        // Dynamically add form controls based on QGIS layer information
        try {
            $qgisForm = new Form\QgisForm($this->layer, $form, $this->featureId, $this->loginFilteredOverride, lizmap::getAppContext());
        } catch (Exception $e) {
            jMessage::add($e->getMessage(), 'error');

            return $this->serviceAnswer();
        }

        // Set status data to communicate client that the form is reopened after successfully save
        $form->setData('liz_status', $this->param('status', 0));

        // Set future action (close forme, reopen saved form, create new feature)
        // Redirect to the edition form or to the validate message
        $faCtrl = $form->getControl('liz_future_action');
        $faData = $faCtrl->datasource->data;
        $eCapabilities = $this->layer->getRealEditionCapabilities();
        if ($eCapabilities->createFeature != 'True') {
            unset($faData['create']);
        }
        if ($eCapabilities->modifyAttribute != 'True') {
            unset($faData['edit']);
        }
        $faCtrl->datasource = new jFormsStaticDatasource();
        $faCtrl->datasource->data = $faData;
        $faCtrl->defaultValue = array(
            0 => $form->getData('liz_future_action'),
        );

        $qgisForm->updateFormByLogin();

        // Get title layer
        $title = $this->layer->getTitle();
        if (!$title || $title == '') {
            $title = 'No title';
        }

        // Prepare template
        $attributeEditorForm = $qgisForm->getAttributesEditorForm();
        $form = $qgisForm->getForm();

        // Use template to create html form content
        $tpl = new jTpl();
        $tpl->assign('attributeEditorForm', $attributeEditorForm);
        $tpl->assign('fieldNames', $qgisForm->getFieldNames());
        $tpl->assign('title', $title);
        $tpl->assign('form', $form);
        $tpl->assign('formPlugins', $qgisForm->getFormPlugins());
        $tpl->assign('widgetsAttributes', $qgisForm->getFormWidgetsAttributes());
        $tpl->assign('ajaxNewFeatureUrl', jUrl::get('lizmap~edition:saveNewFeature'));
        $tpl->assign('groupVisibilities', qgisExpressionUtils::evaluateGroupVisibilities($attributeEditorForm, $form));

        // event to add custom fields into the jForms form, or to modify those that
        // have been added by QgisForm, and to inject custom data into the template
        // useful if the template has been redefined in a theme
        $eventParams['qgisForm'] = $qgisForm;
        $eventParams['tpl'] = $tpl;
        jEvent::notify('LizmapEditionEditQgisForm', $eventParams);

        $content = $tpl->fetch('view~edition_form');

        // Return html fragment response
        /** @var jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $rep->addContent($content);

        return $rep;
    }

    /**
     * Save the edition form (output as html fragment).
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Qgis id of the layer
     * @urlparam integer $featureId Id of the feature.
     *
     * @return jResponseHtmlFragment|jResponseRedirect redirect to the validation action
     */
    public function saveFeature()
    {
        // Get repository, project data and do some right checking
        $save = true;
        if (!$this->getEditionParameters($save)) {
            return $this->serviceAnswer();
        }

        // Get the form instance
        $form = jForms::get('view~edition', $this->featureId);

        if (!$form) {
            jMessage::add(jLocale::get('view~edition.message.error.form.get'), 'formNotDefined');

            return $this->serviceAnswer();
        }

        // Get the data via a WFS request
        $this->featureData = $this->getWfsFeature($this->layer, $this->featureId, $this->primaryKeys);

        // event to add custom field into the jForms form before setting data in it
        $eventParams = array(
            'form' => $form,
            'project' => $this->project,
            'repository' => $this->repository,
            'layer' => $this->layer,
            'featureId' => $this->featureId,
            'featureData' => $this->featureData,
            'status' => $this->param('status', 0),
        );
        jEvent::notify('LizmapEditionSaveGetForm', $eventParams);

        // Dynamically add form controls based on QGIS layer information
        // And save data into the edition table (insert or update line)

        try {
            $qgisForm = new Form\QgisForm($this->layer, $form, $this->featureId, $this->loginFilteredOverride, lizmap::getAppContext());
        } catch (Exception $e) {
            jMessage::add($e->getMessage(), 'error');

            return $this->serviceAnswer();
        }

        // event to add or modify some control after QgisForm has added its own controls
        $eventParams['qgisForm'] = $qgisForm;
        jEvent::notify('LizmapEditionSaveGetQgisForm', $eventParams);

        // Get data from the request and set the form controls data accordingly
        $form->initFromRequest();

        // Check the form data and redirect if needed
        $feature = null;
        if ($this->featureId || $this->featureId === 0 || $this->featureId === '0') {
            $feature = $this->featureData->features[0];
        }
        $check = $qgisForm->check($feature);

        // event to add additional checks
        $event = jEvent::notify('LizmapEditionSaveCheckForm', $eventParams);
        if ($event->allResponsesByKeyAreTrue('check') === false) {
            $check = false;
        }

        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->params = array(
            'project' => $this->project->getKey(),
            'repository' => $this->repository->getKey(),
            'layerId' => $this->layerId,
            'featureId' => $this->featureIdParam,
        );

        // Save data into database
        // And get returned primary key values
        $pkvals = null;
        if ($check) {
            // Check if featureId is null to get all controls or only modified controls
            if ($this->featureId == null) {
                // Save to database with all controls
                $pkvals = $qgisForm->saveToDb($feature, $form->getControls());
            } else {
                // Save to database with modified controls
                $pkvals = $qgisForm->saveToDb($feature, $form->getModifiedControls());
            }
        }

        // Some errors where encountered
        if (!$check || !$pkvals) {
            // Redirect to the display action
            jLog::log(
                'Error in project '.$this->repository->getKey().'/'.$this->project->getKey().', '.
                'layer '.$this->layerId.' while saving the feature '.$this->featureIdParam,
                'lizmapadmin'
            );
            $rep->params['status'] = '1';
            $rep->action = 'lizmap~edition:editFeature';

            return $rep;
        }

        // link mlayer to nlayer feature
        if ($this->param('liz_pivot')) {
            try {
                $this->linkAddedFeature($this->param('liz_pivot'), $pkvals);
            } catch (Exception $e) {
                lizmap::getAppContext()->logMessage($e->getMessage(), 'lizmapadmin');
                jMessage::add($e->getMessage(), 'linkAddedFeatureError');
            }
        }
        // Redirect to the edition form or to the validate message
        $next_action = $form->getData('liz_future_action');
        jForms::destroy('view~edition', $this->featureId);
        $form = null;

        if ($next_action == 'close') {
            // Redirect to the close action
            $rep->action = 'lizmap~edition:closeFeature';

            // Add the generated primary keys for the newly created feature
            if (is_array($pkvals)) {
                $rep->params['pkVals'] = json_encode($pkvals);
            }

            return $rep;
        }

        // Use edition capabilities
        $eCapabilities = $this->layer->getRealEditionCapabilities();

        // CREATE NEW FEATURE
        if ($next_action == 'create'
            && $eCapabilities->createFeature == 'True'
        ) {
            jMessage::add(jLocale::get('view~edition.form.data.saved'), 'success');
            $rep->params = array(
                'project' => $this->project->getKey(),
                'repository' => $this->repository->getKey(),
                'layerId' => $this->layerId,
                'liz_future_action' => $next_action,
            );
            // Destroy form and redirect to create
            $rep->action = 'lizmap~edition:createFeature';

            return $rep;
        }

        // REOPEN THE FORM FOR THE EDITED FEATURE
        // If there is a single integer primary key
        // This is the featureid, we can redirect to the edition form
        // for the newly created or the updated feature
        if ($next_action == 'edit'
            // and if capabilities is ok for attribute modification
            && $eCapabilities->modifyAttribute == 'True'
            // if we have retrieved the pkeys only one integer pkey
            && (is_array($pkvals) && count($pkvals) == 1)
        ) {
            // Get the fields info
            $dbFieldsInfo = $this->layer->getDbFieldsInfo();
            foreach ($dbFieldsInfo->primaryKeys as $key) {
                if ($dbFieldsInfo->dataFields[$key]->unifiedType != 'integer') {
                    break;
                }
                jMessage::add(jLocale::get('view~edition.form.data.saved'), 'success');
                $rep->params = array(
                    'project' => $this->project->getKey(),
                    'repository' => $this->repository->getKey(),
                    'layerId' => $this->layerId,
                    'featureId' => $pkvals[$key], // use the one returned by the query, not the one in the class property
                    'liz_future_action' => $next_action,
                );
                // Redirect to create
                $rep->action = 'lizmap~edition:modifyFeature';

                return $rep;
            }
        }

        // Redirect to the close action
        $rep->action = 'lizmap~edition:closeFeature';

        return $rep;
    }

    /**
     * Utilities used for link features related via an n to m relationship after an new "m" feature is created.
     *
     * @param string $linkedLayers information on feaures to link provided as "pivot-id:n-layer-id:n-layer-value"
     * @param array  $featureIds   the primary keys of the new "m" feature
     *
     * @throws Exception
     */
    private function linkAddedFeature($linkedLayers, $featureIds)
    {
        // check pivot parameters
        if (!$linkedLayers || count($featureIds) == 0) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.invalid.parameters'));
        }

        // lkPar[0]-> pivotId
        // lkPar[1]-> $nLayerId
        // lkPar[2]-> referenced field value of father layer in the pivot table
        $lkPar = explode(':', $linkedLayers);

        $pivotId = $lkPar[0];
        $n_layerId = $lkPar[1];
        $referencedFieldValue = $lkPar[2];

        if (count($lkPar) !== 3 || !$pivotId || !$n_layerId || !$referencedFieldValue) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.invalid.parameters'));
        }

        // check pivot && n_Layer conf
        /** @var qgisVectorLayer $pivotLayer The pivot vector layer instance */
        $pivotLayer = $this->project->getLayer($pivotId);
        if (!$pivotLayer) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.invalid.parameters'));
        }

        /** @var qgisVectorLayer $n_layer The n_layer vector layer instance */
        $n_layer = $this->project->getLayer($n_layerId);
        if (!$n_layer) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.invalid.parameters'));
        }

        $pivotLayerName = $pivotLayer->getName();
        $n_layerName = $n_layer->getName();

        // check if the layers is configured in attribute table
        if (
            !$this->project->hasAttributeLayers()
            || !$this->project->hasAttributeLayersForLayer($pivotLayerName)
            || !$this->project->isPivotLayer($pivotLayerName)
            || !$this->project->hasAttributeLayersForLayer($n_layerName)

        ) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.invalid.parameters'));
        }

        // get project relations and perform necessary checks
        $relations = $this->project->getRelations();
        if (
            !is_array($relations)
            || !array_key_exists('pivot', $relations)
            || !array_key_exists($pivotId, $relations['pivot'])
            || !array_key_exists($this->layerId, $relations['pivot'][$pivotId])
            || !array_key_exists($n_layerId, $relations['pivot'][$pivotId])
            || !array_key_exists($n_layerId, $relations)
            || !array_key_exists($this->layerId, $relations)
        ) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.association', array($this->layer->getTitle(), $n_layer->getTitle())));
        }

        $pivotConf = $relations['pivot'][$pivotId];
        $m_layerId = $this->layerId;

        $n_relation = null;
        $m_relation = null;
        foreach ($relations as $kRel => $relation) {
            if ($kRel !== 'pivot') {
                if ($kRel == $m_layerId || $kRel == $n_layerId) {
                    if (is_array($relation)) {
                        $filtered = array_filter($relation, function ($ar) use ($pivotId, $pivotConf, $kRel) {
                            return is_array($ar) && array_key_exists('referencingLayer', $ar) && array_key_exists('referencingField', $ar) && $ar['referencingLayer'] == $pivotId && $ar['referencingField'] == $pivotConf[$kRel];
                        });
                        if (count($filtered) == 1) {
                            if ($kRel == $m_layerId && !$m_relation) {
                                // mLayer -> current layer on editing
                                $m_relation = reset($filtered);
                            } elseif ($kRel == $n_layerId && !$n_relation) {
                                // nLayer -> layer related to nLayer via the pivot pivotId
                                $n_relation = reset($filtered);
                            }
                        }
                    }
                }
            }
        }
        // check information on relations and primary keys
        if (
            !$n_relation
            || !$m_relation
            || !array_key_exists($m_relation['referencedField'], $featureIds)
            || !$featureIds[$m_relation['referencedField']]
        ) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.association', array($this->layer->getTitle(), $n_layer->getTitle())));
        }

        $m_layerVal = $featureIds[$m_relation['referencedField']];
        $m_layerField = $m_relation['referencingField'];
        $n_layerVal = $referencedFieldValue;
        $n_layerField = $n_relation['referencingField'];

        // check if pivot is editable
        $capabilities = $pivotLayer->getRealEditionCapabilities();
        if ($capabilities->createFeature != 'True' || !$pivotLayer->canCurrentUserEdit()) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.association', array($this->layer->getTitle(), $n_layer->getTitle())));
        }

        $dbFieldsInfo = $pivotLayer->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;

        // Check fields on pivot
        if (!array_key_exists($n_layerField, $dataFields) || !array_key_exists($m_layerField, $dataFields)) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.association', array($this->layer->getTitle(), $n_layer->getTitle())));
        }

        try {
            $pivotLayer->insertRelations($n_layerField, array($n_layerVal), $m_layerField, array($m_layerVal));
        } catch (Exception $e) {
            throw new Exception(jLocale::get('view~edition.linkaddedfeature.error.linkfeature.association', array($this->layer->getTitle(), $n_layer->getTitle())));
        }

        jMessage::add(jLocale::get('view~edition.linkaddedfeature.success.linkfeature', array($this->layer->getTitle(), $n_layer->getTitle())), 'linkAddedFeature');
    }

    /**
     * Form close : destroy it and display a message.
     *
     * This function does not use the serviceAnswer method
     * which depends on jMessage and cannot be used to return
     * a more complex HTML fragment with hidden data.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Qgis id of the layer
     * @urlparam integer $featureId Id of the feature.
     * @urlparam string $pkVals A JSON representation of the primary key values of the new or modified feature.
     *
     * @return jResponseHtmlFragment confirmation message that the form has been saved
     */
    public function closeFeature()
    {
        // Get repository, project data and do some right checking
        if (!$this->getEditionParameters()) {
            return $this->serviceAnswer();
        }

        // Destroy the form
        jForms::destroy('view~edition', $this->featureId);

        // Return html fragment response
        /** @var jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $tpl = new jTpl();

        $linkAddedFeatureError = jMessage::get('linkAddedFeatureError');
        $linkAddedFeature = jMessage::get('linkAddedFeature');

        // check for linked features messagges
        $addedFeatureMessage = null;
        $addedFeatureError = false;

        if ($linkAddedFeatureError && is_array($linkAddedFeatureError)) {
            $addedFeatureMessage = $linkAddedFeatureError[0];
            $addedFeatureError = true;
        } elseif ($linkAddedFeature && is_array($linkAddedFeature)) {
            $addedFeatureMessage = $linkAddedFeature[0];
        }

        $closeFeatureMessage = jLocale::get('view~edition.form.data.saved');
        $pkValsJson = $this->param('pkVals', '');

        $tpl->assign('addedFeatureMessage', $addedFeatureMessage);
        $tpl->assign('addedFeatureError', $addedFeatureError);
        $tpl->assign('closeFeatureMessage', $closeFeatureMessage);
        $tpl->assign('pkValsJson', $pkValsJson);
        $content = $tpl->fetch('view~edition_close_feature_data');
        $rep->addContent($content);

        jMessage::clearAll();

        return $rep;
    }

    /**
     * Delete Feature (output as html fragment).
     * If the Feature is linked with any pivot table (n to m relation) then the records on pivots are deleted too.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Qgis id of the layer
     * @urlparam integer $featureId Id of the feature.
     *
     * @return jResponseHtmlFragment
     */
    public function deleteFeature()
    {
        if (!$this->getEditionParameters()) {
            return $this->serviceAnswer();
        }

        // Check if data has been fetched via WFS for the feature
        $this->featureData = $this->getWfsFeature($this->layer, $this->featureId, $this->primaryKeys);
        if (!$this->featureData) {
            jMessage::add(jLocale::get('view~edition.message.error.feature.get'), 'featureNotFoundViaWfs');

            return $this->serviceAnswer();
        }

        // Get editLayer capabilities
        $eCapabilities = $this->layer->getRealEditionCapabilities();
        if ($eCapabilities->deleteFeature != 'True') {
            jMessage::add(jLocale::get('view~edition.message.error.layer.editable.delete'), 'LayerNotEditable');

            return $this->serviceAnswer();
        }

        if (!$this->loginFilteredOverride) {
            $is_editable = $this->featureIsEditable();
            if (!$is_editable) {
                $this->setErrorMessage(jLocale::get('view~edition.message.error.feature.editable'), 'FeatureNotEditable');

                return $this->serviceAnswer();
            }
        }

        if (!$this->featureId && $this->featureId !== 0 && $this->featureId !== '0') {
            jMessage::add(jLocale::get('view~edition.message.error.parameter.featureId'), 'error');

            return $this->serviceAnswer();
        }

        // Create form instance to get uploads file
        $form = jForms::create('view~edition', $this->featureId);
        if (!$form) {
            jMessage::add('An error has been raised when creating the form', 'formNotDefined');

            return $this->serviceAnswer();
        }

        $qgisForm = $this->initializeForm($form, false);
        if (!$qgisForm) {
            return $this->serviceAnswer();
        }

        $deleteFiles = $qgisForm->getUploadedFiles($form);

        // event to add additionnal checks
        $eventParams = array(
            'form' => $form,
            'qgisForm' => $qgisForm,
            'project' => $this->project,
            'repository' => $this->repository,
            'layer' => $this->layer,
            'featureId' => $this->featureId,
            'featureData' => $this->featureData,
            'filesToDelete' => $deleteFiles,
        );
        $event = jEvent::notify('LizmapEditionPreDelete', $eventParams);
        if ($event->allResponsesByKeyAreTrue('filesDeleted')) {
            $deleteFiles = array();
        }
        $pivotFeatures = null;
        if ($this->param('linkedRecords') && $this->param('linkedRecords') == 'ntom') {
            // check all the pivot linked to the layer
            $pivotFeatures = $this->getPivotFeatures();
        }

        try {
            // exec deletion in one transaction.
            // This presumes that tables has the same datasource connection parameters.
            // In order to use the same transaction, variable $cnx is passed along methods deleteFeature and deleteFromDb
            $cnx = $this->layer->getDatasourceConnection();

            $cnx->beginTransaction();

            $relationsRemoved = true;
            if ($pivotFeatures && count($pivotFeatures) > 0) {
                foreach ($pivotFeatures as $pivotId => $pivotFeature) {
                    $currentPivotLayer = $pivotFeature['layer'];
                    foreach ($pivotFeature['features'] as $feature) {
                        // null value passed as loginFilterOverride -> is this necessary for pivot tables?
                        $rsp = $currentPivotLayer->deleteFeature($feature, null, $cnx);
                        if (!$rsp) {
                            $relationsRemoved = false;

                            break;
                        }
                    }
                    if (!$relationsRemoved) {
                        break;
                    }
                }
            }
            if ($relationsRemoved) {
                $feature = $this->featureData->features[0];
                $rs = $qgisForm->deleteFromDb($feature, $cnx);

                if ($rs !== false) {
                    jMessage::add(jLocale::get('view~edition.message.success.delete'), 'success');
                    $eventParams['deleteFiles'] = $deleteFiles;
                    $eventParams['success'] = true;

                    // delete associated files to the record
                    foreach ($deleteFiles as $path) {
                        if (file_exists($path)) {
                            unlink($path);
                        }
                    }
                    $cnx->commit();
                } else {
                    jMessage::add(jLocale::get('view~edition.message.error.delete'), 'error');
                    $eventParams['success'] = false;
                    $cnx->rollback();
                }
            } else {
                jMessage::add(jLocale::get('view~edition.message.error.delete'), 'error');
                $eventParams['success'] = false;
                $cnx->rollback();
            }
        } catch (Exception $e) {
            jLog::log('An error has been raised when saving form data edition to db:'.$e->getMessage(), 'lizmapadmin');
            jLog::logEx($e, 'error');
            jMessage::add(jLocale::get('view~edition.message.error.delete'), 'error');
            $eventParams['success'] = false;
            if (isset($cnx)) {
                $cnx->rollback();
            }
        }
        jEvent::notify('LizmapEditionPostDelete', $eventParams);

        return $this->serviceAnswer();
    }

    /**
     * Get Features via WFS from pivots connected to the current layer feature on editing.
     *
     * @return mixed $pivotFeature The array containing the features
     */
    protected function getPivotFeatures()
    {
        $pivotFeature = array();
        $relations = $this->project->getRelations();

        if (!is_array($relations)) {
            return $pivotFeature;
        }
        if (!array_key_exists('pivot', $relations)) {
            return $pivotFeature;
        }
        $pivots = $relations['pivot'];

        foreach ($pivots as $pivotId => $pivotReference) {
            if (array_key_exists($this->layerId, $pivotReference) && array_key_exists($this->layerId, $relations)) {
                // check relation validity
                foreach ($relations[$this->layerId] as $rel) {
                    if ($rel['referencingLayer'] == $pivotId && $rel['referencingField'] == $pivotReference[$this->layerId] && in_array($rel['referencedField'], $this->primaryKeys)) {
                        // avoid duplications
                        if (!array_key_exists($pivotId, $pivotFeature)) {
                            // check for edition capabilities
                            $editionLayerInfo = $this->getLayerEditionParameter($this->project, $pivotId, null, false);
                            if ($editionLayerInfo && is_array($editionLayerInfo)) {
                                if (array_key_exists($rel['referencedField'], $editionLayerInfo['dbFieldsInfo']->dataFields)) {
                                    $currentLayer = $editionLayerInfo['layer'];
                                    // checks on attribute table
                                    if ($this->project->hasAttributeLayers() && $this->project->hasAttributeLayersForLayer($editionLayerInfo['layerName']) && $this->project->isPivotLayer($editionLayerInfo['layerName'])) {
                                        // build filter for pivot table
                                        $exp_filter = '"'.$rel['referencingField'].'" = \''.$this->featureId.'\'';
                                        // get records via WFS service
                                        $featureData = $this->getWfsFeature($currentLayer, $this->featureId, array(0 => $rel['referencingField']), $exp_filter);
                                        if ($featureData) {
                                            $eCapabilities = $currentLayer->getRealEditionCapabilities();
                                            if ($eCapabilities->deleteFeature == 'True') {
                                                foreach ($featureData->features as $feature) {
                                                    if (!$this->loginFilteredOverride) {
                                                        $is_editable = $currentLayer->isFeatureEditable($feature);
                                                        if (!$is_editable) {
                                                            continue;
                                                        }
                                                    }
                                                    $currentFeatureId = $feature->{$editionLayerInfo['primaryKeys'][0]};
                                                    if (!$currentFeatureId && $currentFeatureId !== 0 && $currentFeatureId !== '0') {
                                                        continue;
                                                    }
                                                    if (!array_key_exists($pivotId, $pivotFeature)) {
                                                        $pivotFeature[$pivotId] = array(
                                                            'layer' => $currentLayer,
                                                            'features' => array(),
                                                        );
                                                    }
                                                    $pivotFeature[$pivotId]['features'][] = $feature;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return $pivotFeature;
    }

    /**
     * Save a new feature, without redirecting to an HTML response.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Qgis id of the layer
     * @urlparam integer $featureId Id of the feature.
     *
     * @return jResponseJson
     */
    public function saveNewFeature()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array('success' => true);

        // Get repository, project data and do some right checking
        if (!$this->getEditionParameters(true)) {
            $rep->data['success'] = false;
            $rep->data['message'] = $this->errorMessage;

            return $rep;
        }

        // Get the form instance
        $form = jForms::create('view~edition', '____new__feature___');
        if (!$form) {
            $rep->data['success'] = false;
            $rep->data['message'] = jLocale::get('view~edition.message.error.form.get');

            return $rep;
        }

        // event to add custom field into the jForms form before setting data in it
        $eventParams = array(
            'form' => $form,
            'project' => $this->project,
            'repository' => $this->repository,
            'layer' => $this->layer,
            'featureId' => $this->featureId,
            'featureData' => $this->featureData,
            'status' => $this->param('status', 0),
        );
        jEvent::notify('LizmapEditionSaveGetForm', $eventParams);

        // Dynamically add form controls based on QGIS layer information
        // And save data into the edition table (insert or update line)
        $qgisForm = null;

        try {
            $qgisForm = new Form\QgisForm($this->layer, $form, $this->featureId, $this->loginFilteredOverride, lizmap::getAppContext());
        } catch (Exception $e) {
            $rep->data['success'] = false;
            $rep->data['message'] = $e->getMessage();

            return $rep;
        }

        // event to add or modify some control after QgisForm has added its own controls
        $eventParams['qgisForm'] = $qgisForm;
        jEvent::notify('LizmapEditionSaveGetQgisForm', $eventParams);

        // Get data from the request and set the form controls data accordingly
        $form->initFromRequest();

        // Check the form data and redirect if needed
        $check = $form->check();

        // event to add additionnal checks
        $event = jEvent::notify('LizmapEditionSaveCheckForm', $eventParams);
        if ($event->allResponsesByKeyAreTrue('check') === false || !$check) {
            $rep->data['success'] = false;
            $rep->data['message'] = 'There are some errors in the form';

            return $rep;
        }

        // Check geometry
        $modifyGeometry = $this->layer->getRealEditionCapabilities()->modifyGeometry;
        if (strtolower($modifyGeometry) == 'true' && $this->geometryColumn != '' && $form->getData($this->geometryColumn) == '') {
            $rep->data['success'] = false;
            $rep->data['message'] = jLocale::get('view~edition.message.error.no.geometry');

            return $rep;
        }

        // Save data into database
        // And get returned primary key values
        $feature = null;
        if ($this->featureId || $this->featureId === 0 || $this->featureId === '0') {
            $feature = $this->featureData->features[0];
        }
        $pkvals = $qgisForm->saveToDb($feature);

        jForms::destroy('view~edition', '____new__feature___');

        // Some errors where encoutered
        if (!$check || !$pkvals) {
            $rep->data['success'] = false;
            $rep->data['message'] = 'Error during the save of the feature';

            return $rep;
        }

        return $rep;
    }

    /**
     * Editable features.
     *
     * Get the layer editable features.
     * Used client-side to fetch the features which are editable by the authenticated user
     * when there is a filter by login (and/or by polygon). This allows to deactivate the editing icon
     * for the other non-editable features inside the popup and attribute table.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Qgis id of the layer
     *
     * @return jResponseJson
     */
    public function editableFeatures()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array('success' => false);

        $project = $this->param('project');
        $repository = $this->param('repository');
        $layerId = $this->param('layerId');

        if (!$project) {
            $rep->data['message'] = jLocale::get('view~edition.message.error.parameter.project');

            return $rep;
        }

        // Get repository data
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            $rep->data['message'] = 'The repository '.strtoupper($repository).' does not exist !';

            return $rep;
        }

        // Get the project data
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                $rep->data['message'] = 'The lizmap project '.strtoupper($project).' does not exist !';

                return $rep;
            }
        } catch (UnknownLizmapProjectException $e) {
            $rep->data['message'] = 'The lizmap project '.strtoupper($project).' does not exist !';

            return $rep;
        }

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            $rep->data['message'] = jLocale::get('view~default.repository.access.denied');

            return $rep;
        }

        // Redirect if no rights to use the edition tool
        if (!jAcl2::check('lizmap.tools.edition.use', $lrep->getKey())) {
            $rep->data['message'] = jLocale::get('view~edition.access.denied');

            return $rep;
        }

        /** @var null|qgisVectorLayer $layer The QGIS vector layer instance */
        $layer = $lproj->getLayer($layerId);
        if (!$layer) {
            $rep->data['message'] = jLocale::get('view~edition.message.error.layer.editable');

            return $rep;
        }

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');

        $rep->outputFileName = 'editableFeatures.json';
        $rep->doDownload = false;

        // Get editable features array: status and features as iterator
        $editableFeatures = $layer->editableFeatures();

        // Build response generator based on editable features
        $inputGenerator = function () use ($editableFeatures) {
            // Build static data
            $data = array();
            $data['success'] = true;
            $data['message'] = 'Success';
            $data['status'] = $editableFeatures['status'];

            // send first part of the JSON based on static data
            yield trim(json_encode($data, JSON_PRETTY_PRINT), "}\n").",\n    \"features\": [";

            // send features step by step
            $separator = '';
            foreach ($editableFeatures['features'] as $feat) {
                yield $separator.json_encode($feat);
                $separator = ",\n        ";
            }

            // send end of the JSON
            yield "\n    ]\n}\n";
        };

        $rep->setContentCallback(function () use ($inputGenerator) {
            $output = Psr7Utils::streamFor(fopen('php://output', 'w+'));
            $input = Psr7Utils::streamFor($inputGenerator());
            Psr7Utils::copyToStream($input, $output);
        });

        return $rep;
    }

    /**
     * Link features between 2 tables :
     * - Either [1->n] relation, ie a parent layer and a child layer. In this case, passed $features2 layer id = $pivot.
     *   In this case, we set the parent id in the child table foreign key column
     * - Or [n<->m] relation ie 2 tables with a pivot table between them
     *   In this case we add a new line in the pivot table referencing both parent layers.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $pivot Pivot layer id. Example : mypivot1234
     * @urlparam string $features1 Layer id + features. Example : mylayer456:1,2
     * @urlparam string $features2 Layer id + features. Example : otherlayer789:5
     * @urlparam integer $featureId Id of the feature.
     *
     * @return jResponseHtmlFragment
     */
    public function linkFeatures()
    {
        $project = $this->param('project');
        $repository = $this->param('repository');

        // Get repository data
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');

            return $this->serviceAnswer();
        }

        // Get the project data
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return $this->serviceAnswer();
            }
        } catch (UnknownLizmapProjectException $e) {
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return $this->serviceAnswer();
        }

        $this->project = $lproj;
        $this->repository = $lrep;

        // Check the mandatory parameters features1 & features2
        $features1 = $this->param('features1');
        $features2 = $this->param('features2');
        $pivotId = $this->param('pivot');
        if (!$features1 || !$features2 || !$pivotId) {
            jMessage::add(jLocale::get('view~edition.link.error.missing.parameter'), 'error');

            return $this->serviceAnswer();
        }

        // Cut layers id and features ids and check if data is correctly sent
        $exp1 = explode(':', $features1);
        $exp2 = explode(':', $features2);
        if (count($exp1) != 3 || count($exp2) != 3) {
            jMessage::add(jLocale::get('view~edition.link.error.missing.parameter'), 'error');

            return $this->serviceAnswer();
        }

        // Get the list of features ids given for each layer
        $ids1 = explode(',', $exp1[2]);
        $ids2 = explode(',', $exp2[2]);

        // Not enough id given
        if (count($ids1) == 0 || count($ids2) == 0 || empty($exp1[2]) || empty($exp2[2])) {
            jMessage::add(jLocale::get('view~edition.link.error.missing.id'), 'error');

            return $this->serviceAnswer();
        }

        // Get the layer names
        $layer1 = $lproj->getLayer($exp1[0]);
        $layer2 = $lproj->getLayer($exp2[0]);
        if (!$layer1 || !$layer2) {
            jMessage::add(jLocale::get('view~edition.link.error.wrong.layer'), 'error');

            return $this->serviceAnswer();
        }
        $layerName1 = $layer1->getName();
        $layerName2 = $layer2->getName();

        // Verifying the layers are present in the attribute table configuration
        if (!$lproj->hasAttributeLayers()
            || !$lproj->hasAttributeLayersForLayer($layerName1)
            || !$lproj->hasAttributeLayersForLayer($layerName2)
        ) {
            jMessage::add(jLocale::get('view~edition.link.error.not.attribute.layer'), 'error');

            return $this->serviceAnswer();
        }

        // Get the child layer (which can be a third pivot table) qgisVectorLayer instance
        /** @var qgisVectorLayer $layer The QGIS vector layer instance */
        $layer = $lproj->getLayer($pivotId);
        $layerNamePivot = $layer->getName();
        $this->layerId = $pivotId;
        $this->layerName = $layerNamePivot;
        $this->layer = $layer;

        // Get the editing capabilities for the child layer (which can be a third pivot table)
        $capabilities = $layer->getRealEditionCapabilities();

        // Check if we are in a 1-n relation or in a n-m relation with a pivot layer
        // If the name of the 2nd layer is the same that the pivot layer, we are in a 1-n relation
        $isPivot = false;
        if ($layerNamePivot != $layerName2) {
            // pivot layer (n:m)
            $isPivot = true;
            if ($capabilities->createFeature != 'True') {
                jMessage::add(jLocale::get('view~edition.link.error.no.create.feature', array($layerNamePivot)), 'LayerNotEditable');

                return $this->serviceAnswer();
            }
        } else {
            // child layer (1:n)
            $isPivot = false;
            if ($capabilities->modifyAttribute != 'True') {
                jMessage::add(jLocale::get('view~edition.link.error.no.modify.attributes', array($layerNamePivot)), 'LayerNotEditable');

                return $this->serviceAnswer();
            }
        }

        // For the 1-n relation, do not allow multiple ids for the parent layer
        // to avoid wrong data editing (a child feature cannot have 2 parent ids)
        // It could be ok if we have a n-m relation with a pivot table, by definition
        // but it could lead to many unwanted links if we do not prevent it also
        // Forbid it for both cases.
        if (count($ids1) > 1 && count($ids2) > 1) {
            jMessage::add(jLocale::get('view~edition.link.error.multiple.ids'), 'error');

            return $this->serviceAnswer();
        }

        // Get fields data from the edition database
        $dbFieldsInfo = $this->layer->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;

        // Check fields
        if (!array_key_exists($exp1[1], $dataFields) || !array_key_exists($exp2[1], $dataFields)) {
            jMessage::add(jLocale::get('view~edition.link.error.no.given.fields'), 'error');

            return $this->serviceAnswer();
        }
        $key1 = $exp1[1];
        $key2 = $exp2[1];

        // Check if we need to insert a new row in a pivot table (n-m relation)
        // or if we need to update a foreign key in a child table (1-n relation)
        if (!$isPivot) {
            // Check if there is only one parent item selected
            if (count($ids1) > 1) {
                jMessage::add(jLocale::get('view~edition.link.error.multiple.ids'), 'error');

                return $this->serviceAnswer();
            }

            // Update the child features to add the parent id
            try {
                $foreign_key_column = $key2;
                $parent_id_value = $ids1[0];
                $child_pkey_column = $key1;
                $child_ids = $ids2;
                $layer->linkChildren($foreign_key_column, $parent_id_value, $child_pkey_column, $child_ids);
                jMessage::add(jLocale::get('view~edition.link.success'), 'success');
            } catch (Exception $e) {
                jLog::log('An error has been raised when create linked data: '.$e->getMessage(), 'lizmapadmin');
                jLog::logEx($e, 'error');
                jMessage::add(jLocale::get('view~edition.link.error.sql'), 'error');
            }
        } else {
            // 2 layers and 1 pivot table -> n:m relation
            // Insert lines in the pivot table referencing the 2 parent layers id
            try {
                $layer->insertRelations($key2, $ids2, $key1, $ids1);
                jMessage::add(jLocale::get('view~edition.link.success'), 'success');
            } catch (Exception $e) {
                jLog::log('An error has been raised when create linked data: '.$e->getMessage(), 'lizmapadmin');
                jLog::logEx($e, 'error');
                jMessage::add(jLocale::get('view~edition.link.error.sql'), 'error');
            }
        }

        return $this->serviceAnswer();
    }

    /**
     * Unlink child feature from their parent ( 1:n ) relation
     * by setting the foreign key to NULL.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     * @urlparam string $layerId Child layer id.
     * @urlparam string $pkey Child layer primary key value -> id of the line to update
     * @urlparam string $fkey Child layer foreign key column (pointing to the parent layer primary key)
     *
     * @return jResponseHtmlFragment
     */
    public function unlinkChild()
    {
        $lid = $this->param('lid');
        $fkey = $this->param('fkey');
        $pkey = $this->param('pkey');
        $pkeyval = $this->param('pkeyval');
        $project = $this->param('project');
        $repository = $this->param('repository');

        if (!$lid || !$fkey || !$pkey || !$pkeyval || !$project || !$repository) {
            jMessage::add(jLocale::get('view~edition.link.error.missing.parameter'), 'error');

            return $this->serviceAnswer();
        }

        // Get repository data
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');

            return $this->serviceAnswer();
        }
        // Get the project data
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return $this->serviceAnswer();
            }
        } catch (UnknownLizmapProjectException $e) {
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return $this->serviceAnswer();
        }
        $this->project = $lproj;
        $this->repository = $lrep;

        // Get child layer information
        $layer = $lproj->getLayer($lid);
        $layerName = $layer->getName();
        $this->layerId = $lid;
        $this->layerName = $layerName;
        $this->layer = $layer;

        // Get editLayer capabilities
        $capabilities = $layer->getRealEditionCapabilities();
        if ($capabilities->modifyAttribute != 'True') {
            jMessage::add(jLocale::get('view~edition.link.error.no.modify.attributes', array($layerName)), 'LayerNotEditable');

            return $this->serviceAnswer();
        }

        // Get fields data from the edition database
        $dbFieldsInfo = $this->layer->getDbFieldsInfo();
        $dataFields = $dbFieldsInfo->dataFields;

        // Check fields
        if (!array_key_exists($fkey, $dataFields) || !array_key_exists($pkey, $dataFields)) {
            jMessage::add(jLocale::get('view~edition.link.error.no.given.fields'), 'error');

            return $this->serviceAnswer();
        }

        // Need to break SQL ( if sqlite
        try {
            $layer->unlinkChild($fkey, $pkey, $pkeyval);
            jMessage::add(jLocale::get('view~edition.unlink.success'), 'success');
        } catch (Exception $e) {
            jLog::log('An error has been raised when unlink child: '.$e->getMessage(), 'lizmapadmin');
            jLog::logEx($e, 'error');
            jMessage::add(jLocale::get('view~edition.unlink.error.sql'), 'error');
        }

        return $this->serviceAnswer();
    }

    /**
     * web service for XHR request when group visibilities
     * depending on the value of form controls.
     */
    public function getGroupVisibilities()
    {
        if (!$this->request->isPostMethod()) {
            $rep = $this->getResponse('text', true);
            $rep->setHttpStatus('405', 'Method Not Allowed');

            return $rep;
        }

        $rep = $this->getResponse('json', true);

        try {
            $form = jForms::get($this->param('__form'), $this->param('__formid'));
            if (!$form) {
                throw new Exception('dummy');
            }
        } catch (Exception $e) {
            $rep = $this->getResponse('text', true);
            $rep->setHttpStatus('422', 'Unprocessable entity');
            $rep->content = 'invalid form selector';

            return $rep;
        }

        // check CSRF
        if ($form->securityLevel == jFormsBase::SECURITY_CSRF) {
            if ($form->getContainer()->token !== $this->param('__JFORMS_TOKEN__')) {
                $rep = $this->getResponse('text', true);
                $rep->setHttpStatus('422', 'Unprocessable entity');
                $rep->content = 'invalid token';
                jLog::logEx(new jException('jelix~formserr.invalid.token'), 'error');

                return $rep;
            }
        }

        // Build QGIS Form
        $repository = $form->getData('liz_repository');
        $project = $form->getData('liz_project');
        $layerId = $form->getData('liz_layerId');
        $featureId = $form->getData('liz_featureId');

        $lrep = lizmap::getRepository($repository);
        $lproj = lizmap::getProject($repository.'~'.$project);
        $layer = $lproj->getLayer($layerId);

        $qgisForm = new Form\QgisForm($layer, $form, $featureId, jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey()), lizmap::getAppContext());

        // Update qgis group dependencies
        $privateData = $form->getContainer()->privateData;
        $dependencies = $privateData['qgis_groupDependencies'];
        foreach ($dependencies as $ctname) {
            $form->setData($ctname, $this->param($ctname));
        }

        // evaluate group visibilities
        $attributeEditorForm = $qgisForm->getAttributesEditorForm();
        $rep->data = qgisExpressionUtils::evaluateGroupVisibilities($attributeEditorForm, $form);

        return $rep;
    }
}
