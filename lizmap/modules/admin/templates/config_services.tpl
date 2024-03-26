{meta_html js $j_basepath.'assets/js/services_configuration.js', ['defer' => '']}

{jmessage_bootstrap}

<h1>{@admin~admin.form.admin_services.h1@}</h1>
{form $form, 'admin~config:saveServices', array(), 'htmlbootstrap'}
    <div>
        <h2>{@admin~admin.configuration.services.section.interface.label@}</h2>
        <table class="table services-table">
            {formcontrols array('appName', 'onlyMaps', 'projectSwitcher', 'googleAnalyticsID')}
                <tr>
                    <th>{ctrl_label}</th><td>{ctrl_control}</td>
                </tr>
            {/formcontrols}
        </table>
    </div>

    <div>
        <h2>{@admin~admin.configuration.services.section.emails.label@}</h2>
        {if $showSystem}
            <p>{@admin~admin.form.admin_services.emails.help@}</p>
            {if !$smtpEnabled}
                <p>{@admin~admin.form.admin_services.emails.server.help@}</p>
            {/if}
        {else}
            {if !$hasSenderEmail}
                <p>{@admin~admin.form.admin_services.emails.no.server@}</p>
            {/if}
        {/if}
        <table class="table services-table">
            {formcontrols array( 'adminSenderEmail', 'adminSenderName', 'allowUserAccountRequests', 'adminContactEmail')}
                <tr>
                    <th>{ctrl_label}</th><td>{ctrl_control}</td>
                </tr>
            {/formcontrols}
        </table>
    </div>

    <div>
        <h2>{@admin~admin.configuration.services.section.projects.label@}</h2>
        <table class="table services-table">
            {formcontrols array('defaultRepository', 'defaultProject', 'rootRepositories')}
                <tr>
                    <th>{ctrl_label}</th><td>{ctrl_control}</td>
                </tr>
            {/formcontrols}
        </table>
    </div>

    <div>
        <h2>{@admin~admin.configuration.services.section.features.label@}</h2>
        <table class="table services-table">
            {formcontrols array('uploadedImageMaxWidthHeight')}
                <tr>
                    <th>{ctrl_label}</th><td>{ctrl_control}</td>
                </tr>
            {/formcontrols}
        </table>
    </div>


{if $showSystem}
    <div>
        <h2>{@admin~admin.configuration.services.section.cache.label@}</h2>
        <table class="table services-table">
            {formcontrols array('cacheStorageType', 'cacheRootDirectory', 'cacheRedisHost', 'cacheRedisPort', 'cacheRedisDb', 'cacheRedisKeyPrefix', 'cacheExpiration')}
                <tr>
                    <th>{ctrl_label}</th><td>{ctrl_control}</td>
                </tr>
            {/formcontrols}
        </table>
    </div>

    <div>
        <h2>{@admin~admin.configuration.services.section.qgis.label@}</h2>
        <table class="table services-table">
            {formcontrols array('wmsServerURL', 'wmsPublicUrlList', 'relativeWMSPath', 'wmsMaxWidth', 'wmsMaxHeight', 'lizmapPluginAPIURL')}
                <tr>
                    <th>{ctrl_label}</th><td>{ctrl_control}</td>
                </tr>
            {/formcontrols}
        </table>
    </div>


    <div>
        <h2>{@admin~admin.configuration.services.section.system.label@}</h2>
        <table class="table services-table">
            {formcontrols array('debugMode', 'requestProxyEnabled')}
                <tr>
                    {ifctrl 'requestProxyEnabled'}
                        <td colspan="2">{ctrl_control}</td>
                    {else}
                    <th>{ctrl_label}</th><td>{ctrl_control}</td>
                    {/ifctrl}
                </tr>
            {/formcontrols}
        </table>
    </div>
{/if}
    {* be sure all remaining controls not in the previous loops are displayed here *}
    <table class="table services-table">
        {formcontrols}
            <tr>
                <th>{ctrl_label}</th><td>{ctrl_control}</td>
            </tr>
        {/formcontrols}
    </table>


<div>
    <a class="btn" href="{jurl 'admin~config:index'}">{@admin~admin.configuration.button.back.label@}</a>
    {formsubmit}
</div>

{/form}
