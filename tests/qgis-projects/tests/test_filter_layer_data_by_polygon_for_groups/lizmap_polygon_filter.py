# Headers and parameters
user_groups='subadmins, test, other'
polygon_layer_id='polygons_c9ff77e3_8747_4188_be43_421c8605ee3d'
polygon_layer_field='groups'
layers_with_polygon_access_filter= {
    'points_241855da_7b4f_45e2_a5ac_c84f869f9f9d': {
        'unique_id': 'id'
    },
    'townhalls_EPSG2154_efe320fb_677c_45e4_8f32_aa1fe10cc3ce': {
        'unique_id': 'fid'
    }
}
layers_with_polygon_editing_filter=[]

# Do nothing if header and parameters are empty
if not user_groups:
    pass

# Get the polygon layer
polygon_layer = QgsProject.instance().mapLayer(polygon_layer_id)
if not polygon_layer or not polygon_layer.isSpatial():
    pass

# Get the features of the polygon layer corresponding to the user groups
expression = 'array_intersect('
expression += 'array_foreach(string_to_array("{}"), trim(@element)),'.format(
    polygon_layer_field
)
expression += "array_foreach(string_to_array('{}'), trim(@element))".format(
    user_groups
)
expression += ')'

# Create request
request = QgsFeatureRequest()
request.setSubsetOfAttributes([])
request.setFlags(QgsFeatureRequest.NoGeometry)
request.setFilterExpression(expression)

# Get the matching feature ids and geometries
ids = []
polygon_geoms = []
for feat in polygon_layer.getFeatures(request):
    ids.append(feat.id())
    polygon_geoms.append(feat.geometry())
if not ids:
    pass

# Get polygon layers CRS
polygon_crs = polygon_layer.sourceCrs()

# Build subset string to filter the layers
sql = ''

# Filter the other layers
for layer_id, layer_properties in layers_with_polygon_access_filter.items():
    f_layer = QgsProject.instance().mapLayer(layer_id)
    f_prop = layer_properties
    if not f_layer or not f_layer.isSpatial():
        continue

    print(f_layer.name())

    # filtered layer crs
    f_crs = f_layer.sourceCrs()

    # If layer is of type PostgreSQL, use a simple ST_Intersects
    # Build the collection of geometries of the matching polygons
    if f_layer.providerType() == 'postgres':

        # Create a WKT for the collection of polygon geometries
        polygons_wkt = polygons.asWkt(6)

        # todo
        f_geometry_field = 'geom'

        # Build subset string
        sql = (
            'ST_Intersects('
            '    "{}", '
            '    ST_Transform(ST_GeomFromText(\'{}\', {}), {})'
            ')'
        ).format(
            f_geometry_field,
            polygons_wkt,
            polygon_crs.postgisSrid(),
            f_crs.postgisSrid()
        )

    else:

        sql = ''
        # For other types, we need to find all the ids with an expression
        # And then search for these ids in the substring, as it must be SQL
        # We need to have a cache for this, valid for the combo polygon layer id & user_groups
        # as it will be done for each WMS or WFS query

        # build the spatial index
        f_index = QgsSpatialIndex()
        f_index.addFeatures(f_layer.getFeatures())

        # Find candidates, if not already in cache
        tr = QgsCoordinateTransform(polygon_crs, f_crs, QgsProject.instance())
        polygons = QgsGeometry().collectGeometry(polygon_geoms)
        polygons_tr = polygons.transform(tr)
        f_candidates = f_index.intersects(polygons.boundingBox())

        # Check real intersection for the candidates
        unique_ids = []
        for candidate_id in f_candidates:
            f_feat = f_layer.getFeature(candidate_id)
            intersects = f_feat.geometry().intersects(polygons)
            if intersects:
                unique_ids.append(str(f_feat[f_prop['unique_id']]))

        # Build substring sql
        if unique_ids:
            # SQL
            sql = '"{}" IN ({})'.format(
                f_prop['unique_id'],
                ', '.join(unique_ids)
            )

    #print(sql)

    if sql:
        f_layer.setSubsetString(sql)
