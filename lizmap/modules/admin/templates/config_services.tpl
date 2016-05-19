{jmessage_bootstrap}
<h1>{@admin~admin.form.admin_services.h1@}</h1>
{formfull $form, 'admin~config:saveServices', array(), 'htmlbootstrap'}

<div>
  <a class="btn" href="{jurl 'admin~config:index'}">{@admin~admin.configuration.button.back.label@}</a>
</div>


<script>
{literal}

  var prefix = 'jforms_admin_config_services_';
  var cacheTypeInp = $('#' + prefix + 'cacheStorageType');
  var redisOptions = [
      'cacheRedisHost',
      'cacheRedisPort',
      'cacheRedisDb',
      'cacheRedisKeyPrefix'
  ];

  function onCacheStorageTypeChanged(){
    var isRedis = ( cacheTypeInp.val() == 'redis' );

    // reset form inputs for other types than selected
    for( var r in redisOptions ){
      var inp = redisOptions[r];
      $('#' + prefix + inp).parents('div.control-group:first').toggle(isRedis);
    }
  };

  cacheTypeInp.change(function(){
    onCacheStorageTypeChanged()
  });

  onCacheStorageTypeChanged()

{/literal}
</script>
