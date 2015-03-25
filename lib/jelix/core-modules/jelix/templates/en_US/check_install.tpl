{meta_html css $j_jelixwww.'design/jelix.css'}

<div id="page">
    <div class="logo">Powered by <img src="{$j_jelixwww}design/images/logo_jelix_100.png" alt="Jelix"/></div>

    <div class="nocss">
        <hr />
        <p>If you see this message, it's because you didn't set correctly the
        access to web files of Jelix (js and css). Two solutions:</p>
        <ul>
            <li>You can configure your virtualhost to create an alias
                <em>{$j_basepath}jelix/</em> to <em>lib/jelix-www/</em></li>
            <li>Otherwise copy/past the <em>lib/jelix-www/</em> directory in
                <em>{$wwwpath}</em> and rename it to 'jelix'</li>
        </ul>
        <p>If you want to use another name for the Jelix's web file directory,
            modify the <code>jelixWWWPath</code> parameter in
            <em>{$configpath}mainconfig.ini.php</em>.</p>
        <p>For more informations, see <a href="http://docs.jelix.org/en/manual-1.6/server-configuration"
            title="installation documentation">the installation documentation</a> of Jelix.</p>
        <hr />
    </div>

    <div class="block">
        <h2>Installation check</h2>
        <div class="blockcontent">
            {$check}
        </div>
    </div>

    <div class="block">
        <h2>This is a temporary page</h2>
        <div class="blockcontent">
            <p>This page is displayed by the <em>default.classic.php</em> controller stored in the module of your application.
                This controller uses a 'zone' provided by Jelix. You should modify this controller so it could display
                your own start page.</p>
        </div>
    </div>

    <div class="block">
        <h2>What to do now ?</h2>
        <div class="blockcontent">
            <ul>
                <li><a href="http://www.jelix.org">Visit the Official Jelix's site</a></li>
                <li><a href="http://jelix.org/articles/en/tutorials">Learn with tutorials</a></li>
                <li><a href="http://docs.jelix.org/en/manual-1.6">Read the documentation of Jelix</a></li>
                <li><a href="http://jelix.org/forums/forum/cat/2-english">Ask your questions in forums</a></li>
            </ul>
        </div>
    </div>

    <div id="jelixpowered"><img src="{$j_jelixwww}design/images/jelix_powered.png" alt="jelix powered" /></div>
</div>
