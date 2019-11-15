# Commands {#commands}

\tableofcontents

CKFinder commands behave just like controllers. They wrap the logic required to handle a request and produce
an appropriate response (in CKFinder usually a JSON). Commands are resolved based on the `command` URL parameter.

The heart of each command class is its `execute` method where all the processing
occurs. The `execute` method allows for type-hinting based argument injection during its execution.

For example, for easy access to the current request object and CKFinder configuration you can define them as the `execute` method arguments as follows:

~~~~~~~~~~~~~
public function execute(Request $request, Config $config)
{
    // ...
}
~~~~~~~~~~~~~

The objects that can be injected as the `execute` method arguments are:
 - [Request](https://api.symfony.com/2.8/Symfony/Component/HttpFoundation/Request.html)
 - [CKFinder](@ref CKSource::CKFinder::CKFinder)
 - [EventDispatcher](https://api.symfony.com/2.8/Symfony/Component/EventDispatcher/EventDispatcher.html)
 - [Config](@ref CKSource::CKFinder::Config)
 - [Acl](@ref CKSource::CKFinder::Acl::Acl)
 - [BackendFactory](@ref CKSource::CKFinder::Backend::BackendFactory)
 - [WorkingFolder](@ref CKSource::CKFinder::Filesystem::Folder::WorkingFolder)

# Defining Permissions {#commands_permissions}

Executing each of CKFinder commands requires appropriate permissions set in [ACL configuration settings](@ref configuration_options_accessControl).
Permissions required by a command are defined inside the command class array attribute named `$requires`:

~~~~~~~~~~~~~
class CreateFolder extends CommandAbstract
{
    protected $requires = array(Permission::FOLDER_CREATE);
    // ...
}
~~~~~~~~~~~~~

All permissions required by a command are checked using [Acl](@ref CKSource::CKFinder::Acl::Acl) during the command
object instantiation.

See [Permission](@ref CKSource::CKFinder::Acl::Permission) for all available permissions constants.

# Handling Errors {#commands_errors}

Each of the command responses can optionally contain an error object, in case anything went wrong on the server side:

~~~~~~~~~~~~~
{
    "error": {
        "number": 100,
        "message": "optional"
    },
    // ...
}
~~~~~~~~~~~~~

or for commands that can return multiple errors (e.g. @ref command_copyfiles, @ref command_movefiles):

~~~~~~~~~~~~~
{
    "error": {
        "number": 301,
        "errors": [
            {
               "number": 115,
               // ...
            }
        ]
    },
    // ...
}
~~~~~~~~~~~~~


# Altering Existing Commands {#commands_altering_existing}

All existing CKFinder commands can be altered using the events system (for example to add additional information or to change
the default JSON response). Please refer to the @ref events article for more detailed information.

In some cases it may be useful to alter the command parameters passed from CKFinder to the server-side connector. For an example
how to do that, please check the [AlterCommand](https://github.com/ckfinder/ckfinder-docs-samples/blob/master/AlterCommand/AlterCommand.js)
plugin in the [CKFinder 3 Sample JavaScript Plugins](https://github.com/ckfinder/ckfinder-docs-samples) repository.


# Creating Custom Commands {#commands_creating_custom}

Custom CKFinder commands can be implemented as plugins. You can find the description of a sample plugin in the @ref howto_custom_commands section of the HOWTO.

It may also be useful to have a look at the [ImageInfo](https://github.com/ckfinder/ckfinder-docs-samples/blob/master/ImageInfo/ImageInfo.js) plugin in the [CKFinder 3 Sample JavaScript Plugins](https://github.com/ckfinder/ckfinder-docs-samples) repository to check out how to request commands from a JavaScript plugin.
You can find more information in the [Sending Command to the Server](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_requests-section-sending-command-to-the-server) section of the [CKFinder 3 JavaScript Documentation](https://ckeditor.com/docs/ckfinder/ckfinder3/).


# CSRF Protection {#commands_csrf_protection}

\since CKFinder 3.2.0

The CKFinder 3 PHP connector provides a mechanism to secure the application against [Cross-Site Request Forgery (CSRF)](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29)
attacks (see the @ref configuration_options_csrfProtection configuration option). The default protection method is based on [double submit cookies](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29_Prevention_Cheat_Sheet#Double_Submit_Cookie).

If the protection is enabled, all requests to commands that modify any kind of resources are checked for a valid CSRF token. 
The token is a random string value with the length of 32 or more characters which should be generated using a cryptographically
secure pseudo-random number generator.
When the request is validated, the connector checks for the presence of the same token in the request `POST` parameter, and the request cookie (the expected name for both fields is `ckCsrfToken`).

# List of CKFinder Commands {#commands_list}

### Common URL Parameters

|Name           |Description                        |
|---------------|-----------------------------------|
|`command`      |The name of the command to execute.|
|`type`         |The resource type name.            |
|`currentFolder`|The current working folder path.   |


## CopyFiles {#command_copyfiles}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Copies files from selected folders.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Copy two files from the `sub1` directory of the `Files` resource type to the root (`/`) directory of the `Images` resource type.

Example of the `files` parameter structure (JSON notation):
~~~~~~~~~~~~~
request["files"] = [
    {
        "name": "file1.jpg",
        "type": "Files",
        "folder": "/sub1/"
        "options": ""
    },
    {
        "name": "file2.png",
        "type": "Files",
        "folder": "/sub1/"
        "options": ""
    }
]
~~~~~~~~~~~~~

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=CopyFiles&type=Images&currentFolder=/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/",
        "url": "/ckfinder/userfiles/images/",
        "acl": 255
    },
    "copied": 2
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
The request should contain an array parameter named `files` with elements defining source files to be copied. Each array element should contain the following parameters:
     - `name` &ndash; The file name.
     - `type` &ndash; The file resource type.
     - `folder` &ndash; The file folder.
     - `options` &ndash; A parameter that defines the way the file should be copied in case a file with the same name already exists in the target folder.
                   The `option` parameter can contain the following values:
                   - By default it is an empty string and in this case an appropriate error will be added to the response in case the file already exists.
                   - `overwrite` &ndash; The target file is overwritten.
                   - `autorename` &ndash; In this case the name of the copied file is altered by adding a number to the file name, for example `file.txt` after autorename is `file(1).txt`.
        </td>
    </tr>
</table>

## CreateFolder {#command_createfolder}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Creates a child folder.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Create the `My Folder` folder in the root (`/`) folder of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=CreateFolder&type=Files&currentFolder=/&newFolderName=My Folder
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/",
        "url": "/ckfinder/userfiles/files/",
        "acl": 255
    },
    "newFolder": "My Folder",
    "created": 1
}
~~~~~~~~~~~~~
            </td>
        </tr>
</table>


## DeleteFiles {#command_deletefiles}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Deletes given files.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
        `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Delete two files from the `sub1` directory of the `Files` resource type.

Example of the `files` parameter structure (JSON notation):
~~~~~~~~~~~~~
request["files"] = [
    {
        "name": "file1.jpg",
        "type": "Files",
        "folder": "/sub1/"
    },
    {
        "name": "file2.png",
        "type": "Files",
        "folder": "/sub1/"
    }
]
~~~~~~~~~~~~~

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=DeleteFiles&type=Files&currentFolder=/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/",
        "url": "/ckfinder/userfiles/files/",
        "acl": 255
    },
    "deleted": 2
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
The request should contain an array parameter named `files` with elements defining source files to be deleted. Each array element should contain the following parameters:
 - `name` &ndash; The file name.
 - `type` &ndash; The file resource type.
 - `folder` &ndash; The file folder.
        </td>
    </tr>
</table>


## DeleteFolder {#command_deletefolder}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Deletes a given folder.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
        `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Delete the `sub1` directory of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=DeleteFolder&type=Files&currentFolder=/sub1/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/sub1/",
        "url": "/ckfinder/userfiles/files/sub1/",
        "acl": 255
    },
    "deleted": 1
}
~~~~~~~~~~~~~
        </td>
    </tr>
</table>


## DownloadFile {#command_downloadfile}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Downloads a file from the server.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Download the file named `Test.jpg` from the root (`/`) directory of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=DownloadFile&type=Files&currentFolder=/&fileName=Test.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
This command does not expect the connector to return a text response. Instead, it must stream the file data to the client.
        </td>
    </tr>
</table>


## FileUpload {#command_fileupload}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Uploads a file to a given folder.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Upload a file to the root (`/`) directory of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=FileUpload&type=Files&currentFolder=/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>

~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/",
        "url": "/ckfinder/userfiles/files/",
        "acl": 255
    },
    "fileName": "fileName.jpg",
    "uploaded": 1
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
- File data should be encoded as `multipart/form-data`.
- The `POST` parameter containing uploaded file should be named `upload`.
- Uploaded file names may contain non-ASCII characters.
        </td>
    </tr>
</table>


## GetFiles {#command_getfiles}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Returns the list of files for a given folder.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Get the list of files inside the `/Docs/` folder of the `Images` resource type:
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=GetFiles&type=Images&currentFolder=/Docs/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
   "resourceType": "Images",
   "currentFolder": {
       "path": "/Docs/",
       "url": "/ckfinder/userfiles/images/Docs/",
       "acl": 255
   },
   "files": [
       {
           "name": "image1.png",
           "date": "201406080924",
           "size": 1
       },
       {
           "name": "測試.png",
           "date": "201406080924",
           "size": 12
       }
   ]
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
        File names may contain non-ASCII characters, like in the example above with Chinese characters.

        The `date` attribute corresponds to the time of the last file modification in the format of `YYYYMMDDHHmm`, where:
         - `YYYY` &ndash; The year (4 digits).
         - `MM` &ndash; The month (2 digits with padding zero).
         - `DD` &ndash; The day (2 digits with padding zero).
         - `HH` &ndash; The hour (24 hours format, 2 digits with padding zero).
         - `mm` &ndash; The minute (2 digits with padding zero).

        The `size` attribute contains the file size in kilobytes.
        </td>
    </tr>
</table>


## GetFileUrl {#command_get_file_url}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Returns a direct URL to a file.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Get a direct URL to a file named `longcat.jpg` stored in the `/kittens/` folder of the `Images` resource type:
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=GetFileUrl&type=Images&currentFolder=/kittens/&fileName=longcat.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
   "resourceType": "Images",
   "currentFolder": {
       "path": "/kittens/",
       "url": "/ckfinder/userfiles/images/kittens/",
       "acl": 255
   },
   "url": "/ckfinder/userfiles/images/kittens/longcat.jpg"
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
        The URL returned by this command depends on the backend defined for a resource type. In most cases it is required to define a `baseUrl` for a backend to be able to obtain valid direct URLs to files.
        </td>
    </tr>
</table>


## GetFolders {#command_getfolders}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
            Returns the list of the child folders for a given folder.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Get child folders inside the `/Docs/` folder of the `Images` resource type.
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=GetFolders&type=Images&currentFolder=/Docs/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Images",
    "currentFolder": {
        "path": "/Docs/",
        "url": "/ckfinder/userfiles/images/Docs/",
        "acl": 255
    },
    "folders": [
        {
            "name": "folder1",
            "hasChildren": false,
            "acl": 255
        },
        {
            "name": "繁體中文字",
            "hasChildren": false,
            "acl": 255
        }
    ]
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
        Folder names may contain non-ASCII characters, like in the example above with Chinese characters.
        </td>
    </tr>
</table>


## GetResizedImages {#command_get_resized_images}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
            Returns a list of resized versions of the image file.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Get resized versions of the `longcat.jpg` image that is stored in the `/kittens/` folder of the `Images` resource type:
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=GetResizedImages&type=Images&currentFolder=/kittens/&fileName=longcat.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Images",
    "currentFolder": {
        "path": "/kittens/",
        "url": "/ckfinder/userfiles/images/kittens/",
        "acl": 255
    },
    "originalSize":"1920x1200",
    "resized": {
        "small": "longcat__480x300.jpg",
        "medium": "longcat__600x375.jpg",
        "large": "longcat__800x500.jpg",
        "__custom": ["longcat__200x125.jpg", "longcat__300x188.jpg"]
    }
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
        The resized versions of images always preserve the aspect ratio of the original.
        When the resized version of the image matches any size defined in the `images.sizes` configuration option, it is
        appended under an appropriate key in the response (like `small`, `medium`, `large` in the example above). All other existing
        resized versions are stored under the key named `__custom`.
        </td>
    </tr>
</table>


## ImageEdit {#command_image_edit}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Performs basic image modifications: crop, rotate, resize. 
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
        Actions to perform together with required parameters are sent in the `actions` array parameter.        
        
        An example of the `actions` parameter structure (JSON notation):
~~~~~~~~~~~~~
request["actions"] = [
    {
        "action": "rotate",
        "angle": 90            // Number of degrees for clockwise rotation.
    },
    {
        "action": "resize",
        "width": 300,          // Maximum image width.
        "height": 300          // Maximum image height.
    },
    {
        "action": "crop",
        "x": 0,                // X coordinate of the top-left corner of the cropped area.
        "y": 0,                // Y coordinate of the top-left corner of the cropped area.
        "width": 225,          // The cropped area width.
        "height": 150          // The cropped area height.
    }
]
~~~~~~~~~~~~~

Depending on whether the `newFileName` parameter was provided or not:   
- If provided, a new file with a given name is created.
- If omitted, the current file is replaced.

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=ImageEdit&type=Images&currentFolder=/kittens/&fileName=longcat.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Images",
    "currentFolder": {
        "path": "/kittens/",
        "url": "/ckfinder/userfiles/images/kittens/",
        "acl": 255
    },
    "saved": 1
}
~~~~~~~~~~~~~
        </td>
    </tr>
