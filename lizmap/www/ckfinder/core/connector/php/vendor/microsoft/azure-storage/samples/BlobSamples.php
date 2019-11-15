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

use MicrosoftAzure\Storage\Blob\Models\CreateContainerOptions;
use MicrosoftAzure\Storage\Blob\Models\PublicAccessType;
use MicrosoftAzure\Storage\Common\ServicesBuilder;
use MicrosoftAzure\Storage\Common\ServiceException;

$connectionString = 'DefaultEndpointsProtocol=https;AccountName=<yourAccount>;AccountKey=<yourKey>';
$blobClient = ServicesBuilder::getInstance()->createBlobService($connectionString);

// To create a container call createContainer.
createContainerSample($blobClient);

// To upload a file as a blob, use the BlobRestProxy->createBlockBlob method. This operation will
// create the blob if it doesn¡¯t exist, or overwrite it if it does. The code example below assumes 
// that the container has already been created and uses fopen to open the file as a stream.
uploadBlobSample($blobClient);

// To download blob into a file, use the BlobRestProxy->getBlob method. The example below assumes
// the blob to download has been already created.
downloadBlobSample($blobClient);

// To list the blobs in a container, use the BlobRestProxy->listBlobs method with a foreach loop to loop
// through the result. The following code outputs the name and URI of each blob in a container.
listBlobsSample($blobClient);

function createContainerSample($blobClient)
{
    // OPTIONAL: Set public access policy and metadata.
    // Create container options object.
    $createContainerOptions = new CreateContainerOptions();

    // Set public access policy. Possible values are
    // PublicAccessType::CONTAINER_AND_BLOBS and PublicAccessType::BLOBS_ONLY.
    // CONTAINER_AND_BLOBS: full public read access for container and blob data.
    // BLOBS_ONLY: public read access for blobs. Container data not available.
    // If this value is not specified, container data is private to the account owner.
    $createContainerOptions->setPublicAccess(PublicAccessType::CONTAINER_AND_BLOBS);

    // Set container metadata
    $createContainerOptions->addMetaData("key1", "value1");
    $createContainerOptions->addMetaData("key2", "value2");

    try {
        // Create container.
        $blobClient->createContainer("mycontainer", $createContainerOptions);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}

function uploadBlobSample($blobClient)
{
    $content = fopen("myfile.txt", "r");
    $blob_name = "myblob";
    
    try {
        //Upload blob
        $blobClient->createBlockBlob("mycontainer", $blob_name, $content);
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}

function downloadBlobSample($blobClient)
{
    try {
        $getBlobResult = $blobClient->getBlob("mycontainer", "myblob");
    } catch (ServiceException $e) {
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
    
    file_put_contents("output.txt", $getBlobResult->getContentStream());
}

function listBlobsSample($blobClient)
{
    try {
        // List blobs.
        $blob_list = $blobClient->listBlobs("mycontainer");
        $blobs = $blob_list->getBlobs();
    
        foreach($blobs as $blob)
        {
            echo $blob->getName().": ".$blob->getUrl().PHP_EOL;
        }
    } catch(ServiceException $e){
        $code = $e->getCode();
        $error_message = $e->getMessage();
        echo $code.": ".$error_message.PHP_EOL;
    }
}