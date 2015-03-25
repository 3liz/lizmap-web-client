<?php
/**
 *  Wikipedia Table style diff formatter.
 * @author Olivier Demah (for Jelix)
 * @contributor Laurent Jouanneau
 * @copyright 2008 Olivier Demah, 2009 Laurent Jouanneau
 */
require_once(__DIR__.'/diffhtml.php');


class _HtmlTableDiffFormatter extends DiffFormatter
{
    protected $originalLineNum = 0;
    protected $finalLineNum = 0;
    function __construct($version1,$version2) {
      $this->version1 = $version1;
      $this->version2 = $version2;
      $this->leading_context_lines = 2;
      $this->trailing_context_lines = 2;
    }
  
    function _end_diff() {
        echo '</table>';
        $val = ob_get_contents();
        ob_end_clean();
        return $val;
    }

    function _start_block( $header ) {
        echo '<tbody class="block">';
        echo '<tr class="headblock">'.$header.'</tr>'; 
    }
  
    function _end_block() {
        echo '</tbody>';
    }
  
    function _lines( $lines, $prefix=' ', $color="white" ) {
    }

    function _changed( $orig, $closing ) {
        $diff = new WordLevelDiff( $orig, $closing );
        $del = $diff->orig();
        $add = $diff->_final();
    
        while ( $line = array_shift( $del ) ) {
            $aline = array_shift( $add );
            $this->changedLine($line, $aline);
            $this->originalLineNum++;
            $this->finalLineNum++;
        }
        $this->_added( $add ); // If any leftovers
    }
}


class HtmlTableDiffFormatter extends _HtmlTableDiffFormatter
{
    function addedLine($line) {
        $line = str_replace('  ','&nbsp; ', $line);
        return '<th>'.$this->finalLineNum.'</th><td class="final">' .$line.'</td>';
    }
  
    function deletedLine($line) {
        $line = str_replace('  ','&nbsp; ',$line);
        return '<th>'.$this->originalLineNum.'</th><td class="original">' .$line.'</td>';
    }
  
    function changedLine($original, $final) {
        print( '<tr class="modified">' . $this->deletedLine($original) . $this->addedLine($final) . "</tr>\n" );
    }

    function emptyLine() {
        //$line = str_replace('  ','&nbsp; ',$line);
        return '<td colspan="2">&nbsp;</td>';
    }
  
    function contextLine($line, $number) {
        $line = str_replace('  ','&nbsp; ',$line);
        return '<th>'.$number.'</th><td>'.$line.'</td>';
    }

    function _start_diff() {
        ob_start();
        echo '<table class="diff sidebyside">'."\n".
        '<colgroup class="l"><col class="lineno" /><col class="diffcontent" /></colgroup>'."\n".
        '<colgroup class="r"><col class="lineno" /><col class="diffcontent" /></colgroup>'."\n";
        if($this->version1 != '' || $this->version2 != '')        
            echo '<thead><tr><th colspan="2">'.$this->version1."</th>\n" .
            '<th colspan="2">'.$this->version2."</th></tr></thead>\n";
    }

    function _block_header( $xbeg, $xlen, $ybeg, $ylen ) {
        $this->originalLineNum = $xbeg;
        $this->finalLineNum = $ybeg;
        if ($xlen != 1)
            $xbeg .= "," . $xlen;
        if ($ylen != 1)
            $ybeg .= "," . $ylen;
        $r = '<th>'.$xbeg.'</th> <th>&nbsp;</th> <th>'.$ybeg.'</th> <th>&nbsp;</th>'; 
        return $r;
    }
  
    function _added($lines) {
        foreach ($lines as $line) {
            print( '<tr class="added">' . $this->emptyLine() . $this->addedLine($line) . "</tr>\n" );
            $this->finalLineNum++;
        }
    }
  
    function _deleted($lines) {
        foreach ($lines as $line) {
            print( '<tr class="deleted">' . $this->deletedLine($line) . $this->emptyLine() . "</tr>\n" );
            $this->originalLineNum++;
        }
    }
  
    function _context( $lines ) {
        foreach ($lines as $line) {
            print( '<tr class="context">' . $this->contextLine($line,$this->originalLineNum) . $this->contextLine($line,$this->finalLineNum) . "</tr>\n" );
            $this->originalLineNum++;
            $this->finalLineNum++;
        }
    }
}

class HtmlInlineTableDiffFormatter extends _HtmlTableDiffFormatter
{
    function changedLine($original, $final) {
        print( '<tr class="modified">' . $this->deletedLine($original) . "</tr>\n" );
        print( '<tr class="modified">' . $this->addedLine($final) . "</tr>\n" );
    }
    
    function addedLine( $line ) {
        $line = str_replace('  ','&nbsp; ',$line);
        return '<th>&nbsp;</th><th>'.$this->finalLineNum.'</th><td class="final">' .$line.'</td>';
    }
  
    function deletedLine( $line ) {
        $line = str_replace('  ','&nbsp; ',$line);
        return '<th>'.$this->originalLineNum.'</th><th>&nbsp;</th><td class="original">' .$line.'</td>';   
    }
  
    function emptyLine() {
        //$line = str_replace('  ','&nbsp; ',$line);
        return '<th>'.$this->originalLineNum.'</th><th>'.$this->finalLineNum.'</th><td>&nbsp;</td>';
    }
  
    function contextLine($line) {
        $line = str_replace('  ','&nbsp; ',$line);
        return '<th>'.$this->originalLineNum.'</th><th>'.$this->finalLineNum.'</th><td>'.$line.'</td>';
    }

    function _start_diff() {
        ob_start();
        echo '<table class="diff inlinetable">'."\n".
        '<colgroup><col class="lineno" /><col class="lineno" /><col class="diffcontent" /></colgroup>'."\n";
        if($this->version1 != '' || $this->version2 != '')        
            echo '<thead><tr><th>'.$this->version1."</th>\n" .
            '<th>'.$this->version2."</th><th>&nbsp;</th></tr></thead>\n";    
    }

    function _block_header( $xbeg, $xlen, $ybeg, $ylen ) {
        $this->originalLineNum = $xbeg;
        $this->finalLineNum = $ybeg;

        if ($xlen != 1)
            $xbeg .= "," . $xlen;
        if ($ylen != 1)
            $ybeg .= "," . $ylen;
        $r = '<th>'.$xbeg.'</th> <th>'.$ybeg.'</th> <th>&nbsp;</th>'; 
        return $r;
    }

    function _added($lines) {
        foreach ($lines as $line) {
            print( '<tr class="added">'. $this->addedLine($line) . "</tr>\n" );
            $this->finalLineNum++;
        }
    }

    function _deleted($lines) {
        foreach ($lines as $line) {
            print( '<tr class="deleted">'. $this->deletedLine($line) ."</tr>\n" );
            $this->originalLineNum++;
        }
    }
  
    function _context( $lines ) {
        foreach ($lines as $line) {
            print( '<tr class="context">' . $this->contextLine($line) ."</tr>\n" );
            $this->originalLineNum++;
            $this->finalLineNum++;
        }
    }
}
