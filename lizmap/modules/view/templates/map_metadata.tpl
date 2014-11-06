    <div class="row">
      <div class="span4 offset1">
        <h2>{@view~map.metadata.h2.illustration@}</h2>
        <p>
          <img src="{jurl 'view~media:illustration', array('repository'=>$repository,'project'=>$project)}" alt="project image" class="img-polaroid liz-project-img">
        </p>
      </div>

      <div class="span5 offset1">
        <h2>{@view~map.metadata.h2.description@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.description.title@}</dt>
            <dd>{$WMSServiceTitle}&nbsp;</dd>
            <dt>{@view~map.metadata.description.abstract@}</dt>
            <dd>{$WMSServiceAbstract|nl2br}&nbsp;</dd>
          </dl>
        </p>
      </div>

      <div class="span4 offset1">
        <h2>{@view~map.metadata.h2.properties@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.properties.projection@}</dt>
            <dd><small class="proj">{$ProjectCrs}&nbsp;</small></dd>
            <dt>{@view~map.metadata.properties.extent@}</dt>
            <dd><small class="bbox">{$WMSExtent}</small></dd>
          </dl>
        </p>
      </div>
    </div>

    <div class="row">
      <div class="span5 offset1">
        <h2>{@view~map.metadata.h2.contact@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.contact.organization@}</dt>
            <dd>{$WMSContactOrganization}&nbsp;</dd>
            <dt>{@view~map.metadata.contact.person@}</dt>
            <dd>{$WMSContactPerson}&nbsp;</dd>
            <dt>{@view~map.metadata.contact.email@}</dt>
            <dd>{$WMSContactMail|replace:'@':' (at) '}&nbsp;</dd>
            <dt>{@view~map.metadata.contact.phone@}</dt>
            <dd>{$WMSContactPhone}&nbsp;</dd>
          </dl>
        </p>
      </div>
      <div class="span7">
        <h2>{@view~map.metadata.h2.resources@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.resources.website@}</dt>
            <dd><a href="{$WMSOnlineResource}" target="_blank">{$WMSOnlineResource}</a></dd>

            {if $wmsGetCapabilitiesUrl}
            <dt>{@view~map.metadata.properties.wmsGetCapabilitiesUrl@}</dt>
            <dd><small><a href="{$wmsGetCapabilitiesUrl}" target="_blank">WMS Url</a></small></dd>
            {/if}
          </dl>
        </p>
      </div>
    </div>
    <!--div class="row">
      <div class="span4 offset8">
        <span class="btn" id="hideMetadata">{@view~map.metadata.hide@}</span>
      </div>
    </div-->
