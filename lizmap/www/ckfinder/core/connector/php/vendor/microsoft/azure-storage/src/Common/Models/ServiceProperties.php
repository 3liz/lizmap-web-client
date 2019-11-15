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
 * @package   MicrosoftAzure\Storage\Common\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */
 
namespace MicrosoftAzure\Storage\Common\Models;
use MicrosoftAzure\Storage\Common\Internal\Utilities;
use MicrosoftAzure\Storage\Common\Models\Logging;
use MicrosoftAzure\Storage\Common\Models\Metrics;
use MicrosoftAzure\Storage\Common\Internal\Serialization\XmlSerializer;

/**
 * Encapsulates service properties
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class ServiceProperties
{
    private $_logging;
    private $_metrics;
    public static $xmlRootName = 'StorageServiceProperties';
    
    /**
     * Creates ServiceProperties object from parsed XML response.
     *
     * @param array $parsedResponse XML response parsed into array.
     * 
     * @return MicrosoftAzure\Storage\Common\Models\ServiceProperties.
     */
    public static function create($parsedResponse)
    {
        $result = new ServiceProperties();
        $result->setLogging(Logging::create($parsedResponse['Logging']));
        $result->setMetrics(Metrics::create($parsedResponse['HourMetrics']));
        
        return $result;
    }
    
    /**
     * Gets logging element.
     *
     * @return MicrosoftAzure\Storage\Common\Models\Logging.
     */
    public function getLogging()
    {
        return $this->_logging;
    }
    
    /**
     * Sets logging element.
     *
     * @param MicrosoftAzure\Storage\Common\Models\Logging $logging new element.
     * 
     * @return none.
     */
    public function setLogging($logging)
    {
        $this->_logging = clone $logging;
    }
    
    /**
     * Gets metrics element.
     *
     * @return MicrosoftAzure\Storage\Common\Models\Metrics.
     */
    public function getMetrics()
    {
        return $this->_metrics;
    }
    
    /**
     * Sets metrics element.
     *
     * @param MicrosoftAzure\Storage\Common\Models\Metrics $metrics new element.
     * 
     * @return none.
     */
    public function setMetrics($metrics)
    {
        $this->_metrics = clone $metrics;
    }
    
    /**
     * Converts this object to array with XML tags
     * 
     * @return array. 
     */
    public function toArray()
    {
        return array(
            'Logging' => !empty($this->_logging) ? $this->_logging->toArray() : null,
            'HourMetrics' => !empty($this->_metrics) ? $this->_metrics->toArray() : null
        );
    }
    
    /**
     * Converts this current object to XML representation.
     * 
     * @param XmlSerializer $xmlSerializer The XML serializer.
     * 
     * @return string
     */
    public function toXml($xmlSerializer)
    {
        $properties = array(XmlSerializer::ROOT_NAME => self::$xmlRootName);
        
        return $xmlSerializer->serialize($this->toArray(), $properties);
    }
}


