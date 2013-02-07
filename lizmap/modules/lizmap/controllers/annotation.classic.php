<?php
/**
* Annotation tool web services
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class annotationCtrl extends jController {


  private $project = '';
  private $repository = '';
  private $layerId = '';
  private $lizmapConfig = '';
  private $qgsLoad = '';
  private $xpathItems = '';


  /**
  * Send an OGC service Exception
  * @param $SERVICE the OGC service
  * @return XML OGC Service Exception.
  */
  function serviceException(){

    $messages = jMessage::getAll();

    $rep = $this->getResponse('xml');
    $rep->contentTpl = 'lizmap~wms_exception';
    $rep->content->assign('messages', $messages);
    jMessage::clearAll();

    return $rep;
  }
  
  
  /**
  * Get parameters and set lizmapConfig for the project and repository given.
  *
  * @param boolean $save If true, we have to save the form. So take liz_repository and others instead of repository from request parameters.
  * @return array List of needed variables : $params, $lizmapConfig, etc.
  */
  private function getAnnotationParameters($save=Null){

    // Get the project
    $project = $this->param('project');
    $repository = $this->param('repository');
    $layerId = $this->param('layerId');
    
    if($save){
      $project = $this->param('liz_project');
      $repository = $this->param('liz_repository');
      $layerId = $this->param('liz_layerId');    
    }
    
    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return false;
    }

    // Get repository data
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return false;
    }

    // Redirect if no rights to use the annotation tool
    if(!jacl2::check('lizmap.tools.annotation.use', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~annotation.access.denied'), 'AuthorizationRequired');
      return false;
    }
    
    // Read the QGIS project file to get the annotation layer(s) property
    $qgisProjectClass = jClasses::getService('lizmap~qgisProject');
    $xpath = "//maplayer[id='$layerId']";
    
    list($go, $qgsLoad, $xpathItems, $errorlist) = $qgisProjectClass->readQgisProject($lizmapConfig, $project, $xpath);
       
    // Return error if no data found   
    if(!$go or !$xpathItems){
      jMessage::add("No data found in the QGIS project file");
      return false;
    }

    // Define class private properties   
    $this->project = $project;
    $this->repository = $repository;
    $this->layerId = $layerId;
    $this->lizmapConfig = $lizmapConfig;
    $this->qgsLoad = $qgsLoad;
    $this->xpathItems = $xpathItems;
    
    return true;
  }
  
  
  /**
  * Dynamically add controls to the form based on QGIS layer information
  * 
  * @param object $lizmapConfig Lizmap configuration instance
  * @param object $xpathItems simplexml item containing layer information.
  * @param object $form Jelix form to add controls to.
  * @param integer $featureId ()Optionnal) If given, set the data for each form control from sqlite annotation table line.
  * @param string $save If set, save the form data into the database : 'insert' or 'update'.
  * @return modified form.
  */
  private function addFormControls($lizmapConfig, $xpathItems, $form, $featureId=Null, $save=Null){
  
    // Get fields data from the sqlite annotation database  
    $xpathItemsZero = $xpathItems[0];
    $_datasource = $xpathItemsZero->xpath('datasource');   
    $datasource = (string)$_datasource[0];
    
    $dbnameMatch = preg_match("#dbname='(.+)' table=\"(.+)\"#", $datasource, $matches);
    $dbname = $matches[1];
    $annotationTable = $matches[2];
		$dbpath = realpath($lizmapConfig->repositoryData['path'].$dbname);
    $db = new SQLite3($dbpath);
    # loading SpatiaLite as an extension
    $db->loadExtension('libspatialite.so');
        
    // Get fields data from XML for the layer
    $edittypesXml = $xpathItemsZero->edittypes[0];
    $_categoriesXml = $xpathItemsZero->xpath('renderer-v2/categories');
    $categoriesXml = $_categoriesXml[0];
    
    // Query the database to get the annotation table fields
    $sql = "PRAGMA table_info('$annotationTable');";
    $rs = $db->query($sql);
    $pk = ''; $geocolumn = '';
    $fields = array();
    
    // Loop through the table fields
    // and create a form control if needed
    jClasses::inc('lizmap~qgisFormControl');
    $controls = array();

    while($record = $rs->fetchArray()){
		  $ref = $record['name'];

		  // store fields and pk
		  $fields[] = $ref;
		  // detect primary key column
		  if($record['pk'] == 1)
		    $pk = $record['name'];
		  // detect geometry column
		  if(in_array($record['type'], array('POINT', 'LINESTRING', 'POLYGON', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON', 'GEOMETRYCOLLECTION', 'GEOMETRY')))
		    $geocolumn = $ref;
		  // Create new control from qgis edit type
		  $aliasXml = Null;
		  if($xpathItemsZero->aliases){
        $aliasesZero = $xpathItemsZero->aliases[0];
        $aliasXml = $aliasesZero->xpath("alias[@field='$ref']");
      }
		  $dataType = $record['type'];
		  $edittype = null;
		  if($edittypesXml)
		    $edittype = $edittypesXml->xpath("edittype[@name='$ref']");
    
		  $controls[$ref] = new qgisFormControl($ref, $edittype, $aliasXml, $categoriesXml, $dataType);
		  $form->addControl($controls[$ref]->ctrl);
	    $form->setReadOnly($ref, $controls[$ref]->isReadOnly);
    }    
    
		if(!$pk)
		  $pk = $fields[0];
		  
    // Optionnaly query for the feature
    
    if($save){
      // Set the form from request
      $form->initFromRequest();
      
      // Get layer srid
      $xpathItemsZero = $xpathItems[0];
      $srid = (integer)$xpathItemsZero->srs->spatialrefsys->srid;

      // Pop the primary key field
      $fields = array_diff($fields, array($pk));
      
      // Loop through remaining fields to get data to store
      $update = array(); $insert = array();
      foreach($fields as $ref){
        $value = $form->getData($ref);
        switch($controls[$ref]->fieldDataType){
          case 'geometry':
            $value = "ST_GeomFromText('".filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)."', $srid)";
            break;
          case 'integer':
            $value = filter_var($value, FILTER_SANITIZE_NUMBER_INT);
            break;
          case 'float':
            $value = (float)$value;
            break;
          default:
            $value = "'".SQLite3::escapeString(filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES))."'";
            break;
        }
        $insert[]=$value;
        $update[]="$ref=$value";
      }
    
      $sql = '';
      if($featureId){
        // featureId is set
        // SQL for updating on line in the annotation table    
        $sql = " UPDATE $annotationTable SET ";
        $sql.= implode(',', $update);
        $sql.= " WHERE $pk = $featureId ;";
      }elseif($save == 'update'){
        // SQL for insertion into the annotation table
        $sql = " INSERT INTO $annotationTable (";
        $sql.= implode(', ', $fields);
        $sql.= " ) VALUES (";
        $sql.= implode(', ', $insert);
        $sql.= " );";
      }
jLog::log($sql);      
      $rs = $db->query($sql);
    }
    else{
      if($featureId){
        // Set form controls based on data
        $sql = "SELECT *, ST_AsText(".$geocolumn.") AS astext FROM $annotationTable WHERE $pk = $featureId;";
        $rs = $db->query($sql);
        while($record = $rs->fetchArray()){
          foreach($fields as $ref){
            $form->setData($ref, $record[$ref]);
          }
          // geometry column
          $form->setData($ref, $record['astext']);
        }
      }
    }
    $db->close();
  }
    
  
  
  /**
  * Create an annotation form based on the annotation layer.
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project
  * @param string $layerId Qgis id of the layer
  * @return redirect to the display action.
  */
  public function createAnnotation(){
  
    // Get repository, project data and do some right checking
    if(!$this->getAnnotationParameters())
      return $this->serviceException();

		// Create form instance
		$form = jForms::create('view~annotation');
		
		// Redirect to the display action
		$rep = $this->getResponse('redirect');
		$rep->params = array(
		  "project"=>$this->project, 
		  "repository"=>$this->repository, 
		  "layerId"=>$this->layerId
		);
    $rep->action="lizmap~annotation:editAnnotation";
    
    return $rep;  
    
  }
  
  
  /**
  * Modify an annotation.
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project
  * @param string $layerId Qgis id of the layer
  * @param integer $featureId Id of the annotation.
  * @return redirect to the display action.
  */
  public function modifyAnnotation(){
  
    // Get repository, project data and do some right checking
    if(!$this->getAnnotationParameters())
      return $this->serviceException();
       
    // Get the annotation id
		$featureId = $this->intParam('featureId');
		if(!$featureId){
      jMessage::add('No id has been given for the feature', 'noFeatureId');
		  return $this->serviceException();
		}
       
		// Create form instance		
		$form = jForms::create('view~annotation', $featureId);    
    if(!$form){
      jMessage::add('An error has been raised when creating the form', 'formNotDefined');
      return $this->serviceException();
    }
		
		// Dynamically add form controls based on QGIS layer information
		// And set form data from database content
		$this->addFormControls($this->lizmapConfig, $this->xpathItems, $form, $featureId); 
		
		// Redirect to the display action
		$rep = $this->getResponse('redirect');
		$rep->params = array(
		  "project"=>$this->project, 
		  "repository"=>$this->repository, 
		  "layerId"=>$this->layerId,
		  "featureId"=>$featureId
		);
    $rep->action="lizmap~annotation:editAnnotation";
    return $rep;  
    
  }  
  
  /**
  * Display the annotation form (output as html fragment)
  *
  * @return HTML code containing the form.
  */
  public function editAnnotation(){
  
    // Get repository, project data and do some right checking
    if(!$this->getAnnotationParameters())
      return $this->serviceException();
    
    // Get the annotation id
		$featureId = $this->intParam('featureId');
		
    // Get the form instance
    $form = jForms::get('view~annotation', $featureId);
    
    if(!$form){
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceException();
    }
    
    // Set lizmap form controls
		$form->setData('liz_repository', $this->repository);
		$form->setData('liz_project', $this->project);
		$form->setData('liz_layerId', $this->layerId);
		$form->setData('liz_featureId', $featureId);
    
		// Dynamically add form controls based on QGIS layer information
		$this->addFormControls($this->lizmapConfig, $this->xpathItems, $form, $featureId);  
  
		// Use template to create html form content
		$tpl = new jTpl();
		$tpl->assign(array('form'=>$form));
		$content = $tpl->fetch('view~annotation_form');
			
		// Return html fragment response
		$rep = $this->getResponse('htmlfragment');
    $rep->addContent($content);
#		$rep = $this->getResponse('html');
#		$rep->body->assign('MAIN', $content);
    return $rep;
  
  }
  
  /**
  * Display the annotation form (output as html fragment)
  *
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project
  * @param string $layerId Qgis id of the layer
  * @param integer $featureId Id of the annotation.
  * @return Redirect to the validation action.
  */  
  public function saveAnnotation(){
  
    // Get repository, project data and do some right checking
    if(!$this->getAnnotationParameters())
      return $this->serviceException();
    
    // Get the annotation id
		$featureId = $this->intParam('liz_featureId');
		
    // Get the form instance
    $form = jForms::get('view~annotation', $featureId);
    
    if(!$form){
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceException();
    }
    
		// Dynamically add form controls based on QGIS layer information
		// And save data into the annotation table (insert or update line)
    $save =True;
		$this->addFormControls($this->lizmapConfig, $this->xpathItems, $form, $featureId, $save);
		
		// Redirect to the validation action
		$rep = $this->getResponse('redirect');
		$rep->params = array(
		  "project"=>$this->project, 
		  "repository"=>$this->repository, 
		  "layerId"=>$this->layerId,
		  "featureId"=>$featureId
		);
    $rep->action="lizmap~annotation:validateAnnotation";
    return $rep;  
  
  }
  
  /**
  * Form validation : destroy it and display a message
  *
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project
  * @param string $layerId Qgis id of the layer
  * @param integer $featureId Id of the annotation.
  * @return Confirmation message that the form has been saved.
  */  
  public function validateAnnotation(){
  
    // Get repository, project data and do some right checking
    if(!$this->getAnnotationParameters())
      return $this->serviceException();
    
    // Get the annotation id
		$featureId = $this->intParam('featureId');
		
    // Destroy the form
    if($form = jForms::get('view~annotation', $featureId)){
      jForms::destroy('view~annotation', $featureId);
    }else{
      // undefined form : redirect to error
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceException();
    }      
  
		// Return html fragment response
		$rep = $this->getResponse('htmlfragment');
    $rep->addContent(jLocale::get('view~annotation.form.date.saved'));
    return $rep;
      
  }
  
}
