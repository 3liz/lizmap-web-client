 OpenLayers.Format.SLD.v1_1_0 = OpenLayers.Class(
    OpenLayers.Format.SLD.v1_0_0, {
    
    /**
     * Constant: VERSION
     * {String} 1.0.0
     */
    VERSION: "1.1.0",
    
    /**
     * Property: schemaLocation
     * {String} http://www.opengis.net/sld
     *   http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd
     */
    schemaLocation: "http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd",
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: OpenLayers.Util.applyDefaults({
        "se":"http://www.opengis.net/se"
     }, OpenLayers.Format.SLD.v1_0_0.prototype.namespaces),
    
    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: OpenLayers.Util.applyDefaults({
        "se": OpenLayers.Util.applyDefaults({
            "SvgParameter":OpenLayers.Format.SLD.v1_0_0.prototype.readers["sld"]["CssParameter"]
        }, OpenLayers.Format.SLD.v1_0_0.prototype.readers["sld"])
    }, OpenLayers.Format.SLD.v1_0_0.prototype.readers),

    CLASS_NAME: "OpenLayers.Format.SLD.v1_1_0" 
});
