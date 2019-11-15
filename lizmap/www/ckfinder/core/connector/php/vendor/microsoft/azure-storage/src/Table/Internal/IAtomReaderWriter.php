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
 * @package   MicrosoftAzure\Storage\Table\Internal
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Table\Internal;

/**
 * Defines how to serialize and unserialize table wrapper xml
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Internal
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
interface IAtomReaderWriter
{
    /**
     * Constructs XML representation for table entry.
     * 
     * @param string $name The name of the table.
     * 
     * @return string
     */
    public function getTable($name);
    
    /**
     * Parses one table entry.
     * 
     * @param string $body The HTTP response body.
     * 
     * @return string 
     */
    public function parseTable($body);
    
    /**
     * Constructs array of tables from HTTP response body.
     * 
     * @param string $body The HTTP response body.
     * 
     * @return array
     */
    public function parseTableEntries($body);
    
    /**
     * Constructs XML representation for entity.
     * 
     * @param Models\Entity $entity The entity instance.
     * 
     * @return string
     */
    public function getEntity($entity);
    
    /**
     * Constructs entity from HTTP response body.
     * 
     * @param string $body The HTTP response body.
     * 
     * @return Models\Entity
     */
    public function parseEntity($body);
    
    /**
     * Constructs array of entities from HTTP response body.
     * 
     * @param string $body The HTTP response body.
     * 
     * @return array
     */
    public function parseEntities($body);
}


