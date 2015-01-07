{jmessage_bootstrap}

<div>
  <a class="btn" href="{jurl 'view~default:index'}">{@view~user.form.button.back.label@}</a>
</div>

<h1>{@view~user.form.createAccount.h1@}</h1>
{formfull $form, 'view~user:saveAccount', array(), 'htmlbootstrap'}
