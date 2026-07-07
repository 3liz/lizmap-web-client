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

echo "=== 1/4: @requests + @readonly (workers=1, avoids QGIS Server request contention) ==="
npx playwright test --grep "(?=.*@requests)(?=.*@readonly)" $PLAYWRIGHT_OPTIONS --workers=1

echo "=== 2/4: @readonly (excluding @requests), parallel-safe ==="
npx playwright test --grep @readonly --grep-invert @requests $PLAYWRIGHT_OPTIONS

echo "=== 3/4: untagged (neither @write nor @readonly), workers=1 ==="
npx playwright test --workers 1 --grep-invert "(?=.*@write|.*@readonly)" $PLAYWRIGHT_OPTIONS

echo "=== 4/4: @write (workers=1, mutates shared state) ==="
npx playwright test --workers 1 --grep @write $PLAYWRIGHT_OPTIONS
