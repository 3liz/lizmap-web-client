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

/**
 * Unary filter
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models\Filters
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class UnaryFilter extends Filter
{
    /**
     * @var string 
     */
    private $_operator;
    
    /**
     * @var Filter
     */
    private $_operand;
    
    /**
     * Constructor.
     * 
     * @param string $operator The operator.
     * @param Filter $operand  The operand filter.
     */
    public function __construct($operator, $operand)
    {
        $this->_operand  = $operand;
        $this->_operator = $operator;
    }
    
    /**
     * Gets operator
     * 
     * @return string 
     */
    public function getOperator()
    {
        return $this->_operator;
    }

    /**
     * Gets operand
     * 
     * @return Filter 
     */
    public function getOperand()
    {
        return $this->_operand;
    }
}


