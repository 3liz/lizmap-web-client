import { clearErrorsLog } from './../support/function.js'
describe('WMTS command line', function () {

    it('wmts:capabilities success', function () {
        cy.exec('./../lizmap-ctl console wmts:capabilities -v testsrepository cache')
            .its('stdout')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 0 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 1 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 2 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 3 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 4 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 5 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 6 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 7 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 8 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 9 has 2 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 10 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 11 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 12 has 6 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 13 has 16 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 14 has 42 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 15 has 156 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 16 has 575 tiles')

        cy.exec('./../lizmap-ctl console wmts:capabilities -v testsrepository cache Quartiers EPSG:3857')
            .its('stdout')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 0 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 1 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 2 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 3 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 4 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 5 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 6 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 7 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 8 has 1 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 9 has 2 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 10 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 11 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 12 has 6 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 13 has 16 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 14 has 42 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 15 has 156 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 16 has 575 tiles')

    })

    it('wmts:cache:seed --dry-run success', function () {
        // Get tiles number for zoom level from 0 to 3 (1 for each = 4)
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 0 3')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '1 tiles to generate for "Quartiers" "EPSG:3857" "0"')
            .should('contain', '1 tiles to generate for "Quartiers" "EPSG:3857" "1"')
            .should('contain', '1 tiles to generate for "Quartiers" "EPSG:3857" "2"')
            .should('contain', '1 tiles to generate for "Quartiers" "EPSG:3857" "3"')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" between "0" and "3"')

        // Get tiles number for zoom level 10
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')

        // Get tiles number for zoom level 10 and the project extent
        //417094.94691622, 5398163.2080343, 445552.52931222, 5412833.0143902
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 417094.94691622,5398163.2080343,445552.52931222,5412833.0143902 testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')

        // Get tiles number for zoom level 10 and bbox out of the project extent
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 617094.94691622,5598163.2080343,645552.52931222,5612833.0143902 testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('not.contain', '4 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '0 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')

        // Get tiles number for zoom level 10 and small bbox (1x1) in the project extent
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 433997,5405228,433997,5405228 testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '1 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '1 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')
    })

    it('wmts:cache:clean & wmts:cache:seed', function () {
        // Cleaning the cache
        cy.exec('./../lizmap-ctl console wmts:cache:clean -v testsrepository cache Quartiers', {failOnNonZeroExit: false})
            .its('stdout')
            .should('contain', 'Start cleaning')

        // Check that the cache is empty
        cy.exec('./../lizmap-ctl docker-exec find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l')
            .its('stdout')
            .should('contain', '0')

        // Seeding the cache for zoom level 10
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')
            .should('contain', 'Start generation')
            .should('contain', 'End generation')

        // Check the cache
        cy.exec('./../lizmap-ctl docker-exec find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l')
            .its('stdout')
            .should('contain', '4')

        // Seeding the cache for zoom level 10 to 15
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f testsrepository cache Quartiers EPSG:3857 10 15')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '4 tiles to generate for "Quartiers" "EPSG:3857" "11"')
            .should('contain', '6 tiles to generate for "Quartiers" "EPSG:3857" "12"')
            .should('contain', '16 tiles to generate for "Quartiers" "EPSG:3857" "13"')
            .should('contain', '42 tiles to generate for "Quartiers" "EPSG:3857" "14"')
            .should('contain', '156 tiles to generate for "Quartiers" "EPSG:3857" "15"')
            .should('contain', '228 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "15"')
            .should('contain', 'Start generation')
            .should('contain', 'End generation')

        // Check the cache
        cy.exec('./../lizmap-ctl docker-exec find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l')
            .its('stdout')
            .should('contain', '228')

        // Go to the map
        cy.visit('/index.php/view/map/?repository=testsrepository&project=cache&bbox=425367.933686%2C5402026.205439%2C437311.219354%2C5408953.311127&crs=EPSG%3A3857')

        cy.wait(1000)

        // Check the cache
        cy.exec('./../lizmap-ctl docker-exec find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l')
            .its('stdout')
            .should('contain', '228')

        cy.loginAsAdmin();

        // Go to the map
        cy.visit('/index.php/view/map/?repository=testsrepository&project=cache&bbox=425367.933686%2C5402026.205439%2C437311.219354%2C5408953.311127&crs=EPSG%3A3857')

        cy.wait(1000)

        // Check the cache
        cy.exec('./../lizmap-ctl docker-exec find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l')
            .its('stdout')
            .should('contain', '228')

        // Logout
        cy.loginAsUserA()

        // Go to the map
        cy.visit('/index.php/view/map/?repository=testsrepository&project=cache&bbox=425367.933686%2C5402026.205439%2C437311.219354%2C5408953.311127&crs=EPSG%3A3857')

        cy.wait(1000)

        // Check the cache
        cy.exec('./../lizmap-ctl docker-exec find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l')
            .its('stdout')
            .should('contain', '228')

        // Logout
        cy.logout()

        cy.visit('index.php')

        // Cleaning the cache
        cy.exec('./../lizmap-ctl console wmts:cache:clean -v testsrepository cache Quartiers', {failOnNonZeroExit: false})
            .its('stdout')
            .should('contain', 'Start cleaning')

        // Check the cache
        cy.exec('./../lizmap-ctl docker-exec find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l')
            .its('stdout')
            .should('contain', '0')
    })


    it('wmts:capabilities failed', function () {
        // Not enough parameters
        cy.exec('./../lizmap-ctl console wmts:capabilities -v', { failOnNonZeroExit: false })
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('repository')
                expect(result.code).to.equal(1)
            })

        cy.exec('./../lizmap-ctl console wmts:capabilities -v testsrepository', { failOnNonZeroExit: false })
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('project')
                expect(result.code).to.equal(1)
            })

        // Bad parameters
        cy.exec('./../lizmap-ctl console wmts:capabilities -v norepository cache', { failOnNonZeroExit: false })
            .then((result) => {
                expect(result.stdout).to.contain('Unknown repository!')
                expect(result.code).to.equal(1)
            })

        cy.exec('./../lizmap-ctl console wmts:capabilities -v testsrepository unknown', { failOnNonZeroExit: false })
            .then((result) => {
                expect(result.stdout).to.contain('The project has not be found!')
                expect(result.code).to.equal(1)
            })

        // Clear errors
        clearErrorsLog()
    })

    it('wmts:cache:seed failed', function () {
        // Not enough parameters
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('repository')
                expect(result.code).to.equal(1)
            })



        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('project')
                expect(result.code).to.equal(1)
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('layers')
                expect(result.code).to.equal(1)
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('TileMatrixSet')
                expect(result.code).to.equal(1)
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('TileMatrixMin')
                expect(result.code).to.equal(1)
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.stderr).to.contain('missing')
                expect(result.stderr).to.contain('TileMatrixMax')
                expect(result.code).to.equal(1)
            })

        // Bad parameters
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run norepository cache Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain('Unknown repository!')
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository unknown Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain('The project has not be found!')
            })


        // Clear errors
        clearErrorsLog()

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache unknown EPSG:3857 10 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain('The layers \'unknown\' have not be found!')
            })

        clearErrorsLog()
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers unknown 10 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain("The TileMatrixSet 'EPSG:3857'!\nThe TileMatrixSet 'unknown' has not be found!")
            })

        clearErrorsLog()
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox xmin,ymin,xmax,ymax testsrepository cache Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain("The TileMatrixSet 'EPSG:3857'!\nThe optional bbox has to contain 4 numbers separated by comma!")
            })

        clearErrorsLog()
        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run --bbox 417094.94691622,5398163.2080343 testsrepository cache Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain("The TileMatrixSet 'EPSG:3857'!\nThe optional bbox has to contain 4 numbers separated by comma!")
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 BadMin 10', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain("TileMatrixMin and TileMatrixMax must be of type int")
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10 BadMax', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain("TileMatrixMin and TileMatrixMax must be of type int")
            })

        cy.exec('./../lizmap-ctl console wmts:cache:seed -v -f --dry-run testsrepository cache Quartiers EPSG:3857 10 8', {failOnNonZeroExit: false})
            .then((result) => {
                expect(result.code).to.equal(1)
                expect(result.stdout).to.contain("TileMatrixMax must be greater or equal to TileMatrixMin")
            })
    })
})
