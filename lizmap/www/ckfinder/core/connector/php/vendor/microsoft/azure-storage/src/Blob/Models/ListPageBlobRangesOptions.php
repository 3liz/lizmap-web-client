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
 * @package   MicrosoftAzure\Storage\Blob\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Blob\Models;
use MicrosoftAzure\Storage\Common\Internal\Validate;

/**
 * Optional parameters for listPageBlobRanges wrapper
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Blob\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class ListPageBlobRangesOptions extends BlobServiceOptions
{
    /**
     * @var string
     */
    private $_leaseId;
    
    /**
     * @var string
     */
    private $_snapshot;
    
    /**
     * @var integer
     */
    private $_rangeStart;
    
    /**
     * @var integer
     */
    private $_rangeEnd;
    
    /**
     * @var AccessCondition
     */
    private $_accessCondition;
    
    /**
     * Gets lease Id for the blob
     * 
     * @return string
     */
    public function getLeaseId()
    {
        return $this->_leaseId;
    }
    
    /**
     * Sets lease Id for the blob
     * 
     * @param string $leaseId the blob lease id.
     * 
     * @return none
     */
    public function setLeaseId($leaseId)
    {
        $this->_leaseId = $leaseId;
    }
    
    /**
     * Gets blob snapshot.
     *
     * @return string.
     */
    public function getSnapshot()
    {
        return $this->_snapshot;
    }

    /**
     * Sets blob snapshot.
     *
     * @param string $snapshot value.
     * 
     * @return none.
     */
    public function setSnapshot($snapshot)
    {
        $this->_snapshot = $snapshot;
    }
    
    /**
     * Gets rangeStart
     * 
     * @return integer
     */
    public function getRangeStart()
    {
        return $this->_rangeStart;
    }
    
    /**
     * Sets rangeStart
     * 
     * @param integer $rangeStart the blob lease id.
     * 
     * @return none
     */
    public function setRangeStart($rangeStart)
    {
        Validate::isInteger($rangeStart, 'rangeStart');
        $this->_rangeStart = $rangeStart;
    }
    
    /**
     * Gets rangeEnd
     * 
     * @return integer
     */
    public function getRangeEnd()
    {
        return $this->_rangeEnd;
    }
    
    /**
     * Sets rangeEnd
     * 
     * @param integer $rangeEnd range end value in bytes
     * 
     * @return none
     */
    public function setRangeEnd($rangeEnd)
    {
        Validate::isInteger($rangeEnd, 'rangeEnd');
        $this->_rangeEnd = $rangeEnd;
    }
    
    /**
     * Gets access condition
     * 
     * @return AccessCondition
     */
    public function getAccessCondition()
    {
        return $this->_accessCondition;
    }
    
    /**
     * Sets access condition
     * 
     * @param AccessCondition $accessCondition value to use.
     * 
     * @return none.
     */
    public function setAccessCondition($accessCondition)
    {
        $this->_accessCondition = $accessCondition;
    }
}


