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
use MicrosoftAzure\Storage\Common\Internal\HttpFormatter;
use MicrosoftAzure\Storage\Common\ServiceException;
use MicrosoftAzure\Storage\Common\Internal\ServiceRestProxy;
use MicrosoftAzure\Storage\Table\Models\BatchError;
use MicrosoftAzure\Storage\Table\Models\InsertEntityResult;
use MicrosoftAzure\Storage\Table\Models\UpdateEntityResult;

/**
 * Holds results from batch API.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Table\Models
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class BatchResult
{
    /**
     * Each entry represents change set result.
     * 
     * @var array
     */
    private $_entries;
    
    /**
     * Creates a array of responses from the batch response body.
     * 
     * @param string            $body           The HTTP response body.
     * @param IMimeReaderWriter $mimeSerializer The MIME reader and writer.
     * 
     * @return array
     */
    private static function _constructResponses($body, $mimeSerializer)
    {
        $responses = array();
        $parts     = $mimeSerializer->decodeMimeMultipart($body);
        // Decrease the count of parts to remove the batch response body and just
        // include change sets response body. We may need to undo this action in
        // case that batch response body has useful info.
        $count = count($parts);
        
        for ($i = 0; $i < $count; $i++) {
            $response = new \stdClass();
            
            // Split lines
            $lines    = explode("\r\n", $parts[$i]);
            
            // Version Status Reason
            $statusTokens = explode(' ', $lines[0], 3);
            $response->version = $statusTokens[0];
            $response->statusCode = $statusTokens[1];
            $response->reason = $statusTokens[2];
            
            $headers = array();
            $j       = 1;
            do {
                $headerLine = $lines[$j++];
                $headerTokens = explode(':', $headerLine);
                $headers[trim($headerTokens[0])] = 
                    isset($headerTokens[1]) ? trim($headerTokens[1]) : null;   
            } while (Resources::EMPTY_STRING != $headerLine);
            $response->headers = $headers;
            $response->body = implode("\r\n", array_slice($lines, $j));
            $responses[] = $response;
        }
        
        return $responses;
    }
    
    /**
     * Compares between two responses by Content-ID header.
     * 
     * @param \HTTP_Request2_Response $r1 The first response object.
     * @param \HTTP_Request2_Response $r2 The second response object.
     * 
     * @return boolean
     */
    private static function _compareUsingContentId($r1, $r2)
    {
        $h1 = array_change_key_case($r1->headers);
        $h2 = array_change_key_case($r2->headers);
        $c1 = Utilities::tryGetValue($h1, Resources::CONTENT_ID, 0);
        $c2 = Utilities::tryGetValue($h2, Resources::CONTENT_ID, 0);
        
        return intval($c1) >= intval($c2);
    }

    /**
     * Creates BatchResult object.
     * 
     * @param string            $body           The HTTP response body.
     * @param array             $operations     The batch operations.
     * @param array             $contexts       The batch operations context.
     * @param IAtomReaderWriter $atomSerializer The Atom reader and writer.
     * @param IMimeReaderWriter $mimeSerializer The MIME reader and writer.
     * 
     * @return \MicrosoftAzure\Storage\Table\Models\BatchResult
     * 
     * @throws \InvalidArgumentException 
     */
    public static function create($body, $operations, $contexts, $atomSerializer, 
        $mimeSerializer
    ) {
        $result       = new BatchResult();
        $responses    = self::_constructResponses($body, $mimeSerializer);
        $callbackName = __CLASS__ . '::_compareUsingContentId';
        $count        = count($responses);
        $entries      = array();
        
        // Sort $responses based on Content-ID so they match order of $operations.
        uasort($responses, $callbackName);
        
        for ($i = 0; $i < $count; $i++) {
            $context   = $contexts[$i];
            $response  = $responses[$i];
            $operation = $operations[$i];
            $type      = $operation->getType();
            $body      = $response->body;
            $headers   = HttpFormatter::formatHeaders($response->headers);
            
            try {
                ServiceRestProxy::throwIfError(
                    $response->statusCode,
                    $response->reason,
                    $response->body,
                    $context->getStatusCodes()
                );
            
                switch ($type) {
                case BatchOperationType::INSERT_ENTITY_OPERATION:
                    $entries[] = InsertEntityResult::create(
                        $body,
                        $headers,
                        $atomSerializer
                    );
                    break;
                case BatchOperationType::UPDATE_ENTITY_OPERATION:
                case BatchOperationType::MERGE_ENTITY_OPERATION:
                case BatchOperationType::INSERT_REPLACE_ENTITY_OPERATION:
                case BatchOperationType::INSERT_MERGE_ENTITY_OPERATION:
                    $entries[] = UpdateEntityResult::create($headers);
                    break;

                case BatchOperationType::DELETE_ENTITY_OPERATION:
                    $entries[] = Resources::BATCH_ENTITY_DEL_MSG;
                    break;

                default:
                    throw new \InvalidArgumentException();
                }
            } catch (ServiceException $e) {
                $entries[] = BatchError::create($e, $response->headers);
            }
        }
        $result->setEntries($entries);
        
        return $result;
    }
    
    /**
     * Gets batch call result entries.
     * 
     * @return array
     */
    public function getEntries()
    {
        return $this->_entries;
    }
    
    /**
     * Sets batch call result entries.
     * 
     * @param array $entries The batch call result entries.
     * 
     * @return none
     */
    public function setEntries($entries)
    {
        $this->_entries = $entries;
    }
}


