/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 */

/**
 * Class: OpenLayers.Geometry.Polygon
 * Polygon is a collection of Geometry.LinearRings.
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.Collection>
 *  - <OpenLayers.Geometry>
 */
OpenLayers.Geometry.Polygon = OpenLayers.Class(
  OpenLayers.Geometry.Collection, {

    /**
     * Property: componentTypes
     * {Array(String)} An array of class names representing the types of
     * components that the collection can include.  A null value means the
     * component types are not restricted.
     */
    componentTypes: ["OpenLayers.Geometry.LinearRing"],

    /**
     * Constructor: OpenLayers.Geometry.Polygon
     * Constructor for a Polygon geometry.
     * The first ring (this.component[0])is the outer bounds of the polygon and
     * all subsequent rings (this.component[1-n]) are internal holes.
     *
     *
     * Parameters:
     * components - {Array(<OpenLayers.Geometry.LinearRing>)}
     */

    /**
     * APIMethod: getArea
     * Calculated by subtracting the areas of the internal holes from the
     *   area of the outer hole.
     *
     * Returns:
     * {float} The area of the geometry
     */
    getArea: function() {
        var area = 0.0;
        if ( this.components && (this.components.length > 0)) {
            area += Math.abs(this.components[0].getArea());
            for (var i=1, len=this.components.length; i<len; i++) {
                area -= Math.abs(this.components[i].getArea());
            }
        }
        return area;
    },

    /**
     * APIMethod: getGeodesicArea
     * Calculate the approximate area of the polygon were it projected onto
     *     the earth.
     *
     * Parameters:
     * projection - {<OpenLayers.Projection>} The spatial reference system
     *     for the geometry coordinates.  If not provided, Geographic/WGS84 is
     *     assumed.
     *
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
     *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
     *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
     *
     * Returns:
     * {float} The approximate geodesic area of the polygon in square meters.
     */
    getGeodesicArea: function(projection) {
        var area = 0.0;
        if(this.components && (this.components.length > 0)) {
            area += Math.abs(this.components[0].getGeodesicArea(projection));
            for(var i=1, len=this.components.length; i<len; i++) {
                area -= Math.abs(this.components[i].getGeodesicArea(projection));
            }
        }
        return area;
    },

    /**
     * Method: containsPoint
     * Test if a point is inside a polygon.  Points on a polygon edge are
     *     considered inside.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>}
     *
     * Returns:
     * {Boolean | Number} The point is inside the polygon.  Returns 1 if the
     *     point is on an edge.  Returns boolean otherwise.
     */
    containsPoint: function(point) {
        var numRings = this.components.length;
        var contained = false;
        if(numRings > 0) {
            // check exterior ring - 1 means on edge, boolean otherwise
            contained = this.components[0].containsPoint(point);
            if(contained !== 1) {
                if(contained && numRings > 1) {
                    // check interior rings
                    var hole;
                    for(var i=1; i<numRings; ++i) {
                        hole = this.components[i].containsPoint(point);
                        if(hole) {
                            if(hole === 1) {
                                // on edge
                                contained = 1;
                            } else {
                                // in hole
                                contained = false;
                            }
                            break;
                        }
                    }
                }
            }
        }
        return contained;
    },

    /**
     * APIMethod: intersects
     * Determine if the input geometry intersects this one.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} Any type of geometry.
     *
     * Returns:
     * {Boolean} The input geometry intersects this one.
     */
    intersects: function(geometry) {
        var intersect = false;
        var i, len;
        if(geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            intersect = this.containsPoint(geometry);
        } else if(geometry.CLASS_NAME == "OpenLayers.Geometry.LineString" ||
                  geometry.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
            // check if rings/linestrings intersect
            for(i=0, len=this.components.length; i<len; ++i) {
                intersect = geometry.intersects(this.components[i]);
                if(intersect) {
                    break;
                }
            }
            if(!intersect) {
                // check if this poly contains points of the ring/linestring
                for(i=0, len=geometry.components.length; i<len; ++i) {
                    intersect = this.containsPoint(geometry.components[i]);
                    if(intersect) {
                        break;
                    }
                }
            }
        } else {
            for(i=0, len=geometry.components.length; i<len; ++ i) {
                intersect = this.intersects(geometry.components[i]);
                if(intersect) {
                    break;
                }
            }
        }
        // check case where this poly is wholly contained by another
        if(!intersect && geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
            // exterior ring points will be contained in the other geometry
            var ring = this.components[0];
            for(i=0, len=ring.components.length; i<len; ++i) {
                intersect = geometry.containsPoint(ring.components[i]);
                if(intersect) {
                    break;
                }
            }
        }
        return intersect;
    },

    /**
     * Method: split
     * Use this geometry (the source) to attempt to split a target geometry.
     *
     * Parameters:
     * target - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Properties of this object will be used to determine
     *     how the split is conducted.
     *
     * Valid options:
     * mutual - {Boolean} Split the source geometry in addition to the target
     *     geometry.  Default is false.
     * edge - {Boolean} Allow splitting when only edges intersect.  Default is
     *     true.  If false, a vertex on the source must be within the tolerance
     *     distance of the intersection to be considered a split.
     * tolerance - {Number} If a non-null value is provided, intersections
     *     within the tolerance distance of an existing vertex on the source
     *     will be assumed to occur at the vertex.
     *
     * Returns:
     * {Array} A list of geometries (of this same type as the target) that
     *     result from splitting the target with the source geometry.  The
     *     source and target geometry will remain unmodified.  If no split
     *     results, null will be returned.  If mutual is true and a split
     *     results, return will be an array of two arrays - the first will be
     *     all geometries that result from splitting the source geometry and
     *     the second will be all geometries that result from splitting the
     *     target geometry.
     */
    split: function(target, options) {
        return this.splitWith(target, options);
    },

    /**
     * Method: splitWith
     * Split this geometry (the target) with the given geometry (the source).
     * see the following URL for the algorithm:
     * http://stackoverflow.com/questions/3623703/how-can-i-split-a-polygon-by-a-line
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} A geometry used to split this
     *     geometry (the source).
     * options - {Object} Properties of this object will be used to determine
     *     how the split is conducted.
     *
     * Valid options:
     * edge - {Boolean} Allow splitting when only edges intersect.  Default is
     *     true.  If false, a vertex on the source must be within the tolerance
     *     distance of the intersection to be considered a split.
     * tolerance - {Number} If a non-null value is provided, intersections
     *     within the tolerance distance of an existing vertex on the source
     *     will be assumed to occur at the vertex.
     *
     * Returns:
     * {Array} A list of geometries (of this same type as the target) that
     *     result from splitting the target with the source geometry.  The
     *     source and target geometry will remain unmodified.  If no split
     *     results, null will be returned.  If mutual is true and a split
     *     results, return will be an array of two arrays - the first will be
     *     all geometries that result from splitting the source geometry and
     *     the second will be all geometries that result from splitting the
     *     target geometry.
     */
    splitWith: function(geometry, options) {
        var edge = !(options && options.edge === false);
        var tolerance = options && options.tolerance;
        var mutual = false; // It's not possible to split by polygons for now.
        var interOptions = {point: true, tolerance: tolerance};

        // Validate that the splitting geometry, it must not cross itself
        var lineVerts = geometry.getVertices();
        for(var i=0, stop=lineVerts.length-2; i<=stop; ++i) {
            lineVert1 = lineVerts[i];
            lineVert2 = lineVerts[i+1];
            lineSeg1 = {x1: lineVert1.x, y1: lineVert1.y, x2: lineVert2.x, y2: lineVert2.y};

            for(var j=i+2; j<=stop; ++j) {
                lineVert1 = lineVerts[j];
                lineVert2 = lineVerts[j+1];
                lineSeg2 = {x1: lineVert1.x, y1: lineVert1.y, x2: lineVert2.x, y2: lineVert2.y};

                if(OpenLayers.Geometry.segmentsIntersect(lineSeg1, lineSeg2, {point: false})) {
                    return [];
                }
            }
        }

        if(!this.intersects(geometry)) {
            return [];
        }

        // List of output polygons
        var results = [];

        // List of intersection pair (crossback)
        var crossback = [];
        var currentCrossback = [];

        // Find all intersection points
        // and keep them sorted by position on the line
        var polygonVerts = this.getVertices();
        var vert1, vert2, polySeg, lineSeg;

        // Make sure we start outside of the polygon
        var startVert = 0;
        var insidePolygon = false;
        while(this.intersects(lineVerts[startVert])) {
            startVert++;
        }

        // Loop through the splitting geometry and  build crossback
        // or simple segments that cross the polygon.
        for(var i=startVert, stop=lineVerts.length-2; i<=stop; ++i) {
            lineVert1 = lineVerts[i];
            lineVert2 = lineVerts[i+1];
            lineSeg = {x1: lineVert1.x, y1: lineVert1.y, x2: lineVert2.x, y2: lineVert2.y};

            if(insidePolygon) {
                currentCrossback.push(lineVert1);
            }

            for(var j=0, polyStop=polygonVerts.length-1; j<=polyStop; ++j)
            {
                vert1 = polygonVerts[j];
                vert2 = polygonVerts[((j+1) % polygonVerts.length)];
                polySeg = {x1: vert1.x, y1: vert1.y, x2: vert2.x, y2: vert2.y};

                point = OpenLayers.Geometry.segmentsIntersect(
                    polySeg, lineSeg, interOptions
                );
                if(point instanceof OpenLayers.Geometry.Point)
                {
                    // Build the line for the split
                    if(insidePolygon)
                    {
                        currentCrossback.push(point);
                        crossback.push(currentCrossback);
                        insidePolygon = false;
                        currentCrossback = [];
                        interOptions.tolerance = tolerance;
                    }
                    else
                    {
                        currentCrossback.push(point);
                        insidePolygon = true;
                        // Once inside the polygon, the tolerance should not be taken into account
                        // otherwise, the crossback may end all on the same point and create
                        // invalid geometry.
                        interOptions.tolerance = null;
                    }
                }
            }
        }

        // Loop through the crossback and split the polygons with all the line individually
        polygons = [this];
        for(var i=0; i<crossback.length; i++) {
            for(var j=0; j < polygons.length ; j++) {
                currentPolygon = polygons[j];

                if(currentPolygon.intersects(new OpenLayers.Geometry.LineString(crossback[i]))) {
                    splits = currentPolygon.splitWithSimpleSegment(crossback[i], options);

                    if(splits.length > 1) {
                        splits.unshift(j, 1);
                        Array.prototype.splice.apply(polygons, splits);
                        j += splits.length - 3;
                        break;
                    }
                }
            }
        }

        var returns = polygons;

        return returns;

    },

    splitWithSimpleSegment: function (lineSegment, options) {

        var returns = [];
        var verts = this.getVertices();
        var pendingCrossback = false;
        var pendingPolygon = null;
        var currentPolygon = [verts[0]];
        var intersectingPoint = null;

        // Append the first point to the LinearRing
        var startSegmentPoint = lineSegment[0];
        var endSegmentPoint = lineSegment[lineSegment.length - 1];
        var reverseSegment = lineSegment.slice();
        reverseSegment.reverse();

        for(var i=0, stop=verts.length-1; i<=stop; ++i) {
            vert1 = verts[i];
            vert2 = verts[(i+1) % verts.length];
            seg = {
              x1: vert1.x, y1: vert1.y,
              x2: vert2.x, y2: vert2.y
            }

            polygonEdge = new OpenLayers.Geometry.LineString([vert1, vert2]);

            currentPolygon.push(vert1);

            var startIntersects = OpenLayers.Geometry.pointOnSegment(startSegmentPoint, seg);
            var endIntersects = OpenLayers.Geometry.pointOnSegment(endSegmentPoint, seg);

            // When directly on the edge, use the startSegmentPoint only
            if(endIntersects &&
               (endSegmentPoint.x == vert1.x && endSegmentPoint.y == vert1.y) ||
               (endSegmentPoint.x == vert2.x && endSegmentPoint.y == vert2.y)) {
                endIntersects = false;
            }

            if(!startIntersects && !endIntersects) {
                continue;
            }

            if(startIntersects && endIntersects) {
                if(currentPolygon[currentPolygon.length-1].distanceTo(startSegmentPoint) <
                   currentPolygon[currentPolygon.length-1].distanceTo(endSegmentPoint))
                {
                    currentPolygon = currentPolygon.concat(lineSegment);
                    returns.push(new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(lineSegment)]));
                }
                else
                {
                    currentPolygon = currentPolygon.concat(reverseSegment);
                    returns.push(new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(lineSegment)]));
                }
                continue;
            }

            // Register the intersection pair for later
            if(!pendingCrossback) {
                pendingCrossback = true;

                // Set a new polygon as the output polygon
                pendingPolygon = currentPolygon;
                currentPolygon = [];
                continue;
            }

            // Close the polygon with the line segment
            if(startIntersects)
            {
                currentPolygon = currentPolygon.concat(lineSegment);
                pendingPolygon = pendingPolygon.concat(reverseSegment);
            }
            else
            {
                currentPolygon = currentPolygon.concat(reverseSegment);
                pendingPolygon = pendingPolygon.concat(lineSegment);
            }

            returns.push(new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(currentPolygon)]));
            currentPolygon = pendingPolygon;
            pendingPolygon = null;
            pendingCrossback = false;
        }

        returns.push(new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(currentPolygon)]));

        return returns;

    },

    /**
     * APIMethod: distanceTo
     * Calculate the closest distance between two geometries (on the x-y plane).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Optional properties for configuring the distance
     *     calculation.
     *
     * Valid options:
     * details - {Boolean} Return details from the distance calculation.
     *     Default is false.
     * edge - {Boolean} Calculate the distance from this geometry to the
     *     nearest edge of the target geometry.  Default is true.  If true,
     *     calling distanceTo from a geometry that is wholly contained within
     *     the target will result in a non-zero distance.  If false, whenever
     *     geometries intersect, calling distanceTo will return 0.  If false,
     *     details cannot be returned.
     *
     * Returns:
     * {Number | Object} The distance between this geometry and the target.
     *     If details is true, the return will be an object with distance,
     *     x0, y0, x1, and y1 properties.  The x0 and y0 properties represent
     *     the coordinates of the closest point on this geometry. The x1 and y1
     *     properties represent the coordinates of the closest point on the
     *     target geometry.
     */
    distanceTo: function(geometry, options) {
        var edge = !(options && options.edge === false);
        var result;
        // this is the case where we might not be looking for distance to edge
        if(!edge && this.intersects(geometry)) {
            result = 0;
        } else {
            result = OpenLayers.Geometry.Collection.prototype.distanceTo.apply(
                this, [geometry, options]
            );
        }
        return result;
    },

    CLASS_NAME: "OpenLayers.Geometry.Polygon"
});

/**
 * APIMethod: createRegularPolygon
 * Create a regular polygon around a radius. Useful for creating circles
 * and the like.
 *
 * Parameters:
 * origin - {<OpenLayers.Geometry.Point>} center of polygon.
 * radius - {Float} distance to vertex, in map units.
 * sides - {Integer} Number of sides. 20 approximates a circle.
 * rotation - {Float} original angle of rotation, in degrees.
 */
OpenLayers.Geometry.Polygon.createRegularPolygon = function(origin, radius, sides, rotation) {
    var angle = Math.PI * ((1/sides) - (1/2));
    if(rotation) {
        angle += (rotation / 180) * Math.PI;
    }
    var rotatedAngle, x, y;
    var points = [];
    for(var i=0; i<sides; ++i) {
        rotatedAngle = angle + (i * 2 * Math.PI / sides);
        x = origin.x + (radius * Math.cos(rotatedAngle));
        y = origin.y + (radius * Math.sin(rotatedAngle));
        points.push(new OpenLayers.Geometry.Point(x, y));
    }
    var ring = new OpenLayers.Geometry.LinearRing(points);
    return new OpenLayers.Geometry.Polygon([ring]);
};
