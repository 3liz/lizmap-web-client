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
use MicrosoftAzure\Storage\Common\Internal\Utilities;
use MicrosoftAzure\Storage\Common\Internal\Resources;

/**
 * QueryTablesResult
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class QueryTablesResult
{
    /**
     * @var string 
     */
    private $_nextTableName;
    
    /**
     * @var array
     */
    private $_tables;
    
    /**
     * Creates new QueryTablesResult object
     * 
     * @param array $headers The HTTP response headers
     * @param array $entries The table entriess
     * 
     * @return \MicrosoftAzure\Storage\Table\Models\QueryTablesResult 
     */
    public static function create($headers, $entries)
    {
        $result  = new QueryTablesResult();
        $headers = array_change_key_case($headers);
        
        $result->setNextTableName(
            Utilities::tryGetValue(
                $headers, Resources::X_MS_CONTINUATION_NEXTTABLENAME
            )
        );
        $result->setTables($entries);
        
        return $result;
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
     * Gets tables
     * 
     * @return array
     */
    public function getTables()
    {
        return $this->_tables;
    }
    
    /**
     * Sets tables
     * 
     * @param array $tables value
     * 
     * @return none
     */
    public function setTables($tables)
    {
        $this->_tables = $tables;
    }
}


