<div>

    <h2>{@admin~lizmap_search.page.show.title@}</h2>
    {assign $usedProfile = 'default'}
    {assign $btnLocale = 'admin~lizmap_search.button.profile.create'}
    {if $hasDedicatedProfile}
        {assign $usedProfile = 'dedicated'}
        {assign $btnLocale = 'admin~lizmap_search.button.profile.edit'}
    {/if}
    {if $isConfOk }
        {@admin~lizmap_search.content.all_ok@}
        {@admin~lizmap_search.content.profile.$usedProfile@}
        {* allow to create/edit profile*}
    {else}
        {if $hasDedicatedProfile}

            {@admin~lizmap_search.content.profile.dedicated.fail@}
            <br>
            {* display readonly form *}
            {formdata $form ,'htmlbootstrap', array()}
            <table class="table services-table">
                {formcontrols}
                <tr>
                    <th>{ctrl_label}</th>
                    <td>{ctrl_value}</td>
                </tr>
                {/formcontrols}
            </table>
            {/formdata}
        {else}
            {@admin~lizmap_search.content.profile.default.fail@}
        {/if}
    {/if}

    <p>
        <a href="{jurl 'admin~lizmap_search:edit'}" class="btn">{jlocale $btnLocale}</a>
    </p>
</div>
