<?php
/**
 *
 * @package   lizmap
 * @subpackage lizmap
 * @author    3liz
 * @copyright 2019 3liz
 * @link      http://3liz.com
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */


class qgisAttributeEditorElement {

  protected $name;

  protected $attributes = array();

  protected $children = array();

  function __construct(SimpleXMLElement $node) {
    $this->name = $node->getName();

    foreach($node->attributes() as $name=>$attr) {
      $this->attributes[$name] = (string)$attr;
    }

    foreach ($node->children() as $child ) {
      $this->children[] = new qgisAttributeEditorElement($child);
    }
  }

  public function getName() {
    return $this->name;
  }

  public function getAttribute($name) {
    if (isset($this->attributes[$name])) {
      return $this->attributes[$name];
    }
    return null;
  }

  /**
   * @return qgisAttributeEditorForm[]
   */
  public function getChildren() {
    return $this->children;
  }

  public function hasChildren() {
    return count($this->children) > 0;
  }

  public function hasGroupBox() {
    return ($this->getAttribute('groupBox') === '1');
  }

}