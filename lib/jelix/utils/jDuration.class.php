<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Florian Hatat
* @contributor Laurent Jouanneau
* @copyright   2008 Florian Hatat, 2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * Utility to manipulate durations between two instants
 * @package     jelix
 * @subpackage  utils
 */
class jDuration {
    public $months;
    public $days;
    public $seconds;

    /**
     * Construct a new duration.
     * You can specify the duration as a number of seconds, or as an associative 
     * array which may contain the keys "year", "month", "day", "hour", "minute" 
     * and "second". The former method defines an absolute duration (it will 
     * always add the same number of seconds to any given date/time), while the 
     * latter defines a relative duration (a duration of one month will for 
     * example represent different amounts of time depending on the start date).
     *
     * This class represents years as 12 months, minutes as 60 seconds and hours 
     * as 3600 seconds. There is no general conversion between months and days, 
     * nor between days and hours (because of DST).
     *
     * @param int,array $init representation of the duration as an absolute number of seconds, or an array.
     */
    function __construct($init = 0){
        $this->days = $this->months = $this->seconds = 0;

        if(is_array($init)){
            if(isset($init['year'])){
                $this->months += intval($init['year']) * 12;
            }

            if(isset($init['month'])){
                $this->months += intval($init['month']);
            }

            if(isset($init['day'])){
                $this->days += intval($init['day']);
            }

            if(isset($init['hour'])){
                $this->seconds += intval($init['hour']) * 3600;
            }

            if(isset($init['minute'])){
                $this->seconds += intval($init['minute']) * 60;
            }

            if(isset($init['second'])){
                $this->seconds += intval($init['second']);
            }
        }
        elseif (is_int($init)) {
            if ($init > 86400) {
                $this->days = intval($init/86400);
                $this->seconds = $init % 86400;
            }
            else {
                $this->seconds = $init;
            }
        }
    }

    /**
     * Add a duration to the current duration
     * @param jDuration $data the duration value
     */
    function add(jDuration $data){
        $this->days += $data->days;
        $this->months += $data->months;
        $this->seconds += $data->seconds;
    }

    /**
     * Multiply the current duration by an integer
     * @param int $scale the scaling integer
     */
    function mult($scale){
        if(is_int($scale)){
            $this->days *= $scale;
            $this->months *= $scale;
            $this->seconds *= $scale;
        }
    }
}
