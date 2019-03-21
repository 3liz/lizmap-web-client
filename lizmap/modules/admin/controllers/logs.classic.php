<?php
/**
 * Lizmap administration : logs.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class logsCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.access'),
    );

    /**
     * Display a summary of the logs.
     */
    public function index()
    {
        $rep = $this->getResponse('html');

        // Get counter count
        $dao = jDao::get('lizmap~logCounter', 'lizlog');
        $conditions = jDao::createConditions();
        $counterNumber = $dao->countBy($conditions);

        // Get details count
        $dao = jDao::get('lizmap~logDetail', 'lizlog');
        $conditions = jDao::createConditions();
        $detailNumber = $dao->countBy($conditions);

        // Get last error log
        $logPath = jApp::varPath('log/errors.log');
        $errorLog = '';
        $lines = 50;
        if (is_file($logPath)) {
            // Only display content if the file is small to avoid memory issues
            if (filesize($logPath) > 512000) {
                $errorLog = 'toobig';
            } else {
                $errorLog = trim(implode('', array_slice(file($logPath), -$lines)));
                $errorLog = htmlentities($errorLog);
            }
        }

        // Display content via templates
        $tpl = new jTpl();
        $assign = array(
            'counterNumber' => $counterNumber,
            'detailNumber' => $detailNumber,
            'errorLog' => $errorLog,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('logs_view'));
        $rep->body->assign('selectedMenuItem', 'lizmap_logs');

        return $rep;
    }

    /**
     * Display the logs counter.
     */
    public function counter()
    {
        $rep = $this->getResponse('html');

        // Get counter
        $dao = jDao::get('lizmap~logCounter', 'lizlog');
        $counter = $dao->getSortedCounter();

        // Display content via templates
        $tpl = new jTpl();
        $assign = array(
            'counter' => $counter,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('logs_counter'));
        $rep->body->assign('selectedMenuItem', 'lizmap_logs');

        return $rep;
    }

    /**
     * Empty the counter logs table.
     */
    public function emptyCounter()
    {
        $rep = $this->getResponse('redirect');

        // Get counter
        $cnx = jDb::getConnection('lizlog');

        try {
            $cnx->exec('DELETE FROM log_counter;');
            jMessage::add(jLocale::get('admin~admin.logs.empty.ok', array('log_counter')));
        } catch (Exception $e) {
            jLog::log('Error while emptying table log_counter ');
        }

        $rep->action = 'admin~logs:index';

        return $rep;
    }

    /**
     * Display the detailed logs.
     */
    public function detail()
    {
        $rep = $this->getResponse('html');

        $maxvisible = 50;
        $page = $this->intParam('page');
        if (!$page) {
            $page = 1;
        }
        $offset = $page * $maxvisible - $maxvisible;

        // Get details
        $dao = jDao::get('lizmap~logDetail', 'lizlog');
        $detail = $dao->getDetailRange($offset, $maxvisible);

        // Display content via templates
        $tpl = new jTpl();
        $assign = array(
            'detail' => $detail,
            'page' => $page,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('logs_detail'));
        $rep->body->assign('selectedMenuItem', 'lizmap_logs');

        return $rep;
    }

    /**
     * Export the detailed logs in CSV.
     */
    public function export()
    {

    // Get logs
        $dao = jDao::get('lizmap~logDetail', 'lizlog');
        $nblogs = 0;
        $logs = null;

        try {
            $logs = $dao->findAll();
            $conditions = jDao::createConditions();
            $nblogs = $dao->countBy($conditions);
        } catch (Exception $e) {
            $rep = $this->getResponse('redirect');
            jMessage::add('Error : '.$e->getMessage(), 'error');
            $rep->action = 'admin~logs:index';

            return $rep;
        }

        // Récupération des colonnes
        $fetch = $logs->fetch();
        $columns = array();
        if ($nblogs > 0) {
            $fetchArray = get_object_vars($fetch);
            $columns = array_keys($fetchArray);
        }

        $rep = $this->getResponse('binary');
        $rep->mimeType = 'text/csv';
        $rep->addHttpHeader('charset', 'UTF-8');
        $rep->doDownload = true;
        $rep->fileName = 'lizmap_logs.csv';

        $data = array();
        $data[] = '"'.implode('";"', $columns).'"';
        foreach ($logs as $log) {
            $row = array();
            foreach ($columns as $column) {
                $row[] = $log->{$column};
            }
            $data[] = '"'.implode('";"', $row).'"';
        }
        $rep->content = implode("\r\n", $data);

        return $rep;
    }

    /**
     * Empty the detail logs table.
     */
    public function emptyDetail()
    {
        $rep = $this->getResponse('redirect');

        // Get counter
        $cnx = jDb::getConnection('lizlog');

        try {
            $cnx->exec('DELETE FROM log_detail;');
            jMessage::add(jLocale::get('admin~admin.logs.empty.ok', array('log_detail')));
        } catch (Exception $e) {
            jLog::log('Error while emptying table log_detail ');
        }

        $rep->action = 'admin~logs:index';

        return $rep;
    }

    // Erase the error log file
    public function eraseError()
    {
        $rep = $this->getResponse('redirect');

        // Erase the log file
        try {
            $logPath = jApp::varPath('log/errors.log');
            jFile::write($logPath, '');
            jMessage::add(jLocale::get('admin~admin.logs.error.file.erase.ok', array('log_detail')));
        } catch (Exception $e) {
            jLog::log('Error while emptying the error log file');
        }

        $rep->action = 'admin~logs:index';

        return $rep;
    }
}
