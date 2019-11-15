# Debugging and Logging {#debugging}

\tableofcontents

@section debugging_introduction Introduction

Sometimes the CKFinder PHP connector may not work properly. This can be caused by invalid configuration,
insufficient permissions, missing PHP extensions etc. In such cases the connector will send a response that
by default contains only general information about the error.

The error may occur at different stages:
* When the application starts and CKFinder cannot initialize correctly, which may result in the UI not being rendered (*startup errors*).
* When the application is initialized correctly and the user made an attempt to execute an action in CKFinder (*regular errors*).

Generic error messages are used because they do not reveal any potentially harmful information (like server paths) that could be misused by hackers with hostile intent.

Depending on the situation, the generic error message may be insufficient for a developer configuring CKFinder to understand the exact error that has happened and why it occurred. This article explains how to recover from this situation.

### Example 1 &ndash; Startup Error

When CKFinder is launched and configured to use a folder which does not exist and CKFinder does not have sufficient write permissions to create it, it will return a generic error message:

<blockquote>Folder not found. Please refresh and try again.</blockquote>

Because the error occurs at a very early stage during the application startup, the **application will not load**.
Without having access to the file system CKFinder cannot actually display any files, so all that the users will see is the generic error message.

### Example 2 &ndash; Regular Error (File Rename Fails)

CKFinder is configured correctly, files are correctly listed in CKFinder and the user can view files.

When the user tries to rename a file, but file permissions do not allow this (e.g. because one of the folders has the `root` owner on Linux), CKFinder will display a generic error message:

<blockquote>It was not possible to complete the request due to file system permission restrictions.</blockquote>

### Example 3 &ndash; Regular Error (File Upload Fails)

CKFinder is configured correctly, files are correctly listed in CKFinder and the user can view files.

When the user tries to upload a file, but file permissions do not allow this (e.g. when SELinux blocks it or because folder permissions are set to `0755` and the *owner* of the target folder is different than the user under which the web server process runs), CKFinder will display a generic error message:

<blockquote>It was not possible to complete the request due to file system permission restrictions.</blockquote>

@section debugging_debugging Debugging

As explained in the introduction, generic error messages may be insufficient for the developer configuring CKFinder.

Fortunately there are two ways to instruct CKFinder to return more meaningful information about why something has failed:
 * By changing the @ref configuration_options_debug "debug" configuration option.
 * By changing the built-in PHP error reporting settings in `config.php`.

Both methods are unrelated and can be configured separately.

@subsection debugging_debugging_debug_mode Debugging Mode

Debugging mode can be enabled in `config.php` with:

~~~~~~~~~~~~~
$config['debug'] = true;
~~~~~~~~~~~~~

