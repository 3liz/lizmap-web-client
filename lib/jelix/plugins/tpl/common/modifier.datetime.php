<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @contributor   Philippe Villiers
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * modifier plugin : change the format of a date.
 *
 * The date can be given as a string, or as a DateTime object.
 *
 * It uses DateTime to convert a date. It takes two optionnal arguments.
 * The first one is the format of the output date. It should be a format understood by DateTime,
 * or one of this format identifier: 'lang_date', 'lang_datetime', 'lang_time', 'lang_long_datetime'.
 * By default, it use the locale datetime format. 
 * The second one is the format of the given date, if the date format is not understood by DateTime.
 *
 * examples :
 *  {$mydate|datetime}
 *  {$mydate|datetime:'dd/mm/YY'}
 *
 * @param string $date the date
 * @param string $format_in  the format identifier of the given date
 * @param string $format_out the format identifier of the output date
 * @return string the converted date
 * @see jDateTime
 */
function jtpl_modifier_common_datetime($date, $format_out = 'lang_datetime', $format_in='') {
    if (!($date instanceof DateTime)) {
        if ($date == '' || $date == "0000/00/00") {
            return '';
        }
        if ($format_in) {
            $date = date_create_from_format($format_in, $date);
        }
        else {
            $date = new DateTime($date);
        }
        if (!$date) {
            return '';
        }
    }

    $format = array(
        'lang_date' =>'jelix~format.date',
        'lang_datetime' =>'jelix~format.short_datetime',
        'lang_time' =>'jelix~format.time',
        'lang_long_datetime' =>'jelix~format.datetime',
    );

    if (isset($format[$format_out])) {
        $format_out = jLocale::get($format[$format_out]);
    }
    return $date->format($format_out);
}

