<div class='popupAllFeaturesCompact' style="display: none;">
    <h4>{$layerTitle}</h4>

    <table class='table table-condensed table-striped table-bordered lizmapPopupTable'>
        <thead>
            {foreach $allFeatureAttributes as $featureAttributes}
            <tr>
                {foreach $featureAttributes as $attribute}
                    {if $attribute['name'] != 'geometry' && $attribute['name'] != 'maptip' && $attribute['value'] != ''}
                        <th>{$attribute['name']}</th>
                    {/if}
                {/foreach}
            </tr>
            {break}
            {/foreach}
        </thead>

        <tbody>
            {foreach $allFeatureAttributes as $featureAttributes}
                <tr>
                {foreach $featureAttributes as $attribute}
                    {if $attribute['name'] != 'geometry' && $attribute['name'] != 'maptip' && $attribute['value'] != ''}
                        <td>{$attribute['name']|featurepopup:$attribute['value'],$repository,$project}</td>
                    {/if}
                {/foreach}
                </tr>
            {/foreach}
        </tbody>
    </table>
</div>
