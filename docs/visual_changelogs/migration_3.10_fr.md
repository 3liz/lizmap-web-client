# Lizmap 3.9 → 3.10 : migrer ses scripts JavaScript et ses popups HTML

Lizmap Web Client 3.10 apporte deux types de changements pour les personnes qui ont ajouté leur propre code à Lizmap :

* **JavaScript** : la séquence de démarrage a changé, certaines API publiques ont été modifiées et de nouveaux outils
  sont disponibles (Partie 1) ;
* **Bootstrap 5** : Lizmap remplace **Bootstrap 2.3.2** par **Bootstrap 5.3**. Toute l'interface a été migrée :
  modèles HTML, JavaScript, CSS et formulaires (Partie 2).

Ce guide s'adresse à toute personne qui a ajouté son propre code dans Lizmap :

* des **scripts JavaScript** déposés dans le dossier `media/js/` d'un répertoire ou d'un projet ;
* du **HTML dans les popups** (info-bulles / *maptips* QGIS, modèles de popup, modèles HTML de dataviz) ;
* du **CSS personnalisé** qui cible des éléments de l'interface.

Il liste ce qu'il faut rechercher dans votre code et par quoi le remplacer.

> **Méthode conseillée** : ouvrez la console du navigateur (F12), puis cherchez dans vos fichiers
> les termes des colonnes « Lizmap 3.9 » et « Bootstrap 2 » des tableaux ci-dessous
> (`waitForObject`, `data-toggle`, `span6`, `pull-right`, `btn-mini`, `control-group`…).

---

# Partie 1 — JavaScript

## 1. Ce qui a changé au démarrage : bien attendre Lizmap

La séquence de démarrage de Lizmap a été revue en 3.10. Sa principale conséquence pour les scripts externes
(`media/js/…`) est la suivante :

* En 3.9, l'objet `lizMap.mainLizmap` n'apparaissait qu'une fois la configuration du projet chargée.
  Beaucoup de scripts l'attendaient donc avec une boucle `setInterval`.
* En 3.10, **`lizMap.mainLizmap` existe avant le chargement de la configuration** :
  `lizMap.mainLizmap.state`, `lizMap.mainLizmap.map`, `lizMap.mainLizmap.popup`… sont encore `undefined` à ce moment-là.
  Un script qui attend seulement `lizMap.mainLizmap` peut démarrer trop tôt et échouer de façon aléatoire,
  selon la vitesse du réseau.

Pour corriger cela, Lizmap 3.10 ajoute **`lizMap.subscribe(callback, nomEvenement)`** :

* elle peut être appelée dès le chargement du script ;
* si l'événement **a déjà été émis**, le callback est exécuté immédiatement avec le dernier événement ;
* dans les deux cas, le callback est ensuite exécuté à nouveau à chaque émission de l'événement.
  Pour les événements émis plusieurs fois (§4.3), utilisez `lizMap.mainEventDispatcher.addListener()`
  dans votre fonction d'initialisation si vous ne voulez que les prochaines émissions.

C'est la méthode conseillée pour démarrer un script externe.

### 1.1 Les événements de démarrage, dans l'ordre

Le tableau ci-dessous indique ce qui est disponible à chaque événement de démarrage de Lizmap 3.10.

| Événement | Comment l'écouter | Disponible à ce moment |
|---|---|---|
| `lizmap.configsloaded` | `lizMap.subscribe(cb, 'lizmap.configsloaded')` | `mainLizmap.initialConfig`, `mainLizmap.state`. Les configurations sont dans `event.configs`. |
| `mapcreated`, `layersadded`, `toolbarcreated` | `lizMap.events.on({…})` (historique) | Idem, plus l'ancienne carte OpenLayers 2 `lizMap.map` |
| `uicreated` | `lizMap.events.on({uicreated: cb})` (historique) | Idem, plus la carte OpenLayers 10 `mainLizmap.map`. ⚠️ `mainLizmap.popup`, `action`, `edition`, `digitizing`, `selectionTool`, `legend`… **ne sont pas encore créés**. |
| `lizmap.modules.initialized` | `lizMap.subscribe(cb, 'lizmap.modules.initialized')` | Tous les modules de `mainLizmap` |
| **`lizmap.uicreated`** (nouveau) | `lizMap.subscribe(cb, 'lizmap.uicreated')` | **Tout** : les modules et les composants d'interface (éléments `lizmap-*`). **Événement conseillé pour démarrer un script.** |

