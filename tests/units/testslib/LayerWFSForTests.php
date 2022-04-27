<?php

class LayerWFSForTests
{
    public $provider = 'ogr';

    public $dtparams = array('key' => 'id');

    public function getSrid()
    {
        return 'SRID';
    }

    public function getProvider()
    {
        return $this->provider;
    }

    public function getDatasourceParameters()
    {
        return (object) $this->dtparams;
    }
}
