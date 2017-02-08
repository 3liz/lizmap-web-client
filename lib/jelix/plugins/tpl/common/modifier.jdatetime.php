<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @contributor Emmanuel Hesry, Julien Issler, Briceg
* @copyright   2006 Laurent Jouanneau
* @copyright   2009 Emmanuel Hesry
* @copyright   2010 Julien Issler, 2011 Briceg
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * modifier plugin : change the format of a date
 *
 * It uses jDateTime to convert a date. It takes two optionnal arguments.
 * The first one is the format identifier of the given date (by default, it is db_datetime).
 * The second one is the format identifier of the output date (by default, it is lang_date).
 *
 * Availabled format identifiers are (with the equivalent constant of jDateTime)  :
 * <ul>
 * <li>'lang_date' (jDateTime::LANG_DFORMAT)</li>
 * <li>'lang_datetime' => jDateTime::LANG_DTFORMAT)</li>
 * <li>'lang_time' => jDateTime::LANG_TFORMAT)</li>
 * <li>'db_date' => jDateTime::DB_DFORMAT)</li>
 * <li>'db_datetime' => jDateTime::DB_DTFORMAT)</li>
 * <li>'db_time' => jDateTime::DB_TFORMAT)</li>
 * <li>'iso8601' => jDateTime::ISO8601_FORMAT)</li>
 * <li>'timestamp' => jDateTime::TIMESTAMP_FORMAT)</li>
 * <li>'rfc822'=> jDateTime::RFC822_FORMAT)</li>
 * <li>'full_lang_date'=> jDateTime::FULL_LANG_DATE</li></ul>
 *
 * examples :
 *  {$mydate|jdatetime}
 *  {$mydate|jdatetime:'db_time':'lang_time'}
 *
 * @param string $date the date
 * @param string $format_in the format identifier of the given date
 * @param string $format_out the format identifier of the output date
 * @return string the converted date
 * @throws jException
 * @see jDateTime
 */
function jtpl_modifier_common_jdatetime($date, $format_in = 'db_datetime',
                                 $format_out = 'lang_date') {
    if(is_null($date))
        return '';
    $formats = array(
        'lang_date' => jDateTime::LANG_DFORMAT,
        'lang_datetime' => jDateTime::LANG_DTFORMAT,
        'lang_time' => jDateTime::LANG_TFORMAT,
    	'lang_short_datetime' => jDateTime::LANG_SHORT_DTFORMAT,
        'db_date' => jDateTime::DB_DFORMAT,
        'db_datetime' => jDateTime::DB_DTFORMAT,
        'db_time' => jDateTime::DB_TFORMAT,
        'iso8601' => jDateTime::ISO8601_FORMAT,
        'timestamp' => jDateTime::TIMESTAMP_FORMAT,
        'rfc822'=> jDateTime::RFC822_FORMAT,
        'full_lang_date'=> jDateTime::FULL_LANG_DATE
        );

    if (isset($formats[$format_in])) { $format_in = $formats[$format_in]; }
    if (isset($formats[$format_out])) { $format_out = $formats[$format_out]; }
    
    $ret = false;
    $dt = new jDateTime();
    if ($dt->setFromString($date, $format_in)) {
        $ret = $dt->toString($format_out);
    }

    if ($ret == false) {
        throw new jException("jelix~errors.tpl.tag.modifier.invalid", array('','jdatetime',''));
    }

    return $ret;
}