Les événements historiques (`configsloaded`, `mapcreated`, `uicreated`, `lizmappopupdisplayed`, `layerSelectionChanged`, `dockopened`,
`attributeLayerContentReady`, `lizmapeditionformdisplayed`…) **sont toujours émis**, et les écouter
avec `lizMap.events.on()` reste valable. Les événements de démarrage (de `configsloaded` à `uicreated`) doivent être écoutés
dès le chargement du script. Écoutez les autres (popup, sélection, panneaux…) **à l'intérieur** de votre fonction d'initialisation.

## 2. Modèle de script pour la 3.10

Beaucoup de scripts de la communauté utilisent le modèle ci-dessous : une boucle attend `lizMap.mainLizmap`, puis
appelle `init()`.

**Modèle utilisé jusqu'à la 3.9** (n'est plus fiable en 3.10)
```js
var lizMyTool = function () {
    function init() {
        // …
    }

    // Wait for lizMap and mainLizmap objects to be available
    function waitForObject() {
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                if (lizMap && lizMap.mainLizmap) {
                    clearInterval(intervalId);
                    resolve(true);
                }
            }, 200);
        });
    }

    waitForObject().then(() => {
        init();
    });

    return {};
}();
```

**Modèle pour la 3.10**, également compatible avec la 3.9 : la boucle est remplacée par `lizMap.subscribe()`.

```js
/**
 * @license Mozilla Public License Version 2.0
 * This script has been developed by the "community"
 * There isn't any guarantee that this script will work on another version of Lizmap Web Client.
 */

var lizMyTool = function () {

    // Title of the menu item
    const MENU_TITLE = 'Links';

    /**
     * Initialize the tool, once Lizmap is fully loaded.
     * @param {object} event - The Lizmap event which triggered the initialization
     */
    function init(event) {
        // All Lizmap modules are available here,
        // e.g. lizMap.mainLizmap.map (OpenLayers 10), lizMap.mainLizmap.state…
        addInterface();

        // Listen to Lizmap legacy events
        lizMap.events.on({
            lizmappopupdisplayed: function (e) {
                console.log('The popup has been displayed');
            }
        });

        // Listen to events from the map state (modern modules)
        lizMap.mainLizmap.state.rootMapGroup.addListener(
            (e) => console.log(`Layer ${e.name} visibility: ${e.visibility}`),
            'layer.visibility.changed'
        );
    }

    /**
     * Add the user interface: a dock with some HTML content.
     */
    function addInterface() {
        const textContent = `
            <b>Test</b>
            <p>Some text to display in the dock</p>
        `;
        lizMap.addDock('mylinks', MENU_TITLE, 'dock', textContent, 'icon-hand-right');

        // Move the map menu item to the bottom
        $('#mapmenu li.mylinks').appendTo('#mapmenu ul');
    }

    /**
     * Run the callback once the Lizmap interface and modules are ready.
     * It works whatever the moment the script is loaded.
     * @param {Function} callback - The function to run
     */
    function onLizmapReady(callback) {
        if (typeof lizMap.subscribe === 'function') {
            // Lizmap >= 3.10: the callback is run even if the event has already been emitted
            lizMap.subscribe(callback, 'lizmap.uicreated');
        } else {
            // Lizmap <= 3.9: uicreated is emitted before the modules are created
            lizMap.events.on({
                uicreated: function () {
                    if (lizMap.mainLizmap.legend !== undefined) {
                        callback();
                    } else {
                        lizMap.mainEventDispatcher.addListener(callback, 'lizmap.modules.initialized');
                    }
                }
            });
        }
    }

    onLizmapReady(init);

    // Public API
    return {
        data: {},
    };
}();
```

Étapes de migration d'un script existant :

1. Supprimer la fonction `waitForObject()` et son appel `.then(…)`.
2. Ajouter la fonction `onLizmapReady()` et appeler `onLizmapReady(init)`.
3. Déplacer tous les appels à `lizMap.events.on(…)` et à `lizMap.mainEventDispatcher.addListener(…)` **à l'intérieur** de `init()`.
4. Vérifier le HTML et les sélecteurs utilisés par le script à l'aide de la [Partie 2](#partie-2--bootstrap-5) (panneaux, onglets, fenêtres modales…).

## 3. Changements de l'API publique

