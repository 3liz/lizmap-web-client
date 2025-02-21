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

class myHtmlResponse extends AbstractLizmapHtmlResponse
{
    public $bodyTpl = 'view~main';

    public function __construct()
    {
        parent::__construct();
        $this->prepareHeadContent();

        $this->title = 'LizMap list';

        // META
        $this->addMetaDescription('');
        $this->addMetaKeywords('');

        $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
        $this->addHeadContent('<meta name="Robots" content="all" />');
        $this->addHeadContent('<meta name="Rating" content="general" />');
        $this->addHeadContent('<meta name="Distribution" content="global" />');

        $this->addAssets('jquery_ui');
        $this->addAssets('bootstrap');
        $this->addAssets('normal');
    }

    protected function doAfterActions()
    {
        $this->body->assignIfNone('MAIN', '<p>no content</p>');
        $this->body->assignIfNone('repositoryLabel', 'Lizmap');
        $this->body->assignIfNone('isConnected', jAuth::isConnected());
        $this->body->assignIfNone('user', jAuth::getUserSession());
        $this->body->assignIfNone('auth_url_return', '');
        $this->body->assignIfNone('googleAnalyticsID', '');
        $this->body->assignIfNone('showHomeLink', true);

        parent::doAfterActions();
    }
}
