<?php

use Lizmap\Project\UnknownLizmapProjectException;

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

    /**
     * @param jFormsBase $form
     *
     * @return array
     */
    public function getData($form)
    {
        $pdata = array();
        $criteria = $form->getData($this->criteriaFrom[0]);
        if ($criteria && array_key_exists($criteria, $this->data)) {
            $rep = lizmap::getRepository($criteria);
            // Get projects metadata
            $metadata = $rep->getProjectsMainData();
            foreach ($metadata as $meta) {
                if ($meta->getHidden()) {
                    continue;
                }
                $pdata[$meta->getId()] = $meta->getTitle();
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
                    return (string) $p->getTitle();
                }
            } catch (UnknownLizmapProjectException $e) {
                jLog::logEx($e, 'error');

                return '';
            }
        }

        return '';
    }
}
