<?php

/**
 * Base QGIS Object.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

/*use ArrayAccess;
use ArrayIterator;
use Traversable;
use Countable;
use IteratorAggregate;*/

interface BaseQgisInterface
{
    public function __construct(array $data);

    public function __get(mixed $property): mixed;

    public function __isset(mixed $property): bool;
}

/**
 * Base QGIS Object to be extended.
 */
class BaseQgisObject implements BaseQgisInterface, \JsonSerializable // ArrayAccess, Countable, IteratorAggregate,
{
    /** @var array<string> The instance properties */
    protected $properties = array();

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array();

    /** @var array The default values for properties */
    protected $defaultValues = array();

    /** @var array The instance data for properties */
    private $data = array();

    /**
     * Base QGIS object constructor.
     *
     * @param array $data the instance data
     */
    public function __construct($data)
    {
        $newData = array_replace($this->defaultValues, $data);
        if (count(array_diff_key(array_flip($this->mandatoryProperties), $newData)) !== 0) {
            $exStr = '$data has to contain `'.implode('`, `', $this->mandatoryProperties).'` keys!';
            $exStr .= ' Missing keys: '.implode(', ', array_keys(array_diff_key(array_flip($this->mandatoryProperties), $newData))).'!';

            throw new \Exception($exStr);
        }
        $this->set($newData);
    }

    public function __get(mixed $property): mixed
    {
        if (!empty($this->properties)
            && !in_array($property, $this->properties)) {
            throw new \Exception(get_class($this)." no such property `{$property}`.");
        }

        if (array_key_exists($property, $this->data)) {
            return $this->data[$property];
        }

        if (!empty($this->properties)) {
            return null;
        }

        throw new \Exception(get_class($this)." no such property `{$property}`.");
    }

    public function __isset(mixed $property): bool
    {
        return isset($this->data[$property]);
    }

    /*public function offsetExists(mixed $key): bool
    {
        return isset($this->data[$key]);
    }*/

    /*public function offsetGet(mixed $key): mixed
    {
        return $this->data[$key];
    }*/

    final public function __set(string $key, $val): void
    {
        throw new \Exception('immutable');
    }

    final public function __unset(string $key): void
    {
        throw new \Exception('immutable');
    }

    /*final public function offsetSet(mixed $key, mixed $value): void
    {
        throw Exception('immutable');
    }*/

    /*final public function offsetUnset(mixed $key): void
    {
        throw Exception('immutable');
    }*/

    /*public function count(): int
    {
        return count($this->data);
    }*/

    /*public function getIterator(): Traversable
    {
        return new ArrayIterator($this->data);
    }*/

    public function jsonSerialize(): mixed
    {
        return $this->getData();
    }

    protected function arrayToData($vArray): array
    {
        $data = array();
        foreach ($vArray as $k => $v) {
            if ($v instanceof BaseQgisObject) {
                $data[$k] = $v->getData();
            } elseif (is_array($v)) {
                $data[$k] = $this->arrayToData($v);
            } else {
                $data[$k] = $v;
            }
        }

        return $data;
    }

    public function getData(): array
    {
        $data = array();
        foreach ($this->properties as $property) {
            if (!array_key_exists($property, $this->data)) {
                continue;
            }
            $value = $this->data[$property];
            if ($value instanceof BaseQgisObject) {
                $data[$property] = $value->getData();
            } elseif (is_array($value)) {
                $data[$property] = $this->arrayToData($value);
            } else {
                $data[$property] = $value;
            }
        }

        return $data;
    }

    protected function set(array $data): void
    {
        foreach ($data as $property => $value) {
            if (!empty($this->properties)
                && !in_array($property, $this->properties)) {
                continue;
            }
            $this->data[$property] = $value;
        }
    }
}
