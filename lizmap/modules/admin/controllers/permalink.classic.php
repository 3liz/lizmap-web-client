<?php

/**
 * Lizmap administration : Permalinks management.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class permalinkCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.permalink.manage'),
    );

    /**
     * Get the permalink main page.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get counter count
        $dao = jDao::get('lizmap~permalink');
        $conditions = jDao::createConditions();
        $counterNumber = $dao->countBy($conditions);

        // Display content via templates
        $tpl = new jTpl();
        $assign = array(
            'counterNumber' => $counterNumber,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('permalink_view'));
        $rep->body->assign('selectedMenuItem', 'lizmap_permalinks');

        return $rep;
    }

    /**
     * Display the list of permalink.
     *
     * @return jResponseHtml
     */
    public function detail()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        $maxvisible = 50;
        $page = $this->intParam('page');
        if (!$page) {
            $page = 1;
        }
        $offset = $page * $maxvisible - $maxvisible;

        // Get details
        $dao = jDao::get('lizmap~permalink');

        $detail = $dao->getPermalinkPage($offset, $maxvisible);

        // Display content via templates
        $tpl = new jTpl();
        $assign = array(
            'detail' => $detail,
            'page' => $page,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('permalink_detail'));
        $rep->body->assign('selectedMenuItem', 'lizmap_permalinks');

        return $rep;
    }

    /**
     * Delete the permalinks last used before the specified number of days.
     *
     * @return jResponseRedirect
     */
    public function deleteByLastUsage()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->action = 'admin~permalink:index';
        if (
            !$this->param('permalink-lastusage-filter')
            || !is_numeric($this->param('permalink-lastusage-filter'))
            || intval($this->param('permalink-lastusage-filter')) <= 0
        ) {
            jMessage::add(jLocale::get('admin~admin.permalink.manager.lastusage.error.invaliddays'), 'error');
        } else {
            $days = intval($this->param('permalink-lastusage-filter'));
            $date = new DateTime();
            $date->modify("-{$days} day");

            $dao = jDao::get('lizmap~permalink');

            try {
                $permalinOnDelete = $dao->selectByLastUsage($date->format('Y-m-d'));
                if ($permalinOnDelete == null || $permalinOnDelete->rowCount() == 0) {
                    jMessage::add(jLocale::get('admin~admin.permalink.manager.lastusage.norecords'));
                } else {
                    $dao->deleteByLastUsage($date->format('Y-m-d'));
                    jMessage::add(
                        jLocale::get(
                            'admin~admin.permalink.manager.lastusage.ok',
                            array($permalinOnDelete->rowCount())
                        )
                    );
                }
            } catch (Exception $e) {
                jLog::log($e->getMessage(), 'error');
                jMessage::add(jLocale::get('admin~admin.permalink.manager.lastusage.error'), 'error');
            }
        }

        return $rep;
    }

    /**
     * Empty the permalinks table.
     *
     * @return jResponseRedirect
     */
    public function emptyPermalink()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        $dao = jDao::get('lizmap~permalink');

        try {
            $dao->deleteAll();
            jMessage::add(jLocale::get('admin~admin.permalink.manager.empty.ok'));
        } catch (Exception $e) {
            jMessage::add(jLocale::get('admin~admin.permalink.manager.empty.error'), 'error');
        }

        $rep->action = 'admin~permalink:index';

        return $rep;
    }
}