After this change the CKFinder connector will log any server-side errors using [Monolog](https://github.com/Seldaek/monolog)
logger to all handlers specified in the @ref configuration_options_debugLoggers configuration option. By default CKFinder will log detailed errors to the CKFinder log file, error log file (server log) and browser console using the [FirePHP](http://www.firephp.org/) handler.

@subsubsection debugging_debugging_debug_mode_ckfinder_log CKFinder Log File

By default, the log file is located in the private CKFinder folder. Please note that logging to a file works only if the log file is stored in a local file system backend.

Disadvantages:
 - In case of improper folder configuration it might be publicly accessible via URL, revealing lots of information.
 - In case of permission issues, CKFinder may be unable to create or write to this log file.

Advantages:
 - The log file is used only by CKFinder so no extra effort is needed to find out what was wrong.

@subsubsection debugging_debugging_debug_mode_error_log Server Log (Error Log)

The file location depends on your server configuration. In case of Apache it is usually located in places like:
 - `/var/log/httpd/error_log`
 - `/var/log/apache2/error.log`
 - `/var/log/httpd-error.log`

In case of XAMPP server the PHP error log is a separate file, by default located at `C:\xampp\php\logs\php_error_log` (checked on version 5.6.3).

Disadvantages:
 - It is used by all PHP applications, so errors logged by CKFinder need to be filtered first.
 - In some cases, e.g. when using shared hosting services, one may not have access to this file.

Advantages:
 - It is secure and reliable.
 - It gives you a chance to also investigate issues that happened in the past and that were reported later by the end users.

@subsubsection debugging_debugging_debug_mode_firephp FirePHP

In order to see errors passed to FirePHP all you have to do is install an appropriate extension in your browser:
 * [FirePHP](https://addons.mozilla.org/en-US/firefox/addon/firephp/) for Firefox (requires [Firebug](https://addons.mozilla.org/en-US/firefox/addon/firebug/)).
 * [FirePHP4Chrome](https://chrome.google.com/webstore/detail/firephp4chrome/gpgbmonepdpnacijbbdijfbecmgoojma) in case you use Chrome.

After that you can retry the action that caused an error and in the console you should see the detailed error description including exception stack trace.

**Note:** For security reasons leaving the `debug` mode enabled on a production server should be done only together with setting the @ref configuration_options_debugLoggers configuration option to `error_log` only. It  will allow you to investigate errors reported by users that happened in the past and at the same time ensure that errors will not be seen by anyone else.

@subsection debugging_debugging_php PHP Error Reporting

PHP has built-in features that can help you understand why code execution has failed:
 * [error_reporting](https://secure.php.net/manual/en/function.error-reporting.php)
 * [display_errors](https://secure.php.net/manual/en/errorfunc.configuration.php#ini.display-errors) setting that can be enabled with [ini_set](https://secure.php.net/manual/en/function.ini-set.php)

When working on a development server, you may configure `error_reporting` and `display_errors` using the `php.ini` file that is loaded by the web server (make sure to restart the server after applying changes).
In such case enabling [display-startup-errors](https://secure.php.net/manual/en/errorfunc.configuration.php#ini.display-startup-errors) might be a good idea as well.

On a production server it is highly unrecommended to leave the `display_errors` option enabled, so a more convenient way is to set PHP error reporting directly in the `config.php` file used by CKFinder.

### Example 4 &ndash; Production Environment Settings

The following settings are by default set in the `config.php` file. PHP errors will not be printed.
~~~
// Production
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', 0);
~~~

### Example 5 &ndash; Development Environment Settings

The following settings can be more handy in a development environment to debug issues. By default these settings are also present in the `config.php` file, but are commented out.

~~~
// Development
error_reporting(E_ALL);
ini_set('display_errors', 1);
~~~

**Note:** Make sure to leave `display_errors` enabled only when debugging why something fails. Disable it once CKFinder is moved into the production environment.

@subsubsection debugging_debugging_php_how How to Use It?

Allowing CKFinder to print errors by setting `display_errors` has one negative consequence: **it will ruin JSON responses**. It means that CKFinder UI will no longer understand responses from the server.
This is why its usage is quite limited and it is useful mainly when detecting fatal errors, timeouts etc., when using the @ref debugging_debugging_debug_mode does not bring satisfactory results.

### Example 6 &ndash; Debugging Startup Error

Let us investigate the error from *Example 1* where CKFinder could not load.

When CKFinder starts, it sends Ajax requests to the server to obtain information about folders and files. The first request that it sends is `Init`.

The exact URL that CKFinder called can be checked in the *Network* tab in the developer console of your favorite browser. It should be something similar to:

~~~
http://example.com/ckfinder/core/connector/php/connector.php?command=Init&lang=en
~~~

When the situation from *Example 1* occurs, you will see an HTTP response similar to:

~~~
{"error":{"number":116,"message":"Folder not found. Please refresh and try again."}}
~~~

Let us debug the problem now:

1. Edit `config.php` and set the error reporting to *Development*:
~~~
// Development
error_reporting(E_ALL);
ini_set('display_errors', 1);
~~~

2. Reload the URL to the `Init` command:
~~~
http://example.com/ckfinder/build/connector/php/connector.php?command=Init&lang=en
~~~

3. The result should now contain more information that explains why the application could not start:

<blockquote>Fatal error: Uncaught exception 'Exception' with message 'The root folder of backend "default" not found (/home/joe/www/example.com/ckfinder/userfiles/)' in /home/joe/www/example.com/ckfinder/core/connector/php/vendor/cksource/ckfinder/src/CKSource/CKFinder/Backend/Adapter/Local.php:58 Stack trace: (...)
</blockquote>

Thanks to the error message you know which folder does not exist (`/home/joe/www/example.com/ckfinder/userfiles/`). The folder should be created and proper permissions should be set for it.

### Example 7 &ndash; Debugging File Upload Failure

Let us investigate the error from *Example 3* where the file could not be uploaded.

When CKFinder uploads a file, it sends a POST request to the server using a URL similar to:
~~~
http://example.com/ckfinder/core/connector/php/connector.php?command=FileUpload&lang=en&type=Files&currentFolder=%2F&Flowers%2F&hash=9a3c49d939a945d7&responseType=json
~~~

When a situation from *Example 3* occurs, in the *Network* tab of the developer console of your favourite browser you will see an HTTP response similar to:

~~~
{"resourceType":"Files","currentFolder":{"path":"\/Flowers\/","acl":1023,"url":"\/ckfinder\/userfiles\/files\/Flowers\/"},"fileName":"red-rose.jpg","uploaded":0,"error":{"number":104,"message":"It was not possible to complete the request due to file system permission restrictions."}}
~~~

Let us debug the problem now:

1. Edit `config.php` and set the error reporting to *Development* just like in the previous example:
~~~
// Development
error_reporting(E_ALL);
ini_set('display_errors', 1);
~~~
2. Try uploading a file again.
3. The result should now contain more information that explains why the file could not be uploaded:

<blockquote>
<b>Warning</b>:  fopen(/home/joe/www/example.com/ckfinder/userfiles/files/Flowers/red-rose.jpg): failed to open stream: Permission denied in <b>/home/joe/www/example.com/ckfinder/core/connector/php/vendor/league/flysystem/src/Adapter/Local.php</b> on line <b>109</b><br />
<br />
<b>Warning</b>:  chmod(): No such file or directory in <b>/home/joe/www/example.com/ckfinder/core/connector/php/vendor/cksource/ckfinder/src/CKSource/CKFinder/Backend/Adapter/Local.php</b> on line <b>144</b><br />
</blockquote>

You can see that the *Permission denied* error for `/home/joe/www/example.com/ckfinder/userfiles/files/Flowers/` was the main reason why the upload has failed.

Fixing the file permissions for that folder should solve the problem.
