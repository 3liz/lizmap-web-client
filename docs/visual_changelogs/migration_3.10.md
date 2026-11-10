# Lizmap 3.9 → 3.10: migrating your JavaScript scripts and HTML popups

Lizmap Web Client 3.10 brings two kinds of changes for people who have added their own code to Lizmap:

* **JavaScript**: the startup sequence has changed, some public APIs have changed, and new tools are available
  (Part 1);
* **Bootstrap 5**: Lizmap replaces **Bootstrap 2.3.2** with **Bootstrap 5.3**. The whole interface has been
  migrated: HTML templates, JavaScript, CSS and forms (Part 2).

This guide is for anyone who has added their own code to Lizmap:

* **JavaScript scripts** placed in the `media/js/` folder of a repository or a project;
* **HTML in popups** (QGIS map tips, popup templates, dataviz HTML templates);
* **custom CSS** targeting interface elements.

It lists what to look for in your code and what to replace it with.

> **Recommended approach**: open the browser console (F12), then search your files for
> the terms in the "Lizmap 3.9" and "Bootstrap 2" columns of the tables below
> (`waitForObject`, `data-toggle`, `span6`, `pull-right`, `btn-mini`, `control-group`…).

---

# Part 1 — JavaScript

## 1. What changed at startup: wait for Lizmap the right way

The Lizmap startup sequence has been reworked in 3.10. Its main consequence for external scripts
(`media/js/…`) is the following:

* In 3.9, the `lizMap.mainLizmap` object only appeared once the project configuration was loaded.
  Many scripts therefore waited for it with a `setInterval` loop.
* In 3.10, **`lizMap.mainLizmap` exists before the configuration is loaded**:
  `lizMap.mainLizmap.state`, `lizMap.mainLizmap.map`, `lizMap.mainLizmap.popup`… are still `undefined` at that time.
  A script that waits only for `lizMap.mainLizmap` may start too early and fail at random,
  depending on the network speed.

To fix this, Lizmap 3.10 adds **`lizMap.subscribe(callback, eventName)`**:

* it can be called as soon as the script is loaded;
* if the event **has already been emitted**, the callback is run immediately with the last event;
* otherwise, the callback is run when the event is emitted.

This is the recommended way to start an external script.

### 1.1 Startup events, in order

The table below shows what is available in each startup event of Lizmap 3.10.

| Event | How to listen to it | Available at this time |
|---|---|---|
| `lizmap.configsloaded` | `lizMap.subscribe(cb, 'lizmap.configsloaded')` | `mainLizmap.initialConfig`, `mainLizmap.state`. The configurations are in `event.configs`. |
| `mapcreated`, `layersadded`, `toolbarcreated` | `lizMap.events.on({…})` (legacy) | Same, plus the legacy OpenLayers 2 map `lizMap.map` |
| `uicreated` | `lizMap.events.on({uicreated: cb})` (legacy) | Same, plus the OpenLayers 10 map `mainLizmap.map`. ⚠️ `mainLizmap.popup`, `action`, `edition`, `digitizing`, `selectionTool`, `legend`… are **not created yet**. |
| `lizmap.modules.initialized` | `lizMap.subscribe(cb, 'lizmap.modules.initialized')` | All `mainLizmap` modules |
| **`lizmap.uicreated`** (new) | `lizMap.subscribe(cb, 'lizmap.uicreated')` | **Everything**: modules and interface components (`lizmap-*` elements). **Recommended event to start a script.** |

The legacy events (`configsloaded`, `mapcreated`, `uicreated`, `lizmappopupdisplayed`, `layerSelectionChanged`, `dockopened`,
`attributeLayerContentReady`, `lizmapeditionformdisplayed`…) **are still emitted**, and listening to them
with `lizMap.events.on()` remains valid. The startup events (`configsloaded` to `uicreated`) must be listened to
as soon as the script is loaded. Listen to the other ones (popup, selection, docks…) **inside** your initialization function.

## 2. Script template for 3.10

Many community scripts use the template below: a polling loop waits for `lizMap.mainLizmap`, then
calls `init()`.

