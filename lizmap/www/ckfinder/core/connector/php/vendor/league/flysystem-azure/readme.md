# League\Flysystem\Azure [BETA]

[![Author](http://img.shields.io/badge/author-@frankdejonge-blue.svg?style=flat-square)](https://twitter.com/frankdejonge)
[![Build Status](https://img.shields.io/travis/thephpleague/flysystem-azure/master.svg?style=flat-square)](https://travis-ci.org/thephpleague/flysystem-azure)
[![Coverage Status](https://img.shields.io/scrutinizer/coverage/g/thephpleague/flysystem-azure.svg?style=flat-square)](https://scrutinizer-ci.com/g/thephpleague/flysystem-azure)
[![Quality Score](https://img.shields.io/scrutinizer/g/thephpleague/flysystem-azure.svg?style=flat-square)](https://scrutinizer-ci.com/g/thephpleague/flysystem-azure)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
<!--
[![Packagist Version](https://img.shields.io/packagist/v/league/flysystem-azure.svg?style=flat-square)](https://packagist.org/packages/league/flysystem-azure)
[![Total Downloads](https://img.shields.io/packagist/dt/league/flysystem-azure.svg?style=flat-square)](https://packagist.org/packages/league/flysystem-azure)
-->

This is a Flysystem adapter for the Windows Azure.

First ensure the pear repository is added to you `composer.json` file.

```json
"repositories": [
    {
        "type": "pear",
        "url": "http://pear.php.net"
    }
],
```

Then install the latest version of the adapter using:


```bash
composer require league/flysystem-azure
```

# Bootstrap

``` php
<?php
use MicrosoftAzure\Storage\Common\ServicesBuilder;
use League\Flysystem\Filesystem;
use League\Flysystem\Azure\AzureAdapter;

$endpoint = sprintf('DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s', 'account-name', 'api-key');
$blobRestProxy = ServicesBuilder::getInstance()->createBlobService($endpoint);

$filesystem = new Filesystem(new AzureAdapter($blobRestProxy, 'my-container'));
```
