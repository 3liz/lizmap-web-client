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

    protected $colorfields = array();

    protected $layout = null;

    protected $x_mandatory = array('scatter', 'bar', 'histogram', 'histogram2d', 'polar');

    protected $y_mandatory = array('scatter', 'box', 'bar', 'pie', 'histogram2d', 'polar');

    function __construct( $repository, $project, $layerId, $x_field, $y_field, $colors=array(), $colorfields=array(), $title='plot title', $layout=null, $aggregation=null, $data=null ){

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
        $this->colorfields = $colorfields;

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
            if(!empty($this->colorfields))
                $wfsparams['PROPERTYNAME'] .= ',' . implode(',', $this->colorfields);
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
                $featcolor = Null;
                if( count($this->colorfields) > 0 ){
                    $featcolor = $this->colorfields[$yidx];
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
                // Prepare an array to store features color (if any)
                $featcolors = array();

                // Creation of array who will be used to aggregate when tu type is pie
                if ( $this->type == 'pie' )
                    {

                        $x_aggregate_sum = array();
                        $x_aggregate_count = array();
                        $x_aggregate_min = array();
                        $x_aggregate_max = array();
                        $x_aggregate_stddev = array();
                        $x_aggregate_median = array();
                    }

                // Fill in the trace for each dimension
                foreach($features as $feat){
                    if ( $this->type != 'pie' )
                    {
                        // Fill in X field
                        if(count($this->x_fields) > 0)
                            $trace[$this->x_property_name][] = $feat->properties->$xf;

                        // Fill in Y field
                        if(count($this->y_fields) > 0)
                            $trace[$this->y_property_name][] = $feat->properties->$yf;

                        // Fill in feature colors
                        if( property_exists($feat->properties, $featcolor)
                            and !empty($feat->properties->$featcolor)
                            ){
                                $featcolors[] = $feat->properties->$featcolor;
                            }
                    }
                    else
                    {
                        if ( $feat->properties->$xf != Null ) {
                            // Each time we find a new X, we initialize the value
                            if ( !array_key_exists($feat->properties->$xf, $x_aggregate_sum) )
                            {
                                $x_aggregate_sum[$feat->properties->$xf] = 0;
                                $x_aggregate_count[$feat->properties->$xf] = 0;
                                $x_aggregate_min[$feat->properties->$xf] = $feat->properties->$yf;
                                $x_aggregate_max[$feat->properties->$xf] = $feat->properties->$yf;
                                $x_aggregate_first[$feat->properties->$xf] = $feat->properties->$yf;
                                $x_aggregate_stddev[$feat->properties->$xf] = 0;
                                $x_aggregate_median[$feat->properties->$xf] = array();

                                if( property_exists($feat->properties, $featcolor)
                                and !empty($feat->properties->$featcolor)
                                ){
                                    $featcolors[] = $feat->properties->$featcolor;
                                }
                            }
                            // incrementation of the sum/count who will be used for other kind of aggregation
                            $x_aggregate_sum[$feat->properties->$xf] += $feat->properties->$yf;
                            $x_aggregate_count[$feat->properties->$xf] += 1;
                            $x_aggregate_last[$feat->properties->$xf] = $feat->properties->$yf;
                            array_push($x_aggregate_median[$feat->properties->$xf], $feat->properties->$yf);


                            if ( $x_aggregate_min[$feat->properties->$xf] > $feat->properties->$yf )
                                $x_aggregate_min[$feat->properties->$xf] = $feat->properties->$yf;

                            if ( $x_aggregate_max[$feat->properties->$xf] < $feat->properties->$yf )
                                $x_aggregate_max[$feat->properties->$xf] = $feat->properties->$yf;


                        }
                    }
                }

                if( $this->type == 'pie'){

                    if ( $this->aggregation == 'stddev' )
                    {
                        foreach($features as $feat){
                            $x = $feat->properties->$xf;
                            $x_aggregate_stddev[$x] += pow($feat->properties->$yf-($x_aggregate_sum[$x]/$x_aggregate_count[$x]), 2);
                        }
                    }

                    if ($this->aggregation == 'median')
                    {
                        foreach($x_aggregate_median as $key => $value)
                        {
                            asort($x_aggregate_median[$key]);
                        }
                    }
                    // Fill the data with the correct key => value
                    foreach ($x_aggregate_sum as $key => $value) {
                        if ( $this->aggregation == 'sum' or $this->aggregation == '' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = $value;
                        }
                        else if ( $this->aggregation == 'avg' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = $value/$x_aggregate_count[$key];
                        }
                        else if ($this->aggregation == 'count' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = $x_aggregate_count[$key];

                        }
                        else if ($this->aggregation == 'min' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = $x_aggregate_min[$key];
                        }
                        else if ($this->aggregation == 'max' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = $x_aggregate_max[$key];
                        }
                        else if ($this->aggregation == 'first' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = $x_aggregate_first[$key];
                        }
                        else if ($this->aggregation == 'last' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = $x_aggregate_last[$key];
                        }
                        else if ($this->aggregation == 'stddev' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            $trace[$this->y_property_name][] = sqrt($x_aggregate_stddev[$key]/$x_aggregate_count[$key]);
                        }
                        else if ($this->aggregation == 'median' )
                        {
                            $trace[$this->x_property_name][] = $key;
                            //if count is even
                            if ( $x_aggregate_count[$key] % 2 == 0 )
                            {
                                $trace[$this->y_property_name][] = $x_aggregate_median[$key][$x_aggregate_count[$key] / 2];
                            }
                            //si count is odd
                            else
                            {
                                 $mid = floor($x_aggregate_count[$key] / 2);
                                 $trace[$this->y_property_name][] = ($x_aggregate_median[$key][$mid] + $x_aggregate_median[$key][$mid+1]) / 2 ;

                            }
                        }
                    }
                }

                // set color
                if(!empty($featcolors)){
                    if( $this->type == 'bar'
                        or $this->type == 'scatter'
                    ){
                        $trace['marker']['color'] = $featcolors;
                    }
                    if( $this->type == 'pie'
                    ){
                        $trace['marker']['colors'] = $featcolors;
                        unset($trace['marker']['color']);
                    }
                }

                if( count($trace[$this->x_property_name]) == 0 )
                    $trace[$this->x_property_name] = Null;
                if( count($trace[$this->y_property_name]) == 0 )
                    $trace[$this->y_property_name] = Null;
                $traces[] = $trace;
            }

            $this->traces = $traces;
            $this->data = $traces;

            // add aggregation property if aggregation is done client side via dataplotly
            if($this->aggregation
                and !in_array($this->type, array('pie', 'histogram', 'histogram2d'))
            ){
                $this->addTraceAggregation();
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