**Template used up to 3.9** (no longer reliable in 3.10)
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

**Template for 3.10**, also compatible with 3.9: replace the polling loop with `lizMap.subscribe()`.

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
            // Lizmap <= 3.9
            lizMap.events.on({ uicreated: callback });
        }
    }

    onLizmapReady(init);

    // Public API
    return {
        data: {},
    };
}();
```

Migration steps for an existing script:

1. Remove the `waitForObject()` function and its `.then(…)` call.
2. Add the `onLizmapReady()` function and call `onLizmapReady(init)`.
3. Move every `lizMap.events.on(…)` and every `lizMap.mainEventDispatcher.addListener(…)` call **inside** `init()`.
4. Check the HTML and the selectors used by the script against [Part 2](#part-2--bootstrap-5) (docks, tabs, modals…).

## 3. Public API changes

| Element | Lizmap 3.9 | Lizmap 3.10 |
|---|---|---|
| `lizMap.mainLizmap` | Defined once the configuration is loaded | Defined **before** the configuration is loaded: use `lizMap.subscribe()` (§1). |
| `lizMap.mainLizmap.locateByLayer.getLocateFeature(name)` | Synchronous | **Asynchronous**: returns a `Promise`, use `await` or `.then()`. |
| `lizMap.proj4` | [proj4js](https://github.com/proj4js/proj4js) library | [proj4rs](https://github.com/3liz/proj4rs) library (Rust, WebAssembly), with the same API: `lizMap.proj4.defs(…)`, `lizMap.proj4(from, to, coordinates)`. |
| Attribute table | All the features loaded in the browser, DataTables 1 | Server-side pagination, DataTables 2: `lizMap.config.layers[name].features` only contains the **features already displayed**. `attributeLayerContentReady` now gives the DataTables instance in `e.oTable`. |
| `limitDataToBbox` option | Read by the attribute table | Removed |
| `lizMap.mainLizmap.action.runLizmapAction(name, scope, layerId, featureId, wkt)` | — | New last parameter `options`: an object whose values replace the `options` declared in the action configuration (only the declared keys are used). |
| Panels (docks), tabs, modals | Bootstrap 2 HTML | Bootstrap 5 HTML: see [Part 2](#part-2--bootstrap-5), especially §7.3. |
| `lizMap.map` (OpenLayers 2) | Available | Still available in 3.10, but being removed: use `lizMap.mainLizmap.map` (OpenLayers 10) for any new code. |

## 4. New tools available in JavaScript

### 4.1 Global objects

| Object | Content |
|---|---|
| `lizMap.subscribe(callback, event)` | Listen to a `mainEventDispatcher` event, even if it has already been emitted (§1). |
| `lizMap.constants` | `ADJUSTED_DPI`, `MEDIA_REGEX` (path to a `media/` file), `URL_REGEX` |
| `lizMap.ol` | New OpenLayers classes: `ol.source.GeoTIFF`, `ol.layer.WebGLTile`, `ol.interaction.Snap`, `ol.extent.containsExtent`, `ol.geom.fromCircle` |
| `lizMap.mainLizmap.utils` | New: `fetchXML()`, `sanitizeHTMLContent()` (clean HTML before inserting it in the page) |

### 4.2 Methods of the `lizMap.mainLizmap` modules

| Module | New methods and properties |
|---|---|
| `map` | `zoomToWkt(wkt, projection, options)`, `simulateClick(coordinates, clickType)` (simulates a click on the map, e.g. to open a popup) |
| `geolocation` | `rotateView()`, `toggleRotatedView()`, `isRotatedView`, `displayDirection`, `displayPrecision` |
| `featureStorage` | `copy()`, `clear()`, `hasFeatures()` (geometry copy and paste) |
| `geometryCopyHandler` (new) | `activate()`, `deactivate()`, `isActive()` |
| `groupPopupByLayers` (new) | `isActive`, `groupPopups(html)` (popups grouped by layer) |
| `panoramax` (new, if Panoramax is configured) | `activate()`, `deactivate()`, `setDateFilter()`, `setTypeFilter()`, `setAccountFilter()`… |
| `permalink` | `currentPermalinkId`, `currentPermalinkProperties`, `permalinksHistory` (short permalinks) |
| `wms` | `getStyles()`, `getLegendGraphicPNG()` |
| `state` | `portfolios` (portfolios), `map.excludeBasemapsFromSingleWMS` |
| `state.layer…` (layers of `rootMapGroup`) | `isVisible(scale)`, `symbologyInitParameters` |
| `initialConfig.options` | `exportLayers`, `group_popup_by_layer`, `panoramax`, `short_link_permalink`, `geolocationDirection`, `geolocationPrecision`, `exclude_basemaps_from_single_wms` |
| `initialConfig.attributeLayers…` | `exportFormats`, `exportLimited`, `exportMaxFeatures` |

### 4.3 New events

Events emitted by `lizMap.mainEventDispatcher`. Listen to them with
`lizMap.mainEventDispatcher.addListener(cb, 'event')` or `lizMap.subscribe(cb, 'event')`.

| Event | Emitted when |
|---|---|
| `lizmap.configsloaded` | The configurations are loaded (`event.configs`) |
| `lizmap.uicreated` | The interface is fully created |
| `lizmap.locatebylayers.loaded` | The "locate by layer" lists are loaded |
| `tooltip.activated`, `tooltip.deactivated` | The tooltip tool is turned on or off |
| `geolocation.error`, `geolocation.isRotatedView` | Geolocation error, map rotation switched |
| `geometryCopy.activated`, `geometryCopy.deactivated`, `featureStorage.copy`, `featureStorage.clear` | Geometry copy and paste |
| `panoramax.picture.selected`, `panoramax.position.selected` | Panoramax viewer |
| `portfolios.portfolio.selected`, `portfolios.portfolio.launched`, `portfolios.run.status.changed`, `portfolios.ui.status.changed` | Portfolios |

New legacy event (`lizMap.events.on`): **`actionStarted`** (`{action, layerId, featureId}`), emitted
before an action is sent to the server.

### 4.4 Example: zoom to a geometry and open its popup

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

# Part 2 — Bootstrap 5

## 5. What Lizmap keeps for compatibility

Some Bootstrap 2 elements still work because Lizmap defines them itself.
Changing them is not urgent:

| Element | Status in 3.10 |
|---|---|
| `hide` class | Still defined by Lizmap, which uses it to show or hide panels. For new code, prefer `d-none`. |
| `icon-*` icons (`icon-search`, `icon-white`…) | The Bootstrap 2 *glyphicons* are still provided by the Lizmap CSS. |
| `<a data-toggle="tab">` tabs **inside a popup** | Lizmap activates them itself when the popup is displayed, including the "drag and drop" popups generated by the Lizmap Server plugin. |
| jQuery (`$`) | Still loaded. Bootstrap 5 also provides a jQuery interface (`$(el).modal('show')`, `$(el).tooltip()`…), but it only works with the **Bootstrap 5 HTML structure**. |

---

## 6. Popups and HTML: classes and attributes to replace

### 6.1 `data-*` attributes (they trigger dynamic behaviours)

In Bootstrap 5, **every `data-*` attribute gets a `bs-` prefix**. Without it, tabs,
dropdowns, collapsible panels, modals and tooltips no longer react.

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `data-toggle="tab"` / `"collapse"` / `"dropdown"` / `"modal"` / `"tooltip"` | `data-bs-toggle="…"` |
| `data-target="#id"` | `data-bs-target="#id"` |
| `data-dismiss="modal"` / `"alert"` | `data-bs-dismiss="…"` |
| `data-original-title="…"`, `rel="tooltip"` | `data-bs-title="…"` with `data-bs-toggle="tooltip"` |
| `data-placement`, `data-container`, `data-backdrop`, `data-keyboard` | `data-bs-placement`, `data-bs-container`, `data-bs-backdrop`, `data-bs-keyboard` |
| `data-slide`, `data-slide-to` (carousel) | `data-bs-slide`, `data-bs-slide-to` |
| `data-toggle="buttons-radio"` / `"buttons-checkbox"` | Removed. Use radio or checkbox `input` elements with the `btn-check` class, or toggle `.active` in JavaScript. |

### 6.2 Grid and layout

| Bootstrap 2 | Bootstrap 5 | Note |
|---|---|---|
| `row-fluid` | `row` | |
| `span1` … `span12` | `col-1` … `col-12` (or `col-md-*`) | Lizmap uses `col-md-*`. |
| `offset2` | `offset-2` (or `offset-md-2`) | |
| `container-fluid` | `container-fluid` | Unchanged. |
| `pull-right` / `pull-left` | `float-end` / `float-start` | |
| `text-right` / `text-left` | `text-end` / `text-start` | |
| `hidden`, `hide` | `d-none` | `hide` is still defined by Lizmap (§5). |
| `hidden-phone` | `d-none d-sm-inline` (or `d-sm-block`) | |
| `visible-phone` | `d-sm-none` | |
| `muted` | `text-muted` (or `text-body-secondary`) | |
| `text-error` | `text-danger` | |

### 6.3 Tables, buttons, badges, images

| Bootstrap 2 | Bootstrap 5 | Note |
|---|---|---|
| `table-condensed` | `table-sm` | Lizmap automatic popups now use `table table-sm table-striped table-bordered lizmapPopupTable`. |
| `btn-mini`, `btn-small` | `btn-sm` | |
| `btn-large` | `btn-lg` | |
| `btn-inverse` | `btn-dark` | |
| `btn-block` | `w-100` (or a `d-grid` container) | |
| `label label-info`, `label-success`, `label-warning`, `label-important` | `badge text-bg-info`, `text-bg-success`, `text-bg-warning`, `text-bg-danger` | Bootstrap 2 coloured "labels" become badges. |
| `badge-info`, etc. | `badge text-bg-info`, etc. | |
| `img-polaroid` | `img-thumbnail` | |
| `img-rounded`, `img-circle` | `rounded`, `rounded-circle` | |
| Responsive image (no class) | `img-fluid` | |
| `well` | `card` + `card-body` | The `well` class no longer exists, so it has no style at all. |
| `thumbnail` | `card` | |
| `alert-error` | `alert-danger` | |
| `alert-block` | Removed | |
| `dl-horizontal` | `row` grid with `dt`/`dd` as `col-*` | |
| `<span class="caret">` | Removed | The arrow is added automatically by `dropdown-toggle`. |

### 6.4 Tabs ("drag and drop" popups, custom HTML popups)

Bootstrap 5 expects the `nav-item` / `nav-link` classes, and the active state is set on the
**link or button**, no longer on the `<li>`.

**Bootstrap 2 (3.9)**
```html
<ul class="nav nav-tabs">
  <li class="active"><a href="#tab1" data-toggle="tab">General</a></li>
  <li><a href="#tab2" data-toggle="tab">Details</a></li>
