<?php

/**
 * Exception for the Qgis connection string parser.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

class QgisConnectionStringParserException extends \DomainException
{
    protected $validParameters = array();

    public function __construct(string $message = '', int $code = 0, $validParameters = array())
    {
        parent::__construct($message, $code);
        $this->validParameters = $validParameters;
    }

    /**
     * @return array list of parameters that the parser successfully parsed before reaching the syntax error
     */
    public function getValidParameters(): array
    {
        return $this->validParameters;
    }
}
