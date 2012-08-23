PHP5 Redis
==========
php-redis contains php5 class for connecting with redis database with methods for all available commands in redis

Quick start
-----------
* Install Redis from [redis.io](http://redis.io/download "Redis")
* Download latest php-redis class from [here](https://github.com/sash/php-redis/archives/master)
* Write some code:

		# Connecting
		$r = new Redis('localhost', 6379);
		
		# Save some value
		$r->some_key = 'hello world';
		
		# Outputting it
		echo $r->some_key;
		
		# Call any redis method (including methods added in redis 2.*)
		echo $r->zcard('zkey');
		
Changelog
---------
	1.0 - Initial implementation with all functions implemented up to redis 1.0
	1.1 - The unified request protocol is used (intruduced in redis 1.2). 
		- Redis implements the __call magic method. Any non-implemented redis method can be called via ->methodname(param1, ...)
	1.2 - pipeline support. ->pipeline_begin() and then execute any number of commands - each will return null
		Then run ->pipeline_responses() to get all of the responses as array and end the pipeline mode