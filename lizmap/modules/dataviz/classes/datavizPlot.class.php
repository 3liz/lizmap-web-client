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

    public $layerId = null;

    public $layerXmlZero = null;

    protected $data = null;

    protected $traces = array();

    protected $x_property_name = null;

    protected $y_property_name = null;

    protected $y_field = null;

    protected $x_field = null;

    protected $aggregation = null;

    protected $y_fields = null;

    protected $x_fields = null;

    protected $colors = array();

    protected $layout = null;

    protected $x_mandatory = array('scatter', 'bar', 'histogram', 'histogram2d', 'polar');

    protected $y_mandatory = array('scatter', 'box', 'bar', 'pie', 'histogram2d', 'polar');

    function __construct( $repository, $project, $layerId, $x_field, $y_field, $colors=array(), $title='plot title', $layout=null, $aggregation=null, $data=null ){

        // Get the project data
        $lproj = $this->getProject($repository, $project);
        if( !$lproj )
            return false;
        $this->lproj = $lproj;

        // Get layer data
        $this->layerId = $layerId;
        $this->parseLayer($layerId);

        $this->y_field = $y_field;
        $this->x_field = $x_field;
        $this->aggregation = $aggregation;
        $this->colors = $colors;

        // Get the field(s) given by the user to build traces
        $x_fields = array_map('trim', explode(',', $this->x_field));
        if($x_fields != array(''))
            $this->x_fields = $x_fields;
        $y_fields = array_map('trim', explode(',', $this->y_field));
        if($y_fields != array(''))
            $this->y_fields = $y_fields;

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

    protected function parseLayer($layerId){
        $layer = $this->lproj->getLayer( $this->layerId );
        $layerXml = $this->lproj->getXmlLayer( $this->layerId );
        if(count($layerXml) > 0)
            $this->layerXmlZero = $layerXml[0];
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

    protected function getFieldAlias($field){
        $name = $field;
        if(count($this->layerXmlZero->aliases) > 0){
            $aliasesZero = $this->layerXmlZero->aliases[0];
            $aliasXml = $aliasesZero->xpath("alias[@field='$name']");
            if($aliasXml and $aliasXml[0]){
                $name = (string)$aliasXml[0]->attributes()->name;
            }
        }
        return $name;
    }

    protected function getLayoutTemplate(){
        $layout = array(
            //'title' => $this->title,
            'showlegend' => true,
            'legend' => array(
                'orientation'=> 'h',
                'x'=> '-0.1',
                'y'=> '1.15'
            ),
            'autosize'=> true,
            'plot_bgcolor'=> 'rgba(0,0,0,0)',
            'paper_bgcolor'=> 'rgba(0,0,0,0)',
            'margin'=> array(
                'l'=> 0,
                'r'=> 20,
                //'b'=> 100,
                't'=> 0,
                'pad'=> 1
            )
        );

        if($this->type == 'bar' and count($this->y_fields) > 1){
            $layout['barmode'] = 'stack';
        }

        if(!in_array($this->type, array('pie', 'bar'))){
            if(count($this->x_fields) == 1){
                $layout['xaxis'] = array(
                    'title'=> $this->getFieldAlias($this->x_field)
                );
            }
        }
        if(!in_array($this->type, array('pie', 'bar'))){
            if(count($this->y_fields) == 1){
                $layout['yaxis'] = array(
                    'title'=> $this->getFieldAlias($this->y_field)
                );
            }
        }
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

    protected function addTraceAggregation(){
        $this->data[0]['transforms'] = array(
            array(
                'type'=> 'aggregate',
                'groups'=> 'x',
                'aggregations'=> array(
                    array('target'=> 'y', 'func'=> $this->aggregation, 'enabled'=> true)
                )
            )
        );
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

    public function fetchData($method='wfs', $exp_filter=''){

        if(!$this->layerId)
            return false;
        $response = false;

        $_layerName = $this->layerXmlZero->xpath('layername');
        $layerName = (string)$_layerName[0];

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
                'PROPERTYNAME' => implode(',', $this->x_fields) . ',' . implode(',', $this->y_fields)
            );
            if(!empty($exp_filter)){
                // Add fields in PROPERTYNAME
                // bug in QGIS SERVER 2.18: send no data if fields in exp_filter not in PROPERTYNAME
                $matches = array();
                $preg = preg_match_all('#"\b[^\s]+\b"#', $exp_filter, $matches);
                $pp = '';
                if(count($matches) > 0 and count($matches[0])>0){
                    foreach($matches[0] as $m){
                        $pp.= ',' . trim($m, '"');
                    }
                }
                if($pp){
                    $wfsparams['PROPERTYNAME'].= ',' . $pp;
                }

                // Add filter
                $wfsparams['EXP_FILTER'] = $exp_filter;
            }

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

            // Check if plot needs X and has $x_field
            if( in_array($this->type, $this->x_mandatory) and !$this->x_fields){
                return false;
            }

            if( count($this->x_fields) > 0 ){
                foreach($this->x_fields as $x_field){
                    if( !property_exists($f1->properties, $x_field) ){
                        return false;
                    }
                }
            }

            // Check if plot needs Y and has $y_field
            if( in_array($this->type, $this->y_mandatory) and !$this->y_fields){
                return false;
            }
            if( count($this->y_fields) > 0 ){
                foreach($this->y_fields as $y_field){
                    if( !property_exists($f1->properties, $y_field) ){
                        return false;
                    }
                }
            }

            // Fill in traces
            $traces = array();

            $yidx = 0;
            foreach($this->y_fields as $y_field){

                // build empty trace
                $trace = $this->getTraceTemplate();

                // Set trace name. Use QGIS field alias if present
                $trace_name = $this->getFieldAlias($y_field);
                $trace['name'] = $trace_name;

                // Get data from layer features et fill the trace
                $xf = Null;
                if( count($this->x_fields) > 0 ){
                    $xf = $this->x_field;
                }
                $yf = Null;
                if( count($this->y_fields) > 0 ){
                    $yf = $y_field;
                }

                // Revert x and y for horizontal bar plot
                if( array_key_exists('orientation', $trace) and $trace['orientation'] == 'h'){
                    $xf = $y_field;
                    $yf = $this->x_field;
                }

                // Set color
                if( array_key_exists('marker', $trace) and !empty($this->colors)) {
                    $trace['marker']['color'] = $this->colors[$yidx];
                    $yidx++;
                }
                //$featcolors = array();

                // Fill in the trace for each dimension
                //$featcolor = 'color';
                foreach($features as $feat){
                    if(count($this->x_fields) > 0){
                        $trace[$this->x_property_name][] = $feat->properties->$xf;
                    }
                    if(count($this->y_fields) > 0){
                        $trace[$this->y_property_name][] = $feat->properties->$yf;
                    }

                    //if( property_exists($feat->properties, $featcolor)
                        //and !empty($feat->properties->$featcolor)
                    //){
                        //$featcolors[] = $feat->properties->$featcolor;
                    //}
                }
                //if(!empty($featcolors)){
                    //$trace['marker']['colors'] = $featcolors;
                    //unset($trace['marker']['color']);
                //}

                if( count($trace[$this->x_property_name]) == 0 )
                    $trace[$this->x_property_name] = Null;
                if( count($trace[$this->y_property_name]) == 0 )
                    $trace[$this->y_property_name] = Null;
                $traces[] = $trace;
            }

            $this->traces = $traces;
            $this->data = $traces;
            // add aggregation propert
            if($this->aggregation){
                $this->addTraceAggregation($data);
            }

            return true;

        }

        return $response;

    }

}


class datavizPlotScatter extends datavizPlot {

    public $type = 'scatter';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';

    protected function getTraceTemplate(){
        $data = array(
            'type'=> 'scatter',
            'name'=> '',
            'y'=> array(),
            'x'=> array(),
            'text'=> array(),
            'marker'=> array(
                'color' => 'orange',
                'colorscale' => Null,
                'showscale' => False,
                'reversescale' => False,
                'colorbar' => array(
                    'len'=>'0.8'
                ),
                'size'=>Null,
                'symbol'=>Null,
                'line' => array(
                    'color'=>Null,
                    'width'=>Null
                )
            ),
            'mode'=> 'markers',
            'textinfo'=> 'none',
            'opacity'=>Null
        );
        return $data;
    }

}

class datavizPlotBox extends datavizPlot {

    public $type = 'box';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';

    protected function getTraceTemplate(){
        $data = array(
            'type'=> 'box',
            'name'=> '',
            'x'=> array(),
            'y'=> array(),
            'text'=> array(),
            //'marker'=> array(
                //'color' => 'orange'
            //),
            'boxmean'=>Null,
            'orientation'=>'v',
            'boxpoints'=>False,
            'fillcolor'=>'orange',
            'line' => array(
                'color'=>Null,
                'width'=> 1
            ),
            'opacity'=>Null
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
            'type'=> 'bar',
            'name'=> '',
            'y'=> array(),
            'x'=> array(),
            'ids'=> Null,
            'text'=> array(),
            'marker'=> array(
                'color' => 'orange',
                'colorscale' => Null,
                'showscale' => False,
                'reversescale' => False,
                'colorbar' => array(
                    'len'=>'0.8'
                ),
                'line' => array(
                    'color'=>Null,
                    'width'=>Null
                )
            ),
            'textinfo'=> 'none',
            'orientation'=> 'v'
        );
        if($this->type == 'bar' and count($this->y_fields) > 1){
            $data['orientation'] = 'h';
        }
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


class datavizPlotHistogram extends datavizPlot {

    public $type = 'histogram';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';

    protected function getTraceTemplate(){
        $data = array(
            'type'=> 'histogram',
            'name'=> '',
            'x'=> array(),
            'y'=> array(),
            'marker'=> array(
                'color' => 'orange',
                'line' => array(
                    'color'=>Null,
                    'width'=>Null
                )
            ),
            'hoverinfo'=> 'label+value+percent',
            'textinfo'=> 'label',
            'orientation'=>'v',
            'nbinsx'=> array(),
            'nbinsy'=> array(),
            'histnorm'=> Null,
            'opacity'=> Null,
            'cumulative'=> array(
                'enabled'=>False,
                'direction'=>False
            )
        );
        return $data;
    }

}


class datavizPlotPie extends datavizPlot {

    public $type = 'pie';

    protected $x_property_name = 'labels';

    protected $y_property_name = 'values';

    protected function getTraceTemplate(){
        $data = array(
            'type'=> 'pie',
            'name'=> '',
            'values'=> array(),
            'labels'=> array(),
            'hoverinfo'=> 'label+value+percent',
            'textinfo'=> 'label',
            'opacity'=> Null
        );
        return $data;
    }

}

class datavizPlotHistogram2d extends datavizPlot {

    public $type = 'histogram2d';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';

    protected function getTraceTemplate(){
        $data = array(
            'type'=> 'histogram2d',
            'name'=> '',
            'x'=> array(),
            'y'=> array(),
            'colorscale'=> Null,
            'opacity'=> Null
        );
        return $data;
    }

}


class datavizPlotPolar extends datavizPlot {

    public $type = 'polar';

    protected $x_property_name = 'r';

    protected $y_property_name = 't';

    protected function getTraceTemplate(){
        $data = array(
            'type'=> 'scatter',
            'name'=> '',
            'r'=> array(),
            't'=> array(),
            'textinfo'=>'r+t',
            'mode'=>'markers',
            'hoverinfo'=> 'label+value+percent',
            'marker'=> array(
                'color' => 'orange'
            ),
            'opacity'=> Null
        );
        return $data;
    }
}
