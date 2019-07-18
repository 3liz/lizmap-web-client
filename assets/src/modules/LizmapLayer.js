

export default class LizmapLayer {
    constructor(layerId, visible) {

        this._layerId = layerId;
        this._visible = visible;
    }

    get layerId() {
        return this._layerId;
    }

    get visible() {
        return this._visible;
    }
}