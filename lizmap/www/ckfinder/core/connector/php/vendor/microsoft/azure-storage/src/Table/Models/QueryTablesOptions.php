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

/**
 * Optional parameters for queryTables wrapper.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class QueryTablesOptions extends TableServiceOptions
{
    /**
     * @var string
     */
    private $_nextTableName;
    
    /**
     * @var Query
     */
    private $_query;
    
    /**
     * @var string
     */
    private $_prefix;
    
    /**
     * Constructs new QueryTablesOptions object.
     */
    public function __construct()
    {
        $this->_query = new Query();
    }
    
    /**
     * Gets nextTableName
     * 
     * @return string
     */
    public function getNextTableName()
    {
        return $this->_nextTableName;
    }
    
    /**
     * Sets nextTableName
     * 
     * @param string $nextTableName value
     * 
     * @return none
     */
    public function setNextTableName($nextTableName)
    {
        $this->_nextTableName = $nextTableName;
    }
    
    /**
     * Gets prefix
     * 
     * @return string
     */
    public function getPrefix()
    {
        return $this->_prefix;
    }
    
    /**
     * Sets prefix
     * 
     * @param string $prefix value
     * 
     * @return none
     */
    public function setPrefix($prefix)
    {
        $this->_prefix = $prefix;
    }
    
    /**
     * Gets top.
     *
     * @return integer.
     */
    public function getTop()
    {
        return $this->_query->getTop();
    }

    /**
     * Sets top.
     *
     * @param integer $top value.
     * 
     * @return none.
     */
    public function setTop($top)
    {
        $this->_query->setTop($top);
    }
    
    /**
     * Gets query.
     * 
     * @return Query
     */
    public function getQuery()
    {
        return $this->_query;
    }
    
    /**
     * Gets filter.
     *
     * @return Filters\Filter
     */
    public function getFilter()
    {
        return $this->_query->getFilter();
    }

    /**
     * Sets filter.
     *
     * @param Filters\Filter $filter value.
     * 
     * @return none.
     */
    public function setFilter($filter)
    {
        $this->_query->setFilter($filter);
    }
}


