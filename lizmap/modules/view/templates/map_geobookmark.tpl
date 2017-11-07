    {jmessage}
    {if $gbList }
    {@view~map.permalink.geobookmark.title@}
      <div>
        {if $gbCount > 0 }

        <table class="table table-condensed table-stipped">
          {foreach $gbList as $gb}
          <tr>
            <td>{$gb->name}</td>
            <td>
              <button class="btn-geobookmark-del btn btn-mini" value="{$gb->id}" title="{@view~map.permalink.geobookmark.button.del@}"><i class="icon-remove"></i></button>
              <button class="btn-geobookmark-run btn btn-mini" value="{$gb->id}" title="{@view~map.permalink.geobookmark.button.run@}"><i class="icon-zoom-in"></i></button>
            </td>
          </tr>
          {/foreach}
        </table>

        {else}
          {@view~map.permalink.geobookmark.none@}
        {/if}

      </div>

    {/if}
