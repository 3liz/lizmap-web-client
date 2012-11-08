{meta_html css $j_jelixwww.'design/jelix.css'}

<div id="page">
    <div class="logo">Propulsée par <img src="{$j_jelixwww}design/images/logo_jelix_100.png" alt="jelix"/></div>

    <div class="nocss">
        <hr />
        <p>Si vous voyez ce message, c'est que vous n'avez pas rendu accessible
          les fichiers web (js et css) de Jelix. Deux solutions&nbsp;:</p>
        <ul>
            <li>vous pouvez configurer votre virtualhost et créer un alias
            <em>{$j_basepath}jelix/</em> pointant vers <em>lib/jelix-www/</em></li>
            <li>sinon copiez/collez le dossier <em>lib/jelix-www/</em>
            dans le dossier <em>{$wwwpath}</em> et renommez le en 'jelix'</li>
        </ul>
        <p>Si vous voulez utiliser un autre nom que jelix pour ce dossier,
           modifier le paramêtre <code>jelixWWWPath</code>
           dans <em>{$configpath}defaultconfig.ini.php</em>.</p>
        <p>Pour plus d'informations, consultez
             <a href="http://docs.jelix.org/fr/manuel-1.4/configurer-server"
             title="documentation officielle">la documentation sur l'installation de Jelix</a>.</p>
        <hr />
    </div>

    <div class="block">
        <h2>Vérification de l'installation</h2>
        <div class="blockcontent">
            {$check}
        </div>
    </div>

    <div class="block">
        <h2>Ceci est une page temporaire</h2>
        <div class="blockcontent">
            <p>Cette page est affichée par le contrôleur <em>default.classic.php</em>
            présent dans le module de votre application.
            Ce contrôleur utilise une 'zone' fournie par Jelix. Vous devrez le modifier de
            manière à afficher votre propre page de démarrage.</p>
        </div>
    </div>

    <div class="block">
        <h2>Que faire maintenant ?</h2>
        <div class="blockcontent">
            <ul>
                <li><a href="http://jelix.org" title="Site officiel de Jelix">Visitez le site de Jelix</a></li>
                <li><a href="http://jelix.org/articles/fr/tutoriels">Suivez les tutoriels</a></li>
                <li><a href="http://docs.jelix.org/fr/manuel-1.4">Lisez la documentation de Jelix</a></li>
                <li><a href="http://jelix.org/forums/forum/cat/1-francais">Posez vos questions dans les forums</a></li>
            </ul>
        </div>
    </div>

    <div id="jelixpowered"><img src="{$j_jelixwww}design/images/jelix_powered.png" alt="jelix powered" /></div>
</div>
