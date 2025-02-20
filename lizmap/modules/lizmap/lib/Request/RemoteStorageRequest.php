<?php

/**
 * Utilities for upload, delete and retrieve resources from remote storage.
 *
 * @author
 * @copyright 2012-2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

use GuzzleHttp\Client as GuzzleHttpClient;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Utils as Psr7Utils;

class RemoteStorageRequest
{
    protected static $webDAVNamespace = 'DAV:';

    protected static $fileNameExpression = '/file_name\(\s*@selected_file_path\s*\)/';
    protected static $appContext;

    public static $davUrlRootPrefix = 'dav/';

    /**
     * @param string $storageUrl remote destination path
     * @param string $file       the file path to upload
     *
     * @return array{0: null|string, 1: int, 2: string} Array url of the uploaded file (0: string), HTTP code (1: int), message (2: string)
     */
    public static function uploadToWebDAVStorage($storageUrl, $file)
    {
        $resource = null;
        $http_code = 400;
        $message = null;
        $returnUrl = null;
        // checks on file
        if (!is_file($file)) {
            return array(null, 400, 'The file is not valid');
        }

        try {
            $resource = Psr7Utils::tryFopen($file, 'r');
        } catch (\RuntimeException $e) {
            return array(null, 400, 'Error on file upload');
        }

        // get profile connection parameters
        $profile = self::getProfile('webdav');

        if ($profile) {
            // baseUri check
            if (strpos($storageUrl, $profile['baseUri']) === 0) {
                $opt = array();

                $stream = Psr7Utils::streamFor($resource);
                $opt['body'] = $stream;
                $client = self::buildClient($profile);

                try {
                    $response = $client->request('PUT', $storageUrl, $opt);
                    $returnUrl = $storageUrl;
                    $http_code = $response->getStatusCode();
                } catch (RequestException $e) {
                    $message = 'Error on file upload '.$e->getMessage();
                    if ($e->hasResponse()) {
                        $http_code = $e->getResponse()->getStatusCode();
                    }
                } catch (\Exception $e) {
                    $http_code = 500;
                    $message = 'Error on file upload '.$e->getMessage();
                }
            } else {
                $message = 'Invalid path '.$storageUrl;
            }
        } else {
            $message = 'WebDAV configuration not found';
        }

        return array($returnUrl, $http_code, $message);
    }

    /**
     * @param string $storageUrl storage url
     * @param string $fileName   the file to delete
     *
     * @return array{0: int, 1: string} Array HTTP code(0: int), message (1: string)
     */
    public static function deleteFromWebDAVStorage($storageUrl, $fileName)
    {
        $http_code = null;
        $message = '';

        $profile = self::getProfile('webdav');

        if ($profile) {
            // check if remote endpoint match the baseUri configuration
            if (strpos($storageUrl, $profile['baseUri']) !== 0) {
                $http_code = 500;
                $message = 'Invalid file '.$fileName;
            } else {
                if (!self::isFileRemoteWebDAVResource($storageUrl, $fileName)) {
                    $http_code = 404;
                    $message = 'Resource '.$fileName.' is not a file';
                } else {
                    // deleting file
                    $client = self::buildClient($profile);

                    try {
                        $response = $client->request('DELETE', $storageUrl.$fileName);
                        $http_code = $response->getStatusCode();
                    } catch (RequestException $e) {
                        $message = 'Error on deleting remote file '.$e->getMessage();
                        if ($e->hasResponse()) {
                            $http_code = $e->getResponse()->getStatusCode();
                        }
                    } catch (\Exception $e) {
                        $http_code = 500;
                        $message = 'Error on deleting remote file '.$e->getMessage();
                    }
                }
            }
        }

        return array($http_code, $message);
    }

    /**
     * check if resource is a file on remote WebDAV storage.
     *
     * @param string $storageUrl remote destination path
     * @param string $fileName   the file to check
     *
     * @return bool
     */
    public static function isFileRemoteWebDAVResource($storageUrl, $fileName)
    {
        $profile = self::getProfile('webdav');

        if ($profile) {
            $client = self::buildClient($profile);

            try {
                $response = $client->request('PROPFIND', $storageUrl.$fileName);
            } catch (RequestException $e) {
                return false;
            } catch (\Exception $e) {
                return false;
            }

            $xml = simplexml_load_string($response->getBody());

            $children = $xml->children(self::$webDAVNamespace);

            if (isset($children->response)) {
                $response = $children->response;
                $response->registerXPathNamespace('dav', self::$webDAVNamespace);
                $resourcetype = $response->xpath('//dav:resourcetype');
                if (isset($resourcetype) && count($resourcetype) == 1) {
                    $resourcetype[0]->rewind();
                    $resourceTp = $resourcetype[0];
                    $resourceTpChild = $resourceTp->children(self::$webDAVNamespace);

                    // not clear how to identify if resource is a file
                    // it seems that if the node "resourcetype" has no children
                    // then the resource is a file

                    // TODO further investigation on this control
                    $isFile = true;
                    foreach ($resourceTpChild as $chh) {
                        $nodeName = $chh->getName();
                        if (trim($nodeName) != '') {
                            $isFile = false;

                            break;
                        }
                    }

                    return $isFile;
                }
            }
        }

        return false;
    }

    public static function getRemoteFile($storageUrl, $fileName)
    {
        $profile = self::getProfile('webdav');
        if ($profile) {
            if (strpos($storageUrl, $profile['baseUri']) === 0) {
                if (!self::isFileRemoteWebDAVResource($storageUrl, $fileName)) {
                    self::getAppContext()->logMessage('Resource '.$fileName.' is not a file', 'error');
                } else {
                    $opt = array();
                    $client = self::buildClient($profile);

                    \jFile::createDir(\jApp::tempPath('davDownloads/'));
                    $tempFile = \jApp::tempPath('davDownloads/'.uniqid('dav_', true).'-'.$fileName);

                    $output = Psr7Utils::streamFor(fopen($tempFile, 'w+'));
                    $opt['sink'] = $output;

                    try {
                        $response = $client->request('GET', $storageUrl.$fileName, $opt);

                        return $tempFile;
                    } catch (RequestException $e) {
                        self::getAppContext()->logMessage($e->getMessage(), 'error');

                        return null;
                    } catch (\Exception $e) {
                        self::getAppContext()->logMessage($e->getMessage(), 'error');

                        return null;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Check if remote storage is reachable on set configuration.
     *
     * @return bool
     */
    public static function checkWebDAVStorageConnection()
    {
        $profile = self::getProfile('webdav');
        if ($profile) {
            $client = self::buildClient($profile);

            try {
                $response = $client->request('GET', $profile['baseUri']);

                return true;
            } catch (RequestException $e) {
                return false;
            } catch (\Exception $e) {
                return false;
            }
        }

        return false;
    }

    public static function getAppContext()
    {
        if (!self::$appContext) {
            self::$appContext = \lizmap::getAppContext();
        }

        return self::$appContext;
    }

    public static function getProfile($storageType, $profileName = 'default')
    {
        $context = self::getAppContext();
        $profile = null;

        try {
            $webDavProfile = $context->getProfile($storageType, $profileName, true);
            if ($webDavProfile && is_array($webDavProfile) && array_key_exists('enabled', $webDavProfile) && $webDavProfile['enabled'] == 1 && array_key_exists('baseUri', $webDavProfile)) {
                $profile = $webDavProfile;
            }
        } catch (\Exception $e) {
            $profile = null;
        }

        return $profile;
    }

    /**
     * Return the WebDAV URL or null if fails
     * The function assumes that the last part of the url is the filename and is defined as "file_name(@selected_file_path)".
     *
     * @param string      $storageUrl remote destination folder
     * @param null|string $filename   file name, if null return the base path
     *
     * @return null|string
     */
    public static function getRemoteUrl($storageUrl, $filename = null)
    {
        if ($filename) {
            // TODO @selected_file_path property is not evaluated, for now replace the expression with the file name
            return preg_replace(self::$fileNameExpression, "'".$filename."'", $storageUrl);
        }

        return preg_replace(self::$fileNameExpression, "''", $storageUrl);
    }

    /**
     * Create HttpClient for WebDAV requests.
     *
     * @param array $profile The WebDAV profile
     *
     * @return GuzzleHttpClient
     */
    protected static function buildClient($profile)
    {
        $opt = array();
        $headers = array();
        $headers['User-Agent'] = 'lizmap-user-agent';

        if (array_key_exists('user', $profile) && array_key_exists('password', $profile)) {
            $opt['auth'] = array();
            array_push($opt['auth'], $profile['user']);
            array_push($opt['auth'], $profile['password']);
        }
        $opt['headers'] = $headers;

        return new GuzzleHttpClient($opt);
    }
}
