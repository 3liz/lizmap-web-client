<?php

class listRepositoryDatasource implements jIFormsDatasource
{
    protected $formId = 0;

    protected $data = array();

    public function __construct($id)
    {
        $this->formId = $id;
        $mydata = array();
        foreach (lizmap::getRepositoryList() as $repo) {
            $rep = lizmap::getRepository($repo);
            $mydata[$repo] = (string) $rep->getLabel();
        }
        $this->data = $mydata;
    }

    public function getData($form)
    {
        return $this->data;
    }

    public function getLabel($key)
    {
        if (isset($this->data[$key])) {
            return $this->data[$key];
        }

        return '';
    }
}
