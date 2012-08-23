<?php

/**
 * This class helps you creating a valid XMLSchema file
 * Sylvain261 : Ajout du paramètre false à class_exists pour empécher l'autoload
 */
class IPXMLSchema {
	/** @var domelement reference to the parent domelement */
	private $parentElement;
	
	/** @var domelement[] Array with references to all known types in this schema */
	private $types = Array();
	
	/** @var boolean True=place array's inline */
	private $array_inline = false;
	
	public function __construct(domelement $parentElement){
		$this->parentElement = $parentElement;
	}
	
	/**
	 * Ads a complexType tag with xmlschema content to the types tag
	 * @param string The variable type (Array or class name)
	 * @param string The variable name
	 * @param domNode Used when adding an inline complexType
	 * @return domNode The complexType node
	 */
	
	public function addComplexType($type, $name = false, $parent = false) {
		if(!$parent){//outline element

			if(substr($name,-4) == '[=>]'){
				$name = substr($name, 0,strlen($name) -4);
			}
			
			//check if the complexType doesn't already exists
			if(isset($this->types[$name])) return $this->types[$name];

			//create the complexType tag beneath the xsd:schema tag
			$complexTypeTag=$this->addElement("xsd:complexType", $this->parentElement);
			if($name){//might be an anonymous element
				$complexTypeTag->setAttribute("name",$name);
				$this->types[$name]=$complexTypeTag;
			}
		}else{//inline element
			$complexTypeTag = $this->addElement("xsd:complexType", $parent);
		}

		//check if its an array
		if(strtolower(substr($type,0,6)) == 'array(' || substr($type,-2) == '[]'){
			$this->addArray($type,$complexTypeTag);
		}else{//it should be an object
			if(substr($type,-4) == '[=>]'){
				$type = substr($type, 0,strlen($type) -4);
				echo("\nAdd type element :$type \n");
				$this->addTypeElement($type, $name, $complexTypeTag);
			}else{ //should be a known class

				$tag=$this->addElement("xsd:all", $complexTypeTag);
				if(!class_exists($name, FALSE)) throw new WSDLException("Error creating WSDL: no class found with the name '$name' / $type : $parent, so how should we know the structure for this datatype?");
				$v = new IPReflectionClass($name);
				//TODO: check if the class extends another class?
				$properties = $v->getProperties(false, false, false);//not protected and private properties

				foreach((array) $properties as $property){
					if(!$property->isPrivate){
						$el = $this->addTypeElement($property->type, $property->name, $tag, $property->optional);
					}
				}
			}
		}
		return $complexTypeTag;
	}

	/**
	 * Adds an element tag beneath the parent and takes care
	 * of the type (XMLSchema type or complexType)
	 * @param string The datatype
	 * @param string Name of the element
	 * @param domNode The parent domNode
	 * @param boolean If the property is optional
	 * @return domNode
	 */
	public function addTypeElement($type, $name, $parent, $optional = false) {
		$el = $this->addElement("xsd:element", $parent);
		$el->setAttribute("name", $name);
		
		if($optional){//if it's an optional property, set minOccur to 0
			$el->setAttribute("minOccurs", "0");
			$el->setAttribute("maxOccurs", "1");
		}
		
		//check if XML Schema datatype
		if($t = $this->checkSchemaType(strtolower($type)))
				$el->setAttribute("type", "xsd:".$t);
		else{//no XML Schema datatype
			//if valueType==Array, then create anonymouse inline complexType (within element tag without type attribute)
			if(substr($type,-2) == '[]'){
				if($this->array_inline){
					$this->addComplexType($type, false, $el);
				}else{
					$name = substr($type, 0, -2)."Array";
					$el->setAttribute("type", "tns:".$name);
					$this->addComplexType($type, $name, false);
				}
			}else{
				if(substr($type,-4) == '[=>]'){
					$name = substr($type, 0, -4);
					$el->setAttribute("type", "apache:Map");
					if(!$this->checkSchemaType(strtolower($name))){
						$this->addComplexType($name, $name, false);
					}
				}else{
					//else, new complextype, outline (element with 'ref' attrib)
					$el->setAttribute("type", "tns:".$type);
					$this->addComplexType($type, $type);
				}
			}
		}
		return $el;
	}

	/**
	 * Creates an xmlSchema element for the given array
	 */
	public function addArray($type, $parent) {
		$cc = $this->addElement("xsd:complexContent", $parent);
		$rs = $this->addElement("xsd:restriction", $cc);
		$rs->setAttribute("base", "SOAP-ENC:Array");

		$type = (substr($type,-2) == '[]') ? substr($type, 0, (strlen($type)-2)) : substr($type, 6, (strlen($type)-7));
		$el = $this->addElement("xsd:attribute", $rs);
		$el->setAttribute("ref", "SOAP-ENC:arrayType");

		//check if XML Schema datatype
		if($t = $this->checkSchemaType(strtolower($type)))
				$el->setAttribute("wsdl:arrayType", "xsd:".$t."[]");
		else{//no XML Schema datatype
			//if valueType==Array, then create anonymouse inline complexType (within element tag without type attribute)
			if(substr($type,-2) == '[]'){
				$this->addComplexType($type, false, $el);
			}else{//else, new complextype, outline (element with 'ref' attrib)
				$el->setAttribute("wsdl:arrayType", "tns:".$type."[]");
				$this->addComplexType($type, $type);
			}
		}
		return $el;
	}
	
	/**
	 * Checks if the given type is a valid XML Schema type or can be casted to a schema type
	 * @param string The datatype
	 * @return string
	 */
	public static function checkSchemaType($type) {
		//XML Schema types
		$types = Array("string" => "string",
			  "int" => "int",
			  "integer" => "int",
			  "boolean" => "boolean",
			  "float" => "float");
		if(isset($types[$type])) return $types[$type];
		else return false;
	}

	/**
	 * Adds an child element to the parent
	 * @param string
	 * @param domNode
	 * @return domNode
	 */
	private function addElement($name, $parent = false, $ns = false) {
		if($ns)
			$el = $parent->ownerDocument->createElementNS($ns, $name);
		else
			$el = $parent->ownerDocument->createElement($name);
		if($parent)
			$parent->appendChild($el);
		return $el;
	}
}
?>