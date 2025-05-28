<?php

namespace LizmapAdmin;

use Jelix\IniFile\IniModifier;

class LandingContent
{
    public const HTMLformCtrls = array(
        'TopHTMLContent' => 'landing_page_content',
        'BottomHTMLContent' => 'landing_page_content_bottom',
        'TopHTMLContentForAuth' => 'authed_landing_page_top_content',
        'BottomHTMLContentForAuth' => 'authed_landing_page_bottom_content',
    );
    public const iniSection = 'landing_page';

    private $iniFile;

    public function __construct()
    {
        $file = \jApp::varConfigPath('liveconfig.ini.php');
        $this->iniFile = new IniModifier($file);
    }

    public function initForm($form)
    {
        // HTML editors
        foreach (self::HTMLformCtrls as $ctrlName => $htmlFileName) {
            $contentFileName = \jApp::varPath('lizmap-theme-config/'.$htmlFileName.'.html');

            if (file_exists($contentFileName)) {
                $HTMLContent = \jFile::read($contentFileName);
                if ($HTMLContent) {
                    $form->setData($ctrlName, $HTMLContent);
                }
            }
        }
        // radio buttons
        $topPosition = $this->iniFile->getValue('top_auth_position', self::iniSection);
        if (empty($topPosition)) {
            $topPosition = 'hide';
        }
        $form->setData('topUnautedContentPosition', $topPosition);
        $bottomPosition = $this->iniFile->getValue('bottom_auth_position', self::iniSection);
        if (empty($bottomPosition)) {
            $bottomPosition = 'hide';
        }
        $form->setData('bottomUnautedContentPosition', $bottomPosition);
    }

    public function saveForm($form): bool
    {
        $ok = true;
        foreach (self::HTMLformCtrls as $ctrlName => $htmlFileName) {
            $contentFileName = \jApp::varPath('lizmap-theme-config/'.$htmlFileName.'.html');

            $fileWriteOK = \jFile::write($contentFileName, $form->getData($ctrlName));
            if (!$fileWriteOK) {
                $form->setErrorOn($ctrlName, \jLocale::get('admin~admin.landingPageContent.error.save'));
                $ok = false;
            }
        }

        try {
            $this->iniFile->setValue('top_auth_position', $form->getData('topUnautedContentPosition'), self::iniSection);
            $this->iniFile->setValue('bottom_auth_position', $form->getData('bottomUnautedContentPosition'), self::iniSection);
            $this->iniFile->save();
        } catch (\Exception $e) {
            $ok = false;
        }

        return $ok;
    }

    /**
     * generic method to get the content for authentified or unauthentified users
     * regarding the desired position stored using $positionConfig
     * and using the html identified by $keyForAuth and $keyForUnAuthed.
     *
     * @param string $positionConfig the config param name
     * @param string $keyForAuth     the inner key for the file storing HTML for authentified
     * @param string $keyForUnauthed the inner key for the file storing HTML for unauthentified
     *
     * @return string
     */
    private function getContentForView(string $positionConfig, string $keyForAuth, string $keyForUnauthed)
    {
        $filePathForAuth = \jApp::varPath('lizmap-theme-config/'.self::HTMLformCtrls[$keyForAuth].'.html');
        $filePathForUnauth = \jApp::varPath('lizmap-theme-config/'.self::HTMLformCtrls[$keyForUnauthed].'.html');
        if (\jAuth::isConnected()) {
            $position = $this->iniFile->getValue($positionConfig, self::iniSection);
            $files = array();

            switch ($position) {
                case 'hide':
                    $files = array($filePathForAuth);

                    break;

                case 'after':
                    $files = array($filePathForAuth, $filePathForUnauth);

                    break;

                case 'before':
                    $files = array($filePathForUnauth, $filePathForAuth);

                    break;

            }
        } else {
            $files = array($filePathForUnauth);
        }

        $content = '';
        foreach ($files as $filePath) {
            if (file_exists($filePath)) {
                $content .= \jFile::read($filePath);
            }
        }

        return $content;
    }

    public function getBottomContentForView()
    {
        return $this->getContentForView('bottom_auth_position', 'BottomHTMLContentForAuth', 'BottomHTMLContent');
    }

    public function getTopContentForView()
    {
        return $this->getContentForView('top_auth_position', 'TopHTMLContentForAuth', 'TopHTMLContent');
    }
}
