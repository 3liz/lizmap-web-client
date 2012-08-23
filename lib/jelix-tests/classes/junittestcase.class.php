<?php
/**
* @package     jelix
* @subpackage  junittests
* @author      Laurent Jouanneau
* @contributor Christophe Thiriot
* @copyright   2006-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jUnitTestCase extends PHPUnit_Framework_TestCase {

    // for database management

    protected $dbProfile ='';
    protected $needPDO = false;

    public function setUp() {
        parent::setUp();
        if($this->needPDO && false === class_exists('PDO',false)){
            $this->markTestSkipped('PDO does not exists ! You should install PDO because tests need it.');
        }
    }

    /**
     * compatibility with simpletests
    */
    public function assertEqualOrDiff($first, $second, $message = "%s"){
        return $this->assertEquals($first, $second, $message);
    }

    //    complex equality

    public function assertComplexIdentical($value, $file, $errormessage=''){
        $xml = simplexml_load_file($file);
        if(!$xml){
            trigger_error('Unable to load file '.$file,E_USER_ERROR);
            return false;
        }
        return $this->_checkIdentical($xml, $value, '$value', $errormessage);
    }

    public function assertComplexIdenticalStr($value, $string, $errormessage=''){
        $xml = simplexml_load_string($string);
        if(!$xml){
            trigger_error('Wrong xml content '.$string,E_USER_ERROR);
            return false;
        }
        if($errormessage != '')
            $errormessage = ' ('.$errormessage.')';
        return $this->_checkIdentical($xml, $value, '$value', $errormessage);
    }

/*

<object class="jDaoMethod">
    <string property="name" value="" />
    <string property="type" value="" />
    <string property="distinct" value="" />

    <object method="getConditions()" class="jDaoConditions">
        <array property="order">array()</array>
        <array property="fields">array()</array>
        <object property="condition" class="jDaoCondition">
            <null property="parent"/>
            <array property="conditions"> array(...)</array>
            <array property="group">
                <object key="" class="jDaoConditions" test="#foo" />
             </array>
        </object>

    </object>
</object>


<ressource />
<string value="" />
<integer value="" />
<float value=""/>
<null />
<boolean value="" />
<array>
<object class="">
</object>*/

    function _checkIdentical($xml, $value, $name, $errormessage){
        $nodename  = dom_import_simplexml($xml)->nodeName;
        switch($nodename){
            case 'object':
                if(isset($xml['class'])){
                    $ok = $this->assertInternalType((string)$xml['class'], $value, $name.': not a '.(string)$xml['class'].' object'.$errormessage);
                }else
                    $ok = $this->assertTrue(is_object($value),  $name.': not an object'.$errormessage);
                if(!$ok) return false;

                foreach ($xml->children() as $child) {
                    if(isset($child['property'])){
                        $n = (string)$child['property'];
                        $v = $value->$n;
                    }elseif(isset($child['p'])){
                        $n = (string)$child['p'];
                        $v = $value->$n;
                    }elseif(isset($child['method'])){
                        $n = (string)$child['method'];
                        eval('$v=$value->'.$n.';');
                    }elseif(isset($child['m'])){
                        $n = (string)$child['m'];
                        eval('$v=$value->'.$n.';');
                    }else{
                        trigger_error('no method or attribute on '.(dom_import_simplexml($child)->nodeName), E_USER_WARNING);
                        continue;
                    }
                    $ok &= $this->_checkIdentical($child, $v, $name.'->'.$n,$errormessage);
                }

                if(!$ok)
                    $this->fail($name.' : non identical objects'.$errormessage);
                return $ok;

            case 'array':
                $ok = $this->assertInternalType('array', $value, $name.': not an array'.$errormessage);
                if(!$ok) return false;

                if(trim((string)$xml) != ''){
                    if( false === eval('$v='.(string)$xml.';')){
                        $this->fail("invalid php array syntax");
                        return false;
                    }
                    return $this->assertEquals($v,$value,'negative test on '.$name.': %s'.$errormessage);
                }else{
                    $key=0;
                    foreach ($xml->children() as $child) {
                        if(isset($child['key'])){
                            $n = (string)$child['key'];
                            if(is_numeric($n))
                                $key = intval($n);
                        }else{
                            $n = $key ++;
                        }

                        if($this->assertTrue(array_key_exists($n,$value),$name.'['.$n.'] doesn\'t exist arrrg'.$errormessage)){
                            $v = $value[$n];
                            $ok &= $this->_checkIdentical($child, $v, $name.'['.$n.']',$errormessage);
                        }else $ok= false;
                    }
                    return $ok;
                }
                break;

            case 'string':
                $ok = $this->assertInternalType('string', $value,$name.': not a string'.$errormessage);
                if(!$ok) return false;
                if(isset($xml['value'])){
                    return $this->assertEquals((string)$xml['value'],$value, $name.': bad value. %s'.$errormessage);
                }
                else
                    return true;
            case 'int':
            case 'integer':
                $ok = $this->assertTrue(is_integer($value), $name.': not an integer ('.$value.') '.$errormessage);
                if(!$ok) return false;
                if(isset($xml['value'])){
                    return $this->assertEquals(intval((string)$xml['value']),$value, $name.': bad value. %s'.$errormessage);
                }else
                    return true;
            case 'float':
            case 'double':
                $ok = $this->assertInternalType('float', $value,$name.': not a float ('.$value.') '.$errormessage);
                if(!$ok) return false;
                if(isset($xml['value'])){
                    return $this->assertEquals( floatval((string)$xml['value']),$value,$name.': bad value. %s'.$errormessage);
                }else
                    return true;
            case 'boolean':
                $ok = $this->assertInternalType('boolean', $value,$name.': not a boolean ('.$value.') '.$errormessage);
                if(!$ok) return false;
                if(isset($xml['value'])){
                    $v = ((string)$xml['value'] == 'true');
                    return $this->assertEquals($v ,$value, $name.': bad value. %s'.$errormessage);
                }else
                    return true;
            case 'null':
                return $this->assertNull($value, $name.': not null ('.$value.') '.$errormessage);
            case 'notnull':
                return $this->assertNotNull($value, $name.' is null'.$errormessage);
            case 'resource':
                return $this->assertInternalType('resource', $value,$name.': not a resource'.$errormessage);
            default:
                $this->fail("_checkIdentical: balise inconnue ".$nodename.$errormessage);
        }
    }
}
