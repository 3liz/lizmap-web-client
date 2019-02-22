<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Baptiste Toinot
* @contributor Laurent Jouanneau
* @copyright   2008 Baptiste Toinot, 2011-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
*
*/
require_once(JELIX_LIB_PATH.'tpl/jTpl.class.php');

/**
* Sitemap 0.9 response
*
* @package jelix
* @subpackage core_response
* @link http://www.sitemaps.org/
* @since 1.2
*/
class jResponseSitemap extends jResponse {

    /**
    * Ident of the response type
    * @var string
    */
    protected $_type = 'sitemap';

    /**
    * Frequency change url
    * @var array
    */
    protected $allowedChangefreq = array('always', 'hourly', 'daily', 'weekly',
                                         'monthly', 'yearly', 'never');
    /**
    * Maximum number of URLs for a sitemap index file
    * @var int
    */
    protected $maxSitemap = 1000;

    /**
    * Maximum number of URLs for a sitemap file
    * @var int
    */
    protected $maxUrl = 50000;

    /**
    * List of URLs for a sitemap index file
    * @var jSitemapIndex[]
    */
    protected $urlSitemap = array();

    /**
     * List of URLs for a sitemap file
     * @var jSitemapUrl[]
     */
    protected $urlList = array();

    /**
     * The template container
     * @var jTpl
     */
    public $content;

    /**
     * Selector of the template file
     * @var string
     */
    public $contentTpl;

    /**
     * Class constructor
     *
     * @return void
     */
    public function __construct() {
        $this->content  = new jTpl();
        $this->contentTpl = 'jelix~sitemap';
        parent::__construct();
    }

    /**
     * Generate the content and send it
     * Errors are managed
     * @return boolean true if generation is ok, else false
     */
    final public function output() {
        
        if($this->_outputOnlyHeaders){
            $this->sendHttpHeaders();
            return true;
        }
        
        $this->_httpHeaders['Content-Type'] = 'application/xml;charset=UTF-8';

        if (count($this->urlSitemap)) {
            $head = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
            $foot = '</sitemapindex>';
            $this->contentTpl = 'jelix~sitemapindex';
            $this->content->assign('sitemaps', $this->urlSitemap);
        } else {
            $head = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
            $foot = '</urlset>';
            $this->content->assign('urls', $this->urlList);
        }
        $content = $this->content->fetch($this->contentTpl);

        // content is generated, no errors, we can send it
        $this->sendHttpHeaders();
        echo '<?xml version="1.0" encoding="UTF-8"?>', "\n";
        echo $head, $content, $foot;
        return true;
    }

    /**
     * add a URL in a sitemap file
     * @param string $loc URL of the page
     * @param string $lastmod The date of last modification of the file
     * @param string $changefreq How frequently the page is likely to change
     * @param string $priority The priority of this URL relative to other URLs
     * @return boolean true if addition is ok, else false
     */
    public function addUrl($loc, $lastmod = null, $changefreq = null, $priority = null) {

        if (isset($loc[2048]) || count($this->urlList) >= $this->maxUrl) {
            return false;
        }

        $url = new jSitemapUrl();
        $url->loc = jApp::coord()->request->getServerURI() . $loc;

        if (($timestamp = strtotime($lastmod))) {
            $url->lastmod = date('c', $timestamp);
        }

        if ($changefreq && in_array($changefreq, $this->allowedChangefreq)) {
            $url->changefreq = $changefreq;
        }

        if ($priority && is_numeric($priority) && $priority >= 0 && $priority <= 1) {
            $url->priority = sprintf('%0.1f', $priority);
        }

        $this->urlList[] = $url;
        return true;
    }

    /**
     * add a URL in a sitemap file
     * @param string $loc URL of sitemap file
     * @param string $lastmod The date of last modification of the sitemap file
     * @return boolean true if addition is ok, else false
     */
    public function addSitemap($loc, $lastmod = null) {

        if (isset($loc[2048]) || count($this->urlSitemap) >= $this->maxSitemap) {
            return false;
        }

        $sitemap = new jSitemapIndex();
        $sitemap->loc = jApp::coord()->request->getServerURI() . $loc;

        if (($timestamp = strtotime($lastmod))) {
            $sitemap->lastmod = date('c', $timestamp);
        }

        $this->urlSitemap[] = $sitemap;
        return true;
    }

    /**
     * Add URLs automatically from urls.xml
     * @return void
     */
    public function importFromUrlsXml() {
        $urls = $this->_parseUrlsXml();
        foreach ($urls as $url) {
            $this->addUrl($url);
        }
    }

    /**
     * Return pathinfo URLs automatically from urls.xml
     * @return array
     */
    public function getUrlsFromUrlsXml() {
        return $this->_parseUrlsXml();
    }

    /**
     * Submitting a sitemap by sending an HTTP request
     * @return boolean
     */
    public function ping($uri) {
        $parsed_url = parse_url($uri);
        if (!$parsed_url || !is_array($parsed_url)) {
            return false;
        }
        $http = new jHttp($parsed_url['host']);
        $http->get($parsed_url['path'] . '?' . $parsed_url['query']);
        if ($http->getStatus() != 200) {
            return false;
        }
        return true;
    }

    /**
     * Parse urls.xml and return pathinfo URLs
     * @return array
     */
    protected function _parseUrlsXml() {

        $urls = array();

        $conf = &jApp::config()->urlengine;
        $significantFile = $conf['significantFile'];
        $basePath = $conf['basePath'];
        $epExt = ($conf['multiview'] ? '.php':'');

        $file = jApp::tempPath('compiled/urlsig/' . $significantFile . '.creationinfos_15.php');

        if (file_exists($file)) {
            require $file;
            foreach ($GLOBALS['SIGNIFICANT_CREATEURL'] as $selector => $createinfo) {
                if ($createinfo[0] != 1 && $createinfo[0] != 4) {
                    continue;
                }
                if ($createinfo[0] == 4) {
                    foreach ($createinfo as $k => $createinfo2) {
                        if ($k == 0) continue;

                        if ($createinfo2[2] == true // https needed -> we don't take this url. FIXME
                         ||count($createinfo2[3]) ) { // there are some dynamique parameters, we don't take it this we cannot guesse dynamic parameters
                            continue;
                        }
                        $urls[] = $basePath.($createinfo2[1]?$createinfo2[1].$epExt:'').$createinfo2[5];
                    }
                }
                else if ($createinfo[2] == true // https needed -> we don't take this url. FIXME
                         ||  count($createinfo[3]) ) { // there are some dynamique parameters, we don't take it this we cannot guesse dynamic parameters
                    continue;
                }
                else {
                    $urls[] = $basePath.($createinfo[1]?$createinfo[1].$epExt:'').$createinfo[5];
                }
            }
        }
        return $urls;
    }
}

/**
 * Content of a URL
 * @package jelix
 * @subpackage core_response
 * @since 1.2
 */
class jSitemapUrl {

    /**
     * URL of the page
     * @var string
     */
    public $loc;

    /**
     * The date of last modification of the page
     * @var string
     */
    public $lastmod;

    /**
     * How frequently the page is likely to change
     * @var string
     */
    public $changefreq;

    /**
     * The priority of this URL relative to other URLs
     * @var string
     */
    public $priority;
}

/**
 * Content of a sitemap file
 * @package    jelix
 * @subpackage core_response
 * @since 1.2
 */
class jSitemapIndex {

    /**
     * URL of the sitemap file
     * @var string
     */
    public $loc;

    /**
     * The date of last modification of the sitemap file
     * @var string
     */
    public $lastmod;
}
