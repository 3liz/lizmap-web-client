<?php


class ProjectForOGCForTests extends ProjectForTests
{
    public $loginFilters;

    public function getRelativeQgisPath()
    {
    }

    public function getLoginFilters($layerName, $edition = false)
    {
        return $this->loginFilters;
    }

    public function setData($key, $value)
    {
        $this->data[$key] = $value;
    }
}
