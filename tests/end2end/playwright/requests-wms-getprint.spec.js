// @ts-check
import { test, expect } from '@playwright/test';
import { digestBuffer } from "./globals";
import { expect as responseExpect } from './fixtures/expect-response.js'

test.describe('WMS GetPrint Requests @requests @readonly', () => {
    test('PDF format', async({ request }) => {

        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'print',
        });

        const formData = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'print_labels',
            'FORMAT_OPTIONS': 'TEXT_RENDER_FORMAT:AlwaysText',
            'map0:EXTENT': '767762.049,6277517.116350001,773437.049,6281267.116350001',
            'map0:SCALE': '25000',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'simple_label': 'simple+label',
            'multiline_label': 'Multiline+label',
        };
        const expectedHeaders = {
            'cache-control': 'maxage=3600',
            'content-description': 'File Transfert',
            'content-disposition': 'attachment; filename="print_print_labels.pdf"',
            'content-transfer-encoding': 'binary',
            'content-length': /\d*/,
            'content-type': 'application/pdf',
        }

        const url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: formData,
        });
        // check response
        responseExpect(response).toBePdf();
        responseExpect(response).toContainHeaders(expectedHeaders);
        const contentLength = response.headers()['content-length'];
        const bodyHash = await digestBuffer(await response.body());

        // Custom scale
        response = await request.post(url, {
            form: Object.assign(
                {},
                formData,
                {
                    'map0:EXTENT': '766816.2535,6276892.141350001,774382.8445,6281892.09135',
                    'map0:SCALE': '33333',
                },
            )
        });
        // check response
        responseExpect(response).toBePdf();
        responseExpect(response).toContainHeaders(expectedHeaders);
        expect(response.headers()['content-length']).not.toBe(contentLength);
        expect(await digestBuffer(await response.body())).not.toBe(bodyHash);

        // Other template
        response = await request.post(url, {
            form: Object.assign(
                {},
                formData,
                {
                    'TEMPLATE': 'print_overview',
                },
            )
        });
        // check response
        responseExpect(response).toBePdf();
        responseExpect(response).toContainHeaders(Object.assign(
            {},
            expectedHeaders,
            {
                'content-disposition': 'attachment; filename="print_print_overview.pdf"',
            },
        ));
        expect(response.headers()['content-length']).not.toBe(contentLength);
        expect(await digestBuffer(await response.body())).not.toBe(bodyHash);

        // Highlight
        /* eslint-disable no-useless-escape, @stylistic/js/max-len --
         * Block of SLD
        **/
        response = await request.post(url, {
            form: Object.assign(
                {},
                formData,
                {
                    'map0:HIGHLIGHT_GEOM': 'CURVEPOLYGON(CIRCULARSTRING(772265.0 6279008.0, 775229.0 6281972.0, 778193.0 6279008.0, 775229.0 6276044.0, 772265.0 6279008.0))',
                    'map0:HIGHLIGHT_SYMBOL': `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
    <StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.1.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd\" xmlns:se=\"http://www.opengis.net/se\">
            <UserStyle>
                <FeatureTypeStyle>
                    <Rule>
                        <PolygonSymbolizer>
                <Stroke>
            <SvgParameter name=\"stroke\">#ff0000</SvgParameter>
            <SvgParameter name=\"stroke-opacity\">1</SvgParameter>
            <SvgParameter name=\"stroke-width\">2</SvgParameter>
        </Stroke>
        <Fill>
            <SvgParameter name=\"fill\">#ff0000</SvgParameter>
            <SvgParameter name=\"fill-opacity\">0.2</SvgParameter>
        </Fill>
            </PolygonSymbolizer>
                    </Rule>
                </FeatureTypeStyle>
            </UserStyle>
        </StyledLayerDescriptor>`,
                },
            )
        });
        /* eslint-enable no-useless-escape, @stylistic/js/max-len */
        // check response
        responseExpect(response).toBePdf();
        responseExpect(response).toContainHeaders(expectedHeaders);
        expect(response.headers()['content-length']).not.toBe(contentLength);
        expect(await digestBuffer(await response.body())).not.toBe(bodyHash);
    })

    test('application/pdf format', async({ request }) => {

        const params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'print',
        });

        const formData = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'application/pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'print_labels',
            'FORMAT_OPTIONS': 'TEXT_RENDER_FORMAT:AlwaysText',
            'map0:EXTENT': '767762.049,6277517.116350001,773437.049,6281267.116350001',
            'map0:SCALE': '25000',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'simple_label': 'simple+label',
            'multiline_label': 'Multiline+label',
        };

        const url = `/index.php/lizmap/service?${params}`;
        const response = await request.post(url, {form:formData});
        // check response
        responseExpect(response).toBePdf();
        responseExpect(response).toContainHeaders({
            'cache-control': 'maxage=3600',
            'content-description': 'File Transfert',
            'content-disposition': 'attachment; filename="print_print_labels.pdf"',
            'content-transfer-encoding': 'binary',
            'content-length': /\d*/,
            'content-type': 'application/pdf',
        });
    })
});
