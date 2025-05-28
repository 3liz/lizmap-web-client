<?php

/**
 * Event for metadata.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Events;

class LizmapMetadataEvent extends \jEvent
{
    public function __construct()
    {
        parent::__construct('LizmapMetadata');
        $this->_responses = array(
            array(),
        );
    }

    /**
     * @param mixed $key
     * @param mixed $value
     */
    public function addMetadata($key, $value)
    {
        $this->_responses[0][$key] = $value;
    }

    /**
     * @return array
     */
    public function getMetadata()
    {
        return $this->_responses[0];
    }
}
