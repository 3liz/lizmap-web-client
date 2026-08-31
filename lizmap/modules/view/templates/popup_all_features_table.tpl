<div class='popupAllFeaturesCompact' style="display: none;">
    <h4>{$layerTitle}</h4>

    <table class='table table-condensed table-striped table-bordered lizmapPopupTable'>
        <thead>
            <tr>
                <th></th>
                {foreach $allFeatureColumns as $column}
                    <th>{$column}</th>
                {/foreach}
            </tr>
        </thead>

        <tbody>
            {foreach $allFeatureRows as $key=>$row}
                <tr>
                <td>{$allFeatureToolbars[$key]}</td>
                {foreach $row as $name=>$value}
                    <td>{$name|popupcheckbox:$value,$repository,$project,$checkBoxFields,$remoteStorageProfile}</td>
                {/foreach}
                </tr>
            {/foreach}
        </tbody>
    </table>
</div>
