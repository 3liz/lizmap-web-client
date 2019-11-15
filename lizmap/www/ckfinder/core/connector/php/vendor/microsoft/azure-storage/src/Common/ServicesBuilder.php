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
use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Common\Internal\Validate;
use MicrosoftAzure\Storage\Common\Internal\Utilities;
use MicrosoftAzure\Storage\Common\Internal\Filters\DateFilter;
use MicrosoftAzure\Storage\Common\Internal\Filters\HeadersFilter;
use MicrosoftAzure\Storage\Common\Internal\Filters\AuthenticationFilter;
use MicrosoftAzure\Storage\Common\Internal\InvalidArgumentTypeException;
use MicrosoftAzure\Storage\Common\Internal\Serialization\XmlSerializer;
use MicrosoftAzure\Storage\Common\Internal\Authentication\SharedKeyAuthScheme;
use MicrosoftAzure\Storage\Common\Internal\Authentication\TableSharedKeyLiteAuthScheme;
use MicrosoftAzure\Storage\Common\Internal\StorageServiceSettings;
use MicrosoftAzure\Storage\Queue\QueueRestProxy;
use MicrosoftAzure\Storage\Table\TableRestProxy;
use MicrosoftAzure\Storage\Table\Internal\AtomReaderWriter;
use MicrosoftAzure\Storage\Table\Internal\MimeReaderWriter;


/**
 * Builds azure service objects.
 *
 * @category  Microsoft
 * @package   MicrosoftAzure\Storage\Common
 * @author    Azure Storage PHP SDK <dmsh@microsoft.com>
 * @copyright 2016 Microsoft Corporation
 * @license   https://github.com/azure/azure-storage-php/LICENSE
 * @version   Release: 0.10.2
 * @link      https://github.com/azure/azure-storage-php
 */
class ServicesBuilder
{
    /**
     * @var ServicesBuilder
     */
    private static $_instance = null;

    /**
     * Gets the serializer used in the REST services construction.
     *
     * @return MicrosoftAzure\Storage\Common\Internal\Serialization\ISerializer
     */
    protected function serializer()
    {
        return new XmlSerializer();
    }

    /**
     * Gets the MIME serializer used in the REST services construction.
     *
     * @return \MicrosoftAzure\Storage\Table\Internal\IMimeReaderWriter
     */
    protected function mimeSerializer()
    {
        return new MimeReaderWriter();
    }

    /**
     * Gets the Atom serializer used in the REST services construction.
     *
     * @return \MicrosoftAzure\Storage\Table\Internal\IAtomReaderWriter
     */
    protected function atomSerializer()
    {
        return new AtomReaderWriter();
    }

    /**
     * Gets the Queue authentication scheme.
     *
     * @param string $accountName The account name.
     * @param string $accountKey  The account key.
     *
     * @return \MicrosoftAzure\Storage\Common\Internal\Authentication\StorageAuthScheme
     */
    protected function queueAuthenticationScheme($accountName, $accountKey)
    {
        return new SharedKeyAuthScheme($accountName, $accountKey);
    }

    /**
     * Gets the Blob authentication scheme.
     *
     * @param string $accountName The account name.
     * @param string $accountKey  The account key.
     *
     * @return \MicrosoftAzure\Storage\Common\Internal\Authentication\StorageAuthScheme
     */
    protected function blobAuthenticationScheme($accountName, $accountKey)
    {
        return new SharedKeyAuthScheme($accountName, $accountKey);
    }

    /**
     * Gets the Table authentication scheme.
     *
     * @param string $accountName The account name.
     * @param string $accountKey  The account key.
     *
     * @return TableSharedKeyLiteAuthScheme
     */
    protected function tableAuthenticationScheme($accountName, $accountKey)
    {
        return new TableSharedKeyLiteAuthScheme($accountName, $accountKey);
    }

    /**
     * Builds a queue object.
     *
     * @param string $connectionString The configuration connection string.
     * @param array  $options          Array of options to pass to the service
     *
     * @return MicrosoftAzure\Storage\Queue\Internal\IQueue
     */
    public function createQueueService($connectionString, $options = [])
    {
        $settings = StorageServiceSettings::createFromConnectionString(
            $connectionString
        );

        $serializer = $this->serializer();
        $uri        = Utilities::tryAddUrlScheme(
            $settings->getQueueEndpointUri()
        );

        $queueWrapper = new QueueRestProxy(
            $uri,
            $settings->getName(),
            $serializer,
            $options
        );

        // Adding headers filter
        $headers = array(
            Resources::USER_AGENT => self::getUserAgent(),
        );

        $headers[Resources::X_MS_VERSION] = Resources::STORAGE_API_LATEST_VERSION;

        $headersFilter = new HeadersFilter($headers);
        $queueWrapper  = $queueWrapper->withFilter($headersFilter);

        // Adding date filter
        $dateFilter   = new DateFilter();
        $queueWrapper = $queueWrapper->withFilter($dateFilter);

        // Adding authentication filter
        $authFilter = new AuthenticationFilter(
            $this->queueAuthenticationScheme(
                $settings->getName(),
                $settings->getKey()
            )
        );

        $queueWrapper = $queueWrapper->withFilter($authFilter);

        return $queueWrapper;
    }

