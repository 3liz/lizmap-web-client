<?php
/**
 * Class for parsing the comment blocks for classes, functions
 * methods and properties.
 *
 * The class parses the commentblock and extracts certain
 * documentation tags and the (full/small) description
 *
 * @author David Kingma
 * @version 0.1
 */
 
class IPReflectionCommentParser{
	/**
	 * @var string Contains the full commen text
	 */
	public $comment;

	/**
	 * @var object refence to the IPReflection(Class|Method|Property)
	 */
	public $obj;

	/** @var boolean */
	public $smallDescriptionDone;
	
	/** @var boolean */
	public $fullDescriptionDone;

	/**
	 * Constructor, initiateds the parse function
	 *
	 * @param string Commentaar block
	 * @param string Defines if its the comment for a class, public of function
	 */
	function __construct($comment, $obj) {
		$this->comment	= $comment;
		$this->obj		= $obj;
		$this->parse();
	}
	/**
	 * parses the comment, line for line
	 *
	 * Will take the type of comment (class, property or function) as an
	 * argument and split it up in lines.
	 * @param string Defines if its the comment for a class, public of function
	 * @return void
	 */
	function parse() {
		//reset object
		$descriptionDone = false;
		$this->fullDescriptionDone = false;

		//split lines
		$lines = explode("\n", $this->comment);

		//check lines for description or tags
		foreach ($lines as $l) {
		    // new version of parser - optimisation and debug for indentation with tabs or multiples spaces
		    // first we trim
		    $line = trim($l);
            //skip the start and end line
            if (($line != "/**") && ($line != "*/")){
                // is a param line?		                    
                if (strpos($line,"* @") !== false) {
			        $this->parseTagLine(substr($line,3));
			        $descriptionDone=true;
			    }elseif(!$descriptionDone){
			        // if we do not already read a param, we are in the short or full description, starting with "* "
			        // if $line is empty or less than 2 :
			        // PHP 5.2.2 - 5.2.6  If the start parameter indicates the position of a negative truncation or beyond, false is returned. Other versions get the string from start.
			        $this->parseDescription(substr($line,2));
			    }
			
            }
        }
		//if full description is empty, put small description in full description
		if (trim($this->obj->fullDescription)=="")
	    $this->obj->fullDescription = $this->obj->smallDescription;
	}

	/**
	 * Parses the description to the small and full description properties
	 *
	 * @param string The description line
	 * @return void
	 */
	function parseDescription($descriptionLine) {		
	 	//geen lege comment regel indien al in grote omschrijving
	 	if($descriptionLine == ""){
	 		if($this->obj->fullDescription == "")
	 			$descriptionLine = "";
			$this->smallDescriptionDone = true;
		}

		if(!$this->smallDescriptionDone)//add to small description
			$this->obj->smallDescription.=$descriptionLine;
		else{//add to full description
			$this->obj->fullDescription.=$descriptionLine;
		}
	 }
	 
	/**
	 * Parses a tag line and extracts the tagname and values
	 *
	 * @param string The tagline
	 * @return void
	 */
	function parseTagLine($tagLine) {
		$tagArr = explode(" ", $tagLine);
		$tag = $tagArr[0];

		switch(strtolower($tag)){
			case 'abstract':
				$this->obj->abstract = true; break;
			case 'access':
				$this->obj->isPrivate = (strtolower(trim($tagArr[1]))=="private")?true:false;
				break;
			case 'author':
				unset($tagArr[0]);
				$this->obj->author = implode(" ",$tagArr);
				break;
			case 'copyright':
				unset($tagArr[0]);
				$this->obj->copyright = implode(" ",$tagArr);
				break;
			case 'deprecated':
			case 'deprec':
				$this->obj->deprecated = true;
				break;
			case 'extends': break;
			case 'global':
				$this->obj->globals[] = $tagArr[1];
				break;
			case 'param':
				$o = new stdClass();
				$o->type = trim($tagArr[1]);
				$o->name= str_replace('$', '', trim($tagArr[2]));
				$o->comment = implode(" ",$tagArr);
				$this->obj->parameters[$o->name] = $o;
				break;
			case 'return':
				$this->obj->return = trim($tagArr[1]); break;
			case 'link':break;
			case 'see':break;
			case 'since':
				$this->obj->since = trim($tagArr[1]); break;
			case 'static':
				$this->obj->static = true; break;
			case 'throws':
				unset($tagArr[0]);
				$this->obj->throws = implode(" ",$tagArr);
				break;
			case 'todo':
				unset($tagArr[0]);
				$this->obj->todo[] = implode(" ",$tagArr);
				break;
			case 'var':
				$this->obj->type = trim($tagArr[1]);
				unset($tagArr[0],$tagArr[1]);
				$comment=implode(" ",$tagArr);
				//check if its an optional property
				$this->obj->optional = strpos($comment,"[OPTIONAL]") !== FALSE;
				$this->obj->autoincrement = strpos($comment,"[AUTOINCREMENT]") !== FALSE;
				$this->obj->description = str_replace("[OPTIONAL]", "", $comment);
				break;
			case 'version':
				$this->obj->version = $tagArr[1];
				break;
			default:
			  //echo "\nno valid tag: '".strtolower($tag)."' at tagline: '$tagLine' <br>";
				//do nothing
		}
	}
}
?>
