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
use MicrosoftAzure\Storage\Common\Internal\Validate;
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Common\Internal\Utilities;

/**
 * Represents one batch operation
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class BatchOperation
{
    /**
     * @var string
     */
    private $_type;
    
    /**
     * @var array
     */
    private $_params;
    
    /**
     * Sets operation type.
     * 
     * @param string $type The operation type. Must be valid type.
     * 
     * @return none
     */
    public function setType($type)
    {
        Validate::isTrue(
            BatchOperationType::isValid($type),
            Resources::INVALID_BO_TYPE_MSG
        );
        
        $this->_type = $type;
    }
    
    /**
     * Gets operation type.
     * 
     * @return string
     */
    public function getType()
    {
        return $this->_type;
    }
    
    /**
     * Adds or sets parameter for the operation.
     * 
     * @param string $name  The param name. Must be valid name.
     * @param mix    $value The param value.
     * 
     * @return none
     */
    public function addParameter($name, $value)
    {
        Validate::isTrue(
            BatchOperationParameterName::isValid($name),
            Resources::INVALID_BO_PN_MSG
        );
        $this->_params[$name] = $value;
    }
    
    /**
     * Gets parameter value and if the name doesn't exist, return null.
     * 
     * @param string $name The parameter name.
     * 
     * @return mix
     */
    public function getParameter($name)
    {
        return Utilities::tryGetValue($this->_params, $name);
    }
}


