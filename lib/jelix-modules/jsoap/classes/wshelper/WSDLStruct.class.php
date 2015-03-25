<?php
/**
 * Class that can generate a WSDL document from PHP code
 *
 * This class generates a WSDL document for the given
 * methods when the the methods and parameters are documented
 * enough. When there is not enough documentation available (ie
 * unclear what the type of a variable or return type is) a
 * WSDLException is thrown.
 *
 * It should extend domdocument, but this would give problems with
 * arrays, see bug #28817
 *
 * Patch by Shawn Cook (Shawn@itbytez.com), wich makes it default to create empty message tags
 * when a method has no parameters, instead of creating no message tag at all.
 * This behaviour can be modified using the CREATE_EMPTY_INPUTS constant
 *
 * @author David Kingma
 * @version 1.5
 */
class WSDLStruct {
	/** @var boolean  */
	public $_debug = false;

	/** @var int binding type: SOAP_RPC | SOAP_DOCUMENT */
	public $binding_style;

	/** @var int use: SOAP_LITERAL | SOAP_ENCODED */
	public $use;
	/************************** Private properties ***************************/
	
	/** @var SOAPService[] */
	private $services = Array();

	/** @var domElement[] */
	private $serviceTags = Array();

	/** @var domElement[] */
	private $operationTags = Array();

		/** @var domElement[] references to the portType tags. servicename as key */
	private $portTypeTags = Array();
	
	/** @var domElement[] references to the binding tags. servicename as key */
	private $bindingTags = Array();
	
	/** @var domElement[] references to the binding operation tags. servicename as first key, operationname as second */
	private $bindingOperationTags = Array();
	
	/** @var domDocument */
	private $doc;
	
	/** @var domelement */
	private $definitions;

	/** @var domelement Refference tot the types tag*/
	private $typesTag;
	
	/** @var domelement Refference to the xsd:schema tag*/
	private $xsdSchema;

	/** @var IPXMLSchema */
	private $xmlSchema;
	
	//namespaces used
	const NS_WSDL = "http://schemas.xmlsoap.org/wsdl/";
	const NS_SOAP = "http://schemas.xmlsoap.org/wsdl/soap/";
	const NS_ENC  = "http://schemas.xmlsoap.org/soap/encoding/"; 
	const NS_XSD  = "http://www.w3.org/2001/XMLSchema";
	const NS_APACHE  = "http://xml.apache.org/xml-soap";

	const CREATE_EMPTY_INPUTS = true;
	
	/*
	 * @param string Target namespace
	 * @param string URL for the webservice
	 * @return void
	 */
	public function __construct($tns, $url, $type = SOAP_RPC, $use = SOAP_ENCODED){
		if($type != SOAP_RPC 	 && $type != SOAP_DOCUMENT) throw new Exception("Webservice type parameter should be either SOAP_RPC or SOAP_DOCUMENT");
		if($use  != SOAP_ENCODED && $use  != SOAP_LITERAL) throw new Exception("Webservice use parameter should be either SOAP_ENCODED or SOAP_LITERAL");

		$this->use = $use;
		$this->binding_style=$type;
		$this->tns = $tns;
		$this->url = $url;
		$this->doc = new domDocument();
		$this->definitions = $this->addElement("wsdl:definitions",$this->doc);

		$this->typesTag = $this->addElement("wsdl:types", $this->definitions);
		$this->xsdSchema = $this->addElement("xsd:schema", $this->typesTag);
		$this->xsdSchema->setAttribute("targetNamespace", $this->tns);
		$this->xmlSchema = new IPXMLSchema($this->xsdSchema);

	}

