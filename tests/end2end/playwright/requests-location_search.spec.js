// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js';
import { getAuthStorageStatePath } from './globals.js';

test.describe('Lizmap search  - anonymous -  @requests @readonly', () => {

    test('Project form_advanced', async({ request }) => {
        let params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'form_advanced',
            'query': 'ceve',
        });
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('Quartier');
        let quartier = body['Quartier'];
        expect(quartier).toHaveProperty('features');
        expect(quartier.features).toHaveLength(1);
        expect(quartier.features[0]).toHaveProperty('label', 'CV - LES CEVENNES');
        expect(quartier.features[0]).toHaveProperty('geometry');

        expect(body).not.toHaveProperty('Sous-Quartier');

        // Query Montpellier
        params.set('query', 'Montpellier');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('Quartier');
        quartier = body['Quartier'];
        expect(quartier).toHaveProperty('features');
        expect(quartier.features).toHaveLength(1);
        expect(quartier.features[0]).toHaveProperty('label', 'MC - MONTPELLIER CENTRE');

        expect(body).not.toHaveProperty('Sous-Quartier');

        // Query arceaux
        params.set('query', 'arceaux');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');

        expect(body).not.toHaveProperty('Sous-Quartier');
    });

    test('Project location_search', async({ request }) => {
        const params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'location_search',
            'query': 'Montpellier',
        });
        // Query Montpellier
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('Quartier');

        // Query Tokyo
        params.set('query', 'Tokyo');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');

        // Query cevennes
        params.set('query', 'cevennes');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('Quartier');

        // Query arceaux
        params.set('query', 'arceaux');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');
    });

    test('Check wrong requests', async ({request}) => {
        const params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'location_search',
            'query': '',
        });
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);

        params.set('query', 'Montpellier');
        params.set('project', 'does_not_exist');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);

        params.set('project', 'location_search');
        params.set('repository', 'does_not_exist');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);
    });
});

test.describe('Lizmap search  - user_in_group_a -  @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test('Project form_advanced', async({ request }) => {
        let params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'form_advanced',
            'query': 'ceve',
        });
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('Quartier');
        let quartier = body['Quartier'];
        expect(quartier).toHaveProperty('features');
        expect(quartier.features).toHaveLength(1);
        expect(quartier.features[0]).toHaveProperty('label', 'CV - LES CEVENNES');
        expect(quartier.features[0]).toHaveProperty('geometry');

        expect(body).not.toHaveProperty('Sous-Quartier');

        // Query Montpellier
        params.set('query', 'Montpellier');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('Quartier');
        quartier = body['Quartier'];
        expect(quartier).toHaveProperty('features');
        expect(quartier.features).toHaveLength(1);
        expect(quartier.features[0]).toHaveProperty('label', 'MC - MONTPELLIER CENTRE');

        expect(body).not.toHaveProperty('Sous-Quartier');

        // Query arceaux
        params.set('query', 'arceaux');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');

        expect(body).not.toHaveProperty('Sous-Quartier');
    });

    test('Project location_search', async({ request }) => {
        const params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'location_search',
            'query': 'Montpellier',
        });
        // Query Montpellier
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('Quartier');

        // Query Tokyo
        params.set('query', 'Tokyo');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');

        // Query cevennes
        params.set('query', 'cevennes');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('Quartier');

        // Query arceaux
        params.set('query', 'arceaux');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');
    });

    test('Check wrong requests', async ({request}) => {
        const params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'location_search',
            'query': '',
        });
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);

        params.set('query', 'Montpellier');
        params.set('project', 'does_not_exist');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);

        params.set('project', 'location_search');
        params.set('repository', 'does_not_exist');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);
    });
});


test.describe('Lizmap search  - admin -  @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('Project form_advanced', async({ request }) => {
        let params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'form_advanced',
            'query': 'ceve',
        });
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('Quartier');
        let quartier = body['Quartier'];
        expect(quartier).toHaveProperty('features');
        expect(quartier.features).toHaveLength(1);
        expect(quartier.features[0]).toHaveProperty('label', 'CV - LES CEVENNES');
        expect(quartier.features[0]).toHaveProperty('geometry');

        expect(body).toHaveProperty('Sous-Quartier');
        let sousQuartier = body['Sous-Quartier'];
        expect(sousQuartier).toHaveProperty('features');
        expect(sousQuartier.features).toHaveLength(1);
        expect(sousQuartier.features[0]).toHaveProperty('label', 'CVN - LES CEVENNES');
        expect(sousQuartier.features[0]).toHaveProperty('geometry');

        // Query Montpellier
        params.set('query', 'Montpellier');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('Quartier');
        quartier = body['Quartier'];
        expect(quartier).toHaveProperty('features');
        expect(quartier.features).toHaveLength(1);
        expect(quartier.features[0]).toHaveProperty('label', 'MC - MONTPELLIER CENTRE');

        expect(body).not.toHaveProperty('Sous-Quartier');

        // Query arceaux
        params.set('query', 'arceaux');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');

        expect(body).toHaveProperty('Sous-Quartier');
        sousQuartier = body['Sous-Quartier'];
        expect(sousQuartier).toHaveProperty('features');
        expect(sousQuartier.features).toHaveLength(1);
        expect(sousQuartier.features[0]).toHaveProperty('label', 'MCA - Les Arceaux');
    });

    test('Project location_search', async({ request }) => {
        const params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'location_search',
            'query': 'Montpellier',
        });
        // Query Montpellier
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('Quartier');

        // Query Tokyo
        params.set('query', 'Tokyo');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');

        // Query cevennes
        params.set('query', 'cevennes');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).toHaveProperty('Quartier');

        // Query arceaux
        params.set('query', 'arceaux');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson();

        // check body
        body = await response.json();
        expect(body).not.toHaveProperty('Quartier');
    });

    test('Check wrong requests', async ({request}) => {
        const params = new URLSearchParams({
            'repository': 'testsrepository',
            'project': 'location_search',
            'query': '',
        });
        let url = `/index.php/lizmap/searchFts/get?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);

        params.set('query', 'Montpellier');
        params.set('project', 'does_not_exist');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);

        params.set('project', 'location_search');
        params.set('repository', 'does_not_exist');
        url = `/index.php/lizmap/searchFts/get?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeJson(400);
    });
});