    /**
     * Builds a blob object.
     *
     * @param string $connectionString The configuration connection string.
     * @param array  $options          Array of options to pass to the service
     * @return MicrosoftAzure\Storage\Blob\Internal\IBlob
     */
    public function createBlobService($connectionString, $options = [])
    {
        $settings = StorageServiceSettings::createFromConnectionString(
            $connectionString
        );

        $serializer = $this->serializer();
        $uri        = Utilities::tryAddUrlScheme(
            $settings->getBlobEndpointUri()
        );

        $blobWrapper = new BlobRestProxy(
            $uri,
            $settings->getName(),
            $serializer,
            $options
        );

        // Adding headers filter
        $headers = array(
            Resources::USER_AGENT => self::getUserAgent(),
        );

        $headers[Resources::X_MS_VERSION] = Resources::STORAGE_API_LATEST_VERSION;

        $headersFilter = new HeadersFilter($headers);
        $blobWrapper   = $blobWrapper->withFilter($headersFilter);

        // Adding date filter
        $dateFilter  = new DateFilter();
        $blobWrapper = $blobWrapper->withFilter($dateFilter);

        $authFilter = new AuthenticationFilter(
            $this->blobAuthenticationScheme(
                $settings->getName(),
                $settings->getKey()
            )
        );

        $blobWrapper = $blobWrapper->withFilter($authFilter);

        return $blobWrapper;
    }

    /**
     * Builds a table object.
     *
     * @param string $connectionString The configuration connection string.
     * @param array  $options          Array of options to pass to the service
     *
     * @return MicrosoftAzure\Storage\Table\Internal\ITable
     */
    public function createTableService($connectionString, $options = [])
    {
        $settings = StorageServiceSettings::createFromConnectionString(
            $connectionString
        );

        $atomSerializer = $this->atomSerializer();
        $mimeSerializer = $this->mimeSerializer();
        $serializer     = $this->serializer();
        $uri            = Utilities::tryAddUrlScheme(
            $settings->getTableEndpointUri()
        );

        $tableWrapper = new TableRestProxy(
            $uri,
            $atomSerializer,
            $mimeSerializer,
            $serializer,
            $options
        );

        // Adding headers filter
        $headers               = array();
        $latestServicesVersion = Resources::STORAGE_API_LATEST_VERSION;
        $currentVersion        = Resources::DATA_SERVICE_VERSION_VALUE;
        $maxVersion            = Resources::MAX_DATA_SERVICE_VERSION_VALUE;
        $accept                = Resources::ACCEPT_HEADER_VALUE;
        $acceptCharset         = Resources::ACCEPT_CHARSET_VALUE;
        $userAgent             = self::getUserAgent();

        $headers[Resources::X_MS_VERSION]             = $latestServicesVersion;
        $headers[Resources::DATA_SERVICE_VERSION]     = $currentVersion;
        $headers[Resources::MAX_DATA_SERVICE_VERSION] = $maxVersion;
        $headers[Resources::MAX_DATA_SERVICE_VERSION] = $maxVersion;
        $headers[Resources::ACCEPT_HEADER]            = $accept;
        $headers[Resources::ACCEPT_CHARSET]           = $acceptCharset;
        $headers[Resources::USER_AGENT]               = $userAgent;

        $headersFilter = new HeadersFilter($headers);
        $tableWrapper  = $tableWrapper->withFilter($headersFilter);

        // Adding date filter
        $dateFilter   = new DateFilter();
        $tableWrapper = $tableWrapper->withFilter($dateFilter);

        // Adding authentication filter
        $authFilter = new AuthenticationFilter(
            $this->tableAuthenticationScheme(
                $settings->getName(),
                $settings->getKey()
            )
        );

        $tableWrapper = $tableWrapper->withFilter($authFilter);

        return $tableWrapper;
    }

    /**
     * Gets the user agent string used in request header.
     *
     * @return string
     */
    private static function getUserAgent()
    {
        // e.g. User-Agent: Azure-Storage/0.10.0 (PHP 5.5.32)
        return 'Azure-Storage/' . Resources::SDK_VERSION . ' (PHP ' . PHP_VERSION . ')';
    }

    /**
     * Gets the static instance of this class.
     *
     * @return ServicesBuilder
     */
    public static function getInstance()
    {
        if (!isset(self::$_instance)) {
            self::$_instance = new ServicesBuilder();
        }

        return self::$_instance;
    }
}
