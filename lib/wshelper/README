Webservice helper 1.5 - Readme
For more information see www.jool.nl/webservicehelper/
Author: David Kingma david<AT>jool<DOT>nl

1. Changelog
2. What does the webservice helper?
3. Manual
4. FAQ
6. Example
7. TODO

Changelog 1.5
- New Rename and prefix classes, except the WSHelper class
- Support literal and encoded services
- Use new native get ReflectionProperty::getDocComment()
- Catch any exceptions only in the service.php (and rethrow a soapFault with the exception
  message) to allow for better error handling and database transaction revert
- Revamp the template system to use XSLTemplate class
- All IPReflection classes now support annotations
- Fix bug with parameter order
- Fix bug with method calls without parameters (Shawn Cook)
- Fix: don't create a reflection object, unless it's needed for WSDL generation
  or documentation
- Use native ob_gz output compression callback
- Support persistence settings


-- 1. What does the webservice helper?

The webservice helper does what the name says: helping you making a php class 
available as webservice. It generates the documentation, the webservice
description file (WSDL) and handles errorhandling. It consists of three parts: 
* extension of the PHP reflection classes to also parse the comments for
  information on parameter info and return values. The documentation and WSDL
  are generated from these classes.(see also documentation.php as an example)
* extension to the PHP SOAP implementation. It catches all normal exceptions
  and allows typehints in the webservice methods. (ie. saveContact(contact $contact))

-- 2. Manual
So how do you create your own webservice. As an example we create a webservice to
add and show contacts. First you create a class called contactManager in the 
/lib/data_objects with the public functions getContacts(), saveContact(contact 
$contact) and newContact(). To let the Webservice helper know what the parameters 
and return values of each method are we put a comment in front of each method 
specifying the parameters and return types. For example:

/**
 * This method saves the given contact
 * @return contact[] Array with all the contacts
 */
 public function getContacts(){}

/**
 * This method saves the given contact
 * @param contact The contact to save
 * @return void
 */
 public function saveContact(contact $contact){}

/**
 * This method saves the given contact
 * @return contact A new contact template
 */
 public function newContact(){}

We used the contact type as a return value for newContact() and getContacts() so we 
need to define what a contact looks like. For that we create a class called contact:

class contact{
	/** @var string */
	public $name;
	/** @var string */
	public $address;
}

Since string is (just as boolean and int) a known datatype we don't need to specify it
any further.

The last thing we need to do to finish our webservice is to tell the webservice that de 
contactManager class is an allowed webservice and that contact is an allowed data-
structure (for documentation purpose and classmap). In the config.php you add "contactmanager" to 
the WSClasses array and add "contact" to the WSStructures array. 

You can now view the service documentation at /service.php and the wsdl at 
/service.php?class=contactManager&wsdl

-- 3. FAQ

* My function doesn't showup in the documentation nor the WSDL file?
Please check if it's a public function and it doesn't start with '__'

* It doesn't work!
    - Do you see any warnings in the generated documentation? Fix them
    - Check case sensitivity of class names
    - Did you check the javaconsole to see if anything goes wrong?
    - Tried cleaning the wsdl cache in the WSDL cache directory?
    - Did you check the WSDL url in the client?

* Can I use the webservice helper in my own project?
Yes you can use it under the terms of LGPL 2.1 and send me mail about the project
and with any codechanges.


-- 5. example
See /service.php?class=contactManager and the tests folder



-- 6. TODO
* Document and publish the javascript client
* Making a better cache mechanism for the WSDL files and documentation
* XML signature / XML encryption
* Make it possible to put the type info in a seperate xsd file and include that file in the wsdl definitions
* Enable multidimensional array definitions, for example giving: @param contact[][]
