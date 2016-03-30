    {jmessage}
    {if $gbList }
    <b>{@view~map.permalink.geobookmark.title@}</b>
      <div>
        {if $gbCount > 0 }

        <table class="table table-condensed table-stipped">
          {foreach $gbList as $gb}
          <tr>
            <th>{$gb->name}</th>
            <th>
              <button class="btn-geobookmark-del btn btn-mini" value="{$gb->id}" title="{@view~map.permalink.geobookmark.button.del@}"><i class="icon-remove"></i></button>
              <button class="btn-geobookmark-run btn btn-mini" value="{$gb->id}" title="{@view~map.permalink.geobookmark.button.run@}"><i class="icon-zoom-in"></i></button>
            </th>
          </tr>
          {/foreach}
        </table>

        {else}
          {@view~map.permalink.geobookmark.none@}
        {/if}

      </div>

    {/if}
