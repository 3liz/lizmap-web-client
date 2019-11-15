# Upgrading {#upgrading}

\tableofcontents

Latest CKFinder is always the greatest CKFinder. Each new release brings plenty of bug fixes and new features, so it is highly recommended to upgrade often.
Upgrading CKFinder is an easy task. See the complete upgrade instructions below.

@section upgrading_3 Upgrading CKFinder 3.x

1. Download the latest CKFinder version from the official [CKFinder website](https://ckeditor.com/ckeditor-4/download/#ckfinder).
2. Backup your old copy of CKFinder to a safe place.
3. Temporarily disable access to CKFinder for all users of your application.
4. Delete all files from the CKFinder folder (**remember to not delete the `userfiles` folder** if you configured CKFinder to store files there).
5. Unpack the new CKFinder version to the folder where old CKFinder was previously installed.
6. Apply changes from the old configuration file to the new configuration file shipped with CKFinder (most of the time, you can simply use the old configuration file).
7. (Optional) In your application add a timestamp to the path to `ckfinder.js` to help browsers recognize that the new version of the file is available, e.g.:

        <script type="text/javascript" src="/ckfinder/ckfinder.js?t=20100601"></script>

8. Perform some simple tests to ensure that CKFinder is running fine.
9. Enable access to CKFinder for all users of your application.

@section upgrading_2to3 Upgrading from CKFinder 2.x to 3.x

@subsection upgrading_2to3_changes Changes in CKFinder 3.x

Although some configuration options in CKFinder 3.x look familiar, its configuration and API are incompatible with previous versions of CKFinder.

CKFinder 3.x comes with many new features, but at the same time it misses a couple of features available in CKFinder 2.x:
 - The Zip/Unzip plugin.
 - The "File Edit" feature for editing text files.

These features may be added in the future CKFinder releases.

CKFinder 3.x also dropped support for Internet Explorer 8 and is no longer shipped with the Flash component for file uploads, which sometimes required really tricky workarounds due to Flash bugs with handling cookies. In CKFinder 3.x HTML5 features are exclusively used for multiple file uploads &mdash; the fallback in older browsers is that users can only select one file.

@subsection upgrading_2to3_upgrading Upgrading

1. Download the latest CKFinder version from the official [CKFinder website](https://ckeditor.com/ckeditor-4/download/#ckfinder).
2. Backup your old copy of CKFinder to a safe place.
3. Temporarily disable access to CKFinder for all users of your application.
4. Delete all files from the CKFinder folder (**remember to not delete the `userfiles` folder** if you configured CKFinder to store files there).
5. Unpack the new CKFinder version to the folder where old CKFinder was previously installed.
6. Manually apply changes from the old configuration file to the new configuration file shipped with CKFinder (you cannot use the old configuration file).
7. (Optional) In your application add a timestamp to the path to `ckfinder.js` to help browsers recognize that the new version of the file is available, e.g.:

        <script type="text/javascript" src="/ckfinder/ckfinder.js?t=20100601"></script>

8. To integrate CKFinder with your application you need to attach the main CKFinder JavaScript file to the page, like shown above. **It is no longer possible to enable CKFinder on a page from the PHP level.**
   To start the application on a page as a widget, add the following HTML container where CKFinder will be rendered:

        <div id="ckfinder1"></div>

    and then add the JavaScript code to the document to insert CKFinder into that container:

        <script>
            CKFinder.widget( 'ckfinder1', {
                width: 960,
                height: 700,
            } );
        </script>

    Please refer to CKFinder [Quick Start Guide](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_installation) to find more information about integrating CKFinder with your website.

    **Note**: The plugins from version 2.x are not compatible with version 3.x. If you created any custom plugins, they need to be rewritten.
    To check what custom changes you made in the past in your own copy of CKFinder 2.x, you can download a fresh copy from the official [CKFinder website](https://ckeditor.com/ckeditor-4/download/#ckfinder) and compare both versions using a `diff` tool (for example [WinMerge](http://winmerge.org/)).

9. Perform some simple tests to ensure that CKFinder is running fine.
10. Enable access to CKFinder for all users of your application.

@subsubsection upgrading_2to3_embedding Embedding CKFinder on a Web Page

As mentioned in point 8 above, **it is no longer possible to enable CKFinder on a page from the PHP level**. If you previously used PHP to start CKFinder, you need to use JavaScript now.

The example below shows similar setups for CKFinder 2 and CKFinder 3. Note that available client-side configuration options are described in the [CKFinder 3 documentation](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config).
On the same website there is also a handy table available that describes [configuration migration for JavaScript settings](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_upgrading).

**CKFinder 2**

    <script type="text/javascript">
    // This is a sample function which is called when a file is selected in CKFinder.
    function ShowFileInfo( fileUrl )
    {
        var msg = 'The selected URL is: ' + fileUrl + '\n\n';
        alert( msg );
    }
    </script>

    <?php
    require_once 'ckfinder/ckfinder.php';
    $finder = new CKFinder();
    $finder->BasePath = '/ckfinder/';
    $finder->Width = 900;
    $finder->Height = 600;
    $finder->Id = 'foo';
    $finder->RememberLastFolder = true;
    $finder->StartupFolderExpanded = true;
    $finder->SelectFunction = 'ShowFileInfo';
    $finder->DisableThumbnailSelection = true;
    echo $finder->CreateHtml();
    ?>

**CKFinder 3**

    <script src="/ckfinder/ckfinder.js"></script>
    <div id="ckfinder-widget"></div>
    <script>
    CKFinder.widget( 'ckfinder-widget', {
        width: 900,
        height: 600,
        id: 'foo',
        pass: 'id',
        rememberLastFolder: true,
        startupFolderExpanded: true,
        chooseFiles: true,
        // Simulate SelectFunction
        onInit: function( finder ) {
            finder.on( 'files:choose', function( evt ) {
                var files = evt.data.files.toArray();
                alert( 'The selected URL is: ' + files[0].getUrl() + '\n\n'; );
            } );
            finder.on( 'file:choose:resizedImage', function( evt ) {
                alert( 'The selected URL is: ' + evt.data.resizedUrl + '\n\n'; );
                // Close the "Choose Resized" dialog window.
                finder.request( 'dialog:destroy' );
            } );
        }
    } );
    </script>

A short explanation of main differences:

 * `BasePath` is not set, because the `<script>` tag with `ckfinder.js` is included manually.
 * When using [CKFinder.widget](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder-method-widget), an element where CKFinder is to be rendered must be first output on the page (here: `<div id="ckfinder-widget"></div>`).
 * The `id` configuration option is no longer automatically passed to the connector, thus `config.pass` needs to be used.
 * Unless CKFinder is launched by CKEditor, choosing files must be enabled manually with `config.chooseFiles`. 
 * There is no `SelectFunction` configuration option, CKFinder now offers events and requests to interact with the application.
 * The `DisableThumbnailSelection` configuration setting is no longer supported as selecting internal thumbnails is impossible in CKFinder 3.
 

@subsubsection upgrading_2to3_resource_types Porting Resource Types

In CKFinder 3 resource types work in a different way as in the previous version and your old configuration will
not work without modification. In version 2.x it was possible to point a resource type to a particular directory by
providing an absolute path to the `directory` configuration option. As CKFinder 3 supports not only the local file system but also remote storage, it uses backends as an intermediate layer to access files. Therefore the `directory` configuration option needs to be
set as a path relative to the root directory of the backend defined for the resource type. To find out more about resource type configuration options please refer to the @ref configuration_options_resourceTypes section.

Have a look at the following side by side example.

The configuration of resource types in version 2 might look like the one below:

~~~
// CKFinder version 2.x

$config['ResourceType'][] = array(
	'name'      => 'Files',
	'url'       => '/userfiles/files',
	'directory' => '/var/www/mysite/userfiles/files'
);

$config['ResourceType'][] = array(
	'name'      => 'Images',
	'url'       => '/userfiles/images',
	'directory' => '/var/www/mysite/userfiles/images'
);

$config['ResourceType'][] = array(
	'name'      => 'Flash',
	'url'       => '/userfiles/flash',
	'directory' => '/var/www/mysite/userfiles/flash'
);
~~~

**Note**: In CKFinder 2 the `$baseDir` and `$baseUrl` variables were often used in the resource type configuration. These options do not exist in CKFinder 3. The required parts of the URL and directory path are automatically prepended by the backend set for a resource type.

To achieve the same result in CKFinder 3 you can create a backend that points to the common root directory (`/var/www/mysite/userfiles/`), and configure resource types using relative paths, as shown below:

~~~
// CKFinder version 3.x

$config['backends'][] = array(
	'name'         => 'my-userfiles',
	'adapter'      => 'local',
	'root'         => '/var/www/mysite/userfiles',
	'baseUrl'      => '/userfiles/'
);

$config['resourceTypes'][] = array(
	'backend'   => 'my-userfiles',
	'name'      => 'Files',
	'directory' => 'files'
);

$config['resourceTypes'][] = array(
	'backend'   => 'my-userfiles',
	'name'      => 'Images',
	'directory' => 'images'
);

$config['resourceTypes'][] = array(
	'backend'   => 'my-userfiles',
	'name'      => 'Flash',
	'directory' => 'flash'
);
~~~

See also the HOWTO section that describes how to point resource types to existing folders:
@ref howto_resource_type_folder.

 
@subsection upgrading_2to3_configuration Configuration Options Migration - PHP Settings

The following table sums up the differences between the server-side side options (defined in `config.php`) available in CKFinder 2 and CKFinder 3.

**Authentication**

The `CheckAuthentication()` function was replaced with the `authentication` configuration option.

**Helper Variables**

- `$baseDir` was replaced with the `root` backend configuration option.
- `$baseUrl` was replaced with the `baseUrl` backend confguration option.

**Configuration Options**

CKFinder 2.x | CKFinder 3.x | Additional Comments
------------ | ------------ | -------------------
`AccessControl` | @ref configuration_options_accessControl | New permissions: `IMAGE_RESIZE` and `IMAGE_RESIZE_CUSTOM`.
- | @ref configuration_options_backends | New in CKFinder 3.x.
- | @ref configuration_options_cache @labelSince{3.1.0} | New in CKFinder 3.1+.
`CheckDoubleExtension` | @ref configuration_options_checkDoubleExtension | -
`CheckSizeAfterScaling` | @ref configuration_options_checkSizeAfterScaling | -
`ChmodFiles` | - | A part of the @ref configuration_options_backends configuration.
`ChmodFolders` | - | A part of the @ref configuration_options_backends configuration.
- | @ref configuration_options_debug | New in CKFinder 3.x.
- | @ref configuration_options_debugLoggers | New in CKFinder 3.x.
`DefaultResourceTypes` | @ref configuration_options_defaultResourceTypes | Array instead of string in CKFinder 3.x.
`DisallowUnsafeCharacters` | @ref configuration_options_disallowUnsafeCharacters | -
`FilesystemEncoding` | - | A part of the @ref configuration_options_backends configuration.
`ForceAscii` | @ref configuration_options_forceAscii | -
`HideFolders` | @ref configuration_options_hideFolders | -
`HideFiles` | @ref configuration_options_hideFiles | -
`HtmlExtensions` | @ref configuration_options_htmlExtensions | -
`Images` | @ref configuration_options_images | The array structure has changed.
`LicenseKey` | @ref configuration_options_licenseKey | -
`LicenseName` | @ref configuration_options_licenseName | -
- | @ref configuration_options_overwriteOnUpload | New in CKFinder 3.x.
- | @ref configuration_options_plugins | New in CKFinder 3.x.
- | @ref configuration_options_pluginsDirectory | New in CKFinder 3.x.
- | @ref configuration_options_privateDir | New in CKFinder 3.x.
`RoleSessionVar` | @ref configuration_options_roleSessionVar | -
`ResourceType` | @ref configuration_options_resourceTypes | The array structure has changed. Resource types now depend on @ref configuration_options_backends configuration.
`SecureImageUploads` | @ref configuration_options_secureImageUploads | -
- | @ref configuration_options_sessionWriteClose @labelSince{3.1.0} | New in CKFinder 3.1+.
- | @ref configuration_options_tempDirectory @labelSince{3.1.0} | New in CKFinder 3.1+.
`Thumbnails` | @ref configuration_options_thumbnails | The array structure has changed. Multiple sizes supported in CKFinder 3.x.
`XSendfile` | @ref configuration_options_xSendfile | -

Refer to the [Configuration Options Migration - JavaScript Settings](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_upgrading-section-configuration-options-migration---javascript-settings) section for a list of changes in the client-side options (defined in `config.js` or passed inline when creating CKFinder instances).