</table>


## ImageInfo {#command_image_info}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Returns information about the dimensions of the image file. 
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
        Get dimensions of the `longcat.jpg` image that is stored in the `/kittens/` folder of the `Images` resource type.

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=ImageInfo&type=Images&currentFolder=/kittens/&fileName=longcat.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Images",
    "currentFolder": {
        "path": "/kittens/",
        "url": "/ckfinder/userfiles/images/kittens/",
        "acl": 255
    },
    "width": 1440,
    "height": 900
}
~~~~~~~~~~~~~
        </td>
    </tr>
</table>


## ImagePreview {#command_image_preview}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Creates a resized version of the image file. 
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
        Create a resized version of the `longcat.jpg` image that is stored in the `/kittens/` folder of the `Images` resource type.
        Resize it to 450x450:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=ImagePreview&type=Images&currentFolder=/kittens/&fileName=longcat.jpg&size=450x450
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
This command does not expect the connector to return a text response. Instead, it must stream the image data to the client.
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
        Returned images always preserve the aspect ratio of the original (using the higher scaling factor calculated for borders).
        Requested size is corrected when its aspect ratio does not match the aspect ratio of the original image.
        
        Images generated with this command are not stored on the server side.
        </td>
    </tr>
</table>


## ImageResize {#command_image_resize}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
        Creates a resized version of the image file.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
        Create a resized version of the `longcat.jpg` image that is stored in the `/kittens/` folder of the `Images` resource type.
        Resize it to 450x450:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=ImageResize&type=Images&currentFolder=/kittens/&fileName=longcat.jpg&size=450x450
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Images",
    "currentFolder": {
        "path": "/kittens/",
        "url": "/ckfinder/userfiles/images/kittens/",
        "acl": 255
    },
    "url":"/ckfinder/userfiles/images/kittens/__thumbs/longcat.jpg/longcat__450x281.jpg"   // Direct URL to a file
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
        Returned images always preserve the aspect ratio of the original (using the lower scaling factor calculated for borders).
        Requested size is corrected when its aspect ratio does not match the aspect ratio of the original image.
        
        Images generated with this command are stored in a special folder named `__thumbs` created in the current file folder.
        </td>
    </tr>
