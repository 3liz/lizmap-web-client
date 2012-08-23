Documentation
-------------

page description
-----------------

A wizard contains some pages. Each page of the wizard are implemented or described
into several files :

- a class, in which the display and the process of an optional form are implemented.
- a template, used to display the page
- a locale file, in which localized string are stored, in php. There should be one locale
 file for each language. It should have at least a locale file for english lang.


Files of a page are stored in a same directory, and a page is identified with a name. For instance,
if the name of the page is "welcome" :

- the directory for the page is named welcome.
- welcome/welcome.page.php is the file which implements the class of the page
- welcomeWizPage should be the name of the class
- welcome/welcome.tpl is the template
- welcome/welcome.en.php is the locale file for english, welcome.fr.php for french etc.

A template file should contain only a html fragment, which will be inserted into an other main template
provided by installWizard. So you should not include <head>, <body> elements for instance. You mustn't
use the <form> element, since your fragment will be include into an existing <form> element into the main
template. However, you can use any form elements like <input>, <textarea> etc.. Their content after the
submit will be available in $_POST as usual, and you could retrieve these values into the process()
method of the class of the page.

The show() method of the class should prepare the given template, so it should assign values if needed.
For instance, if the template contains form elements, the show() method could initialize their values,
or displaying errors if the submit has failed.


declaration of pages
--------------------

You should create an ini file which is the configuration of your wizard.

It contains sections for each page, and each section could contains options for the page, and
at least one option, "next", which indicate the name of the next page. A section name is the name of the page
with the suffix ".step".

See wizard.ini.php.dist for an example.

The name of the first page is indicated in the global option "start".

Pages are stored in one or several directories. Into the pagesPath parameter, you should indicate
the path to this directories, relative to the directory in which the ini file is stored
(for a jelix application, typically, it is stored in myapp/install/). In most of case, you should
declared the directory of pages provided with installWizard (pages/ directory). And you may want
to provide your own pages, so you put them in a directory and add this directory in the list into pagesPath.
In a jelix application, this directory is myapp/install/wizard/pages/


Redefining templates and locales
--------------------------------
You may want to change the design or the HTML content of a page or all pages.

To do it, you should create a directory where you'll store your own version of template of pages.
Declare this directory into the customPath option in the config file. For a jelix application,
this path is typically myapp/install/wizard/custom.

Just copy original files into this directory, and modify them as needed. You can do the same thing for locales file.

In the same way, you can add new locales files for new languages.

You can also copy the wiz_layout.tpl into it, which is the main template. You can then modify this copy. Same thing
for locales for the main template.

Other configuration parameters
------------------------------

You should set the tempPath, which should indicate a directory where temporary files can be stored.
In a jelix application, it can be temp/myapp.

supportedLang contains the list of language code supported by your wizard.

appname : the name of your application

Calling the wizard
------------------

When your wizard is configured and your pages are ok, copy the install.php.dist script where you want, by renaming
to install.php (no other name). Modify it to change the path of the wizard.ini file.

Then you can call it into your browser.


