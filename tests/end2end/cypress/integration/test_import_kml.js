// describe('Import KML', function() {
//     // Link to describe how to import a file
//     // https://stackoverflow.com/questions/47074225/how-to-test-file-inputs-with-cypress

//     beforeEach(function(){
//         // Runs before each import test in this block
//         cy.visit('/index.php/view/map/?repository=testsrepository&project=test_import_kml')
//         // Click on the "Draw" button
//         cy.get('#button-draw').click()
//     })

//     it('import kml_multilinestring', function(){
//         // Fixture is used to load the data in the `kml_multilinestring.kml` file
//         // https://docs.cypress.io/api/commands/fixture
//         cy.fixture('kml_multilinestring.kml').then(fileContent => {
//             // Put the file in the input of the popup
//             cy.get('input[type="file"]').attachFile({
//                 fileContent: fileContent.toString(),
//                 fileName: 'kml_multilinestring.kml',
//                 mimeType: 'kml'
//             })
//         })

//         // Wait for the kml file to be fully loaded
//         cy.wait(500)
//         // Take a snapshot to compare it to the `test_kml_multilinestring` snapshot
//         // Check that KML file is properly imported
//         // Check that map is zoomed and centered to exported fixtures
//         // Clip crop the snapshot to a specific position and size
//         // https://docs.cypress.io/api/commands/screenshot#Clip
//         cy.get('#newOlMap').matchImageSnapshot('test_kml_multilinestring', {clip: {x: 150, y:260, width: 970, height: 200}})
//     })

//     it('import kml_multipoint', function(){
//         cy.fixture('kml_multipoint.kml').then(fileContent => {
//             cy.get('input[type="file"]').attachFile({
//                 fileContent: fileContent.toString(),
//                 fileName: 'kml_multipoint.kml',
//                 mimeType: 'kml'
//             })
//         })
//         cy.wait(500)
//         cy.get('#newOlMap').matchImageSnapshot('test_kml_multipoint', {clip: {x: 150, y:260, width: 970, height: 200}})
//     })

//     it('import kml_multipolygon', function(){
//         cy.fixture('kml_multipolygon.kml').then(fileContent => {
//             cy.get('input[type="file"]').attachFile({
//                 fileContent: fileContent.toString(),
//                 fileName: 'kml_multipolygon.kml',
//                 mimeType: 'kml'
//             })
//         })
//         cy.wait(500)
//         cy.get('#button-draw').click()
//         cy.get('#newOlMap').matchImageSnapshot('test_kml_multipolygon', {clip: {x: 260, y:70, width: 730, height: 580}})
//     })

//     it('import kml_polygon', function(){
//         cy.fixture('kml_polygon.kml').then(fileContent => {
//             cy.get('input[type="file"]').attachFile({
//                 fileContent: fileContent.toString(),
//                 fileName: 'kml_polygon.kml',
//                 mimeType: 'kml'
//             })
//         })
//         cy.wait(500)
//         cy.get('#button-draw').click()
//         cy.get('#newOlMap').matchImageSnapshot('test_kml_polygon', {clip: {x: 120, y:50, width: 898, height: 620}})
//     })

//     it('import kml_without_xml_header', function(){
//         cy.fixture('kml_without_xml_header.kml').then(fileContent => {
//             cy.get('input[type="file"]').attachFile({
//                 fileContent: fileContent.toString(),
//                 fileName: 'kml_without_xml_header.kml',
//                 mimeType: 'kml'
//             })
//         })
//         cy.wait(500)
//         cy.get('#newOlMap').matchImageSnapshot('test_kml_without_xml_header', {clip: {x: 613, y:350, width: 25, height: 25}})
//     })

//     it('import kml_with_xml_header', function(){
//         cy.fixture('kml_with_xml_header.kml').then(fileContent => {
//             cy.get('input[type="file"]').attachFile({
//                 fileContent: fileContent.toString(),
//                 fileName: 'kml_with_xml_header.kml',
//                 mimeType: 'kml'
//             })
//         })
//         cy.wait(500)
//         cy.get('#newOlMap').matchImageSnapshot('test_kml_with_xml_header', {clip: {x: 613, y:350, width: 25, height: 25}})
//     })
// })
