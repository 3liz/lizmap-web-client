
var ServiceConfiguration = {
    prefix: 'jforms_admin_config_services_',
    cacheTypeInp: null,
    redisOptions:  [
        'cacheRedisHost',
        'cacheRedisPort',
        'cacheRedisDb',
        'cacheRedisKeyPrefix'
    ],

    init: function() {
        this.cacheTypeInp = $('#' + this.prefix + 'cacheStorageType');
        this.cacheTypeInp.change(this.onCacheStorageTypeChanged.bind(this));
        this.onCacheStorageTypeChanged();
    },

    onCacheStorageTypeChanged: function (){
        var isRedis = ( this.cacheTypeInp.val() == 'redis' );

        // reset form inputs for other types than selected
        for( var r in this.redisOptions ){
            var inp = this.redisOptions[r];
            $('#' + this.prefix + inp).parents('div.control-group:first').toggle(isRedis);
        }
    }
};

$(document).ready(function(){
    ServiceConfiguration.init();
});


