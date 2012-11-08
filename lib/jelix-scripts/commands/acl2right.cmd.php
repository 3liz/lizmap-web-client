<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2007-2012 Laurent Jouanneau, 2008 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class acl2rightCommand extends JelixScriptCommand {

    public  $name = 'aclright';
    public  $allowed_options=array('-defaultgroup'=>false);
    public  $allowed_parameters=array('action'=>true,'...'=>false);

    public  $syntaxhelp = " ACTION [arg1 [arg2 ...]]";
    public  $help=array(
        'fr'=>"
jAcl2 : gestion des droits

ACTION:
 * list
 * add groupid sujet [resource]
 * [-allres] remove groupid sujet [resource]
 * subject_create subject labelkey [grouplabelkey [label]]
 * subject_delete subject
 * subject_list
 * subject_group_list
 * subject_group_create group labelkey
 * subject_group_delete group labelkey

",
        'en'=>"
jAcl2: rights management

ACTION:
 * list
 * add  groupid subject [resource]
 * [-allres] remove groupid subject [resource]
 * subject_create subject labelkey [grouplabelkey [label]]
 * subject_delete subject
 * subject_list
 * subject_group_list
 * subject_group_create group labelkey
 * subject_group_delete group labelkey
",
    );

    protected $titles = array(
        'fr'=>array(
            'list'=>"Liste des droits",
            'add'=>"Ajout d'un droit",
            'remove'=>"Retire un droit",
            'subject_create'=>"Création d'un sujet",
            'subject_delete'=>"Effacement d'un sujet",
            'subject_list'=>"Liste des sujets",
            'subject_group_list'=>"Liste des groupes de sujets",
            'subject_group_create'=>"Ajout des groupes de sujets",
            'subject_group_delete'=>"Suppression des groupes de sujets",
            ),
        'en'=>array(
            'list'=>"Rights list",
            'add'=>"Add a right",
            'remove'=>"Remove a right",
            'subject_create'=>"Create a subject",
            'subject_delete'=>"Delete a subject",
            'subject_list'=>"List of subjects",
            'subject_group_list'=>"List of subject groups",
            'subject_group_create'=>"Add a subject group",
            'subject_group_delete'=>"Delete a subject group",
            ),
    );


    public function run(){
        $this->loadAppConfig();
        $action = $this->getParam('action');
        if(!in_array($action,array('list','add','remove',
                                   'subject_create','subject_delete','subject_list',
                                   'subject_group_create','subject_group_delete','subject_group_list',
                                   ))){
            throw new Exception("unknown subcommand");
        }

        $meth= 'cmd_'.$action;
        echo "----", $this->titles[$this->config->helpLang][$action],"\n\n";
        $this->$meth();
    }


    protected function cmd_list(){
        echo "group\tsubject\t\tresource\n---------------------------------------------------------------\n";
        echo "- anonymous group\n";

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="SELECT r.id_aclgrp, r.id_aclsbj, r.id_aclres, s.label_key as subject
                FROM ".$cnx->prefixTable('jacl2_rights')." r,
                ".$cnx->prefixTable('jacl2_subject')." s
                WHERE r.id_aclgrp = '__anonymous' AND r.id_aclsbj=s.id_aclsbj
                ORDER BY subject, id_aclres ";
        $rs = $cnx->query($sql);
        $sbj =-1;
        foreach($rs as $rec){
            if($sbj !=$rec->id_aclsbj){
                $sbj = $rec->id_aclsbj;
                echo "\t",$rec->id_aclsbj,"\n";
            }
            echo "\t\t",$rec->id_aclres,"\n";
        }

        $sql="SELECT r.id_aclgrp, r.id_aclsbj, r.id_aclres, name as grp, s.label_key as subject
                FROM ".$cnx->prefixTable('jacl2_rights')." r,
                ".$cnx->prefixTable('jacl2_group')." g,
                ".$cnx->prefixTable('jacl2_subject')." s
                WHERE r.id_aclgrp = g.id_aclgrp AND r.id_aclsbj=s.id_aclsbj
                ORDER BY grp, subject, id_aclres ";

        $rs = $cnx->query($sql);
        $grp=-1;
        $sbj =-1;
        foreach($rs as $rec){
            if($grp != $rec->id_aclgrp){
                echo "- group ", $rec->id_aclgrp, ' (', $rec->grp,")\n";
                $grp = $rec->id_aclgrp;
                $sbj = -1;
            }

            if($sbj !=$rec->id_aclsbj){
                $sbj = $rec->id_aclsbj;
                echo "\t",$rec->id_aclsbj,"\n";
            }
            echo "\t\t",$rec->id_aclres,"\n";
        }
    }

    protected function cmd_add(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) <2 || count($params) >3)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $group = $cnx->quote($this->_getGrpId($params[0]));

        $subject=$cnx->quote($params[1]);
        if(isset($params[2]))
            $resource = $cnx->quote($params[2]);
        else
            $resource = $cnx->quote('-');

        $sql="SELECT * FROM ".$cnx->prefixTable('jacl2_rights')."
                WHERE id_aclgrp=".$group."
                AND id_aclsbj=".$subject."
                AND id_aclres=".$resource;
        $rs = $cnx->query($sql);
        if($rs->fetch()){
            throw new Exception("right already sets");
        }

        $sql="SELECT * FROM ".$cnx->prefixTable('jacl2_subject')." WHERE id_aclsbj=".$subject;
        $rs = $cnx->query($sql);
        if(!($sbj = $rs->fetch())){
            throw new Exception("subject is unknown");
        }

        $sql="INSERT into ".$cnx->prefixTable('jacl2_rights')
            ." (id_aclgrp, id_aclsbj, id_aclres) VALUES (";
        $sql.=$group.',';
        $sql.=$subject.',';
        $sql.=$resource.')';

        $cnx->exec($sql);
        if ($this->verbose())
            echo "Right is added on subject $subject with group $group".(isset($params[2])?' and resource '.$resource:'')."\n";
    }

    protected function cmd_remove(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) <2 || count($params) >3)
            throw new Exception("wrong parameter count");

         $cnx = jDb::getConnection('jacl2_profile');

        $group = $cnx->quote($this->_getGrpId($params[0]));
        $subject=$cnx->quote($params[1]);
        if(isset($params[2]))
            $resource = $cnx->quote($params[2]);
        else
            $resource = $cnx->quote('-');

        $sql="SELECT * FROM ".$cnx->prefixTable('jacl2_rights')."
                WHERE id_aclgrp=".$group."
                AND id_aclsbj=".$subject;
        $sql.=" AND id_aclres=".$resource;

        $rs = $cnx->query($sql);
        if(!$rs->fetch()){
            throw new Exception("Error: this right is not set");
        }

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_rights')."
             WHERE id_aclgrp=".$group."
                AND id_aclsbj=".$subject;
        $sql.=" AND id_aclres=".$resource;
        $cnx->exec($sql);

        if ($this->verbose())
            echo "Right on subject $subject with group $group ".(isset($resource)?' and resource '.$resource:'')." is deleted \n";
    }

    protected function cmd_subject_list(){

        $cnx = jDb::getConnection('jacl2_profile');
        $sql="SELECT id_aclsbj, s.label_key, s.id_aclsbjgrp, g.label_key as group_label_key FROM "
           .$cnx->prefixTable('jacl2_subject')." s
           LEFT JOIN ".$cnx->prefixTable('jacl2_subject_group')." g
           ON (s.id_aclsbjgrp = g.id_aclsbjgrp) ORDER BY s.id_aclsbjgrp, id_aclsbj";
        $rs = $cnx->query($sql);
        $group = '';
        echo "subject group\n\tid\t\t\tlabel key\n--------------------------------------------------------\n";
        foreach($rs as $rec){
            if ($rec->id_aclsbjgrp != $group) {
                echo $rec->id_aclsbjgrp."\n";
                $group = $rec->id_aclsbjgrp;
            }
            echo "\t".$rec->id_aclsbj,"\t",$rec->label_key,"\n";
        }
    }

    protected function cmd_subject_create(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) > 4  || count($params) < 2)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="SELECT id_aclsbj FROM ".$cnx->prefixTable('jacl2_subject')
            ." WHERE id_aclsbj=".$cnx->quote($params[0]);
        $rs = $cnx->query($sql);
        if($rs->fetch()){
            throw new Exception("This subject already exists");
        }

        $sql="INSERT into ".$cnx->prefixTable('jacl2_subject')." (id_aclsbj, label_key, id_aclsbjgrp) VALUES (";
        $sql.=$cnx->quote($params[0]).',';
        $sql.=$cnx->quote($params[1]);
        if (isset($params[2]) && $params[2] != 'null')
            $sql.=','.$cnx->quote($params[2]);
        else
            $sql.=", NULL";
        $sql .= ')';
        $cnx->exec($sql);

        if ($this->verbose())
            echo "Rights: subject ".$params[0]." is created.";

        if (isset($params[3]) && preg_match("/^([a-zA-Z0-9_\.]+)~([a-zA-Z0-9_]+)\.([a-zA-Z0-9_\.]+)$/", $params[1], $m)) {
            $localestring = "\n".$m[3].'='.$params[3];
            $path = $this->getModulePath($m[1]);
            $file = $path.'locales/'.jApp::config()->locale.'/'.$m[2].'.'.jApp::config()->charset.'.properties';
            if (file_exists($file)) {
                $localestring = file_get_contents($file).$localestring;
            }
            file_put_contents($file, $localestring);
            if ($this->verbose())
                echo " and locale string ".$m[3]." is created into ".$file."\n";
        }
        else if ($this->verbose())
            echo "\n";
    }

    protected function cmd_subject_delete(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 1)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="SELECT id_aclsbj FROM ".$cnx->prefixTable('jacl2_subject')
            ." WHERE id_aclsbj=".$cnx->quote($params[0]);
        $rs = $cnx->query($sql);
        if (!$rs->fetch()) {
            throw new Exception("This subject does not exist");
        }

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_rights')." WHERE id_aclsbj=";
        $sql.=$cnx->quote($params[0]);
        $cnx->exec($sql);

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_subject')." WHERE id_aclsbj=";
        $sql.=$cnx->quote($params[0]);
        $cnx->exec($sql);

        if ($this->verbose())
            echo "Rights: subject ".$params[0]." is deleted\n";
    }

    protected function cmd_subject_group_list(){
        $cnx = jDb::getConnection('jacl2_profile');
        $sql="SELECT id_aclsbjgrp, label_key FROM "
           .$cnx->prefixTable('jacl2_subject_group')." ORDER BY id_aclsbjgrp";
        $rs = $cnx->query($sql);
        $group = '';
        echo "id\t\t\tlabel key\n--------------------------------------------------------\n";
        foreach($rs as $rec){
            echo $rec->id_aclsbjgrp,"\t",$rec->label_key,"\n";
        }
    }

    protected function cmd_subject_group_create(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 2)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="SELECT id_aclsbjgrp FROM ".$cnx->prefixTable('jacl2_subject_group')
            ." WHERE id_aclsbjgrp=".$cnx->quote($params[0]);
        $rs = $cnx->query($sql);
        if($rs->fetch()){
            throw new Exception("This subject group already exists");
        }

        $sql="INSERT into ".$cnx->prefixTable('jacl2_subject_group')." (id_aclsbjgrp, label_key) VALUES (";
        $sql.=$cnx->quote($params[0]).',';
        $sql.=$cnx->quote($params[1]);
        $sql .= ')';
        $cnx->exec($sql);

        if ($this->verbose())
            echo "Rights: group '".$params[0]."' of subjects is created.\n";
    }

    protected function cmd_subject_group_delete(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 1)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="SELECT id_aclsbjgrp FROM ".$cnx->prefixTable('jacl2_subject_group')
            ." WHERE id_aclsbjgrp=".$cnx->quote($params[0]);
        $rs = $cnx->query($sql);
        if (!$rs->fetch()) {
            throw new Exception("This subject group does not exist");
        }

        $sql="UDPATE ".$cnx->prefixTable('jacl2_rights')." SET id_aclsbjgrp=NULL WHERE id_aclsbjgrp=";
        $sql.=$cnx->quote($params[0]);
        $cnx->exec($sql);

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_subject_group')." WHERE id_aclsbjgrp=";
        $sql.=$cnx->quote($params[0]);
        $cnx->exec($sql);

        if ($this->verbose())
            echo "Rights: group '".$params[0]."' of subjects is deleted.\n";
    }



    private function _getGrpId($param, $onlypublic=false){
        if ($param == '__anonymous')
            return $param;

        if($onlypublic) {
            $c = ' grouptype <2 AND ';
        }
        else $c='';

        $cnx = jDb::getConnection('jacl2_profile');
        $sql="SELECT id_aclgrp FROM ".$cnx->prefixTable('jacl2_group')." WHERE $c ";
        $sql .= " id_aclgrp = ".$cnx->quote($param);
        $rs = $cnx->query($sql);
        if($rec = $rs->fetch()){
            return $rec->id_aclgrp;
        }else{
            throw new Exception("this group doesn't exist or is private");
        }
    }

}
