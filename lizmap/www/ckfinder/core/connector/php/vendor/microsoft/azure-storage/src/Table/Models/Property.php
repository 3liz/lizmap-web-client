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
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Table\Models;
use MicrosoftAzure\Storage\Table\Models\EdmType;
use MicrosoftAzure\Storage\Common\Internal\Validate;
use MicrosoftAzure\Storage\Tests\Unit\Table\Models\EdmTypeTest;

/**
 * Represents entity property.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class Property
{
    /**
     * @var string
     */
    private $_edmType;
    
    /**
     * @var mix
     */
    private $_value;
    
    /**
     * Gets the type of the property.
     * 
     * @return string
     */
    public function getEdmType()
    {
        return $this->_edmType;
    }
    
    /**
     * Sets the value of the property.
     * 
     * @param string $edmType The property type.
     * 
     * @return none
     */
    public function setEdmType($edmType)
    {
        EdmType::isValid($edmType);
        $this->_edmType = $edmType;
    }
    
    /**
     * Gets the value of the property.
     * 
     * @return string
     */
    public function getValue()
    {
        return $this->_value;
    }
    
    /**
     * Sets the property value.
     * 
     * @param mix $value The value of property.
     * 
     * @return none
     */
    public function setValue($value)
    {
        $this->_value = $value;
    }
}


