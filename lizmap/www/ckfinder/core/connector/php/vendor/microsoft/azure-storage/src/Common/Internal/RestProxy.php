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
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Common\Internal\Validate;

/**
 * Base class for all REST proxies.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common\Internal
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class RestProxy
{   
    /**
     * @var array
     */
    private $_filters;
    
    /**
     * @var MicrosoftAzure\Storage\Common\Internal\Serialization\ISerializer
     */
    protected $dataSerializer;
    
    /**
     * @var string
     */
    private $_uri;
    
    /**
     * Initializes new RestProxy object.
     *
     * @param ISerializer $dataSerializer The data serializer.
     * @param string      $uri            The uri of the service.
     */
    public function __construct($dataSerializer, $uri)
    {
        $this->_filters       = array();
        $this->dataSerializer = $dataSerializer;
        $this->_uri           = $uri;
    }
    
    /**
     * Gets HTTP filters that will process each request.
     * 
     * @return array
     */
    public function getFilters()
    {
        return $this->_filters;
    }

    /**
     * Gets the Uri of the service.
     * 
     * @return string
     */
    public function getUri()
    {
        return $this->_uri;
    }

    /** 
     * Sets the Uri of the service. 
     *
     * @param string $uri The URI of the request.
     * 
     * @return none
     */
    public function setUri($uri)
    {
        $this->_uri = $uri;
    }

    /**
     * Adds new filter to new service rest proxy object and returns that object back.
     *
     * @param MicrosoftAzure\Storage\Common\Internal\IServiceFilter $filter Filter to add for 
     * the pipeline.
     * 
     * @return RestProxy.
     */
    public function withFilter($filter)
    {
        $serviceProxyWithFilter             = clone $this;
        $serviceProxyWithFilter->_filters[] = $filter;

        return $serviceProxyWithFilter;
    }
    
    /**
     * Adds optional query parameter.
     * 
     * Doesn't add the value if it satisfies empty().
     * 
     * @param array  &$queryParameters The query parameters.
     * @param string $key              The query variable name.
     * @param string $value            The query variable value.
     * 
     * @return none
     */
    protected function addOptionalQueryParam(&$queryParameters, $key, $value)
    {
        Validate::isArray($queryParameters, 'queryParameters');
        Validate::isString($key, 'key');
        Validate::isString($value, 'value');
                
        if (!is_null($value) && Resources::EMPTY_STRING !== $value) {
            $queryParameters[$key] = $value;
        }
    }
    
    /**
     * Adds optional header.
     * 
     * Doesn't add the value if it satisfies empty().
     * 
     * @param array  &$headers The HTTP header parameters.
     * @param string $key      The HTTP header name.
     * @param string $value    The HTTP header value.
     * 
     * @return none
     */
    protected function addOptionalHeader(&$headers, $key, $value)
    {
        Validate::isArray($headers, 'headers');
        Validate::isString($key, 'key');
        Validate::isString($value, 'value');
                
        if (!is_null($value) && Resources::EMPTY_STRING !== $value) {
            $headers[$key] = $value;
        }
    }
}


