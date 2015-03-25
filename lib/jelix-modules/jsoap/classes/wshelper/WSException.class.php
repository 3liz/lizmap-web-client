<?php 
/**
 * Exception class which can be thrown by
 * the WSHelper class.
 */
class WSException extends Exception { 
 	/** 
 	 * @param string The error message
 	 * @return void 
 	 */
	public function __construct($msg) { 
		$this->msg = $msg; 
	} 
 	/** 
 	 * @return void 
 	 */
 	public function Display() { 
		echo $this->msg; 
	} 
} 
?>