</table>


## Init {#command_init}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
            This is the first command issued by CKFinder. It returns the general settings of the connector and all configured resource types.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
         <td>Sample request</td>
         <td>
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=Init
~~~~~~~~~~~~~
         </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "enabled": true,
    "s": "",
    "c": "",
    "thumbs": ["150x150", "300x300", "500x500"],
    "images":{"max":"500x400","sizes":{"small":"480x320","medium":"600x480","large":"800x600"}},
    "uploadMaxSize": "425167",
    "uploadCheckImages": true,
    "resourceTypes": [
        {
            "name": "Files",
            "url": "/ckfinder/userfiles/files",
            "allowedExtensions": "7z,aiff,asf,avi,bmp,csv,doc,docx,fla,flv,gif,gz,gzip,jpeg,zip",
            "deniedExtensions": "",
            "hash": "8b787e3ea25b5079",
            "hasChildren": false,
            "acl": 1023,
            "maxSize": 32768
        },
        {
            "name": "Images",
            "url": "/ckfinder/userfiles/images",
            "allowedExtensions": "bmp,gif,jpeg,jpg,png",
            "deniedExtensions": "",
            "hash": "b8de0a3f3cb3cd1f",
            "hasChildren": false,
            "acl": 1023,
            "maxSize": 65536
        }
    ]
}
~~~~~~~~~~~~~
        </td>
    </tr>
