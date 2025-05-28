<?php

/**
 * @author    3liz
 * @copyright 2017-2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License
 */

use GuzzleHttp\Psr7;
use JsonMachine as Json;
use Lizmap\Project\Project;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\WFSRequest;

class datavizPlot
{
    /**
     * @var null|Project
     */
    protected $lproj;

    public $title;

    public $type;

    public $layerId;

    /**
     * @var SimpleXMLElement
     *
     * @deprecated
     */
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

    protected $theme;

    /**
     * datavizPlot constructor.
     *
     * @param string $repository
     * @param string $project
     * @param array  $plotConfig
     * @param null   $data
     *
     * @throws jExceptionSelector
     */
    public function __construct(
        $repository,
        $project,
        $plotConfig,
        $data = null
    ) {

        // Get the project data
        $lproj = $this->getProject($repository, $project);
        if (!$lproj) {
            return;
        }
        $this->lproj = $lproj;

        // Get main dataviz config
        $dv = new datavizConfig($repository, $project);
        $config = $dv->getConfig();
        if ($config && array_key_exists('theme', $config)) {
            $this->theme = $config['dataviz']['theme'];
        }

        // Parse plot config
        $this->parsePlotConfig($plotConfig);

        // Get layer data
        $this->parseLayer();

        // layout and data (use default if none given)
        $this->setLayout($this->layout);
        $this->setData($data);
    }

    private function parsePlotConfig($plotConfig)
    {
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
            if ($exp_x_fields != array('')) {
                $x_fields = $exp_x_fields;
            }
            $str_y_fields = $plotConfig['plot']['y_field'];
            if (array_key_exists('y2_field', $plotConfig['plot'])) {
                $str_y_fields .= ','.$plotConfig['plot']['y2_field'];
            }
            $exp_y_fields = explode(',', $str_y_fields);
            if ($exp_y_fields != array('')) {
                $y_fields = $exp_y_fields;
            }
            $str_z_fields = '';
            if (array_key_exists('z_field', $plotConfig['plot'])) {
                $str_z_fields = $plotConfig['plot']['z_field'];
            }
            $exp_z_fields = explode(',', $str_z_fields);
            if ($exp_z_fields != array('')) {
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

        // Optional layout additional options (legacy code)
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
     * @return null|bool|Project
     *
     * @throws jExceptionSelector
     */
    public function getProject($repository, $project)
    {
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return false;
            }
        } catch (UnknownLizmapProjectException $e) {
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return false;
        }
        // Check acl
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return false;
        }

