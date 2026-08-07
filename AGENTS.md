## What this is

Lizmap Web Client: a PHP (Jelix framework) + JavaScript web application that renders QGIS Server projects as
interactive web maps. QGIS desktop projects are configured with the "Lizmap" QGIS plugin, then served by this
app (layer tree, attribute tables, editing, printing, dataviz, filtering, etc.), talking to QGIS Server as the
OGC data backend.

Repo layout:
- `lizmap/` — PHP application (Jelix modules). This is what actually runs in production.
- `assets/src/` — JavaScript source, bundled by rspack into `lizmap/www/assets/js/` (git-ignored, built by CI/Makefile).
- `tests/` — everything test-related: PHP unit tests, JS unit tests, Playwright/BATS end-to-end tests, and the
  Docker Compose dev stack.
- `docker/` — the production Docker image (see `docker/CONTRIBUTING.md` if only working on that).

**The source in the repo is not directly runnable** — since Lizmap 3.4 it must be built (composer + npm) first.

## Common commands

### Building
```bash
composer install --working-dir=lizmap/       # PHP deps → lizmap/vendor/
npm install                                   # JS deps → node_modules/
npm run build                                 # production JS build (rspack) → lizmap/www/assets/js/
npm run watch                                 # dev build, rebuilds on file change
make package                                  # full zip package (composer + npm + zips), see Makefile
```
Never commit `node_modules/`, `lizmap/vendor/`, or built/minified JS — CI builds and packages those.

### Local dev stack (Docker)
From `tests/`:
```bash
make build        # first time / after Dockerfile changes
make install       # or: run make run / make up first, then install
./lizmap-ctl <command>   # run commands inside the containers
```
Then open `http://localhost:8130/`. Default admin login is `admin`/`admin`. Useful `lizmap-ctl` subcommands:
`reset`, `reset-sqlite`, `composer-update`, `clean-tmp`, `install`, `script`, `docker-exec`, `shell`/`shell-root`,
`ldap-reset`/`ldap-users`, `psql`, `redis-cli`, `phpstan`, `unit-tests`.
Full details, HTTPS setup, LDAP, Redis, port overrides: `tests/README.md`.

### Tests
```bash
# PHP unit tests (inside the docker stack, from tests/)
./lizmap-ctl unit-tests
# or without rebuilding, from tests/units/ inside the php container:
php vendor/bin/phpunit
php vendor/bin/phpunit --filter testMethodName path/to/SomeTest.php   # single test

# JS unit tests (root directory, no docker needed)
npm run js:test

# End-to-end tests (Playwright) — requires the docker stack + test data loaded via
# tests/qgis-projects/tests/load_sql.sh
npx playwright install                                    # once, to fetch browsers
npx playwright test --config tests/end2end/playwright.config.ts
npx playwright test --config tests/end2end/playwright.config.ts --grep @readonly --workers 4
npx playwright test --config tests/end2end/playwright.config.ts --project=chromium mytest.spec.js
npx playwright test --config tests/end2end/playwright.config.ts --debug
npm run pr:open        # opens Playwright UI mode
npm run test:e2e       # runs tests/end2end/run-all-tests.sh

# Bats tests (PHP CLI commands)
npm run bats
```
Playwright tests must be tagged `@readonly` (safe to run in parallel), `@write` (mutates data), or `@requests`
(API-only) — see `tests/README.md` under "Writing tests".

### Linting / formatting
```bash
npm run pretest            # eslint (assets/)
npm run pretest-fix        # eslint --fix
npm run style-check        # stylelint on all CSS
npm run style-fix          # stylelint --fix
php-cs-fixer fix            # PHP coding style, config in .php-cs-fixer.dist.php
make php-cs-fixer-test-docker   # same, via the pinned docker image (matches CI)
make php-cs-fixer-apply-docker
./lizmap-ctl phpstan        # PHPStan static analysis (from tests/), config in phpstan.neon / phpstan-baseline.neon
```
`pre-commit install` (after `pip install pre-commit`) wires up trailing-whitespace, eslint, stylelint and
php-cs-fixer hooks automatically — see `.pre-commit-config.yaml`.

## Architecture

### PHP side: Jelix modules
The PHP app is built on the [Jelix](https://jelix.org) framework (MVC: controllers → actions → responses,
with `.classic.php` controller files, `zones` for reusable view fragments, `daos` for DB access, `forms`).
Modules live under `lizmap/modules/`:
- `lizmap` — the core module: map display, project config parsing, attribute/feature handling
  (`classes/lizmapProject.class.php`, `qgisVectorLayer.class.php`, etc.), filter engine, WMTS, search.