</table>


## MoveFiles {#command_movefiles}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Moves files from selected folders.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Move two files from the `sub1` directory of the `Files` resource type to the root (`/`) directory of the `Images` resource type.

Example of the `files` parameter structure (JSON notation):
~~~~~~~~~~~~~
request["files"] = [
    {
        "name": "file1.jpg",
        "type": "Files",
        "folder": "/sub1/"
        "options": ""
    },
    {
        "name": "file2.png",
        "type": "Files",
        "folder": "/sub1/"
        "options": ""
    }
]
~~~~~~~~~~~~~

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=MoveFiles&type=Files&currentFolder=/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/",
        "url": "/ckfinder/userfiles/files/",
        "acl": 255
    },
    "moved": 2
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
The request should contain an array parameter named `files` with elements defining source files to be moved. Each array element should contain the following parameters:
 - `name` &ndash; The file name.
 - `type` &ndash; The file resource type.
 - `folder` &ndash; The file folder.
 - `options` &ndash; A parameter that defines the way the file should be moved when a file with the same name already exists in the target folder.
               The `option` parameter can contain the following values:
               - By default it is an empty string and in this case an appropriate error will be added to the response when the file already exists.
               - `overwrite` &ndash; The target file is overwritten.
               - `autorename` &ndash; In this case the name of the moved file is altered by adding a number to the file name, for example `file.txt` after autorename is `file(1).txt`.
        </td>
    </tr>
