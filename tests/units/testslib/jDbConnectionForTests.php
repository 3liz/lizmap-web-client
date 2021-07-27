<?php

class jDbConnectionForTests
{
    public function encloseName($name)
    {
        return $name;
    }

    public function quote($name)
    {
        return '"'.$name.'"';
    }
}