	/**
	 * Adds the class to the services for this WSDL 
	 *
	 * @param IPReflectionClass The service
	 * @return void
	 */
	public function setService(IPReflectionClass $class){
		$this->services[$class->classname] = $class;
		$this->services[$class->classname]->getMethods(false, false);
	}
	/**
	 * @return string The WSDL document for this structure
	 */
	public function generateDocument(){
		$this->addToDebug("Generating document");
		
		//add all definitions
		$definitions=$this->definitions;
		$definitions->setAttribute("xmlns", 			self::NS_WSDL);
		$definitions->setAttribute("xmlns:soap", 		self::NS_SOAP);
		$definitions->setAttribute("xmlns:SOAP-ENC", 	self::NS_ENC);
		$definitions->setAttribute("xmlns:wsdl", 		self::NS_WSDL);
		$definitions->setAttribute("xmlns:xsd", 		self::NS_XSD);
		$definitions->setAttribute("xmlns:apache", 		self::NS_APACHE);
		$definitions->setAttribute("xmlns:tns", 		$this->tns);
		$definitions->setAttribute("targetNamespace", 	$this->tns);

		//add all the services
		foreach((array)$this->services as $serviceName => $service){
			//add the portType
			$portType = $this->addPortType($serviceName);

			//add binding
			$binding = $this->addBinding($serviceName);

			//loop the operations
			foreach((array)$service->methods as $operation){
				$operationName = $operation->name;
				$operationTag = $this->addOperation($operationName, $serviceName);

				//input
				//only when to operation needs arguments
				$parameters = $operation->getParameters();
				if(count($parameters)>0 || self::CREATE_EMPTY_INPUTS){
					$messageName = $operationName."Request";
					$input=$this->addElement("wsdl:input", $operationTag);
					$input->setAttribute("message", "tns:".$messageName);
					$para=Array();
					foreach((array)$parameters as $parameterName => $parameter){
						$para[$parameterName] = $parameter->type;
					}
					$this->addMessage($messageName, $para);
					$this->addInput($this->bindingOperationTags[$serviceName][$operationName]);
				}


				//output
				//only when the operation returns something
				if(!$operation->return || trim($operation->return) == "") throw new WSDLException('No return type for '.$operationName);
				if(strtolower(trim($operation->return))!='void'){
					$messageName = $operationName."Response";
					$output = $this->addElement("wsdl:output", $operationTag);
					$output->setAttribute("message", "tns:".$messageName);
					$this->addOutput($this->bindingOperationTags[$serviceName][$operationName]);
					$this->addMessage($messageName,Array($operation->name."Return" => $operation->return));
				}
			}
			// SH. now add the portType and binding
			$this->definitions->AppendChild($portType);
			$this->definitions->AppendChild($binding);
			
			//add the service
			$this->addService($serviceName);
			
		}
		return $this->doc->saveXML();
	}
	
	/**
	 * Adds a new operation to the given service
	 * @param string operation name
	 * @param string service name
	 * @return domElement
	 */
	private function addOperation($operationName, $serviceName){
		$this->addToDebug("Adding Operation: '$operationName : $serviceName'");
		$operationTag = $this->addElement("wsdl:operation",$this->portTypeTags[$serviceName]);
		$operationTag->setAttribute("name",$operationName);

		//create operation tag for binding
		$bindingOperationTag = $this->addElement("wsdl:operation",$this->bindingTags[$serviceName]);
		$bindingOperationTag->setAttribute("name",$operationName);
	
		//soap operation tag
		$soapOperationTag = $this->addElement("soap:operation",$bindingOperationTag);
		$soapOperationTag->setAttribute("soapAction",$this->url."&method=".$operationName);
		$soapOperationTag->setAttribute("style",($this->binding_style == SOAP_RPC)? "rpc" : "document");
		
		//save references
		$this->operationTags[$serviceName][$operationName] = $operationTag;
		$this->bindingOperationTags[$serviceName][$operationName] = $bindingOperationTag;
		
		//and return
		return $operationTag;
	}
	
	/**
	 * adds a new service tag to the WSDL file
	 * @param string the service name
	 * @return domElement
	 */
	private function addService($serviceName){
		$this->addToDebug("Adding service: '$serviceName'");
		//create service
		$serviceTag=$this->addElement("wsdl:service",$this->definitions);
		$serviceTag->setAttribute("name",$serviceName);

			//port tag
			$portTag=$this->addElement("wsdl:port", $serviceTag);
			$portTag->setAttribute("name", $serviceName."Port");
			$portTag->setAttribute("binding", "tns:".$serviceName."Binding");

				//address tag
				$addressTag = $this->addElement("soap:address", $portTag);
				$addressTag->setAttribute("location", $this->url);
				
		//keep a reference
		$this->serviceTags[$serviceName] = $serviceTag;
		//and return
		return $serviceTag;
	}
	
