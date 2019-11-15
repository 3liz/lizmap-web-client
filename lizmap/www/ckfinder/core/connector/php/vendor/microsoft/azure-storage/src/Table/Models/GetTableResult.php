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

/**
 * Holds result of getTable API.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class GetTableResult
{
    /**
     * @var string
     */
    private $_name;
    
    /**
     * Creates GetTableResult from HTTP response body.
     * 
     * @param string           $body           The HTTP response body.
     * @param AtomReaderWriter $atomSerializer The Atom reader and writer.
     * 
     * @return \MicrosoftAzure\Storage\Table\Models\GetTableResult
     */
    public static function create($body, $atomSerializer)
    {
        $result = new GetTableResult();
        
        $name = $atomSerializer->parseTable($body);
        $result->setName($name);
        
        return $result;
    }
    
    /**
     * Gets the name.
     * 
     * @return string
     */
    public function getName()
    {
        return $this->_name;
    }
    
    /**
     * Sets the name.
     * 
     * @param string $name The table name.
     * 
     * @return none
     */
    public function setName($name)
    {
        $this->_name = $name;
    }
}


