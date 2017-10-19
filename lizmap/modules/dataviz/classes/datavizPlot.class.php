<?php
/**
* @package   lizmap
* @subpackage dataviz
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license    Mozilla Public License
*/

class datavizPlot {

    protected $lproj = null;

    public $title = null;

    public $type = null;

    protected $data = null;

    protected $traces = array();

    protected $x_property_name = null;

    protected $y_property_name = null;

    protected $y_field = null;

    protected $x_field = null;

    protected $color = null;

    protected $color_values = array();

    protected $layout = null;

    function __construct( $repository, $project, $x_field, $y_field, $color='lightblue', $title='plot title', $layout=null, $data=null ){

        // Get the project data
        $lproj = $this->getProject($repository, $project);
        if( !$lproj )
            return false;
        $this->lproj = $lproj;

        $this->y_field = $y_field;
        $this->x_field = $x_field;
        $this->color = $color;

        // Set title, layout and data (use default if none given)
        $this->setTitle($title);
        $this->setLayout($layout);
        $this->setData($data);

        return true;

    }

    public function getProject($repository, $project){
        $lproj = null;
        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if(!$lproj){
                jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
                return false;
            }
        }
        catch(UnknownLizmapProjectException $e) {
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
            return false;
        }
        // Check acl
        if ( !$lproj->checkAcl() ){
          jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
          return false;
        }
        return $lproj;
    }

    protected function setTitle($title) {
        $this->title = $title;
    }

    protected function setLayout($layout=null, $format='array'){
        // First get layout template
        $this->layout = $this->getLayoutTemplate();

        // Then override properties if given
        if( !empty($layout) ){
            if( $format=='json' ){
                // decode source string into PHP array
                $layout = json_decode($layout, true);
            }

            if( is_array($layout) ){
                foreach($layout as $k=>$v){
                    $this->layout[$k] = $v;
                }
            }
        }

    }

    protected function getLayoutTemplate(){
        $layout = array(
            'title' => $this->title,
            'showlegend' => false,
            'autosize'=> true,
            'plot_bgcolor'=> 'rgba(0,0,0,0)',
            'paper_bgcolor'=> 'rgba(0,0,0,0)'
        );
        return $layout;
    }

    protected function setData($data=null, $format='json'){

        if( !empty($data) ){
            if( $format=='json' ){
                // decode source string into PHP array
                $data = json_decode($data, true);
            }
            if( is_array($data) ){
                $this->data = $data;
            }
        }

    }

    protected function getTraceTemplate(){
        return null;
    }

    public function getData($format='raw'){
        $data = $this->data;

        if( $format == 'json')
            $data = json_encode($data);

        return $data;
    }

    public function getLayout($format='raw'){
        $layout = $this->layout;

        if( $format == 'json')
            $layout = json_encode($layout);

        return $layout;
    }

    public function fetchData($layerId, $method='wfs'){

        if(!$layerId)
            return false;
        $response = false;

        $layer = $this->lproj->getLayer( $layerId );
        $layerXml = $this->lproj->getXmlLayer( $layerId );
        $layerXmlZero = $layerXml[0];
        $_layerName = $layerXmlZero->xpath('layername');
        $layerName = (string)$_layerName[0];



        // Get the field(s) given by the user to build traces
        $x_fields = array_map('trim', explode(',', $this->x_field));
        $y_fields = array_map('trim', explode(',', $this->y_field));

        // Prepare request and get data
        if($method == 'wfs'){

            $typename = str_replace(' ', '_', $layerName);
            $wfsparams = array(
                'SERVICE' => 'WFS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetFeature',
                'TYPENAME' => $typename,
                'OUTPUTFORMAT' => 'GeoJSON',
                'GEOMETRYNAME' => 'none',
                'PROPERTYNAME' => implode(',', $x_fields) . ',' . implode(',', $y_fields)
            );

            $wfsrequest = new lizmapWFSRequest( $this->lproj, $wfsparams );
            $wfsresponse = $wfsrequest->getfeature();
            $features = null;

            // Check data
            if( property_exists($wfsresponse, 'data') ){
                $data = $wfsresponse->data;
                if(property_exists($wfsresponse, 'file') and $wfsresponse->file and is_file($data) ){
                    $data = jFile::read($data);
                }
                $featureData = json_decode($data);
                if( empty($featureData) ){
                    $featureData = null;
                }
                else{
                    if( empty($featureData->features ) )
                        $featureData = Null;
                }
            }
            if(!$featureData)
                return false;

            // Check 1st feature
            $features = $featureData->features;
            $f1 = $features[0];
            if(!property_exists($f1, 'properties')){
                return false;
            }
            foreach($x_fields as $x_field){
                if( !property_exists($f1->properties, $x_field) ){
                    return false;
                }
            }
            foreach($y_fields as $y_field){
                if( !property_exists($f1->properties, $y_field) ){
                    return false;
                }
            }

            // Fill in traces
            $traces = array();
            $color = $this->color;
            foreach($x_fields as $x_field){
                foreach($y_fields as $y_field){

                    // build empty trace
                    $trace = $this->getTraceTemplate();

                    // Set trace name. Use QGIS field alias if present
                    $trace_name = $y_field;
                    if($layerXmlZero->aliases){
                        $aliasesZero = $layerXmlZero->aliases[0];
                        $aliasXml = $aliasesZero->xpath("alias[@field='$trace_name']");
                        if($aliasXml and $aliasXml[0]){
                            $trace_name = (string)$aliasXml[0]->attributes()->name;
                        }
                    }

                    $trace['name'] = $trace_name;

                    // Get data from layer features et fill the trace
                    $colors = array();
                    $xf = $x_field;
                    $yf = $y_field;
                    if( array_key_exists('orientation', $trace) and $trace['orientation'] == 'h'){
                        // Revert x and y for horizontal bar plot
                        $xf = $y_field;
                        $yf = $x_field;
                    }
                    foreach($features as $feat){
                        $trace[$this->x_property_name][] = $feat->properties->$xf;
                        $trace[$this->y_property_name][] = $feat->properties->$yf;
                        if( property_exists($feat->properties, $color)
                            and !empty($feat->properties->$color)
                        ){
                            $colors[] = $feat->properties->$color;
                        }
                    }
                    if(!empty($colors)){
                        $trace['marker']['colors'] = $colors;
                        unset($trace['marker']['colors']);
                    }else{
                        $trace['marker']['color'] = $color;
                    }
                    $traces[] = $trace;
                }
            }
            $this->traces = $traces;
            $this->data = $traces;

            return true;

        }

        return $response;

    }

}