</ul>
<div class="tab-content">
  <div class="tab-pane active" id="tab1">…</div>
  <div class="tab-pane" id="tab2">…</div>
</div>
```

**Bootstrap 5 (3.10)**
```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab1" type="button">General</button></li>
  <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab2" type="button">Details</button></li>
</ul>
<div class="tab-content">
  <div class="tab-pane active" id="tab1">…</div>
  <div class="tab-pane" id="tab2">…</div>
</div>
```

`tabbable` and `tabs-below` no longer exist.

### 6.5 Collapsible panels (accordion)

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `accordion-group` | `accordion-item` |
| `accordion-heading` + `accordion-toggle` | `accordion-header` + `button.accordion-button` |
| `accordion-body collapse in` | `accordion-collapse collapse show` |
| `accordion-inner` | `accordion-body` |
| `in` class (open / visible element) | `show` |

```html
<!-- Bootstrap 5 -->
<button class="btn btn-sm btn-secondary" data-bs-toggle="collapse" data-bs-target="#more">More info</button>
<div id="more" class="collapse">…</div>
```

### 6.6 Image carousel

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `carousel-inner > .item` / `.item.active` | `carousel-inner > .carousel-item` / `.carousel-item.active` |
| `<a class="carousel-control left" data-slide="prev">‹</a>` | `<button class="carousel-control-prev" data-bs-target="#c" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>` |
| `carousel-caption` | Unchanged |

### 6.7 Modals

The HTML structure changes: the `modal-dialog` and `modal-content` levels are **required**.

**Bootstrap 2**
```html
<div class="modal hide fade">
  <div class="modal-header"><button class="close" data-dismiss="modal">×</button><h3>Title</h3></div>
  <div class="modal-body">…</div>
  <div class="modal-footer">…</div>
