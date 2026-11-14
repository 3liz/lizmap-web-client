<?php

/**
 * Read the features of a layer with a WFS GetFeature request.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

use Lizmap\Project\Project;
use Lizmap\Request\FeatureStream;
use Lizmap\Request\WFSRequest;

/**
 * Read the features of a layer with a WFS GetFeature request.
 *
 * The request is processed by WFSRequest: by a direct query for PostgreSQL
 * layers when possible, by QGIS Server otherwise. The features are decoded
 * by blocks from the response stream.
 */
class WfsFeatureReader
{
    /** @var Project The Lizmap project */
    protected Project $project;

    /** @var string The QGIS layer identifier */
    protected string $layerId;

    /**
     * Create the reader for the given layer.
     *
     * @param Project $project the Lizmap project, the ACL must have been checked
     * @param string  $layerId the QGIS layer identifier
     */
    public function __construct(Project $project, string $layerId)
    {
        $this->project = $project;
        $this->layerId = $layerId;
    }

    /**
     * Request the layer features without geometry.
     *
     * @param list<string> $propertyNames the fields to get
     * @param string       $expFilter     a QGIS expression to filter the features
     * @param list<string> $sortBy        the fields to sort the features
     *
     * @return null|iterable the GeoJSON features, decoded by blocks from the
     *                       response stream, null if the request failed
     */
    public function read(array $propertyNames, string $expFilter = '', array $sortBy = array()): ?iterable
    {
        // The layer must exist in the project
        /** @var null|\qgisVectorLayer $layer */
        $layer = $this->project->getLayer($this->layerId);
        if (!$layer) {
            return null;
        }

        // GetFeature request in GeoJSON, without geometry
        $params = array(
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $layer->getWfsTypeName(),
            'OUTPUTFORMAT' => 'GeoJSON',
            'GEOMETRYNAME' => 'none',
        );
        // Filter the features with the QGIS expression
        if ($expFilter !== '') {
            // Add the fields used in the filter in PROPERTYNAME
            // bug in QGIS SERVER 2.18: send no data if fields in exp_filter not in PROPERTYNAME
            if (preg_match_all('#"([^"]+)"#', $expFilter, $matches)) {
                $propertyNames = array_merge($propertyNames, $matches[1]);
            }
            $params['EXP_FILTER'] = $expFilter;
        }
        // Request only the needed fields
        $params['PROPERTYNAME'] = implode(',', array_unique(array_filter($propertyNames)));

        // Sort the features if needed. The field names are quoted, as QGIS
        // Server reads each one as an expression: a name with spaces or a
        // reserved word is then still a field.
        if ($sortBy) {
            $params['SORTBY'] = implode(',', array_map(
                fn (string $field): string => '"'.str_replace('"', '""', $field).'"',
                $sortBy,
            ));
        }

        // Process the request
        $request = new WFSRequest($this->project, $params, \lizmap::getServices());
        $response = $request->process();

        // Errors are returned as XML or HTML
        if ($response->getCode() >= 400) {
            return null;
        }
        if (in_array(strtolower($response->getMime()), array('text/html', 'text/xml'))) {
            return null;
        }

        // Decode the features from the response stream
        return FeatureStream::fromResponse($response);
    }
}
