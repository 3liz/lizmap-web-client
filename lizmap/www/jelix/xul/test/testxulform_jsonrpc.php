<?php
header('Content-type: text/plain;charset=utf-8');
$ret = str_replace("\"","\\\"",var_export($HTTP_RAW_POST_DATA, true));
$ret = str_replace("\n"," ",$ret);

echo '{ result:"'.$ret.'" , error:null, id:""}';


//$chaine =

//file_put_contents("../../temp/testapp/reception.txt", $chaine);

//phpinfo();
?>
