<?php

require_once (JELIX_LIB_PATH.'forms/jFormsDatasource.class.php');

class listProjectDatasource extends jFormsDaoDatasource
{
  protected $formId = 0;
  protected $criteriaFrom = 'defaultRepository';
  protected $data = array();

  function __construct($id)
  {
    $this->formId = $id;
    $mydata = array();
    foreach(lizmap::getRepositoryList() as $repo)
      $mydata[$repo] = $repo;
    $this->data = $mydata;
  }

  public function getData($form)
  {
    $pdata = array();
    $criteria = $form->getData($this->criteriaFrom);
    if ( $criteria && array_key_exists($criteria, $this->data ) ) {
        $rep = lizmap::getRepository( $criteria );
        $projects = $rep->getProjects();
        foreach ($projects as $p) {
              $pOptions = $p->getOptions();
              if (property_exists($pOptions,'hideProject') && $pOptions->hideProject == 'True')
                continue;
            $pdata[ $p->getData('id') ] = (string)  $p->getData('title');
        }
    }
    return $pdata;
  }

  public function getLabel($key) {
      throw new Exception("should not be called");
  }

  public function getLabel2($key,$form)
  {
    $criteria = $form->getData($this->criteriaFrom);
    if ( $criteria && array_key_exists($criteria, $this->data ) ) {
        $p = lizmap::getProject( $criteria.'~'.$key );
        if ( $p )
          return (string) $p->getData('title');
    }
    return null;
  }

  public function getDependentControls() {
      return array($this->criteriaFrom);
  }
  
  public function hasGroupedData() {
      return $this->groupeBy;
  }

  public function setGroupBy($group) {
      $this->groupeBy = $group;
  }

}
