# Plugins {#plugins}

\tableofcontents

@section plugins_introduction Introduction

CKFinder uses two types of plugins:
- JavaScript plugins, used by the CKFinder frontend, which can be used to alter and extend CKFinder UI.
- PHP plugins that can be used to change and extend the behavior of the server-side connector.

Below you can find information and examples for CKFinder PHP plugins. For details about JavaScript plugins please refer to [Creating CKFinder 3.x JavaScript Plugins](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_plugins) documentation.


@subsection plugins_introduction_installation Plugin Installation

Manual installation requires downloading plugin source and unpacking it inside the CKFinder `plugins` directory.
The directory structure needs to follow the following pattern:
~~~
plugins
└── PluginName
    └── PluginName.php
~~~


@subsection plugins_introduction_configuration Configuration

After installation the plugin has to be enabled in the CKFinder configuration file. See @ref configuration_options_plugins for details.

Plugins usually offer a few configuration options that can be set in the main CKFinder configuration file.
Please check plugin documentation for details.


@section plugins_development Plugin Development

Default CKFinder behavior can be changed and extended with custom plugins. There are a few constraints
that a plugin must meet to be recognized as valid:
 1. A plugin must have a unique name that meets the following conditions:
    * It must start with an uppercase letter.
    * It must be a valid PHP class name.
    * It must be unique within the `CKSource\CKFinder\Plugin` namespace.
 2. A plugin must be located in its own namespace under `CKSource\CKFinder\Plugin\<plugin_name>`.
 3. The main plugin class name must match the plugin name and has to be located in the plugin's namespace.
    For example, let us assume you want to create a plugin named `ImageWatermark`. In this case
    the plugin namespace will be `CKSource\CKFinder\Plugin\ImageWatermark`, and the main class
    of the plugin needs to be accessible as `CKSource\CKFinder\Plugin\ImageWatermark\ImageWatermark`.
 4. The plugin class needs to implement the [PluginInterface](@ref CKSource::CKFinder::Plugin::PluginInterface).

## Plugin Interface {#plugin_interface}

Each CKFinder plugin has to implement the [PluginInterface](@ref CKSource::CKFinder::Plugin::PluginInterface):

~~~~~~~~~~~~~
namespace CKSource\CKFinder\Plugin;

interface PluginInterface
{
    public function setContainer(CKFinder $app);
    public function getDefaultConfig();
}
~~~~~~~~~~~~~

It contains two methods that need to be implemented in the plugin class:
 * `setContainer` is used to inject CKFinder dependency injection container to the plugin scope (see @ref dependency_injection for details).
 * `getDefaultConfig` returns an array with default configuration options for the plugin.


@subsection plugins_development_configuration Plugin Configuration

Default configuration options returned by the `getDefaultConfig` method are merged to CKFinder [Config](@ref CKSource::CKFinder::Config) under a node corresponding to the plugin name. Let us assume that the `ImageWatermark` plugin `getDefaultConfig` method looks as follows:

~~~~~~~~~~~~~
public function getDefaultConfig()
{
    return array(
        'imagePath' => '/path/stamp.png',
        'position' => array(
            'right' => 10,
            'bottom' => 'center'
        )
    );
}
~~~~~~~~~~~~~

To access plugin configuration settings, first you need to get the [Config](@ref CKSource::CKFinder::Config) object from
the dependency injection container injected in the `setContainer` plugin method:

~~~~~~~~~~~~~
$config = $this->app['config'];
~~~~~~~~~~~~~

Later in the plugin code you can access plugin options in the following way:

~~~~~~~~~~~~~
$config->get('ImageWatermark.imagePath');       // '/path/stamp.png'
$config->get('ImageWatermark.position.bottom'); // 'center'
$config->get('ImageWatermark.position');        // an array: array('right' => 10, 'bottom' => 'center')
$config->get('ImageWatermark');                 // an array: whole plugin configuration array
~~~~~~~~~~~~~

All default plugin configuration options can be overwritten in the main CKFinder configuration file. If the user
wants to use a different image for the `ImageWatermark` plugin, it can be added in an appropriate option:

~~~~~~~~~~~~~
// ...
'ImageWatermark' => array(
    'imagePath' => '/custom/path/image.png'
),
~~~~~~~~~~~~~

After that:
~~~~~~~~~~~~~
$config->get('ImageWatermark.imagePath');       // '/custom/path/image.png'
~~~~~~~~~~~~~


@subsection plugins_development_types Plugin Types

Plugins can perform many different tasks. Depending on your plugin purpose you need to decide what type of plugin you need.
There are two main plugin types:
 * **Event subscribers** &ndash; Plugins that perform actions for defined application events (see @ref events for details). If
                       you want to create this type of plugin, you have to implement
                       [EventSubscriberInterface](https://symfony.com/doc/current/components/event_dispatcher/introduction.html#using-event-subscribers)
                       in your plugin class.
 * **Command plugins** &ndash; Plugins that behave like other CKFinder commands (see @ref commands for details). In this case
                       you need to extend the [CommandAbstract](@ref CKSource::CKFinder::Command::CommandAbstract) class,
                       or any of the existing CKFinder command classes.


@subsection plugins_development_structure_example Plugin Structure Example

Getting back to the `ImageWatermark` plugin example, let us assume it should work in the following way:
 * Listen for the file upload event, after the file is validated (and if it is an image &mdash; also resized), and just before it is saved.
 * If the file is a supported image type, get uploaded file content and add a watermark.
 * Set the watermarked image as uploaded file content.

The plugin will be an event subscriber type then, listening to `CKFinderEvent::FILE_UPLOAD`. The basic code structure
of the `ImageWatermark` plugin class can look as below:

~~~~~~~~~~~~~
namespace CKSource\CKFinder\Plugin\ImageWatermark;

use CKSource\CKFinder\CKFinder;
use CKSource\CKFinder\Config;
use CKSource\CKFinder\Event\CKFinderEvent;
use CKSource\CKFinder\Event\FileUploadEvent;
use CKSource\CKFinder\Plugin\PluginInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ImageWatermark implements PluginInterface, EventSubscriberInterface
{
    protected $app;

    public function setContainer(CKFinder $app)
    {
        $this->app = $app;
    }

    public function getDefaultConfig()
    {
        return [
            'imagePath' => __DIR__ . '/stamp.png',
            'position' => [
                'right' => 0,
                'bottom' => 0
            ]
        ];
    }

    public function addWatermark(FileUploadEvent $event)
    {
        $config = $this->app['config'];

        $uploadedFile = $event->getUploadedFile();
        $imageData = $uploadedFile->getContents();
        $watermarkImagePath = $config->get('ImageWatermark.imagePath');

        // Process uploaded image.

        $uploadedFile->setContents($processedImageData);
    }

    public static function getSubscribedEvents()
    {
        return [CKFinderEvent::FILE_UPLOAD => 'addWatermark'];
    }
}
~~~~~~~~~~~~~

You can find a complete working example of the `ImageWatermark` plugin on [GitHub](https://github.com/ckfinder/ckfinder-plugin-imagewatermark-php).