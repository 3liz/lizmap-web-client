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
 * @package   MicrosoftAzure\Storage\Queue\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Queue\Models;

/**
 * Short description
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Queue\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class PeekMessagesOptions extends QueueServiceOptions
{
    /**
     * A nonzero integer value that specifies the number of messages to peek from 
     * the queue, up to a maximum of 32. By default, a single message is peeked 
     * from the queue with this operation.
     * 
     * @var integer
     */
    private $_numberOfMessages;
    
    /**
     * Gets numberOfMessages field.
     * 
     * @return integer
     */
    public function getNumberOfMessages()
    {
        return $this->_numberOfMessages;
    }
    
    /**
     * Sets numberOfMessages field.
     * 
     * @param integer $numberOfMessages value to use.
     * 
     * @return none
     */
    public function setNumberOfMessages($numberOfMessages)
    {
        $this->_numberOfMessages = $numberOfMessages;
    }
}


