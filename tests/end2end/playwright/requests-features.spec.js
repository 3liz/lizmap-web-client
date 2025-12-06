// @ts-check
import { test, expect } from '@playwright/test';

test.describe('displayExpression @requests @readonly', () => {
    test('filter_layer_by_user blue_filter_layer_by_user for anonymous', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
            layerId: 'filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0',
            exp_filter: '', // required
        });
        let url = `/index.php/lizmap/features/displayExpression?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {};
        let response = await request.get(url, {
            headers: headers,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('status', 'success');
        expect(body).toHaveProperty('error', null);
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveLength(0);
    });

    test('filter_layer_by_user blue_filter_layer_by_user for user_in_group_a', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
            layerId: 'filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0',
            exp_filter: '', // required
        });
        let url = `/index.php/lizmap/features/displayExpression?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("user_in_group_a:admin")
        };
        let response = await request.get(url, {
            headers: headers,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('status', 'success');
        expect(body).toHaveProperty('error', null);
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveLength(1);
    });

    test('filter_layer_by_user blue_filter_layer_by_user for admin', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
            layerId: 'filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0',
            exp_filter: '', // required
        });
        let url = `/index.php/lizmap/features/displayExpression?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("admin:admin")
        };
        let response = await request.get(url, {
            headers: headers,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('status', 'success');
        expect(body).toHaveProperty('error', null);
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveLength(3);
    });
});
