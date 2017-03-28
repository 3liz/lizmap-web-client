PHP Redis
==========
php-redis contains php classes for connecting with redis database with methods 
for all available commands in redis.

It provides pure PHP API, and doesn't rely on some PHP extensions.

Quick start
-----------
* Install Redis Server from [redis.io](http://redis.io/download "Redis")
* Download latest php-redis class from [here](https://github.com/jelix/php-redis/archives/master)
* Write some code:

```php
		# Connecting
		$r = new \PhpRedis\Redis('localhost', 6379);
		
		# Save some value
		$r->some_key = 'hello world';
		
		# Outputting it
		echo $r->some_key;
		
		# Call any redis method (including methods added in redis 2.*)
		echo $r->zcard('zkey');
```

Changelog
---------

- 1.0: Initial implementation with all functions implemented up to redis 1.0
- 1.1:
    - The unified request protocol is used (intruduced in redis 1.2). 
    - Redis implements the __call magic method. Any non-implemented redis method can be called via ->methodname(param1, ...)
- 1.2: pipeline support. ->pipeline_begin() and then execute any number of commands - each will return null
        Then run ->pipeline_responses() to get all of the responses as array and end the pipeline mode
- 1.2.1: fix quit() error, undefined variable on connection errors, and add closing during destruction of the object
- 1.3.0:
    - support of Pub/Sub
    - new method flushByPrefix(). Read warning in the method comment. 
    - new methods getHost() and getPort()
    - fix cloning support: a clone should not reuse the same socket.
- 2.0.0: 
    - move classes into a namespace to avoid conflicts with classes of the redis extension.
