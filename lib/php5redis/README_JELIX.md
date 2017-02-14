The version 1.3 of php-redis is in Redis.php, while the version 2.0.0 is in
lib/Redis.php.

The only difference between both is that Redis class from 2.0.0 is declared into
a namespace, to avoid conflicts with the Redis extension for PHP (and it is
autoloaded)

The version 1.3 is in Jelix 1.6 only for compatibility with Jelix 1.6 application.
You should use version 2.0.0 if possible, as 1.3 will be removed from Jelix 1.7+.

