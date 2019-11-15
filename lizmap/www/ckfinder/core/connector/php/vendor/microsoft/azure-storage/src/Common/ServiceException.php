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
 * @package   MicrosoftAzure\Storage\Common
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Common;
use MicrosoftAzure\Storage\Common\Internal\Resources;

/**
 * Fires when the response code is incorrect.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class ServiceException extends \LogicException
{
    private $_error;
    private $_reason;
    
    /**
     * Constructor
     *
     * @param string $errorCode status error code.
     * @param string $error     string value of the error code.
     * @param string $reason    detailed message for the error.
     * 
     * @return MicrosoftAzure\Storage\Common\ServiceException
     */
    public function __construct($errorCode, $error = null, $reason = null)
    {
        parent::__construct(
            sprintf(Resources::AZURE_ERROR_MSG, $errorCode, $error, $reason)
        );
        $this->code    = $errorCode;
        $this->_error  = $error;
        $this->_reason = $reason;
    }
    
    /**
     * Gets error text.
     *
     * @return string
     */
    public function getErrorText()
    {
        return $this->_error;
    }
    
    /**
     * Gets detailed error reason.
     *
     * @return string
     */
    public function getErrorReason()
    {
        return $this->_reason;
    }
}


