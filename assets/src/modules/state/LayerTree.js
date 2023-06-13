
import { LayerStyleConfig } from './../config/LayerTree.js';

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
        this._checked = this.__parentLayerTreeGroup == null ? true : false;
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
        this._checked = val;
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

}
