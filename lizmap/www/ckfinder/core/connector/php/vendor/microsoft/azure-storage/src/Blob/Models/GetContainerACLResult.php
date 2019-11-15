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
use MicrosoftAzure\Storage\Blob\Models\ContainerAcl;

/**
 * Holds container ACL
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Blob\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class GetContainerAclResult
{
    /**
     * @var ContainerAcl
     */
    private $_containerACL;
    
    /**
     * @var \DateTime
     */
    private $_lastModified;

    /**
     * @var string
     */
    private $_etag;
    
    /**
     * Parses the given array into signed identifiers
     * 
     * @param string    $publicAccess container public access
     * @param string    $etag         container etag
     * @param \DateTime $lastModified last modification date
     * @param array     $parsed       parsed response into array
     * representation
     * 
     * @return none.
     */
    public static function create($publicAccess, $etag, $lastModified, $parsed)
    {
        $result = new GetContainerAclResult();
        $result->setETag($etag);
        $result->setLastModified($lastModified);
        $acl = ContainerAcl::create($publicAccess, $parsed);
        $result->setContainerAcl($acl);
        
        return $result;
    }
    
    /**
     * Gets container ACL
     * 
     * @return ContainerAcl
     */
    public function getContainerAcl()
    {
        return $this->_containerACL;
    }
    
    /**
     * Sets container ACL
     * 
     * @param ContainerAcl $containerACL value.
     * 
     * @return none.
     */
    public function setContainerAcl($containerACL)
    {
        $this->_containerACL = $containerACL;
    }
    
    /**
     * Gets container lastModified.
     *
     * @return \DateTime.
     */
    public function getLastModified()
    {
        return $this->_lastModified;
    }

    /**
     * Sets container lastModified.
     *
     * @param \DateTime $lastModified value.
     *
     * @return none.
     */
    public function setLastModified($lastModified)
    {
        $this->_lastModified = $lastModified;
    }

    /**
     * Gets container etag.
     *
     * @return string.
     */
    public function getETag()
    {
        return $this->_etag;
    }

    /**
     * Sets container etag.
     *
     * @param string $etag value.
     *
     * @return none.
     */
    public function setETag($etag)
    {
        $this->_etag = $etag;
    }
}


