OpenLayers.Control.HighlightFeature = OpenLayers.Class(OpenLayers.Control, {
    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.  Register a listener
     *     for a particular event with the following syntax:
     * (code)
     * control.events.register(type, obj, listener);
     * (end)
     *
     *  - *featureset* Triggered when the mouse is hover a new feature, 
     *      i.e. not a previously hover feature.
     *  - *featurereset* Triggered when the mouse becomes no longer hover
     *      a feature.
     */
    EVENT_TYPES: ["featureset","featurereset"],

    /**
     * Property: feature
     * {OpenLayers.Feature} The current highlighted feature the mouse.  Will
     *                      be set to null as soon as the mouse is not hover
     *                      a feature.
     */
    feature: null,
            
    /**
     * Property: style
     * {OpenLayers.Style}   The style applied to an hover feature
     */
    style: null,

    /**
     * Property: displayPopup
     * {boolean}  Display a popup with all the feature attributes if this
     *            is set to true.  Default true.
     */
    displayPopup: true,

    defaultHandlerOptions: {
        'delay': 0,
        'pixelTolerance': null,
        'stopMove': false
    },

    defaultStyle: {
        'strokeColor' : "red",
        'strokeWidth' : 7
    },

    popupOffset: {
        'left': 45,
        'right': 0,
        'top': 5
    },

    popupTitle: null,

    popupSize: null,

    defaultPopupSize: new OpenLayers.Size(200,325),

    /**
     * Constructor: OpenLayers.Control.HighlightFeature
     * Create a new HighlightFeature feature control.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Layer that contains features.
     * options - {Object} Optional object whose properties will be set on the
     *     control.
     */
    initialize: function(layers, options) {        
        // concatenate events specific to this control with those from the base
        this.EVENT_TYPES =
            OpenLayers.Control.HighlightFeature.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        this.style = OpenLayers.Util.extend( {}, this.defaultStyle);
        this.popupSize = OpenLayers.Util.extend( {}, this.defaultPopupSize);

        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if(this.scope === null) {
            this.scope = this;
        }
        this.initLayer(layers);
        
        this.handler = new OpenLayers.Handler.Hover(
            this, {
                //'pause': this.onPause,
                'move': this.onMove
            },
            this.handlerOptions
        );

        if (!this.popupOffset){
            this.popupOffset = {
                'left': 0,
                'right': 0,
                'top': 0
            };
        } else {
            if (!this.popupOffset.left){
                this.popupOffset.left = 0;
            }
            if (!this.popupOffset.right){
                this.popupOffset.right = 0;
            }
            if (!this.popupOffset.top){
                this.popupOffset.top = 0;
            }
        }
    },

    /** 
     * Method: setMap
     * Set the map property for the control. This is done through an accessor
     * so that subclasses can override this and take special action once 
     * they have their map variable set. 
     *
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        this.map = map;
        if (this.handler) {
            this.handler.setMap(map);
        }
        this.map.events.register("zoomend", this, this.onZoom);
    },

    /**
     * Method: initLayer
     * Assign the layer property. If layers is an array, we need to use
     *     a RootContainer.
     *
     * Parameters:
     * layers - {<OpenLayers.Layer.Vector>}, or an array of vector layers.
     */
    initLayer: function(layers) {
        if(OpenLayers.Util.isArray(layers)) {
            this.layers = layers;
            this.layer = new OpenLayers.Layer.Vector.RootContainer(
                this.id + "_container", {
                    layers: layers
                }
            );
        } else {
            this.layer = layers;
        }
    },
    
    /**
     * APIMethod: setLayer
     * Attach a new layer to the control, overriding any existing layers.
     *
     * Parameters:
     * layers - Array of {<OpenLayers.Layer.Vector>} or a single
     *     {<OpenLayers.Layer.Vector>}
     */
    setLayer: function(layers) {
        var isActive = this.active;
        //this.unselectAll();
        this.deactivate();
        if(this.layers) {
            this.layer.destroy();
            this.layers = null;
        }
        this.initLayer(layers);
        //this.handlers.feature.layer = this.layer;
        if (isActive) {
            this.activate();
        }
    },

    //onPause: function(evt) {},

    /**
    * Method: onMove
    * While this control is active, on mouse move, check if the mouse is
    * over a feature or was over a feature and is not anymore.
    *
    * Parameters:
    * evt
    */
    onMove: function(evt){
        if (evt.type != "mousemove") {
            return;
        }

        var oFeature = this.layer.getFeatureFromEvent(evt);

        if (this.feature){ // last hover feature exist
            if (oFeature){ // mouse is over a feature
                if (this.feature.fid != oFeature.fid){//are they differents
                    this.resetFeature();
                    this.setFeature(oFeature, evt);
                }
            } else {// mouse is not over a feature, but last hover feature exist
                this.resetFeature();
            }
        } else if (oFeature){ // no last feature and mouse over a feature
            this.setFeature(oFeature, evt);
        }
    },

    /**
    * Method: onZoom
    * If a feature was hover the mouse before a zoom event, the same feature
    * should be set as hover.  The main purpose of this function is to make
    * sure the style is applied after the layer has loaded its features and 
    * the popups and events are correctly displayed/triggered.
    *
    * Parameters:
    * evt
    */
    onZoom: function(evt){
        if(this.feature){
            var oFeature = this.feature;
            this.resetFeature();
            // Make sure the hover feature is still among the layer.features
            // before setting it hover again
            if (OpenLayers.Util.indexOf(this.layer.features, oFeature) != -1){
                this.setFeature(oFeature, evt);
            }
        }
    },

    /**
    * Method: setFeature
    * Change the color of current feature over the mouse.  Can display a popup
    * At the same time.  The feature becomes the current feature.
    *
    * Parameters:
    * evt
    */
    setFeature: function(feature, evt){
        var layer = feature.layer;
        layer.drawFeature( feature, this.style );
        if(this.displayPopup){
            this.addInfoPopup(feature, evt);
        }
        var event = {feature: feature};
        this.events.triggerEvent("featureset", event);
        this.feature = feature;
    },

    /**
    * Method: resetFeature
    * Draw this.feature to its original color.  If there was a popup, it's
    * also removed.  this.feature becomes null.
    *
    */
    resetFeature: function(){
        var layer = this.feature.layer;
        if (OpenLayers.Util.indexOf(layer.features,
                                    this.feature) != -1){
            layer.drawFeature(this.feature);
        }
        if(this.displayPopup){
            this.removeInfoPopup(this.feature);                
        }
        var event = {feature: this.feature};
        this.events.triggerEvent("featurereset", event);
        this.feature = null;
    },

    /**
     * Method: addInfoPopup
     * Called when a the mouse is over a feature but not selected.  It creates
     * a popup with all feature attributes and is displayed at the left or right
     * of the map depending where the mouse is.  That is why evt is needed.
     *
     * Parameters:
     * feature - {OpenLayers.Feature}
     *
     * evt
     */
    addInfoPopup: function(feature, evt) {
        var szHTML, oPopupPos, oMapExtent, nReso, oPopup, bLeft;
            
        // feature attributes parsing in html
        szHTML = "<div style='font-size:.8em'><h1>"+this.popupTitle+"</h1>";
        if (!feature.cluster){
            aszAttributes = feature.attributes;
            for(var key in aszAttributes){
                szHTML += key + " : " + aszAttributes[key] + "<br />";
            }
        }
        szHTML +="</div>";
        
        oMapExtent = this.layer.map.getExtent();
        nReso = this.layer.map.getResolution();
        
        // calculate where (left or right) the popup will appear
        if(evt.xy){ // if we know the mouse position
            var nMapWidth = this.layer.map.getSize().w;
            var nMouseXPos = evt.xy.x; 
            bLeft = nMouseXPos >= (nMapWidth/2);
        } else { // use feature and map center pixel to compare
            var nMapXCenter = this.map.getExtent().getCenterPixel().x;
            var nFeatureXPos = feature.geometry.getBounds().getCenterPixel().x;
            bLeft = nFeatureXPos >= nMapXCenter;
        }

        if(bLeft){ // popup appears top-left position
            oPopupPos = new OpenLayers.LonLat(oMapExtent.left,oMapExtent.top);
            oPopupPos.lon += this.popupOffset.left * nReso;
        } else { // popup appears top-right position
            oPopupPos = new OpenLayers.LonLat(oMapExtent.right,oMapExtent.top);
            oPopupPos.lon -= this.popupOffset.right * nReso;
        }
        oPopupPos.lat -= this.popupOffset.top * nReso;
                
        oPopup = new OpenLayers.Popup.AnchoredBubble(
            "chicken",
            oPopupPos,
            this.popupSize,
            //new OpenLayers.Size(200,325),
            //null,
            szHTML,
            null, null, null);
        feature.popup = oPopup;
        this.map.addPopup(oPopup);
    },

    /**
     * Method: removeInfoPopup
     * Remove the popup of feature when the mouse is no longer hover it.
     *
     * Parameters:
     * feature - {OpenLayers.Feature}
     */
    removeInfoPopup: function(feature) {
        this.map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    },

    /**
     * Method: activate
     * Activates the control.
     * 
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate: function () {
        if (!this.active) {
            if(this.layers) {
                this.map.addLayer(this.layer);
            }
        }
        return OpenLayers.Control.prototype.activate.apply(
            this, arguments
        );
    },

    /**
     * Method: deactivate
     * Deactivates a control and it's associated handler if any.  The exact
     * effect of this depends on the control itself.
     * 
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function () {
        if (this.active) {
            if (this.handler) {
                this.handler.deactivate();
            }
            this.active = false;
            if(this.feature){
                this.resetFeature();
            }
            this.events.triggerEvent("deactivate");
            return true;
        }
        return false;
    },
    CLASS_NAME: "OpenLayers.Control.HighlightFeature"
});

