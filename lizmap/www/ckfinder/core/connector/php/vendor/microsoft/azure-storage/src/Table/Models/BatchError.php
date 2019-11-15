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
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Common\Internal\Utilities;
use MicrosoftAzure\Storage\Common\Internal\Validate;
use MicrosoftAzure\Storage\Common\ServiceException;

/**
 * Represents an error returned from call to batch API.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class BatchError
{
    /**
     * @var MicrosoftAzure\Storage\Common\ServiceException 
     */
    private $_error;
    
    /**
     * @var integer
     */
    private $_contentId;
    
    /**
     * Creates BatchError object.
     * 
     * @param MicrosoftAzure\Storage\Common\ServiceException $error   The error object.
     * @param array                                $headers The response headers.
     * 
     * @return \MicrosoftAzure\Storage\Table\Models\BatchError 
     */
    public static function create($error, $headers)
    {
        Validate::isTrue(
            $error instanceof ServiceException,
            Resources::INVALID_EXC_OBJ_MSG
        );
        Validate::isArray($headers, 'headers');
        
        $result = new BatchError();
        $clean  = array_change_key_case($headers);
        
        $result->setError($error);
        $contentId = Utilities::tryGetValue($clean, Resources::CONTENT_ID);
        $result->setContentId(is_null($contentId) ? null : intval($contentId));
        
        return $result;
    }
    
    /**
     * Gets the error.
     * 
     * @return MicrosoftAzure\Storage\Common\ServiceException
     */
    public function getError()
    {
        return $this->_error;
    }
    
    /**
     * Sets the error.
     * 
     * @param MicrosoftAzure\Storage\Common\ServiceException $error The error object.
     * 
     * @return none
     */
    public function setError($error)
    {
        $this->_error = $error;
    }
    
    /**
     * Gets the contentId.
     * 
     * @return integer
     */
    public function getContentId()
    {
        return $this->_contentId;
    }
    
    /**
     * Sets the contentId.
     * 
     * @param integer $contentId The contentId object.
     * 
     * @return none
     */
    public function setContentId($contentId)
    {
        $this->_contentId = $contentId;
    }
}


