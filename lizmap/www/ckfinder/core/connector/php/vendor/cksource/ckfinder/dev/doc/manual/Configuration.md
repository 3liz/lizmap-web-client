# Configuration {#configuration}

\tableofcontents

@section configuration_file Configuration Files

CKFinder comes with two configuration files:
 - `config.php` &ndash; A server-side configuration file, explained in this article.
 - `config.js` &ndash; An optional client-side configuration file, explained in the API documentation article about [setting JavaScript configuration](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config).

The following options can be set in the `config.php` file:

Option Name          | Type | Description
-------------------- | ---- | ---------
@ref configuration_options_accessControl | Array | Access Control Lists (ACL) to grant users different permissions for working with CKFinder folders and files based on user roles.
@ref configuration_options_authentication | Function <br> Callable | The function used to decide if the user should have access to CKFinder.
@ref configuration_options_backends | Array | Backends configuration where all types of storage that CKFinder should support must be defined (e.g. the target path on a local file system; FTP hostname, user and password; Dropbox account credentials).
@ref configuration_options_cache @labelSince{3.1.0} | Array | Configures cache lifetime for various CKFinder components.
@ref configuration_options_checkDoubleExtension | Boolean | Whether to allow for files with double file extension.
@ref configuration_options_checkSizeAfterScaling | Boolean | Whether to check the file size of images before or after scaling for the maximum allowed dimensions.
@ref configuration_options_debug | Boolean | Turns the debug mode on/off.
@ref configuration_options_debugLoggers | Array | Debug handlers to be used when the debug mode is enabled.
@ref configuration_options_defaultResourceTypes | String | Configures the resource types that should be shown to the end user.
@ref configuration_options_disallowUnsafeCharacters | Boolean | Disallows creating folders and uploading files whose names contain characters that are not safe on an IIS web server.
@ref configuration_options_csrfProtection @labelSince{3.2.0} | Boolean | Enables CSRF protection in the connector.
@ref configuration_options_forceAscii | Boolean | Forces ASCII names for files and folders.
@ref configuration_options_headers | Array | HTTP headers to be added to every connector response.
@ref configuration_options_hideFiles | Array | Files that are not to be displayed in CKFinder, no matter their location.
@ref configuration_options_hideFolders | Array | Folders that are not to be displayed in CKFinder, no matter their location.
@ref configuration_options_htmlExtensions | Array | The types of files that may allow for HTML code in the first kB of data.
@ref configuration_options_images | Array | The image configuration, like maximum allowed width and height.
@ref configuration_options_licenseKey | String | The CKFinder license key. If invalid, CKFinder will run in Demo mode.
@ref configuration_options_licenseName | String | The CKFinder license name. If invalid, CKFinder will run in Demo mode.
@ref configuration_options_overwriteOnUpload | String | Whether to overwrite files on upload instead of auto renaming.
@ref configuration_options_plugins | Array | The list of plugins to enable.
@ref configuration_options_pluginsDirectory | String | The path to the connector plugins directory.
@ref configuration_options_privateDir | Array | The private directory location and settings.
@ref configuration_options_resourceTypes | Array | The resource types handled in CKFinder. Each resource type is represented as a "root" folder in CKFinder (e.g. **Files** and **Images**) and points to a specific folder of a configured backend.
@ref configuration_options_roleSessionVar | String | The session variable name that CKFinder must use to retrieve the "role" of the current user.
@ref configuration_options_secureImageUploads | Boolean | Whether to perform additional checks when uploading image files.
@ref configuration_options_sessionWriteClose @labelSince{3.1.0} | Boolean | Whether the connector should close write access to the session to avoid performance issues.
@ref configuration_options_tempDirectory @labelSince{3.1.0} | String | The path to the temporary files folder used by CKFinder.
@ref configuration_options_thumbnails | Array | Internal thumbnails configuration.
@ref configuration_options_xSendfile | Boolean | Whether to send files using the `X-Sendfile` module.


 **Note:** `config.php` is a regular PHP file, so if you make a mistake there, e.g. forget a semicolon, the application may stop working.

@section configuration_options Configuration Options

@subsection configuration_options_accessControl accessControl

Access Control List (ACL) is a feature that grants your users different permissions for working with CKFinder folders and files. The default settings placed in the `config.php` file grant full permissions for all options to every user.

### Access Control List Syntax

The syntax of the ACL entries is as follows:

~~~
$config['accessControl'][] = array(
    'role'               => '*',
    'resourceType'       => '*',
    'folder'             => '/',

    'FOLDER_VIEW'        => true,
    'FOLDER_CREATE'      => true,
    'FOLDER_RENAME'      => true,
    'FOLDER_DELETE'      => true,

    'FILE_VIEW'          => true,
    'FILE_CREATE'        => true,
    'FILE_RENAME'        => true,
    'FILE_DELETE'        => true,

    'IMAGE_RESIZE'        => true,
    'IMAGE_RESIZE_CUSTOM' => true
);
~~~

Access Control List entries are defined using the following values:

