describe('Check if an error occurred', function () {
//    it('Test to have an error', function () {
//        cy.gotoMap('/index.php/view/map/?repository=testsrepository&project=invalid_layer', false)
//
//        // Remove the log from the invalid layer.
//        cy.exec('./../lizmap-ctl docker-exec rm -f /srv/lzm/lizmap/var/log/errors.log', {failOnNonZeroExit: false})
//    })

    it('Test to not have an error', function () {
        cy.gotoMap('/index.php/view/map/?repository=testsrepository&project=attribute_table')
    })
})
