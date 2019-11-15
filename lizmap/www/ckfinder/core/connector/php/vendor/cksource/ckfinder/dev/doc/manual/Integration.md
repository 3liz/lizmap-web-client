# Integration {#integration}

\tableofcontents

@section integration_embedding Embedding CKFinder on a Website

Once you are able to run CKFinder samples it is time to connect CKFinder with your application.
Please refer to the [Quick Start Guide](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_installation) to read more about integrating CKFinder with your website (e.g. displaying it embedded on a page, in a popup etc.).


@section integration_ckeditor5 Integration in CKEditor 5

The integration between CKEditor 5 and CKFinder is based on a [dedicated plugin](https://github.com/ckeditor/ckeditor5-ckfinder),
which is by default included and enabled in all [CKEditor 5 Builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html).

For detailed information about the integration between CKEditor 5 and CKFinder, please refer to
[CKFinder file manager integration](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/ckfinder.html)
article in the [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest/index.html).
See also the [working demo](https://ckeditor.com/docs/ckfinder/demo/ckfinder3/samples/ckeditor.html#integration-ckeditor5) on the CKFinder Samples site.

### Quick Example

The code example below presents a [full integration mode](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/ckfinder.html#configuring-the-full-integration).

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CKEditor 5 Integration Example</title>
</head>
<body>
    <div id="editor"></div>

    <script src="https://cdn.ckeditor.com/ckeditor5/11.2.0/classic/ckeditor.js"></script>
    <script src="/ckfinder/ckfinder.js"></script>
    <script type="text/javascript">

    ClassicEditor
        .create( document.querySelector( '#editor' ), {
            ckfinder: {
                uploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
            },
            toolbar: [ 'ckfinder', 'imageUpload', '|', 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo' ]
        } )
        .catch( function( error ) {
            console.error( error );
        } );

    </script>
</body>
</html>
```


@section integration_ckeditor Integration in CKEditor 4

CKFinder can be easily integrated with [CKEditor 4](https://ckeditor.com/ckeditor-4/). Refer to the [CKEditor 4 Integration](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_ckeditor) article for a more detailed documentation. See also the [working demo](https://ckeditor.com/docs/ckfinder/demo/ckfinder3/samples/ckeditor.html#integration-ckeditor4) on the CKFinder Samples site.

@subsection integration_ckfinder_setup_ckeditor CKFinder.setupCKEditor()

The most simple way to integrate CKFinder with CKEditor is the [CKFinder.setupCKEditor](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder-method-setupCKEditor) method. This method takes the CKEditor instance which will be set up as a first argument (`editor`).

If no argument is passed or the `editor` argument is null, CKFinder will integrate with all CKEditor instances.

**Example 1**

Integrate with a specific CKEditor instance:

```js
var editor = CKEDITOR.replace( 'editor1' );
CKFinder.setupCKEditor( editor );
```

**Example 2**

Integrate with all existing and future CKEditor instances:

```js
CKFinder.setupCKEditor();
CKEDITOR.replace( 'editor1' );
```

@subsection integration_ckeditor_manual Manual Integration

In order to manually configure CKEditor to use CKFinder, you will need to pass some additional CKFinder configuration settings to the CKEditor instance. This method, although slightly more complex, gives you more flexibility.

Refer to [CKEditor documentation](https://ckeditor.com/docs/ckeditor4/latest/guide/dev_ckfinder_integration.html) for a detailed explanation of particular configuration settings that you can use.

<h4>Example 1</h4>

The sample below shows the configuration code that can be used to insert a CKEditor instance with CKFinder integrated. The browse and upload paths for images are configured separately from CKFinder default paths. 

~~~
CKEDITOR.replace( 'editor1',
{
	filebrowserBrowseUrl: '/ckfinder/ckfinder.html',
	filebrowserImageBrowseUrl: '/ckfinder/ckfinder.html?type=Images',
	filebrowserUploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files',
	filebrowserImageUploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images'
});
~~~
Remember to change the `/ckfinder/` path in the above URLs if you installed CKFinder in a different location.

**Note:** The `filebrowser*UploadUrl` paths in CKFinder 2.x and CKFinder 3.x are different.

<h4>Example 2</h4>

Specifying destination folder for uploads made directly in the **Upload** tab (1) in CKEditor:

![CKEditor Image Dialog Window](/manual/images/ckeditor_image_dialog.png)

When configuring CKEditor [filebrowserUploadUrl](https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserUploadUrl) settings, it is possible to point CKFinder to a subfolder for a given resource type and upload files directly to this subfolder.
In order to do this, add the `currentFolder` attribute to the query string for `*UploadUrl` settings:

~~~
CKEDITOR.replace( 'editor1',
{
	filebrowserBrowseUrl: '/ckfinder/ckfinder.html',
	filebrowserImageBrowseUrl: '/ckfinder/ckfinder.html?type=Images',
	filebrowserUploadUrl:
 	   '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&currentFolder=/archive/',
	filebrowserImageUploadUrl:
	   '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&currentFolder=/cars/'
});
~~~
**Note:** The folder specified must already exist on the server (see `archive` and `cars` in the example above).

@section integration_connecting Connecting with Applications

@subsection integration_communication_config Configuration File

Most frequently, the interaction between the CKFinder server connector and external PHP applications is done through the `config.php` file.
As this is a regular PHP file, you are free to use PHP code to connect with the application.

<h4>Example 3</h4>

One of common use cases is fetching the user name from an external system and setting the backend location to a private folder reusing the *user name* or *user ID* as a part of the path where the user files will be located (so that each user had its own private space for files).

In the example below you can gain access to the global `$user` object defined in a hypothetical application by loading its `bootstrap.php` file and then reuse it to set the `baseUrl` and `root` properties for the @ref configuration_options_backends "backend".

~~~
require_once '../my-application/bootstrap.php';

$config['backends'][] = array(
    'name'         => 'default',
    'adapter'      => 'local',

    'baseUrl'      => 'http://example.com/files/'.$user->id,
    'root'         => '/home/www/example.com/files/'.$user->id,

    'chmodFiles'   => 0777,
    'chmodFolders' => 0755,
    'filesystemEncoding' => 'UTF-8'
);
~~~

**Note:** Be careful when reusing data entered by users (e.g. user names) to construct server paths.

@subsection integration_communication_plugins Plugins

@ref plugins let you extend the functionality of CKFinder on the server side, including:
 - Adding new commands (features).
 - Modifying the application behavior.

There are no limitations regarding what plugins can do, you are free to e.g. write a plugin that logs user actions to your application database.
See the @ref plugins "plugin documentation" for more details.