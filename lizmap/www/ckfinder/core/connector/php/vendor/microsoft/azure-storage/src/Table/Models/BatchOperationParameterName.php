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
 * Batch parameter names.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class BatchOperationParameterName
{
    const BP_TABLE         = 'table';
    const BP_ENTITY        = 'entity';
    const BP_PARTITION_KEY = 'PartitionKey';
    const BP_ROW_KEY       = 'RowKey';
    const BP_ETAG          = 'etag';
    
    /**
     * Validates if $paramName is already defined.
     * 
     * @param string $paramName The batch operation parameter name.
     * 
     * @return boolean 
     */
    public static function isValid($paramName)
    {
        switch ($paramName) {
        case self::BP_TABLE:
        case self::BP_ENTITY:
        case self::BP_PARTITION_KEY:
        case self::BP_ROW_KEY:
        case self::BP_ETAG:
        return true;

        default:
        return false;
        }
    }
}


