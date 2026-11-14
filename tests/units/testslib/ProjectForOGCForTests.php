<?php

class ProjectForOGCForTests extends ProjectForTests
{
    public $loginFilters;

    public function getRelativeQgisPath() {}

    /**
     * Get the filters by login set for the tests.
     *
     * @param string[] $layers  the layers' name list
     * @param bool     $edition get login filters for edition
     * @param bool     $forSql  get the SQL filters run by Lizmap
     *
     * @return array the filters by login
     */
    public function getLoginFilters($layers, $edition = false, $forSql = false)
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
