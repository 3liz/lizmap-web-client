// @ts-check
import { expect, test } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getAuthStorageStatePath } from './globals';

test.describe('Upload image security',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test.use({ storageState: getAuthStorageStatePath('admin') });

        test('Accept image file', async ({ request }) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const pngBuffer = readFileSync(resolve(__dirname, 'test_upload_file', 'one_pixel.png'));

            const response = await request.post('/admin.php/admin/upload_image/uploadfile', {
                multipart: {
                    upload: {
                        name: 'one_pixel.png',
                        mimeType: 'image/png',
                        buffer: pngBuffer,
                    },
                },
            });

            expect(response.ok()).toBeTruthy();
            const json = await response.json();
            expect(json).toHaveProperty('url');
            expect(json.url).toMatch(/\.png$/);
        });


        test('Reject PHP file disguised as image with GIF magic bytes', async ({ request }) => {
            const response = await request.post('/admin.php/admin/upload_image/uploadfile', {
                multipart: {
                    upload: {
                        name: 'hole.php',
                        mimeType: 'image/gif',
                        buffer: Buffer.from('GIF87a<?php echo \'hello\''),
                    },
                },
            });

            expect(response.ok()).toBeTruthy();
            const json = await response.json();
            expect(json).toEqual({
                error: {
                    message: 'Wrong file type. Only images are allowed',
                },
            });
        });

        test('Reject PHP file disguised as image with GIF magic bytes, not ended with .php', async ({ request }) => {
            const response = await request.post('/admin.php/admin/upload_image/uploadfile', {
                multipart: {
                    upload: {
                        name: 'hole.php.gif',
                        mimeType: 'image/gif',
                        buffer: Buffer.from('GIF87a<?php echo \'hello\''),
                    },
                },
            });

            expect(response.ok()).toBeTruthy();
            const json = await response.json();
            expect(json).toEqual({
                error: {
                    message: 'Wrong file type. Only images are allowed',
                },
            });
        });

        test('Reject PHP file disguised as image with GIF magic bytes and containing php code', async ({ request }) => {
            const response = await request.post('/admin.php/admin/upload_image/uploadfile', {
                multipart: {
                    upload: {
                        name: 'hole.gif',
                        mimeType: 'image/gif',
                        buffer: Buffer.from('GIF87a<?php echo \'hello\''),
                    },
                },
            });

            expect(response.ok()).toBeTruthy();
            const json = await response.json();
            expect(json).toEqual({
                error: {
                    message: 'Wrong file type. Only images are allowed',
                },
            });
        });
    }
);
