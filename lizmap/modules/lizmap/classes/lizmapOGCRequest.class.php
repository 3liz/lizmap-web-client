<?php
/**
* Manage OGC request.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2015 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

jClasses::inc('lizmap~lizmapProxy');
class lizmapOGCRequest {
    
    protected $project = null;
    
    protected $repository = null;
    
    protected $params = null;
    
    protected $services = null;
    
    protected $tplExceptions = null;

    /**
     * constructor
     * project : the project has a lizmapProject Class
     * params : the params array
     */
    public function __construct ( $project, $params ) {
        //print_r( $project != null );
        $this->project = $project;
        
        $this->repository = $project->getRepository();
        
        $this->services = lizmap::getServices();
        
        $params['map'] = realpath($this->repository->getPath()) . '/' . $project->getKey() . ".qgs";
        $this->params = lizmapProxy::normalizeParams( $params );
    }
    
    /**
    * Gets the value of a request parameter. If not defined, gets its default value.
    * @param string  $name           the name of the request parameter
    * @param mixed   $defaultValue   the default returned value if the parameter doesn't exists
    * @param boolean $useDefaultIfEmpty true: says to return the default value if the parameter value is ""
    * @return mixed the request parameter value
    */
    public function param($name, $defaultValue=null, $useDefaultIfEmpty=false){
        $name = strtolower( $name );
        if(isset($this->params[$name])){
            if($useDefaultIfEmpty && trim($this->params[$name]) == ''){
                return $defaultValue;
            }else{
                return $this->params[$name];
            }
        }else{
            return $defaultValue;
        }
    }
    
    public function process ( ) {
        return $this->{$this->param('request')}();
    }
    
    protected function serviceException ( ) {
        $messages = jMessage::getAll();
        $mime = 'text/plain';
        $data = implode('\n', $messages);
        
        if ( $this->tplExceptions !== null ) {
            $mime = 'text/xml';
            $tpl = new jTpl();
            $tpl->assign('messages', $messages);
            $data = $tpl->fetch( $this->tplExceptions );
        }
        
        return (object) array(
            'code' => 200,
            'mime' => $mime,
            'data' => $data,
            'cached' => False
        );
    }
    
    protected function getcapabilities ( ) {
        $cacheId = $this->repository->getKey().'_'.$this->project->getKey().'_'.$this->param('service');
        $hash = jCache::get($cacheId . '_hash');

        $cachedMime = jCache::get($cacheId . '_mime');
        $cachedData = jCache::get($cacheId . '_data');
        $newhash = md5_file( realpath($this->repository->getPath()) . '/' . $this->project->getKey() . ".qgs" );

        // Verifying cache content
        if ( $cachedData && preg_match( '#ServiceExceptionReport#i', $cachedData ) ) {
            $hash = null;
            $cachedMime = null;
            $cachedData = null;
            jCache::delete($cacheId . '_hash');
        }

        // Cache exists for the unchanged QGIS project file
        if( $hash and $cachedMime and $cachedData and $hash == $newhash ) {
            return (object) array(
                'code' => 200, // 304 ?
                'mime' => $cachedMime,
                'data' => $cachedData,
                'cached' => True
            );
        }
        
        // No cache or the file content has changed
        $url = $this->services->wmsServerURL.'?';

        $bparams = http_build_query($this->params);
        $querystring = $url . $bparams;

        // Get remote data
        $getRemoteData = lizmapProxy::getRemoteData(
          $querystring,
          $this->services->proxyMethod,
          $this->services->debugMode
        );
        $data = $getRemoteData[0];
        $mime = $getRemoteData[1];
        $code = $getRemoteData[2];
        
        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => False
        );

    }
  
}
