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

/**
 * The retry policy abstract class.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common\Internal\Filters
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
abstract class RetryPolicy
{
    const DEFAULT_CLIENT_BACKOFF     = 30000;
    const DEFAULT_CLIENT_RETRY_COUNT = 3;
    const DEFAULT_MAX_BACKOFF        = 90000;
    const DEFAULT_MIN_BACKOFF        = 300;
    
    /**
     * Indicates if there should be a retry or not.
     * 
     * @param integer                   $retryCount The retry count.
     * @param \GuzzleHttp\Psr7\Response $response   The HTTP response object.
     * 
     * @return boolean
     */
    public abstract function shouldRetry($retryCount, $response);
    
    /**
     * Calculates the backoff for the retry policy.
     * 
     * @param integer                   $retryCount The retry count.
     * @param \GuzzleHttp\Psr7\Response $response   The HTTP response object.
     * 
     * @return integer
     */
    public abstract function calculateBackoff($retryCount, $response);
}


