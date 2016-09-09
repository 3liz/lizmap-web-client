<?php

/**
* check a jelix installation
*
* @package     jelix
* @subpackage  core
* @author      Laurent Jouanneau
* @copyright   2007-2010 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
* @since       1.0b2
*/

/**
 *
 */
include __DIR__.'/installer/jIInstallReporter.iface.php';
include __DIR__.'/installer/jInstallerMessageProvider.class.php';
include __DIR__.'/installer/jInstallChecker.class.php';
include __DIR__.'/db/jDbParameters.class.php';
/**
 * an HTML reporter for jInstallChecker
 * @package jelix
 */
class jHtmlInstallChecker implements jIInstallReporter {

    function start(){
        echo '<ul class="checkresults">';
    }

    function message($message, $type=''){
        echo '<li class="'.$type.'">'.htmlspecialchars($message).'</li>';
    }
    
    function end($results){
        echo '</ul>';
        
        $nbError = $results['error'];
        $nbWarning = $results['warning'];
        $nbNotice = $results['notice'];

        echo '<div class="results">';
        if ($nbError) {
            echo ' '.$nbError. $this->messageProvider->get( ($nbError > 1?'number.errors':'number.error'));
        }
        if ($nbWarning) {
            echo ' '.$nbWarning. $this->messageProvider->get(($nbWarning > 1?'number.warnings':'number.warning'));
        }
        if ($nbNotice) {
            echo ' '.$nbNotice. $this->messageProvider->get(($nbNotice > 1?'number.notices':'number.notice'));
        }

        if($nbError){
            echo '<p>'.$this->messageProvider->get(($nbError > 1?'conclusion.errors':'conclusion.error')).'</p>';
        }else if($nbWarning){
            echo '<p>'.$this->messageProvider->get(($nbWarning > 1?'conclusion.warnings':'conclusion.warning')).'</p>';
        }else if($nbNotice){
            echo '<p>'.$this->messageProvider->get(($nbNotice > 1?'conclusion.notices':'conclusion.notice')).'</p>';
        }else{
            echo '<p>'.$this->messageProvider->get('conclusion.ok').'</p>';
        }
        echo "</div>";
    }
}

$reporter = new jHtmlInstallChecker();
$check = new jInstallCheck($reporter);
if (isset($_GET['verbose'])) {
    $check->verbose = true;
}
$check->addDatabaseCheck(array('mysqli', 'sqlite3', 'pgsql', 'oci', 'mssql'), false);
$reporter->messageProvider = $check->messages;

header("Content-type:text/html;charset=UTF-8");

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php echo $check->messages->getLang(); ?>" lang="<?php echo $check->messages->getLang(); ?>">
<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type"/>
    <title><?php echo htmlspecialchars($check->messages->get('checker.title')); ?></title>

    <style type="text/css">

body {  
  font-family: Verdana, Arial, Sans; 
  font-size:0.8em;
  margin:0;
  background-color:#eff4f6;
  color : #002830;
  padding:0 1em;
}
a { color:#3f6f7a; text-decoration:underline; }
a:visited { color : #002830;}
a:hover { color: #0f82af; background-color: #d7e7eb; }
h1.apptitle {
    font-size: 1.7em;
    background:-moz-linear-gradient(top, #2b4c53,#27474E 40%, #244148 60%, #002830);
    background-color:#002830;
    color:white;
    margin: 32px auto 1em auto;
    padding: 0.5em;
    width: 600px;
    -moz-border-radius:5px;
    -webkit-border-radius:5px; 
    -o-border-radius:5px;
    border-radius:5px ;
    z-index:100;
    -moz-box-shadow: #999 3px 3px 8px 0px;
    -webkit-box-shadow: #999  3px 3px 8px;
    -o-box-shadow: #999 3px 3px 8px 0px;
    box-shadow: #999 3px 3px 8px 0px;
}

h1.apptitle span.welcome { font-size:0.8em; font-style:italic; }
ul.checkresults { border:3px solid black; margin: 2em; padding:1em; list-style-type:none; }
ul.checkresults li { margin:0; padding:5px; border-top:1px solid black; }
ul.checkresults li:first-child {border-top:0px}
li.error, p.error  { background-color:#ff6666;}
li.ok, p.ok      { background-color:#a4ffa9;}
li.warning { background-color:#ffbc8f;}
li.notice { background-color:#DBF0FF;}
.logo { margin:6px 0; text-align:right;}
.nocss { display: none; }
#page { margin: 0 auto; width: 924px; }
div.block h2 {
  color:white;
  vertical-align:bottom;
  margin:0;
  padding:10px 0px 5px 10px;
  background:-moz-linear-gradient(top, #87B2C3,#5595AF, #3c90af);
  background-color:#3c90af;
  background-position:center left;
  background-repeat:no-repeat;
  -moz-border-radius:15px 15px 0px  0px ;
  -o-border-radius:15px 15px 0px  0px ;
  -webkit-border-top-right-radius: 15px;
  -webkit-border-top-left-radius: 15px; 
  border-radius:15px 15px 0px  0px ;
  -moz-box-shadow: #999 3px 3px 8px 0px;
  -webkit-box-shadow: #999 3px 3px 8px;
  -o-box-shadow: #999 3px 3px 8px 0px;
  box-shadow: #999 3px 3px 8px 0px;
  z-index:50;
}
div.block h3 {
  color:#C03033;
}

div.block .blockcontent {
  background: white;
  padding: 1em 2em;
  margin-bottom: 20px;
  -moz-box-shadow: #999 3px 3px 8px 0px;
  -webkit-box-shadow: #999  3px 3px 8px;
  -o-box-shadow: #999 3px 3px 8px 0px;
  box-shadow: #999 3px 3px 8px 0px;
  -moz-border-radius:0px 0px 15px 15px;
  -webkit-border-bottom-left-radius: 15px; 
  -webkit-border-bottom-right-radius: 15px; 
  -o-border-radius:0px 0px 15px 15px;
  border-radius:0px 0px 15px 15px;
}

div#jelixpowered {
    text-align:center;
    margin: 0 auto;
}

</style>

</head><body >
    <h1 class="apptitle"><?php echo htmlspecialchars($check->messages->get('checker.title')); ?></h1>

<?php $check->run();

if (!$check->verbose) {
?>
<p><a href="?verbose"><?php echo htmlspecialchars($check->messages->get('more.details')); ?></a></p>
<?php } ?>
</body>
</html>
