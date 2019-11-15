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
 * @package   MicrosoftAzure\Storage\Table\Models\Filters
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Table\Models\Filters;
use MicrosoftAzure\Storage\Table\Models\EdmType;

/**
 * Constant filter
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models\Filters
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class ConstantFilter extends Filter
{
    /**
     * @var mix
     */
    private $_value;
    
    /**
     * @var string
     */
    private $_edmType;
    
    /**
     * Constructor.
     * 
     * @param string $edmType The EDM type.
     * @param string $value   The EDM value.
     */
    public function __construct($edmType, $value)
    {
        $this->_edmType = EdmType::processType($edmType);
        $this->_value   = $value;
    }

    /**
     * Gets value
     * 
     * @return mix 
     */
    public function getValue()
    {
        return $this->_value;
    }
    
    /**
     * Gets the type of the constant.
     * 
     * @return string
     */
    public function getEdmType()
    {
        return $this->_edmType;
    }
}


