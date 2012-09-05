<?php
/**
* @package     jelix
* @subpackage  acl
* @author      Laurent Jouanneau
* @copyright   2006-2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @since 1.0a3
*/


/**
 * This class is used to manage rights. Works only with db driver of jAcl.
 * @package     jelix
 * @subpackage  acl
 * @static
 */
class jAclDbManager {

    /**
     * @internal The constructor is private, because all methods are static
     */
    private function __construct (){ }

    /**
     * Add a right on the given subject/group/resource
     * @param int    $group the group id.
     * @param string $subject the key of the subject
     * @param string  $value the value of the right
     * @param string $resource the id of a resource
     * @return boolean  true if the right is set
     */
    public static function addRight($group, $subject, $value , $resource=''){
        $daosbj = jDao::get('jacldb~jaclsubject', 'jacl_profile');
        $daorightval = jDao::get('jacldb~jaclrightvalues', 'jacl_profile');

        $sbj = $daosbj->get($subject);
        if(!$sbj) return false;

        //  get the values list from the value group
        $vallist = $daorightval->findByValGroup($sbj->id_aclvalgrp);

        if($resource === null) $resource='';

        // check if the value is allowed
        $ok=false;
        foreach($vallist as $valueok){
            if($valueok->value == $value){
                $ok = true;
                break;
            }
        }
        if(!$ok) return false;

        //  add the new value
        $daoright = jDao::get('jacldb~jaclrights', 'jacl_profile');
        $right = $daoright->get($subject,$group,$resource,$value);
        if(!$right){
            $right = jDao::createRecord('jacldb~jaclrights', 'jacl_profile');
            $right->id_aclsbj = $subject;
            $right->id_aclgrp = $group;
            $right->id_aclres = $resource;
            $right->value = $value;
            $daoright->insert($right);
        }
        jAcl::clearCache();
        return true;
    }

    /**
     * Remove a right on the given subject/group/resource
     * @param int    $group the group id.
     * @param string $subject the key of the subject
     * @param string  $value the value of the right
     * @param string $resource the id of a resource
     */
    public static function removeRight($group, $subject, $value , $resource=''){
        $daoright = jDao::get('jacldb~jaclrights', 'jacl_profile');
        if($resource === null) $resource='';
        $daoright->delete($subject,$group,$resource,$value);
        jAcl::clearCache();
    }



    /**
     * Remove the right on the given subject/resource, for all groups
     * @param string  $subject the key of the subject
     * @param string $resource the id of a resource
     */
    public static function removeResourceRight($subject, $resource){
        $daoright = jDao::get('jacldb~jaclrights', 'jacl_profile');
        $daoright->deleteBySubjRes($subject, $resource);
        jAcl::clearCache();
    }

    /**
     * Create a new subject
     * @param string  $subject the key of the subject
     * @param int $id_aclvalgrp the id of the values group with which the right can be set
     * @param string $label_key the key of a locale which represents the label of the subject
     */
    public static function addSubject($subject, $id_aclvalgrp, $label_key){
        // adds a subject in the jacl_subject table
        $daosbj = jDao::get('jacldb~jaclsubject','jacl_profile');
        $subj = jDao::createRecord('jacldb~jaclsubject','jacl_profile');
        $subj->id_aclsbj=$subject;
        $subj->id_aclvalgrp=$id_aclvalgrp;
        $subj->label_key =$label_key;
        $daosbj->insert($subj);
        jAcl::clearCache();
    }

    /**
     * Delete the given subject
     * @param string  $subject the key of the subject
     */
    public static function removeSubject($subject){
        // delete into jacl_rights
        $daoright = jDao::get('jacldb~jaclrights','jacl_profile');
        $daoright->deleteBySubject($subject);
        // delete into jacl_subject
        $daosbj = jDao::get('jacldb~jaclsubject','jacl_profile');
        $daosbj->delete($subject);
        jAcl::clearCache();
    }
}

