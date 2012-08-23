<div id="header">
    <div id="top">{if $adminTitle}{$adminTitle|eschtml}{else}{@master_admin~gui.header.title@}{/if}</div>

    <div id="info-box">
        {$INFOBOX}
    </div>
</div>
<div id="main">
    <div id="menu">
        {$MENU}
    </div>

    <div id="content">
        <div id="admin-message">{jmessage}</div>
        {if $MAIN}{$MAIN}{else}<p>{@master_admin~gui.main.nocontent@}</p>{/if}
    </div>
    <div class="clear"></div> 
</div>

<div id="footer">
   <a href="http://jelix.org"><img src="{$j_jelixwww}/design/images/jelix_powered.png" alt="Powered by Jelix" title="Powered by Jelix"/></a>
</div>