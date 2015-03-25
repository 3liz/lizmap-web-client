<!DOCTYPE html>
<html lang="{$lang}">
<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type"/>
    <title>Installation Wizard</title>

    <style type="text/css">{literal}

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

   #buttons { margin: 0 auto; width: 924px; text-align:center}
    {/literal}</style>

</head>

<body >
    <h1 class="apptitle">{$appname} <br/><span class="welcome">{@maintitle@}</span></h1>

    <div id="main">
      <form action="install.php" {if $enctype}enctype="{$enctype}"{/if} method="post">
        <div>
          <input type="hidden" name="step" value="{$stepname}" />
          <input type="hidden" name="doprocess" value="1" />
        </div>
        <div id="page">
          <div class="block">
            <h2>{$title|eschtml}</h2>
            <div class="blockcontent">
            {if $messageHeader}<div id="contentheader">{@$messageHeader@|eschtml}</div>{/if}
            {$MAIN}
            {if $messageFooter}<div id="contentFooter">{@$messageFooter@|eschtml}</div>{/if}
            </div>
          </div>
        </div>
        <div id="buttons">
          {if $previous}
            <button name="previous" onclick="location.href='install.php?step={$previous}';return false;">{@previousLabel@|eschtml}</button>
          {/if}
          {if $next}
            <button type="submit">{@nextLabel@|eschtml}</button>
          {/if}
        </div>
      </form>
    </div>

</body>
</html>