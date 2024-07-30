    {jmessage}
    {if $gbList }
      <div id="geobookmark-title">
      {@view~map.permalink.geobookmark.title@}
      </div>
      <div>
        {if $gbCount > 0 }

        <table class="table table-condensed table-stipped">
          {foreach $gbList as $gb}
          <tr>
            <td>{$gb->name}</td>
            <td>
              <button class="btn-geobookmark-del btn btn-sm" value="{$gb->id}" title="{@view~map.permalink.geobookmark.button.del@}"><i class="icon-remove"></i></button>
              <a class="btn-geobookmark-run btn btn-sm" href="{$gb->params|json_decode:"hash"}" title="{@view~map.permalink.geobookmark.button.run@}"><i class="icon-zoom-in"></i></a>
            </td>
          </tr>
          {/foreach}
        </table>

        {else}
          <div id="geobookmark-none">
          {@view~map.permalink.geobookmark.none@}
          </div>
        {/if}

      </div>

    {/if}
