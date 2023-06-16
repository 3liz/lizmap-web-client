import { ValidationError } from './../Errors.js';
import { LayerStyleConfig } from './../config/LayerTree.js';
import { getDefaultLayerIcon, LayerIconSymbology, LayerSymbolsSymbology, LayerGroupSymbology, buildLayerSymbology } from './Symbology.js';

export class LayerTreeItem {

    /**
     * @param {String} type                                - the layer tree item type
     * @param {LayerTreeItemConfig} layerTreeItemCfg       - the layer tree item config
     * @param {LayerTreeItem}       [parentLayerTreeGroup] - the parent layer tree group
     */
    constructor(type, layerTreeItemCfg, parentLayerTreeGroup) {
        this._type = type
        this._layerTreeItemCfg = layerTreeItemCfg;
        this._parentLayerTreeGroup = null;
        if (parentLayerTreeGroup instanceof LayerTreeItem
            && parentLayerTreeGroup.type == 'group') {
            this._parentLayerTreeGroup = parentLayerTreeGroup;
        }
        this._checked = this._parentLayerTreeGroup == null ? true : false;
    }
    /**
     * Config layers
     *
     * @type {String}
     **/
    get name() {
        return this._layerTreeItemCfg.name;
    }

    /**
     * Config layers
     *
     * @type {String}
     **/
    get type() {
        return this._type;
    }

    /**
     * the layer tree item level
     *
     * @type {Number}
     **/
    get level() {
        return this._layerTreeItemCfg.level;
    }

    /**
     * WMS layer name
     *
     * @type {?String}
     **/
    get wmsName() {
        return this._layerTreeItemCfg.wmsName;
    }

    /**
     * WMS layer title
     *
     * @type {String}
     **/
    get wmsTitle() {
        return this._layerTreeItemCfg.wmsTitle;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        return this._layerTreeItemCfg.wmsGeographicBoundingBox;
    }

    /**
     * WMS layer Bounding Boxes
     *
     * @type {LayerBoundingBoxConfig[]}
     **/
    get wmsBoundingBoxes() {
        return this._layerTreeItemCfg.wmsBoundingBoxes;
    }

    /**
     * Layer tree item is checked
     *
     * @type {Boolean}
     **/
    get checked() {
        return this._checked;
    }

    /**
     * Set layer tree item is checked
     *
     * @type {Boolean}
     **/
    set checked(val) {
        if (this._checked == val) {
            return;
        }
        this._checked = val;
        if (this._checked && this._parentLayerTreeGroup != null) {
            this._parentLayerTreeGroup.checked = val;
        }
    }

    /**
     * Layer tree item is visible
     * It depends on the parent visibility
     *
     * @type {Boolean}
     **/
    get visibility() {
        // if the item has no parent item like root
        // it is visible
        if (this._parentLayerTreeGroup == null) {
            return true;
        }
        // if the parent layer tree group is visible
        // the visibility depends if the layer tree item is checked
        // else the layer tree item is not visible
        if (this._parentLayerTreeGroup.visibility) {
            return this._checked;
        }
        return false;
    }

    /**
     * Lizmap layer config
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._layerTreeItemCfg.layerConfig;
    }
}

export class LayerTreeGroup extends LayerTreeItem {

    /**
     * @param {LayerTreeGroupConfig} layerTreeGroupCfg    - the layer tree group config
     * @param {LayerTreeGroup}       [parentLayerTreeGroup] - the parent layer tree group
     */
    constructor(layerTreeGroupCfg, parentLayerTreeGroup) {
        super('group', layerTreeGroupCfg, parentLayerTreeGroup);
        this._items = [];
        for (const layerTreeItem of layerTreeGroupCfg.getChildren()) {
            if (layerTreeItem.name.toLowerCase() == 'hidden') {
                continue;
            }
            if (layerTreeItem.name.toLowerCase() == 'overview' && layerTreeItem.level == 1) {
                continue;
            }
            if (layerTreeItem.name.toLowerCase() == 'baselayers' && layerTreeItem.level == 1) {
                continue;
            }

            const cfg = layerTreeItem.layerConfig;
            if (cfg == null) {
                throw new RangeError('The layer `'+ layerTreeItem.name +'` has no config!');
            }
            if (!cfg.displayInLegend) {
                continue;
            }

            if ((layerTreeItem.type == 'layer'  && cfg.displayInLegend && !cfg.baseLayer)
                || (cfg.groupAsLayer && layerTreeItem.childrenCount() != 0)) {
                // Build layer
                const layer = new LayerTreeLayer(layerTreeItem, this)
                this._items.push(layer);
                // Group is checked if one child is checked
                if (layer.checked) {
                    this._checked = true;
                }
            } else {
                // Build group
                const group = new LayerTreeGroup(layerTreeItem, this);
                // If the group is empty do not keep it
                if (group.childrenCount == 0) {
                    continue;
                }
                this._items.push(group);
                // Group is checked if one child is checked
                if (group.checked) {
                    this._checked = true;
                }
            }
        }
    }

