{if $id === null}

<h1>{@jelix~crud.title.create@}</h1>
{formfull $form, $submitAction}

{else}

<h1>{@jelix~crud.title.update@}</h1>
{formfull $form, $submitAction, array('id'=>$id, $offsetParameterName=>$page)}

{/if}



<p><a href="{jurl $listAction, array($offsetParameterName=>$page)}" class="crud-link">{@jelix~crud.link.return.to.list@}</a>.</p>