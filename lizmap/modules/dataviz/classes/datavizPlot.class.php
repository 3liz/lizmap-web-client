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

    protected $x_mandatory = array('scatter', 'bar', 'histogram', 'histogram2d', 'polar', 'sunburst', 'html');

    protected $y_mandatory = array('scatter', 'box', 'bar', 'pie', 'histogram2d', 'polar', 'sunburst', 'html');

    protected $aggregation;
    protected $display_legend;
    protected $stacked;
    protected $horizontal;

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
        $data = null
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

        $x_fields = array();
        $y_fields = array();
        $z_fields = array();
        $colors = array();
        $colorfields = array();

        // Since Lizmap 3.4, a traces property contains all Y/color/Z
        if (array_key_exists('traces', $plotConfig['plot'])) {
            if (!empty($plotConfig['plot']['x_field'])) {
                $x_fields[] = $plotConfig['plot']['x_field'];
            }
            $traces = $plotConfig['plot']['traces'];
            foreach ($traces as $trace) {
                $y_fields[] = $trace->y_field;
                if (property_exists($trace, 'color')) {
                    $colors[] = $trace->color;
                }
                if (property_exists($trace, 'colorfield')) {
                    $colorfields[] = $trace->colorfield;
                }
                if (property_exists($trace, 'z_field')) {
                    $z_fields[] = $trace->z_field;
                }
            }
        } else {
            // LEGACY CODE:  LIZMAP < 3.4
            // Fields
            $str_x_fields = $plotConfig['plot']['x_field'];
            $exp_x_fields = explode(',', $str_x_fields);
            if (count($exp_x_fields) > 0 and $exp_x_fields != array('')) {
                $x_fields = $exp_x_fields;
            }
            $str_y_fields = $plotConfig['plot']['y_field'];
            if (array_key_exists('y2_field', $plotConfig['plot'])) {
                $str_y_fields.= ',' . $plotConfig['plot']['y2_field'];
            }
            $exp_y_fields = explode(',', $str_y_fields);
            if (count($exp_y_fields) > 0 and $exp_y_fields != array('')) {
                $y_fields = $exp_y_fields;
            }
            $str_z_fields = '';
            if (array_key_exists('z_field', $plotConfig['plot'])) {
                $str_z_fields = $plotConfig['plot']['z_field'];
            }
            $exp_z_fields = explode(',', $str_z_fields);
            if (count($exp_z_fields) > 0 and $exp_z_fields != array('')) {
                $z_fields = $exp_z_fields;
            }

            // Colors
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
        }

        // Optionnal layout additionnal options (legacy code)
        if (array_key_exists('layout_config', $plotConfig['plot'])) {
            $this->layout = $plotConfig['plot']['layout_config'];
        }

        // Aggregation
        $aggregation = 'sum';
        if (array_key_exists('aggregation', $plotConfig['plot'])) {
            $aggregation = $plotConfig['plot']['aggregation'];
        }

        // Set class properties
        $this->x_fields = $x_fields;
        $this->y_fields = $y_fields;
        $this->z_fields = $z_fields;
        $this->aggregation = $aggregation;
        $this->colors = $colors;
        $this->colorfields = $colorfields;

        // Show legend
        $this->display_legend = $plotConfig['plot']['display_legend'];

        // Stacked
        $this->stacked = $plotConfig['plot']['stacked'];

        // horizontal
        $this->horizontal = $plotConfig['plot']['horizontal'];
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
            'showlegend' => $this->display_legend,
            'legend' => array(
                'orientation' => 'h',
                'x' => '-0.1',
                'y' => '1.15'
            ),
            'autosize' => true,
            'plot_bgcolor' => 'rgba(0,0,0,0)',
            'paper_bgcolor' => 'rgba(0,0,0,0)',
            'margin' => array(
                't' => 10,
                'b' => 30,
                'l' => 30,
                'r' => 30,
                'pad' => 1,
            ),
            'xaxis' => array(
                'tickfont' => array(
                    'size' => 10
                ),
                'automargin' => true
            ),
            'yaxis' => array(
                'tickfont' => array(
                    'size' => 10
                ),
                'automargin' => true
            )
        );

        if ($this->type == 'pie' or $this->type == 'sunburst'){
            $layout['legend']['orientation'] = 'h';
            $layout['legend']['y'] = '-5';
        }

        if ($this->type == 'bar'and count($this->y_fields) > 1 and $this->stacked) {
            $layout['barmode'] = 'stack';
        }

        if (!in_array($this->type, array('pie', 'bar'))) {
            if (count($this->x_fields) == 1) {
                if (!array_key_exists('xaxis',$layout)) {
                    $layout['xaxis'] = array();
                }
                $layout['xaxis']['title'] = $this->getFieldAlias($this->x_fields[0]);
            }
        }
        if (!in_array($this->type, array('pie', 'bar'))) {
            if (count($this->y_fields) == 1) {
                if (!array_key_exists('yaxis',$layout)) {
                    $layout['yaxis'] = array();
                }
                $layout['yaxis']['title'] = $this->getFieldAlias($this->y_fields[0]);
            }
        }

        // Change margin when no legend
        if (($this->type == 'pie' and !$this->display_legend) or $this->type == 'sunburst') {
            $layout['margin']['b'] = 10;
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
            if ($this->type == 'scatter' or $this->type == 'pie'){
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
                $zf = null;
                if (count($this->z_fields) > 0) {
                    $zf = $this->z_fields[$yidx];
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

                // Creation of array who will be used to aggregate when the type is pie or sunburst
                if ($this->type == 'pie' or $this->type == 'sunburst' or $this->type == 'html') {
                    $x_aggregate_sum = array();
                    $x_aggregate_count = array();
                    $x_aggregate_min = array();
                    $x_aggregate_max = array();
                    $x_aggregate_stddev = array();
                    $x_aggregate_median = array();
                    $x_distinct_parent = array();
                }

                // Fill in the trace for each dimension
                if ($this->type == 'sunburst') {
                    $parents_distinct_values = array();
                    $parents_distinct_colors = array();
                }
                foreach ($features as $feat) {
                    if ($this->type != 'pie' and $this->type != 'sunburst' and $this->type != 'html') {
                        // Fill in X field
                        if (count($this->x_fields) == 1) {
                            $trace[$this->x_property_name][] = $feat->properties->{$xf};
                        }

                        // Fill in Y field
                        $trace[$this->y_property_name][] = $feat->properties->{$yf};

                        // Fill in Z field
                        if($this->z_property_name and $zf){
                            $z_field_value = $feat->properties->{$zf};
                            $trace[$this->z_property_name][] = $z_field_value;
                        }
                        // Fill in feature colors
                        if (property_exists($feat->properties, $featcolor)
                            and !empty($feat->properties->{$featcolor})
                            ) {
                            $featcolors[] = $feat->properties->{$featcolor};
                        }
                    } else {
                        // For pie, sunburst, html chart, we need to manually
                        // sum and aggregate values per distinct x values
                        // because plotly cannot use aggregations transforms
                        // -> store values in an array to aggregate them afterwards
                        if ($feat->properties->{$xf} != null or $feat->properties->{$xf} == 0) {
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
                            ++$x_aggregate_count[$feat->properties->{$xf}];
                            $x_aggregate_last[$feat->properties->{$xf}] = $feat->properties->{$yf};
                            if (is_numeric($feat->properties->{$yf})) {
                                $x_aggregate_sum[$feat->properties->{$xf}] += $feat->properties->{$yf};
                                if ($x_aggregate_min[$feat->properties->{$xf}] > $feat->properties->{$yf}) {
                                    $x_aggregate_min[$feat->properties->{$xf}] = $feat->properties->{$yf};
                                }
                                if ($x_aggregate_max[$feat->properties->{$xf}] < $feat->properties->{$yf}) {
                                    $x_aggregate_max[$feat->properties->{$xf}] = $feat->properties->{$yf};
                                }
                            }
                            array_push($x_aggregate_median[$feat->properties->{$xf}], $feat->properties->{$yf});

                            if ($this->type == 'sunburst') {
                                // Sum up values for distinct labels to compute values for the sunburst parents
                                if (!array_key_exists($feat->properties->{$zf}, $parents_distinct_values)) {
                                    $parents_distinct_values[$feat->properties->{$zf}] = 0;
                                }
                                $parents_distinct_values[$feat->properties->{$zf}] += $feat->properties->{$yf};

                                // Keep one color for the same reason
                                if (property_exists($feat->properties, $featcolor)
                                and !empty($feat->properties->{$featcolor})
                                ) {
                                    if (!array_key_exists($feat->properties->{$zf}, $parents_distinct_values)) {
                                        $parents_distinct_colors[$feat->properties->{$zf}] = 'white';
                                    }
                                    $parents_distinct_colors[$feat->properties->{$zf}] = $feat->properties->{$featcolor};
                                }
                            }
                        }
                    }
                }

                if ($this->type == 'pie' or $this->type == 'sunburst' or $this->type == 'html') {
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

                // Add root and x distinct values into sunburst parents, values and labels
                // for root, we use "Total" so that nothing is displayed
                if ($this->type == 'sunburst') {
                    $labels_before = array('Total');
                    $values_before = array(0);
                    $parents_before = array('');
                    $colors_before = array('white');
                    $vtotal = 0;

                    foreach ($parents_distinct_values as $z=>$v) {
                        $labels_before[] = $z;
                        $values_before[] = $v;
                        $parents_before[] = 'Total';
                        $colors_before[] = $parents_distinct_colors[$z];
                        $vtotal+= $v;
                    };
                    $values_before[0] = $vtotal;
                    $trace[$this->x_property_name] = array_merge($labels_before, $trace[$this->x_property_name]);
                    $trace[$this->y_property_name] = array_merge($values_before, $trace[$this->y_property_name]);
                    $trace[$this->z_property_name] = array_merge($parents_before, $trace[$this->z_property_name]);
                    $featcolors = array_merge($colors_before, $featcolors);

                }
                // set color
                if (!empty($featcolors)) {
                    if ($this->type == 'bar'
                        or $this->type == 'scatter'
                    ) {
                        $trace['marker']['color'] = $featcolors;
                    }
                    if ($this->type == 'pie' or $this->type == 'sunburst' or $this->type == 'html'
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

                // add aggregation property if aggregation is done client side via dataplotly
                // Not available for pie, histogram and histogram2d, we have done it manually beforehand in php
                if ($this->aggregation
                    and !in_array($this->type, array('pie', 'histogram', 'histogram2d', 'html', 'sunburst'))
                ) {
                    $trace['transforms'] = array(
                        array(
                            'type' => 'aggregate',
                            'groups' => $this->x_property_name,
                            //'groups' => 'x',
                            'aggregations' => array(
                                array(
                                    'target' => $this->y_property_name,
                                    'func' => $this->aggregation,
                                    'enabled' => true
                                )
                            )
                        )
                    );
                }


                $traces[] = $trace;
            }

            $this->traces = $traces;
            $this->data = $traces;


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
        if ($this->horizontal) {
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
            'hovertemplate' => "%{label}<br>%{value:.1f}<br>%{percent:,.0%}",
            'textinfo' => 'value',
            'texttemplate' => '%{value:.1f}',
            'opacity' => null,
            'hole' => '0.4',
            'automargin' => true,
            'sort' => false // slices will be sort by X data
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


class datavizPlotSunburst extends datavizPlot
{
    public $type = 'sunburst';

    protected $x_property_name = 'labels';
    protected $y_property_name = 'values';
    protected $z_property_name = 'parents';

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'sunburst',
            'name' => '',
            'values' => array(),
            'labels' => array(),
            'parents' => array(),
            'branchvalues'=> 'total',
            //'hoverinfo' => "label+value",
            'hovertemplate' => "%{label}<br>%{value:.1f}<br>%{percentEntry:,.0%}",
            //'textinfo' => 'value',
            'texttemplate' => '%{value:.1f}',
            'opacity' => null,
        );
    }
}


class datavizPlotHtml extends datavizPlot
{
    public $type = 'html';

    protected $x_property_name = 'x';
    protected $y_property_name = 'y';
    protected $z_property_name = null;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'html',
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
            'opacity' => null,
        );
    }
}