class datavizPlotPie extends datavizPlot {

    public $type = 'pie';

    protected $x_property_name = 'values';

    protected $y_property_name = 'labels';

    protected function getTraceTemplate(){
        $data = array(
            'name'=> '',
            'values'=> array(),
            'labels'=> array(),
            'marker'=> array(
                'color' => 'orange'
            ),
            'hoverinfo'=> 'label+value+percent',
            'textinfo'=> 'label',
            'type'=> 'pie'
        );
        return $data;
    }

}


class datavizPlotBar extends datavizPlot {

    public $type = 'bar';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';

    protected function getTraceTemplate(){
        $data = array(
            'name'=> '',
            'y'=> array(),
            'x'=> array(),
            'text'=> array(),
            'marker'=> array(
                'color' => 'orange'
            ),
            'textinfo'=> 'none',
            'type'=> 'bar',
            'orientation'=> 'v'
        );
        return $data;
    }
}

class datavizPlotBarH extends datavizPlotBar {

    protected function getTraceTemplate(){
        $data = parent::getTraceTemplate();
        $data['orientation'] = 'h';
        return $data;
    }
}


class datavizPlotScatter extends datavizPlot {

    public $type = 'scatter';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';

    protected function getTraceTemplate(){
        $data = array(
            'name'=> '',
            'y'=> array(),
            'x'=> array(),
            'text'=> array(),
            'marker'=> array(
                'color' => 'orange'
            ),
            'mode'=> 'lines',
            'textinfo'=> 'none',
            'type'=> 'scatter'
        );
        return $data;
    }

}
