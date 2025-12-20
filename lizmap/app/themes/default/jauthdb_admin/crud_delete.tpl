<h1>{@jauthdb_admin~crud.title.delete@} {$id}</h1>
<div class="container">
<form action="{formurl 'default:delete', array('j_user_login'=>$id)}" method="post">
  <fieldset>
    <legend>{@jauthdb_admin~crud.confirmation@}</legend>
    {formurlparam 'default:delete', array('j_user_login'=>$id)}
    <div class="form-group row mb-3">
    {@jauthdb_admin~crud.confirm.deletion@}
    </div>

    <div class="form-group row mb-3">
      <label class="form-label" for="pwd_confirm">{@jauthdb_admin~crud.confirm.password@}</label>
      <input type="password" id="pwd_confirm" name="pwd_confirm" class="form-control" />
    </div>

    <div class="form-actions">
      <input type="submit" value="{@jauthdb_admin~crud.confirm@}" class="btn btn-sm"/>
    </div>
  </fieldset>
</form>

<p><a href="{jurl 'default:view', array('j_user_login'=>$id)}" class="crud-link btn btn-sm">{@jauthdb_admin~crud.link.return.to.view@}</a></p>
</div>