- `admin` / `admin_api` — the administration UI and its REST-ish API (repositories, users, ACL).
- `action` — generic action/edition hook plumbing.
- `dataviz` — chart/dataviz plugin support.
- `filter` — server-side data filtering by user/group.
- `view` — shared view/template helpers.
- `proj4php` — bundled projection library.

Cross-cutting PHP library code (not modules) lives in `lizmap/modules/lizmap/lib/`: `Project/`, `Request/`,
`Server/`, `Form/`, `ActionQuery/`, `DataTables/`, `Events/`, `Users/`, `Logger/`, `App/`, `CliHelpers/`,
`Commands/`. Prefer adding new PHP classes here (PSR-4 autoloaded) rather than under `classes/`, which requires
registering in `module.xml` and a cache rebuild.

Configuration and runtime state (repositories, ACL, per-project config, uploaded data) live under
`lizmap/var/` — never commit generated content from there.

### JavaScript side
Legacy and modern JS coexist during an ongoing migration:
- `assets/src/legacy/` — old-style scripts (`map.js`, `attributeTable.js`, `edition.js`, `filter.js`,
  `switcher-layers-actions.js`, `timemanager.js`, etc.) attached to the global `lizMap` object. ESLint
  deliberately ignores this directory (see `eslint.config.mjs`).
  Historically built on OpenLayers 2; this is **actively being migrated off OL2** (see git history /
  `remove-openlayers-2` work) onto the OL10-based modules below.
  Also progressively being migrated onto the module system below piece by piece — new work should avoid this
  directory when a `modules/`/`components/` equivalent is feasible.
- `assets/src/modules/` — the modern core: `Lizmap.js` (the main class, instantiated as `mainLizmap`),
  `Globals.js` (exports `mainLizmap` / `mainEventDispatcher`), `Config.js`, `State.js`, plus feature modules
  (`Digitizing.js`, `Edition.js`, `Layers.js`, `Legend.js`, `Search.js`, `WFS.js`, `WMS.js`, `FilterManager`
  under `modules/` per-feature namespacing, etc.).
- `assets/src/components/` — self-contained UI components (custom elements / lit-html based), e.g.
  `Treeview.js`, `FeaturesTable.js`, `Print.js`, `NavBar.js`, `Digitizing.js` (UI layer over the module).
- `assets/src/index.js` is the bundle entry point: it imports all components/modules, wires up
  `mainLizmap`/`mainEventDispatcher`, and (if not already present) attaches `lizMap` on `globalThis` for the
  legacy code to consume — so legacy and modern code share the same runtime state via `mainLizmap`.
- Build config: `assets/webpack.common.js` (+ `.dev.js`/`.prod.js`) via rspack, output to
  `lizmap/www/assets/js/` (git-ignored).

When touching JS, prefer the `modules/`/`components/` architecture over `legacy/`, and route cross-module
communication through `mainEventDispatcher` rather than ad hoc globals.

### Tests directory structure
- `tests/units/` — PHPUnit tests, mirroring module structure; `testslib/` holds helper/`*ForTests` classes
  (autoloaded, no manual `require` needed); `tmp/` is scratch space for test runs.
- `tests/js-units/` — Mocha unit tests for JS (`node/` for Node-runnable specs, `fixtures.js` global setup).
- `tests/end2end/` — Playwright specs (`playwright/`) and BATS specs (`bats/`), plus `othersite/` fixtures used
  for CORS/cross-origin session-cookie tests.
- `tests/qgis-projects/` — QGIS project files (`.qgs`/`.qgs.cfg`) and SQL fixtures used by the Docker stack and
  e2e tests; `load_sql.sh` populates PostgreSQL with test data (required before running Playwright tests).
- `tests/docker-compose.yml` + `lizmap-ctl` — the full local stack: nginx, PHP-FPM, QGIS Server, PostgreSQL,
  optionally LDAP/Redis/Swagger (`--profile dev`).

## Commit conventions

- Base new branches on `master` (bug fixes land there too; backport to `release_X_Y` via the backport bot or a
  manual cherry-pick).
- Prefix commit subjects with a bracketed type, e.g. `[FEATURE]`, `[BUGFIX]`.
- Reference related GitHub issues in the commit message.
- Only `en_US` locale files should be hand-edited in PRs; all other translations flow through Transifex.
