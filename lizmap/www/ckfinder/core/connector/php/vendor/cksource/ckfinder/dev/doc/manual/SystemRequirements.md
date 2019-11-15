# System Requirements {#system_requirements}

\tableofcontents

## Web Server

CKFinder requirements for PHP:
 - <strong>PHP 5.6+</strong>
    - Note: PHP 7.0+ is required for the Dropbox backend.
 - <strong>GD extension</strong> enabled (default on most installations) for thumbnail support and any image operations.
 - <strong>FileInfo extension</strong> enabled. Note: By default disabled on XAMPP, read @ref quickstart_troubleshooting_fileinfo "Quick Start" for more information.
 - <strong>JSON MIME type</strong> supported. Note: By default disabled on IIS Express, read @ref quickstart_troubleshooting_json "Quick Start" for more information.

Support for older PHP versions:
 - The last CKFinder version with PHP 4.x support was CKFinder 2.2.1.
 - The last CKFinder version with PHP 5.0 - 5.3.x support was CKFinder 2.x.
 - The last CKFinder version with PHP 5.4 - 5.6.x support was CKFinder 3.4.1.

## Browsers

### Desktop Browsers

CKFinder runs in every modern desktop browser:

 - Google Chrome
 - Firefox
 - Microsoft Edge
 - Internet Explorer 9+
 - Safari
 - Opera

Support for older browsers:
- The last version of CKFinder with support for IE6-IE8 was CKFinder 2.x.

### Mobile Browsers

CKFinder is also compatible with mobile browsers. The application is tested on:

 - Google Chrome on Android
 - Safari on iOS

As CKFinder is using jQuery Mobile as a dependency, the set of currently supported mobile browses is wider (see [jQuery Mobile GBS](https://jquerymobile.com/browser-support/1.4/) for the list of browsers supported by jQuery Mobile), however, please note that the application is only tested in the environments listed above.

### Important Note

Some features depend on your browser settings. CKFinder should work in any of the browsers listed above with their default settings enabled. If you are experiencing problems with the context menu, make sure that your browser is configured to "Allow scripts to replace context menus" ("Allow scripts to receive right clicks"). If your CKFinder settings are not being saved, make sure that you have "Cookies support enabled".
