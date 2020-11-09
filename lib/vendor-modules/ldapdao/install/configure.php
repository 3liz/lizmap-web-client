<?php
/**
 * @author      Laurent Jouanneau
 * @copyright   2018 Laurent Jouanneau
 * @licence     MPL
 */
use \Jelix\Installer\Module\API\ConfigurationHelpers;

class ldapdaoModuleConfigurator extends \Jelix\Installer\Module\Configurator {

    public function getDefaultParameters()
    {
        return array(
            'noconfigfile' => false
        );
    }

    public function configure(ConfigurationHelpers $helpers) {

        $this->parameters['noconfigfile'] = $helpers->cli()
            ->askConfirmation('Do you want to create authldap.coord.ini.php?',
                $this->parameters['noconfigfile']);

        if (!$this->getParameter('noconfigfile')) {
            $helpers->copyFile('authldap.coord.ini.php', 'config:authldap.coord.ini.php', false);
        }
    }

    public function localConfigure(\Jelix\Installer\Module\API\LocalConfigurationHelpers $helpers) {
        $profiles = $helpers->getProfilesIni();
        if (!$profiles->isSection('ldap:ldapdao')) {
            $profiles->setValues(array(
                'hostname'      =>  'localhost',
                'port'          =>  389,
                'adminUserDn'      =>  null,
                'adminPassword'      =>  null,
                'protocolVersion'   =>  3,
                'searchUserBaseDN' => '',
                'searchGroupFilter' => '',
                'searchGroupProperty' => '',
                'searchGroupBaseDN' => ''
            ), 'ldap:ldapdao');
        }
    }

}