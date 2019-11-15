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
 * @package   MicrosoftAzure\Storage\Common\Internal\Filters
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Common\Internal\Filters;
use MicrosoftAzure\Storage\Common\Internal\IServiceFilter;

/**
 * Adds all passed headers to the HTTP request headers.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common\Internal\Filters
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class HeadersFilter implements IServiceFilter
{
    /**
     * @var array
     */
    private $_headers;
    
    /**
     * Constructor
     * 
     * @param array $headers static headers to be added.
     * 
     * @return HeadersFilter
     */
    public function __construct($headers)
    {
        $this->_headers = $headers;
    }
    
    /**
     * Adds static header(s) to the HTTP request headers
     *
     * @param \GuzzleHttp\Psr7\Request $request HTTP request object.
     * 
     * @return \GuzzleHttp\Psr7\Request
     */
    public function handleRequest($request)
    {
        $result = $request;
        
        foreach ($this->_headers as $key => $value) {
            $headers = $request->getHeaders();
            if (!array_key_exists($key, $headers)) {
                $result = $result->withHeader($key, $value);
            }
        }
        
        return $result;
    }
    
    /**
     * Does nothing with the response.
     *
     * @param \GuzzleHttp\Psr7\Request  $request  HTTP request object.
     * @param \GuzzleHttp\Psr7\Response $response HTTP response object.
     *
     * @return \GuzzleHttp\Psr7\Response
     */
    public function handleResponse($request, $response)
    {
        // Do nothing with the response.
        return $response;
    }
}


