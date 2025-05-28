// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Dataviz API tests',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test('Test JSON data for plot 0 - Municipalities', async ({request}) => {
            const response = await request.get(
                '/index.php/dataviz/service?repository=testsrepository&project=dataviz',
                {
                    params:{
                        'request': 'getPlot',
                        'plot_id': '0',
                    }
                });
            expect(response.status()).toBe(200);
            expect(response.headers()['content-type']).toBe('application/json');
            const content = await response.text();
            let json;
            try {
                json = await JSON.parse(content);
            } catch (error) {
                console.error(`Error while parsing to JSON : \n${error}\n${content}`);
            }
            expect(json).toHaveProperty('title', 'Municipalities');
            expect(json).toHaveProperty('data');
            expect(json.data).toHaveLength(1);
            expect(json.data[0]).toHaveProperty('type', 'bar');
            expect(json.data[0]).toHaveProperty('x');
            expect(json.data[0].x).toEqual(
                expect.arrayContaining([
                    "Grabels", "Clapiers", "Montferrier-sur-Lez", "Saint-Jean-de-Védas", "Lattes", "Montpellier",
                    "Lavérune", "Juvignac", "Le Crès", "Castelnau-le-Lez"
                ])
            );
            expect(json.data[0]).toHaveProperty('y');
            expect(json.data[0].y).toEqual(expect.arrayContaining([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
            expect(json).toHaveProperty('layout')
        });
    });
