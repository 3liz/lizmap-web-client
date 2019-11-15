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
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Samples
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */

namespace MicrosoftAzure\Storage\Samples;

require_once "../vendor/autoload.php";

use MicrosoftAzure\Storage\Common\ServicesBuilder;
use MicrosoftAzure\Storage\Common\ServiceException;
use MicrosoftAzure\Storage\Table\Models\BatchOperations;
use MicrosoftAzure\Storage\Table\Models\Entity;
use MicrosoftAzure\Storage\Table\Models\EdmType;

$connectionString = 'DefaultEndpointsProtocol=https;AccountName=<yourAccount>;AccountKey=<yourKey>';
$tableClient = ServicesBuilder::getInstance()->createTableService($connectionString);

// To create a table call createTable.
createTableSample($tableClient);

// To add an entity to a table, create a new Entity object and pass it to TableRestProxy->insertEntity.
// Note that when you create an entity you must specify a PartitionKey and RowKey. These are the unique
// identifiers for an entity and are values that can be queried much faster than other entity properties.
// The system uses PartitionKey to automatically distribute the table¡¯s entities over many storage nodes.
insertEntitySample($tableClient);

// To add mutiple entities with one call, create a BatchOperations and pass it to TableRestProxy->batch.
// Note that all these entities must have the same PartitionKey value. BatchOperations supports to update,
// merge, delete entities as well. You can find more details in:
//   https://msdn.microsoft.com/library/azure/dd894038.aspx
batchInsertEntitiesSample($tableClient);

// To query for entities you can call queryEntities. The subset of entities you retrieve will be determined 
// by the filter you use (for more information, see Querying Tables and Entities):
//   https://msdn.microsoft.com/library/azure/dd894031.aspx
// You can also provide no filter at all.
queryEntitiesSample($tableClient);

function createTableSample($tableClient)
{
    try {
        // Create table.
        $tableClient->createTable("mytable");
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}

function insertEntitySample($tableClient)
{
    $entity = new Entity();
    $entity->setPartitionKey("pk");
    $entity->setRowKey("1");
    $entity->addProperty("PropertyName", EdmType::STRING, "Sample1");
    
    try{
        $tableClient->insertEntity("mytable", $entity);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}

function batchInsertEntitiesSample($tableClient)
{
    $batchOp = new BatchOperations();
    for ($i = 2; $i < 10; ++$i)
    {
        $entity = new Entity();
        $entity->setPartitionKey("pk");
        $entity->setRowKey(''.$i);
        $entity->addProperty("PropertyName", EdmType::STRING, "Sample".$i);
        
        $batchOp->addInsertEntity("mytable", $entity);
    }
    
    try {
        $tableClient->batch($batchOp);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}

function queryEntitiesSample($tableClient)
{
    $filter = "RowKey ne '3'";
    
    try {
        $result = $tableClient->queryEntities("mytable", $filter);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
    
    $entities = $result->getEntities();
    
    foreach($entities as $entity){
        echo $entity->getPartitionKey().":".$entity->getRowKey().PHP_EOL;
    }
}
