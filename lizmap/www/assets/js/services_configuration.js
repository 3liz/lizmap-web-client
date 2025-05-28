
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

        var f = jFormsJQ.getForm("jforms_admin_config_services");
        if (f.getControl("adminSenderEmail")) { // may not exists when sensible fields are hidden
            f.addSubmitHandler(function (event) {
                // set the adminSenderEmail field as required if allowUserAccountRequests
                // or adminContactEmail are set. jFormsJQ will then check the requirement
                // and will show errors
                var accountRequestEnabled = (jFormsJQ.getValue(f.element.elements["allowUserAccountRequests"]) === 'on');
                var adminContactEmail = jFormsJQ.getValue(f.element.elements["adminContactEmail"]);
                var notificationEnabled = ( adminContactEmail !== '' && adminContactEmail !== null);
                f.getControl("adminSenderEmail").required = (accountRequestEnabled || notificationEnabled);
                return true;
            }, true);
        }
    },

    onCacheStorageTypeChanged: function () {
        var isRedis = ( this.cacheTypeInp.val() == 'redis' );

        // reset form inputs for other types than selected
        for (var r in this.redisOptions) {
            var inp = this.redisOptions[r];
            $('#' + this.prefix + inp).parents('div.control-group:first').toggle(isRedis);
        }
    }
};

$(document).ready(function() {
    ServiceConfiguration.init();
});
