<?php
/**
 * An extended reflection/documentation class for classes
 *
 * This class extends the reflectionClass class by also parsing the
 * comment for javadoc compatible @tags and by providing help
 * functions to generate a WSDL file. THe class might also
 * be used to generate a phpdoc on the fly
 *
 * @version 0.1
 * @author David Kingma
 * @extends reflectionClass
 * Modified by sylvain261 in order to add the alsoHerited param to getMethods and getProperties methods
 * Modified by sylvain261 in order to remove __constuct method in getMethods 
 */
class IPReflectionClass extends reflectionClass {
	/** @var string class name */
	public $classname = null;

	/** @var string */
	public $fullDescription = "";

	/** @var string */
	public $smallDescription = "";

	/** @var IPReflectionMethod[] */
	public $methods = Array();

	/** @var IPReflectionProperty[] */
	public $properties = Array();

	/** @var string */
	public $extends;

	/** @var string */
	private $comment = null;
	

	/**
	 * Constructor
	 *
	 * sets the class name and calls the constructor of the reflectionClass
	 *
	 * @param string The class name
	 * @return void
	 */
	public function __construct($classname){
		$this->classname = $classname;
		parent::__construct($classname);
		
		$this->parseComment();
	}

	/**
	 *Levert een array met alle methoden van deze class op
	 *
	 * @param boolean If the method should also return protected functions
	 * @param boolean If the method should also return private functions
	 * @return IPReflectionMethod[]
	 */
	public function getMethods($alsoProtected = true, $alsoPrivate = true, $alsoHerited = false){
		$ar = parent::getMethods();
		foreach($ar as $method){
			if($method->name == '__construct')
				continue;
			$m = new IPReflectionMethod($this->classname, $method->name);
			if((!$m->isPrivate() || $alsoPrivate) && (!$m->isProtected() || $alsoProtected) && (($m->getDeclaringClass()->name == $this->classname) || $alsoHerited))
				$this->methods[$method->name] = $m;
		}
		ksort($this->methods);
		return $this->methods;
	}

	/**
	 * Levert een array met variabelen van deze class op
	 *
	 * @param boolean If the method should also return protected properties
	 * @param boolean If the method should also return private properties
	 * @return IPReflectionProperty[]
	 */
	public function getProperties($alsoProtected=true,$alsoPrivate=true, $alsoHerited = false) {
		$ar = parent::getProperties();
		$this->properties = Array();
		foreach($ar as $property){
			if((!$property->isPrivate() || $alsoPrivate) && (!$property->isProtected() || $alsoProtected) && (($property->getDeclaringClass()->name == $this->classname) || $alsoHerited)){
				try{
					$p = new IPReflectionProperty($this->classname, $property->getName());
					$this->properties[$property->name]=$p;
				}catch(ReflectionException $exception){
					echo "Fout bij property: ".$property->name."<br>\n";
				}
			}
		}
		ksort($this->properties);
		return $this->properties;
	}

	/**
	 * 	
	 * @param $annotationName String the annotation name
	 * @param $annotationClass String the annotation class
	 * @return void
	 */
	public function getAnnotation($annotationName, $annotationClass = null){
		return IPPhpDoc::getAnnotation($this->comment, $annotationName, $annotationClass);
	}
	
	/**
	 * Gets all the usefull information from the comments
	 * @return void
	 */
	private function parseComment() {
		$this->comment = $this->getDocComment();
		new IPReflectionCommentParser($this->comment, $this);
	}
}
?>