<?php

use Lizmap\App\FileTools;

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
        '*' => array('jacl2.right' => 'lizmap.admin.lizmap.log.view'),
        'emptyCounter' => array(
            'jacl2.right.and' => array('lizmap.admin.lizmap.log.view', 'lizmap.admin.lizmap.log.delete'),
        ),
        'emptyDetail' => array(
            'jacl2.right.and' => array('lizmap.admin.lizmap.log.view', 'lizmap.admin.lizmap.log.delete'),
        ),
        'eraseError' => array(
            'jacl2.right.and' => array('lizmap.admin.lizmap.log.view', 'lizmap.admin.lizmap.log.delete'),
        ),
    );

    /**
     * Display a summary of the logs.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get counter count
        $dao = jDao::get('lizmap~logCounter', 'lizlog');
        $conditions = jDao::createConditions();
        $counterNumber = $dao->countBy($conditions);

        // Get details count
        $dao = jDao::get('lizmap~logDetail', 'lizlog');
        $conditions = jDao::createConditions();
        $detailNumber = $dao->countBy($conditions);

        // Number of lines for logs
        $maxLinesToFetch = 200;

        // Get last admin log
        $lizmapLogPath = jApp::logPath('lizmap-admin.log');
        $lizmapLog = FileTools::tail($lizmapLogPath, $maxLinesToFetch);
        $lizmapLogTextArea = $this->logLinesDisplayTextArea($lizmapLog);

        $errorLogDisplay = !lizmap::getServices()->hideSensitiveProperties();
        $errorLogPath = jApp::logPath('errors.log');
        $errorLog = '';
        $errorLogTextArea = '';
        if ($errorLogDisplay) {
            // Get last error log
            $errorLog = FileTools::tail($errorLogPath, $maxLinesToFetch);
            $errorLogTextArea = $this->logLinesDisplayTextArea($errorLog);
        }

        // Display content via templates
        $tpl = new jTpl();
        $assign = array(
            'counterNumber' => $counterNumber,
            'detailNumber' => $detailNumber,
            'lizmapLog' => $lizmapLog,
            'lizmapLogBaseName' => basename($lizmapLogPath),
            'lizmapLogTextArea' => $lizmapLogTextArea,
            'errorLogDisplay' => $errorLogDisplay,
            'errorLog' => $errorLog,
            'errorLogBaseName' => basename($errorLogPath),
            'errorLogTextArea' => $errorLogTextArea,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('logs_view'));
        $rep->body->assign('selectedMenuItem', 'lizmap_logs');

        return $rep;
    }

    /**
     * Compute the height of the text area to use by default.
     *
     * @param string $log the log content
     *
     * @return int the number of lines for the text area
     */
    private function logLinesDisplayTextArea($log)
    {
        $maxLinesTextArea = 30;
        $minLinesTextArea = 10;

        $numberLines = substr_count($log, "\n");

        if ($numberLines < $minLinesTextArea) {
            // Log file < 10
            return $minLinesTextArea;
        }

        if ($numberLines < $maxLinesTextArea) {
            // 10 <= log file < 30
            return $numberLines;
        }

        // log file >= 30
        return $maxLinesTextArea;
    }

    /**
     * Display the logs counter.
     *
     * @return jResponseHtml
     */
    public function counter()
    {
        /** @var jResponseHtml $rep */
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
     *
     * @return jResponseRedirect
     */
    public function emptyCounter()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        // Get counter
        try {
            $cnx = jDb::getConnection('lizlog');
            $cnx->exec('DELETE FROM log_counter;');
            jMessage::add(jLocale::get('admin~admin.logs.empty.ok', array('log_counter')));
        } catch (Exception $e) {
            jLog::log('Error while emptying table log_counter', 'error');
        }

        $rep->action = 'admin~logs:index';

        return $rep;
    }

    /**
     * Display the detailed logs.
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
     *
     * @return jResponseBinary|jResponseRedirect
     */
    public function export()
    {

        // Get logs
        $dao = jDao::get('lizmap~logDetail', 'lizlog');
        $logs = null;

        try {
            $logs = $dao->findAll();
            $conditions = jDao::createConditions();
            $nblogs = $dao->countBy($conditions);
        } catch (Exception $e) {
            /** @var jResponseRedirect $rep */
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

        // Create temp file
        $tempPath = jApp::tempPath('export');
        jFile::createDir($tempPath);
        $fileName = tempnam($tempPath, 'lizmap_logs-');

        // Opening file
        $fp = fopen($fileName, 'w');
        // Adding encode utf8 to the file
        fprintf($fp, chr(0xEF).chr(0xBB).chr(0xBF));
        // Adding first CSV line
        fputcsv($fp, $columns);
        // Adding content
        foreach ($logs as $log) {
            $row = array();
            foreach ($columns as $column) {
                $row[] = $log->{$column};
            }
            fputcsv($fp, $row);
        }
        // Closing file
        fclose($fp);

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        // Create response
        $rep->mimeType = 'text/csv';
        $rep->addHttpHeader('charset', 'UTF-8');
        $rep->doDownload = true;
        $rep->deleteFileAfterSending = true;
        $rep->fileName = $fileName;
        $rep->outputFileName = 'lizmap_logs_'.date('YmdHi').'.csv';

        return $rep;
    }

    /**
     * Empty the detail logs table.
     *
     * @return jResponseRedirect
     */
    public function emptyDetail()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        // Get counter
        try {
            $cnx = jDb::getConnection('lizlog');
            $cnx->exec('DELETE FROM log_detail;');
            jMessage::add(jLocale::get('admin~admin.logs.empty.ok', array('log_detail')));
        } catch (Exception $e) {
            jLog::log('Error while emptying table log_detail', 'error');
        }

        $rep->action = 'admin~logs:index';

        return $rep;
    }

    /** Erase the error log file.
     *
     * @return jResponseRedirect
     */
    public function eraseError()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        // Erase the log file
        try {
            $logPath = jApp::logPath('lizmap-admin.log');
            jFile::write($logPath, '');
            jMessage::add(jLocale::get('admin~admin.logs.error.file.erase.ok', array('log_detail')));
        } catch (Exception $e) {
            jLog::log('Error while emptying the error log file', 'error');
        }

        $rep->action = 'admin~logs:index';

        return $rep;
    }
}
