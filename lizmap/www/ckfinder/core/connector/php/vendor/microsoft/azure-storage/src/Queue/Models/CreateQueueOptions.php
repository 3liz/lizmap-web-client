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
 * @package   MicrosoftAzure\Storage\Queue\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Queue\Models;

/**
 * Optional parameters for Create Queue REST API.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Queue\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class CreateQueueOptions extends QueueServiceOptions
{
    private $_metadata;
    
    /**
     * Gets user defined metadata.
     * 
     * @return array.
     */
    public function getMetadata()
    {
        return $this->_metadata;
    }
    
    /**
     * Sets user defined metadata. This metadata should be added without the header
     * prefix (x-ms-meta-*).
     * 
     * @param array $metadata user defined metadata object in array form.
     * 
     * @return none.
     */
    public function setMetadata($metadata)
    {
        $this->_metadata = $metadata;
    }
    
    /**
     * Adds new metadata element. This element should be added without the header
     * prefix (x-ms-meta-*).
     * 
     * @param string $key   metadata key element.
     * @param string $value metadata value element.
     * 
     * @return none.
     */
    public function addMetadata($key, $value)
    {
        $this->_metadata[$key] = $value;
    }
}