Option Name          | Type | Description
-------------------- | ---- | ---------
`role` | String | The role (see @ref configuration_options_roleSessionVar "roleSessionVar") of the user for which the ACL setting is provided. By default it is set to `*` (asterisk) which means "everybody".
`resourceType` | String | The name of the resource type (see @ref configuration_options_resourceTypes). By default it is set to `*` (asterisk) which means "all resource types".
`folder` | String | The folder where the restrictions will be used. By default it is set to `/` (slash) which means "the root folder of a resource type".
`FOLDER_VIEW` | Boolean | Whether the user can view the list of files.
`FOLDER_CREATE` | Boolean | Whether the user can create a folder.
`FOLDER_RENAME` | Boolean | Whether the user can rename a folder.
`FOLDER_DELETE` | Boolean | Whether the user can delete a folder.
`FILE_VIEW` | Boolean | Whether the user can view the file content.
`FILE_CREATE` | Boolean | Whether the user can create (e.g. upload) files.
`FILE_RENAME` | Boolean | Whether the user can rename files.
`FILE_DELETE` | Boolean | Whether the user can delete files.
`IMAGE_RESIZE` | Boolean | Whether - when choosing the image - the user can resize it to dimensions predefined in the configuration file.
`IMAGE_RESIZE_CUSTOM` | Boolean | Whether - when choosing the image - the user can resize it to any dimensions.

**Note:** The `IMAGE_RESIZE` and `IMAGE_RESIZE_CUSTOM` options correspond to the **Choose Resized** feature which automatically creates a resized version of the chosen image. They do not affect resizing of the image modified in the CKFinder's image editor (**Edit** feature).

It is possible to define numerous ACL entries. All attributes are optional. Subfolders inherit their default settings from their parents' definitions.

#### About the Folder

 It is important to understand what the `folder` entry means. In the ACL definition the `folder` is a path relative to the resource type location. This is not an absolute path to a folder on the server.

<h4>Example</h4>

 If the `Files` resource type points to `/home/joe/www/example.com/userfiles/files/`, then ACL defined for folder `/documents` in the `Files` resource type will be applied to `/home/joe/www/example.com/userfiles/files/documents/`.

### Access Control List Examples
Take a look at the following examples that present various permission configurations in order to learn more about using Access Control Lists in CKFinder.

<h4>Example 1</h4>

Disallowing file operations in the `/Logos` folder of the `Images` resource type.

To restrict the upload, renaming, or deletion of files in the `Logos` folder of the `Images` resource type, use the following ACL settings:

~~~
$config['accessControl'][] = Array(
    'role' => '*',
    'resourceType' => 'Images',
    'folder' => '/Logos',

    'FOLDER_VIEW'        => true,
    'FOLDER_CREATE'      => true,
    'FOLDER_RENAME'      => true,
    'FOLDER_DELETE'      => true,

    'FILE_VIEW'          => true,
    'FILE_CREATE'        => false,
    'FILE_RENAME'        => false,
    'FILE_DELETE'        => false,

    'IMAGE_RESIZE'        => true,
    'IMAGE_RESIZE_CUSTOM' => true
);
~~~

**Note:** This example only refers to file operations in the `/Logos` folder. It does not restrict operations on folders, so the user can still delete or rename it. In order to limit the users' ability to modify the folder itself (not its content), you should change the folder permissions as well.

<h4>Example 2</h4>

Making the `/Logos` folder fully read-only for all resource types.

To restrict the upload, renaming, or deletion of files as well as creation, renaming and deletion of folders in the `/Logos` folder (including the `/Logos` folder itself) in all resource types (`*`), use the following ACL settings:

~~~
$config['accessControl'][] = Array(
    'role' => '*',
    'resourceType' => '*',
    'folder' => '/Logos',

    'FOLDER_VIEW'        => true,
    'FOLDER_CREATE'      => false,
    'FOLDER_RENAME'      => false,
    'FOLDER_DELETE'      => false,

    'FILE_VIEW'          => true,
    'FILE_CREATE'        => false,
    'FILE_RENAME'        => false,
    'FILE_DELETE'        => false,

    'IMAGE_RESIZE'        => false,
    'IMAGE_RESIZE_CUSTOM' => false
);
~~~
With such permissions the user will not even have the rights to create resized versions of existing images with the **Choose Resized** feature.

<h4>Example 3</h4>

As permissions are inherited by subfolders, it is enough to define permissions that will be further modified by ACL entries.
The default setting in CKFinder allows everyone to do everything:
~~~
$config['accessControl'][] = array(
    'role'               => '*',
    'resourceType'       => '*',
    'folder'             => '/',

    'FOLDER_VIEW'        => true,
    'FOLDER_CREATE'      => true,
    'FOLDER_RENAME'      => true,
    'FOLDER_DELETE'      => true,

    'FILE_VIEW'          => true,
    'FILE_CREATE'        => true,
    'FILE_RENAME'        => true,
    'FILE_DELETE'        => true,

    'IMAGE_RESIZE'        => true,
    'IMAGE_RESIZE_CUSTOM' => true
);
~~~
It means that to forbid any folder operations apart from viewing you can set:
~~~
$config['accessControl'][] = array(
    'role'               => '*',
    'resourceType'       => '*',
    'folder'             => '/',

    'FOLDER_CREATE'      => false,
    'FOLDER_RENAME'      => false,
    'FOLDER_DELETE'      => false,
);
~~~
without having to repeat all entries set to `true`.

@subsection configuration_options_authentication authentication

A function used to decide if the user should have access to CKFinder. It can also be any type of a PHP callable.

<h4>Example 1</h4>

Enable CKFinder without any additional checks:
~~~
$config['authentication'] = function() {
    return true;
};
~~~

**WARNING:** Do not simply return `true`. By doing so, you are allowing "anyone" to upload and list the files on your server. You should implement some kind of session validation mechanism to make sure that only trusted users can upload or delete your files.

<h4>Example 2</h4>

Let us assume that <code>$_SESSION['IsAuthorized']</code> is set to `true` as soon as the user logs into your system. You can check this session variable instead of always returning `true`:

~~~
session_start();

$config['authentication'] = function() {
    return isset($_SESSION['IsAuthorized']) && $_SESSION['IsAuthorized'];
};
~~~

