// @ts-check
import { expect, test } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';

test.describe('Upload image security',
    {
        tag: ['@requests', '@readonly'],
    }, () => {

        test.use({ storageState: getAuthStorageStatePath('admin') });

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
    }
);
