#!/bin/bash
# Runs the full Playwright suite the same way CI does: partitioned by tag so that
# tests mutating shared server-side state (permalinks, ACL/repositories, features)
# never run concurrently with each other or with tests reading that state.
#
# Running the whole suite with a single `playwright test` (fullyParallel default)
# races @write/@requests/untagged tests against each other and against @readonly
# assertions on exact counts/content, causing tests to fail together while still
# passing individually. See .github/workflows/e2e_tests.yml for the origin of
# this partitioning.
set -e

cd "$(dirname "$0")"

PLAYWRIGHT_OPTIONS="${PLAYWRIGHT_OPTIONS:---project=chromium}"

# CI runs every job on a fresh docker stack and a fresh checkout. Locally the same
# stack is reused, so put back what the previous run changed. Set
# LIZMAP_E2E_SKIP_RESET=1 to keep the current state of the instance instead.
if [[ -z "${LIZMAP_E2E_SKIP_RESET}" ]]; then
    # Reload the test dataset: the "@write" tests create, delete and update rows,
    # and a few of the "@readonly" ones assert exact contents, so they need the
    # dataset the fixtures describe.
    echo "=== Reloading the test dataset (LIZMAP_E2E_SKIP_RESET=1 to skip) ==="
    ../qgis-projects/tests/load_sql.sh > /dev/null

    # `requests-api.spec.js` asks the admin API to create these directories and
    # there is no API to delete them, so a second run would get "the directory you
    # want to create already exists". rmdir only removes them when they are empty,
    # which is how the tests leave them.
    for leftover in grenoble_agglo folderNancy; do
        rmdir "../qgis-projects/$leftover" 2>/dev/null || true
    done
fi

echo "=== 1/4: @requests + @readonly (workers=1, avoids QGIS Server request contention) ==="
npx playwright test --grep "(?=.*@requests)(?=.*@readonly)" $PLAYWRIGHT_OPTIONS --workers=1

# Same worker count as CI. With the machine default (half of the cores) the
# concurrent load on QGIS Server and on PHP-FPM makes assertions on request
# timings and on exact table contents fail randomly.
echo "=== 2/4: @readonly (excluding @requests), workers=2 ==="
npx playwright test --grep @readonly --grep-invert @requests $PLAYWRIGHT_OPTIONS --workers=2

# The two serial partitions use the same config as CI: `fullyParallel: false` keeps
# the tests of a spec file together and in order, which those specs rely on.
echo "=== 3/4: untagged (neither @write nor @readonly), workers=1 ==="
npx playwright test --config playwright.serial.config.ts --workers 1 --grep-invert "(?=.*@write|.*@readonly)" $PLAYWRIGHT_OPTIONS

echo "=== 4/4: @write (workers=1, mutates shared state) ==="
npx playwright test --config playwright.serial.config.ts --workers 1 --grep @write $PLAYWRIGHT_OPTIONS