        return $lproj;
    }

    /**
     * Parse layer based on layer id provided by plotConfig.
     */
    protected function parseLayer()
    {
        // FIXME do not use this deprecated method and XML stuff here
        $layerXml = $this->lproj->getXmlLayer($this->layerId);
        if (count($layerXml) > 0) {
            $this->layerXmlZero = $layerXml[0];
        }
    }

    /**
     * Set the plot title from the plot config.
     *
     * @param string $title
     */
    protected function setTitle($title)
    {
        $this->title = $title;
    }

    /**
     * @param null|array|string $layout
     * @param string            $format the layout format: array or json
     */
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

    /**
     * @param string $field the field name
     *
     * @return string the field alias
     */
    protected function getFieldAlias($field)
    {
        /** @var qgisVectorLayer $layer */
        $layer = $this->lproj->getLayer($this->layerId);
        $aliases = $layer->getAliasFields();
        $name = $field;
        if (array_key_exists($field, $aliases) and !empty($aliases[$field])) {
            $name = $aliases[$field];
        }

        return $name;
    }

    /**
     * @return array
     */
    protected function getLayoutTemplate()
    {
        $layout = array(
            // 'title' => $this->title,
            'showlegend' => $this->display_legend,
            'legend' => array(
                'orientation' => 'h',
                'x' => '-0.1',
                'y' => '1.15',
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
                    'size' => 10,
                ),
                'automargin' => true,
            ),
            'yaxis' => array(
                'tickfont' => array(
                    'size' => 10,
                ),
                'automargin' => true,
            ),
        );

        if ($this->type == 'pie' or $this->type == 'sunburst') {
            $layout['legend']['orientation'] = 'h';
            $layout['legend']['y'] = '-5';
        }

        if ($this->type == 'bar' and count($this->y_fields) > 1 and $this->stacked) {
            $layout['barmode'] = 'stack';
        }

        if (!in_array($this->type, array('pie', 'bar'))) {
            if (count($this->x_fields) == 1) {
                if (!array_key_exists('xaxis', $layout)) {
                    $layout['xaxis'] = array();
                }
                $layout['xaxis']['title'] = $this->getFieldAlias($this->x_fields[0]);
            }
        }
        if (!in_array($this->type, array('pie', 'bar'))) {
            if (count($this->y_fields) == 1) {
                if (!array_key_exists('yaxis', $layout)) {
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

    /**
     * @param null|array|string $data
     * @param string            $format the data format: array or json
     */
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

    /**
     * @param string $format the data format: raw or json
     *
     * @return array|object
     */
    public function getData($format = 'raw')
    {
        $data = $this->data;

        if ($format == 'json') {
            $data = json_encode($data);
        }

        return $data;
    }

    /**
     * @param string $format the data format: raw or json
     *
     * @return array|object
     */
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

        // FIXME do not use anymore XML from project in this method, migrate
        // XML code to QgisProject or other low level classes

        $_layerName = $this->layerXmlZero->xpath('layername');
        $layerName = (string) $_layerName[0];

        // Prepare request and get data
        if ($method == 'wfs') {
            // Get WFS typename
            /** @var qgisVectorLayer $layer */
            $layer = $this->lproj->getLayer($this->layerId);
            $typeName = $layer->getWfsTypeName();
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
                'TYPENAME' => $typeName,
                'OUTPUTFORMAT' => 'GeoJSON',
                'GEOMETRYNAME' => 'none',
                'PROPERTYNAME' => implode(',', $propertyname),
            );
            // Sort by x fields when scatter plot is used
            if ($this->type == 'scatter' or $this->type == 'pie') {
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
                if ($preg != false && count($matches[0]) > 0) {
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

            $wfsrequest = new WFSRequest($this->lproj, $wfsparams, lizmap::getServices());

            $wfsresponse = $wfsrequest->process();
            $features = null;

            // Check code
            if ($wfsresponse->getCode() >= 400) {
                return false;
            }
            // Check mime/type
            if (in_array(strtolower($wfsresponse->getMime()), array('text/html', 'text/xml'))) {
                return false;
            }

            // Fill in traces
            $traces = array();

            // Features as iterator
            $featureStream = Psr7\StreamWrapper::getResource($wfsresponse->getBodyAsStream());
            $features = Json\Items::fromStream($featureStream, array('pointer' => '/features'));

            $f1 = null;
            $traceBuilders = array();
            $fidx = 0;
            foreach ($features as $feat) {
                ++$fidx;

                if ($f1 === null) {
                    $f1 = $feat;

                    // Check 1st feature
                    if (!property_exists($f1, 'properties')) {
                        return false;
                    }

                    // Check if plot needs X and has $x_field
                    if (in_array($this->type, $this->x_mandatory) && !$this->x_fields) {
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

                    $yidx = 0;
                    foreach ($this->y_fields as $y_field) {
                        $traceBuilder = array();

                        // build empty trace
                        $traceBuilder['trace'] = $this->getTraceTemplate();

                        // Set trace name. Use QGIS field alias if present
                        $trace_name = $this->getFieldAlias($y_field);
                        $traceBuilder['trace']['name'] = $trace_name;

                        // We are in the loop iterating y_fields: $y_field is set
                        $traceBuilder['yf'] = $y_field;
                        // x
                        $traceBuilder['xf'] = null;
                        if (count($this->x_fields) == 1) {
                            $traceBuilder['xf'] = $this->x_fields[0];
                        }
                        // z
                        $traceBuilder['zf'] = null;
                        if (count($this->z_fields) > 0) {
                            $traceBuilder['zf'] = $this->z_fields[$yidx];
                        }

                        $traceBuilder['featcolor'] = null;
                        if (count($this->colorfields) > 0) {
                            $traceBuilder['featcolor'] = $this->colorfields[$yidx];
                        }

                        // Revert x and y for horizontal bar plot
                        if (array_key_exists('orientation', $traceBuilder['trace']) and $traceBuilder['trace']['orientation'] == 'h') {
                            $traceBuilder['xf'] = $y_field;
                            $traceBuilder['yf'] = $this->x_fields[0];
                        }

                        // Set color
                        if (array_key_exists('marker', $traceBuilder['trace']) and !empty($this->colors)) {
                            if ($yidx < count($this->colors)) {
                                $traceBuilder['trace']['marker']['color'] = $this->colors[$yidx];
                            }
                            ++$yidx;
                        }
                        // Prepare an array to store features color (if any)
                        $traceBuilder['featcolors'] = array();

                        // Creation of array who will be used to aggregate when the type is pie or sunburst
                        $traceBuilder['x_aggregate_sum'] = null;
                        $traceBuilder['x_aggregate_count'] = null;
                        $traceBuilder['x_aggregate_min'] = null;
                        $traceBuilder['x_aggregate_max'] = null;
                        $traceBuilder['x_aggregate_first'] = null;
                        $traceBuilder['x_aggregate_stddev'] = null;
                        $traceBuilder['x_aggregate_stddev_xy'] = null;
                        $traceBuilder['x_aggregate_median'] = null;
                        $traceBuilder['x_aggregate_last'] = null;
                        $traceBuilder['x_distinct_parent'] = null;
                        if ($this->type == 'pie' or $this->type == 'sunburst' or $this->type == 'html') {
                            $traceBuilder['x_aggregate_sum'] = array();
                            $traceBuilder['x_aggregate_count'] = array();
                            $traceBuilder['x_aggregate_min'] = array();
                            $traceBuilder['x_aggregate_max'] = array();
                            $traceBuilder['x_aggregate_first'] = array();
                            $traceBuilder['x_aggregate_stddev'] = array();
                            $traceBuilder['x_aggregate_stddev_xy'] = array();
                            $traceBuilder['x_aggregate_median'] = array();
                            $traceBuilder['x_aggregate_last'] = array();
                            $traceBuilder['x_distinct_parent'] = array();
                        }

                        // Fill in the trace for each dimension
                        $traceBuilder['parents_distinct_values'] = null;
                        $traceBuilder['parents_distinct_colors'] = null;
                        if ($this->type == 'sunburst') {
                            $traceBuilder['parents_distinct_values'] = array();
                            $traceBuilder['parents_distinct_colors'] = array();
                        }

                        $traceBuilders[] = $traceBuilder;
                    }
                }

                foreach ($traceBuilders as &$traceBuilder) {
                    $trace = &$traceBuilder['trace'];
                    $yf = $traceBuilder['yf'];
                    $xf = $traceBuilder['xf'];
                    $zf = $traceBuilder['zf'];
                    $featcolor = $traceBuilder['featcolor'];
                    $featcolors = &$traceBuilder['featcolors'];

                    /** @var null|array $x_aggregate_sum */
                    $x_aggregate_sum = &$traceBuilder['x_aggregate_sum'];

                    /** @var null|array $x_aggregate_count */
                    $x_aggregate_count = &$traceBuilder['x_aggregate_count'];

                    /** @var null|array $x_aggregate_min */
                    $x_aggregate_min = &$traceBuilder['x_aggregate_min'];

                    /** @var null|array $x_aggregate_max */
                    $x_aggregate_max = &$traceBuilder['x_aggregate_max'];

                    /** @var null|array $x_aggregate_first */
                    $x_aggregate_first = &$traceBuilder['x_aggregate_first'];

                    /** @var null|array $x_aggregate_stddev */
                    $x_aggregate_stddev = &$traceBuilder['x_aggregate_stddev'];

                    /** @var null|array $x_aggregate_stddev_xy */
                    $x_aggregate_stddev_xy = &$traceBuilder['x_aggregate_stddev_xy'];

                    /** @var null|array $x_aggregate_median */
                    $x_aggregate_median = &$traceBuilder['x_aggregate_median'];

                    /** @var null|array $x_aggregate_last */
                    $x_aggregate_last = &$traceBuilder['x_aggregate_last'];

                    /** @var null|array $x_distinct_parent */
                    $x_distinct_parent = &$traceBuilder['x_distinct_parent'];

                    /** @var null|array $parents_distinct_values */
                    $parents_distinct_values = &$traceBuilder['parents_distinct_values'];

                    /** @var null|array $parents_distinct_colors */
                    $parents_distinct_colors = &$traceBuilder['parents_distinct_colors'];

                    if ($this->type != 'pie' && $this->type != 'sunburst' && $this->type != 'html') {
                        // Fill in X field
                        if (count($this->x_fields) == 1) {
                            $trace[$this->x_property_name][] = $feat->properties->{$xf};
                        }

                        // Fill in Y field
                        $trace[$this->y_property_name][] = $feat->properties->{$yf};

                        // Fill in Z field
                        if ($this->z_property_name && $zf) {
                            $z_field_value = $feat->properties->{$zf};
                            $trace[$this->z_property_name][] = $z_field_value;
                        }
                        // Fill in feature colors
                        if (property_exists($feat->properties, $featcolor)
                            && !empty($feat->properties->{$featcolor})
                        ) {
                            $featcolors[] = $feat->properties->{$featcolor};
                        }
                    } else {
                        // For pie, sunburst, html chart, we need to manually
                        // sum and aggregate values per distinct x values
                        // because plotly cannot use aggregations transforms
                        // -> store values in an array to aggregate them afterwards
                        $x = null;
                        if (property_exists($feat->properties, $xf)) {
                            $x = $feat->properties->{$xf};
                        }

                        /** @var null|bool|float|int|string $x */
                        if ($x !== null) {
                            // Aggregate - Each time we find a new X, we initialize the value for this x key
                            if ($x_aggregate_sum !== null && !array_key_exists($x, $x_aggregate_sum)) {
                                $x_aggregate_sum[$x] = 0;
                                $x_aggregate_count[$x] = 0;
                                $x_aggregate_min[$x] = $feat->properties->{$yf};
                                $x_aggregate_max[$x] = $feat->properties->{$yf};
                                $x_aggregate_first[$x] = $feat->properties->{$yf};
                                $x_aggregate_stddev[$x] = 0;
                                $x_aggregate_median[$x] = array();

                                if ($this->z_property_name && !empty($zf)) {
                                    $x_distinct_parent[$x] = $feat->properties->{$zf};
                                }

                                // We also add the color
                                if (property_exists($feat->properties, $featcolor)
                                    && !empty($feat->properties->{$featcolor})
                                ) {
                                    $featcolors[] = $feat->properties->{$featcolor};
                                }
                            }
                            // incrementation of the sum/count who will be used for other kind of aggregation
                            ++$x_aggregate_count[$x];
                            $y = null;
                            if (property_exists($feat->properties, $yf)) {
                                $y = $feat->properties->{$yf};
                            }
                            $x_aggregate_last[$x] = $y;
                            if (is_numeric($y)) {
                                $x_aggregate_sum[$x] += $y;
                                if ($x_aggregate_min[$x] > $y) {
                                    $x_aggregate_min[$x] = $y;
                                }
                                if ($x_aggregate_max[$x] < $y) {
                                    $x_aggregate_max[$x] = $y;
                                }
                            }
                            array_push($x_aggregate_median[$x], $y);

                            if ($this->type == 'sunburst') {
                                // Sum up values for distinct labels to compute values for the sunburst parents
                                if ($parents_distinct_values !== null && !array_key_exists($feat->properties->{$zf}, $parents_distinct_values)) {
                                    $parents_distinct_values[$feat->properties->{$zf}] = 0;
                                }
                                $parents_distinct_values[$feat->properties->{$zf}] += $y;

                                // Keep one color for the same reason
                                if (property_exists($feat->properties, $featcolor)
                                    && !empty($feat->properties->{$featcolor})
                                ) {
                                    if (!array_key_exists($feat->properties->{$zf}, $parents_distinct_values)) {
                                        $parents_distinct_colors[$feat->properties->{$zf}] = 'white';
                                    }
                                    $parents_distinct_colors[$feat->properties->{$zf}] = $feat->properties->{$featcolor};
                                }
                            }

                            if ($this->aggregation == 'stddev') {
                                $x_aggregate_stddev_xy[] = array($x, $y);
                            }
                        }
                    }
                }
            }

            foreach ($traceBuilders as &$traceBuilder) {
                $trace = &$traceBuilder['trace'];
                $yf = $traceBuilder['yf'];
                $xf = $traceBuilder['xf'];
                $zf = $traceBuilder['zf'];
                $featcolor = $traceBuilder['featcolor'];
                $featcolors = &$traceBuilder['featcolors'];

                /** @var null|array $x_aggregate_sum */
                $x_aggregate_sum = &$traceBuilder['x_aggregate_sum'];

                /** @var null|array $x_aggregate_count */
                $x_aggregate_count = &$traceBuilder['x_aggregate_count'];

                /** @var null|array $x_aggregate_min */
                $x_aggregate_min = &$traceBuilder['x_aggregate_min'];

                /** @var null|array $x_aggregate_max */
                $x_aggregate_max = &$traceBuilder['x_aggregate_max'];

                /** @var null|array $x_aggregate_first */
                $x_aggregate_first = &$traceBuilder['x_aggregate_first'];

                /** @var null|array $x_aggregate_stddev */
                $x_aggregate_stddev = &$traceBuilder['x_aggregate_stddev'];

                /** @var null|array $x_aggregate_stddev_xy */
                $x_aggregate_stddev_xy = &$traceBuilder['x_aggregate_stddev_xy'];

                /** @var null|array $x_aggregate_median */
                $x_aggregate_median = &$traceBuilder['x_aggregate_median'];

                /** @var null|array $x_aggregate_last */
                $x_aggregate_last = &$traceBuilder['x_aggregate_last'];

                /** @var null|array $x_distinct_parent */
                $x_distinct_parent = &$traceBuilder['x_distinct_parent'];

                /** @var null|array $parents_distinct_values */
                $parents_distinct_values = &$traceBuilder['parents_distinct_values'];

                /** @var null|array $parents_distinct_colors */
                $parents_distinct_colors = &$traceBuilder['parents_distinct_colors'];

                if ($this->type == 'pie' || $this->type == 'sunburst' || $this->type == 'html') {
                    if ($this->aggregation == 'stddev' && count($x_aggregate_stddev_xy) > 0) {
                        foreach ($x_aggregate_stddev_xy as $xy) {
                            $x = $xy[0];
                            $x_aggregate_stddev[$x] += pow($xy[1] - ($x_aggregate_sum[$x] / $x_aggregate_count[$x]), 2);
                        }
                    }

                    if ($this->aggregation == 'median' && count($x_aggregate_median) > 0) {
                        foreach ($x_aggregate_median as $key => $value) {
                            asort($x_aggregate_median[$key]);
                        }
                    }

                    // Fill the data with the correct key => value
                    if (count($x_aggregate_sum) > 0) {
                        foreach ($x_aggregate_sum as $key => $value) {
                            // x
                            $trace[$this->x_property_name][] = $key;
                            if ($this->z_property_name) {
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
                                // if count is even
                                if ($x_aggregate_count[$key] % 2 == 0) {
                                    $trace[$this->y_property_name][] = $x_aggregate_median[$key][$x_aggregate_count[$key] / 2];
                                }
                                // si count is odd
                                else {
                                    $mid = floor($x_aggregate_count[$key] / 2);
                                    $trace[$this->y_property_name][] = ($x_aggregate_median[$key][$mid] + $x_aggregate_median[$key][$mid + 1]) / 2;
                                }
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

                    if (count($parents_distinct_values) > 0) {
                        foreach ($parents_distinct_values as $z => $v) {
                            $labels_before[] = $z;
                            $values_before[] = $v;
                            $parents_before[] = 'Total';
                            $colors_before[] = $parents_distinct_colors[$z];
                            $vtotal += $v;
                        }
                    }
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
                    if ($this->type == 'pie' || $this->type == 'sunburst' || $this->type == 'html'
                    ) {
                        $trace['marker']['colors'] = $featcolors;
                        unset($trace['marker']['color']);
                    }
                }

                if ($this->x_property_name && count($trace[$this->x_property_name]) == 0) {
                    $trace[$this->x_property_name] = null;
                }
                if ($this->y_property_name && count($trace[$this->y_property_name]) == 0) {
                    $trace[$this->y_property_name] = null;
                }
                if ($this->z_property_name && count($trace[$this->z_property_name]) == 0) {
                    $trace[$this->z_property_name] = null;
                }

                // add aggregation property if aggregation is done client side via dataplotly
                // Not available for pie, histogram and histogram2d, we have done it manually beforehand in php
                // Careful : for horizontal bar plots, we need to reverse the groups and target values
                if ($this->aggregation
                    && !in_array($this->type, array('pie', 'histogram', 'histogram2d', 'html', 'sunburst'))
                ) {
                    // Revert x and y for horizontal bar plot
                    $transformGroupsName = $this->x_property_name;
                    $transformTargetName = $this->y_property_name;
                    if (array_key_exists('orientation', $trace) and $trace['orientation'] == 'h') {
                        $transformGroupsName = $this->y_property_name;
                        $transformTargetName = $this->x_property_name;
                    }
                    $trace['transforms'] = array(
                        array(
                            'type' => 'aggregate',
                            'groups' => $transformGroupsName,
                            'aggregations' => array(
                                array(
                                    'target' => $transformTargetName,
                                    'func' => $this->aggregation,
                                    'enabled' => true,
                                ),
                            ),
                        ),
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
    protected $z_property_name;

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
    protected $z_property_name;

    protected function getTraceTemplate()
    {
        return array(
            'type' => 'box',
            'name' => '',
            'x' => array(),
            'y' => array(),
            'text' => array(),
            // 'marker'=> array(
            // 'color' => 'orange'
            // ),
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
    protected $z_property_name;

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
    protected $z_property_name;

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
    protected $z_property_name;

    protected function getTraceTemplate()
    {
        $template = array(
            'type' => 'pie',
            'name' => '',
            'values' => array(),
            'labels' => array(),
            'hoverinfo' => 'label+value+percent',
            'hovertemplate' => '%{label}<br>%{value:.1f}<br>%{percent:,.0%}',
            'textinfo' => 'value',
            'texttemplate' => '%{value:.1f}',
            // 'textposition' => 'inside',
            'insidetextorientation' => 'horizontal',
            'opacity' => null,
            'hole' => '0.4',
            'automargin' => true,
            'sort' => false, // slices will be sort by X data
        );
        if ($this->theme == 'dark') {
            $template['outsidetextfont'] = array('color' => 'white');
        }

        return $template;
    }
}

class datavizPlotHistogram2d extends datavizPlot
{
    public $type = 'histogram2d';

    protected $x_property_name = 'x';

    protected $y_property_name = 'y';
    protected $z_property_name;

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
    protected $z_property_name;

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
        $template = array(
            'type' => 'sunburst',
            'name' => '',
            'values' => array(),
            'labels' => array(),
            'parents' => array(),
            'branchvalues' => 'total',
            // 'hoverinfo' => "label+value",
            'hovertemplate' => '%{label}<br>%{value:.1f}<br>%{percentEntry:,.0%}',
            // 'textinfo' => 'value',
            'texttemplate' => '%{value:.1f}',
            'opacity' => null,
        );
        if ($this->theme == 'dark') {
            $template['outsidetextfont'] = array('color' => 'white');
        }

        return $template;
    }
}

class datavizPlotHtml extends datavizPlot
{
    public $type = 'html';

    protected $x_property_name = 'x';
    protected $y_property_name = 'y';
    protected $z_property_name;

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
