#!/usr/bin/env bash

_common_setup() {
    load '../../../node_modules/bats-support/load'
    load '../../../node_modules/bats-assert/load'
    # get the containing directory of this file
    # use $BATS_TEST_FILENAME instead of ${BASH_SOURCE[0]} or $0,
    # as those will point to the bats executable's location or the preprocessed file respectively
    TESTS_ROOT="$( cd "$( dirname "$BATS_TEST_FILENAME" )/../../" >/dev/null 2>&1 && pwd )"
    # make executables in tests/ visible to PATH
    PATH="$TESTS_ROOT:$PATH"
}
