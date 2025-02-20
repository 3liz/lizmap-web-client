<?php

/**
 * HTML Jelix response for full screen map.
 *
 * @author    3liz
 * @copyright 2011-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once __DIR__.'/AbstractLizmapHtmlResponse.php';

class myHtmlMapResponse extends AbstractLizmapHtmlResponse
{
    public $bodyTpl = 'view~map';

    public function __construct()
    {
        parent::__construct();
        $this->prepareHeadContent();

        $bp = jApp::urlBasePath();

        $this->title = '';

        // META
        $this->addMetaDescription('');
        $this->addMetaKeywords('');

        $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');

        $this->addCSSLink($bp.'assets/css/print_popup.css', array('media' => 'print'));

        $this->addAssets('jquery_ui');
        $this->addAssets('bootstrap');
        $this->addAssets('datatables');
        $this->addAssets('map');

        $this->setBodyAttributes(array('data-proj4js-lib-path' => $bp.'assets/js/Proj4js/'));
    }

    protected function doAfterActions()
    {
        $this->body->assignIfNone('MAIN', '');
        $this->body->assignIfNone('repositoryLabel', 'Lizmap');
        $this->body->assignIfNone('isConnected', jAuth::isConnected());
        $this->body->assignIfNone('user', jAuth::getUserSession());
        $this->body->assignIfNone('auth_url_return', '');
        $this->body->assignIfNone('googleAnalyticsID', '');

        parent::doAfterActions();
    }
}
