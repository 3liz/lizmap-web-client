<?php
/**
 * @package      jelix
 * @subpackage   core_config_plugin
 * @author       Laurent Jouanneau
 * @copyright    2019 Laurent Jouanneau
 * @link         http://jelix.org
 * @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */


class jqueryConfigCompilerPlugin implements \jelix\core\ConfigCompilerPluginInterface {

    function getPriority() {
        return 30;
    }

    protected $jqBasePath;
    protected $jelixWWW;
    protected $basePath;

    /**
     * @param object $config
     */
    function atStart($config) {

        $this->jqBasePath = $config->urlengine['jqueryPath'];
        $this->jelixWWW = $config->urlengine['jelixWWWPath'];
        $this->basePath = $config->urlengine['basePath'];
        $config->jquery['jquery'] = $this->replacePath($config->jquery['jquery']);
        $config->jquery['jqueryui.js'] = $this->replacePath($config->jquery['jqueryui.js'], true);
        $config->jquery['jqueryui.css'] = $this->replacePath($config->jquery['jqueryui.css'], true);

        foreach($config->datepickers as $key=>$value) {
            $config->datepickers[$key] = $this->replacePath($value, strpos($key, '.') !== false);
        }
        foreach($config->datetimepickers as $key=>$value) {
            $config->datetimepickers[$key] = $this->replacePath($value, strpos($key, '.') !== false);
        }
        foreach($config->htmleditors as $key=>$value) {
            if (!preg_match('/\.engine\.name$/', $key)) {
                $config->htmleditors[$key] = $this->replacePath($value, strpos($key, '.file') !== false);
            }
        }
        foreach($config->wikieditors as $key=>$value) {
            if (preg_match('/\.(file|path|skin)$/', $key)) {
                $config->wikieditors[$key] = $this->replacePath($value);
            }
        }
    }

    protected function replacePath($value, $forceArray = false) {
        if (is_array($value)) {
            foreach ($value as $k=>$v) {
                $value[$k] = $this->_replacePath($v);;
            }
        }
        else {
            $value = $this->_replacePath($value);
            if ($forceArray) {
                $value = array($value);
            }
        }
        return $value;
    }

    protected function _replacePath($value) {
        if ($value == '') {
            return '';
        }
        if ($value[0] == '$') {
            $value = str_replace('$jqueryPath', $this->jqBasePath, $value);
            $value = str_replace('$jelix', $this->jelixWWW, $value);
        }
        else if ($value[0] != '/') {
            // the given path is related to the basePath
            $value = $this->basePath.$value;
        }
        return str_replace('//', '/', $value);
    }


    function onModule($config, $moduleName, $modulePath, $xml) {

    }

    function atEnd($config) {

    }
}
