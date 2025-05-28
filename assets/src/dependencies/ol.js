import $ol$Feature from 'ol/Feature.js';
import $ol$Overlay from 'ol/Overlay.js';

import {getDistance as _ol_sphere$getDistance} from 'ol/sphere.js';
import {getLength as _ol_sphere$getLength} from 'ol/sphere.js';
import {getArea as _ol_sphere$getArea} from 'ol/sphere.js';

import $ol$format$GeoJSON from 'ol/format/GeoJSON.js';
import $ol$format$GML3 from 'ol/format/GML3.js';
import $ol$format$GPX from 'ol/format/GPX.js';
import $ol$format$KML from 'ol/format/KML.js';
import $ol$format$MVT from 'ol/format/MVT.js';
import $ol$format$WKB from 'ol/format/WKB.js';
import $ol$format$WKT from 'ol/format/WKT.js';
import $ol$format$WMSCapabilities from 'ol/format/WMSCapabilities.js';
import $ol$format$WFSCapabilities from 'ol-wfs-capabilities';
import $ol$format$WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import $ol$format$WMSGetFeatureInfo from 'ol/format/WMSGetFeatureInfo.js';

import $ol$source$ImageWMS from 'ol/source/ImageWMS.js';
import $ol$source$BingMaps from 'ol/source/BingMaps.js';
import $ol$source$Google from 'ol/source/Google.js';
import $ol$source$Vector from 'ol/source/Vector.js';
import $ol$source$VectorTile from 'ol/source/VectorTile.js';
import $ol$source$WMTS from 'ol/source/WMTS.js';
import {optionsFromCapabilities as _ol_source_WMTS$optionsFromCapabilities} from 'ol/source/WMTS.js';
import $ol$source$XYZ from 'ol/source/XYZ.js';
import $ol$source$TileWMS from 'ol/source/TileWMS.js';
import $ol$source$OGCMapTile from 'ol/source/OGCMapTile.js';
import $ol$source$OGCVectorTile from 'ol/source/OGCVectorTile.js';

import $ol$layer$Image from 'ol/layer/Image.js';
import $ol$layer$Vector from 'ol/layer/Vector.js';
import $ol$layer$Tile from 'ol/layer/Tile.js';
import $ol$layer$VectorTile from 'ol/layer/VectorTile.js';
import $ol$layer$Group from 'ol/layer/Group.js';
import $ol$layer$Layer from 'ol/layer/Layer.js';
import $ol$layer$Graticule from 'ol/layer/Graticule.js';

import {getCenter as _ol_extent$getCenter} from 'ol/extent.js';
import {extend as _ol_extent$extend} from 'ol/extent.js';
import {intersects as _ol_extent$intersects} from 'ol/extent.js';
import {getWidth as _ol_extent$getWidth} from 'ol/extent.js';
import {applyTransform as _ol_extent$applyTransform} from 'ol/extent.js';
import {equals as _ol_extent$equals} from 'ol/extent.js';
import {isEmpty as _ol_extent$isEmpty} from 'ol/extent.js';
import {getIntersection as _ol_extent$getIntersection} from 'ol/extent.js';
import {buffer as _ol_extent$buffer} from 'ol/extent.js';
import {containsCoordinate as _ol_extent$containsCoordinate} from 'ol/extent.js';

import $ol$geom$Circle from 'ol/geom/Circle.js';
import $ol$geom$Geometry from 'ol/geom/Geometry.js';
import $ol$geom$GeometryCollection from 'ol/geom/GeometryCollection.js';
import $ol$geom$LineString from 'ol/geom/LineString.js';
import $ol$geom$LinearRing from 'ol/geom/LinearRing.js';
import $ol$geom$MultiLineString from 'ol/geom/MultiLineString.js';
import $ol$geom$MultiPoint from 'ol/geom/MultiPoint.js';
import $ol$geom$MultiPolygon from 'ol/geom/MultiPolygon.js';
import $ol$geom$Point from 'ol/geom/Point.js';
import $ol$geom$Polygon from 'ol/geom/Polygon.js';

import $ol$proj$Projection from 'ol/proj/Projection.js';
import {get as _ol_proj$get} from 'ol/proj.js';
import {getPointResolution as _ol_proj$getPointResolution} from 'ol/proj.js';
import {getTransform as _ol_proj$getTransform} from 'ol/proj.js';
import {clearAllProjections as _ol_proj$clearAllProjections} from 'ol/proj.js';
import {equivalent as _ol_proj$equivalent} from 'ol/proj.js'
import {addCommon as _ol_proj$addCommon} from 'ol/proj.js';
import {transform as _ol_proj$transform} from 'ol/proj.js';
import {transformExtent as _ol_proj$transformExtent} from 'ol/proj.js';

