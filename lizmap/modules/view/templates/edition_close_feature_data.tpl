<ul class="jelix-msg">
    <li class="jelix-msg-item-success">{$closeFeatureMessage}</li>
</ul>

<form class="liz_close_feature_form" style="display: none;">
    <input type="hidden" id="liz_close_feature_message" name="liz_close_feature_message" value="{$closeFeatureMessage}">
    <input type="hidden" id="liz_close_feature_pk_vals" name="liz_close_feature_pk_vals" value="{$pkValsJson|eschtml}">
</form>
