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

/**
 * Holds info about page range used in HTTP requests
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Blob\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class PageRange
{
    /**
     * @var integer
     */
    private $_start;
    
    /**
     * @var integer
     */
    private $_end;

    /**
     * Constructor
     * 
     * @param integer $start the page start value
     * @param integer $end   the page end value
     * 
     * @return PageRange
     */
    public function __construct($start = null, $end = null)
    {
        $this->_start = $start;
        $this->_end   = $end;
    }
    
    /**
     * Sets page start range
     * 
     * @param integer $start the page range start
     * 
     * @return none.
     */
    public function setStart($start)
    {
        $this->_start = $start;
    }
    
    /**
     * Gets page start range
     * 
     * @return integer
     */
    public function getStart()
    {
        return $this->_start;
    }
    
    /**
     * Sets page end range
     * 
     * @param integer $end the page range end
     * 
     * @return none.
     */
    public function setEnd($end)
    {
        $this->_end = $end;
    }
    
    /**
     * Gets page end range
     * 
     * @return integer
     */
    public function getEnd()
    {
        return $this->_end;
    }
    
    /**
     * Gets page range length
     * 
     * @return integer
     */
    public function getLength()
    {
        return $this->_end - $this->_start + 1;
    }
    
    /**
     * Sets page range length
     * 
     * @param integer $value new page range
     * 
     * @return none
     */
    public function setLength($value)
    {
        $this->_end = $this->_start + $value - 1;
    }
}