import {unregister as _ol_proj_proj4$unregister} from 'ol/proj/proj4.js';
import {register as _ol_proj_proj4$register} from 'ol/proj/proj4.js';

import $ol$style$Circle from 'ol/style/Circle.js';
import $ol$style$Fill from 'ol/style/Fill.js';
import $ol$style$Icon from 'ol/style/Icon.js';
import $ol$style$Image from 'ol/style/Image.js';
import $ol$style$RegularShape from 'ol/style/RegularShape.js';
import $ol$style$Stroke from 'ol/style/Stroke.js';
import $ol$style$Style from 'ol/style/Style.js';
import $ol$style$Text from 'ol/style/Text.js';

import $ol$tilegrid$TileGrid from 'ol/tilegrid/TileGrid.js';
import $ol$tilegrid$WMTS from 'ol/tilegrid/WMTS.js';
import {createFromCapabilitiesMatrixSet as _ol_tilegrid_WMTS$createFromCapabilitiesMatrixSet} from 'ol/tilegrid/WMTS.js';
import {DEFAULT_MAX_ZOOM as _ol_tilegrid_common$DEFAULT_MAX_ZOOM} from 'ol/tilegrid/common.js';
import {DEFAULT_TILE_SIZE as _ol_tilegrid_common$DEFAULT_TILE_SIZE} from 'ol/tilegrid/common.js';
import {getForProjection as _ol_tilegrid$getForProjection} from 'ol/tilegrid.js';
import {wrapX as _ol_tilegrid$wrapX} from 'ol/tilegrid.js';
import {createForExtent as _ol_tilegrid$createForExtent} from 'ol/tilegrid.js';
import {createXYZ as _ol_tilegrid$createXYZ} from 'ol/tilegrid.js';
import {createForProjection as _ol_tilegrid$createForProjection} from 'ol/tilegrid.js';
import {extentFromProjection as _ol_tilegrid$extentFromProjection} from 'ol/tilegrid.js';

import $ol$interaction$Draw from 'ol/interaction/Draw.js';
import $ol$interaction$Modify from 'ol/interaction/Modify.js';
import $ol$interaction$Select from 'ol/interaction/Select.js';
import {createBox as _ol_interaction_Draw$createBox} from 'ol/interaction/Draw.js';

import {altKeyOnly as _ol_events_condition$altKeyOnly} from 'ol/events/condition.js';

var ol = {};

ol.Feature = $ol$Feature;
ol.Overlay = $ol$Overlay;

ol.sphere = {};
ol.sphere.getArea = _ol_sphere$getArea;
ol.sphere.getDistance = _ol_sphere$getDistance;
ol.sphere.getLength = _ol_sphere$getLength;

ol.format = {};
ol.format.GeoJSON = $ol$format$GeoJSON;
ol.format.GML3 = $ol$format$GML3;
ol.format.GPX = $ol$format$GPX;
ol.format.KML = $ol$format$KML;
ol.format.MVT = $ol$format$MVT;
ol.format.WKB = $ol$format$WKB;
ol.format.WKT = $ol$format$WKT;
ol.format.WMSCapabilities = $ol$format$WMSCapabilities;
ol.format.WFSCapabilities = $ol$format$WFSCapabilities;
ol.format.WMTSCapabilities = $ol$format$WMTSCapabilities;
ol.format.WMSGetFeatureInfo = $ol$format$WMSGetFeatureInfo;

ol.source = {};
ol.source.ImageWMS = $ol$source$ImageWMS;
ol.source.BingMaps = $ol$source$BingMaps;
ol.source.Google = $ol$source$Google;
ol.source.Vector = $ol$source$Vector;
ol.source.VectorTile = $ol$source$VectorTile;
ol.source.WMTS = $ol$source$WMTS;
ol.source.WMTS.optionsFromCapabilities = _ol_source_WMTS$optionsFromCapabilities;

ol.source.XYZ = $ol$source$XYZ;
ol.source.TileWMS = $ol$source$TileWMS;

