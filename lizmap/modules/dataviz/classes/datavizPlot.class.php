<?php
/**
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License
 */
class datavizPlot
{
    /**
     * @var null|bool|lizmapProject
     */
    protected $lproj;

    public $title;

    public $type;

    public $layerId;

    public $layerXmlZero;

    protected $data;

    protected $traces = array();

    protected $x_property_name;
    protected $y_property_name;
    protected $z_property_name;

    protected $y_fields = array();
    protected $x_fields = array();
    protected $z_fields = array();

    protected $colors = array();

    protected $colorfields = array();

    protected $layout;

    protected $x_mandatory = array('scatter', 'bar', 'histogram', 'histogram2d', 'polar');

    protected $y_mandatory = array('scatter', 'box', 'bar', 'pie', 'histogram2d', 'polar');

    protected $aggregation;

    /**
     * datavizPlot constructor.
     *
     * @param string $repository
     * @param string $project
     * @param string $layerId
     * @param string $x_field
     * @param string $y_field
     * @param array  $colors
     * @param array  $colorfields
     * @param string $title
     * @param null   $layout
     * @param null   $aggregation
     * @param null   $data
     *
     * @throws jExceptionSelector
     */
    public function __construct(
        $repository,
        $project,
        $layerId,
        $plotConfig,
        $data=null
    ) {

        // Get the project data
        $lproj = $this->getProject($repository, $project);
        if (!$lproj) {
            return false;
        }
        $this->lproj = $lproj;

        // Parse plot config
        $this->parsePlotConfig($plotConfig);

        // Get layer data
        $this->parseLayer($layerId);

        // layout and data (use default if none given)
        $this->setLayout($this->layout);
        $this->setData($data);

        return true;
    }

    private function parsePlotConfig($plotConfig) {
        $this->layerId = $plotConfig['layer_id'];
        $this->setTitle($plotConfig['title']);

        $x_field = $plotConfig['plot']['x_field'];
        $y_field = $plotConfig['plot']['y_field'];
        $y2_field = null;
        if (array_key_exists('y2_field', $plotConfig['plot'])) {
            $y2_field = $plotConfig['plot']['y2_field'];
        }
        if (!empty($y2_field)) {
            $y_field = $y_field.','.$y2_field;
        }
        $z_field = null;
        if (array_key_exists('z_field', $plotConfig['plot'])) {
            $z_field = $plotConfig['plot']['z_field'];
        }

        // Explode string list of fields into arrays
        $x_fields = array_map('trim', explode(',', $x_field));
        if ($x_fields != array('')) {
            $this->x_fields = $x_fields;
        }
        $y_fields = array_map('trim', explode(',', $y_field));
        if ($y_fields != array('')) {
            $this->y_fields = $y_fields;
        }
        $z_fields = array_map('trim', explode(',', $z_field));
        if ($z_fields != array('')) {
            $this->z_fields = $z_fields;
        }

        // Colors
        $colors = array();
        $colorfields = array();
        if (array_key_exists('color', $plotConfig['plot'])) {
            $color = $plotConfig['plot']['color'];
            $colors[] = $color;
        }
        if (array_key_exists('colorfield', $plotConfig['plot'])) {
            $colorfield = $plotConfig['plot']['colorfield'];
            $colorfields[] = $colorfield;
        }
        if (array_key_exists('color2', $plotConfig['plot'])) {
            $color2 = $plotConfig['plot']['color2'];
            $colors[] = $color2;
        }
        if (array_key_exists('colorfield2', $plotConfig['plot'])) {
            $colorfield2 = $plotConfig['plot']['colorfield2'];
            $colorfields[] = $colorfield2;
        }
        $this->colors = $colors;
        $this->colorfields = $colorfields;

        // Optionnal layout additionnal options (legacy code)
        if (array_key_exists('layout_config', $plotConfig['plot'])) {
            $this->layout = $plotConfig['plot']['layout_config'];
        }

        // Aggregation
        $aggregation = 'sum';
        if (array_key_exists('aggregation', $plotConfig['plot'])) {
            $aggregation = $plotConfig['plot']['aggregation'];
        }
        $this->aggregation = $aggregation;
    }

