<?php
/**
 * Utilities for upload, delete and retreive resources from remote storage.
 *
 * @author
 * @copyright 2012-2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

use GuzzleHttp\Psr7;

class RemoteStorageRequest
{
    protected static $webDAVNamespace = 'DAV:';
    protected static $appContext;

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
            \jLog::log($file.' The file is not valid', 'error');

            return array(null, 400, 'The file is not valid');
        }

        try {
            $resource = Psr7\Utils::tryFopen($file, 'r');
        } catch (\RuntimeException $e) {
            \jLog::log($e->getMessage(), 'error');

            return array(null, 400, 'Error on file upload');
        }

        // getting profile connection parameters
        $profile = self::getProfile('webdav');

        if ($profile && is_array($profile) && array_key_exists('enabled', $profile) && $profile['enabled'] == 1 && array_key_exists('baseUri', $profile)) {
            // baseUri check
            if (strpos($storageUrl, $profile['baseUri']) === 0) {
                $settings = array();
                $settings[CURLOPT_URL] = $storageUrl;
                $settings[CURLOPT_PUT] = true;
                $settings[CURLOPT_INFILE] = $resource;
                $settings[CURLOPT_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
                $settings[CURLOPT_REDIR_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
                if (array_key_exists('user', $profile) && array_key_exists('password', $profile)) {
                    $settings[CURLOPT_USERPWD] = $profile['user'].':'.$profile['password'];
                    $settings[CURLOPT_HTTPAUTH] = CURLAUTH_BASIC;
                }
                $settings[CURLOPT_INFILESIZE] = filesize($file);
                $settings[CURLOPT_RETURNTRANSFER] = true;
                $settings[CURLOPT_USERAGENT] = 'lizmap-user-agent';
                $ch = curl_init();
                curl_setopt_array($ch, $settings);
                $curlResp = curl_exec($ch);

                $http_code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
                $errorCode = curl_errno($ch);
                $errorMessage = curl_error($ch);
                curl_close($ch);

                if ($errorCode) {
                    $message = 'Error on file upload '.$errorMessage;
                } else {
                    if ($http_code >= 200 && $http_code <= 300) {
                        // upload successfull
                        $returnUrl = $storageUrl;
                    } else {
                        $message = 'Error on file upload';
                    }
                }
            } else {
                $message = 'Invalid path '.$storageUrl;
            }
        } else {
            $message = 'WebDAV configuration not found';
        }
        if ($message) {
            \jLog::log($message, 'error');
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

        if ($profile && is_array($profile) && array_key_exists('enabled', $profile) && $profile['enabled'] == 1 && array_key_exists('baseUri', $profile)) {
            // check if remote endpoint match the baseUri configuration
            if ($storageUrl !== $profile['baseUri']) {
                $http_code = 500;
                $message = 'Invalid file '.$fileName;
                \jLog::log($message, 'error');
            } else {
                if (!self::isFileRemoteWebDAVResource($storageUrl, $fileName)) {
                    $http_code = 404;
                    $message = 'Resource '.$fileName.' is not a file';
                    \jLog::log($message, 'error');
                } else {
                    // deleting file
                    $settings = array();
                    $settings[CURLOPT_URL] = $storageUrl.$fileName;
                    $settings[CURLOPT_CUSTOMREQUEST] = 'DELETE';
                    $settings[CURLOPT_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
                    $settings[CURLOPT_REDIR_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
                    if (array_key_exists('user', $profile) && array_key_exists('password', $profile)) {
                        $settings[CURLOPT_USERPWD] = $profile['user'].':'.$profile['password'];
                        $settings[CURLOPT_HTTPAUTH] = CURLAUTH_BASIC;
                    }

                    $settings[CURLOPT_RETURNTRANSFER] = true;
                    $settings[CURLOPT_USERAGENT] = 'lizmap-user-agent';
                    $ch = curl_init();
                    curl_setopt_array($ch, $settings);
                    $curlResp = curl_exec($ch);
                    $error = curl_errno($ch);
                    $error_message = curl_error($ch);
                    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    if ($error || $http_code < 200 || $http_code >= 300) {
                        $message = 'Error on deleting remote file '.$error_message;
                        \jLog::log($message, 'error');
                    }
                }
            }
        }

        return array($http_code, $message);
    }

    /**
     * check if resource is a file on remote webdav storage.
     *
     * @param string $storageUrl remote destination path
     * @param string $fileName   the file to check
     *
     * @return bool
     */
    public static function isFileRemoteWebDAVResource($storageUrl, $fileName)
    {
        $profile = self::getProfile('webdav');

        if ($profile && is_array($profile) && array_key_exists('enabled', $profile) && $profile['enabled'] == 1 && array_key_exists('baseUri', $profile)) {
            if (!preg_match('/\.\.\//', $fileName) && !preg_match('/\.\//', $fileName)) {
                $settings = array();
                $settings[CURLOPT_URL] = $storageUrl.$fileName;
                $settings[CURLOPT_CUSTOMREQUEST] = 'PROPFIND';
                $settings[CURLOPT_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
                $settings[CURLOPT_REDIR_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
                if (array_key_exists('user', $profile) && array_key_exists('password', $profile)) {
                    $settings[CURLOPT_USERPWD] = $profile['user'].':'.$profile['password'];
                    $settings[CURLOPT_HTTPAUTH] = CURLAUTH_BASIC;
                }

                $settings[CURLOPT_RETURNTRANSFER] = true;
                $settings[CURLOPT_USERAGENT] = 'lizmap-user-agent';
                $ch = curl_init();
                curl_setopt_array($ch, $settings);
                $curlResp = curl_exec($ch);
                $http_code_response = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
                $error = curl_errno($ch);
                curl_close($ch);

                if (!$error) {
                    if ($http_code_response >= 200 && $http_code_response < 300) {
                        // parse PROPFIND response
                        $xml = simplexml_load_string($curlResp);

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
                }
            }
        }

        return false;
    }

    /**
     * Check if remote storage is reacheable on setted configuration.
     *
     * @return bool
     */
    public static function checkWebDAVStorageConnection()
    {
        $profile = self::getProfile('webdav');
        if ($profile && is_array($profile) && array_key_exists('enabled', $profile) && $profile['enabled'] == 1 && array_key_exists('baseUri', $profile)) {
            $settings = array();
            $settings[CURLOPT_URL] = $profile['baseUri'];
            $settings[CURLOPT_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
            $settings[CURLOPT_REDIR_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
            if (array_key_exists('user', $profile) && array_key_exists('password', $profile)) {
                $settings[CURLOPT_USERPWD] = $profile['user'].':'.$profile['password'];
                $settings[CURLOPT_HTTPAUTH] = CURLAUTH_BASIC;
            }

            $settings[CURLOPT_RETURNTRANSFER] = true;
            $settings[CURLOPT_USERAGENT] = 'lizmap-user-agent';
            $ch = curl_init();
            curl_setopt_array($ch, $settings);
            $curlResp = curl_exec($ch);

            $http_code_response = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            curl_close($ch);
            if ($http_code_response >= 200 && $http_code_response <= 300) {
                return true;
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

        try {
            $profile = $context->getProfile($storageType, $profileName, true);
        } catch (\Exception $e) {
            $profile = null;
        }

        return $profile;
    }
}