<h4>Example 3</h4>

Any type of a PHP callable may be set as `authentication`, so passing a function name instead of defining the function explicitly is also possible:

Let us assume you have the following function defined somewhere in your application in a file named `foo.php`:

~~~
function isAuthenticated() {
  return true;
}
~~~

In `config.php`:

~~~
require_once '/path/to/foo.php';

$config['authentication'] = 'isAuthenticated';
~~~

<h4>Example 4</h4>

You can also pass an array containing a method instead of defining the function explicitly.

Let us assume you have the following function defined somewhere in your application in a file named `foo.php`:
~~~
<?php

namespace MyProject;

class User {
  private $authenticated = false;

  function login() {
    $this->authenticated = true;
  }

  function logout() {
    $this->authenticated = false;
  }

  public function isLoggedIn() {
    return $this->authenticated;
  }
}

$user = new User();
$user->login();
~~~

In `config.php`:

~~~
require_once '/path/to/foo.php';

$config['authentication'] = array($user, 'isLoggedIn');
~~~

@subsection configuration_options_backends backends

Backends are used in @ref configuration_options_resourceTypes "resource type definitions" as a definition of
the storage where files should be located. Although backends and resource types are strictly related, they are defined separately to simplify the configuration in a situation where e.g. the same FTP account is used to define four different resource types, where the only difference is the name of a subfolder on the FTP server.

<h4>Example</h4>

An example of a connection between a backend defined as `my_ftp` and two resource types:

~~~
$config['backends'][] = array(
    'name'         => 'my_ftp',
    'adapter'      => 'ftp',
    'host'         => 'ftp.example.com',
    'username'     => 'username',
    'password'     => 'password'
);

$config['resourceTypes'] = array(
    array(
        'name'              => 'Files',
        'directory'         => 'files', // = ftp_root_folder/files
        'maxSize'           => 0,
        'allowedExtensions' => 'pdf,doc,zip',
        'backend'           => 'my_ftp',
        'lazyLoad'          => true
    ),
    array(
        'name'              => 'Images',
        'directory'         => 'images', // = ftp_root_folder/images
        'maxSize'           => 0,
        'allowedExtensions' => 'gif,jpeg,jpg,png',
        'backend'           => 'my_ftp',
        'lazyLoad'          => true
    )
);
~~~

<h4>Common Configuration Options</h4>

The set of options listed below can be used with any backend type.

Option Name                 | Type    | Description
--------------------------- | ------- | -----------
`name`                      | String  | The unique name of the backend.
`adapter`                   | String  | The type of adapter used by this backend &mdash; `local` for a local file system.
`baseUrl` @optional         | String  | The base URL used for direct access to CKFinder files &mdash; this URL must correspond to the directory where CKFinder users' files are stored.
`useProxyCommand` @optional @labelSince{3.1.0} | Boolean | Whether the links to files stored on this backend should be pointing to the @ref command_proxy command.

\anchor backend_option_useProxyCommand

<h4>useProxyCommand</h4>

\since CKFinder 3.1.0

The `useProxyCommand` is a powerful option that allows to serve any files stored in CKFinder. Creating links to files for your web page
may be difficult, or even impossible in some cases (for example when files are stored on a private FTP server, or files are not in the web server root folder).
Enabling this option for a backend tells CKFinder to create links to files using the @ref command_proxy command.

Serving files this way has the following advantages:
 * The files do not need to be publicly accessible with direct links. You do not have to change your storage configuration to make files accessible for anonymous users.
 * Better control over access to files. You can use CKFinder ACL options to define more strict access rights to files (see the @ref configuration_options_accessControl configuration option).
 * Easier control over client-side caching rules. Using the @ref configuration_options_cache configuration option you can define for how long the file served by the `Proxy` command should be cached in the browser.

The disadvantage of this approach is that all links to files will be dependent on the CKFinder connector, so if you decide to remove CKFinder one day, the links will simply stop working.

