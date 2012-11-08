<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Bastien Jaillot
* @contributor Loic Mathaud
* @contributor Mickael Fradin
* @copyright   2007-2012 Laurent Jouanneau, 2008 Loic Mathaud, 2010 Mickael Fradin
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class createdaocrudCommand extends JelixScriptCommand {

    public  $name = 'createdaocrud';
    public  $allowed_options=array('-profile'=>true, '-createlocales'=>false, '-acl2'=>false, '-acl2locale'=>true, '-masteradmin'=>false);
    public  $allowed_parameters=array('module'=>true, 'table'=>true, 'ctrlname'=>false);

    public  $syntaxhelp = "[-createlocales] [-acl2] [-masteradmin] [-acl2locale module~file] [-profile name] MODULE TABLE [CTRLNAME]";
    public  $help=array(
        'fr'=>"
    Crée un nouveau contrôleur de type jControllerDaoCrud, reposant sur un jdao et un jform.

    -profile (facultatif) : indique le profil à utiliser pour se connecter à
                           la base et récupérer les informations de la table

    -createlocales (facultatif) : crée le fichier des locales pour les champs du formulaire

    -acl2 (facultatif) : génere automatiquement les droits ACL2
                        (lister, voir, créer, modifier, effacer)
    -acl2locale (facultatif): indique le prefix du selecteur du fichier de locale pour stocker
                les locales des droits quand -acl2 est indiqué
    -masteradmin (facultatif): ajout un listener d'évènement pour ajouter un item de menu dans master_admin

    MODULE : le nom du module où stocker le contrôleur
    TABLE : le nom de la table SQL
    CTRLNAME (facultatif) : nom du contrôleur (par défaut, celui de la table)",

        'en'=>"
    Create a new controller jControllerDaoCrud

    -profile (optional): indicate the name of the profile to use for the
                        database connection.

    -createlocales (optional): creates the locales file for labels of the form.
    -acl2 (optional): automatically generate ACL2 rights
                          (list, view, create, modify, delete)
    -acl2locale (optional): indicates the selector prefix for the file storing
                            the locales of rights, when -acl2 is set
    -masteradmin (facultatif): add an event listener to add a menu item in master_admin

    MODULE: name of the module where to create the crud
    TABLE: name of the SQL table
    CTRLNAME (optional): name of the controller."
    );


    public function run(){

        $this->loadAppConfig();
        $module = $this->_parameters['module'];
        $path= $this->getModulePath($module);

        $table = $this->getParam('table');
        $ctrlname = $this->getParam('ctrlname', $table);
        $acl2 = $this->getOption('-acl2');

        if(file_exists($path.'controllers/'.$ctrlname.'.classic.php')){
            throw new Exception("controller '".$ctrlname."' already exists");
        }

        $agcommand = JelixScript::getCommand('createdao', $this->config);
        $options = $this->getCommonActiveOption();

        $profile = '';
        if ($this->getOption('-profile')) {
            $profile = $this->getOption('-profile');
            $options['-profile']= $profile;
        }
        $agcommand->initOptParam($options,array('module'=>$module, 'name'=>$table,'table'=>$table));
        $agcommand->run();

        $agcommand = JelixScript::getCommand('createform', $this->config);
        $options = $this->getCommonActiveOption();
         if ($this->getOption('-createlocales')) {
            $options['-createlocales'] = true;
        }

        $agcommand->initOptParam($options, array('module'=>$module, 'form'=>$table,'dao'=>$table));
        $agcommand->run();

        $acl2rights = '';
        $pluginsParameters = "
                '*'          =>array('auth.required'=>true),
                'index'      =>array('jacl2.right'=>'$module.$ctrlname.view'),
                'precreate'  =>array('jacl2.right'=>'$module.$ctrlname.create'),
                'create'     =>array('jacl2.right'=>'$module.$ctrlname.create'),
                'savecreate' =>array('jacl2.right'=>'$module.$ctrlname.create'),
                'preupdate'  =>array('jacl2.right'=>'$module.$ctrlname.update'),
                'editupdate' =>array('jacl2.right'=>'$module.$ctrlname.update'),
                'saveupdate' =>array('jacl2.right'=>'$module.$ctrlname.update'),
                'view'       =>array('jacl2.right'=>'$module.$ctrlname.view'),
                'delete'     =>array('jacl2.right'=>'$module.$ctrlname.delete')";
        if ($acl2) {
            $subjects = array('view'=>'View','create'=>'Create','update'=>'Update','delete'=>'Delete');
            $sel = $this->getOption('-acl2locale');
            if (!$sel) {
                $sel = $module.'~acl'.$ctrlname;
            }

            foreach ($subjects as $subject=>$label) {
                $subject = $module.".".$ctrlname.".".$subject;
                $labelkey = $sel.'.'.$subject;
                try {
                    $options = $this->getCommonActiveOption();

                    $agcommand = JelixScript::getCommand('acl2right', $this->config);
                    $agcommand->initOptParam($options,array('action'=>'subject_create',
                                                   '...'=>array($subject, $labelkey, 'null', $label.' '.$ctrlname)));
                    $agcommand->run();
                } catch (Exception $e) {}
            }
        }
        else {
            $pluginsParameters = "/*".$pluginsParameters."\n*/";
        }

        $this->createDir($path.'controllers/');
        $params = array('name'=>$ctrlname,
                'module'=>$module,
                'table'=>$table,
                'profile'=>$profile,
                'acl2rights'=>$pluginsParameters);

        $this->createFile( $path.'controllers/'.$ctrlname.'.classic.php', 'module/controller.daocrud.tpl', $params, "Controller");

        if ($this->getOption('-masteradmin')) {
            if ($acl2)
                $params['checkacl2'] = "if(jAcl2::check('$module.$ctrlname.view'))";
            else
                $params['checkacl2'] = '';
            $this->createFile($path.'classes/'.$ctrlname.'menu.listener.php', 'module/masteradminmenu.listener.php.tpl', $params, "Listener");
            if (file_exists($path.'events.xml')) {
                $xml = simplexml_load_file($path.'events.xml');
                $xml->registerXPathNamespace('j', 'http://jelix.org/ns/events/1.0');
                $listenerPath = "j:listener[@name='".$ctrlname."menu']";
                $eventPath = "j:event[@name='masteradminGetMenuContent']";
                if (!$event = $xml->xpath("//$listenerPath/$eventPath")) {
                    if ($listeners = $xml->xpath("//$listenerPath")) {
                         $listener = $listeners[0];
                    } else {
                        $listener = $xml->addChild('listener');
                        $listener->addAttribute('name', $ctrlname.'menu');
                    }
                    $event = $listener->addChild('event');
                    $event->addAttribute('name', 'masteradminGetMenuContent');
                    $result = $xml->asXML($path.'events.xml');
                    if ($this->verbose() && $result) {
                        echo "Events.xml in module '".$this->_parameters['module']."' has been updated.\n";
                    }
                    else if (!$result)
                        echo "Warning: events.xml in module '".$this->_parameters['module']."' cannot be updated, check permissions or add the event manually.\n";
                } else if ($this->verbose())
                    echo "events.xml in module '".$this->_parameters['module']."' is already updated.\n";
            } else {
                $this->createFile($path.'events.xml', 'module/events_crud.xml.tpl', array('classname'=>$ctrlname.'menu'));
            }
        }

        if (jApp::config()->urlengine['engine'] == 'significant') {

            if (!file_exists($path.'urls.xml')) {
                $this->createFile($path.'urls.xml', 'module/urls.xml.tpl', array());
                if ($this->verbose()) {
                    echo "Notice: you should link the urls.xml of the module ".$this->_parameters['module']."', into the urls.xml in var/config.\n";
                }
            }

            $xml = simplexml_load_file($path.'urls.xml');
            $xml->registerXPathNamespace('j', 'http://jelix.org/ns/suburls/1.0');

            // if the url already exists, let's try an other
            $count = 0;
            $urlXPath = "//j:url[@pathinfo='/".$ctrlname."/']";
            while ($url = $xml->xpath("//$urlXPath")) {
                $count++;
                $urlXPath = "//j:url[@pathinfo='/".$ctrlname."-".$count."/']";
            }

            if ($count == 0)
                $urlPath = "/".$ctrlname."/";
            else
                $urlPath = "/".$ctrlname."-".$count."/";

/*
 
 <url pathinfo="/thedata/" action="mycrud:index" />
<url pathinfo="/thedata/view/:id" action="mycrud:view" />
<url pathinfo="/thedata/precreate" action="mycrud:precreate" />
<url pathinfo="/thedata/create" action="mycrud:create" />
<url pathinfo="/thedata/savecreate" action="mycrud:savecreate" />
<url pathinfo="/thedata/preedit/:id" action="mycrud:preupdate" />
<url pathinfo="/thedata/edit/:id" action="mycrud:editupdate" />
<url pathinfo="/thedata/save/:id" action="mycrud:saveupdate" />
<url pathinfo="/thedata/delete/:id" action="mycrud:delete" />
*/


            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath);
            $url->addAttribute('action', $ctrlname.':index');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."view/:id");
            $url->addAttribute('action', $ctrlname.':view');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."precreate");
            $url->addAttribute('action', $ctrlname.':precreate');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."create");
            $url->addAttribute('action', $ctrlname.':create');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."savecreate");
            $url->addAttribute('action', $ctrlname.':savecreate');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."preedit/:id");
            $url->addAttribute('action', $ctrlname.':preupdate');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."edit/:id");
            $url->addAttribute('action', $ctrlname.':editupdate');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."save/:id");
            $url->addAttribute('action', $ctrlname.':saveupdate');

            $url = $xml->addChild('url');
            $url->addAttribute('pathinfo', $urlPath."delete/:id");
            $url->addAttribute('action', $ctrlname.':delete');


            $result = $xml->asXML($path.'urls.xml');
            if ($this->verbose() && $result)
                echo "urls.xml in module '".$this->_parameters['module']."' has been updated.\n";
            else if (!$result)
                echo "Warning: urls.xml in module '".$this->_parameters['module']."' cannot be updated, check permissions or add the urls manually.\n";
        }
    }
}
