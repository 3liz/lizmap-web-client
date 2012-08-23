<?php // -*-php-*-

// diff.php
//
// PhpWiki diff output code.
//
// Copyright (C) 2000, 2001 Geoffrey T. Dairiki <dairiki@dairiki.org>
// You may copy this code freely under the conditions of the GPL.
//
// Contributor : Laurent Jouanneau (sept 2006, may 2009)
//      this html formater doesn't use HTML lib...
//      adaptation for PHP5

require_once(dirname(__FILE__).'/difflib.php');

class _HWLDF_WordAccumulator {
    function __construct () {
        $this->_lines = array();
        $this->_line = false;
        $this->_group = false;
        $this->_tag = '~begin';
    }

    function _flushGroup ($new_tag) {
        if ($this->_group !== false) {
            if (!$this->_line)
                $this->_line = '';

            if($this->_tag)
               $this->_line.= '<'.$this->_tag.'>'.$this->_group.'</'.$this->_tag.'>';
            else $this->_line.= $this->_group;
        }
        $this->_group = '';
        $this->_tag = $new_tag;
    }

    function _flushLine ($new_tag) {
        $this->_flushGroup($new_tag);
        if ($this->_line)
            $this->_lines[] = $this->_line;
        $this->_line = '';
    }

    function addWords ($words, $tag = '') {
        if ($tag != $this->_tag)
            $this->_flushGroup($tag);

        foreach ($words as $word) {
            // new-line should only come as first char of word.
            if ($word === null)
                continue;
            if ($word[0] == "\n") {
                $this->_group .= " ";
                $this->_flushLine($tag);
                $word = substr($word, 1);
            }
            assert(!strstr($word, "\n"));
            $this->_group .= htmlspecialchars($word);
        }
    }

    function getLines() {
        $this->_flushLine('~done');
        return $this->_lines;
    }
}

class WordLevelDiff extends MappedDiff
{
    function __construct ($orig_lines, $final_lines) {
        list ($orig_words, $orig_stripped) = $this->_split($orig_lines);
        list ($final_words, $final_stripped) = $this->_split($final_lines);


        parent::__construct($orig_words, $final_words,
                          $orig_stripped, $final_stripped);
    }

    function _split($lines) {
        // FIXME: fix POSIX char class.
        if (!preg_match_all('/ ( [^\S\n]+ | [[:alnum:]]+ | . ) (?: (?!< \n) [^\S\n])? /xs',
                            implode("\n", $lines),
                            $m)) {
            return array(array(''), array(''));
        }
        return array($m[0], $m[1]);
    }

    function orig () {
        $orig = new _HWLDF_WordAccumulator;

        foreach ($this->edits as $edit) {
            if ($edit->type == 'copy')
                $orig->addWords($edit->orig);
            elseif ($edit->orig)
                $orig->addWords($edit->orig, 'del');
        }
        return $orig->getLines();
    }

    function _final () {
        $final = new _HWLDF_WordAccumulator;

        foreach ($this->edits as $edit) {
            if ($edit->type == 'copy')
                $final->addWords($edit->final);
            elseif ($edit->final)
                $final->addWords($edit->final, 'ins');
        }
        return $final->getLines();
    }
}


/**
 * HTML unified diff formatter.
 *
 * This class formats a diff into a CSS-based
 * unified diff format.
 *
 * Within groups of changed lines, diffs are highlit
 * at the character-diff level.
 */
class HtmlUnifiedDiffFormatter extends UnifiedDiffFormatter
{
    public $result;

    function __construct($context_lines = 4) {
        parent::__construct($context_lines);
    }

    function _start_diff() {
        $this->result = '<div class="diff unified">';
    }
    function _end_diff() {
        return $this->result.'</div>';
    }

    function _start_block($header) {
        $this->result.='<div class="block"><span class="lineno">'.$header.'</span>';
    }

    function _end_block() {
        $this->result.='</div>';
    }

    /*function _lines($lines, $class, $prefix = '&nbsp;', $elem = false) {

        $div = '<div class="difftext">';
        foreach ($lines as $line) {
            if ($elem)
                $line = '<'.$elem.'>'.$line.'</'.$elem.'>';
            $div.="\n".'<div class="'.$class.'"><tt class="prefix">'.$prefix.'</tt>'.$line.'</div>';

        }
        $this->result.=$div."</div>\n";
    }*/

    function _context($lines) {
        $div = '';
        foreach ($lines as $line) {
            $div.="\n".'<div class="context"><tt>&nbsp;</tt>'.htmlspecialchars($line).'</div>';
        }
        $this->result.=$div."\n";
    }
    function _deleted($lines) {
        $div = '';
        foreach ($lines as $line) {
            $div.="\n".'<div class="deleted"><tt>-</tt><del>'.htmlspecialchars($line).'</del></div>';
        }
        $this->result.=$div."\n";
    }

    function _added($lines) {
        $div = '';
        foreach ($lines as $line) {
            $div.="\n".'<div class="added"><tt>+</tt><ins>'.htmlspecialchars($line).'</ins></div>';
        }
        $this->result.=$div."\n";
    }

    function _changed($orig, $final) {
        $diff = new WordLevelDiff($orig, $final);
        $div = '';
        foreach ($diff->orig() as $line) {
            $div.="\n".'<div class="original"><tt>-</tt>'.$line.'</div>';

        }
        $this->result.=$div."\n";
        $div = '';
        foreach ($diff->_final() as $line) {
            $div.="\n".'<div class="final"><tt>+</tt>'.$line.'</div>';

        }
        $this->result.=$div."\n";
    }
}
