#!/usr/bin/env bats

setup() {
    load 'helpers/common-setup'
    _common_setup
}

@test "wmts:capabilities failed missing repository and project" {
    run lizmap-ctl console wmts:capabilities
    assert_failure
    assert_output --partial 'Not enough arguments (missing: "repository, project").'
    assert_output --partial 'wmts:capabilities <repository> <project> [<layer> [<TileMatrixSet>]]'
}

@test "wmts:capabilities failed missing project" {
    run lizmap-ctl console wmts:capabilities testsrepository
    assert_failure
    assert_output --partial 'Not enough arguments (missing: "project").'
    assert_output --partial 'wmts:capabilities <repository> <project> [<layer> [<TileMatrixSet>]]'
}

@test "wmts:capabilities failed unknown repository" {
    run lizmap-ctl console wmts:capabilities unkownrepository cache
    assert_failure
    assert_output --partial 'Unknown repository!'
    refute_output --partial 'wmts:capabilities <repository> <project> [<layer> [<TileMatrixSet>]]'
}

@test "wmts:capabilities failed unknown project" {
    run lizmap-ctl console wmts:capabilities testsrepository unknown
    assert_failure
    assert_output --partial 'The project has not be found!'
    refute_output --partial 'wmts:capabilities <repository> <project> [<layer> [<TileMatrixSet>]]'
}

@test "wmts:capabilities failed unknown layer" {
    run lizmap-ctl console wmts:capabilities testsrepository cache unknown
    # command does not exit with 1
    assert_success
    assert_output --partial 'layer unknown not found'
    refute_output --partial 'wmts:capabilities <repository> <project> [<layer> [<TileMatrixSet>]]'
}

@test "wmts:capabilities failed unknown crs" {
    run lizmap-ctl console wmts:capabilities testsrepository cache Quartiers unknown
    # command does not exit with 1
    assert_success
    assert_output --partial 'TileMatrixSet unknown not found'
    refute_output --partial 'wmts:capabilities <repository> <project> [<layer> [<TileMatrixSet>]]'
}

@test "wmts:capabilities success repository and project" {
    run lizmap-ctl console wmts:capabilities -v testsrepository cache
    assert_success
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 0 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 1 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 2 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 3 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 4 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 5 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 6 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 7 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 8 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 9 has 2 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 10 has 4 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 11 has 4 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 12 has 6 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 13 has 16 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 14 has 42 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 15 has 156 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 16 has 575 tiles'
}

@test "wmts:capabilities success repository, project and layer" {
    run lizmap-ctl console wmts:capabilities -v testsrepository cache Quartiers
    assert_success
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 0 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 1 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 2 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 3 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 4 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 5 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 6 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 7 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 8 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 9 has 2 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 10 has 4 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 11 has 4 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 12 has 6 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 13 has 16 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 14 has 42 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 15 has 156 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 16 has 575 tiles'
}

@test "wmts:capabilities success repository, project, layer and crs" {
    run lizmap-ctl console wmts:capabilities -v testsrepository cache Quartiers EPSG:3857
    assert_success
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 0 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 1 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 2 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 3 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 4 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 5 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 6 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 7 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 8 has 1 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 9 has 2 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 10 has 4 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 11 has 4 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 12 has 6 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 13 has 16 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 14 has 42 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 15 has 156 tiles'
    assert_output --partial 'For "Quartiers" and "EPSG:3857" the TileMatrix 16 has 575 tiles'
}
