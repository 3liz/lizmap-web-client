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

  // lizmapProject
  private $project = null;
  
  // lizmapRepository
  private $repository = null;
  
  // layer id in the QGIS project file
  private $layerId = '';
  
  // table name
  private $table = '';

  // provider driver map
  private $providerDriverMap = array(
    'spatialite'=>'sqlite3',
    'postgres'=>'pgsql'
  );

  // provider
  private $provider = '';
  
  // featureIdParam : featureId parameter from the request
  private $featureIdParam = Null;
  
  // featureId : an integer or a string whith coma separated integers
  private $featureId = Null;
  
  // Layer date as simpleXml object
  private $layerXml = '';
  
  // Fields information taken from database
  private $dataFields = '';
  
  // Map data type as geometry type
  private $geometryDatatypeMap = array(
	  'point', 'linestring', 'polygon', 'multipoint', 
		'multilinestring', 'multipolygon', 'geometrycollection', 'geometry'
	);
	
	// Primary key
	private $primaryKeys = '';
	
	// Geometry column
	private $geometryColumn = '';
	
	// Geometry srid
	private $srid = '';
	
	// Geometry proj4 string
	private $proj4 = '';
	
	// Form controls
	private $formControls = '';


  /**
  * Send an OGC service Exception
  * @param $SERVICE the OGC service
  * @return XML OGC Service Exception.
  */
  function serviceAnswer(){

    // Get title layer
    $layerXmlZero = $this->layerXml[0];
    $_title = $layerXmlZero->xpath('title');   
    $title = (string)$_title[0];
    if ( !$title )
      $title = jLocale::get("view~annotation.modal.title.default");

    $messages = jMessage::getAll();
		$rep = $this->getResponse('htmlfragment');
    $tpl = new jTpl();
    $tpl->assign('title', $title);
		$content = $tpl->fetch('view~jmessage_modal');
    $rep->addContent($content);
    jMessage::clearAll();
    return $rep;
  }
 
  
  /**
  * Get parameters and set classes for the project and repository given.
  *
  * @param boolean $save If true, we have to save the form. So take liz_repository and others instead of repository from request parameters.
  * @return array List of needed variables : $params, $lizmapRepository, lizmapProject, etc.
  */
  private function getAnnotationParameters($save=Null){

    // Get the project
    $project = $this->param('project');
    $repository = $this->param('repository');
    $layerId = $this->param('layerId');
    $featureIdParam = $this->param('featureId');
    
    if($save){
      $project = $this->param('liz_project');
      $repository = $this->param('liz_repository');
      $layerId = $this->param('liz_layerId'); 
      $featureIdParam = $this->param('liz_featureId');   
    }
    
    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return false;
    }

    // Get repository data
    $lrep = lizmap::getRepository($repository);
    $lproj = lizmap::getProject($repository.'~'.$project);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lrep->getKey())){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return false;
    }

    // Redirect if no rights to use the annotation tool
    if(!jacl2::check('lizmap.tools.annotation.use', $lrep->getKey())){
      jMessage::add(jLocale::get('view~annotation.access.denied'), 'AuthorizationRequired');
      return false;
    }
    
    $layerXml = $lproj->getXmlLayer( $layerId );
    
    // feature Id (optionnal, only for edition and save)
		if(preg_match('#,#', $featureIdParam))
		  $featureId = preg_split('#,#', $featureIdParam);
		else
		  $featureId = $featureIdParam;

    // Define class private properties   
    $this->project = $lproj;
    $this->repository = $lrep;
    $this->layerId = $layerId;
    $this->featureId = $featureId;
    $this->featureIdParam = $featureIdParam;
    $this->layerXml = $layerXml;
    
    return true;
  }
  

  

  /**
  * Get field data from a database layer corresponding to a QGIS layer
  * @param string $datasource String corresponding to the QGIS <datasource> item for the layer
  * @return object containing the sql fields information
  */
  private function getDataFields($datasource){

    // Get datasource information from QGIS
    $datasourceMatch = preg_match(
      "#dbname='([^ ]+)' (?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:table=\"(.+)\" )?#",
      $datasource,
      $dt
    );
   
    $dbname = $dt[1];
    $host = $dt[2]; $port = $dt[3];
    $user = $dt[4]; $password = $dt[5];
    $sslmode = $dt[6]; $key = $dt[7];
    $estimatedmetadata = $dt[8]; 
    $srid = $dt[9]; $type = $dt[10];
    $table = $dt[11];
    
    // If table contains schema name, like "public"."mytable"
    // We need to add double quotes around and find the real table name (without schema)
    // to retrieve the columns with jelix tools.
    $tableAlone = $table;
    if(preg_match('#"."#', $table)){
      $table = '"'.$table.'"';
      $exp = explode('.', str_replace('"', '', $table));
      $tableAlone = $exp[1];
    }
    
    // Set some private properties
    $this->table = $table;
        
    $driver = $this->providerDriverMap[$this->provider];
    
    // Build array of parameters for the virtual profile
    if($driver == 'sqlite3'){
      $jdbParams = array(
        "driver" => $driver,
        "database" => realpath($this->repository->getPath().$dbname),
        "extensions"=>"libspatialite.so"
      );
    }
    else{
      $jdbParams = array(
        "driver" => $driver,
        "host" => $host,
        "port" => (integer)$port,
        "database" => $dbname,
        "user" => $user,
        "password" => $password
      );
    }

    // Create the virtual jdb profile
    $profile = $this->layerId;
    jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);

    // Get the fields using jelix tools for this connection
    $cnx = jDb::getConnection($profile);
    $tools = $cnx->tools();
    $sequence = null;
    $fields = $tools->getFieldList($tableAlone, $sequence);
    $this->dataFields = $fields;
  }

  
  /**
  * Dynamically add controls to the form based on QGIS layer information
  * 
  * @param object $form Jelix form to add controls to.
  * @param string $save If set, save the form data into the database : 'insert' or 'update'.
  * @return modified form.
  */
  private function addFormControls($form){
  
    // Get fields data from the annotation database  
    $layerXmlZero = $this->layerXml[0];
    $_datasource = $layerXmlZero->xpath('datasource');   
    $datasource = (string)$_datasource[0];
    $s_provider = $layerXmlZero->xpath('provider');
    $this->provider = (string)$s_provider[0];
    $this->getDataFields($datasource);
            
    // Get QGIS fields extra information from XML for the layer
    // edittypes and categories
    $edittypesXml = $layerXmlZero->edittypes[0];
    $_categoriesXml = $layerXmlZero->xpath('renderer-v2/categories');
    $categoriesXml = $_categoriesXml[0];
    
    // Get proj4 string
    $proj4 = (string)$layerXmlZero->srs->spatialrefsys->proj4;
    $this->proj4 = $proj4;

    // Get layer srid
    $srid = (integer)$layerXmlZero->srs->spatialrefsys->srid;
    $this->srid = $srid;
       
    // Loop through the table fields
    // and create a form control if needed
    jClasses::inc('lizmap~qgisFormControl');
    $this->formControls = array();
    foreach($this->dataFields as $fieldName=>$prop){
		  // Detect primary key column
		  if($prop->primary){
		    $this->primaryKeys[] = $fieldName;
		  }
		    
		  // Detect geometry column
		  if(in_array( strtolower($prop->type), $this->geometryDatatypeMap))
		    $this->geometryColumn = $fieldName;
		  
		  // Create new control from qgis edit type
		  $aliasXml = Null;
		  if($layerXmlZero->aliases){
        $aliasesZero = $layerXmlZero->aliases[0];
        $aliasXml = $aliasesZero->xpath("alias[@field='$fieldName']");
      }
		  $edittype = null;
		  if($edittypesXml)
		    $edittype = $edittypesXml->xpath("edittype[@name='$fieldName']");
    
		  $this->formControls[$fieldName] = new qgisFormControl($fieldName, $edittype, $aliasXml, $categoriesXml, $prop->type);
		  $form->addControl($this->formControls[$fieldName]->ctrl);
	    $form->setReadOnly($fieldName, $this->formControls[$fieldName]->isReadOnly);
    }
    
		if(!$this->primaryKeys){
		  jMessage::add("The table ".$this->table." has no primary keys. The annotation tool needs a primary key on the table to be defined.");
		  return false;
		}
      
    return True;
  }


  
  /**
  * Set the form controls data from the database value
  * 
  * @param object $form Jelix jForm object
  * @return Boolean True if filled form
  */
  public function setFormDataFromFields($form){
  
    // Get database connection object
    $cnx = jDb::getConnection($this->layerId);
    
    // Get the array of feature ids
    if(ctype_digit($this->featureId))
      $featureId = array($this->featureId);
    
    // Build the SQL query to retrieve data from the table
    $sql = "SELECT *, ST_AsText(".$this->geometryColumn.") AS astext FROM ".$this->table;
    $v = ''; $i = 0;
    $sql.= ' WHERE';
    foreach($this->primaryKeys as $key){
      $sql.= "$v $key = ".$featureId[$i];
      $i++;
      $v = " AND ";
    }
    
    // Run the query and loop through the result to set the form data
    $rs = $cnx->query($sql);
    foreach($rs as $record){
      // Loop through the data fields
      foreach($this->dataFields as $ref=>$prop){
        $form->setData($ref, $record->$ref);
      }
      // geometry column : override binary with text representation
      $form->setData($this->geometryColumn, $record->astext);
    }
      
    return True;
  }
  
  /**
  * Save the form controls data to the database
  * 
  * @param object $form Jelix jForm object
  * @return Boolean True if the has been saved
  */
  public function saveFormDataToDb($form){
    // Set the form from request
    //$form->initFromRequest();

    // Optionnaly query for the feature
    $cnx = jDb::getConnection($this->layerId);

    // Get list of fields which are not primary keys
    $fields = array();
    foreach($this->dataFields as $fieldName=>$prop){
      if(!$prop->primary)
        $fields[] = $fieldName;
    }

    // Loop though the fields and filter the form posted values
    $update = array(); $insert = array();
    foreach($fields as $ref){
      // Get and filter the posted data foreach form control
      $value = $form->getData($ref);

      switch($this->formControls[$ref]->fieldDataType){
      case 'geometry':
        $value = "ST_GeomFromText('".filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)."', ".$this->srid.")";
        break;
      case 'integer':
        $value = filter_var($value, FILTER_SANITIZE_NUMBER_INT);
        if ( !$value )
          $value = 'NULL';
        break;
      case 'float':
        $value = (float)$value;
        break;
      default:
        $value = $cnx->quote(
          filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)
        );
        break;
      }
      // Build the SQL insert and update query
      $insert[]=$value;
      $update[]="$ref=$value";
    }

    $sql = '';
    // update
    if($this->featureId){
      if(ctype_digit($this->featureId))
        $featureId = array($this->featureId);
      // featureId is set
      // SQL for updating on line in the annotation table    
      $sql = " UPDATE ".$this->table." SET ";
      $sql.= implode(',', $update);
      $v = ''; $i = 0;
      $sql.= ' WHERE';
      foreach($this->primaryKeys as $key){
        $sql.= "$v $key = ".$featureId[$i];
        $i++;
        $v = " AND ";
      }
    }
    // insert
    else {
      // SQL for insertion into the annotation this->table
      $sql = " INSERT INTO ".$this->table." (";
      $sql.= implode(', ', $fields);
      $sql.= " ) VALUES (";
      $sql.= implode(', ', $insert);
      $sql.= " );";
    }
    $rs = $cnx->query($sql);

    return true;
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
      return $this->serviceAnswer();

    jForms::destroy('view~annotation');
    // Create form instance
    $form = jForms::create('view~annotation');

    // Redirect to the display action
    $rep = $this->getResponse('redirect');
    $rep->params = array(
      "project"=>$this->project->getKey(), 
      "repository"=>$this->repository->getKey(), 
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
      return $this->serviceAnswer();

    // Create form instance		
    $form = jForms::create('view~annotation', $this->featureId);    
    if(!$form){
      jMessage::add('An error has been raised when creating the form', 'formNotDefined');
      return $this->serviceAnswer();
    }

    // Dynamically add form controls based on QGIS layer information
    // And set form data from database content
    if(!$this->addFormControls($form))
      return $this->serviceAnswer();

    // Redirect to the display action
    $rep = $this->getResponse('redirect');
    $rep->params = array(
      "project"=>$this->project->getKey(), 
      "repository"=>$this->repository->getKey(), 
      "layerId"=>$this->layerId,
      "featureId"=>$this->featureIdParam
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
      return $this->serviceAnswer();

    // Get the form instance
    $form = jForms::get('view~annotation', $this->featureId);
    if(!$form){
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceAnswer();
    }

    // Set lizmap form controls (hard-coded in the form xml file)
    $form->setData('liz_repository', $this->repository->getKey());
    $form->setData('liz_project', $this->project->getKey());
    $form->setData('liz_layerId', $this->layerId);
    $form->setData('liz_featureId', $this->featureId);

    // Dynamically add form controls based on QGIS layer information
    if(!$this->addFormControls($form) )
      return $this->serviceAnswer();
      
    // Set data for the layer geometry: srid, proj4 and geometryColumn
    $form->setData('liz_srid', $this->srid);
    $form->setData('liz_proj4', $this->proj4);
    $form->setData('liz_geometryColumn', $this->geometryColumn);      

    // SELECT data from the database and set the form data accordingly
    if($this->featureId)
      $this->setFormDataFromFields($form);
   
    // If the user has been redirected here from the saveAnnotation method
    // Set the form controls data from the request parameters
    if($this->param('error')){
      $token = $this->param('error');
      if(isset($_SESSION[$token.$this->layerId]) and $_SESSION[$token.$this->layerId]){
        foreach($_SESSION[$token.$this->layerId] as $ctrl=>$data){
          $form->setData($ctrl, $data);
        }
        unset($_SESSION[$token.$this->layerId]);
      }
    }

    // Get title layer
    $layerXmlZero = $this->layerXml[0];
    $_title = $layerXmlZero->xpath('title');   
    $title = (string)$_title[0];

    // Use template to create html form content
    $tpl = new jTpl();
    $tpl->assign(array(
      'title'=>$title,
      'form'=>$form
    ));
    $content = $tpl->fetch('view~annotation_form');

    // Return html fragment response
    $rep = $this->getResponse('htmlfragment');
    $rep->addContent($content);
#    		$rep = $this->getResponse('html');
#    		$rep->body->assign('MAIN', $content);
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
    $save = True;
    if(!$this->getAnnotationParameters($save))
      return $this->serviceAnswer();
    
    // Get the form instance
    $form = jForms::get('view~annotation', $this->featureId);
    
    if(!$form){
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceAnswer();
    }
    
		// Dynamically add form controls based on QGIS layer information
		// And save data into the annotation table (insert or update line)
    $save =True;
    if(!$this->addFormControls($form) )
		  return $this->serviceAnswer();
     
    // Get data from the request and set the form controls data accordingly
    $form->initFromRequest();

    // Check the form data and redirect if needed
    $check = $form->check();
    if ( $form->getData( $this->geometryColumn ) == '' ) {
      $check = False;
      $form->setErrorOn($this->geometryColumn, "You must set the geometry");
    }
    if ( !$check ) {
      // Redirect to the display action
      $rep = $this->getResponse('redirect');
      $token = uniqid('lizform_');
      $rep->params = array(
        "project"=>$this->project->getKey(), 
        "repository"=>$this->repository->getKey(), 
        "layerId"=>$this->layerId,
        "featureId"=>$this->featureIdParam,
        "error"=>$token
      );
      // Build array of data for all the controls
      // And save it in session
      $controlData = array();
      foreach(array_keys($form->getControls()) as $ctrl) {
        $controlData[$ctrl] = $form->getData($ctrl);
      }
      $_SESSION[$token.$this->layerId] = $controlData;
      $rep->action="lizmap~annotation:editAnnotation";
      

      return $rep;
    }
    
    // Save data into database
    $this->saveFormDataToDb($form);

    // Redirect to the validation action
		$rep = $this->getResponse('redirect');
		$rep->params = array(
		  "project"=>$this->project->getKey(), 
		  "repository"=>$this->repository->getKey(), 
		  "layerId"=>$this->layerId,
		  "featureId"=>$this->featureIdParam
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
      return $this->serviceAnswer();
    		
    // Destroy the form
    if($form = jForms::get('view~annotation', $this->featureId)){
      jForms::destroy('view~annotation', $this->featureId);
    }else{
      // undefined form : redirect to error
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceAnswer();
    }
  
		// Return html fragment response
		jMessage::add(jLocale::get('view~annotation.form.data.saved'));
    return $this->serviceAnswer();
      
  }
 

 
}
