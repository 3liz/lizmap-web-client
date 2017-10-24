<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin
* @copyright   2006-2011 Laurent Jouanneau
* @copyright   2008-2011 Julien Issler, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  jelix-plugins
 */

//include_once(JELIX_LIB_PATH.'forms/Builder/HtmlBuilder.php');

class htmlbootstrapFormBuilder extends \jelix\forms\Builder\HtmlBuilder {

    protected $jFormsJsVarName = 'jFormsJQ';

    protected $options;

    protected $isRootControl = true;

    public function outputAllControls() {

        $modal = False;
        if ( isset($this->options['modal']) && $this->options['modal'] )
          $modal = True;
        echo '<div class="jforms-table" border="0">';
        foreach( $this->_form->getRootControls() as $ctrlref=>$ctrl){
            if($ctrl->type == 'submit' || $ctrl->type == 'reset' || $ctrl->type == 'hidden') continue;
            if(!$this->_form->isActivated($ctrlref)) continue;
            if($ctrl->type == 'group') {
                $this->outputControl($ctrl);
            }else{
                echo '<div class="control-group">';
                $this->outputControlLabel($ctrl);
                echo '<div class="controls">';
                $this->outputControl($ctrl);
                echo "</div>\n";
                echo "</div>\n";
            }
        }
        echo "</div>\n";
        if ($modal)
          echo "</div>\n";
        if ($modal)
          echo '<div class="modal-footer"><div class="jforms-submit-buttons">';
        else
          echo '<div class="jforms-submit-buttons form-actions">';
        if ( $ctrl = $this->_form->getReset() ) {
            if($this->_form->isActivated($ctrl->ref)) {
                $this->outputControl($ctrl);
                echo ' ';
            }
        }
        foreach( $this->_form->getSubmits() as $ctrlref=>$ctrl){
            if(!$this->_form->isActivated($ctrlref)) continue;
            $this->outputControl($ctrl);
            echo ' ';
        }
        if ( isset($this->options['cancel']) && $this->options['cancel'] )
          if ( isset($this->options['cancelLocale']) )
            echo '<button class="btn" data-dismiss="modal" aria-hidden="true">', jLocale::get($this->options['cancelLocale']),'</button>';
          else
            echo '<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>';
        echo "</div>\n";
        if ($modal)
          echo "</div>\n";
    }

    public function outputMetaContent($t) {
        $resp= jApp::coord()->response;
        if($resp === null || $resp->getType() !='html'){
            return;
        }
        $confUrlEngine = &jApp::config()->urlengine;
        $confHtmlEditor = &jApp::config()->htmleditors;
        $confDate = &jApp::config()->datepickers;
        $confWikiEditor = &jApp::config()->wikieditors;
        $www = $confUrlEngine['jelixWWWPath'];
        $jq = $confUrlEngine['jqueryPath'];
        $bp = $confUrlEngine['basePath'];
        $resp->addJSLink($jq.'include/jquery.include.js');
        $resp->addJSLink($www.'js/jforms_jquery.js');
        $resp->addCSSLink($www.'design/jform.css');
        foreach($t->_vars as $k=>$v){
            if(!$v instanceof jFormsBase)
                continue;
            foreach($v->getHtmlEditors() as $ed) {
                if(isset($confHtmlEditor[$ed->config.'.engine.file'])){
                    if(is_array($confHtmlEditor[$ed->config.'.engine.file'])){
                        foreach($confHtmlEditor[$ed->config.'.engine.file'] as $url) {
                            $resp->addJSLink($bp.$url);
                        }
                    }else
                        $resp->addJSLink($bp.$confHtmlEditor[$ed->config.'.engine.file']);
                }

                if(isset($confHtmlEditor[$ed->config.'.config']))
                    $resp->addJSLink($bp.$confHtmlEditor[$ed->config.'.config']);

                $skin = $ed->config.'.skin.'.$ed->skin;

                if(isset($confHtmlEditor[$skin]) && $confHtmlEditor[$skin] != '')
                    $resp->addCSSLink($bp.$confHtmlEditor[$skin]);
            }

            $datepicker_default_config = jApp::config()->forms['datepicker'];

            foreach($v->getControls() as $ctrl){
                if($ctrl instanceof jFormsControlDate || get_class($ctrl->datatype) == 'jDatatypeDate' || get_class($ctrl->datatype) == 'jDatatypeLocaleDate'){
                    $config = isset($ctrl->datepickerConfig)?$ctrl->datepickerConfig:$datepicker_default_config;
                    $resp->addJSLink($bp.$confDate[$config]);
                }
            }

            foreach($v->getWikiEditors() as $ed) {
                if(isset($confWikiEditor[$ed->config.'.engine.file']))
                    $resp->addJSLink($bp.$confWikiEditor[$ed->config.'.engine.file']);
                if(isset($confWikiEditor[$ed->config.'.config.path'])) {
                    $p = $bp.$confWikiEditor[$ed->config.'.config.path'];
                    $resp->addJSLink($p.jApp::config()->locale.'.js');
                    $resp->addCSSLink($p.'style.css');
                }
                if(isset($confWikiEditor[$ed->config.'.skin']))
                    $resp->addCSSLink($bp.$confWikiEditor[$ed->config.'.skin']);
            }
        }
    }

