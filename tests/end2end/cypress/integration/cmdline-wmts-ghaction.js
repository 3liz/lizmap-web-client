describe('WMTS command line', function () {
    it('lizmap~wmts:capabilities success', function () {
        cy.exec('./../lizmap-ctl script lizmap~wmts:capabilities -v testsrepository cache')
            .its('stdout')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 0 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 1 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 2 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 3 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 4 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 5 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 6 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 7 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 8 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 9 has 6 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 10 has 9 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 11 has 9 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 12 has 12 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 13 has 25 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 14 has 56 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 15 has 182 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 16 has 624 tiles')

        cy.exec('./../lizmap-ctl script lizmap~wmts:capabilities -v testsrepository cache Quartiers EPSG:3857')
            .its('stdout')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 0 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 1 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 2 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 3 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 4 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 5 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 6 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 7 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 8 has 4 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 9 has 6 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 10 has 9 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 11 has 9 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 12 has 12 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 13 has 25 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 14 has 56 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 15 has 182 tiles')
            .should('contain', 'For "Quartiers" and "EPSG:3857" the TileMatrix 16 has 624 tiles')

    })

    it('lizmap~wmts:seeding success', function () {
        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '9 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '9 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')

        //417094.94691622, 5398163.2080343, 445552.52931222, 5412833.0143902
        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run -bbox 417094.94691622,5398163.2080343,445552.52931222,5412833.0143902 testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('contain', '9 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '9 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')

        // out of 417094.94691622, 5398163.2080343, 445552.52931222, 5412833.0143902
        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run -bbox 617094.94691622,5598163.2080343,645552.52931222,5612833.0143902 testsrepository cache Quartiers EPSG:3857 10 10')
            .its('stdout')
            .should('contain', 'The TileMatrixSet \'EPSG:3857\'!')
            .should('not.contain', '9 tiles to generate for "Quartiers" "EPSG:3857" "10"')
            .should('contain', '0 tiles to generate for "Quartiers" "EPSG:3857" between "10" and "10"')
    })

    it('lizmap~wmts:capabilities failed', function () {
        // Not enough parameters
        cy.exec('./../lizmap-ctl script lizmap~wmts:capabilities -v', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:capabilities -v testsrepository', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        // Bad parameters
        cy.exec('./../lizmap-ctl script lizmap~wmts:capabilities -v norepository cache', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:capabilities -v testsrepository unknown', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

    })

    it('lizmap~wmts:seeding failed', function () {
        // Not enough parameters
        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository cache', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository cache Quartiers', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository cache Quartiers EPSG:3857', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository cache Quartiers EPSG:3857 10', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        // Bad parameters
        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run norepository cache Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository unknown Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository cache unknown EPSG:3857 10 10', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run testsrepository cache Quartiers unknown 10 10', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run -bbox xmin,ymin,xmax,ymax testsrepository cache Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)

        cy.exec('./../lizmap-ctl script lizmap~wmts:seeding -v -f -dry-run -bbox 417094.94691622,5398163.2080343 testsrepository cache Quartiers EPSG:3857 10 10', {failOnNonZeroExit: false})
            .its('code').should('eq', 1)
    })
})
