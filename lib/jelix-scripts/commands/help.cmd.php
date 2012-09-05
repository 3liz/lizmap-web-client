<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor
* @copyright   2005-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class helpCommand extends JelixScriptCommand {

    public  $name = 'help';
    public  $allowed_options=array('-standalone'=>false);
    public  $allowed_parameters=array('command'=>false);

    public  $applicationRequirement = 3;

    public  $syntaxhelp ="[COMMAND]";
    public  $help=array(
                'fr'=>"      COMMANDE : nom de la commande dont vous voulez l'aide (paramètre facultatif)",
                'en'=>"      COMMAND : command name for which you want help (optional parameter)");

    public  $mainhelp = array(
            'fr'=>"
Utilisation générale :
    %SCRIPT% COMMANDE [OPTIONS] [PARAMETRES]

    COMMANDE : nom de la commande à executer
    OPTIONS  : une ou plusieurs options. Le nom d'une option commence par un
               tiret et peut être suivi par une valeur.
               exemple d'options pour certaines commandes :
                 -cmdline
                 -profile myprofile
    PARAMETRES : une ou plusieurs valeurs qui se suivent

    Les options et paramètres à indiquer dépendent de la commande. Les options
    sont toujours facultatives, ainsi que certains paramètres.
    Consulter l'aide d'une commande COMMANDE en faisant :
       %SCRIPT% help COMMANDE

Liste des commandes disponibles :\n\t",
            'en'=>"
General use :
    %SCRIPT% COMMAND [OPTIONS] [PARAMETERS]

    COMMAND: name of the command to execute
    OPTIONS: one or more options. An option name begin with a '-' and can be
            followed by a value. Example with some specific commands:
              -cmdline
              -profile myprofile
    PARAMETERS: one or more values

    Options and parameters depends of the command. Options are always
    optional. Parameters could be optional or required, depending of the
    command. To know options and parameters of a command COMMAND, type:
       %SCRIPT% help COMMAND

List of available commands:\n\t",
            );

    public function run(){

        if(isset($this->_parameters['command'])){
            if($this->_parameters['command'] == 'help'){
                $command=$this;
            }else{
                $command = JelixScript::getCommand($this->_parameters['command'], $this->config, $this->getOption('-standalone'));
            }
            if($this->config->helpLang == 'fr'){
                $this->disp("\nUtilisation de la commande ".$this->_parameters['command']." :\n");
            }else{
                $this->disp("\nUsage of ".$this->_parameters['command'].":\n");
            }
            $this->disp("# ".$_SERVER['argv'][0]."  ".$this->_parameters['command']." ". $this->commonSyntaxOptions.$command->syntaxhelp."\n\n");
            if(is_array($command->help)){
                if(isset($command->help[$this->config->helpLang])){
                    $this->disp($command->help[$this->config->helpLang]);
                }elseif(isset($command->help['en'])){
                    $this->disp($command->help['en']);
                }else{
                    $this->disp(array_shift($command->help));
                }
            }else{
                $this->disp($command->help);
            }
            if (isset($this->commonOptionsHelp[$this->config->helpLang])) {
                $this->disp("\n".$this->commonOptionsHelp[$this->config->helpLang]);
            }
            else
                $this->disp("\n".$this->commonOptionsHelp['en']);
            $this->disp("\n\n");
        }else{
          if(isset($this->mainhelp[$this->config->helpLang])){
              $help = $this->mainhelp[$this->config->helpLang];
          }else{
              $help = $this->mainhelp['en'];
          }
          $help = str_replace('%SCRIPT%', $_SERVER['argv'][0], $help);
          $this->disp($help);

          $list = JelixScript::commandList();
          sort($list);
          $l = '';
          foreach($list as $k=>$cmd) {
            if ((($k+1) % 6) == 0)
                $l .= $cmd."\n\t";
            else
                $l .= $cmd.' ';
          }
          $this->disp("$l\n\n");
       }
    }

    protected function disp($str){
       if( !$this->config->displayHelpUtf8){
         echo utf8_decode($str);
       }else{
         echo $str;
       }
    }
}