    protected function outputHeaderScript(){
        $conf = jApp::config()->urlengine;
        // no scope into an anonymous js function, because jFormsJQ.tForm is used by other generated source code
        echo '<script type="text/javascript">
//<![CDATA[
jFormsJQ.selectFillUrl=\''.jUrl::get('jelix~jforms:getListData').'\';
jFormsJQ.config = {locale:'.$this->escJsStr(jApp::config()->locale).
    ',basePath:'.$this->escJsStr($conf['basePath']).
    ',jqueryPath:'.$this->escJsStr($conf['jqueryPath']).
    ',jelixWWWPath:'.$this->escJsStr($conf['jelixWWWPath']).'};
jFormsJQ.tForm = new jFormsJQForm(\''.$this->_name.'\',\''.$this->_form->getSelector().'\',\''.$this->_form->getContainer()->formId.'\');
jFormsJQ.tForm.setErrorDecorator(new '.$this->options['errorDecorator'].'());
jFormsJQ.declareForm(jFormsJQ.tForm);
//]]>
</script>';
    }

    /**
     * output the header content of the form
     * @param array $params some parameters <ul>
     *      <li>"errDecorator"=>"name of your javascript object for error listener"</li>
     *      <li>"method" => "post" or "get". default is "post"</li>
     *      </ul>
     */
    public function outputHeader(){
        $this->options = array_merge(array('errorDecorator'=>$this->jFormsJsVarName.'ErrorDecoratorHtml',
            'method'=>'post'), $this->options);
        if (isset($this->options['attributes']))
            $attrs = $this->options['attributes'];
        else
            $attrs = array();

        echo '<form';
        if (preg_match('#^https?://#',$this->_action)) {
            $urlParams = $this->_actionParams;
            $attrs['action'] = $this->_action;
        } else {
            $url = jUrl::get($this->_action, $this->_actionParams, 2); // returns the corresponding jurl
            $urlParams = $url->params;
            $attrs['action'] = $url->getPath();
        }
        $attrs['method'] = $this->options['method'];
        $attrs['id'] = $this->_name;
        $attrs['class'] = 'form-horizontal';

        if($this->_form->hasUpload())
            $attrs['enctype'] = "multipart/form-data";

        $this->_outputAttr($attrs);
        echo '>';

        $this->outputHeaderScript();

        if ( isset($this->options['modal']) && $this->options['modal'] )
          echo '<div class="modal-body">';

        $hiddens = '';
        foreach ($urlParams as $p_name => $p_value) {
            $hiddens .= '<input type="hidden" name="'. $p_name .'" value="'. htmlspecialchars($p_value). '"'.$this->_endt. "\n";
        }

        foreach ($this->_form->getHiddens() as $ctrl) {
            if(!$this->_form->isActivated($ctrl->ref)) continue;
            $hiddens .= '<input type="hidden" name="'. $ctrl->ref.'" id="'.$this->_name.'_'.$ctrl->ref.'" value="'. htmlspecialchars($this->_form->getData($ctrl->ref)). '"'.$this->_endt. "\n";
        }

        if($this->_form->securityLevel){
            $tok = $this->_form->createNewToken();
            $hiddens .= '<input type="hidden" name="__JFORMS_TOKEN__" value="'.$tok.'"'.$this->_endt. "\n";
        }

        if($hiddens){
            echo '<div class="jforms-hiddens">',$hiddens,'</div>';
        }

        $errors = $this->_form->getContainer()->errors;
        if(count($errors)){
            $ctrls = $this->_form->getControls();
            echo '<div id="'.$this->_name.'_errors" class="alert alert-block alert-error jforms-error-list">';
            $errRequired='';
            foreach($errors as $cname => $err){
                if(array_key_exists( $cname, $ctrls ) && !$this->_form->isActivated($ctrls[$cname]->ref)) continue;
                if ($err === jForms::ERRDATA_REQUIRED) {
                    if ($ctrls[$cname]->alertRequired){
                        echo '<p>', $ctrls[$cname]->alertRequired,'</p>';
                    }
                    else {
                        echo '<p>', jLocale::get('jelix~formserr.js.err.required', $ctrls[$cname]->label),'</p>';
                    }
                }else if ($err === jForms::ERRDATA_INVALID) {
                    if($ctrls[$cname]->alertInvalid){
                        echo '<p>', $ctrls[$cname]->alertInvalid,'</p>';
                    }else{
                        echo '<p>', jLocale::get('jelix~formserr.js.err.invalid', $ctrls[$cname]->label),'</p>';
                    }
                }
                elseif ($err === jForms::ERRDATA_INVALID_FILE_SIZE) {
                    echo '<p>', jLocale::get('jelix~formserr.js.err.invalid.file.size', $ctrls[$cname]->label),'</p>';
                }
                elseif ($err === jForms::ERRDATA_INVALID_FILE_TYPE) {
                    echo '<p>', jLocale::get('jelix~formserr.js.err.invalid.file.type', $ctrls[$cname]->label),'</p>';
                }
                elseif ($err === jForms::ERRDATA_FILE_UPLOAD_ERROR) {
                    echo '<p>', jLocale::get('jelix~formserr.js.err.file.upload', $ctrls[$cname]->label),'</p>';
                }
                elseif ($err != '') {
                    echo '<p>', $err,'</p>';
                }
            }
            echo '</div>';
        }
    }

    protected $jsContent = '';

    protected $lastJsContent = '';

    public function outputFooter(){
        echo '<script type="text/javascript">
//<![CDATA[
(function(){var c, c2;
'.$this->jsContent.$this->lastJsContent.'
})();
//]]>
</script>';
        echo '</form>';
    }

    public function outputControlLabel($ctrl, $format='', $editMode=true){
        if($ctrl->type == 'hidden' || $ctrl->type == 'group' || $ctrl->type == 'button') return;
        $required = ($ctrl->required == false || $ctrl->isReadOnly()?'':' jforms-required');
        $reqhtml = ($required && $editMode?'<span class="jforms-required-star">*</span>':'');
        $inError = (isset($this->_form->getContainer()->errors[$ctrl->ref]) ?' jforms-error':'');
        $hint = ($ctrl->hint == ''?'':' title="'.htmlspecialchars($ctrl->hint).'"');
        $id = $this->_name.'_'.$ctrl->ref;
        $idLabel = ' id="'.$id.'_label"';
        if($ctrl->type == 'output' || $ctrl->type == 'checkboxes' || $ctrl->type == 'radiobuttons' || $ctrl->type == 'date' || $ctrl->type == 'datetime' || $ctrl->type == 'choice'){
            echo '<label class="jforms-label control-label',$required,$inError,'"',$idLabel,$hint,'>',htmlspecialchars($ctrl->label),$reqhtml,"</label>\n";
        }else if($ctrl->type != 'submit' && $ctrl->type != 'reset' && $ctrl->type != 'checkbox'){
            echo '<label class="jforms-label control-label',$required,$inError,'" for="',$id,'"',$idLabel,$hint,'>',htmlspecialchars($ctrl->label),$reqhtml,"</label>\n";
        }
    }

    public function outputControl($ctrl, $attributes=array()){
        if($ctrl->type == 'hidden') return;
        $ro = $ctrl->isReadOnly();
        $attributes['name'] = $ctrl->ref;
        $attributes['id'] = $this->_name.'_'.$ctrl->ref;

        if ($ro)
            $attributes['readonly'] = 'readonly';
        else
            unset($attributes['readonly']);
        if (!isset($attributes['title']) && $ctrl->hint) {
            $attributes['title'] = $ctrl->hint;
        }

        $class = 'jforms-ctrl-'.$ctrl->type;
        $class .= ($ctrl->required == false || $ro?'':' jforms-required');
        $class .= (isset($this->_form->getContainer()->errors[$ctrl->ref]) ?' jforms-error':'');
        $class .= ($ro && $ctrl->type != 'captcha'?' jforms-readonly':'');
        $class .= (property_exists($ctrl, 'class') && $ctrl->class != ''?' '.$ctrl->class:'');
        if (isset($attributes['class']))
            $attributes['class'].= ' '.$class;
        else
            $attributes['class'] = $class;
        $this->{'output'.$ctrl->type}($ctrl, $attributes);
        echo "\n";
        $this->{'js'.$ctrl->type}($ctrl);
        $this->outputHelp($ctrl);
    }

    protected function _outputAttr(&$attributes) {
        foreach($attributes as $name=>$val) {
            echo ' '.$name.'="'.htmlspecialchars($val).'"';
        }
    }

    public function escJsStr($str) {
        return '\''.str_replace(array("'","\n"),array("\\'", "\\n"), $str).'\'';
    }

    /**
     * @param jFormsControl $ctrl
     */
    protected function commonJs($ctrl) {
        if ($ctrl->isReadOnly()) {
            $this->jsContent .="c.readOnly = true;\n";
        }

        if($ctrl->required){
            $this->jsContent .="c.required = true;\n";
            if($ctrl->alertRequired){
                $this->jsContent .="c.errRequired=".$this->escJsStr($ctrl->alertRequired).";\n";
            }
            else {
                $this->jsContent .="c.errRequired=".$this->escJsStr(jLocale::get('jelix~formserr.js.err.required', $ctrl->label)).";\n";
            }
        }

        if($ctrl->alertInvalid){
            $this->jsContent .="c.errInvalid=".$this->escJsStr($ctrl->alertInvalid).";\n";
        }
        else {
            $this->jsContent .="c.errInvalid=".$this->escJsStr(jLocale::get('jelix~formserr.js.err.invalid', $ctrl->label)).";\n";
        }

        if ($this->isRootControl) $this->jsContent .="jFormsJQ.tForm.addControl(c);\n";

        if($ctrl instanceof jFormsControlDate || get_class($ctrl->datatype) == 'jDatatypeDate' || get_class($ctrl->datatype) == 'jDatatypeLocaleDate'){
            $config = isset($ctrl->datepickerConfig)?$ctrl->datepickerConfig:jApp::config()->forms['datepicker'];
            $this->jsContent .= 'jelix_datepicker_'.$config."(c, jFormsJQ.config);\n";
        }
    }

    protected function outputInput($ctrl, &$attr) {
        $value = $this->_form->getData($ctrl->ref);
        if ($ctrl->size != 0)
            $attr['size'] = $ctrl->size;
        $maxl= $ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $attr['maxlength']=$maxl;
        $attr['value'] = $value;
        $attr['type'] = 'text';
        echo '<input';
        $this->_outputAttr($attr);
        echo $this->_endt;
    }

    protected function jsInput($ctrl) {

        $datatype = array('jDatatypeBoolean'=>'Boolean','jDatatypeDecimal'=>'Decimal','jDatatypeInteger'=>'Integer','jDatatypeHexadecimal'=>'Hexadecimal',
                        'jDatatypeDateTime'=>'Datetime','jDatatypeDate'=>'Date','jDatatypeTime'=>'Time',
                        'jDatatypeUrl'=>'Url','jDatatypeEmail'=>'Email','jDatatypeIPv4'=>'Ipv4','jDatatypeIPv6'=>'Ipv6');
        $isLocale = false;
        $data_type_class = get_class($ctrl->datatype);
        if(isset($datatype[$data_type_class]))
            $dt = $datatype[$data_type_class];
        else if ($ctrl->datatype instanceof jDatatypeLocaleTime)
            { $dt = 'Time'; $isLocale = true; }
        else if ($ctrl->datatype instanceof jDatatypeLocaleDate)
            { $dt = 'LocaleDate'; $isLocale = true; }
        else if ($ctrl->datatype instanceof jDatatypeLocaleDateTime)
            { $dt = 'LocaleDatetime'; $isLocale = true; }
        else
            $dt = 'String';

        $this->jsContent .="c = new ".$this->jFormsJsVarName."Control".$dt."('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        if ($isLocale)
            $this->jsContent .="c.lang='".jApp::config()->locale."';\n";

        $maxv= $ctrl->datatype->getFacet('maxValue');
        if($maxv !== null)
            $this->jsContent .="c.maxValue = '$maxv';\n";

        $minv= $ctrl->datatype->getFacet('minValue');
        if($minv !== null)
            $this->jsContent .="c.minValue = '$minv';\n";

        $maxl= $ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $this->jsContent .="c.maxLength = '$maxl';\n";

        $minl= $ctrl->datatype->getFacet('minLength');
        if($minl !== null)
            $this->jsContent .="c.minLength = '$minl';\n";
        $re = $ctrl->datatype->getFacet('pattern');
        if($re !== null)
            $this->jsContent .="c.regexp = ".$re.";\n";

        $this->commonJs($ctrl);
    }

    protected function _outputDateControlDay($ctrl, $attr, $value){
        $attr['name'] = $ctrl->ref.'[day]';
        $attr['id'] .= 'day';
        if(jApp::config()->forms['controls.datetime.input'] == 'textboxes'){
            $attr['value'] = $value;
            echo '<input type="text" size="2" maxlength="2"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        }
        else{
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.date.day.label')).'</option>';
            for($i=1;$i<32;$i++){
                $k = ($i<10)?'0'.$i:$i;
                echo '<option value="'.$k.'"'.($k == $value?' selected="selected"':'').'>'.$k.'</option>';
            }
            echo '</select>';
        }
    }

    protected function _outputDateControlMonth($ctrl, $attr, $value){
        $attr['name'] = $ctrl->ref.'[month]';
        $attr['id'] .= 'month';
        if(jApp::config()->forms['controls.datetime.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text" size="2" maxlength="2"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        }
        else{
            $monthLabels = jApp::config()->forms['controls.datetime.months.labels'];
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.date.month.label')).'</option>';
            for($i=1;$i<13;$i++){
                $k = ($i<10)?'0'.$i:$i;
                if($monthLabels == 'names')
                    $l = htmlspecialchars(jLocale::get('jelix~date_time.month.'.$k.'.label'));
                else if($monthLabels == 'shortnames')
                    $l = htmlspecialchars(jLocale::get('jelix~date_time.month.'.$k.'.shortlabel'));
                else
                    $l = $k;
                echo '<option value="'.$k.'"'.($k == $value?' selected="selected"':'').'>'.$l.'</option>';
            }
            echo '</select>';
        }
    }

    protected function _outputDateControlYear($ctrl, $attr, $value){
        $attr['name'] = $ctrl->ref.'[year]';
        $attr['id'] .= 'year';
        if(jApp::config()->forms['controls.datetime.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text" size="4" maxlength="4"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        }
        else{
            $minDate = $ctrl->datatype->getFacet('minValue');
            $maxDate = $ctrl->datatype->getFacet('maxValue');
            if($minDate && $maxDate){
                echo '<select';
                $this->_outputAttr($attr);
                echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.date.year.label')).'</option>';
                for($i=$minDate->year;$i<=$maxDate->year;$i++)
                    echo '<option value="'.$i.'"'.($i == $value?' selected="selected"':'').'>'.$i.'</option>';
                echo '</select>';
            }
            else{
                $attr['value'] = $value;
                echo '<input type="text" size="4" maxlength="4"';
                $this->_outputAttr($attr);
                echo $this->_endt;
            }
        }
    }

    protected function _outputDateControlHour($ctrl, $attr, $value){
        $attr['name'] = $ctrl->ref.'[hour]';
        $attr['id'] .= 'hour';
        if(jApp::config()->forms['controls.datetime.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text" size="2" maxlength="2"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        }
        else{
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.time.hour.label')).'</option>';
            for($i=0;$i<24;$i++){
                $k = ($i<10)?'0'.$i:$i;
                echo '<option value="'.$k.'"'.( (string) $k === $value?' selected="selected"':'').'>'.$k.'</option>';
            }
            echo '</select>';
        }
    }

    protected function _outputDateControlMinutes($ctrl, $attr, $value){
        $attr['name'] = $ctrl->ref.'[minutes]';
        $attr['id'] .= 'minutes';
        if(jApp::config()->forms['controls.datetime.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text" size="2" maxlength="2"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        }
        else{
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.time.minutes.label')).'</option>';
            for($i=0;$i<60;$i++){
                $k = ($i<10)?'0'.$i:$i;
                echo '<option value="'.$k.'"'.( (string) $k === $value?' selected="selected"':'').'>'.$k.'</option>';
            }
            echo '</select>';
        }
    }

    protected function _outputDateControlSeconds($ctrl, $attr, $value){
        $attr['name'] = $ctrl->ref.'[seconds]';
        $attr['id'] .= 'seconds';
        if(!$ctrl->enableSeconds)
            echo '<input type="hidden" id="'.$attr['id'].'" name="'.$attr['name'].'" value="'.$value.'"'.$this->_endt;
        else if(jApp::config()->forms['controls.datetime.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        }
        else{
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.time.seconds.label')).'</option>';
            for($i=0;$i<60;$i++){
                $k = ($i<10)?'0'.$i:$i;
                echo '<option value="'.$k.'"'.( (string) $k === $value?' selected="selected"':'').'>'.$k.'</option>';
            }
            echo '</select>';
        }
    }

    protected function outputDate($ctrl, &$attr){
        $attr['id'] = $this->_name.'_'.$ctrl->ref.'_';
        $v = array('year'=>'','month'=>'','day'=>'');
        if(preg_match('#^(\d{4})?-(\d{2})?-(\d{2})?$#',$this->_form->getData($ctrl->ref),$matches)){
            if(isset($matches[1]))
                $v['year'] = $matches[1];
            if(isset($matches[2]))
                $v['month'] = $matches[2];
            if(isset($matches[3]))
                $v['day'] = $matches[3];
        }
        $f = jLocale::get('jelix~format.date');
        for($i=0;$i<strlen($f);$i++){
            if($f[$i] == 'Y')
                $this->_outputDateControlYear($ctrl, $attr, $v['year']);
            else if($f[$i] == 'm')
                $this->_outputDateControlMonth($ctrl, $attr, $v['month']);
            else if($f[$i] == 'd')
                $this->_outputDateControlDay($ctrl, $attr, $v['day']);
            else
                echo ' ';
        }
    }

    protected function jsDate($ctrl){
        $this->jsContent .= "c = new ".$this->jFormsJsVarName."ControlDate('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        $this->jsContent .= "c.multiFields = true;\n";
        $minDate = $ctrl->datatype->getFacet('minValue');
        $maxDate = $ctrl->datatype->getFacet('maxValue');
        if($minDate)
            $this->jsContent .= "c.minDate = '".$minDate->toString(jDateTime::DB_DFORMAT)."';\n";
        if($maxDate)
            $this->jsContent .= "c.maxDate = '".$maxDate->toString(jDateTime::DB_DFORMAT)."';\n";
        $this->commonJs($ctrl);
    }

    protected function outputDatetime($ctrl, &$attr){
        $attr['id'] = $this->_name.'_'.$ctrl->ref.'_';
        $v = array('year'=>'','month'=>'','day'=>'','hour'=>'','minutes'=>'','seconds'=>'');
        if(preg_match('#^(\d{4})?-(\d{2})?-(\d{2})? (\d{2})?:(\d{2})?(:(\d{2})?)?$#',$this->_form->getData($ctrl->ref),$matches)){
            if(isset($matches[1]))
                $v['year'] = $matches[1];
            if(isset($matches[2]))
                $v['month'] = $matches[2];
            if(isset($matches[3]))
                $v['day'] = $matches[3];
            if(isset($matches[4]))
                $v['hour'] = $matches[4];
            if(isset($matches[5]))
                $v['minutes'] = $matches[5];
            if(isset($matches[7]))
                $v['seconds'] = $matches[7];
        }
        $f = jLocale::get('jelix~format.datetime');
        for($i=0;$i<strlen($f);$i++){
            if($f[$i] == 'Y')
                $this->_outputDateControlYear($ctrl, $attr, $v['year']);
            else if($f[$i] == 'm')
                $this->_outputDateControlMonth($ctrl, $attr, $v['month']);
            else if($f[$i] == 'd')
                $this->_outputDateControlDay($ctrl, $attr, $v['day']);
            else if($f[$i] == 'H')
                $this->_outputDateControlHour($ctrl, $attr, $v['hour']);
            else if($f[$i] == 'i')
                $this->_outputDateControlMinutes($ctrl, $attr, $v['minutes']);
            else if($f[$i] == 's')
                $this->_outputDateControlSeconds($ctrl, $attr, $v['seconds']);
            else
                echo ' ';
        }
    }

    protected function jsDatetime($ctrl){
        $this->jsContent .= "c = new ".$this->jFormsJsVarName."ControlDatetime('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        $this->jsContent .= "c.multiFields = true;\n";
        $minDate = $ctrl->datatype->getFacet('minValue');
        $maxDate = $ctrl->datatype->getFacet('maxValue');
        if($minDate)
            $this->jsContent .= "c.minDate = '".$minDate->toString(jDateTime::DB_DTFORMAT)."';\n";
        if($maxDate)
            $this->jsContent .= "c.maxDate = '".$maxDate->toString(jDateTime::DB_DTFORMAT)."';\n";
        $this->commonJs($ctrl);
    }

    protected function outputCheckbox($ctrl, &$attr) {
        $required = ($ctrl->required == false || $ctrl->isReadOnly()?'':' jforms-required');
        $reqhtml = ($required?'<span class="jforms-required-star">*</span>':'');
        $inError = (isset($this->_form->getContainer()->errors[$ctrl->ref]) ?' jforms-error':'');
        $hint = ($ctrl->hint == ''?'':' title="'.htmlspecialchars($ctrl->hint).'"');
        $id = $this->_name.'_'.$ctrl->ref;
        $idLabel = ' id="'.$id.'_label"';
        echo '<label class="jforms-label checkbox',$required,$inError,'" for="',$id,'"',$idLabel,$hint,'>';

        $value = $this->_form->getData($ctrl->ref);

        if($ctrl->valueOnCheck == $value){
            $attr['checked'] = "checked";
         }
        $attr['value'] = $ctrl->valueOnCheck;
        $attr['type'] = 'checkbox';
        echo '<input';
        $this->_outputAttr($attr);
        echo $this->_endt;

        echo htmlspecialchars($ctrl->label),$reqhtml,"</label>\n";
    }

    protected function jsCheckbox($ctrl) {

        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlBoolean('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";

        $this->commonJs($ctrl);
    }

    protected function echoCheckboxes($span, $id, &$values, &$attr, &$value, &$i) {
        foreach($values as $v=>$label){
            $attr['id'] = $id.$i;
            $attr['value'] = $v;
            echo $span;
            $this->_outputAttr($attr);
            if((is_array($value) && in_array((string) $v,$value,true)) || ($value === (string) $v))
                echo ' checked="checked"';
            //echo $this->_endt,'<label for="',$id,$i,'">',htmlspecialchars($label),"</label></span>\n";
            echo $this->_endt,'',htmlspecialchars($label),"</label>\n";
            $i++;
        }
    }

    protected function showRadioCheck($ctrl, &$attr, &$value, $span) {
        $id = $this->_name.'_'.$ctrl->ref.'_';
        $i=0;
        $data = $ctrl->datasource->getData($this->_form);
        if ($ctrl->datasource instanceof jIFormsDatasource2 && $ctrl->datasource->hasGroupedData()) {
            if (isset($data[''])) {
                $this->echoCheckboxes($span, $id, $data[''], $attr, $value, $i);
            }
            foreach($data as $group=>$values){
                if ($group === '')
                    continue;
                echo '<fieldset><legend>'.htmlspecialchars($group).'</legend>'."\n";
                $this->echoCheckboxes($span, $id, $values, $attr, $value, $i);
                echo "</fieldset>\n";
            }
        }else{
            $this->echoCheckboxes($span, $id, $data, $attr, $value, $i);
        }
    }

    protected function outputCheckboxes($ctrl, &$attr) {
        $value = $this->_form->getData($ctrl->ref);
        $attr['name'] = $ctrl->ref.'[]';
        unset($attr['title']);
        if(is_array($value) && count($value) == 1)
            $value = $value[0];
        $span ='<label class="checkbox jforms-chkbox jforms-ctl-'.$ctrl->ref.'"><input type="checkbox"';

        if(is_array($value)){
            $value = array_map(create_function('$v', 'return (string) $v;'),$value);
        }
        else {
            $value = (string) $value;
        }
        $this->showRadioCheck($ctrl, $attr, $value, $span);
    }

    protected function jsCheckboxes($ctrl) {

        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlString('".$ctrl->ref."[]', ".$this->escJsStr($ctrl->label).");\n";

        $this->commonJs($ctrl);
    }

    protected function outputRadiobuttons($ctrl, &$attr) {
        $id = $this->_name.'_'.$ctrl->ref.'_';
        $attr['name'] = $ctrl->ref;
        unset($attr['title']);
        $value = $this->_form->getData($ctrl->ref);
        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value = '';
        }
        $value = (string) $value;
        $span ='<label class="radio jforms-radio jforms-ctl-'.$ctrl->ref.'"><input type="radio"';
        $this->showRadioCheck($ctrl, $attr, $value, $span);
    }

    protected function jsRadiobuttons($ctrl) {

        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";

        $this->commonJs($ctrl);
    }


    protected function fillSelect($ctrl, $value) {
        $data = $ctrl->datasource->getData($this->_form);
        if ($ctrl->datasource instanceof jIFormsDatasource2 && $ctrl->datasource->hasGroupedData()) {
            if (isset($data[''])) {
                foreach($data[''] as $v=>$label){
                    if(is_array($value))
                        $selected = in_array((string) $v,$value,true);
                    else
                        $selected = ((string) $v===$value);
                    echo '<option value="',htmlspecialchars($v),'"',($selected?' selected="selected"':''),'>',htmlspecialchars($label),"</option>\n";
                }
            }
            foreach($data as $group=>$values) {
                if ($group === '')
                    continue;
                echo '<optgroup label="'.htmlspecialchars($group).'">';
                foreach($values as $v=>$label){
                    if(is_array($value))
                        $selected = in_array((string) $v,$value,true);
                    else
                        $selected = ((string) $v===$value);
                    echo '<option value="',htmlspecialchars($v),'"',($selected?' selected="selected"':''),'>',htmlspecialchars($label),"</option>\n";
                }
                echo '</optgroup>';
            }
        }
        else {
            foreach($data as $v=>$label){
                if(is_array($value))
                    $selected = in_array((string) $v,$value,true);
                else
                    $selected = ((string) $v===$value);
                echo '<option value="',htmlspecialchars($v),'"',($selected?' selected="selected"':''),'>',htmlspecialchars($label),"</option>\n";
            }
        }

    }

    protected function outputMenulist($ctrl, &$attr) {
        if (isset($attr['readonly'])) {
            $attr['disabled'] = 'disabled';
            unset($attr['readonly']);
        }

        $attr['size'] = '1';
        echo '<select';
        $this->_outputAttr($attr);
        echo ">\n";
        $value = $this->_form->getData($ctrl->ref);
        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value='';
        }
        $value = (string) $value;
        if ($ctrl->emptyItemLabel !== null || !$ctrl->required)
            echo '<option value=""',($value===''?' selected="selected"':''),'>',htmlspecialchars($ctrl->emptyItemLabel),"</option>\n";
        $this->fillSelect($ctrl, $value);
        echo '</select>';
    }

    protected function jsMenulist($ctrl) {

        $this->jsContent .="c = new jFormsJQControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jIFormsDynamicDatasource) {
            $dependentControls = $ctrl->datasource->getCriteriaControls();
            if ($dependentControls) {
                $this->jsContent .="c.dependencies = ['".implode("','",$dependentControls)."'];\n";
                $this->lastJsContent .= "jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref."');\n";
            }
        }

        $this->commonJs($ctrl);
    }

    protected function outputListbox($ctrl, &$attr) {
        if (isset($attr['readonly'])) {
            $attr['disabled'] = 'disabled';
            unset($attr['readonly']);
        }
        $attr['size'] = $ctrl->size;

        if($ctrl->multiple){
            $attr['name'] = $ctrl->ref.'[]';
            $attr['id'] = $this->_name.'_'.$ctrl->ref;
            $attr['multiple'] = 'multiple';
            echo '<select';
            $this->_outputAttr($attr);
            echo ">\n";
            $value = $this->_form->getData($ctrl->ref);
            if($ctrl->emptyItemLabel !== null)
                echo '<option value=""',(in_array('',$value,true)?' selected="selected"':''),'>',htmlspecialchars($ctrl->emptyItemLabel),"</option>\n";
            if(is_array($value) && count($value) == 1)
                $value = $value[0];

            if(is_array($value)){
                $value = array_map(create_function('$v', 'return (string) $v;'),$value);
                $this->fillSelect($ctrl, $value);
            }else{
                $this->fillSelect($ctrl, (string)$value);
            }
            echo '</select>';
        }else{
            $value = $this->_form->getData($ctrl->ref);

            if(is_array($value)){
                if(count($value) >= 1)
                    $value = $value[0];
                else
                    $value ='';
            }

            $value = (string) $value;
            echo '<select';
            $this->_outputAttr($attr);
            echo ">\n";
            if($ctrl->emptyItemLabel !== null)
                echo '<option value=""',($value===''?' selected="selected"':''),'>',htmlspecialchars($ctrl->emptyItemLabel),"</option>\n";
            $this->fillSelect($ctrl, $value);
            echo '</select>';
        }
    }

    protected function jsListbox($ctrl) {
        if($ctrl->multiple){
            $this->jsContent .= "c = new ".$this->jFormsJsVarName."ControlString('".$ctrl->ref."[]', ".$this->escJsStr($ctrl->label).");\n";
            $this->jsContent .= "c.multiple = true;\n";
        } else {
            $this->jsContent .= "c = new ".$this->jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        }
        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jIFormsDynamicDatasource) {
            $dependentControls = $ctrl->datasource->getCriteriaControls();
            if ($dependentControls) {
                $this->jsContent .="c.dependencies = ['".implode("','",$dependentControls)."'];\n";
                $this->lastJsContent .= "jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref.($ctrl->multiple?'[]':'')."');\n";
            }
        }

        $this->commonJs($ctrl);
    }

    protected function outputTextarea($ctrl, &$attr) {
        if (!isset($attr['rows']))
            $attr['rows'] = $ctrl->rows;
        if (!isset($attr['cols']))
            $attr['cols'] = $ctrl->cols;
        echo '<textarea';
        $this->_outputAttr($attr);
        echo '>',htmlspecialchars($this->_form->getData($ctrl->ref)),'</textarea>';
    }

    protected function jsTextarea($ctrl, $withjsobj=true) {
        if ($withjsobj)
            $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";

        $maxl= $ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $this->jsContent .="c.maxLength = '$maxl';\n";

        $minl= $ctrl->datatype->getFacet('minLength');
        if($minl !== null)
            $this->jsContent .="c.minLength = '$minl';\n";

        $this->commonJs($ctrl);
    }

    protected function outputHtmleditor($ctrl, &$attr) {
        $this->outputTextarea($ctrl, $attr);
    }

    protected function jsHtmleditor($ctrl) {
        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlHtml('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        $this->jsTextarea($ctrl, false);
        $engine = jApp::config()->htmleditors[$ctrl->config.'.engine.name'];
        $this->jsContent .= 'jelix_'.$engine.'_'.$ctrl->config.'("'.$this->_name.'_'.$ctrl->ref.'","'.$this->_name.'","'.$ctrl->skin."\",".$this->jFormsJsVarName.".config);\n";
    }

    protected function outputWikieditor($ctrl, &$attr) {
        $this->outputTextarea($ctrl, $attr);
    }

    protected function jsWikieditor($ctrl) {
        $this->jsTextarea($ctrl);
        $engine = jApp::config()->wikieditors[$ctrl->config.'.engine.name'];
        $this->jsContent .= '$("#'.$this->_name.'_'.$ctrl->ref.'").markItUp(markitup_'.$engine.'_settings);'."\n";
    }

    protected function outputSecret($ctrl, &$attr) {
        if ($ctrl->size != 0)
            $attr['size'] = $ctrl->size;
        $maxl = $ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $attr['maxlength'] = $maxl;
        $attr['type'] = 'password';
        $attr['value'] = $this->_form->getData($ctrl->ref);
        echo '<input';
        $this->_outputAttr($attr);
        echo $this->_endt;
    }

    protected function jsSecret($ctrl) {
        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlSecret('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";

        $maxl= $ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $this->jsContent .="c.maxLength = '$maxl';\n";

        $minl= $ctrl->datatype->getFacet('minLength');
        if($minl !== null)
            $this->jsContent .="c.minLength = '$minl';\n";
        $re = $ctrl->datatype->getFacet('pattern');
        if($re !== null)
            $this->jsContent .="c.regexp = ".$re.";\n";
        $this->commonJs($ctrl);
    }

    protected function outputSecretconfirm($ctrl, &$attr) {
        if ($ctrl->size != 0)
            $attr['size'] = $ctrl->size;
        $attr['type'] = 'password';
        $attr['value'] = $this->_form->getData($ctrl->ref);
        echo '<input';
        $this->_outputAttr($attr);
        echo $this->_endt;
    }

    protected function jsSecretconfirm($ctrl) {
        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlConfirm('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        $this->commonJs($ctrl);
    }

    protected function outputOutput($ctrl, &$attr) {
        unset($attr['readonly']);
        unset($attr['class']);
        if (isset($attr['title'])){
            $hint = ' title="'.htmlspecialchars($attr['title']).'"';
            unset($attr['title']);
        }
        else $hint = '';
        $attr['type'] = 'hidden';
        $attr['value'] = $this->_form->getData($ctrl->ref);
        echo '<input';
        $this->_outputAttr($attr);
        echo $this->_endt;
        echo '<span class="jforms-value"',$hint,'>',htmlspecialchars($attr['value']),'</span>';
    }

    protected function jsOutput($ctrl) {
    }

    protected function outputButton($ctrl, &$attr) {
        unset($attr['readonly']);
        unset($attr['class']);
        $attr['value'] = $this->_form->getData($ctrl->ref);
        echo '<button ';
        $this->_outputAttr($attr);
        echo '>',htmlspecialchars($ctrl->label),'</button>';
    }

    protected function jsButton($ctrl) {
    }

    protected function outputUpload($ctrl, &$attr) {
        /*if($ctrl->maxsize){
            echo '<input type="hidden" name="MAX_FILE_SIZE" value="',$ctrl->maxsize,'"',$this->_endt;
        }*/
        $attr['type'] = 'file';
        $attr['value'] = '';
        echo '<input';
        $this->_outputAttr($attr);
        if ( property_exists( $ctrl, 'accept' ) )
            echo ' accept="'.$ctrl->accept.'"';
        if ( property_exists( $ctrl, 'capture' ) )
            echo ' capture="'.$ctrl->capture.'"';
        echo $this->_endt;
    }

    protected function jsUpload($ctrl) {
        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";

        $this->commonJs($ctrl);
    }

    protected function outputSubmit($ctrl, $attr) {
        unset($attr['readonly']);
        $attr['class'] = 'jforms-submit btn';
        $attr['type'] = 'submit';

        if($ctrl->standalone){
            $attr['value'] = $ctrl->label;
            echo '<input';
            $this->_outputAttr($attr);
            echo $this->_endt;
        }else{
            $id = $this->_name.'_'.$ctrl->ref.'_';
            $attr['name'] = $ctrl->ref;
            foreach($ctrl->datasource->getData($this->_form) as $v=>$label){
                // because IE6 sucks with <button type=submit> (see ticket #431), we must use input :-(
                $attr['value'] = $label;
                $attr['id'] = $id.$v;
                echo ' <input';
                $this->_outputAttr($attr);
                echo $this->_endt;
            }
        }
    }

    protected function jsSubmit($ctrl) {
        // no javascript
    }

    protected function outputReset($ctrl, &$attr) {
        unset($attr['readonly']);
        $attr['class'] = 'jforms-reset btn';
        $attr['type'] = 'reset';
        echo '<button';
        $this->_outputAttr($attr);
        echo '>',htmlspecialchars($ctrl->label),'</button>';
    }

    protected function jsReset($ctrl) {
        // no javascript
    }

    protected function outputCaptcha($ctrl, &$attr) {
        $ctrl->initExpectedValue();
        echo '<span class="jforms-captcha-question">',htmlspecialchars($ctrl->question),'</span> ';

        unset($attr['readonly']);
        $attr['type'] = 'text';
        $attr['value'] = '';
        echo '<input';
        $this->_outputAttr($attr);
        echo $this->_endt;
    }

    protected function jsCaptcha($ctrl) {
        $this->jsTextarea($ctrl);
    }

    protected function outputGroup($ctrl, &$attr) {
        echo '<fieldset id="',$attr['id'],'"><legend>',htmlspecialchars($ctrl->label),"</legend>\n";
        echo '<div class="jforms-table-group" border="0">',"\n";
        foreach( $ctrl->getChildControls() as $ctrlref=>$c){
            if($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') continue;
            if(!$this->_form->isActivated($ctrlref)) continue;
            echo '<div class="control-group">';
            $this->outputControlLabel($c);
            echo '<div class="controls">';
            $this->outputControl($c);
            echo "</div>\n";
            echo "</div>\n";
        }
        echo "</div></fieldset>";
    }

    protected function jsGroup($ctrl) {
        //no javacript
    }

    protected function outputChoice($ctrl, &$attr) {
        echo '<ul class="jforms-choice jforms-ctl-'.$ctrl->ref.' form-inline" >',"\n";

        $value = $this->_form->getData($ctrl->ref);
        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value='';
        }

        $i=0;
        $attr['name'] = $ctrl->ref;
        $id = $this->_name.'_'.$ctrl->ref.'_';
        $attr['type']='radio';
        unset($attr['class']);
        $readonly = (isset($attr['readonly']) && $attr['readonly']!='');

        $this->jsChoiceInternal($ctrl);
        $this->jsContent .="c2 = c;\n";
        $this->isRootControl = false;
        foreach( $ctrl->items as $itemName=>$listctrl){
            if (!$ctrl->isItemActivated($itemName))
                continue;
            echo '<li id="'.$id.$itemName.'_item"><label class="radio"><input';
            $attr['id'] = $id.$i;
            $attr['value'] = $itemName;
            if ($itemName==$value)
                $attr['checked'] = 'checked';
            else
                unset($attr['checked']);
            $this->_outputAttr($attr);
            echo ' onclick="'.$this->jFormsJsVarName.'.getForm(\'',$this->_name,'\').getControl(\'',$ctrl->ref,'\').activate(\'',$itemName,'\')"', $this->_endt;
            echo htmlspecialchars($ctrl->itemsNames[$itemName]),"</label>\n";

            $displayedControls = false;
            foreach($listctrl as $ref=>$c) {
                if(!$this->_form->isActivated($ref) || $c->type == 'hidden') continue;
                $displayedControls = true;
                echo ' <span class="jforms-item-controls">';
                $this->outputControlLabel($c);
                echo ' ';
                $this->outputControl($c);
                echo "</span>\n";
                $this->jsContent .="c2.addControl(c, ".$this->escJsStr($itemName).");\n";
            }
            if(!$displayedControls) {
                $this->jsContent .="c2.items[".$this->escJsStr($itemName)."]=[];\n";
            }

            echo "</li>\n";
            $i++;
        }
        echo "</ul>\n";
        $this->isRootControl = true;
    }

    protected function jsChoice($ctrl) {
        $value = $this->_form->getData($ctrl->ref);
        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value='';
        }
        $this->jsContent .= "c2.activate('".$value."');\n";
    }

    protected function jsChoiceInternal($ctrl) {

        $this->jsContent .="c = new ".$this->jFormsJsVarName."ControlChoice('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";

        $this->commonJs($ctrl);
    }

    protected function outputHelp($ctrl) {
        if ($ctrl->help) {
            if($ctrl->type == 'checkboxes' || ($ctrl->type == 'listbox' && $ctrl->multiple)){
                $name=$ctrl->ref.'[]';
            }else{
                $name=$ctrl->ref;
            }
            // additionnal &nbsp, else background icon is not shown in webkit
            echo '<span class="jforms-help" id="'. $this->_name.'_'.$ctrl->ref.'-help">&nbsp;<span>'.htmlspecialchars($ctrl->help).'</span></span>';
        }
    }
}
