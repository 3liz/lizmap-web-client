<?php

/**
 * XML tools for Lizmap.
 *
 * @author    3liz
 * @copyright 2021 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

class XmlTools
{
    /**
     * Interprets a string of XML into an object.
     *
     * @param string $xml_str a well-formed XML string
     *
     * @return \SimpleXmlElement|string an object of class SimpleXMLElement with properties
     *                                  containing the data held within the XML document, or
     *                                  a string containing the error message
     */
    public static function xmlFromString($xml_str)
    {
        $use_errors = libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xml_str);
        if (!$xml) {
            return self::xmlErrorMsg();
        }

        return $xml;
    }

    /**
     * Interprets an XML file into an object.
     *
     * @param string $xml_path the path to the xml file
     *
     * @return \SimpleXmlElement|string an object of class SimpleXMLElement with properties
     *                                  containing the data held within the XML document, or
     *                                  a string containing the error message
     */
    public static function xmlFromFile($xml_path)
    {
        $use_errors = libxml_use_internal_errors(true);
        $xml = simplexml_load_file($xml_path);
        if (!$xml) {
            return self::xmlErrorMsg();
        }

        return $xml;
    }

    /**
     * Get XML error message.
     *
     * Build an error message based on LibXMLError object
     *
     * @return string the error message
     */
    private static function xmlErrorMsg()
    {
        $msg = '';
        foreach (libxml_get_errors() as $error) {
            if ($msg !== '') {
                $msg .= '\n';
            }

            switch ($error->level) {
                case LIBXML_ERR_WARNING:
                    $msg .= 'Warning '.$error->code.': ';

                    break;

                case LIBXML_ERR_ERROR:
                    $msg .= 'Error '.$error->code.': ';

                    break;

                case LIBXML_ERR_FATAL:
                    $msg .= 'Fatal Error '.$error->code.': ';

                    break;
            }
            $msg .= 'Line: '.$error->line.' ';
            $msg .= 'Column: '.$error->column.' ';
            $msg .= trim($error->message);
        }
        // Clear libxml error buffer
        libxml_clear_errors();

        return $msg;
    }

    /**
     * Interprets a string of XML into an XML Pull parser.
     * It acts as a cursor going forward on the document stream and stopping at each node on the way.
     *
     * @param string $xml_str a well-formed XML string
     *
     * @return \XMLReader an object of class XMLReader with properties at the root document element
     *                    containing the data held within the XML document
     */
    public static function xmlReaderFromString($xml_str)
    {
        $oXml = new \XMLReader();
        // Set XML
        if (!$oXml->XML($xml_str)) {
            throw new \Exception(self::xmlErrorMsg());
        }

        // Read until we are at the root document element
        while ($oXml->read()) {
            if ($oXml->nodeType == \XMLReader::ELEMENT
                && $oXml->depth == 0) {
                break;
            }
        }

        $errorMsg = self::xmlErrorMsg();
        if ($errorMsg !== '') {
            throw new \Exception($errorMsg);
        }

        return $oXml;
    }

    /**
     * Interprets an XML file into an XML pull parser.
     * It acts as a cursor going forward on the document stream and stopping at each node on the way.
     *
     * @param string $xml_path the path to the xml file
     *
     * @return \XMLReader an object of class XMLReader with properties at the root document element
     *                    containing the data held within the XML document
     */
    public static function xmlReaderFromFile($xml_path)
    {
        $oXml = new \XMLReader();

        // Open file
        if (!$oXml->open($xml_path)) {
            throw new \Exception(self::xmlErrorMsg());
        }

        // Read until we are at the root document element
        while ($oXml->read()) {
            if ($oXml->nodeType == \XMLReader::ELEMENT
                && $oXml->depth == 0) {
                break;
            }
        }

        $errorMsg = self::xmlErrorMsg();
        if ($errorMsg !== '') {
            throw new \Exception($errorMsg);
        }

        return $oXml;
    }
}
