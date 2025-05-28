<?php

namespace LizmapAdmin\ModulesInfo;

class ModuleMetaData
{
    private $slug;
    private $version;
    private $isCore;

    public function __construct($slug, $version, $core)
    {
        $this->slug = $slug;
        $this->version = $version;
        $this->isCore = $core;
    }

    public function __get($name)
    {
        if (in_array($name, array('slug', 'version', 'isCore'))) {
            return $this->{$name};
        }

        throw new \DomainException();
    }

    public function __toString()
    {
        return $this->slug;
    }
}
