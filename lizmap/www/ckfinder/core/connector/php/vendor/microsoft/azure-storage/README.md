# Microsoft Azure Storage SDK for PHP

This project provides a set of PHP client libraries that make it easy to access Microsoft Azure Storage services (blobs, tables and queues). For documentation on how to host PHP applications on Microsoft Azure, please see the [Microsoft Azure PHP Developer Center](http://www.windowsazure.com/en-us/develop/php/).

> **Note**
> 
> If you are looking for the Service Bus, Service Runtime, Service Management or Media Services libraries, please visit https://github.com/Azure/azure-sdk-for-php.

# Features

* Blobs
  * create, list, and delete containers, work with container metadata and permissions, list blobs in container
  * create block and page blobs (from a stream or a string), work with blob blocks and pages, delete blobs
  * work with blob properties, metadata, leases, snapshot a blob
* Tables
  * create and delete tables
  * create, query, insert, update, merge, and delete entities
  * batch operations
* Queues
  * create, list, and delete queues, and work with queue metadata and properties
  * create, get, peek, update, delete messages
  
# Getting Started
## Minimum Requirements

* PHP 5.5 or above
* See [composer.json](composer.json) for dependencies


## Download Source Code

To get the source code from GitHub, type

    git clone https://github.com/Azure/azure-storage-php.git
    cd ./azure-storage-php


## Install via Composer

1. Create a file named **composer.json** in the root of your project and add the following code to it:
```json
    {
      "require": {
        "microsoft/azure-storage": "*"
      }
    }
```
2. Download **[composer.phar](http://getcomposer.org/composer.phar)** in your project root.

3. Open a command prompt and execute this in your project root

    php composer.phar install

## Usage

There are four basic steps that have to be performed before you can make a call to any Microsoft Azure Storage API when using the libraries. 

* First, include the autoloader script:
    
    require_once "vendor/autoload.php"; 
  
* Include the namespaces you are going to use.

  To create any Microsoft Azure service client you need to use the **ServicesBuilder** class:

    use MicrosoftAzure\Storage\Common\ServicesBuilder;

  To process exceptions you need:

    use MicrosoftAzure\Storage\Common\ServiceException;

  
* To instantiate the service client you will also need a valid [connection string](https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/). The format is: 

    DefaultEndpointsProtocol=[http|https];AccountName=[yourAccount];AccountKey=[yourKey]


* Instantiate a client object - a wrapper around the available calls for the given service.

```PHP
$tableClient = ServicesBuilder::getInstance()->createTableService($connectionString);
$blobClient = ServicesBuilder::getInstance()->createBlobService($connectionString);
$queueClient = ServicesBuilder::getInstance()->createQueueService($connectionString);
```

## Code samples

You can find samples in the [sample folder](samples)


# Migrate from [Azure SDK for PHP](https://github.com/Azure/azure-sdk-for-php/)

If you are using [Azure SDK for PHP](https://github.com/Azure/azure-sdk-for-php/) to access Azure Storage Service, we highly recommend you to migrate to this SDK for faster issue resolution and quicker feature implementation. We are working on supporting the latest service features (including SAS, CORS, append blob, file service, etc) as well as improvement on existing APIs.

For now, Microsoft Azure Storage SDK for PHP v0.10.2 shares almost the same interface as the storage blobs, tables and queues APIs in Azure SDK for PHP v0.4.3. However, there are some minor breaking changes need to be addressed during your migration. You can find the details in [BreakingChanges.md](BreakingChanges.md).

Please note that this library is still in preview and may contain more breaking changes in upcoming releases.
  
# Need Help?

Be sure to check out the Microsoft Azure [Developer Forums on Stack Overflow](http://go.microsoft.com/fwlink/?LinkId=234489) and [github issues](https://github.com/Azure/azure-storage-php/issues) if you have trouble with the provided code.

# Contribute Code or Provide Feedback

If you would like to become an active contributor to this project please follow the instructions provided in [Azure Projects Contribution Guidelines](http://azure.github.io/guidelines/).
You can find more details for contributing in the [CONTRIBUTING.md](CONTRIBUTING.md).
 
If you encounter any bugs with the library please file an issue in the [Issues](https://github.com/Azure/azure-storage-php/issues) section of the project.

