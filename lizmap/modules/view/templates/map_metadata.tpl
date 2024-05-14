    <div>
      <div>
        <p>
          <img src="{jurl 'view~media:illustration', array('repository'=>$repository,'project'=>$project)}" alt="project image" class="img-polaroid liz-project-img" width="200" height="200" loading="lazy">


          <dl class="dl-vertical">
            {if $WMSServiceTitle}
            <dt>{@view~map.metadata.description.title@}</dt>
            <dd>{$WMSServiceTitle}&nbsp;</dd>
            <br/>
            {/if}

            {if $WMSServiceAbstract}
            <dt>{@view~map.metadata.description.abstract@}</dt>
            <dd>{$WMSServiceAbstract|nl2br}&nbsp;</dd>
            <br/>
            {/if}

            {if $WMSContactOrganization}
            <dt>{@view~map.metadata.contact.organization@}</dt>
            <dd>{$WMSContactOrganization}&nbsp;</dd>
            <br/>
            {/if}

            {if $WMSContactPerson}
            <dt>{@view~map.metadata.contact.person@}</dt>
            <dd>{$WMSContactPerson}&nbsp;</dd>
            <br/>
            {/if}

            {if $WMSContactMail}
            <dt>{@view~map.metadata.contact.email@}</dt>
            <dd>{$WMSContactMail|replace:'@':' (at) '}&nbsp;</dd>
            <br/>
            {/if}

            {if $WMSContactPhone}
            <dt>{@view~map.metadata.contact.phone@}</dt>
            <dd>{$WMSContactPhone}&nbsp;</dd>
            <br/>
            {/if}

            {if $WMSOnlineResource}
            <dt>{@view~map.metadata.resources.website@}</dt>
            <dd><a href="{$WMSOnlineResource}" target="_blank">{$WMSOnlineResource}</a></dd>
            <br/>
            {/if}

            <dt>{@view~map.metadata.properties.projection@}</dt>
            <dd><small class="proj">{$ProjectCrs}&nbsp;</small></dd>
            <br/>
            <dt>{@view~map.metadata.properties.extent@}</dt>
            <dd><small class="bbox">{$WMSExtent}</small></dd>
            <br/>

            {if $wmsGetCapabilitiesUrl}
            <dt>{@view~map.metadata.properties.wmsGetCapabilitiesUrl@}</dt>
            <dd><small><a href="{$wmsGetCapabilitiesUrl}" target="_blank">WMS Url</a></small></dd>
            <dd><small><a id="metadata-wmts-getcapabilities-url" href="{$wmtsGetCapabilitiesUrl}" target="_blank">WMTS Url</a></small></dd>
            <br/>
            {/if}
          </dl>
        </p>
      </div>
    </div>
