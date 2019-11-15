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
 * @package   MicrosoftAzure\Storage\Common\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Common\Models;
use MicrosoftAzure\Storage\Common\Internal\Utilities;

/**
 * Holds elements of queue properties retention policy field.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class RetentionPolicy
{
    /**
     * Indicates whether a retention policy is enabled for the storage service
     * 
     * @var bool.
     */
    private $_enabled;
    
    /**
     * If $_enabled is true then this field indicates the number of days that metrics
     * or logging data should be retained. All data older than this value will be 
     * deleted. The minimum value you can specify is 1; 
     * the largest value is 365 (one year)
     * 
     * @var int
     */
    private $_days;
    
    /**
     * Creates object from $parsedResponse.
     * 
     * @param array $parsedResponse XML response parsed into array.
     * 
     * @return MicrosoftAzure\Storage\Common\Models\RetentionPolicy
     */
    public static function create($parsedResponse)
    {
        $result = new RetentionPolicy();
        $result->setEnabled(Utilities::toBoolean($parsedResponse['Enabled']));
        if ($result->getEnabled()) {
            $result->setDays(intval($parsedResponse['Days']));
        }
        
        return $result;
    }
    
    /**
     * Gets enabled.
     * 
     * @return bool. 
     */
    public function getEnabled()
    {
        return $this->_enabled;
    }
    
    /**
     * Sets enabled.
     * 
     * @param bool $enabled value to use.
     * 
     * @return none. 
     */
    public function setEnabled($enabled)
    {
        $this->_enabled = $enabled;
    }
    
    /**
     * Gets days field.
     * 
     * @return int
     */
    public function getDays()
    {
        return $this->_days;
    }
    
    /**
     * Sets days field.
     * 
     * @param int $days value to use.
     * 
     * @return none
     */
    public function setDays($days)
    {
        $this->_days = $days;
    }
    
    /**
     * Converts this object to array with XML tags
     * 
     * @return array. 
     */
    public function toArray()
    {
        $array = array('Enabled' => Utilities::booleanToString($this->_enabled));
        if (isset($this->_days)) {
            $array['Days'] = strval($this->_days);
        }
        
        return $array;
    }
}


