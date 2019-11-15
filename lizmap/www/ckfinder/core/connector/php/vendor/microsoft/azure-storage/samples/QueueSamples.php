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
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Samples
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @link      https://github.com/azure/azure-storage-php
 */

namespace MicrosoftAzure\Storage\Samples;

require_once "../vendor/autoload.php";

use MicrosoftAzure\Storage\Common\ServicesBuilder;
use MicrosoftAzure\Storage\Common\ServiceException;
use MicrosoftAzure\Storage\Queue\Models\CreateQueueOptions;
use MicrosoftAzure\Storage\Queue\Models\PeekMessagesOptions;

$connectionString = 'DefaultEndpointsProtocol=https;AccountName=<yourAccount>;AccountKey=<yourKey>';
$queueClient = ServicesBuilder::getInstance()->createQueueService($connectionString);

// A QueueRestProxy object lets you create a queue with the createQueue method. When creating a queue,
// you can set options on the queue, but doing so is not required.
createQueueSample($queueClient);

// To add a message to a queue, use QueueRestProxy->createMessage. The method takes the queue name,
// the message text, and message options (which are optional). For compatibility with others you may
// need to base64 encode message.
addMessageToQueueSample($queueClient);

// You can peek at a message (or messages) at the front of a queue without removing it from the queue
// by calling QueueRestProxy->peekMessages.
peekNextMessageSample($queueClient);

// Your code removes a message from a queue in two steps. First, you call QueueRestProxy->listMessages,
// which makes the message invisible to any other code reading from the queue. By default, this message 
// will stay invisible for 30 seconds (if the message is not deleted in this time period, it will become
// visible on the queue again). To finish removing the message from the queue, you must call 
// QueueRestProxy->deleteMessage.
dequeueNextMessageSample($queueClient);

function createQueueSample($queueClient)
{
    $createQueueOptions = new CreateQueueOptions();
    $createQueueOptions->addMetaData("key1", "value1");
    $createQueueOptions->addMetaData("key2", "value2");
    
    try {
        // Create queue.
        $queueClient->createQueue("myqueue", $createQueueOptions);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}

function addMessageToQueueSample($queueClient)
{
    try {
        // Create message.
        $msg = "Hello World!";
        // optional: $msg = base64_encode($msg);
        $queueClient->createMessage("myqueue", $msg);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}

function peekNextMessageSample($queueClient)
{
    // OPTIONAL: Set peek message options.
    $message_options = new PeekMessagesOptions();
    $message_options->setNumberOfMessages(1); // Default value is 1.
    
    try {
        $peekMessagesResult = $queueClient->peekMessages("myqueue", $message_options);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
    
    $messages = $peekMessagesResult->getQueueMessages();
    
    // View messages.
    $messageCount = count($messages);
    if($messageCount <= 0){
        echo "There are no messages.".PHP_EOL;
    } else {
        foreach($messages as $message) {
            echo "Peeked message:".PHP_EOL;
            echo "Message Id: ".$message->getMessageId().PHP_EOL;
            echo "Date: ".date_format($message->getInsertionDate(), 'Y-m-d').PHP_EOL;
            $msg = $message->getMessageText();
            // optional: $msg = base64_decode($msg);
            echo "Message text: ".$msg.PHP_EOL.PHP_EOL;
        }
    }
}

function dequeueNextMessageSample($queueClient)
{
    // Get message.
    $listMessagesResult = $queueClient->listMessages("myqueue");
    $messages = $listMessagesResult->getQueueMessages();
    $message = $messages[0];
    
    // Process message
    
    // Get message Id and pop receipt.
    $messageId = $message->getMessageId();
    $popReceipt = $message->getPopReceipt();
    
    try {
        // Delete message.
        $queueClient->deleteMessage("myqueue", $messageId, $popReceipt);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}