    /**
     * @param string $repository
     * @param string $project
     *
     * @throws jExceptionSelector
     *
     * @return null|bool|lizmapProject
     */
    public function getProject($repository, $project)
    {
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return false;
            }
        } catch (UnknownLizmapProjectException $e) {
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return false;
        }
        // Check acl
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return false;
        }

        return $lproj;
    }

    protected function parseLayer($layerId)
    {
        $layer = $this->lproj->getLayer($this->layerId);
        $layerXml = $this->lproj->getXmlLayer($this->layerId);
        if (count($layerXml) > 0) {
            $this->layerXmlZero = $layerXml[0];
        }
    }

    protected function setTitle($title)
    {
        $this->title = $title;
    }

    protected function setLayout($layout = null, $format = 'array')
    {
        // First get layout template
        $this->layout = $this->getLayoutTemplate();

        // Then override properties if given
        if (!empty($layout)) {
            if ($format == 'json') {
                // decode source string into PHP array
                $layout = json_decode($layout, true);
            }

            if (is_array($layout)) {
                foreach ($layout as $k => $v) {
                    $this->layout[$k] = $v;
                }
            }
        }
    }

    protected function getFieldAlias($field)
    {
        $layer = $this->lproj->getLayer($this->layerId);
        $aliases = $layer->getAliasFields();
        $name = $field;
        if (array_key_exists($field, $aliases) and !empty($aliases[$field]) ) {
            $name = $aliases[$field];
        }
        return $name;
    }

    protected function getLayoutTemplate()
    {
        $layout = array(
            //'title' => $this->title,
            'showlegend' => true,
            'legend' => array(
                'orientation' => 'h',
                'x' => '-0.1',
                'y' => '1.15',
            ),
            'autosize' => true,
            'plot_bgcolor' => 'rgba(0,0,0,0)',
            'paper_bgcolor' => 'rgba(0,0,0,0)',
            'margin' => array(
                'l' => 2,
                'r' => 20,
                //'b'=> 150,
                't' => 0,
                'pad' => 1,
            ),
        );

        if($this->type == 'pie'){
            $layout['legend']['orientation'] = 'h';
            $layout['legend']['y'] = '-5';
        }

        if ($this->type == 'bar' and count($this->y_fields) > 1) {
            $layout['margin']['l'] = 150;
        }
        if ($this->type == 'bar' and count($this->y_fields) > 1) {
            $layout['barmode'] = 'stack';
        }

        if (!in_array($this->type, array('pie', 'bar'))) {
            if (count($this->x_fields) == 1) {
                $layout['xaxis'] = array(
                    'title' => $this->getFieldAlias($this->x_fields[0]),
                );
            }
        }
        if (!in_array($this->type, array('pie', 'bar'))) {
            if (count($this->y_fields) == 1) {
                $layout['yaxis'] = array(
                    'title' => $this->getFieldAlias($this->y_fields[0]),
                );
            }
        }

        return $layout;
    }

    protected function setData($data = null, $format = 'json')
    {
        if (!empty($data)) {
            if ($format == 'json') {
                // decode source string into PHP array
                $data = json_decode($data, true);
            }
            if (is_array($data)) {
                $this->data = $data;
            }
        }
    }

    protected function getTraceTemplate()
    {
        return null;
    }

    protected function addTraceAggregation()
    {
        $this->data[0]['transforms'] = array(
            array(
                'type' => 'aggregate',
                'groups' => 'x',
                'aggregations' => array(
                    array('target' => 'y', 'func' => $this->aggregation, 'enabled' => true),
                ),
            ),
        );
    }

    public function getData($format = 'raw')
    {
        $data = $this->data;

        if ($format == 'json') {
            $data = json_encode($data);
        }

        return $data;
    }

    public function getLayout($format = 'raw')
    {
        $layout = $this->layout;

        if ($format == 'json') {
            $layout = json_encode($layout);
        }

        return $layout;
    }

    public function fetchData($method = 'wfs', $exp_filter = '')
    {
        if (!$this->layerId) {
            return false;
        }
        $response = false;

        $_layerName = $this->layerXmlZero->xpath('layername');
        $layerName = (string) $_layerName[0];

        // Prepare request and get data
        if ($method == 'wfs') {
            $typename = str_replace(' ', '_', $layerName);
            $propertyname = array();
            if (count($this->x_fields) > 0) {
                $propertyname = array_merge($propertyname, $this->x_fields);
            }
            if (count($this->y_fields) > 0) {
                $propertyname = array_merge($propertyname, $this->y_fields);
            }
            if ($this->z_property_name and count($this->z_fields) > 0) {
                $propertyname = array_merge($propertyname, $this->z_fields);
            }
            $wfsparams = array(
                'SERVICE' => 'WFS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetFeature',
                'TYPENAME' => $typename,
                'OUTPUTFORMAT' => 'GeoJSON',
                'GEOMETRYNAME' => 'none',
                'PROPERTYNAME' => implode(',', $propertyname)
            );
            // Sort by x fields when scatter plot is used
            if($this->type == 'scatter'){
                $wfsparams['SORTBY'] = ','.implode(',', $this->x_fields);
            }
            if (!empty($this->colorfields)) {
                $wfsparams['PROPERTYNAME'] .= ','.implode(',', $this->colorfields);
            }
            if (!empty($exp_filter)) {
                // Add fields in PROPERTYNAME
                // bug in QGIS SERVER 2.18: send no data if fields in exp_filter not in PROPERTYNAME
                $matches = array();
                $preg = preg_match_all('#"\b[^\s]+\b"#', $exp_filter, $matches);
                $pp = '';
                if (count($matches) > 0 and count($matches[0]) > 0) {
                    foreach ($matches[0] as $m) {
                        $pp .= ','.trim($m, '"');
                    }
                }
                if ($pp) {
                    $wfsparams['PROPERTYNAME'] .= ','.$pp;
                }

                // Add filter
                $wfsparams['EXP_FILTER'] = $exp_filter;
            }

            $wfsrequest = new lizmapWFSRequest($this->lproj, $wfsparams);
            $wfsresponse = $wfsrequest->getfeature();
            $features = null;

            // Check data
            if (property_exists($wfsresponse, 'data')) {
                $data = $wfsresponse->data;
                if (property_exists($wfsresponse, 'file') and $wfsresponse->file and is_file($data)) {
                    $data = jFile::read($data);
                }
                $featureData = json_decode($data);
                if (empty($featureData)) {
                    $featureData = null;
                } else {
                    if (empty($featureData->features)) {
                        $featureData = null;
                    }
                }
            }
            if (!$featureData) {
                return false;
            }

            // Check 1st feature
            $features = $featureData->features;
            $f1 = $features[0];
            if (!property_exists($f1, 'properties')) {
                return false;
            }

            // Check if plot needs X and has $x_field
            if (in_array($this->type, $this->x_mandatory) and !$this->x_fields) {
                return false;
            }

            if (count($this->x_fields) > 0) {
                foreach ($this->x_fields as $x_field) {
                    if (!property_exists($f1->properties, $x_field)) {
                        return false;
                    }
                }
            }

            // Check if plot needs Y and has $y_field
            if (in_array($this->type, $this->y_mandatory) and !$this->y_fields) {
                return false;
            }
            if (count($this->y_fields) > 0) {
                foreach ($this->y_fields as $y_field) {
                    if (!property_exists($f1->properties, $y_field)) {
                        return false;
                    }
                }
            }

            // Fill in traces
            $traces = array();

            $yidx = 0;
            foreach ($this->y_fields as $y_field) {

                // build empty trace
                $trace = $this->getTraceTemplate();

                // Set trace name. Use QGIS field alias if present
                $trace_name = $this->getFieldAlias($y_field);
                $trace['name'] = $trace_name;

                // We are in the loop iterating y_fields: $y_field is set
                $yf = $y_field;
                // x
                $xf = null;
                if (count($this->x_fields)  == 1) {
                    $xf = $this->x_fields[0];
                }
                // z
                if (count($this->z_fields) == 1) {
                    $zf = $this->z_fields[0];
                }
                $featcolor = null;
                if (count($this->colorfields) > 0) {
                    $featcolor = $this->colorfields[$yidx];
                }

                // Revert x and y for horizontal bar plot
                if (array_key_exists('orientation', $trace) and $trace['orientation'] == 'h') {
                    $xf = $y_field;
                    $yf = $this->x_fields[0];
                }

                // Set color
                if (array_key_exists('marker', $trace) and !empty($this->colors)) {
                    if ($yidx < count($this->colors)) {
                        $trace['marker']['color'] = $this->colors[$yidx];
                    }
                    ++$yidx;
                }
                // Prepare an array to store features color (if any)
                $featcolors = array();

                // Creation of array who will be used to aggregate when tu type is pie
                if ($this->type == 'pie') {
                    $x_aggregate_sum = array();
                    $x_aggregate_count = array();
                    $x_aggregate_min = array();
                    $x_aggregate_max = array();
                    $x_aggregate_stddev = array();
                    $x_aggregate_median = array();
                }

                // Fill in the trace for each dimension
                foreach ($features as $feat) {
                    if ($this->type != 'pie') {
                        // Fill in X field
                        if (count($this->x_fields) == 1) {
                            $trace[$this->x_property_name][] = $feat->properties->{$xf};
                        }

                        // Fill in Y field
                        $trace[$this->y_property_name][] = $feat->properties->{$yf};
                        // Fill in Z field
                        if ($this->z_property_name and count($this->z_fields) == 1 ) {
                            $trace[$this->z_property_name][] = $feat->properties->{$zf};
                        }

                        // Fill in feature colors
                        if (property_exists($feat->properties, $featcolor)
                            and !empty($feat->properties->{$featcolor})
                            ) {
                            $featcolors[] = $feat->properties->{$featcolor};
                        }
                    } else {
                        // For pie and sunburst chart, we need to manually
                        // sum and aggregate values per distinct x values
                        // because plotly cannot use aggregations transforms
                        // -> store values in an array to aggregate them afterwards
                        if ($feat->properties->{$xf} != null) {
                            // Aggregate - Each time we find a new X, we initialize the value for this x key
                            if (!array_key_exists($feat->properties->{$xf}, $x_aggregate_sum)) {
                                $x_aggregate_sum[$feat->properties->{$xf}] = 0;
                                $x_aggregate_count[$feat->properties->{$xf}] = 0;
                                $x_aggregate_min[$feat->properties->{$xf}] = $feat->properties->{$yf};
                                $x_aggregate_max[$feat->properties->{$xf}] = $feat->properties->{$yf};
                                $x_aggregate_first[$feat->properties->{$xf}] = $feat->properties->{$yf};
                                $x_aggregate_stddev[$feat->properties->{$xf}] = 0;
                                $x_aggregate_median[$feat->properties->{$xf}] = array();

                                if( $this->z_property_name and !empty($zf)){
                                    $x_distinct_parent[$feat->properties->{$xf}] = $feat->properties->{$zf};
                                }

                                // We also add the color
                                if (property_exists($feat->properties, $featcolor)
                                and !empty($feat->properties->{$featcolor})
                                ) {
                                    $featcolors[] = $feat->properties->{$featcolor};
                                }
                            }
                            // incrementation of the sum/count who will be used for other kind of aggregation
                            $x_aggregate_sum[$feat->properties->{$xf}] += $feat->properties->{$yf};
                            ++$x_aggregate_count[$feat->properties->{$xf}];
                            $x_aggregate_last[$feat->properties->{$xf}] = $feat->properties->{$yf};
                            array_push($x_aggregate_median[$feat->properties->{$xf}], $feat->properties->{$yf});

                            if ($x_aggregate_min[$feat->properties->{$xf}] > $feat->properties->{$yf}) {
                                $x_aggregate_min[$feat->properties->{$xf}] = $feat->properties->{$yf};
                            }

                            if ($x_aggregate_max[$feat->properties->{$xf}] < $feat->properties->{$yf}) {
                                $x_aggregate_max[$feat->properties->{$xf}] = $feat->properties->{$yf};
                            }
                        }
                    }
                }

                if ($this->type == 'pie') {
                    if ($this->aggregation == 'stddev') {
                        foreach ($features as $feat) {
                            $x = $feat->properties->{$xf};
                            $x_aggregate_stddev[$x] += pow($feat->properties->{$yf} - ($x_aggregate_sum[$x] / $x_aggregate_count[$x]), 2);
                        }
                    }

                    if ($this->aggregation == 'median') {
                        foreach ($x_aggregate_median as $key => $value) {
                            asort($x_aggregate_median[$key]);
                        }
                    }
                    // Fill the data with the correct key => value
                    foreach ($x_aggregate_sum as $key => $value) {
                        // x
                        $trace[$this->x_property_name][] = $key;
                        if( $this->z_property_name ) {
                            $trace[$this->z_property_name][] = $x_distinct_parent[$key];
                        }

                        // y
                        if ($this->aggregation == 'sum' or $this->aggregation == '') {
                            $trace[$this->y_property_name][] = $value;
                        } elseif ($this->aggregation == 'avg') {
                            $trace[$this->y_property_name][] = $value / $x_aggregate_count[$key];
                        } elseif ($this->aggregation == 'count') {
                            $trace[$this->y_property_name][] = $x_aggregate_count[$key];
                        } elseif ($this->aggregation == 'min') {
                            $trace[$this->y_property_name][] = $x_aggregate_min[$key];
                        } elseif ($this->aggregation == 'max') {
                            $trace[$this->y_property_name][] = $x_aggregate_max[$key];
                        } elseif ($this->aggregation == 'first') {
                            $trace[$this->y_property_name][] = $x_aggregate_first[$key];
                        } elseif ($this->aggregation == 'last') {
                            $trace[$this->y_property_name][] = $x_aggregate_last[$key];
                        } elseif ($this->aggregation == 'stddev') {
                            $trace[$this->y_property_name][] = sqrt($x_aggregate_stddev[$key] / $x_aggregate_count[$key]);
                        } elseif ($this->aggregation == 'median') {
                            //if count is even
                            if ($x_aggregate_count[$key] % 2 == 0) {
                                $trace[$this->y_property_name][] = $x_aggregate_median[$key][$x_aggregate_count[$key] / 2];
                            }
                            //si count is odd
                            else {
                                $mid = floor($x_aggregate_count[$key] / 2);
                                $trace[$this->y_property_name][] = ($x_aggregate_median[$key][$mid] + $x_aggregate_median[$key][$mid + 1]) / 2;
                            }
                        }
                    }
                }

                // set color
                if (!empty($featcolors)) {
                    if ($this->type == 'bar'
                        or $this->type == 'scatter'
                    ) {
                        $trace['marker']['color'] = $featcolors;
                    }
                    if ($this->type == 'pie'
                    ) {
                        $trace['marker']['colors'] = $featcolors;
                        unset($trace['marker']['color']);
                    }
                }

                if ($this->x_property_name and count($trace[$this->x_property_name]) == 0) {
                    $trace[$this->x_property_name] = null;
                }
                if ($this->y_property_name and count($trace[$this->y_property_name]) == 0) {
                    $trace[$this->y_property_name] = null;
                }
                if ($this->z_property_name and count($trace[$this->z_property_name]) == 0) {
                    $trace[$this->z_property_name] = null;
                }
                $traces[] = $trace;
            }

            $this->traces = $traces;
            $this->data = $traces;

            // add aggregation property if aggregation is done client side via dataplotly
            // Not available for pie, histogram and histogram2d, we have done it manually beforehand in php
            if ($this->aggregation
                and !in_array($this->type, array('pie', 'histogram', 'histogram2d'))
            ) {
                $this->addTraceAggregation();
            }

            return true;
        }

        return $response;
    }
}

