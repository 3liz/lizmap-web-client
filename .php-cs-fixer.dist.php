<?php

$finder = PhpCsFixer\Finder::create()
          //->notPath('src/Symfony/Component/Translation/Tests/fixtures/resources.php')
          ->in(array(
                __DIR__.'/lizmap/modules/action',
                __DIR__.'/lizmap/modules/admin',
                __DIR__.'/lizmap/modules/dataviz',
                __DIR__.'/lizmap/modules/filter',
                __DIR__.'/lizmap/modules/lizmap',
                __DIR__.'/lizmap/modules/view',
                __DIR__.'/lizmap/plugins/',
                __DIR__.'/lizmap/app/responses',
                __DIR__.'/lizmap/scripts/',
              ))
          //->exclude(__DIR__.'/lizmap/modules/proj4php/classes/')
        ;

$config = new PhpCsFixer\Config();
return $config
          ->setCacheFile(__DIR__.'/.php-cs-fixer.cache')
          ->setRules([
              '@PSR2' => true,
              '@Symfony' => true,
              '@PhpCsFixer' => true,
              'array_syntax' => array('syntax'=>'long'),
              'method_argument_space'=> ['on_multiline' => 'ensure_fully_multiline'],
              'new_with_braces'=> true,
              'no_whitespace_in_blank_line'=> true,
              'no_whitespace_before_comma_in_array'=> true,
              'no_useless_return' => true,
              'no_unneeded_final_method'=> false,
              'no_unset_cast' => false,
              'no_leading_import_slash'=> true,
              'no_leading_namespace_whitespace'=> true,
              'no_extra_blank_lines'=> true,
              'no_empty_statement'=> true,
              'no_empty_comment'=> true,
              'object_operator_without_whitespace' => true,
              'ordered_class_elements' => false,
              'phpdoc_var_without_name' => true,
              'phpdoc_types' => true,
              'phpdoc_trim_consecutive_blank_line_separation' => true,
              'phpdoc_no_useless_inheritdoc' => true,
              'phpdoc_no_empty_return' => true,
              'phpdoc_add_missing_param_annotation' => true,
              'protected_to_private' => false,
              'semicolon_after_instruction' => true,
              'short_scalar_cast' => true,
              'simplified_null_return' => false,
              'simple_to_complex_string_variable' => false,
              'standardize_not_equals' => true,
              'standardize_increment' => true,
              'whitespace_after_comma_in_array' => true,
              'yoda_style'=>array(
                    'always_move_variable' => false,
                    'equal' => false,
                    'identical' => false,
                    'less_and_greater' => null,
                    )
          ])
          ->setFinder($finder)
        ;
