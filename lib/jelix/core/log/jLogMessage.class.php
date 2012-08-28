<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2006-2010 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * class that handles a simple message for a logger
 */
class jLogMessage implements jILogMessage {
    /**
     * @var string the category of the message
     */
    protected $category;

    /**
     * @var string the message
     */
    protected $message;

    public function __construct($message, $category='default') {
        $this->category = $category;
        $this->message = $message;
    }

    public function getCategory() {
        return $this->category;
    }

    public function getMessage() {
        return $this->message;
    }

    public function getFormatedMessage() {
        return $this->message;
    }
}

/**
 * class that handles a dump of a php value, for a logger
 */
class jLogDumpMessage  extends jLogMessage {
    /**
     * @var string the additionnal label
     */
    protected $label;

    public function __construct($obj, $label='', $category='default') {
        $this->message = var_export($obj,true);
        $this->category = $category;
        $this->label = $label;
    }

    public function getLabel() {
        return $this->label;
    }

    public function getFormatedMessage() {
        if ($this->label) {
            return $this->label.': '.$this->message;
        }
        return $this->message;
    }
}