</table>


## Operation {#command_operation}

\since CKFinder 3.1.0

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Tracks the progress of the operation in time-consuming connector commands.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample&nbsp;request</td>
        <td>
Progress tracking can be started for a time-consuming command by passing an additional parameter named `operationId`:
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=RenameFolder&type=Files&currentFolder=/foo/&newFolderName=bar&operationId=i52q7a7db83rz3n6
~~~~~~~~~~~~~

The `operationId` is a unique operation identifier that should match the following regular expression: `^[a-z0-9]{16}`.

The status of the operation can be then periodically checked with a request to the `Operation` command:
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=Operation&operationId=i52q7a7db83rz3n6
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample&nbsp;response</td>
        <td>
~~~~~~~~~~~~~
{
    "total": 291,
    "current": 128
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
        Not all commands support operation tracking and this feature may depend on storage type defined for a backend.

This command may use the following optional parameters:
- `abort` &ndash; If this Boolean parameter is present, the time-consuming operation will be immediately aborted.
        </td>
    </tr>
</table>


## Proxy {#command_proxy}

\since CKFinder 3.1.0

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Serves a file to the browser without forcing the download. This command is useful in cases where you want to use files without direct access on a web page. These may be files stored on a backend that does not have a `baseUrl` defined (like a private FTP server), or files that are not in the web server root folder. If the [useProxyCommand](@ref backend_option_useProxyCommand) flag is set in backend configuration, all links generated by CKFinder will be pointing to the `Proxy` command.

**Note**: If you decide to use this option, all links generated by CKFinder will be pointing to the `Proxy` command, and will be dependent on CKFinder connector to work properly.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=Proxy&type=Files&currentFolder=/&fileName=foo.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
This command does not expect the connector to return a text response. Instead, it must stream the file data to the client.
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
This command may use the following optional parameters:
- `cache` &ndash; An integer value defining the cache lifetime in seconds (this corresponds to `Expires` and `Cache-Control` response headers). See the @ref configuration_options_cache configuration option.
- `thumbnail` &ndash; The name of the public thumbnail file, if resized version of the image should be served.
        </td>
    </tr>
</table>


## QuickUpload {#command_quick_upload}
<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Uploads a file to the given folder. This command is very similar to [FileUpload](#command_fileupload) and it is used to handle uploads from the CKEditor Image or Link dialog window.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
This command accepts an additional URL parameter called `responseType` that defines the format of the returned response.

Upload a file to the root (`/`) directory of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&currentFolder=/
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/",
        "url": "/ckfinder/userfiles/files/",
        "acl": 255
    },
    "fileName": "fileName.jpg",
    "uploaded": 1
}
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Notes</td>
        <td>
