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

    protected $testWMSMaxWidth;
    protected $testWMSMaxHeight;

    public function setWMSMaxWidthHeight($w, $h)
    {
        $this->testWMSMaxHeight = $h;
        $this->testWMSMaxWidth = $w;
    }

    public function getWMSMaxWidth()
    {
        return $this->testWMSMaxWidth;
    }

    /**
     * WMS Max Height.
     *
     * @return int
     */
    public function getWMSMaxHeight()
    {
        return $this->testWMSMaxHeight;
    }
}
