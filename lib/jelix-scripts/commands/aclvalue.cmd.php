<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2007 Laurent Jouanneau, 2008 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class aclvalueCommand extends JelixScriptCommand {

    public  $name = 'aclvalue';
    public  $allowed_options=array();
    public  $allowed_parameters=array('action'=>true,'...'=>false);

    public  $syntaxhelp = " ACTION [arg1 [arg2 ...]]";
    public  $help=array(
        'fr'=>"
jAcl : gestion des valeurs de droits

ACTION:
 * group_list
     liste les groupes de valeurs
 * group_add id labelkey type
     ajoute un groupe de valeur avec l'id, le libellé et le type indiqué
     type :
        0 : les valeurs peuvent être cumulées pour un même sujet.
        1 : les valeurs sont mutuellement exclusives pour un même sujet.
 * group_delete id
    détruit un groupe de valeurs
 * list [rvgid]
    liste des valeurs de droits, pour tous les groupes ou
    pour celui indiqué en paramètre
 * add value labelkey rvgid
    ajoute une valeur dans le groupe de valeurs rvgid
 * delete value rvgid
    enlève une valeur du groupe de valeurs rvgid
",
        'en'=>"
jAcl: right values management

ACTION:
 * group_list
     list all values groups
 * group_add id labelkey type
     add a values group with the given id, label and type
     type :
        0 : values can be used together for a same subject
        1 : only one value of the group can be used for a subject
 * group_delete  id
     destroy a values group
 * list [rvgid]
    list of all right values, in all values groups or in the
    given group
 * add value labelkey rvgid
    add a value in a group (rvgid= group id)
 * delete value rvgid
    remove a value from a group (rvgid= group id)
",
    );

    protected $titles = array(
        'fr'=>array(
            'group_list'=>"Liste des groupes de valeurs de droits",
            'group_add'=>"Ajout d'un groupe de valeurs de droits",
            'group_delete'=>"Détruit un groupe de valeurs de droits",
            'list'=>"Liste des valeurs de droit",
            'add'=>"Ajoute une valeur de droit",
            'delete'=>"Enlève une valeur de droit",
            ),
        'en'=>array(
            'group_list'=>"List of group of values of rights",
            'group_add'=>"Add a group of values of rights",
            'group_delete'=>"Remove a group of values of rights",
            'list'=>"List of right values",
            'add'=>"Add a value of right",
            'delete'=>"Remove a value of right",
            ),
    );


    public function run(){
        $this->loadAppConfig();
        $action = $this->getParam('action');
        if(!in_array($action,array('group_list','group_add','group_delete','list','add','delete'))){
            throw new Exception("unknown subcommand");
        }

        $meth= 'cmd_'.$action;
        echo "----", $this->titles[$this->config->helpLang][$action],"\n\n";
        $this->$meth();
    }


    protected function cmd_group_list(){
        $sql="SELECT id_aclvalgrp, label_key, type_aclvalgrp FROM jacl_right_values_group ORDER BY id_aclvalgrp";
        $cnx = jDb::getConnection('jacl_profile');
        $rs = $cnx->query($sql);
        echo "id\tlabel key\t\t\ttype\n--------------------------------------------------------\n";
        foreach($rs as $rec){
            if($rec->type_aclvalgrp==1)
                $type=' (mutually exclusive values)';
            else
                $type=' (combinable values)';
            echo $rec->id_aclvalgrp,"\t",$rec->label_key,"\t",$rec->type_aclvalgrp,$type,"\n";
        }
    }

    protected function cmd_group_add(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 3)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl_profile');

        $sql="INSERT into jacl_right_values_group (id_aclvalgrp, label_key, type_aclvalgrp) VALUES (";
        $sql.=intval($params[0]).',';
        $sql.=$cnx->quote($params[1]).',';
        $sql.=intval($params[2]).')';

        $cnx->exec($sql);
        if ($this->verbose())
            echo "OK\n";
    }

    protected function cmd_group_delete(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 1)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl_profile');

        $rs = $cnx->query('SELECT count(id_aclsbj) as n FROM jacl_subject WHERE id_aclvalgrp='.intval($params[0]));
        if(!$rs)
            throw new Exception("not possible count");

        $rec = $rs->fetch();
        if(!$rec)
            throw new Exception("error: no count");
        if($rec->n > 0){
            throw new Exception("Impossible to remove this group : subjects use it.\nUpdate or delete this subjects first.");
        }

        $sql="DELETE FROM jacl_right_values WHERE id_aclvalgrp=";
        $sql.=intval($params[0]);
        $cnx->exec($sql);

        $sql="DELETE FROM jacl_right_values_group WHERE id_aclvalgrp=";
        $sql.=intval($params[0]);

        $cnx->exec($sql);
        if ($this->verbose())
            echo "OK\n";
    }


    protected function cmd_list(){
        $params = $this->getParam('...');

        $bygroup=false;
        if(!is_array($params)|| count($params) == 0){
            $sql="SELECT value, a.label_key, b.label_key as group_label_key, b.id_aclvalgrp
                   FROM jacl_right_values a,jacl_right_values_group b
                   WHERE a.id_aclvalgrp = b.id_aclvalgrp  ORDER BY a.id_aclvalgrp, value";
            $bygroup=true;
        }else{
            $sql="SELECT value, label_key ROM jacl_right_values WHERE id_aclvalgrp=".intval($params[0])." ORDER BY value";

        }

        $cnx = jDb::getConnection('jacl_profile');
        $rs = $cnx->query($sql);

        if($bygroup){
            echo "\tvalue\tlabel key\n-----------------------------------------\n";
            $currentgroup=-1;
            foreach($rs as $rec){
                if($currentgroup != $rec->id_aclvalgrp){
                    echo "GROUP ".$rec->id_aclvalgrp." (".$rec->group_label_key.")\n";
                    $currentgroup= $rec->id_aclvalgrp;
                }

                echo "\t",$rec->value,"\t",$rec->label_key,"\n";
            }
        }else{
            echo "value\tlabel key\n-----------------------------------------\n";
            foreach($rs as $rec){
                echo $rec->value,"\t",$rec->label_key,"\n";
            }
        }
    }



    protected function cmd_add(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 3)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl_profile');

        $rs = $cnx->query('SELECT count(id_aclvalgrp) as n FROM jacl_right_values_group WHERE id_aclvalgrp='.intval($params[2]));
        if(!$rs)
            throw new Exception("not possible count");

        $rec = $rs->fetch();
        if(!$rec)
            throw new Exception("no count");
        if($rec->n == 0){
            throw new Exception("Unknown values group id.");
        }

        $sql="INSERT into jacl_right_values (value, label_key, id_aclvalgrp) VALUES (";
        $sql.=$cnx->quote($params[0]).',';
        $sql.=$cnx->quote($params[1]).',';
        $sql.=intval($params[2]).')';

        $cnx->exec($sql);
        if ($this->verbose())
            echo "OK\n";
    }

    protected function cmd_delete(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 2)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl_profile');

        $rs = $cnx->query('SELECT count(*) as n FROM jacl_right_values WHERE id_aclvalgrp='.intval($params[1]).' AND value='.$cnx->quote($params[0]));
        if(!$rs)
            throw new Exception("not possible count");

        $rec = $rs->fetch();
        if(!$rec)
            throw new Exception("no count");
        if($rec->n == 0){
            throw new Exception("Unknown value or group id");
        }

        $sql ='SELECT count(*) as n
                FROM jacl_subject s, jacl_rights r
                WHERE
                    s.id_aclvalgrp='.intval($params[1]).'
                AND s.id_aclsbj = r.id_aclsbj
                AND r.value = '.$cnx->quote($params[0]);

        $rs = $cnx->query($sql);
        if(!$rs)
            throw new Exception("not possible count");

        $rec = $rs->fetch();
        if(!$rec)
            throw new Exception("no count");
        if($rec->n > 0){
            throw new Exception("This value is used in rights setting. Please remove rights which used this value before deleting the value");
        }


        $sql="DELETE FROM jacl_right_values WHERE id_aclvalgrp=".intval($params[1]).' AND value='.$cnx->quote($params[0]);
        $cnx->exec($sql);
        if ($this->verbose())
            echo "OK\n";
    }
}