| Élément | Lizmap 3.9 | Lizmap 3.10 |
|---|---|---|
| `lizMap.mainLizmap` | Défini une fois la configuration chargée | Défini **avant** le chargement de la configuration : utiliser `lizMap.subscribe()` (§1). |
| `lizMap.mainLizmap.locateByLayer.getLocateFeature(name)` | Synchrone | **Asynchrone** : renvoie une `Promise`, utiliser `await` ou `.then()`. |
| `lizMap.proj4` | Bibliothèque [proj4js](https://github.com/proj4js/proj4js) | Bibliothèque [proj4rs](https://github.com/3liz/proj4rs) (Rust, WebAssembly), avec la même API : `lizMap.proj4.defs(…)`, `lizMap.proj4(source, destination, coordonnees)`. |
| Table attributaire | Toutes les entités chargées dans le navigateur, DataTables 1 | Pagination côté serveur, DataTables 2 : `lizMap.config.layers[name].features` ne contient que les **entités déjà affichées**. `attributeLayerContentReady` fournit maintenant l'instance DataTables dans `e.oTable`. |
| Option `limitDataToBbox` | Lue par la table attributaire | Supprimée |
| Panneaux (docks), onglets, fenêtres modales | HTML Bootstrap 2 | HTML Bootstrap 5 : voir la [Partie 2](#partie-2--bootstrap-5), notamment le §7.3. |
| `lizMap.map` (OpenLayers 2) | Disponible | Toujours disponible en 3.10, mais en cours de suppression : utiliser `lizMap.mainLizmap.map` (OpenLayers 10) pour tout nouveau code. |

## 4. Nouveaux outils disponibles en JavaScript

Certains de ces outils ont été rétroportés dans les versions de maintenance 3.9 : ils sont marqués avec la première
version 3.9 qui les contient, par exemple *(3.9.4)*. Les éléments marqués *(prochaine 3.9.x)* sont dans la branche 3.9
mais pas encore publiés. Les éléments sans marque ne sont disponibles qu'à partir de la 3.10.

### 4.1 Objets globaux

| Objet | Contenu |
|---|---|
| `lizMap.subscribe(callback, event)` | Écouter un événement de `mainEventDispatcher`, même s'il a déjà été émis (§1). |
| `lizMap.constants` *(3.9.6)* | `ADJUSTED_DPI`, `MEDIA_REGEX` (chemin vers un fichier de `media/`), `URL_REGEX` |
| `lizMap.ol` | Classes OpenLayers : `ol.source.GeoTIFF`, `ol.layer.WebGLTile` *(3.9.4)* ; `ol.interaction.Snap`, `ol.extent.containsExtent`, `ol.geom.fromCircle` *(prochaine 3.9.x)* |
| `lizMap.mainLizmap.utils` | `fetchXML()` *(3.9.7)*, `sanitizeHTMLContent()` *(3.9.12)* (nettoie du HTML avant de l'insérer dans la page) |

### 4.2 Méthodes des modules de `lizMap.mainLizmap`

| Module | Nouvelles méthodes et propriétés |
|---|---|
| `map` | `zoomToWkt(wkt, projection, options)` *(3.9.4)*, `simulateClick(coordinates, clickType)` *(3.9.9)* (simule un clic sur la carte, par exemple pour ouvrir une popup) |
| `geolocation` | `rotateView()`, `toggleRotatedView()`, `isRotatedView`, `displayDirection`, `displayPrecision` |
| `featureStorage` | `copy()`, `clear()`, `hasFeatures()` (copier-coller de géométrie) |
| `geometryCopyHandler` (nouveau) | `activate()`, `deactivate()`, `isActive()` |
| `groupPopupByLayers` (nouveau) | `isActive`, `groupPopups(html)` (popups regroupées par couche) |
| `panoramax` (nouveau, si Panoramax est configuré) | `activate()`, `deactivate()`, `setDateFilter()`, `setTypeFilter()`, `setAccountFilter()`… |
| `permalink` | `currentPermalinkId`, `currentPermalinkProperties`, `permalinksHistory` (permaliens courts) |
| `wms` | `getStyles()`, `getLegendGraphicPNG()` *(3.9.6)* |
| `state` | `portfolios` (portfolios), `map.excludeBasemapsFromSingleWMS` |
| `state.layer…` (couches de `rootMapGroup`) | `isVisible(scale)` *(prochaine 3.9.x)*, `symbologyInitParameters` |
| `initialConfig.options` | `exportLayers` *(3.9.12)*, `group_popup_by_layer`, `panoramax`, `short_link_permalink`, `geolocationDirection`, `geolocationPrecision`, `exclude_basemaps_from_single_wms` |
| `initialConfig.attributeLayers…` | `exportFormats`, `exportLimited`, `exportMaxFeatures` *(3.9.12)* |

### 4.3 Nouveaux événements

Événements émis par `lizMap.mainEventDispatcher`. Pour les écouter :
`lizMap.mainEventDispatcher.addListener(cb, 'evenement')` ou `lizMap.subscribe(cb, 'evenement')`.

| Événement | Émis quand |
|---|---|
| `lizmap.configsloaded` | Les configurations sont chargées (`event.configs`) |
| `lizmap.uicreated` | L'interface est entièrement créée |
| `lizmap.locatebylayers.loaded` | Les listes « localiser par couche » sont chargées |
| `tooltip.activated`, `tooltip.deactivated` | L'outil d'infobulle est activé ou désactivé |
| `geolocation.error` *(3.9.8)*, `geolocation.isRotatedView` | Erreur de géolocalisation, bascule de la rotation de la carte |
| `geometryCopy.activated`, `geometryCopy.deactivated`, `featureStorage.copy`, `featureStorage.clear` | Copier-coller de géométrie |
| `panoramax.picture.selected`, `panoramax.position.selected` | Visionneuse Panoramax |
| `portfolios.portfolio.selected`, `portfolios.portfolio.launched`, `portfolios.run.status.changed`, `portfolios.ui.status.changed` | Portfolios |

Événement historique (`lizMap.events.on`) : **`actionStarted`** *(3.9.8)* (`{action, layerId, featureId}`), émis
avant l'envoi d'une action au serveur.

### 4.4 Exemple : zoomer sur une géométrie et ouvrir sa popup

```js
/**
 * Zoom to a WKT geometry and open the popup at its center.
 * @param {string} wkt - The WKT geometry, in EPSG:4326
 */
function zoomAndOpenPopup(wkt) {
    const map = lizMap.mainLizmap.map;
    // Zoom to the geometry
    map.zoomToWkt(wkt, 'EPSG:4326');
    // Simulate a click at the center of the map view
    map.simulateClick(map.getView().getCenter());
}
```

---

# Partie 2 — Bootstrap 5

## 5. Ce que Lizmap conserve pour la compatibilité

Certains éléments de Bootstrap 2 continuent de fonctionner, car Lizmap les définit lui-même.
Il n'est donc pas urgent de les modifier :

| Élément | Situation en 3.10 |
|---|---|
| Classe `hide` | Toujours définie par Lizmap, qui l'utilise pour afficher ou masquer les panneaux. Pour du nouveau code, préférer `d-none`. |
| Icônes `icon-*` (`icon-search`, `icon-white`…) | Les *glyphicons* de Bootstrap 2 sont toujours fournis par la CSS de Lizmap. |
| Onglets `<a data-toggle="tab">` **dans une popup** | Lizmap les active lui-même à l'affichage de la popup, y compris pour les popups « glisser-déposer » générées par le plugin Lizmap Server. |
| jQuery (`$`) | Toujours chargé. Bootstrap 5 propose aussi une interface jQuery (`$(el).modal('show')`, `$(el).tooltip()`…), mais elle ne fonctionne qu'avec la **structure HTML de Bootstrap 5**. |

---

## 6. Popups et HTML : classes et attributs à remplacer

### 6.1 Attributs `data-*` (ils déclenchent les comportements dynamiques)

Avec Bootstrap 5, **tous les attributs `data-*` prennent le préfixe `bs-`**. Sans ce préfixe, les onglets,
menus déroulants, panneaux repliables, fenêtres modales et bulles d'aide ne réagissent plus.

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `data-toggle="tab"` / `"collapse"` / `"dropdown"` / `"modal"` / `"tooltip"` | `data-bs-toggle="…"` |
| `data-target="#id"` | `data-bs-target="#id"` |
| `data-dismiss="modal"` / `"alert"` | `data-bs-dismiss="…"` |
| `data-original-title="…"`, `rel="tooltip"` | `data-bs-title="…"` avec `data-bs-toggle="tooltip"` |
| `data-placement`, `data-container`, `data-backdrop`, `data-keyboard` | `data-bs-placement`, `data-bs-container`, `data-bs-backdrop`, `data-bs-keyboard` |
| `data-slide`, `data-slide-to` (carrousel) | `data-bs-slide`, `data-bs-slide-to` |
| `data-toggle="buttons-radio"` / `"buttons-checkbox"` | Supprimé. Utiliser des `input` radio ou checkbox avec la classe `btn-check`, ou gérer `.active` en JavaScript. |

### 6.2 Grille et mise en page

| Bootstrap 2 | Bootstrap 5 | Remarque |
|---|---|---|
| `row-fluid` | `row` | |
| `span1` … `span12` | `col-1` … `col-12` (ou `col-md-*`) | Lizmap utilise `col-md-*`. |
| `offset2` | `offset-2` (ou `offset-md-2`) | |
| `container-fluid` | `container-fluid` | Inchangé. |
| `pull-right` / `pull-left` | `float-end` / `float-start` | |
| `text-right` / `text-left` | `text-end` / `text-start` | |
| `hidden`, `hide` | `d-none` | `hide` reste défini par Lizmap (§5). |
| `hidden-phone` | `d-none d-sm-inline` (ou `d-sm-block`) | |
| `visible-phone` | `d-sm-none` | |
| `muted` | `text-muted` (ou `text-body-secondary`) | |
| `text-error` | `text-danger` | |

### 6.3 Tableaux, boutons, badges, images

| Bootstrap 2 | Bootstrap 5 | Remarque |
|---|---|---|
| `table-condensed` | `table-sm` | Les popups automatiques de Lizmap utilisent désormais `table table-sm table-striped table-bordered lizmapPopupTable`. |
| `btn-mini`, `btn-small` | `btn-sm` | |
| `btn-large` | `btn-lg` | |
| `btn-inverse` | `btn-dark` | |
| `btn-block` | `w-100` (ou un conteneur `d-grid`) | |
| `label label-info`, `label-success`, `label-warning`, `label-important` | `badge text-bg-info`, `text-bg-success`, `text-bg-warning`, `text-bg-danger` | Les « labels » colorés de Bootstrap 2 deviennent des badges. |
| `badge-info`, etc. | `badge text-bg-info`, etc. | |
| `img-polaroid` | `img-thumbnail` | |
| `img-rounded`, `img-circle` | `rounded`, `rounded-circle` | |
| Image adaptative (sans classe) | `img-fluid` | |
| `well` | `card` + `card-body` | La classe `well` n'existe plus et n'a donc plus aucun style. |
| `thumbnail` | `card` | |
| `alert-error` | `alert-danger` | |
| `alert-block` | Supprimé | |
| `dl-horizontal` | Grille `row` avec des `dt`/`dd` en `col-*` | |
| `<span class="caret">` | Supprimé | La flèche est ajoutée automatiquement par `dropdown-toggle`. |

### 6.4 Onglets (popups « glisser-déposer », popups HTML personnalisées)

Bootstrap 5 attend les classes `nav-item` / `nav-link`, et l'état actif se place sur le
**lien ou le bouton**, plus sur le `<li>`.

**Bootstrap 2 (3.9)**
```html
<ul class="nav nav-tabs">
  <li class="active"><a href="#tab1" data-toggle="tab">Général</a></li>
  <li><a href="#tab2" data-toggle="tab">Détails</a></li>
</ul>
<div class="tab-content">
  <div class="tab-pane active" id="tab1">…</div>
  <div class="tab-pane" id="tab2">…</div>
</div>
```

**Bootstrap 5 (3.10)**
```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab1" type="button">Général</button></li>
  <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab2" type="button">Détails</button></li>
</ul>
<div class="tab-content">
  <div class="tab-pane active" id="tab1">…</div>
  <div class="tab-pane" id="tab2">…</div>
</div>
```

`tabbable` et `tabs-below` n'existent plus.

### 6.5 Panneaux repliables (accordéon)

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `accordion-group` | `accordion-item` |
| `accordion-heading` + `accordion-toggle` | `accordion-header` + `button.accordion-button` |
| `accordion-body collapse in` | `accordion-collapse collapse show` |
| `accordion-inner` | `accordion-body` |
| Classe `in` (élément ouvert / visible) | `show` |

```html
<!-- Bootstrap 5 -->
<button class="btn btn-sm btn-secondary" data-bs-toggle="collapse" data-bs-target="#more">Plus d'infos</button>
<div id="more" class="collapse">…</div>
```

### 6.6 Carrousel d'images

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `carousel-inner > .item` / `.item.active` | `carousel-inner > .carousel-item` / `.carousel-item.active` |
| `<a class="carousel-control left" data-slide="prev">‹</a>` | `<button class="carousel-control-prev" data-bs-target="#c" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>` |
| `carousel-caption` | Inchangé |

### 6.7 Fenêtres modales

La structure HTML change : les niveaux `modal-dialog` et `modal-content` sont **obligatoires**.

**Bootstrap 2**
```html
<div class="modal hide fade">
  <div class="modal-header"><button class="close" data-dismiss="modal">×</button><h3>Titre</h3></div>
  <div class="modal-body">…</div>
  <div class="modal-footer">…</div>
</div>
```

**Bootstrap 5**
```html
<div class="modal fade" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">Titre</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
      <div class="modal-body">…</div>
      <div class="modal-footer">…</div>
    </div>
  </div>
</div>
```

> ⚠️ **Fenêtre `#lizmap-modal`** : si un script y injecte du HTML Bootstrap 2 (avec un
> `div.modal-header` directement sous `#lizmap-modal`), Lizmap **masque volontairement** la
> fenêtre et son fond gris. Sinon, l'ancienne fenêtre bloquerait la carte (#4839).
> Rien ne s'affiche tant que le HTML n'a pas été converti à la structure ci-dessus.

### 6.8 Formulaires

Cette section concerne le HTML personnalisé, ainsi que les scripts qui modifient le formulaire d'édition de Lizmap.

| Bootstrap 2 | Bootstrap 5 | Remarque |
|---|---|---|
| `form-horizontal` | Supprimé | Le formulaire d'édition utilise maintenant `form-container container`. |
| `control-group` | `mb-3` | Le formulaire d'édition utilise `form-group row mb-3`. |
| `control-label` | `form-label` (`form-check-label` pour une case à cocher) | |
| `<div class="controls">` | Supprimé | Le champ est directement dans le groupe. |
| `<input>`, `<textarea>` sans classe | `form-control` (`form-control-sm`) | |
| `<select>` | `form-select` (`form-select-sm`) | |
| `label.checkbox > input` | `div.form-check > input.form-check-input + label.form-check-label` | |
| `input-append`, `input-prepend` | `input-group` | |
| `add-on` | `input-group-text` | |
| `input-mini`, `input-small`, `input-medium`, `input-large`, `input-xlarge` | `form-control-sm` / `form-control-lg`, ou une largeur (`w-25`, `w-50`, `w-auto`…) | |
| `help-inline`, `help-block` | `form-text` | |
| `error` sur `control-group` | `is-invalid` sur le champ | |
| `<div class="progress"><div class="bar">` | `<div class="progress"><div class="progress-bar">` | |

### 6.9 Menus déroulants et barre de navigation

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `<li><a href="…">` dans un `dropdown-menu` | `<li><a class="dropdown-item" href="…">` |
| `dropdown-menu pull-right` | `dropdown-menu dropdown-menu-end` |
| `<li class="divider">` | `<li><hr class="dropdown-divider"></li>` |
| `nav-header` (titre de section) | `dropdown-header` |
| `navbar-inner`, `brand` | Supprimés, ou `navbar-brand` |
| `navbar-fixed-top` | `fixed-top` |

---

## 7. Scripts JavaScript

### 7.1 Appels Bootstrap

L'interface jQuery reste disponible, mais **l'API native de Bootstrap 5 est préférable**
(c'est celle que Lizmap utilise désormais). L'objet global `bootstrap` est disponible sur la page de la carte.

| Bootstrap 2 (jQuery) | Bootstrap 5 |
|---|---|
| `$('#m').modal('show')` / `'hide'` | `bootstrap.Modal.getOrCreateInstance('#m').show()` / `.hide()` |
| `$('#lien').tab('show')` | `bootstrap.Tab.getOrCreateInstance(el).show()` |
| `$(el).tooltip({title: 'x'})` | `new bootstrap.Tooltip(el, {title: 'x'})` |
| `$(el).tooltip('destroy')` | `bootstrap.Tooltip.getInstance(el)?.dispose()` |
| Modifier `data-original-title` pour mettre à jour une bulle d'aide | `bootstrap.Tooltip.getInstance(el).setContent({'.tooltip-inner': 'nouveau texte'})` |
| `$(el).collapse('toggle')` | `bootstrap.Collapse.getOrCreateInstance(el).toggle()` |
| `$(el).dropdown('toggle')` | `bootstrap.Dropdown.getOrCreateInstance(el).toggle()` |

### 7.2 Noms des événements Bootstrap

Les événements Bootstrap sont maintenant suffixés par le nom du composant :

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `$('#m').on('shown', …)`, `'hidden'`, `'show'`, `'hide'` | `el.addEventListener('shown.bs.modal', …)`, `'hidden.bs.modal'`, `'show.bs.modal'`, `'hide.bs.modal'` |
| `$('a[data-toggle="tab"]').on('shown', e => e.target)` | `el.addEventListener('shown.bs.tab', e => e.target)` (`e.target` est le `button.nav-link`) |
| Panneau repliable : `'shown'`, `'hidden'` | `'shown.bs.collapse'`, `'hidden.bs.collapse'` |

### 7.3 Sélecteurs de l'interface Lizmap qui ont changé

**Panneaux (docks)**

Les panneaux ne sont plus des onglets Bootstrap. Chaque panneau est un simple `div`, masqué par la classe `hide`.

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `#mapmenu li.nav-dock > a[href="#mydock"]` | `#mapmenu a[data-dockid="mydock"]` ou `#button-mydock` (le lien a maintenant `href="#"`) |
| `#dock-tabs`, `#mini-dock-tabs`, `#right-dock-tabs`, `#bottom-dock-tabs`, `#nav-tab-<id>` | **Supprimés** |
| `#dock-content .tab-pane.active` | `#dock-content > div:not(.hide)` |
| `$('#mydock').addClass('active')` pour afficher un panneau | Simuler le clic : `document.getElementById('button-mydock').click()` |
| `#right-dock`, `#bottom-dock` avec `style="display:none"` | Plus de style en ligne ; la visibilité dépend de l'état du menu |
| `#message.span6` | `#message` |

Les événements Lizmap des panneaux sont **inchangés** :
`dockopened`, `dockclosed`, `minidockopened`, `minidockclosed`, `rightdockopened`,
`rightdockclosed`, `bottomdockopened`, `bottomdockclosed` (avec `{id: 'mydock'}`).

`lizMap.addDock(nom, titre, type, contenu, icone)` fonctionne toujours et produit la nouvelle structure.

**Onglets internes (table attributaire, édition, permalien)**

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `#attributeLayers-tabs li > a[href="#attribute-layer-xxx"]` | `#attributeLayers-tabs button[data-bs-target="#attribute-layer-xxx"]` |
| `#attributeLayers-tabs li.active` | `#attributeLayers-tabs button.active` |
| `#edition .nav-tabs li:first a` | `#edition .nav-tabs li:first-child button` |
| `ul.nav-tabs > li > a` (enfants dans le panneau d'édition) | `ul.nav-tabs > li > button.nav-link` |

**Formulaire d'édition** (par exemple dans un écouteur de `lizmapeditionformdisplayed`)

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `#jforms_view_edition .control-group` | `#jforms_view_edition .form-group` |
| `.control-label` | `.form-label` / `.form-check-label` |
| `.controls input` | Champ directement dans `.form-group` |
| `.jforms-error-list.alert-error` | `.jforms-error-list.alert-danger` |

**Table attributaire (DataTables 2)**

Elle utilise désormais DataTables 2, avec un chargement des données côté serveur.

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `div.dataTables_wrapper` | `div.dt-container` |
| `div.dataTables_filter`, `div.dataTables_paginate`, `div.dataTables_scrollBody` | `div.dt-search`, `div.dt-paging`, `div.dt-scroll-body` |
| `$(table).DataTable()` dans un script externe | DataTables est intégré au code de Lizmap et n'est plus exposé à jQuery. Pour récupérer la table, utiliser l'événement `attributeLayerContentReady`, qui fournit maintenant l'instance `oTable`. |

---

## 8. CSS personnalisé

* Bootstrap 5 utilise des **variables CSS** (`--bs-table-bg`, `--bs-table-striped-bg`…).
  Une couleur de fond posée sur `tr` peut être masquée par celle des cellules.
  Il faut alors cibler `td` et `th`, ou surcharger la variable.
* Les sélecteurs qui s'appuient sur des classes supprimées (`.row-fluid`, `.span6`, `.btn-mini`,
  `.control-group`, `.tabbable`, `.well`, `.add-on`…) ne s'appliquent plus.
* La barre d'en-tête (`#headermenu`) utilise maintenant `navbar navbar-expand`,
  et ses entrées sont des `li.nav-item > a.nav-link`.

---

## 9. Exemples de migration

### Popup HTML (*maptip* QGIS)

```html
<!-- Lizmap 3.9 -->
<div class="row-fluid">
  <div class="span6"><img class="img-polaroid" src="[% "photo" %]"></div>
  <div class="span6">
    <span class="label label-success">[% "statut" %]</span>
    <a class="btn btn-mini pull-right" href="[% "url" %]" target="_blank">Fiche</a>
  </div>
</div>

<!-- Lizmap 3.10 -->
<div class="row">
  <div class="col-6"><img class="img-thumbnail img-fluid" src="[% "photo" %]"></div>
  <div class="col-6">
    <span class="badge text-bg-success">[% "statut" %]</span>
    <a class="btn btn-sm float-end" href="[% "url" %]" target="_blank">Fiche</a>
  </div>
</div>
```

### Script : ouvrir un panneau et réagir à un onglet

```js
// Lizmap 3.9
$('#mapmenu li.nav-dock > a[href="#mydock"]').click();
$('#mytabs a[data-toggle="tab"]').on('shown', function (e) { console.log(e.target); });

// Lizmap 3.10
document.getElementById('button-mydock').click();
document.querySelectorAll('#mytabs [data-bs-toggle="tab"]').forEach((el) => {
    el.addEventListener('shown.bs.tab', (e) => console.log(e.target));
});
```

### Script : afficher un message dans la fenêtre modale de Lizmap

```js
// Lizmap 3.10: the Bootstrap 5 structure is required in #lizmap-modal
const modal = document.getElementById('lizmap-modal');
modal.innerHTML = `
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Information</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">Mon contenu</div>
    </div>
  </div>`;
bootstrap.Modal.getOrCreateInstance(modal).show();
```

---

## 10. Liste de vérification

- [ ] Remplacer la boucle `waitForObject()` par `lizMap.subscribe(init, 'lizmap.uicreated')` (§2).
- [ ] Ajouter `await` aux appels à `getLocateFeature()`, et vérifier les scripts qui lisent les données de la table attributaire (§3).
- [ ] Rechercher `data-toggle`, `data-target`, `data-dismiss`, `data-original-title`, puis ajouter `bs-`.
- [ ] Remplacer `row-fluid` / `spanN` par `row` / `col-N`.
- [ ] Remplacer `pull-right` / `pull-left` / `text-right` par `float-end` / `float-start` / `text-end`.
- [ ] Remplacer `btn-mini` / `btn-small` par `btn-sm`, et `table-condensed` par `table-sm`.
- [ ] Convertir les `label label-*` en `badge text-bg-*`, et `img-polaroid` en `img-thumbnail`.
- [ ] Mettre à jour les onglets (`nav-item` / `nav-link`, `active` sur le bouton) et les accordéons (`in` → `show`).
- [ ] Convertir les fenêtres modales à la structure `modal-dialog > modal-content`.
- [ ] Mettre à jour les sélecteurs des panneaux (`a[data-dockid=…]`, plus de `#dock-tabs`, plus de `.tab-pane`).
- [ ] Renommer les événements Bootstrap : `shown` → `shown.bs.modal`, `shown.bs.tab`…
- [ ] Tester chaque popup et chaque script avec la console du navigateur ouverte.

## Références

* Documentation Bootstrap 5 : guide de migration <https://getbootstrap.com/docs/5.3/migration/>
* Pull requests Lizmap (JavaScript) : [#5562](https://github.com/3liz/lizmap-web-client/pull/5562) (table attributaire côté serveur),
  [#5799](https://github.com/3liz/lizmap-web-client/pull/5799) (proj4rs)
* Pull requests Lizmap (Bootstrap) : [#4455](https://github.com/3liz/lizmap-web-client/pull/4455) (passage à Bootstrap 5),
  [#4769](https://github.com/3liz/lizmap-web-client/pull/4769) (GetFeatureInfo demandé en Bootstrap 5),
  [#4839](https://github.com/3liz/lizmap-web-client/pull/4839) (désactivation des fenêtres modales Bootstrap 2),
  [#6323](https://github.com/3liz/lizmap-web-client/pull/6323) (grille `row` / `col`),
  [#6325](https://github.com/3liz/lizmap-web-client/pull/6325) et [#6369](https://github.com/3liz/lizmap-web-client/pull/6369) (formulaires, menus),
  [#6621](https://github.com/3liz/lizmap-web-client/pull/6621) (`addDock`),
  [#6924](https://github.com/3liz/lizmap-web-client/pull/6924) et [#6942](https://github.com/3liz/lizmap-web-client/pull/6942) (fin de la migration)
