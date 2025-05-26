<?php

use LizmapApi\Utils;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class UtilsAPITest extends TestCase
{
    public function testIsValidBooleanValue(): void
    {
        $this->assertTrue(Utils::isValidBooleanValue(true));
        $this->assertTrue(Utils::isValidBooleanValue('true'));
        $this->assertTrue(Utils::isValidBooleanValue('t'));
        $this->assertTrue(Utils::isValidBooleanValue('1'));
        $this->assertTrue(Utils::isValidBooleanValue(1));
        $this->assertFalse(Utils::isValidBooleanValue(false));
        $this->assertFalse(Utils::isValidBooleanValue('false'));
        $this->assertFalse(Utils::isValidBooleanValue('no'));
    }
}