<h3>Supported Backends</h3>
The CKFinder connector uses a [file system abstraction layer](https://flysystem.thephpleague.com) which allows to use many different file systems transparently.
Below you can find a list of supported backends with their configuration options.

@subsubsection configuration_options_backends_local Local File System
This is the default backend in CKFinder which points to a folder in the local file system of the server.

**Configuration Options**
Option Name          | Type    | Description
-------------------- | ------- | -----------
`name`               | String  | The unique name of the backend.
`adapter`            | String  | The type of adapter used by this backend &mdash; `local` for a local file system.
`baseUrl` @optional  | String  | The base URL used for direct access to CKFinder files &mdash; this URL must correspond to the directory where CKFinder users' files are stored.
`root`               | String  | The file system path to the directory with CKFinder users' files. This directory must exist on the server.
`chmodFiles`         | Integer | The permissions for files created in CKFinder (for example uploaded, copied, moved files). Use octal values.
`chmodFolders`       | Integer | The permissions for folders created in CKFinder. Use octal values.
`filesystemEncoding` | String  | The encoding of the file and folder names in the local file system.
`useProxyCommand` @optional @labelSince{3.1.0} | Boolean | Whether the links to files stored on this backend should be pointing to the @ref command_proxy command.
`followSymlinks` @optional @labelSince{3.4.3} | Boolean | Enables support for UNIX symbolic links. If this option is enabled, the symbolic links on the backend will be treated like regular files or folders. \n **Important:** If you enable this option, please make sure a correct file system permission is set for the file or directory the symlink is pointing to. The default configuration of multiple web servers does not allow for access to files outside the defined _document root_.
<h4>Example</h4>
~~~~~~~~~~~~~~~~
$config['backends'][] = array(
    'name'               => 'default',
    'adapter'            => 'local',
    'baseUrl'            => 'http://domain.com/ckfinder/userfiles/',
    'root'               => '/var/www/ckfinder/userfiles/',
    'chmodFiles'         => 0755,
    'chmodFolders'       => 0755,
    'filesystemEncoding' => 'UTF-8',
    'followSymlinks'     => true
);
~~~~~~~~~~~~~~~~

@subsubsection configuration_options_backends_dropbox Dropbox
This backend allows you to attach any of the folders existing on your Dropbox account to CKFinder.

<blockquote style="background: #fcc">
<strong>Important Information</strong>
<p>
Since CKFinder v3.4.2 Dropbox backend requires PHP 7.0+.
</p>
</blockquote>

**Configuration Options**
Option Name          | Type   | Description
-------------------- | ------ | -----------
`name`               | String | The unique name of the backend.
`adapter`            | String | The type of adapter used by this backend &mdash; `dropbox` for Dropbox.
`username`           | String | Dropbox account username.
`token`              | String | Dropbox application token.
`baseUrl` @optional  | String | The base URL used for direct access to CKFinder files on Dropbox (if you use your public folder, you can find a common prefix for all public files).
`root` @optional     | String | The directory path with CKFinder users' files. This directory must exist on the server.
`useProxyCommand` @optional @labelSince{3.1.0} | Boolean | Whether the links to files stored on this backend should be pointing to the @ref command_proxy command.

<h4>Example</h4>
~~~
$config['backends'][] = array(
    'name'         => 'my_dropbox_files',
    'adapter'      => 'dropbox',
    'username'     => 'your.email@gmail.com',
    'token'        => 'A0zpap59tvla48d1Oze19c70f720f9cb1-e5f9ec048d1dbe19c70f720e002',
    'root'         => '/my/ckfinder/files'
);
~~~

To use CKFinder with Dropbox you need an application token generated for your Dropbox account. To generate the token go to [Dropbox App Console](https://www.dropbox.com/developers/apps) and create a new application, like on the screencast below:

![Creating Dropbox application token](/manual/images/dropbox_token.gif)

Note that when creating the application you can define the folder accessible by this application. In the example above access to an entire Dropbox account was allowed.

@subsubsection configuration_options_backends_amazons3 Amazon S3
This backend allows you to attach your Amazon S3 storage to CKFinder.

**Configuration Options**
Option Name            | Type   | Description
---------------------- | ------ | -----------
`name`                 | String | The unique name of the backend.
`adapter`              | String | The type of adapter used by this backend &mdash; `s3` for Amazon S3.
`bucket`               | String | Bucket name.
`region`               | String | Region identifier. For list of regions and their endpoints please refer to https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
`key`                  | String | Access key.
`secret`               | String | Secret value.
`signature` @optional  | String | Signature version for region (by default set to `v4`). For list of regions and supported signature versions please refer to https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region.
`visibility` @optional | String | The visibility of the stored files. The default is `private`, which means that files uploaded to S3 will not be accessible directly (using the file URL). To enable direct access set this value to `public`.
`baseUrl` @optional    | String | The base URL used for direct access to CKFinder files on Amazon S3 (if files are publicly visible, you can find a common prefix for them, for example `https://s3-eu-west-1.amazonaws.com/bucket`).
`root` @optional       | String | The directory path with CKFinder users' files. This directory must exist on the server.
`useProxyCommand` @optional  @labelSince{3.1.0} | Boolean | Whether the links to files stored on this backend should be pointing to the @ref command_proxy command.

<h4>Example</h4>
~~~
$config['backends'][] = array(
    'name'         => 'awss3',
    'adapter'      => 's3',
    'bucket'       => 'ckftest',
    'region'       => 'eu-west-1',
    'key'          => 'AYUZ7A78ZHAAZ8AL4A',
    'secret'       => 'ab89Va7dgDFtGrASOMA58787z7dgDFtGrASOMA58odg',
    'visibility'   => 'public',
    'baseUrl'      => 'http://s3-eu-west-1.amazonaws.com/bucket/s3_ckf_files/',
    'root'         => 's3_ckf_files'
);
~~~

To create AWS access key please refer to [Amazon Web Services documentation](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html).

**Note:** Please follow [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#create-iam-users) and do not use your AWS root access key.


@subsubsection configuration_options_backends_ftp FTP
This backend allows you to connect your FTP server account to CKFinder.

**Configuration Options**
Option Name            | Type    | Description
---------------------- | ------- | -----------
`name`                 | String  | The unique name of the backend.
`adapter`              | String  | The type of adapter used by this backend &mdash; `ftp` for FTP.
`host`                 | String  | The server host name.
`username`             | String  | The FTP user name.
`password`             | String  | The FTP user password.
`baseUrl` @optional    | String  | The base URL used for direct access to CKFinder files on the FTP server.
`ssl` @optional        | Boolean | The flag determining whether a secure SSL-FTP connection should be used (by default it is set to `false`).
`port` @optional       | Integer | The FTP server port (by default it is set to `21`).
`passive` @optional    | Boolean | Turns passive mode on or off (by default it is set to `true`)
`root` @optional       | String  | The directory path with CKFinder users' files. This directory must exist on the server.
`useProxyCommand` @optional @labelSince{3.1.0} | Boolean | Whether the links to files stored on this backend should be pointing to @ref command_proxy command.

<h4>Example</h4>
~~~
$config['backends'] = array(
    'name'         => 'my_ftp',
    'adapter'      => 'ftp',
    'host'         => 'ftp.example.com',
    'username'     => 'username',
    'password'     => 'password'
);
~~~

@subsubsection configuration_options_backends_azure Azure

\since CKFinder 3.3.0

This backend allows you to attach your Azure storage to CKFinder.

**Configuration Options**
Option Name                 | Type    | Description
--------------------------- | ------- | -----------
`name`                      | String  | The unique name of the backend.
`adapter`                   | String  | The type of adapter used by this backend &mdash; `azure` for Azure storage.
`account`                   | String  | Account name.
`key`                       | String  | Access key.
`baseUrl` @optional         | String  | The base URL used for direct access to CKFinder files on Azure.
`root` @optional            | String  | The directory path with CKFinder users' files. This directory must exist on the server.
`useProxyCommand` @optional | Boolean | Whether the links to files stored on this backend should be pointing to the @ref command_proxy command.

<h4>Example</h4>
~~~
$config['backends'][] = array(
    'name'         => 'azure-backend',
    'adapter'      => 'azure',
    'account'      => 'account-name',
    'key'          => 'ab89Va7dgDFtGrASOMA58787z7dgDFtGrASOMA58odg==',
    'container'    => 'container-name',
    'baseUrl'      => 'https://account-name.blob.core.windows.net/container-name/root-dir/',
    'root'         => 'root-dir'
);
~~~

For information about creation and management of the storage account keys please refer to [Microsoft Azure Documentation](https://azure.microsoft.com/en-us/documentation/articles/storage-create-storage-account/#manage-your-storage-access-keys).

@subsubsection configuration_options_backends_rackspace Rackspace

Coming in future versions of CKFinder.

@subsubsection configuration_options_backends_sftp SFTP

Coming in future versions of CKFinder.

@subsubsection configuration_options_backends_webdav WebDAV

Coming in future versions of CKFinder.

@subsubsection configuration_options_backends_gridfs GridFS

Coming in future versions of CKFinder.

@subsection configuration_options_cache cache

\since CKFinder 3.1.0

Configures cache lifetime for various CKFinder components:
 * `thumbnails` &ndash; Cache lifetime for thumbnail images.
 * `imagePreview` &ndash; Cache lifetime for images returned by the @ref command_image_preview command.
 * `proxyCommand` &ndash; Cache lifetime for files served by the @ref command_proxy command.

The lifetime is defined as an integer representing the number of seconds. If the value provided
is not a positive number larger than 0, the cache for a component will be disabled.

<h4>Example</h4>

~~~
$config['cache'] = array(
   'imagePreview' => 0,           // Disable cache for ImagePreview.
   'thumbnails'   => 24 * 3600    // Cache thumbnails for 24 hours.
   'proxyCommand' => 3600         // Cache files served by the Proxy command for an hour.
);
~~~

@subsection configuration_options_checkDoubleExtension checkDoubleExtension

Whether to allow for files with double file extension. Due to security issues with Apache modules it is recommended to leave `checkDoubleExtension` enabled.

### How Does It Work?

Suppose the following scenario:

- If `php` is not on the allowed extensions list, a file named `foo.php` cannot be uploaded.
- If `rar` (or any other) extension is added to the allowed extensions list, one can upload a file named `foo.rar`.
- The file `foo.php.rar` has a `rar` extension so in theory, it can also be uploaded.

Under some circumstances Apache can treat the `foo.php.rar` file just like any other PHP script and execute it.

If `checkDoubleExtension` is enabled, each part of the file name after the dot is checked, not only the last part. If an extension is disallowed, the dot (`.`) is replaced with an underscore (`_`). In this case the uploaded `foo.php.rar` file will be renamed into `foo_php.rar`.

<h4>Example</h4>

~~~
$config['checkDoubleExtension'] = true;
~~~

@subsection configuration_options_checkSizeAfterScaling checkSizeAfterScaling

Indicates that the file size of uploaded images must be checked against the `maxSize` setting defined in the @ref configuration_options_resourceType "resource type" configuration only after scaling down (when needed). Otherwise, the size is checked right after uploading.

<h4>Example</h4>

~~~
$config['checkSizeAfterScaling'] = true;
~~~

@subsection configuration_options_debug debug

Turns the debug mode on/off. See @ref debugging

<h4>Example</h4>

~~~
$config['debug'] = true;
~~~

@subsection configuration_options_debugLoggers debugLoggers

Specifies debug handlers. Multiple handlers may be provided. See @ref debugging.

Option name    | Description
-------------- | -----------
`ckfinder_log` | Reports errors in the log file located in the private CKFinder folder (`/ckfinder/userfiles/.ckfinder/logs/error.log`).
`error_log`    | Reports errors in the server log (`error_log` in Apache).
`firephp`      | Reports errors directly in the Firebug console if [FirePHP](https://addons.mozilla.org/en-US/firefox/addon/firephp/) is installed in Firefox or [FirePHP4Chrome](https://chrome.google.com/webstore/detail/firephp4chrome/gpgbmonepdpnacijbbdijfbecmgoojma) is installed for Google Chrome.


<h4>Example</h4>

~~~
$config['debugLoggers'] =  array('ckfinder_log', 'error_log', 'firephp');
~~~

@subsection configuration_options_defaultResourceTypes defaultResourceTypes

A comma-separated list of @ref configuration_options_resourceTypes "resource type names" that should be loaded. If left empty, all resource types are loaded.

<h4>Example</h4>

~~~
$config['defaultResourceTypes'] = 'Files,Images';
~~~

@subsection configuration_options_disallowUnsafeCharacters disallowUnsafeCharacters

Disallows creating folders and uploading files whose names contain characters that are not safe on an IIS web server.
Increases the security on an IIS web server.

<h4>Example</h4>

~~~
$config['disallowUnsafeCharacters'] = true;
~~~

@subsection configuration_options_csrfProtection csrfProtection

\since CKFinder 3.2.0

Enables [CSRF](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29) protection in the connector. The default
CSRF protection mechanism is based on [double submit cookies](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29_Prevention_Cheat_Sheet#Double_Submit_Cookie).

<h4>Example</h4>

~~~
$config['csrfProtection'] = true;
~~~

@subsection configuration_options_forceAscii forceAscii

Forces ASCII names for files and folders. If enabled, characters with diactric marks, like `å`, `ä`, `ö`, `ć`, `č`, `đ` or `š`
will be automatically converted to ASCII letters.

<h4>Example</h4>

~~~
$config['forceAscii'] = false;
~~~

@subsection configuration_options_headers headers

Headers that should be added to every connector response.

<h4>Example</h4>

Define CORS headers.

~~~
$config['headers'] => array(
    'Access-Control-Allow-Origin' => '*',
    'Access-Control-Allow-Credentials' => 'true'
);
~~~

@subsection configuration_options_hideFiles hideFiles

Files that are not to be displayed in CKFinder, no matter their location. No paths are accepted, only file names, including the extension. The `*` (asterisk) and `?` (question mark) wildcards are accepted.

<h4>Example</h4>

Hide files that start with a dot character.

~~~
$config['hideFiles'] = array('.*');
~~~

@subsection configuration_options_hideFolders hideFolders

Folders that are not to be displayed in CKFinder, no matter their location.

<h4>Example</h4>

Hide all folders that start with a dot character and two additional folders: `CVS` and `__thumbs`.

~~~
$config['hideFolders'] = array('.*', 'CVS', '__thumbs');
~~~

@subsection configuration_options_htmlExtensions htmlExtensions

Types of files that may allow for HTML code in the first kB of data.

Sometimes when uploading a file it may happen that a file contains HTML code in the first kilobytes of its data. CKFinder will upload the file with the HTML code only when the file extension is specified in `htmlExtensions`.

<h4>Example 1</h4>

~~~
$config['htmlExtensions'] = array('html', 'htm', 'xml', 'js');
~~~

<h4>Example 2</h4>

In order to upload an `.xsl` file that contains HTML code at the beginning of the file, add the `xsl` extension to the list.

~~~
$config['htmlExtensions'] = array('html', 'htm', 'xml', 'js', 'xsl');
~~~

Please note that this feature performs only a very basic set of checks to detect HTML-like data in the first 1kB of the file contents to protect users e.g. against unintentional uploading of files with HTML content and with a wrong extension.

**Note**: Malicious files that contain HTML-like data may use various UTF encodings. To validate all possible encodings please make sure that the `mbstring` PHP extension is enabled on your server.

@subsection configuration_options_images images

Image configuration for CKFinder.

**Configuration Options**

Option name | Type | Description
----------- | ---- | -----------
`maxWidth` | Integer | The maximum width of uploaded images. If the image size is bigger than the one specified, the image will be resized to the defined dimensions.
`maxHeight` | Integer | The maximum height of uploaded images. If the image size is bigger than the one specified, the image will be resized to the defined dimensions.
`quality` | Integer | The quality of created images in a range from 1 to 100. The smaller the quality value, the smaller the size of resized images. Notice that an acceptable quality value is about 80-90.
`sizes` @optional | Array | Predefined sizes of images that can be easily selected from CKFinder and passed to an external application (e.g. CKEditor) without having to resize the image manually. The keys of the associative array are translated and used as entries in the "Select Thumbnail" context menu. The translated label for a particular entry is taken from language files, for example `small` will be translated as <code>lang.image['small']</code>. If a translation key is not set for the current language, an English version is used. If an English version was not found, an untranslated string is used (with the first letter set to uppercase).
`threshold` @optional | Array | A low-level internal configuration option used by CKFinder when showing image previews in various parts of the application. If CKFinder has in its cache an already resized version of an image and the size of the image is almost the same as requested (within the defined threshold), CKFinder will use that image. This option increases performance by (i) avoiding having too many copies of images with almost the same size (ii) avoiding scaling images on every preview.

<h4>Example</h4>

~~~
$config['images'] = array(
    'maxWidth'  => 1600,
    'maxHeight' => 1200,
    'quality'   => 80,
    'sizes' => array(
        'small'  => array('width' => 480, 'height' => 320, 'quality' => 80),
        'medium' => array('width' => 600, 'height' => 480, 'quality' => 80),
        'large'  => array('width' => 800, 'height' => 600, 'quality' => 80)
    ),
    'threshold' => array('pixels'=> 80, 'percent' => 10)
);
~~~

@subsection configuration_options_licenseKey licenseKey

CKFinder license key. If invalid, CKFinder will run in Demo mode.

<h4>Example 1</h4>

~~~
$config['licenseKey'] = 'ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12';
~~~

@subsection configuration_options_licenseName licenseName

CKFinder license name. If invalid, CKFinder will run in Demo mode.

<h4>Example 1</h4>

~~~
$config['licenseName'] = 'example.com';
~~~

@subsection configuration_options_overwriteOnUpload overwriteOnUpload

This option changes the default behavior of CKFinder when uploading a file with a name that already exists in a folder.
If enabled, then instead of auto renaming files, the existing files will be overwritten.

~~~
$config['overwriteOnUpload'] = true;
~~~

@subsection configuration_options_plugins plugins

This option contains a list of plugins that will be enabled in the CKFinder connector.

The configuration example presented below assumes that you have installed the [Documentation Samples Plugins](https://github.com/ckfinder/ckfinder-docs-samples-php).
This package contains three plugins named `DiskQuota`, `GetFileInfo` and `UserActionsLogger`.

Plugins that are to be enabled can be defined in two ways:

**Using the plugin name:**
~~~
$config['plugins'] = array('DiskQuota', 'GetFileInfo', 'UserActionsLogger');
~~~
**Using the array notation**, to explicitly set the path to the plugin file, like for the `CustomPlugin` plugin below:
~~~
  $config['plugins'] = array(
      'DiskQuota',
      array(
          'name' => 'CustomPlugin',
          'path' => '/my/path/to/CustomPlugin.php'
      )
  );
~~~

**Note:** Plugins usually offer a few configuration options that can be set in the main CKFinder configuration file. Please check the documentation of the particular plugin for details.

@subsection configuration_options_pluginsDirectory pluginsDirectory

This option defines the path to the plugins directory.

The default directory path where the connector looks for plugins is the `plugins` directory, placed in the directory where the `config.php` file is present.

For more information about plugins and plugins directory structure please refer to the @ref plugins article.

<h4>Example 1</h4>

~~~
$config['pluginsDirectory'] = __DIR__ . '/custom/path/to/plugins';
~~~

**Note:** The safest and most recommended option is to provide the plugins directory as an absolute path.

@subsection configuration_options_privateDir privateDir

Internal directories configuration.

**Important:** CKFinder needs to access these directories frequently, so it is recommended to keep this folder on a local file system.

Option Name | Type | Description
----------- | ---- | -----------
`backend` | String \| Array | The backend where the private directory should be located.
`cache` | String \| Array | An internal folder for cache files.
`logs` | String \| Array | An internal folder for logs (please note that logging to a file works only if the log file is stored in a local file system backend).
`tags` | String \| Array | An internal folder for storing tags (metadata) for files (to be used in future versions).
`thumbs` | String \| Array | A folder for internal thumbnails (image previews). By default it is located in the `cache` folder.

<h4>Example 1</h4>

Setting the private folders location to the `.ckfinder` folder inside the `default` backend.

~~~
$config['privateDir'] = array(
    'backend' => 'default',
    'tags'   => '.ckfinder/tags',
    'logs'   => '.ckfinder/logs',
    'cache'  => '.ckfinder/cache',
    'thumbs' => '.ckfinder/cache/thumbs',
    'temp'   => '/custom/path/for/temp'
),
~~~

<h4>Example 2</h4>

Setting the private folders location to the `.ckfinder` folder inside the `default` backend. The `logs` location is configured to use a different backend (`logs_backend`) and folder for logs.

~~~
$config['privateDir'] = array(
    'backend' => 'default',
    'tags'   => '.ckfinder/tags',
    'logs' => array (
        'backend' => 'logs_backend',
        'path' => '/my/ckfinder/logs'
    ),
    'cache'  => '.ckfinder/cache',
    'thumbs' => '.ckfinder/cache/thumbs',
),
~~~

@subsection configuration_options_resourceTypes resourceTypes

Resource type is nothing more than a way to group files under different paths, each one having different configuration settings. Resource types are represented in CKFinder as "root folders". Each resource type may use a different @ref configuration_options_backends "backend".

By default the CKFinder configuration file comes with two sample resource types configured: `Files` and `Images`. There are no restrictions on the maximum number of resource types configured. You can change or remove the default ones, but make sure to configure at least one resource type.

Option Name | Type | Description
----------- | ---- | -----------
`name` | String | A machine-friendly name of the resource type that will be used for the communication between the CKFinder UI and the server connector.
`label` | String | A human-friendly name of the resource type that will be used as the "root folder" name in the CKFinder UI.
`backend` | String | The name of the @ref configuration_options_backends "backend" where this resource type should point to.
`directory` @optional | String | The path to the backend subfolder where the resource type should point exactly.
`maxSize` @optional | String | The maximum size of the uploaded image defined in bytes. A shorthand notation is also supported: G, M, K (case insensitive). `1M` equals 1048576 bytes (one Megabyte), `1K` equals 1024 bytes (one Kilobyte), `1G` equals 1 Gigabyte.
`allowedExtensions` | String | The file extensions you wish to be allowed for upload with CKFinder. `NO_EXT` value can be used for files without extension.
`deniedExtensions` @optional | String | The file extensions you do not wish to be uploaded with CKFinder. Shall only be set if `allowedExtensions` is left empty. `NO_EXT` value can be used for files without extension.
`lazyLoad` @optional | Boolean | If set to `true`, the `Init` command will not check if the resource type contains child folders. This option is especially useful for remote backends, as the `Init` command will be executed faster, and therefore CKFinder will start faster, too. It is recommended to set it to `true` for remote backends.

**Important**: It is recommended to always use the `allowedExtensions` setting, in favor of `deniedExtensions`. If you leave `allowedExtensions` empty and add an extension to the `deniedExtensions` list, for example `pdf`, the settings will allow the upload of all other files except the files with the `pdf` extension (e.g. `.php` or `.exe` files).

<h4>Example 1</h4>

A simple resource type definition where the `label` was set to a French equivalent of `Files`. The `name` (machine-name) set to `Files` can be used in places like @ref configuration_options_defaultResourceTypes or when [integrating CKFinder with CKEditor](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_ckeditor).

~~~
$config['resourceTypes'][] = array(
    'name' => 'Files',
    'label' => 'Fichiers',
    'backend' => 'default',
    'directory' => '/files/',
    'maxSize' => '8M',
    'allowedExtensions' => 'doc,gif,jpg,pdf,png,zip,NO_EXT'
);
~~~

<h4>Example 2</h4>

This simple example shows how the labels for resource types can be dynamically localized. The resource type label is set depending on the value of the `lang` attribute which is passed in each Ajax request sent to the server connector.
~~~
function getLabel() {
    $lang = 'en';
    $labels = array(
        'en' => 'Files',
        'fr' => 'Fichiers',
        'pl' => 'Pliki'
    );

    if (!empty($_GET['lang']) && !empty($lang[$_GET['lang']])) {
        $lang = $_GET['lang'];
    }
    return $labels[$lang];
}

$config['resourceTypes'][] = array(
    'name' => 'Files',
    'label' => getLabel(),
    'backend' => 'default',
    'directory' => '/files/',
    'maxSize' => '8M',
    'allowedExtensions' => 'doc,gif,jpg,pdf,png,zip,NO_EXT'
);

~~~

@subsection configuration_options_roleSessionVar roleSessionVar

The session variable name that CKFinder must use to retrieve the role of the current user.

<h4>Example 1</h4>

After setting `roleSessionVar` in `config.php`:

~~~
$config['roleSessionVar'] = 'CKFinder_UserRole';
~~~

You can use `$_SESSION` to set CKFinder user role inside your application, e.g. when the user logs in:

~~~
session_start();

$_SESSION['CKFinder_UserRole'] = 'administrator';
~~~

<h4>Example 2</h4>

The `role` can be used to set @ref configuration_options_accessControl "ACL settings".

Set read-only permission for all users, but allow users with the `administrator` role for full access:

~~~
$config['accessControl'][] = Array(
    'role' => '*',
    'resourceType' => '*',
    'folder' => '/',

    'FOLDER_VIEW'        => true,
    'FOLDER_CREATE'      => false,
    'FOLDER_RENAME'      => false,
    'FOLDER_DELETE'      => false,

    'FILE_VIEW'          => true,
    'FILE_CREATE'        => false,
    'FILE_RENAME'        => false,
    'FILE_DELETE'        => false,

    'IMAGE_RESIZE'        => false,
    'IMAGE_RESIZE_CUSTOM' => false
);

$config['accessControl'][] = Array(
    'role' => 'administrator',
    'resourceType' => '*',
    'folder' => '/',

    'FOLDER_VIEW'        => true,
    'FOLDER_CREATE'      => true,
    'FOLDER_RENAME'      => true,
    'FOLDER_DELETE'      => true,

    'FILE_VIEW'          => true,
    'FILE_CREATE'        => true,
    'FILE_RENAME'        => true,
    'FILE_DELETE'        => true,

    'IMAGE_RESIZE'        => true,
    'IMAGE_RESIZE_CUSTOM' => true
);
~~~

@subsection configuration_options_secureImageUploads secureImageUploads

Whether to perform additional checks when uploading image files.

Sometimes a user can try to upload a file which is not an image file but appears to be one. Example: You have a text file called `document.jpeg` and you try to upload it. You can enable the image checking function by setting it to `true` in the following way:

~~~
$config['secureImageUploads'] = true;
~~~

With this configuration set the program will check the dimensions of the file. If they equal zero, the file is considered invalid and it will be rejected by CKFinder.

@subsection configuration_options_sessionWriteClose sessionWriteClose

\since CKFinder 3.1.0

If set to `true`, the write access to the session is closed as soon as possible to avoid performance issues (see @ref howto_php_session_performance).

~~~
$config['sessionWriteClose'] = true;
~~~

@subsection configuration_options_tempDirectory tempDirectory

\since CKFinder 3.1.0

An **absolute path** to a writable directory on the web server for temporary files used by CKFinder.
By default it points to `sys_temp_dir` returned by [sys_get_temp_dir()](https://secure.php.net/manual/pl/function.sys-get-temp-dir.php).

**Note:** The system temporary directory may not be accessible from the PHP level on some IIS servers. Using this option you can
configure CKFinder to use any other writable directory to store temporary files.

~~~
$config['tempDirectory'] = __DIR__ . '/userfiles/.ckfinder/temp';
~~~

@subsection configuration_options_thumbnails thumbnails

Internal thumbnails configuration.

**Note:** Changing the minimum and maximum value will result in a different slider range in CKFinder.

**Configuration Options**

Option Name | Type | Description
----------- | ---- | -----------
`bmpSupported` | Boolean | Whether to show thumbnails for `.bmp` files.
`enabled` | Boolean | Whether CKFinder should display real thumbnails for image files.
`sizes` | Array | Predefined sizes of internal thumbnails that CKFinder is allowed to create. As CKFinder allows for changing the size of thumbnails in the application using a slider, a few predefined sets are used by default to use a small and most efficient size when the user does not need big images (150px), up to 500px when the user prefers bigger images.

<h4>Example</h4>
~~~
$config['thumbnails'] = array(
    'enabled'      => true,
    'sizes'        => array(
        array('width' => '150', 'height' => '150', 'quality' => 80),
        array('width' => '300', 'height' => '300', 'quality' => 80),
        array('width' => '500', 'height' => '500', 'quality' => 80),
    ),
    'bmpSupported' => true,
);
~~~

@subsection configuration_options_xSendfile xSendfile

Whether to send files using the `X-Sendfile` module. Mod X-Sendfile (or similar) is available for Apache2, Nginx, Cherokee, Lighttpd.

**Caution:** Enabling the `xSendfile` option can potentially cause a security issue:
 - The server path to the file may be sent to the browser with the X-Sendfile header.
 - If the server is not configured properly, files will be sent with 0 length.

<h4>Example</h4>

~~~
$config['xSendfile'] = false;
~~~
