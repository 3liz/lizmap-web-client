<?php

use Lizmap\Logger\Logger;
use PHPUnit\Framework\TestCase;
use Psr\Log\InvalidArgumentException;
use Psr\Log\LogLevel;

/**
 * @internal
 *
 * @coversNothing
 */
class LoggerTest extends TestCase
{
    public function testDefault(): void
    {
        $logger = new Logger();
        $this->assertInstanceOf(Logger::class, $logger);
        $this->assertEquals(Logger::DefaultLevel, $logger->getLevel());
        $this->assertEquals(LogLevel::ERROR, $logger->getLevel());

        $this->assertTrue($logger->isLevelHighEnough('error'));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::EMERGENCY));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::CRITICAL));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::ALERT));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::ERROR));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::WARNING));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::NOTICE));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::INFO));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::DEBUG));

        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[0]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[1]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[2]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[3]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[4]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[5]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[6]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[7]));
        $this->assertFalse($logger->isLevelHighEnough('default'));
    }

    public function testConstruct(): void
    {
        $logger = new Logger(LogLevel::EMERGENCY);
        $this->assertInstanceOf(Logger::class, $logger);
        $this->assertEquals(LogLevel::EMERGENCY, $logger->getLevel());
        $this->assertNotEquals(Logger::DefaultLevel, $logger->getLevel());

        $this->assertTrue($logger->isLevelHighEnough('emergency'));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::EMERGENCY));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::CRITICAL));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::ALERT));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::ERROR));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::WARNING));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::NOTICE));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::INFO));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::DEBUG));

        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[0]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[1]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[2]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[3]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[4]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[5]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[6]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[7]));
        $this->assertFalse($logger->isLevelHighEnough('default'));

        $logger = new Logger(LogLevel::DEBUG);
        $this->assertInstanceOf(Logger::class, $logger);
        $this->assertEquals(LogLevel::DEBUG, $logger->getLevel());
        $this->assertNotEquals(Logger::DefaultLevel, $logger->getLevel());

        $this->assertTrue($logger->isLevelHighEnough('debug'));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::EMERGENCY));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::CRITICAL));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::ALERT));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::ERROR));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::WARNING));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::NOTICE));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::INFO));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::DEBUG));

        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[0]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[1]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[2]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[3]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[4]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[5]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[6]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[7]));
        $this->assertFalse($logger->isLevelHighEnough('default'));

        $logger = new Logger('warning');
        $this->assertInstanceOf(Logger::class, $logger);
        $this->assertEquals(LogLevel::WARNING, $logger->getLevel());
        $this->assertNotEquals(Logger::DefaultLevel, $logger->getLevel());

        $this->assertTrue($logger->isLevelHighEnough('error'));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::EMERGENCY));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::CRITICAL));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::ALERT));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::ERROR));
        $this->assertTrue($logger->isLevelHighEnough(LogLevel::WARNING));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::NOTICE));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::INFO));
        $this->assertFalse($logger->isLevelHighEnough(LogLevel::DEBUG));

        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[0]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[1]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[2]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[3]));
        $this->assertTrue($logger->isLevelHighEnough(Logger::LogLevels[4]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[5]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[6]));
        $this->assertFalse($logger->isLevelHighEnough(Logger::LogLevels[7]));
        $this->assertFalse($logger->isLevelHighEnough('default'));
    }

    public function testInvalidArgument(): void
    {
        $logger = new Logger();
        $this->assertInstanceOf(Logger::class, $logger);
        $this->expectException(InvalidArgumentException::class);
        $logger->log('invalid', 'message');

        $this->expectException(InvalidArgumentException::class);
        $logger->isLevelHighEnough('invalid');

        $this->expectException(InvalidArgumentException::class);
        $logger->setLevel('invalid');

        $this->expectException(InvalidArgumentException::class);
        $invalidLogger = new Logger('invalid');
    }
}
