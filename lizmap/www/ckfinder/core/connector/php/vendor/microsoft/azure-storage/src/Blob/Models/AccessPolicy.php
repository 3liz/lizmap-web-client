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
 * @package   MicrosoftAzure\Storage\Blob\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Blob\Models;

use MicrosoftAzure\Storage\Common\Internal\Utilities;
use MicrosoftAzure\Storage\Common\Internal\Validate;

/**
 * Holds container access policy elements
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Blob\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class AccessPolicy
{
    /**
     * @var string
     */
    private $_start;
    
    /**
     * @var \DateTime
     */
    private $_expiry;
    
    /**
     * @var \DateTime
     */
    private $_permission;
    
    /**
     * Gets start.
     *
     * @return \DateTime.
     */
    public function getStart()
    {
        return $this->_start;
    }

    /**
     * Sets start.
     *
     * @param \DateTime $start value.
     * 
     * @return none.
     */
    public function setStart($start)
    {
        Validate::isDate($start);
        $this->_start = $start;
    }
    
    /**
     * Gets expiry.
     *
     * @return \DateTime.
     */
    public function getExpiry()
    {
        return $this->_expiry;
    }

    /**
     * Sets expiry.
     *
     * @param \DateTime $expiry value.
     * 
     * @return none.
     */
    public function setExpiry($expiry)
    {
        Validate::isDate($expiry);
        $this->_expiry = $expiry;
    }
    
    /**
     * Gets permission.
     *
     * @return string.
     */
    public function getPermission()
    {
        return $this->_permission;
    }

    /**
     * Sets permission.
     *
     * @param string $permission value.
     * 
     * @return none.
     */
    public function setPermission($permission)
    {
        $this->_permission = $permission;
    }
    
    /**
     * Converts this current object to XML representation.
     * 
     * @return array.
     */
    public function toArray()
    {
        $array = array();
        
        $array['Start']      = Utilities::convertToEdmDateTime($this->_start);
        $array['Expiry']     = Utilities::convertToEdmDateTime($this->_expiry);
        $array['Permission'] = $this->_permission;
        
        return $array;
    }
}


