<?php

/**
 * LICENSE: The MIT License (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://github.com/azure/azure-storage-php/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * PHP version 5
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common\Internal
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */

namespace MicrosoftAzure\Storage\Common\Internal;
use MicrosoftAzure\Storage\Common\ServiceException;
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Common\Internal\Validate;
use MicrosoftAzure\Storage\Common\Internal\Utilities;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\Uri;

/**
 * Base class for all services rest proxies.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common\Internal
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class ServiceRestProxy extends RestProxy
{
    /**
     * @var string
     */
    private $_accountName;

    /**
     *
     * @var \Uri
     */
       private $_psrUri;

    /**
     * @var array
     */
    private $_options;

    /**
     * Initializes new ServiceRestProxy object.
     *
     * @param string      $uri            The storage account uri.
     * @param string      $accountName    The name of the account.
     * @param ISerializer $dataSerializer The data serializer.
     * @param array       $options        Array of options for the service
     */
    public function __construct($uri, $accountName, $dataSerializer, $options = [])
    {
        if ($uri[strlen($uri)-1] != '/')
        {
            $uri = $uri . '/';
        }

        parent::__construct($dataSerializer, $uri);

        $this->_accountName = $accountName;
        $this->_psrUri = new \GuzzleHttp\Psr7\Uri($uri);
        $this->_options = array_merge(array('http' => array()), $options);
    }

    /**
     * Gets the account name.
     *
     * @return string
     */
    public function getAccountName()
    {
        return $this->_accountName;
    }

    /**
     * Sends HTTP request with the specified parameters.
     *
     * @param string $method         HTTP method used in the request
     * @param array  $headers        HTTP headers.
     * @param array  $queryParams    URL query parameters.
     * @param array  $postParameters The HTTP POST parameters.
     * @param string $path           URL path
     * @param int    $statusCode     Expected status code received in the response
     * @param string $body           Request body
     * @param array  $clientOptions  Guzzle Client options
     *
     * @return GuzzleHttp\Psr7\Response
     */
    protected function send(
        $method,
        $headers,
        $queryParams,
        $postParameters,
        $path,
        $statusCode,
        $body = Resources::EMPTY_STRING
    ) {
        // add query parameters into headers
        $uri = $this->_psrUri;
        if ($path != NULL)
        {
            $uri = $uri->withPath($path);
        }

        if ($queryParams != NULL)
        {
            $queryString = Psr7\build_query($queryParams);
            $uri = $uri->withQuery($queryString);
        }

        // add post parameters into bodys
        $actualBody = NULL;
        if (empty($body))
        {
            if (empty($headers['content-type']))
            {
                $headers['content-type'] = 'application/x-www-form-urlencoded';
                $actualBody = Psr7\build_query($postParameters);
            }
        }
        else
        {
            $actualBody = $body;
        }

        $request = new Request(
                $method,
                $uri,
                $headers,
                $actualBody);

        $client = new \GuzzleHttp\Client(
            array_merge(
                $this->_options['http'],
                array(
                    "defaults" => array(
                        "allow_redirects" => true, "exceptions" => true,
                        "decode_content" => true,
                    ),
                    'cookies' => true,
                    'verify' => false,
                    // For testing with Fiddler
                    // 'proxy' => "localhost:8888",
                )
            )
        );

        $bodySize = $request->getBody()->getSize();
        if ($bodySize > 0)
        {
            $request = $request->withHeader('content-length', $bodySize);
        }

        // Apply filters to the requests
        foreach ($this->getFilters() as $filter) {
            $request = $filter->handleRequest($request);
        }

        try {
            $response = $client->send($request);
            self::throwIfError(
                    $response->getStatusCode(),
                    $response->getReasonPhrase(),
                    $response->getBody(),
                    $statusCode);
            return $response;
        }
        catch(\GuzzleHttp\Exception\RequestException $e)
        {
            if ($e->hasResponse())
            {
                $response = $e->getResponse();
                self::throwIfError(
                        $response->getStatusCode(),
                        $response->getReasonPhrase(),
                        $response->getBody(),
                        $statusCode);
                return $response;
            }
            else
            {
                throw $e;
            }
        }
    }

    protected function sendContext($context)
    {
        return $this->send(
                $context->getMethod(),
                $context->getHeaders(),
                $context->getQueryParameters(),
                $context->getPostParameters(),
                $context->getPath(),
                $context->getStatusCodes(),
                $context->getBody());
    }

    /**
     * Throws ServiceException if the recieved status code is not expected.
     *
     * @param string $actual   The received status code.
     * @param string $reason   The reason phrase.
     * @param string $message  The detailed message (if any).
     * @param string $expected The expected status codes.
     *
     * @return none
     *
     * @static
     *
     * @throws ServiceException
     */
    public static function throwIfError($actual, $reason, $message, $expected)
    {
        $expectedStatusCodes = is_array($expected) ? $expected : array($expected);

        if (!in_array($actual, $expectedStatusCodes)) {
            throw new ServiceException($actual, $reason, $message);
        }
    }

    /**
     * Adds optional header to headers if set
     *
     * @param array           $headers         The array of request headers.
     * @param AccessCondition $accessCondition The access condition object.
     *
     * @return array
     */
    public function addOptionalAccessConditionHeader($headers, $accessCondition)
    {
        if (!is_null($accessCondition)) {
            $header = $accessCondition->getHeader();

            if ($header != Resources::EMPTY_STRING) {
                $value = $accessCondition->getValue();
                if ($value instanceof \DateTime) {
                    $value = gmdate(
                        Resources::AZURE_DATE_FORMAT,
                        $value->getTimestamp()
                    );
                }
                $headers[$header] = $value;
            }
        }

        return $headers;
    }

    /**
     * Adds optional header to headers if set
     *
     * @param array           $headers         The array of request headers.
     * @param AccessCondition $accessCondition The access condition object.
     *
     * @return array
     */
    public function addOptionalSourceAccessConditionHeader(
        $headers,
        $accessCondition
    ) {
        if (!is_null($accessCondition)) {
            $header     = $accessCondition->getHeader();
            $headerName = null;
            if (!empty($header)) {
                switch($header) {
                case Resources::IF_MATCH:
                    $headerName = Resources::X_MS_SOURCE_IF_MATCH;
                    break;

                case Resources::IF_UNMODIFIED_SINCE:
                    $headerName = Resources::X_MS_SOURCE_IF_UNMODIFIED_SINCE;
                    break;

                case Resources::IF_MODIFIED_SINCE:
                    $headerName = Resources::X_MS_SOURCE_IF_MODIFIED_SINCE;
                    break;

                case Resources::IF_NONE_MATCH:
                    $headerName = Resources::X_MS_SOURCE_IF_NONE_MATCH;
                    break;

                default:
                    throw new \Exception(Resources::INVALID_ACH_MSG);
                    break;
                }
            }
            $value = $accessCondition->getValue();
            if ($value instanceof \DateTime) {
                $value = gmdate(
                    Resources::AZURE_DATE_FORMAT,
                    $value->getTimestamp()
                );
            }

            $this->addOptionalHeader($headers, $headerName, $value);
        }

        return $headers;
    }

    /**
     * Adds HTTP POST parameter to the specified
     *
     * @param array  $postParameters An array of HTTP POST parameters.
     * @param string $key            The key of a HTTP POST parameter.
     * @param string $value          the value of a HTTP POST parameter.
     *
     * @return array
     */
    public function addPostParameter(
        $postParameters,
        $key,
        $value
    ) {
        Validate::isArray($postParameters, 'postParameters');
        $postParameters[$key] = $value;
        return $postParameters;
    }

    /**
     * Groups set of values into one value separated with Resources::SEPARATOR
     *
     * @param array $values array of values to be grouped.
     *
     * @return string
     */
    public function groupQueryValues($values)
    {
        Validate::isArray($values, 'values');
        $joined = Resources::EMPTY_STRING;

        foreach ($values as $value) {
            if (!is_null($value) && !empty($value)) {
                $joined .= $value . Resources::SEPARATOR;
            }
        }

        return trim($joined, Resources::SEPARATOR);
    }

    /**
     * Adds metadata elements to headers array
     *
     * @param array $headers  HTTP request headers
     * @param array $metadata user specified metadata
     *
     * @return array
     */
    protected function addMetadataHeaders($headers, $metadata)
    {
        $this->validateMetadata($metadata);

        $metadata = $this->generateMetadataHeaders($metadata);
        $headers  = array_merge($headers, $metadata);

        return $headers;
    }

    /**
     * Generates metadata headers by prefixing each element with 'x-ms-meta'.
     *
     * @param array $metadata user defined metadata.
     *
     * @return array.
     */
    public function generateMetadataHeaders($metadata)
    {
        $metadataHeaders = array();

        if (is_array($metadata) && !is_null($metadata)) {
            foreach ($metadata as $key => $value) {
                $headerName = Resources::X_MS_META_HEADER_PREFIX;
                if (   strpos($value, "\r") !== false
                    || strpos($value, "\n") !== false
                ) {
                    throw new \InvalidArgumentException(Resources::INVALID_META_MSG);
                }

                // Metadata name is case-presrved and case insensitive
                $headerName                     .= $key;
                $metadataHeaders[$headerName] = $value;
            }
        }

        return $metadataHeaders;
    }

    /**
     * Gets metadata array by parsing them from given headers.
     *
     * @param array $headers HTTP headers containing metadata elements.
     *
     * @return array.
     */
    public function getMetadataArray($headers)
    {
        $metadata = array();
        foreach ($headers as $key => $value) {
            $isMetadataHeader = Utilities::startsWith(
                strtolower($key),
                Resources::X_MS_META_HEADER_PREFIX
            );

            if ($isMetadataHeader) {
                // Metadata name is case-presrved and case insensitive
                $MetadataName = str_ireplace(
                    Resources::X_MS_META_HEADER_PREFIX,
                    Resources::EMPTY_STRING,
                    $key
                );
                $metadata[$MetadataName] = $value;
            }
        }

        return $metadata;
    }

    /**
     * Validates the provided metadata array.
     *
     * @param mix $metadata The metadata array.
     *
     * @return none
     */
    public function validateMetadata($metadata)
    {
        if (!is_null($metadata)) {
            Validate::isArray($metadata, 'metadata');
        } else {
            $metadata = array();
        }

        foreach ($metadata as $key => $value) {
            Validate::isString($key, 'metadata key');
            Validate::isString($value, 'metadata value');
        }
    }
}


