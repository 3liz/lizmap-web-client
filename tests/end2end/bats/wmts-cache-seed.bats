#!/usr/bin/env bats

setup() {
    load 'helpers/common-setup'
    _common_setup
    load 'helpers/file'
}

@test "wmts:cache:seed failed missing all parameters" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run
    assert_failure
    assert_output --partial 'Not enough arguments (missing: "repository, project, layers, TileMatrixSet,'
    assert_output --partial ' TileMatrixMin, TileMatrixMax").'
    assert_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    assert_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed missing parameters except repository" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository
    assert_failure
    assert_output --partial 'Not enough arguments (missing: "project, layers, TileMatrixSet, TileMatrixM'
    assert_output --partial 'in, TileMatrixMax").'
    assert_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    assert_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed missing parameters except repository and project" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache
    assert_failure
    assert_output --partial 'Not enough arguments (missing: "layers, TileMatrixSet, TileMatrixMin, TileM'
    assert_output --partial 'atrixMax").'
    assert_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    assert_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed missing parameters except repository, project, layer and TileMatrixSet" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857
    assert_failure
    assert_output --partial 'Not enough arguments (missing: "TileMatrixMin, TileMatrixMax").'
    assert_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    assert_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed missing parameters except repository, project, layer, TileMatrixSet and TileMatrixMin" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10
    assert_failure
    assert_output --partial 'Not enough arguments (missing: "TileMatrixMax").'
    assert_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    assert_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed unkown repository" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run unkownrepository cache Quartiers EPSG:3857 10 10
    assert_failure
    assert_output --partial 'Unknown repository!'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed unkown project" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository unknown Quartiers EPSG:3857 10 10
    assert_failure
    assert_output --partial 'The project has not be found!'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed unkown layer" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache unknown EPSG:3857 10 10
    assert_failure
    assert_output --partial "The layers 'unknown' have not be found!"
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed unkown TileMatrixSet (crs)" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers unknown 10 10
    assert_failure
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial "The TileMatrixSet 'unknown' has not be found!"
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed not int TileMatrixMin" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 BadMin 10
    assert_failure
    assert_output --partial 'TileMatrixMin and TileMatrixMax must be of type int'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed not int TileMatrixMax" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10 BadMax
    assert_failure
    assert_output --partial 'TileMatrixMin and TileMatrixMax must be of type int'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed TileMatrixMax less than or equal to TileMatrixMin" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10 8
    assert_failure
    assert_output --partial 'TileMatrixMax must be greater or equal to TileMatrixMin'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed optional bbox does not contain int" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox xmin,ymin,xmax,ymax testsrepository cache Quartiers EPSG:3857 10 10
    assert_failure
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial 'The optional bbox has to contain 4 numbers separated by comma!'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed failed optional bbox is not well formed" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 417094.94691622,5398163.2080343 testsrepository cache Quartiers EPSG:3857 10 10
    assert_failure
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial 'The optional bbox has to contain 4 numbers separated by comma!'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed dry run succeeded from 0 to 3" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 0 3
    assert_success
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial '1 tiles to generate for "Quartiers" "EPSG:3857" "0"'
    assert_output --partial '1 tiles to generate for "Quartiers" "EPSG:3857" "1"'
    assert_output --partial '1 tiles to generate for "Quartiers" "EPSG:3857" "2"'
    assert_output --partial '1 tiles to generate for "Quartiers" "EPSG:3857" "3"'
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" between "0" and "3"'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed dry run succeeded for 10" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10 10
    assert_success
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" "10"'
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed dry run succeeded for 10 with project bbox" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 417094.94691622,5398163.2080343,445552.52931222,5412833.0143902 testsrepository cache Quartiers EPSG:3857 10 10
    assert_success
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" "10"'
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed dry run succeeded for 10 with bbox out" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 617094.94691622,5598163.2080343,645552.52931222,5612833.0143902 testsrepository cache Quartiers EPSG:3857 10 10
    assert_success
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    refute_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" "10"'
    assert_output --partial '0 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:seed dry run succeeded for 10 with small bbox" {
    run lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 433997,5405228,433997,5405228 testsrepository cache Quartiers EPSG:3857 10 10
    assert_success
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial '1 tiles to generate for "Quartiers" "EPSG:3857" "10"'
    assert_output --partial '1 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
}

