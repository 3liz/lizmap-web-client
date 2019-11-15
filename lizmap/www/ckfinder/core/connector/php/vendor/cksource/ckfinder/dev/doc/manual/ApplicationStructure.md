# Application Structure {#appstructure}

\tableofcontents

CKFinder is an Ajax application whose front end is written entirely in JavaScript. It communicates
with the server through JSON messages. On the server side, there is a "connector" written in a specific server
language, which handles the front end requests. The following diagram illustrates it:

![Application structure overview](/manual/images/ckfinder_overview.png)

The CKFinder 3 PHP connector is built on top of the following Symfony 2 components:
 - [HttpKernel](https://symfony.com/doc/current/components/http_kernel/introduction.html)
 - [HttpFoundation](https://symfony.com/doc/current/components/http_foundation/introduction.html)
 - [EventDispatcher](https://symfony.com/doc/current/components/event_dispatcher/introduction.html)

[Pimple](https://pimple.symfony.com/) is used as a dependency injection container.

[Flysystem](https://flysystem.thephpleague.com/docs/) file system abstraction layer is used for communication with multiple
[CKFinder backends](@ref backends).


# Request Workflow {#request_workflow}
![Request workflow overview](/manual/images/request_workflow.png)

# Dependency Injection Container {#dependency_injection}

The main CKFinder application class, [CKFinder](@ref CKSource::CKFinder::CKFinder), extends `Pimple\Container` and acts as a dependency injection container (approach inspired by [Silex](https://silex.symfony.com/)). All defined dependencies
are instantiated in the lazy way &mdash; objects are created only if they are actually used during the application lifecycle.

You can access the following application components inside the container:

Key                   | Object Type                                                                                                   | Description
----------------------|---------------------------------------------------------------------------------------------------------------|------------
`acl`                 | [Acl](@ref CKSource::CKFinder::Acl::Acl)                                                                      | The CKFinder access control list.
`backend_manager`     | [BackendFactory](@ref CKSource::CKFinder::Backend::BackendFactory)                                            | A factory object responsible for backend instantiation.
`config`              | [Config](@ref CKSource::CKFinder::Config)                                                                     | CKFinder configuration.
`csrf_token_validator` @labelSince{3.2.0}| [DoubleSubmitCookieTokenValidator](@ref CKSource::CKFinder::Security::Csrf::DoubleSubmitCookieTokenValidator) | An implementation of [TokenValidatorInterface](@ref CKSource::CKFinder::Security::Csrf::TokenValidatorInterface) used to validate CSRF tokens in requests.
`debug`               | Boolean value                                                                                                 | A Boolean flag indicating if the application is running in debugging mode.
`dispatcher`          | [EventDispatcher](https://api.symfony.com/2.8/Symfony/Component/EventDispatcher/EventDispatcher.html)                               | A Symfony `EventDispatcher` instance.
`exception_handler`   | [ExceptionHandler](@ref CKSource::CKFinder::ExceptionHandler)                                                 | Exception handler.
`kernel`              | [HttpKernel](https://api.symfony.com/2.8/Symfony/Component/HttpKernel/HttpKernel.html)                         | A Symfony `HttpKernel`.
`logger`              | `Monolog\Logger`                                                                                              | A `Psr\Log\LoggerInterface` instance (by default `Monolog\Logger` using `FirePHPHandler`).
`request_stack`       | [RequestStack](https://api.symfony.com/2.8/Symfony/Component/HttpFoundation/RequestStack.html)                 | A Symfony `RequestStack`.
`resolver`            | [CommandResolver](@ref CKSource::CKFinder::CommandResolver)                                                   | The CKFinder command resolver.
`request_transformer` @labelSince{3.1.1} | [JsonTransformer](@ref CKSource::CKFinder::Request::Transformer::JsonTransformer)          | A request transformer instance used for transforming requests to format understandable by connector.
`working_folder`      | [WorkingFolder](@ref CKSource::CKFinder::Filesystem::Folder::WorkingFolder)                                   | The CKFinder `WorkingFolder` object that represents the current working directory defined by resource type and its backend, backend's root folder, and relative path passed in the `currentFolder` URL parameter.

# Events {#events}

CKFinder PHP connector provides a set of events that can be used for changing default application behavior. Each of the events
is identified by its unique name, and can be listened by any number of listeners.

To attach a listener to the event, you can use the `dispatcher` object stored in the application dependency injection container:

~~~~~~~~~~~~~~~~
$dispatcher = $app['dispatcher'];
$dispatcher->addListener(CKFinderEvent::BEFORE_COMMAND_INIT, function(BeforeCommandEvent $e) {
    // Your event listener logic.
});
~~~~~~~~~~~~~~~~

You can also use the [CKFinder::on()](@ref CKSource::CKFinder::CKFinder::on) shorthand method:

~~~~~~~~~~~~~~~~
$ckfinder->on(CKFinderEvent::BEFORE_COMMAND_INIT, function(BeforeCommandEvent $e) {
    // Your event listener logic.
});
~~~~~~~~~~~~~~~~

In @ref howto_disk_quota and @ref howto_logging_actions sections of the HOWTO you can find two sample plugins that use events.

## beforeCommand Events {#before_command_events}

These events are fired after a particular command is resolved, i.e. it is decided which command class should be used to handle the current request. The following naming convention is used:

~~~~~~~~~~~~~~~~
ckfinder.beforeCommand.[lcfirst(command name)]
~~~~~~~~~~~~~~~~

For example: `ckfinder.beforeCommand.init`, `ckfinder.beforeCommand.deleteFiles`.

The parameter passed to event listeners is an object of the [BeforeCommandEvent](@ref CKSource::CKFinder::Event::BeforeCommandEvent) type that carries the following information:
- The `CKFinder` application object (like all CKFinder events).
- The name of the executed command.
- The object of the resolved command.

In events listeners it is possible to provide any additional code that will be executed before the command, but it is also possible to replace the command object that is carried inside the event object, so the new provided command object will be used instead. The provided command object must be a valid command object (i.e. an object that is a `CommandAbstract` type).

Note that this is a generic event that can also be used for any commands provided by plugins that are not listed below.


| Event Name                               | CKFinderEvent Constant                            |
|------------------------------------------|---------------------------------------------------|
|`ckfinder.beforeCommand.init`             | `CKFinderEvent::BEFORE_COMMAND_INIT`              |
|`ckfinder.beforeCommand.copyFiles`        | `CKFinderEvent::BEFORE_COMMAND_COPY_FILES`        |
|`ckfinder.beforeCommand.createFolder`     | `CKFinderEvent::BEFORE_COMMAND_CREATE_FOLDER`     |
|`ckfinder.beforeCommand.deleteFiles`      | `CKFinderEvent::BEFORE_COMMAND_DELETE_FILES`      |
|`ckfinder.beforeCommand.deleteFolder`     | `CKFinderEvent::BEFORE_COMMAND_DELETE_FOLDER`     |
|`ckfinder.beforeCommand.downloadFile`     | `CKFinderEvent::BEFORE_COMMAND_DOWNLOAD_FILE`     |
|`ckfinder.beforeCommand.fileUpload`       | `CKFinderEvent::BEFORE_COMMAND_FILE_UPLOAD`       |
|`ckfinder.beforeCommand.getFiles`         | `CKFinderEvent::BEFORE_COMMAND_GET_FILES`         |
|`ckfinder.beforeCommand.getFileUrl`       | `CKFinderEvent::BEFORE_COMMAND_GET_FILE_URL`      |
|`ckfinder.beforeCommand.getFolders`       | `CKFinderEvent::BEFORE_COMMAND_GET_FOLDERS`       |
|`ckfinder.beforeCommand.getResizedImages`  | `CKFinderEvent::BEFORE_COMMAND_GET_RESIZED_IMAGES` |
|`ckfinder.beforeCommand.imageEdit`        | `CKFinderEvent::BEFORE_COMMAND_IMAGE_EDIT`        |
|`ckfinder.beforeCommand.imageInfo`        | `CKFinderEvent::BEFORE_COMMAND_IMAGE_INFO`        |
|`ckfinder.beforeCommand.imagePreview`     | `CKFinderEvent::BEFORE_COMMAND_IMAGE_PREVIEW`     |
|`ckfinder.beforeCommand.imageResize`       | `CKFinderEvent::BEFORE_COMMAND_IMAGE_RESIZE`       |
|`ckfinder.beforeCommand.moveFiles`        | `CKFinderEvent::BEFORE_COMMAND_MOVE_FILES`        |
|`ckfinder.beforeCommand.quickUpload`      | `CKFinderEvent::BEFORE_COMMAND_QUICK_UPLOAD`      |
|`ckfinder.beforeCommand.renameFile`       | `CKFinderEvent::BEFORE_COMMAND_RENAME_FILE`       |
|`ckfinder.beforeCommand.renameFolder`     | `CKFinderEvent::BEFORE_COMMAND_RENAME_FOLDER`     |
|`ckfinder.beforeCommand.saveImage`        | `CKFinderEvent::BEFORE_COMMAND_SAVE_IMAGE`        |
|`ckfinder.beforeCommand.thumbnail`        | `CKFinderEvent::BEFORE_COMMAND_THUMBNAIL`         |


## Intermediate Events {#intermediate_events}
These events are fired inside command classes before any important operations like uploading a file, renaming, deleting, moving files and folders take place.


| Event Name | CKFinderEvent Constant | Argument Passed to the Listener |
|------------|------------------------|---------------------------------|
|`ckfinder.copyFiles.copy`|`CKFinderEvent::COPY_FILE`|[CopyFileEvent](@ref CKSource::CKFinder::Event::CopyFileEvent)|
|`ckfinder.createFolder.create`|`CKFinderEvent::CREATE_FOLDER`|[CreateFolderEvent](@ref CKSource::CKFinder::Event::CreateFolderEvent)|
|`ckfinder.deleteFiles.delete`|`CKFinderEvent::DELETE_FILE`|[DeleteFileEvent](@ref CKSource::CKFinder::Event::DeleteFileEvent)|
|`ckfinder.deleteFolder.delete`|`CKFinderEvent::DELETE_FOLDER`|[DeleteFolderEvent](@ref CKSource::CKFinder::Event::DeleteFolderEvent)|
|`ckfinder.downloadFile.download`|`CKFinderEvent::DOWNLOAD_FILE`|[DownloadFileEvent](@ref CKSource::CKFinder::Event::DownloadFileEvent)|
|`ckfinder.uploadFile.upload`|`CKFinderEvent::FILE_UPLOAD`|[FileUploadEvent](@ref CKSource::CKFinder::Event::FileUploadEvent)|
|`ckfinder.moveFiles.move`|`CKFinderEvent::MOVE_FILE`|[MoveFileEvent](@ref CKSource::CKFinder::Event::MoveFileEvent)|
|`ckfinder.renameFile.rename`|`CKFinderEvent::RENAME_FILE`|[RenameFileEvent](@ref CKSource::CKFinder::Event::RenameFileEvent)|
|`ckfinder.renameFolder.rename`|`CKFinderEvent::RENAME_FOLDER`|[RenameFolderEvent](@ref CKSource::CKFinder::Event::RenameFolderEvent)|
|`ckfinder.saveImage.save`|`CKFinderEvent::SAVE_IMAGE`|[EditFileEvent](@ref CKSource::CKFinder::Event::EditFileEvent)|
|`ckfinder.imageEdit.save`|`CKFinderEvent::EDIT_IMAGE`|[EditFileEvent](@ref CKSource::CKFinder::Event::EditFileEvent)|
|`ckfinder.thumbnail.createThumbnail`|`CKFinderEvent::CREATE_THUMBNAIL`|[ResizeImageEvent](@ref CKSource::CKFinder::Event::ResizeImageEvent)|
|`ckfinder.imageResize.createResizedImage`|`CKFinderEvent::CREATE_RESIZED_IMAGE`|[ResizeImageEvent](@ref CKSource::CKFinder::Event::ResizeImageEvent)|


## afterCommand Events {#after_command_events}
These events are fired after a particular command controller method (`Command::execute()`) returned the response. The following naming convention is used:

~~~~~~~~~~~~~~~~
ckfinder.afterCommand.[lcfirst(command name)]`
~~~~~~~~~~~~~~~~

The parameter passed to event listeners is an object of the [AfterCommandEvent](@ref CKSource::CKFinder::Event::AfterCommandEvent) type that carries the following information:
- The `CKFinder` application object.
- The name of the executed command.
- The `Response` object for the executed command.

Note that this is a generic event that can also be used for any commands provided by plugins.


| Event Name                               | CKFinderEvent Constant                            |
|------------------------------------------|---------------------------------------------------|
|`ckfinder.afterCommand.init`              | `CKFinderEvent::AFTER_COMMAND_INIT`               |
|`ckfinder.afterCommand.copyFiles`         | `CKFinderEvent::AFTER_COMMAND_COPY_FILES`         |
|`ckfinder.afterCommand.createFolder`      | `CKFinderEvent::AFTER_COMMAND_CREATE_FOLDER`      |
|`ckfinder.afterCommand.deleteFiles`       | `CKFinderEvent::AFTER_COMMAND_DELETE_FILES`       |
|`ckfinder.afterCommand.deleteFolder`      | `CKFinderEvent::AFTER_COMMAND_DELETE_FOLDER`      |
|`ckfinder.afterCommand.downloadFile`      | `CKFinderEvent::AFTER_COMMAND_DOWNLOAD_FILE`      |
|`ckfinder.afterCommand.fileUpload`        | `CKFinderEvent::AFTER_COMMAND_FILE_UPLOAD`        |
|`ckfinder.afterCommand.getFiles`          | `CKFinderEvent::AFTER_COMMAND_GET_FILES`          |
|`ckfinder.afterCommand.getFileUrl`        | `CKFinderEvent::AFTER_COMMAND_GET_FILE_URL`       |
|`ckfinder.afterCommand.getFolders`        | `CKFinderEvent::AFTER_COMMAND_GET_FOLDERS`        |
|`ckfinder.afterCommand.getResizedImages`   | `CKFinderEvent::AFTER_COMMAND_GET_RESIZED_IMAGES`  |
|`ckfinder.afterCommand.imageEdit`         | `CKFinderEvent::AFTER_COMMAND_IMAGE_EDIT`         |
|`ckfinder.afterCommand.imageInfo`         | `CKFinderEvent::AFTER_COMMAND_IMAGE_INFO`         |
|`ckfinder.afterCommand.imagePreview`      | `CKFinderEvent::AFTER_COMMAND_IMAGE_PREVIEW`      |
|`ckfinder.afterCommand.imageResize`        | `CKFinderEvent::AFTER_COMMAND_IMAGE_RESIZE`        |
|`ckfinder.afterCommand.moveFiles`         | `CKFinderEvent::AFTER_COMMAND_MOVE_FILES`         |
|`ckfinder.afterCommand.quickUpload`       | `CKFinderEvent::AFTER_COMMAND_QUICK_UPLOAD`       |
|`ckfinder.afterCommand.renameFile`        | `CKFinderEvent::AFTER_COMMAND_RENAME_FILE`        |
|`ckfinder.afterCommand.renameFolder`      | `CKFinderEvent::AFTER_COMMAND_RENAME_FOLDER`      |
|`ckfinder.afterCommand.saveImage`         | `CKFinderEvent::AFTER_COMMAND_SAVE_IMAGE`         |
|`ckfinder.afterCommand.thumbnail`         | `CKFinderEvent::AFTER_COMMAND_THUMBNAIL`          |



You can also listen for any event dispatched by the [HttpKernel](https://symfony.com/doc/current/components/http_kernel/introduction.html) component.
See the [HttpKernel events information table](https://symfony.com/doc/current/components/http_kernel/introduction.html#component-http-kernel-event-table)

For more information about events and events listeners please read the documentation
of Symfony [EventDispatcher component](https://symfony.com/doc/current/components/event_dispatcher/introduction.html).