class datavizPlotScatter extends datavizPlot
{
    public $type = 'scatter';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'scattergl',
            'name' => '',
            'y' => array(),
            'x' => array(),
            'text' => array(),
            'marker' => array(
                'color' => 'orange',
                'colorscale' => null,
                'showscale' => false,
                'reversescale' => false,
                'colorbar' => array(
                    'len' => '0.8',
                ),
                'size' => null,
                'symbol' => null,
                'line' => array(
                    'color' => null,
                    'width' => null,
                ),
            ),
            'mode' => 'lines',
            'textinfo' => 'none',
            'opacity' => null,
        );
    }
}

class datavizPlotBox extends datavizPlot
{
    public $type = 'box';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'box',
            'name' => '',
            'x' => array(),
            'y' => array(),
            'text' => array(),
            //'marker'=> array(
            //'color' => 'orange'
            //),
            'boxmean' => null,
            'orientation' => 'v',
            'boxpoints' => false,
            'fillcolor' => 'orange',
            'line' => array(
                'color' => null,
                'width' => 1,
            ),
            'opacity' => null,
        );
    }
}

class datavizPlotBar extends datavizPlot
{
    public $type = 'bar';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        $data = array(
            'type' => 'bar',
            'name' => '',
            'y' => array(),
            'x' => array(),
            'ids' => null,
            'text' => array(),
            'marker' => array(
                'color' => 'orange',
                'colorscale' => null,
                'showscale' => false,
                'reversescale' => false,
                'colorbar' => array(
                    'len' => '0.8',
                ),
                'line' => array(
                    'color' => null,
                    'width' => null,
                ),
            ),
            'textinfo' => 'none',
            'orientation' => 'v',
        );
        if ($this->type == 'bar' and count($this->y_fields) > 1) {
            $data['orientation'] = 'h';
        }

