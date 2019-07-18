

export default class LizmapLayer {
    constructor(layerId, name, visible) {

        this._layerId = layerId;
        this._layerName = name;
        this._visible = visible;
    }

    get layerId() {
        return this._layerId;
    }

    get layerName() {
        return this._layerName;
    }

    get visible() {
        return this._visible;
    }

    set visible(val) {
        this._visible = val;
    }


}