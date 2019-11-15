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
 * Holds results of calling queryEntities API
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class QueryEntitiesResult
{
    /**
     * @var Query
     */
    private $_nextRowKey;
    
    /**
     * @var string
     */
    private $_nextPartitionKey;
    
    /**
     * @var array
     */
    private $_entities;
    
    /**
     * Creates new QueryEntitiesResult instance.
     * 
     * @param array $headers  The HTTP response headers.
     * @param array $entities The entities.
     * 
     * @return QueryEntitiesResult
     */
    public static function create($headers, $entities)
    {
        $result  = new QueryEntitiesResult();
        $headers = array_change_key_case($headers);
        $nextPK  = Utilities::tryGetValue(
            $headers, Resources::X_MS_CONTINUATION_NEXTPARTITIONKEY
        );
        $nextRK  = Utilities::tryGetValue(
            $headers, Resources::X_MS_CONTINUATION_NEXTROWKEY
        );
        
        $result->setEntities($entities);
        $result->setNextPartitionKey($nextPK);
        $result->setNextRowKey($nextRK);
        
        return $result;
    }
    
    /**
     * Gets entities.
     * 
     * @return array
     */
    public function getEntities()
    {
        return $this->_entities;
    }
    
    /**
     * Sets entities.
     * 
     * @param array $entities The entities array.
     * 
     * @return none
     */
    public function setEntities($entities)
    {
        $this->_entities = $entities;
    }
    
    /**
     * Gets entity next partition key.
     *
     * @return string
     */
    public function getNextPartitionKey()
    {
        return $this->_nextPartitionKey;
    }

    /**
     * Sets entity next partition key.
     *
     * @param string $nextPartitionKey The entity next partition key value.
     *
     * @return none
     */
    public function setNextPartitionKey($nextPartitionKey)
    {
        $this->_nextPartitionKey = $nextPartitionKey;
    }
    
    /**
     * Gets entity next row key.
     *
     * @return string
     */
    public function getNextRowKey()
    {
        return $this->_nextRowKey;
    }

    /**
     * Sets entity next row key.
     *
     * @param string $nextRowKey The entity next row key value.
     *
     * @return none
     */
    public function setNextRowKey($nextRowKey)
    {
        $this->_nextRowKey = $nextRowKey;
    }
}


