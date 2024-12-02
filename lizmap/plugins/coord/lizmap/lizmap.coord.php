<?php

class lizmapCoordPlugin implements jICoordPlugin
{
    /**
     * @param mixed $config
     */
    public function __construct($config)
    {
        if (array_key_exists('wmsPublicUrlList', $config['services']) && $config['services']['wmsPublicUrlList'] != '') {
            $publicUrlList = explode(',', $config['services']['wmsPublicUrlList']);
            $publicUrl = trim($publicUrlList[0]);
            $pos = strpos($publicUrl, '.');
            session_set_cookie_params(0, '/', substr($publicUrl, $pos));
        }
    }

    public function beforeAction($params) {}

    public function beforeOutput() {}

    public function afterProcess() {}
}
