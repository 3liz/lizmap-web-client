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
 * Binary filter
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models\Filters
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class BinaryFilter extends Filter
{
    /**
     * @var string 
     */
    private $_operator;
    
    /**
     * @var Filter
     */
    private $_left;
    
    /**
     * @var Filter
     */
    private $_right;
    
    /**
     * Constructor.
     * 
     * @param Filter $left     The left operand.
     * @param string $operator The operator.
     * @param Filter $right    The right operand.
     */
    public function __construct($left, $operator, $right)
    {
        $this->_left     = $left;
        $this->_operator = $operator;
        $this->_right    = $right;
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
     * Gets left
     * 
     * @return Filter 
     */
    public function getLeft()
    {
        return $this->_left;
    }

    /**
     * Gets right
     * 
     * @return Filter 
     */
    public function getRight()
    {
        return $this->_right;
    }
}


