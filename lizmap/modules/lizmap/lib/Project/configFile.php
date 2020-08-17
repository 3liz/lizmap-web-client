<?php

namespace Lizmap\Project;

class configFile
{
    protected $data;

    public function __construct($cfgFile)
    {
        $this->data = json_decode($cfgFile);
        if (!$this->data) {
            return null;
        }
    }

    public function getProperty($propName)
    {
        if (isset($this->data->$propName)) {
            return $this->data->propName;
        } else {
            return null;
        }
    }

    public function &getEditableProperty($propName)
    {
        if (property_exists($this->data, $propName)) {
            return $this->data->$propName;
        } else {
            return null;
        }
    }

    public function unsetPropAfterRead();
    {
         //unset cache for editionLayers
         if (property_exists($this->data, 'editionLayers')) {
            foreach ($this->data->editionLayers as $key => $obj) {
                if (property_exists($this->data->layers, $key)) {
                    $this->data->layers->{$key}->cached = 'False';
                    $this->data->layers->{$key}->clientCacheExpiration = 0;
                    if (property_exists($this->data->layers->{$key}, 'cacheExpiration')) {
                        unset($this->data->layers->{$key}->cacheExpiration);
                    }
                }
            }
        }
        //unset cache for loginFilteredLayers
        if (property_exists($this->data, 'loginFilteredLayers')) {
            foreach ($this->data->loginFilteredLayers as $key => $obj) {
                if (property_exists($this->data->layers, $key)) {
                    $this->data->layers->{$key}->cached = 'False';
                    $this->data->layers->{$key}->clientCacheExpiration = 0;
                    if (property_exists($this->data->layers->{$key}, 'cacheExpiration')) {
                        unset($this->data->layers->{$key}->cacheExpiration);
                    }
                }
            }
        }
        //unset displayInLegend for geometryType none or unknown
        foreach ($this->data->layers as $key => $obj) {
            if (property_exists($this->data->layers->{$key}, 'geometryType') &&
                 ($this->data->layers->{$key}->geometryType == 'none' ||
                     $this->data->layers->{$key}->geometryType == 'unknown')
            ) {
                $this->data->layers->{$key}->displayInLegend = 'False';
            }
        }
    }
}