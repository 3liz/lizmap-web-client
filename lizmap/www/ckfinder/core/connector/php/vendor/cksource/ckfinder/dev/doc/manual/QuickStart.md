# Quick Start Guide {#quickstart}

\tableofcontents

@section quickstart_beforebegin Before You Begin

Make sure that PHP is configured properly on your server &mdash; you should be running <strong>PHP 5.4+</strong>, <strong>GD and Fileinfo extensions</strong> should be enabled and <strong>JSON MIME type</strong> should be supported. While on production servers they are usually enabled, on your local development server it may not be the case. Check the @ref quickstart_troubleshooting section for more information on how to change these settings.

@section quickstart_installation Installation

When you are sure that your server configuration is correct, complete the steps below to start using CKFinder.

@subsection quickstart_installation_download Download CKFinder

Visit the [CKFinder Download](https://ckeditor.com/ckeditor-4/download/#ckfinder) site and download the PHP version. Copy the distribution files to your web server and place them inside the `/ckfinder/` folder or any other folder of your choice on your website.

@subsection quickstart_installation_enable Enable CKFinder

By default, the CKFinder server connector is disabled. If you open the default CKFinder sample
(located in `/ckfinder/samples/full-page-open.html`) you will see the following error message:

<blockquote>The file browser is disabled for security reasons. Please contact your system administrator and check the CKFinder configuration file.</blockquote>

In order to enable it, you should set the @ref configuration_options_authentication "authentication" function in `config.php` so that it returned `true` for users that should have access to CKFinder.

### Example 1

The simplest way to enable CKFinder (insecure, though):
~~~
$config['authentication'] = function() {
     return true;
};
~~~

Almost done! If you open the default CKFinder sample again (located in `/ckfinder/samples/full-page-open.html`), you will now see CKFinder. Depending on server permissions you may even be able to create a folder or upload files without further actions &mdash; if not, read more.

@subsection quickstart_installation_folders Configure Folder Paths

The last important thing that needs to be set is:
 - The location where the files are stored.
 - The file system permissions to that location so that the web server could access it.

CKFinder operates on *top-level* folders called @ref configuration_options_resourceTypes "resource types". By default CKFinder comes with two default resource types configured (**Files** and **Images**) that use the same, default @ref configuration_options_backends "backend".
It means that all that is required to view and upload files to these folders is to give the web server proper permissions to read and write to the backend location.

@subsubsection quickstart_installation_folders_backend Default Backend

CKFinder configuration file comes with a backend called `default` that operates on the local file system.
This default backend initially points to a URL (`/ckfinder/userfiles/`), which is resolved by CKFinder to an appropriate server path.

~~~
$config['backends'][] = array(
    'name'         => 'default',
    'adapter'      => 'local',
    'baseUrl'      => '/ckfinder/userfiles/'
);
~~~

@subsubsection quickstart_installation_folders_permissions File System Permissions

Once the backend is configured, the last thing to do is to make sure that the web server has write permission to it.

### Example 2

Suppose that CKFinder is installed in `https://example.com/` and on the server the full path to the website folder is `/home/joe/www/example.com/`.
If the backend location (`baseUrl`) is set to `/userfiles/`, the uploaded files will land in `/home/joe/www/example.com/userfiles/`.

Now in order to correctly setup the file permissions:

1. Create a folder on the server to store all uploaded files (`/home/joe/www/example.com/userfiles/`).
2. Make the `userfiles` folder mentioned in point (1) writable for the *Internet* user:
 - For a Windows system give write permissions to the `IUSR_<ServerName>` user.
 - For Linux `chmod` it to `0777`.<br>
   **NOTE:** Since usually setting permissions to `0777` is insecure, it is advisable to change the group ownership of the directory to the same user as Apache and add group write permissions instead. Please contact your system administrator in case of any doubts.

@subsection quickstart_installation_next Next Steps

With CKFinder up and running you can now focus on adjusting some @ref configuration_options "configuration options" to your needs.

### Security

In case when the files managed by CKFinder are served through the web server, it is recommended to perform some server configuration fine-tuning to make sure the files are served in a secure manner. To read more, please have a look at the following two articles:

- @ref securing_public_folder
- @ref howto_securing_userfiles

@section quickstart_troubleshooting Troubleshooting

If you have trouble installing and running CKFinder, check the following tips on how to adjust some server settings in order to resolve your issues. If CKFinder does not work as intended after the initial configuration and your server settings adjustments, please have a look at the @ref debugging section.

@subsection quickstart_troubleshooting_json JSON MIME Type Support

If you are using IIS Express as your web server, you will need to make sure that JSON is an allowed MIME type. By default it is not allowed which may cause issues with CKFinder language files being unavailable, and you will see the following alert in CKFinder:

![Alert message about missing JSON support in IIS](/manual/images/missing_json_mimetype.png)

You will thus need to <a href="https://technet.microsoft.com/en-us/library/cc725608(v=ws.10).aspx">add JSON as a new MIME type</a> in your IIS configuration.

Set the following options in the *Add MIME Type* dialog:
 - File name extension: `.json`.
 - MIME type: `application/json`.
 
Click *OK* to accept and restart the server to apply your changes.

@subsection quickstart_troubleshooting_fileinfo Fileinfo Extension

By default the Fileinfo extension is disabled on XAMPP server (checked on version 5.6.3). In order to enable it, please proceed as follows:
1. Open `C:\xampp\php\php.ini` (or another path adequate for the location where XAMPP was installed).
2. Find the following line: `;extension=php_fileinfo.dll`.
3. Uncomment it by removing `;` from the beginning.
4. Restart Apache.
5. Result: The Fileinfo extension should be active now.

You may use this script to test your PHP installation (save it as `test.php` and run):

~~~
<?php
if (version_compare(PHP_VERSION, '5.6.0') >= 0) {
    echo ' [OK] PHP version is newer than 5.6: '.phpversion();
} else {
    echo ' [ERROR] Your PHP version is too old for CKFinder 3.x.';
}

if (!function_exists('gd_info')) {
    echo ' [ERROR] GD extension is NOT enabled.';
} else {
    echo ' [OK] GD extension is enabled.';
}

if (!function_exists('finfo_file')) {
    echo ' [ERROR] Fileinfo extension is NOT enabled.';
} else {
    echo ' [OK] Fileinfo extension is enabled.';
}
~~~

@subsection quickstart_troubleshooting_gd GD Extension

In rare scenarios it may happen that even if GD is enabled, uploading or editing of some images will fail. Such situation happened with PNG files on Mac OSX 10.10 (Yosemite), where the default PHP installation [was defective] (http://stackoverflow.com/questions/26443242/after-upgrade-php-no-longer-supports-png-operations). Issues like this are strictly related to the server-side configuration and would affect any PHP application that works with images, not just CKFinder.

