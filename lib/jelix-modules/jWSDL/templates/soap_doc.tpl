{meta_html css $j_jelixwww.'design/jelix.css'}

<h1 class="apptitle">Web services documentation<br/><span class="welcome">{$doc['class']->name|replace:'Ctrl':''}
        <a href="{jurl 'jWSDL~WSDL:wsdl', array("service"=>$doc['service'])}">[WSDL]</a></span></h1>

<div id="page">
    <!--<div class="logo"><img src="{$j_jelixwww}design/images/logo_jelix_moyen.png" alt=""/></div>-->

    <div class="menu">
        <h3>Services</h3>
        <ul>
        {foreach $doc['menu'] as $webservice}
        <li><a href="{jurl 'jWSDL~WSDL:index', array("service"=>$webservice['service'])}">{$webservice['class']}</a></li>
        {/foreach}
        </ul>
    </div>

    <div class="monbloc">
        <h2>Full description</h2>
        <div class="blockcontent">
            <p>{$doc['class']->fullDescription}</p>
        </div>
    </div>
    {if(sizeof($doc['class']->properties))}
    <div class="monbloc">
        <h2>Properties</h2>
        <div class="blockcontent">
        <dl>
        {foreach $doc['class']->properties as $propertie}
            <dt>{$propertie->name}</dt>
            <dd>
            {if  $propertie->type == ''}
                <div class='docError'>Missing type info</div>
            {else}
                <ul>
                {assign $propertieClassName=str_replace('[]' , '',str_replace('[=>]' , '',$propertie->type))}
                {if $propertieClassName =='int' || $propertieClassName =='string' || $propertieClassName =='boolean' || $propertieClassName =='double' || $propertieClassName =='float' ||$propertieClassName =='void'}
                <li>type {$propertie->type}</li>
                {else}
                <li>type <a href="{jurl 'jWSDL~WSDL:index', array('service'=>$doc['service'], 'className'=>str_replace('[]' , '',$propertieClassName))}">{$propertie->type}</a></li>
                {/if}
                </ul>
            {/if}
            {$propertie->fullDescription}
            </dd>
        {/foreach}
        </dl>

        </div>
    </div>
    {/if}

    {if(sizeof($doc['class']->methods))}
    <div class="monbloc">
        <h2>Methods</h2>
        <div class="blockcontent">
            <dl>
            {foreach $doc['class']->methods as $method}
            <dt>{$method->name} (
                    {assign $i=0}
                    {foreach $method->parameters as $param}
                    {$param->name}{assign $i=$i+1}{if($i!=(sizeof($method->parameters)))},{/if}{/foreach}
                    )</dt>
            <dd>
                {if  $method->return == ''}
                    <div class='docError'>Missing return value</div>
                {else}
                    <ul>
                    {assign $returnClassName=str_replace('[]' , '',str_replace('[=>]' , '',$method->return))}
                    {if $returnClassName =='int' || $returnClassName =='string' || $returnClassName =='boolean' || $returnClassName =='double' || $returnClassName =='float' || $returnClassName =='void'}
                    <li>return {$method->return}</li>
                    {else}
                    <li>return <a href="{jurl 'jWSDL~WSDL:index', array('service'=>$doc['service'], 'className'=>$returnClassName)}">{$method->return}</a></li>
                    {/if}
                    </ul>
                {/if}
                {$method->fullDescription}
            </dd>
            {/foreach}
            </dl>
        </div>
    </div>
    {/if}

    <div id="jelixpowered"><img src="{$j_jelixwww}design/images/jelix_powered.png" alt="jelix powered" /></div>
</div>
