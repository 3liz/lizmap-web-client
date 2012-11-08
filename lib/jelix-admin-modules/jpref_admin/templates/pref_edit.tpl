<h1>{$title}</h1>

{formfull $form, 'jpref_admin~prefs:saveedit', array('id' => $id, 'field' => $field)}

<hr />
<p><a href="{jurl 'jpref_admin~prefs:index'}" class="crud-link">{@jelix~crud.link.return.to.list@}</a></p>