</div>
```

**Bootstrap 5**
```html
<div class="modal fade" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">Title</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body">…</div>
      <div class="modal-footer">…</div>
    </div>
  </div>
</div>
```

> ⚠️ **`#lizmap-modal` window**: if a script injects Bootstrap 2 HTML into it (with a
> `div.modal-header` directly under `#lizmap-modal`), Lizmap **deliberately hides** the
> window and its grey backdrop. Otherwise, the old window would block the map (#4839).
> Nothing is displayed until the HTML is converted to the structure above.

### 6.8 Forms

This section applies to custom HTML, and to scripts that modify the Lizmap edition form.

| Bootstrap 2 | Bootstrap 5 | Note |
|---|---|---|
| `form-horizontal` | Removed | The edition form now uses `form-container container`. |
| `control-group` | `mb-3` | The edition form uses `form-group row mb-3`. |
| `control-label` | `form-label` (`form-check-label` for a checkbox) | |
| `<div class="controls">` | Removed | The field sits directly in the group. |
| `<input>`, `<textarea>` without class | `form-control` (`form-control-sm`) | |
| `<select>` | `form-select` (`form-select-sm`) | |
| `label.checkbox > input` | `div.form-check > input.form-check-input + label.form-check-label` | |
| `input-append`, `input-prepend` | `input-group` | |
| `add-on` | `input-group-text` | |
| `input-mini`, `input-small`, `input-medium`, `input-large`, `input-xlarge` | `form-control-sm` / `form-control-lg`, or a width (`w-25`, `w-50`, `w-auto`…) | |
| `help-inline`, `help-block` | `form-text` | |
| `error` on `control-group` | `is-invalid` on the field | |
| `<div class="progress"><div class="bar">` | `<div class="progress"><div class="progress-bar">` | |

### 6.9 Dropdowns and navbar

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `<li><a href="…">` in a `dropdown-menu` | `<li><a class="dropdown-item" href="…">` |
| `dropdown-menu pull-right` | `dropdown-menu dropdown-menu-end` |
| `<li class="divider">` | `<li><hr class="dropdown-divider"></li>` |
| `nav-header` (section title) | `dropdown-header` |
| `navbar-inner`, `brand` | Removed, or `navbar-brand` |
| `navbar-fixed-top` | `fixed-top` |

---

## 7. JavaScript scripts

### 7.1 Bootstrap calls

The jQuery interface is still available, but **the native Bootstrap 5 API is preferred**
(it is the one Lizmap now uses). The global `bootstrap` object is available on the map page.

| Bootstrap 2 (jQuery) | Bootstrap 5 |
|---|---|
| `$('#m').modal('show')` / `'hide'` | `bootstrap.Modal.getOrCreateInstance('#m').show()` / `.hide()` |
| `$('#link').tab('show')` | `bootstrap.Tab.getOrCreateInstance(el).show()` |
| `$(el).tooltip({title: 'x'})` | `new bootstrap.Tooltip(el, {title: 'x'})` |
| `$(el).tooltip('destroy')` | `bootstrap.Tooltip.getInstance(el)?.dispose()` |
| Changing `data-original-title` to update a tooltip | `bootstrap.Tooltip.getInstance(el).setContent({'.tooltip-inner': 'new text'})` |
| `$(el).collapse('toggle')` | `bootstrap.Collapse.getOrCreateInstance(el).toggle()` |
| `$(el).dropdown('toggle')` | `bootstrap.Dropdown.getOrCreateInstance(el).toggle()` |

### 7.2 Bootstrap event names

Bootstrap events are now suffixed with the component name:

| Bootstrap 2 | Bootstrap 5 |
|---|---|
| `$('#m').on('shown', …)`, `'hidden'`, `'show'`, `'hide'` | `el.addEventListener('shown.bs.modal', …)`, `'hidden.bs.modal'`, `'show.bs.modal'`, `'hide.bs.modal'` |
| `$('a[data-toggle="tab"]').on('shown', e => e.target)` | `el.addEventListener('shown.bs.tab', e => e.target)` (`e.target` is the `button.nav-link`) |
| Collapsible panel: `'shown'`, `'hidden'` | `'shown.bs.collapse'`, `'hidden.bs.collapse'` |

### 7.3 Lizmap interface selectors that changed

**Panels (docks)**

Panels are no longer Bootstrap tabs. Each panel is a plain `div`, hidden with the `hide` class.

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `#mapmenu li.nav-dock > a[href="#mydock"]` | `#mapmenu a[data-dockid="mydock"]` or `#button-mydock` (the link now has `href="#"`) |
| `#dock-tabs`, `#mini-dock-tabs`, `#right-dock-tabs`, `#bottom-dock-tabs`, `#nav-tab-<id>` | **Removed** |
| `#dock-content .tab-pane.active` | `#dock-content > div:not(.hide)` |
| `$('#mydock').addClass('active')` to show a panel | Simulate the click: `document.getElementById('button-mydock').click()` |
| `#right-dock`, `#bottom-dock` with `style="display:none"` | No more inline style; visibility depends on the menu state |
| `#message.span6` | `#message` |

The Lizmap panel events are **unchanged**:
`dockopened`, `dockclosed`, `minidockopened`, `minidockclosed`, `rightdockopened`,
`rightdockclosed`, `bottomdockopened`, `bottomdockclosed` (with `{id: 'mydock'}`).

`lizMap.addDock(name, title, type, content, icon)` still works and produces the new structure.

**Inner tabs (attribute table, edition, permalink)**

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `#attributeLayers-tabs li > a[href="#attribute-layer-xxx"]` | `#attributeLayers-tabs button[data-bs-target="#attribute-layer-xxx"]` |
| `#attributeLayers-tabs li.active` | `#attributeLayers-tabs button.active` |
| `#edition .nav-tabs li:first a` | `#edition .nav-tabs li:first-child button` |
| `ul.nav-tabs > li > a` (children in the edition panel) | `ul.nav-tabs > li > button.nav-link` |

**Edition form** (for example in a `lizmapeditionformdisplayed` listener)

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `#jforms_view_edition .control-group` | `#jforms_view_edition .form-group` |
| `.control-label` | `.form-label` / `.form-check-label` |
| `.controls input` | Field directly inside `.form-group` |
| `.jforms-error-list.alert-error` | `.jforms-error-list.alert-danger` |

**Attribute table (DataTables 2)**

It now uses DataTables 2, with data loaded server-side.

| Lizmap 3.9 | Lizmap 3.10 |
|---|---|
| `div.dataTables_wrapper` | `div.dt-container` |
| `div.dataTables_filter`, `div.dataTables_paginate`, `div.dataTables_scrollBody` | `div.dt-search`, `div.dt-paging`, `div.dt-scroll-body` |
| `$(table).DataTable()` in an external script | DataTables is bundled in the Lizmap code and no longer exposed to jQuery. To get the table, use the `attributeLayerContentReady` event, which now provides the `oTable` instance. |

---

## 8. Custom CSS

* Bootstrap 5 uses **CSS variables** (`--bs-table-bg`, `--bs-table-striped-bg`…).
  A background colour set on `tr` may be hidden by the one of the cells.
  Target `td` and `th` instead, or override the variable.
* Selectors relying on removed classes (`.row-fluid`, `.span6`, `.btn-mini`,
  `.control-group`, `.tabbable`, `.well`, `.add-on`…) no longer apply.
* The header bar (`#headermenu`) now uses `navbar navbar-expand`,
  and its entries are `li.nav-item > a.nav-link`.

---

## 9. Migration examples

### HTML popup (QGIS map tip)

```html
<!-- Lizmap 3.9 -->
<div class="row-fluid">
  <div class="span6"><img class="img-polaroid" src="[% "photo" %]"></div>
  <div class="span6">
    <span class="label label-success">[% "status" %]</span>
    <a class="btn btn-mini pull-right" href="[% "url" %]" target="_blank">Details</a>
  </div>
</div>

<!-- Lizmap 3.10 -->
<div class="row">
  <div class="col-6"><img class="img-thumbnail img-fluid" src="[% "photo" %]"></div>
  <div class="col-6">
    <span class="badge text-bg-success">[% "status" %]</span>
    <a class="btn btn-sm float-end" href="[% "url" %]" target="_blank">Details</a>
  </div>
</div>
```

### Script: open a panel and react to a tab

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

### Script: display a message in the Lizmap modal window

```js
// Lizmap 3.10: the Bootstrap 5 structure is required in #lizmap-modal
const modal = document.getElementById('lizmap-modal');
modal.innerHTML = `
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Information</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">My content</div>
    </div>
  </div>`;
bootstrap.Modal.getOrCreateInstance(modal).show();
```

---

## 10. Checklist

- [ ] Replace the `waitForObject()` polling loop with `lizMap.subscribe(init, 'lizmap.uicreated')` (§2).
- [ ] Add `await` to `getLocateFeature()` calls, and check scripts reading the attribute table data (§3).
- [ ] Search for `data-toggle`, `data-target`, `data-dismiss`, `data-original-title`, then add `bs-`.
- [ ] Replace `row-fluid` / `spanN` with `row` / `col-N`.
- [ ] Replace `pull-right` / `pull-left` / `text-right` with `float-end` / `float-start` / `text-end`.
- [ ] Replace `btn-mini` / `btn-small` with `btn-sm`, and `table-condensed` with `table-sm`.
- [ ] Convert `label label-*` into `badge text-bg-*`, and `img-polaroid` into `img-thumbnail`.
- [ ] Update tabs (`nav-item` / `nav-link`, `active` on the button) and accordions (`in` → `show`).
- [ ] Convert modals to the `modal-dialog > modal-content` structure.
- [ ] Update panel selectors (`a[data-dockid=…]`, no more `#dock-tabs`, no more `.tab-pane`).
- [ ] Rename Bootstrap events: `shown` → `shown.bs.modal`, `shown.bs.tab`…
- [ ] Test every popup and every script with the browser console open.

## References

* Bootstrap 5 documentation: migration guide <https://getbootstrap.com/docs/5.3/migration/>
* Lizmap pull requests (JavaScript): [#5562](https://github.com/3liz/lizmap-web-client/pull/5562) (server-side attribute table),
  [#5799](https://github.com/3liz/lizmap-web-client/pull/5799) (proj4rs)
* Lizmap pull requests (Bootstrap): [#4455](https://github.com/3liz/lizmap-web-client/pull/4455) (switch to Bootstrap 5),
  [#4769](https://github.com/3liz/lizmap-web-client/pull/4769) (GetFeatureInfo requested with Bootstrap 5),
  [#4839](https://github.com/3liz/lizmap-web-client/pull/4839) (Bootstrap 2 modals deactivated),
  [#6323](https://github.com/3liz/lizmap-web-client/pull/6323) (`row` / `col` grid),
  [#6325](https://github.com/3liz/lizmap-web-client/pull/6325) and [#6369](https://github.com/3liz/lizmap-web-client/pull/6369) (forms, menus),
  [#6621](https://github.com/3liz/lizmap-web-client/pull/6621) (`addDock`),
  [#6924](https://github.com/3liz/lizmap-web-client/pull/6924) and [#6942](https://github.com/3liz/lizmap-web-client/pull/6942) (end of the migration)