@test "wmts:cache:clean & wmts:cache:seed" {
    run lizmap-ctl console wmts:cache:clean -v testsrepository cache Quartiers
    assert_success
    assert_output --partial "Start cleaning"

    assert_not_exists "$TESTS_ROOT/tmp/testsrepository/cache/Quartiers"

    run lizmap-ctl console wmts:cache:seed -v -f testsrepository cache Quartiers EPSG:3857 10 10
    assert_success
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" "10"'
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"'
    refute_output --partial 'wmts:cache:seed [--dry-run] [--bbox BBOX] [-f|--force] [--]'
    refute_output --partial '<repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'
    assert_output --partial "Start generation"
    assert_output --partial "End generation"

    assert_exists "$TESTS_ROOT/tmp/testsrepository"
    assert_exists "$TESTS_ROOT/tmp/testsrepository/cache"
    assert_exists "$TESTS_ROOT/tmp/testsrepository/cache/Quartiers"
    assert_exists "$TESTS_ROOT/tmp/testsrepository/cache/Quartiers/EPSG_3857"
    assert_exists "$TESTS_ROOT/tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_"

    assert_count_files "$TESTS_ROOT/tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_" 4

    run lizmap-ctl console wmts:cache:seed -v -f testsrepository cache Quartiers EPSG:3857 11 15
    assert_success
    assert_output --partial "The TileMatrixSet 'EPSG:3857'!"
    assert_output --partial '4 tiles to generate for "Quartiers" "EPSG:3857" "11"'
    assert_output --partial '6 tiles to generate for "Quartiers" "EPSG:3857" "12"'
    assert_output --partial '16 tiles to generate for "Quartiers" "EPSG:3857" "13"'
    assert_output --partial '42 tiles to generate for "Quartiers" "EPSG:3857" "14"'
    assert_output --partial '156 tiles to generate for "Quartiers" "EPSG:3857" "15"'
    assert_output --partial '224 tiles to generate for "Quartiers" "EPSG:3857" between "11" and "15"'
    assert_output --partial "Start generation"
    assert_output --partial "Progression: 5%, 12 tiles generated on 224 tiles"
    assert_output --partial "Progression: 10%, 23 tiles generated on 224 tiles"
    assert_output --partial "Progression: 15%, 34 tiles generated on 224 tiles"
    assert_output --partial "Progression: 20%, 45 tiles generated on 224 tiles"
    assert_output --partial "Progression: 25%, 56 tiles generated on 224 tiles"
    assert_output --partial "Progression: 30%, 68 tiles generated on 224 tiles"
    assert_output --partial "Progression: 35%, 79 tiles generated on 224 tiles"
    assert_output --partial "Progression: 40%, 90 tiles generated on 224 tiles"
    assert_output --partial "Progression: 45%, 101 tiles generated on 224 tiles"
    assert_output --partial "Progression: 50%, 112 tiles generated on 224 tiles"
    assert_output --partial "Progression: 55%, 124 tiles generated on 224 tiles"
    assert_output --partial "Progression: 60%, 135 tiles generated on 224 tiles"
    assert_output --partial "Progression: 65%, 146 tiles generated on 224 tiles"
    assert_output --partial "Progression: 70%, 157 tiles generated on 224 tiles"
    assert_output --partial "Progression: 75%, 168 tiles generated on 224 tiles"
    assert_output --partial "Progression: 80%, 180 tiles generated on 224 tiles"
    assert_output --partial "Progression: 85%, 191 tiles generated on 224 tiles"
    assert_output --partial "Progression: 90%, 202 tiles generated on 224 tiles"
    assert_output --partial "Progression: 95%, 213 tiles generated on 224 tiles"
    assert_output --partial "Progression: 100%, 224 tiles generated on 224 tiles"
    assert_output --partial "End generation"

    assert_count_files "$TESTS_ROOT/tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_" 228

    run lizmap-ctl console wmts:cache:clean -v testsrepository cache Quartiers
    assert_success
    assert_output --partial "Start cleaning"

    assert_not_exists "$TESTS_ROOT/tmp/testsrepository/cache/Quartiers"
}