- File data should be encoded as `multipart/form-data`.
- The `POST` parameter containing the uploaded file should be named `upload`.
- Uploaded file names may contain non-ASCII characters.
        </td>
    </tr>
</table>


## RenameFile {#command_renamefile}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Renames a file.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Rename the file `foo.jpg` to `bar.jpg` in the `sub1` directory of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=RenameFile&type=Files&currentFolder=/sub1/&fileName=foo.jpg&newFileName=bar.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/sub1/",
        "url": "/ckfinder/userfiles/files/sub1/",
        "acl": 255
    },
    "name": "foo.jpg",
    "newName":"bar.jpg",
    "renamed": 1
}
~~~~~~~~~~~~~
        </td>
    </tr>
</table>


## RenameFolder {#command_renamefolder}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Renames a folder.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Rename the `sub1` folder to `sub1_renamed` in the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=RenameFolder&type=Files&currentFolder=/sub1/&newFolderName=sub1_renamed
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/sub1/",
        "url": "/ckfinder/userfiles/files/sub1/",
        "acl": 255
    },
    "newName": "sub1_renamed",
    "newPath": "/sub1_renamed/",
    "renamed": 1
}
~~~~~~~~~~~~~
        </td>
    </tr>
</table>


## SaveImage {#command_save_image}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Saves a Base64-encoded PNG image to a file.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `POST`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Save the Base64-encoded image sent in `content` param as `Test.jpg` file in the root (`/`) directory of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=SaveImage&type=Files&currentFolder=/&fileName=Test.jpg
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Sample response</td>
        <td>
~~~~~~~~~~~~~
{
    "resourceType": "Files",
    "currentFolder": {
        "path": "/",
        "url": "/ckfinder/userfiles/files/",
        "acl": 255
    },
    "saved": 1,
    "date": "201406080924",
    "size": 1
}
~~~~~~~~~~~~~
        </td>
    </tr>
</table>


## Thumbnail {#command_thumbnail}

<table class="command-desc">
    <tr>
        <td>Description</td>
        <td>
Downloads the thumbnail of an image file.
        </td>
    </tr>
    <tr>
        <td>Method</td>
        <td>
            `GET`
        </td>
    </tr>
    <tr>
        <td>Sample request</td>
        <td>
Download the thumbnail of the file named `Test.jpg` from the root (`/`) directory of the `Files` resource type:

~~~~~~~~~~~~~
/ckfinder/core/connector/php/connector.php?command=Thumbnail&type=Files&currentFolder=/&fileName=Test.jpg&size=150x150
~~~~~~~~~~~~~
        </td>
    </tr>
    <tr>
        <td>Response</td>
        <td>
            This command does not expect the connector to return a text response. Instead, it must stream the thumbnail file data to the browser.
        </td>
    </tr>
     <tr>
        <td>Notes</td>
        <td>
            The `size` parameter can be used to control the size of the returned thumbnail image.
            By default the CKFinder connector supports the following thumbnail sizes:
            - 150x150
            - 300x300
            - 500x500
            
			Default sizes can be overwritten in the main configuration file.
        </td>
    </tr>
</table>
