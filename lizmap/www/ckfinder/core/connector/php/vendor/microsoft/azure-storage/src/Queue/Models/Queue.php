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
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Common\Internal\Utilities;

/**
 * WindowsAzure queue object.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Queue\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class Queue
{
    private $_name;
    private $_url;
    private $_metadata;

    /**
     * Constructor
     * 
     * @param string $name queue name.
     * @param string $url  queue url.
     * 
     * @return MicrosoftAzure\Storage\Queue\Models\Queue.
     */
    function __construct($name, $url)
    {
        $this->_name = $name;
        $this->_url  = $url;
    }

    /**
     * Gets queue name.
     *
     * @return string.
     */
    public function getName()
    {
        return $this->_name;
    }

    /**
     * Sets queue name.
     *
     * @param string $name value.
     * 
     * @return none.
     */
    public function setName($name)
    {
        $this->_name = $name;
    }

    /**
     * Gets queue url.
     *
     * @return string.
     */
    public function getUrl()
    {
        return $this->_url;
    }

    /**
     * Sets queue url.
     *
     * @param string $url value.
     * 
     * @return none.
     */
    public function setUrl($url)
    {
        $this->_url = $url;
    }

    /**
     * Gets queue metadata.
     *
     * @return array.
     */
    public function getMetadata()
    {
        return $this->_metadata;
    }

    /**
     * Sets queue metadata.
     *
     * @param string $metadata value.
     * 
     * @return none.
     */
    public function setMetadata($metadata)
    {
        $this->_metadata = $metadata;
    }
}

