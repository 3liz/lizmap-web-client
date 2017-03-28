<?php
/**
 * Plugin from smarty project and adapted for jtpl
 * @package    jelix
 * @subpackage jtpl_plugin
 * @link http://smarty.php.net/manual/en/language.function.mailto.php {mailto}
 *          (Smarty online manual)
 * @link http://jelix.org/
 * @author   Monte Ohrt <monte at ohrt dot com>
 * @contributor Jason Sweat (added cc, bcc and subject functionality), Julien Issler
 * @copyright 2011 Julien Issler
 */

/**
 * Examples:
 * <pre>
 * {mailto array("address"=>"me@domain.com")}
 * {mailto array("address"=>"me@domain.com","encode"=>"javascript")}
 * {mailto array("address"=>"me@domain.com","encode"=>"hex")}
 * {mailto array("address"=>"me@domain.com","subject"=>"Hello to you!")}
 * {mailto array("address"=>"me@domain.com","cc"=>"you@domain.com,they@domain.com")}
 * {mailto array("address"=>"me@domain.com","extra"=>'class="mailto"')}
 * </pre>
 * @params jTpl $tpl
 * @params array $params
 */
function jtpl_function_html_mailto($tpl,$params)
{
    $extra = '';

    if (empty($params['address'])) {
        throw new jException("jelix~errors.tplplugin.function.argument.unknown", array('address','mailto',$tpl->_templateName));
    } else {
        $address = $params['address'];
    }

    $text = $address;

    // netscape and mozilla do not decode %40 (@) in BCC field (bug?)
    // so, don't encode it.
    $search = array('%40', '%2C');
    $replace  = array('@', ',');
    $mail_parms = array();
    foreach ($params as $var=>$value) {
        switch ($var) {
            case 'cc':
            case 'bcc':
            case 'followupto':
                if (!empty($value))
                    $mail_parms[] = $var.'='.str_replace($search,$replace,rawurlencode($value));
                break;

            case 'subject':
            case 'newsgroups':
                $mail_parms[] = $var.'='.rawurlencode($value);
                break;

            case 'extra':
            case 'text':
                $$var = $value;

            default:
        }
    }

    $mail_parm_vals = '';
    for ($i=0; $i<count($mail_parms); $i++) {
        $mail_parm_vals .= (0==$i) ? '?' : '&';
        $mail_parm_vals .= $mail_parms[$i];
    }
    $address .= $mail_parm_vals;

    $encode = (empty($params['encode'])) ? 'none' : $params['encode'];
    if (!in_array($encode,array('javascript','javascript_charcode','hex','none')) ) {
        throw new jException("jelix~errors.tplplugin.function.argument.unknown", array($encode,'mailto',$tpl->_templateName));
    }

    if ($encode == 'javascript' ) {
        $string = 'document.write(\'<a href="mailto:'.$address.'" '.$extra.'>'.$text.'</a>\');';

        $js_encode = '';
        for ($x=0; $x < strlen($string); $x++) {
            $js_encode .= '%' . bin2hex($string[$x]);
        }

        echo '<script type="text/javascript">//<![CDATA[
eval(unescape(\''.$js_encode.'\')); //]]>
</script>';

    } elseif ($encode == 'javascript_charcode' ) {
        $string = '<a href="mailto:'.$address.'" '.$extra.'>'.$text.'</a>';

        $ord = array();
        for($x = 0, $y = strlen($string); $x < $y; $x++ ) {
            $ord[] = ord($string[$x]);
        }

        $_ret = "<script type=\"text/javascript\">\n";
        $_ret .= "//<![CDATA[\n";
        $_ret .= "{document.write(String.fromCharCode(";
        $_ret .= implode(',',$ord);
        $_ret .= "))";
        $_ret .= "}\n";
        $_ret .= "//]]>\n";
        $_ret .= "</script>\n";

        echo $_ret;


    } elseif ($encode == 'hex') {

        preg_match('!^(.*)(\?.*)$!',$address,$match);
        if(!empty($match[2])) {
            throw new jException("jelix~errors.tplplugin.function.argument.unknown", array($match[2],' ', ' ' ));
        }
        $address_encode = '';
        for ($x=0; $x < strlen($address); $x++) {
            if(preg_match('!\w!',$address[$x])) {
                $address_encode .= '%' . bin2hex($address[$x]);
            } else {
                $address_encode .= $address[$x];
            }
        }
        $text_encode = '';
        for ($x=0; $x < strlen($text); $x++) {
            $text_encode .= '&#x' . bin2hex($text[$x]).';';
        }

        $mailto = "&#109;&#97;&#105;&#108;&#116;&#111;&#58;";
        echo '<a href="'.$mailto.$address_encode.'" '.$extra.'>'.$text_encode.'</a>';

    } else {
        // no encoding
        echo '<a href="mailto:'.$address.'" '.$extra.'>'.$text.'</a>';

    }

}
