<div class="lizmapPopupSingleFeature" {if $featureId}data-feature-id="{$featureId}"{/if} {if $featureDisplayName}data-feature-display-name="{$featureDisplayName|eschtml}"{/if} data-layer-id="{$layerId}">
    <h4 class="lizmapPopupTitle">{$layerTitle}</h4>

    <div class="lizmapPopupDiv">
    {$popupContent}
    </div>
</div>