    /**
     * The layer mutually exclusive activation (group only)
     *
     * @type {Boolean}
     **/
    get mutuallyExclusive() {
        if (this.layerConfig == null) {
            return false;
        }
        return this.layerConfig.mutuallyExclusive;
    }

    /**
     * Children items count
     *
     * @type {Number}
     **/
    get childrenCount() {
        return this._items.length;
    }

    /**
     * Children items
     *
     * @type {LayerTreeItem[]}
     **/
    get children() {
        return [...this._items];
    }

    /**
     * Iterate through children items
     *
     * @generator
     * @yields {LayerTreeItem} The next child item
     **/
    *getChildren() {
        for (const item of this._items) {
            yield item;
        }
    }

    /**
     * Find layer names
     *
     * @returns {String[]}
     **/
    findTreeLayerNames() {
        let names = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerTreeLayer) {
                names.push(item.name);
            } else if (item instanceof LayerTreeGroup) {
                names = names.concat(item.findTreeLayerNames());
            }
        }
        return names;
    }

    /**
     * Find layer items
     *
     * @returns {LayerTreeLayer[]}
     **/
    findTreeLayers() {
        let items = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerTreeLayer) {
                items.push(item);
            } else if (item instanceof LayerTreeGroup) {
                items = items.concat(item.findTreeLayers());
            }
        }
        return items;
    }
}

export class LayerTreeLayer extends LayerTreeItem {

    /**
     * @param {LayerTreeLayerConfig|LayerTreeGroupConfig} layerTreeItemCfg       - the layer tree group config
     * @param {LayerTreeGroup}                            [parentLayerTreeGroup] - the parent layer tree group
     */
    constructor(layerTreeItemCfg, parentLayerTreeGroup) {
        super('layer', layerTreeItemCfg, parentLayerTreeGroup);
        if (this.layerConfig.toggled) {
            this._checked = true;
        }
        this._icon = getDefaultLayerIcon(this.layerConfig);
        // set default style
        this._wmsSelectedStyleName = this.wmsStyles[0].wmsName;
        // set symbology to null
        this._symbology = null;
    }

    /**
     * The source icon of the layer
     *
     * @type {string}
     **/
    get icon() {
        if (this._symbology instanceof LayerIconSymbology) {
            return this._symbology.icon;
        }
        return this._icon;
    }

    /**
     * WMS selected layer style name
     *
     * @type {String}
     **/
    get wmsSelectedStyleName() {
        return this._wmsSelectedStyleName;
    }

    /**
     * WMS layer styles
     *
     * @type {LayerStyleConfig[]}
     **/
    get wmsStyles() {
        if ( this._layerTreeItemCfg.type == 'layer' ) {
            return this._layerTreeItemCfg.wmsStyles;
        }
        return [new LayerStyleConfig('', '')];
    }

    /**
     * WMS layer attribution
     *
     * @type {?AttributionConfig}
     **/
    get wmsAttribution() {
        if ( this._layerTreeItemCfg.type == 'layer' ) {
            return this._layerTreeItemCfg.wmsAttribution;
        }
        return null;
    }

    /**
     * Layer symbology
     *
     * @type {?(LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)}
     **/
    get symbology() {
        return this._symbology;
    }

    /**
     * Update layer symbology
     *
     * @param {(Object|LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)} node - The symbology node
     **/
    set symbology(node) {
        if (!node.hasOwnProperty('name')) {
            throw new ValidationError('Node symbology required `name` property!');
        }
        if (node.name != this.name) {
            throw new ValidationError('The node symbology does not correspond to the layer! The node name is `'+node.name+'` != `'+this.name+'`');
        }
        this._symbology = buildLayerSymbology(node);
    }

    /**
     * Children symbology count
     *
     * @type {Number}
     **/
    get symbologyChildrenCount() {
        if (this._symbology instanceof LayerSymbolsSymbology
            || this._symbology instanceof LayerGroupSymbology) {
            return this._symbology.childrenCount;
        }
        return 0;
    }

    /**
     * Children symbology
     *
     * @type {(SymbolIconSymbology|BaseIconSymbology|BaseSymbolsSymbology)[]}
     **/
    get symbologyChildren() {
        if (this._symbology instanceof LayerSymbolsSymbology
            || this._symbology instanceof LayerGroupSymbology) {
            return this._symbology.children;
        }
        return [];
    }


    /**
     * Iterate through children nodes
     *
     * @generator
     * @yields {SymbolIconSymbology|BaseIconSymbology|BaseSymbolsSymbology} The next child node
     **/
    *getSymbologyChildren() {
        if (this._symbology instanceof LayerSymbolsSymbology
            || this._symbology instanceof LayerGroupSymbology) {
            for (const symbol of this._symbology.getChildren()) {
                yield symbol;
            }
        } else {
            for (const symbol of this.symbologyChildren) {
                yield symbol;
            }
        }
    }
}
