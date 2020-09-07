<?php

require_once JELIX_LIB_PATH.'forms/jFormsDatasource.class.php';

class listProjectDatasource extends jFormsDynamicDatasource
{
    protected $formId = 0;
    protected $criteriaFrom = array('defaultRepository');
    protected $data = array();

    public function __construct($id)
    {
        $this->formId = $id;
        foreach (lizmap::getRepositoryList() as $repo) {
            $this->data[$repo] = $repo;
        }
    }

    public function getData($form)
    {
        $pdata = array();
        $criteria = $form->getData($this->criteriaFrom[0]);
        if ($criteria && array_key_exists($criteria, $this->data)) {
            $rep = lizmap::getRepository($criteria);
            $projects = $rep->getProjects();
            foreach ($projects as $p) {
                $pOptions = $p->getOptions();
                if (property_exists($pOptions, 'hideProject') && $pOptions->hideProject == 'True') {
                    continue;
                }
                $pdata[$p->getData('id')] = (string) $p->getData('title');
            }
        }

        return $pdata;
    }

    public function getLabel2($key, $form)
    {
        $criteria = $form->getData($this->criteriaFrom[0]);
        if ($criteria && array_key_exists($criteria, $this->data)) {
            try {
                $p = lizmap::getProject($criteria.'~'.$key);
                if ($p) {
                    return (string) $p->getData('title');
                }
            } catch (UnknownLizmapProjectException $e) {
                jLog::logEx($e, 'error');

                return null;
            }
        }

        return null;
    }
}