	/** 
	 * Adds a new portType to the WSDL structure
	 * @param string the service name for which we create a portType
	 * @return domElement
	 */
	private function addPortType($serviceName){
		$this->addToDebug("Adding portType: '$serviceName'");
		// SH don't add to main doc just yet
		// $portTypeTag=$this->addElement("wsdl:portType", $this->definitions);
		$portTypeTag = $this->addElement("wsdl:portType");
		$portTypeTag->setAttribute("name", $serviceName."PortType");

		//keep a reference
		$this->portTypeTags[$serviceName]=$portTypeTag;
		//and return
		return $portTypeTag;
	}
	
	/**
	 * Adds a new binding to the WSDL structure
	 * @param string serviceName to bind
	 * @return domElement
	 */
	private function addBinding($serviceName){
		$this->addToDebug("Adding binding: '$serviceName'");
		// SH. don't add to main doc just yet
		// $bindingTag=$this->addElement("binding");
		$bindingTag=$this->addElement("binding",$this->definitions);
		$bindingTag->setAttribute("name", $serviceName."Binding");
		$bindingTag->setAttribute("type", "tns:".$serviceName."PortType");
		
			//soap binding tag
			$soapBindingTag = $this->addElement("soap:binding", $bindingTag);
			$soapBindingTag->setAttribute("style", ($this->binding_style == SOAP_RPC)? "rpc" : "document");
			$soapBindingTag->setAttribute("transport", "http://schemas.xmlsoap.org/soap/http");
			
		//keep a reference
		$this->bindingTags[$serviceName] = $bindingTag;
		//and return
		return $bindingTag;
	}
	
	/**
	 * Adds a message tag to the WSDL document
	 * @param string Message name
	 * @param Array[string=>string] Array with variables & types
	 */
	private function addMessage($name, $parts){
		$this->addToDebug("Adding message: '$name'");
		$msg = $this->addElement("message", $this->definitions);
		$msg->setAttribute("name", $name);
		foreach((array)$parts as $partName => $partType){
			$this->addToDebug("Adding Message part: '$partName => $partType'");
			$part=$this->addElement("part", $msg);
			$part->setAttribute("name", $partName);

			//check if it is a valid XML Schema datatype
			if($t = IPXMLSchema::checkSchemaType(strtolower($partType)))
				$part->setAttribute("type", "xsd:".$t);
			else{
				//If it is an associative array, change the type name
				if(substr($partType,-4) == "[=>]"){
					$partType = substr($partType,0, strlen($partType)-4);
					if(!IPXMLSchema::checkSchemaType(strtolower($partType))){
						$partName = $partType;
						$this->xmlSchema->addComplexType($partType, $partName);
					}
					$part->setAttribute("type", "apache:Map");
				}else{
					$partName = (substr($partType,-2) == "[]")?substr($partType,0,strpos($partType,"["))."Array":$partType;
					$part->setAttribute("type", "tns:".$partName);
					$this->xmlSchema->addComplexType($partType, $partName);
				}
			}
		}
	}

	/**
	 * Adds an input element to the given parent (an operation tag)
	 * @param domNode The Parent domNode
	 * @param boolean Kind of tag. true=input tag, false=output tag
	 * @return domNode The input/output node
	 */
	private function addInput($parent, $input=true){
		$name = $input ? "wsdl:input" : "wsdl:output";
		$tag=$this->addElement($name, $parent);
		$soapOperation=$this->addElement("soap:body", $tag);
		$soapOperation->setAttribute("use", ($this->use == SOAP_ENCODED)? "encoded" : "literal");
		$soapOperation->setAttribute("namespace", $this->tns);
		if($this->use == SOAP_ENCODED)
			$soapOperation->setAttribute("encodingStyle", self::NS_ENC);
	}

	/**
	 * Adds an output element to the given parent (an operation tag)
	 * @param domNode The Parent domNode
	 * @return domNode The output node
	 */
	private function addOutput($parent){
		return $this->addInput($parent,false);
	}

	/*************************  Supporting functions ****************************/
	
	private function addToDebug($msg){
		if($this->_debug) echo '-'.$msg." <br>\n";
	}

	/**
	 * Adds an child element to the parent
	 * @param string The name element
	 * @param domNode 
	 * @return domNode
	 */
	private function addElement($name, $parent=false, $ns=false){
		if($ns)
			$el=$this->doc->createElementNS($ns,$name);
		else
			$el=$this->doc->createElement($name);
		if($parent)
			$parent->appendChild($el);
		return $el;
	}
}
?>