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
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Common\Internal\Serialization\XmlSerializer;
use MicrosoftAzure\Storage\Blob\Models\Block;

/**
 * Holds block list used for commitBlobBlocks
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Blob\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class BlockList
{
    /**
     * @var array
     */
    private $_entries;
    public static $xmlRootName = 'BlockList';
    
    /**
     * Creates block list from array of blocks.
     * 
     * @param array $array The blocks array.
     * 
     * @return BlockList
     */
    public static function create($array)
    {
        $blockList = new BlockList();
        
        foreach ($array as $value) {
            $blockList->addEntry($value->getBlockId(), $value->getType());
        }
        
        return $blockList;
    }
    
    /**
     * Adds new entry to the block list entries.
     * 
     * @param string $blockId The block id.
     * @param string $type    The entry type, you can use BlobBlockType.
     * 
     * @return none
     */
    public function addEntry($blockId, $type)
    {
        Validate::isString($blockId, 'blockId');
        Validate::isTrue(
            BlobBlockType::isValid($type),
            sprintf(Resources::INVALID_BTE_MSG, get_class(new BlobBlockType()))
        );
        $block = new Block();
        $block->setBlockId($blockId);
        $block->setType($type);
        
        $this->_entries[] = $block;
    }
    
    /**
     * Addds committed block entry.
     * 
     * @param string $blockId The block id.
     * 
     * @return none
     */
    public function addCommittedEntry($blockId)
    {
        $this->addEntry($blockId, BlobBlockType::COMMITTED_TYPE);
    }
    
    /**
     * Addds uncommitted block entry.
     * 
     * @param string $blockId The block id.
     * 
     * @return none
     */
    public function addUncommittedEntry($blockId)
    {
        $this->addEntry($blockId, BlobBlockType::UNCOMMITTED_TYPE);
    }
    
    /**
     * Addds latest block entry.
     * 
     * @param string $blockId The block id.
     * 
     * @return none
     */
    public function addLatestEntry($blockId)
    {
        $this->addEntry($blockId, BlobBlockType::LATEST_TYPE);
    }
    
    /**
     * Gets blob block entry.
     * 
     * @param string $blockId The id of the block.
     * 
     * @return Block
     */
    public function getEntry($blockId)
    {
        foreach ($this->_entries as $value) {
            if ($blockId == $value->getBlockId()) {
                return $value;
            }
        }
        
        return null;
    }
    
    /**
     * Gets all blob block entries.
     * 
     * @return string
     */
    public function getEntries()
    {
        return $this->_entries;
    }
    
    /**
     * Converts the  BlockList object to XML representation
     * 
     * @param XmlSerializer $xmlSerializer The XML serializer.
     * 
     * @return string
     */
    public function toXml($xmlSerializer)
    {
        $properties = array(XmlSerializer::ROOT_NAME => self::$xmlRootName);
        $array      = array();
        
        foreach ($this->_entries as $value) {
            $array[] = array(
                $value->getType() => $value->getBlockId()
            );
        }
        
        return $xmlSerializer->serialize($array, $properties);
    }
}

