<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @contributor Loic Mathaud
* @copyright   2007-2011 Laurent Jouanneau
* @copyright   2008 Julien Issler
* @copyright   2008 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class acl2groupCommand extends JelixScriptCommand {

    public  $name = 'acl2group';
    public  $allowed_options=array('-defaultgroup'=>false);
    public  $allowed_parameters=array('action'=>true,'...'=>false);

    public  $syntaxhelp = " ACTION [arg1 [arg2 ...]]";
    public  $help=array(
        'fr'=>"
jAcl2 : gestion des groupes d'utilisateurs

ACTION:
 * list
    liste les groupes d'utilisateurs
 * userslist groupid
    liste les utilisateurs d'un groupe
 * alluserslist
    liste tous les utilisateurs inscrits
 * [-defaultgroup] create  id [nom]
    crée un groupe. Si il y a l'option -defaultgroup, ce nouveau
    groupe sera un groupe par défaut pour les nouveaux utilisateurs
 * setdefault groupid [true|false]
    fait du groupe indiqué un groupe par defaut (ou n'est plus
    un groupe par defaut si false est indiqué)
 * changename groupid nouveaunom
    change le nom d'un groupe
 * delete   groupid
    efface un groupe
 * createuser login
    crée un utilisateur et son groupe privé
 * adduser groupid login
    ajoute un utilisateur dans un groupe
 * removeuser login groupid
    enlève un utilisateur d'un groupe
",
        'en'=>"
jAcl2: user group management

ACTION:
 * list
    list users groups
 * userslist groupid
    list users of a group
 * alluserslist
    list all users
 * [-defaultgroup] create id [name]
    create a group. If there is -defaultgroup option, this new group
    becomes a default group for new users
 * setdefault groupid [true|false]
    the given group becomes a default group or does not
    become a default group if false is given
 * changename groupid newname
    change a group name
 * delete groupid
    delete a group
 * createuser login
    add a user and its private group
 * adduser groupid login
    add a user in a group
 * removeuser groupid login
    remove a user from a group
",
    );

    protected $titles = array(
        'fr'=>array(
            'list'=>"Liste des groupes d'utilisateurs",
            'create'=>"Création d'un nouveau groupe",
            'setdefault'=>"Change la propriété 'defaut' d'un groupe",
            'changename'=>"Change le nom d'un groupe",
            'delete'=>"Efface un groupe d'utilisateurs",
            'userslist'=>"Liste des utilisateurs d'un groupe",
            'alluserslist'=>"Liste de tous les utilisateurs",
            'adduser'=>"Ajoute un utilisateur",
            'removeuser'=>"Enlève un utilisateur",
            'createuser'=>"Crée un utilisateur dans jAcl2",
            'destroyuser'=>"Enlève un utilisateur de jAcl2",
            ),
        'en'=>array(
            'list'=>"List of users groups",
            'create'=>"Create a new group",
            'setdefault'=>"Change the 'default' property of a group",
            'changename'=>"Change the name of a group",
            'delete'=>"Delete a group",
            'userslist'=>"List of user of a group",
            'alluserslist'=>"All registered users",
            'adduser'=>"Add a user in a group",
            'removeuser'=>"Remove a user from a group",
            'createuser'=>"Create a user in jAcl2",
            'destroyuser'=>"Remove a user from jAcl2",
            ),
    );


    public function run(){
        $this->loadAppConfig();
        $action = $this->getParam('action');
        if(!in_array($action,array('list','create','setdefault','changename',
            'delete','userslist','alluserslist','adduser','removeuser','createuser','destroyuser'))){
            throw new Exception("unknown subcommand");
        }

        $meth= 'cmd_'.$action;
        echo "----", $this->titles[$this->config->helpLang][$action],"\n\n";
        $this->$meth();
    }


    protected function cmd_list(){
        $cnx = jDb::getConnection('jacl2_profile');
        $sql="SELECT id_aclgrp, name, grouptype FROM "
            .$cnx->prefixTable('jacl2_group')
            ." WHERE grouptype <2 ORDER BY name";
        $rs = $cnx->query($sql);
        echo "id\tlabel name\t\tdefault\n--------------------------------------------------------\n";
        foreach($rs as $rec){
            if($rec->grouptype==1)
                $type='yes';
            else
                $type='';
            echo $rec->id_aclgrp,"\t",$rec->name,"\t\t",$type,"\n";
        }
    }

    protected function cmd_userslist(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 1)
            throw new Exception("wrong parameter count");

        $id = $this->_getGrpId($params[0]);

        $cnx = jDb::getConnection('jacl2_profile');
        $sql = "SELECT login FROM ".$cnx->prefixTable('jacl2_user_group')
            ." WHERE id_aclgrp =".$id;
        $rs = $cnx->query($sql);
        echo "Login\n-------------------------\n";
        foreach($rs as $rec){
            echo $rec->login,"\n";
        }
    }

    protected function cmd_alluserslist(){

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="SELECT login, u.id_aclgrp, name FROM "
            .$cnx->prefixTable('jacl2_user_group')." u, "
            .$cnx->prefixTable('jacl2_group')." g
            WHERE g.grouptype <2 AND u.id_aclgrp = g.id_aclgrp ORDER BY login";

        $rs = $cnx->query($sql);
        echo "Login\t\tgroups\n--------------------------------------------------------\n";
        $login = '';
        foreach($rs as $rec){
            if($login != $rec->login) {
                echo "\n", $rec->login,"\t\t";
                $login = $rec->login;
            }
            echo $rec->name," (",$rec->id_aclgrp,")";
        }
        echo "\n\n";
    }


    protected function cmd_create(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) > 2)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $id = $params[0];
        if (isset($params[1]))
            $name = $params[1];
        else
            $name = $id;


        try {
            $sql="INSERT into ".$cnx->prefixTable('jacl2_group')
                ." (id_aclgrp, name, grouptype, ownerlogin) VALUES (";
            $sql.=$cnx->quote($id).',';
            $sql.=$cnx->quote($name).',';
            if($this->getOption('-defaultgroup'))
                $sql.='1, NULL)';
            else
                $sql.='0, NULL)';

            $cnx->exec($sql);
        }
        catch(Exception $e) {
            throw new Exception("this group already exists");
        }
        if ($this->verbose())
            echo "Rights: group $name ($id) is created.\n";
    }

    protected function cmd_delete(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 1)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $id = $this->_getGrpId($params[0]);

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_rights')." WHERE id_aclgrp=".$id;
        $cnx->exec($sql);

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_user_group')." WHERE id_aclgrp=".$id;
        $cnx->exec($sql);

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_group')." WHERE id_aclgrp=".$id;
        $cnx->exec($sql);

        if ($this->verbose())
            echo "Rights: group $id and all corresponding rights have been deleted.\n";
    }

    protected function cmd_setdefault(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) == 0 || count($params) > 2)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $id = $this->_getGrpId($params[0]);

        $def=1;
        if(isset($params[1])){
            if($params[1]=='false')
                $def=0;
            elseif($params[1]=='true')
                $def=1;
            else
                throw new Exception("bad value for last parameter");
        }

        $sql="UPDATE ".$cnx->prefixTable('jacl2_group')
            ." SET grouptype=$def  WHERE id_aclgrp=".$id;
        $cnx->exec($sql);
        if ($this->verbose())
            echo "Rights: group $id is ".($def?' now a default group':' no more a default group')."\n";
    }

    protected function cmd_changename(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 2)
            throw new Exception("wrong parameter count");

        $id = $this->_getGrpId($params[0]);

        $cnx = jDb::getConnection('jacl2_profile');
        $sql="UPDATE ".$cnx->prefixTable('jacl2_group')
            ." SET name=".$cnx->quote($params[1])."  WHERE id_aclgrp=".$id;
        $cnx->exec($sql);
        if ($this->verbose())
            echo "Rights: group $id is renamed to '".$params[1]."'.\n";
    }

    protected function cmd_adduser(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 2)
            throw new Exception("wrong parameter count");

        $id = $this->_getGrpId($params[0]);

        $cnx = jDb::getConnection('jacl2_profile');

        $sql = "SELECT * FROM ".$cnx->prefixTable('jacl2_user_group')
            ." WHERE login= ".$cnx->quote($params[1])." AND id_aclgrp = $id";
        $rs = $cnx->query($sql);
        if($rec = $rs->fetch()){
             throw new Exception("The user is already in this group");
        }

        $sql = "SELECT * FROM  ".$cnx->prefixTable('jacl2_user_group')." u, "
                .$cnx->prefixTable('jacl2_group')." g
                WHERE u.id_aclgrp = g.id_aclgrp AND login= ".$cnx->quote($params[1])." AND grouptype = 2";
        $rs = $cnx->query($sql);
        if(! ($rec = $rs->fetch())){
             throw new Exception("The user doesn't exist");
        }

        $sql="INSERT INTO ".$cnx->prefixTable('jacl2_user_group')
            ." (login, id_aclgrp) VALUES(".$cnx->quote($params[1]).", ".$id.")";
        $cnx->exec($sql);
        if ($this->verbose())
            echo "Rights: user ".$params[1]." is added to the group $id\n";
    }

    protected function cmd_removeuser(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 2)
            throw new Exception("wrong parameter count");

        $id = $this->_getGrpId($params[0]);

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_user_group')
            ." WHERE login=".$cnx->quote($params[1])." AND id_aclgrp=$id";
        $cnx->exec($sql);
        if ($this->verbose())
            echo "Rights: user ".$params[1]." is removed from the group $id\n";
    }

    protected function cmd_createuser(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 1)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');
        $login = $cnx->quote($params[0]);

        $sql = "SELECT * FROM ".$cnx->prefixTable('jacl2_user_group')
            ." WHERE login = $login";
        $rs = $cnx->query($sql);
        if($rec = $rs->fetch()){
            throw new Exception("the user is already registered");
        }

        $groupid = $cnx->quote('__priv_'.$params[0]);

        $sql = "INSERT into ".$cnx->prefixTable('jacl2_group')
            ." (id_aclgrp, name, grouptype, ownerlogin) VALUES (";
        $sql.= $groupid.','.$login.',2, '.$login.')';
        $cnx->exec($sql);

        $sql="INSERT INTO ".$cnx->prefixTable('jacl2_user_group')
            ." (login, id_aclgrp) VALUES(".$login.", ".$groupid.")";
        $cnx->exec($sql);
        if ($this->verbose())
            echo "Rights: user $login is added into rights system and has a private group $groupid\n";
    }

    protected function cmd_destroyuser(){
        $params = $this->getParam('...');
        if(!is_array($params) || count($params) != 1)
            throw new Exception("wrong parameter count");

        $cnx = jDb::getConnection('jacl2_profile');

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_group')
            ." WHERE grouptype=2 and ownerlogin=".$cnx->quote($params[0]);
        $cnx->exec($sql);

        $sql="DELETE FROM ".$cnx->prefixTable('jacl2_user_group')
            ." WHERE login=".$cnx->quote($params[0]);
        $cnx->exec($sql);
        if ($this->verbose())
            echo "Rights: user $login is removed from rights system.\n";
    }

    private function _getGrpId($param){
        $cnx = jDb::getConnection('jacl2_profile');
        $sql="SELECT id_aclgrp FROM ".$cnx->prefixTable('jacl2_group')
                ." WHERE grouptype <2 AND id_aclgrp = ".$cnx->quote($param);
        $rs = $cnx->query($sql);
        if($rec = $rs->fetch()){
            return $cnx->quote($rec->id_aclgrp);
        }else{
            throw new Exception("this group doesn't exist or is private");
        }
    }
}