ol.layer = {};
ol.layer.Graticule = $ol$layer$Graticule;
ol.layer.Group = $ol$layer$Group;
ol.layer.Image = $ol$layer$Image;
ol.layer.Layer = $ol$layer$Layer;
ol.layer.Tile = $ol$layer$Tile;
ol.layer.Vector = $ol$layer$Vector;
ol.layer.VectorTile = $ol$layer$VectorTile;
ol.source.OGCMapTile = $ol$source$OGCMapTile;
ol.source.OGCVectorTile = $ol$source$OGCVectorTile;

ol.extent = {};
ol.extent.applyTransform = _ol_extent$applyTransform;
ol.extent.buffer = _ol_extent$buffer;
ol.extent.equals = _ol_extent$equals;
ol.extent.extend = _ol_extent$extend;
ol.extent.getCenter = _ol_extent$getCenter;
ol.extent.getIntersection = _ol_extent$getIntersection;
ol.extent.getWidth = _ol_extent$getWidth;
ol.extent.intersects = _ol_extent$intersects;
ol.extent.isEmpty = _ol_extent$isEmpty;
ol.extent.containsCoordinate = _ol_extent$containsCoordinate;

ol.geom = {};
ol.geom.Circle = $ol$geom$Circle;
ol.geom.Geometry = $ol$geom$Geometry;
ol.geom.GeometryCollection = $ol$geom$GeometryCollection;
ol.geom.LineString = $ol$geom$LineString;
ol.geom.LinearRing = $ol$geom$LinearRing;
ol.geom.MultiLineString = $ol$geom$MultiLineString;
ol.geom.MultiPoint = $ol$geom$MultiPoint;
ol.geom.MultiPolygon = $ol$geom$MultiPolygon;
ol.geom.Point = $ol$geom$Point;
ol.geom.Polygon = $ol$geom$Polygon;

ol.proj = {};
ol.proj.Projection = $ol$proj$Projection;
ol.proj.addCommon = _ol_proj$addCommon;
ol.proj.clearAllProjections = _ol_proj$clearAllProjections;
ol.proj.equivalent = _ol_proj$equivalent;
ol.proj.get = _ol_proj$get;
ol.proj.getPointResolution = _ol_proj$getPointResolution;
ol.proj.getTransform = _ol_proj$getTransform;
ol.proj.transform = _ol_proj$transform;
ol.proj.transformExtent = _ol_proj$transformExtent;

ol.proj.proj4 = {};
ol.proj.proj4.register = _ol_proj_proj4$register;
ol.proj.proj4.unregister = _ol_proj_proj4$unregister;

ol.style = {};
ol.style.Circle = $ol$style$Circle;
ol.style.Fill = $ol$style$Fill;
ol.style.Icon = $ol$style$Icon;
ol.style.Image = $ol$style$Image;
ol.style.RegularShape = $ol$style$RegularShape;
ol.style.Stroke = $ol$style$Stroke;
ol.style.Style = $ol$style$Style;
ol.style.Text = $ol$style$Text;

ol.tilegrid = {};
ol.tilegrid.TileGrid = $ol$tilegrid$TileGrid;
ol.tilegrid.WMTS = $ol$tilegrid$WMTS;
ol.tilegrid.WMTS.createFromCapabilitiesMatrixSet = _ol_tilegrid_WMTS$createFromCapabilitiesMatrixSet;
ol.tilegrid.common = {};
ol.tilegrid.common.DEFAULT_MAX_ZOOM = _ol_tilegrid_common$DEFAULT_MAX_ZOOM;
ol.tilegrid.common.DEFAULT_TILE_SIZE = _ol_tilegrid_common$DEFAULT_TILE_SIZE;
ol.tilegrid.createForExtent = _ol_tilegrid$createForExtent;
ol.tilegrid.createForProjection = _ol_tilegrid$createForProjection;
ol.tilegrid.createXYZ = _ol_tilegrid$createXYZ;
ol.tilegrid.extentFromProjection = _ol_tilegrid$extentFromProjection;
ol.tilegrid.getForProjection = _ol_tilegrid$getForProjection;
ol.tilegrid.wrapX = _ol_tilegrid$wrapX;

ol.interaction = {};
ol.interaction.Draw = $ol$interaction$Draw;
ol.interaction.Modify = $ol$interaction$Modify;
ol.interaction.Select = $ol$interaction$Select;
ol.interaction.Draw.createBox = _ol_interaction_Draw$createBox;

ol.events = {};
ol.events.condition = {};
ol.events.condition.altKeyOnly = _ol_events_condition$altKeyOnly;

export default ol;