        return $data;
    }
}

class datavizPlotBarH extends datavizPlotBar
{
    protected function getTraceTemplate()
    {
        $data = parent::getTraceTemplate();
        $data['orientation'] = 'h';

        return $data;
    }
}

class datavizPlotHistogram extends datavizPlot
{
    public $type = 'histogram';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'histogram',
            'name' => '',
            'x' => array(),
            'y' => array(),
            'marker' => array(
                'color' => 'orange',
                'line' => array(
                    'color' => null,
                    'width' => null,
                ),
            ),
            'hoverinfo' => 'label+value+percent',
            'textinfo' => 'label',
            'orientation' => 'v',
            'nbinsx' => array(),
            'nbinsy' => array(),
            'histnorm' => null,
            'opacity' => null,
            'cumulative' => array(
                'enabled' => false,
                'direction' => false,
            ),
        );
    }
}

class datavizPlotPie extends datavizPlot
{
    public $type = 'pie';

    protected $x_property_name = 'labels';

    protected $y_property_name = 'values';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'pie',
            'name' => '',
            'values' => array(),
            'labels' => array(),
            'hoverinfo' => 'label+value+percent',
            'textinfo' => 'value',
            'opacity' => null,
            'hole' => '0.4'
        );
    }
}

class datavizPlotHistogram2d extends datavizPlot
{
    public $type = 'histogram2d';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'histogram2d',
            'name' => '',
            'x' => array(),
            'y' => array(),
            'colorscale' => null,
            'opacity' => null,
        );
    }
}

class datavizPlotPolar extends datavizPlot
{
    public $type = 'polar';

    protected $x_property_name = 'r';

    protected $y_property_name = 't';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'scattergl',
            'name' => '',
            'r' => array(),
            't' => array(),
            'textinfo' => 'r+t',
            'mode' => 'markers',
            'hoverinfo' => 'label+value+percent',
            'marker' => array(
                'color' => 'orange',
            ),
            'opacity' => null,
        );
    }
}
