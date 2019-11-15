Guzzle Factory
==================

Guzzle Factory was created by, and is maintained by [Graham Campbell](https://github.com/GrahamCampbell), and provides a simple Guzzle 6 factory, with good defaults. Feel free to check out the [change log](CHANGELOG.md), [releases](https://github.com/GrahamCampbell/Guzzle-Factory/releases), [security policy](https://github.com/GrahamCampbell/Guzzle-Factory/security/policy), [license](LICENSE), [code of conduct](.github/CODE_OF_CONDUCT.md), and [contribution guidelines](.github/CONTRIBUTING.md).

<p align="center">
<a href="https://styleci.io/repos/88412277"><img src="https://styleci.io/repos/88412277/shield" alt="StyleCI Status"></img></a>
<a href="https://travis-ci.org/GrahamCampbell/Guzzle-Factory"><img src="https://img.shields.io/travis/GrahamCampbell/Guzzle-Factory/master.svg?style=flat-square" alt="Build Status"></img></a>
<a href="https://scrutinizer-ci.com/g/GrahamCampbell/Guzzle-Factory/code-structure"><img src="https://img.shields.io/scrutinizer/coverage/g/GrahamCampbell/Guzzle-Factory.svg?style=flat-square" alt="Coverage Status"></img></a>
<a href="https://scrutinizer-ci.com/g/GrahamCampbell/Guzzle-Factory"><img src="https://img.shields.io/scrutinizer/g/GrahamCampbell/Guzzle-Factory.svg?style=flat-square" alt="Quality Score"></img></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square" alt="Software License"></img></a>
<a href="https://github.com/GrahamCampbell/Guzzle-Factory/releases"><img src="https://img.shields.io/github/release/GrahamCampbell/Guzzle-Factory.svg?style=flat-square" alt="Latest Version"></img></a>
</p>


## Installation

Guzzle Factory requires [PHP](https://php.net) 7.0-7.4.

To get the latest version, simply require the project using [Composer](https://getcomposer.org):

```bash
$ composer require graham-campbell/guzzle-factory
```


## Usage

```php
<?php

use GrahamCampbell\GuzzleFactory\GuzzleFactory;

$client = GuzzleFactory::make(['base_uri' => 'https://example.com']);
```


## Security

If you discover a security vulnerability within this package, please send an email to Graham Campbell at graham@alt-three.com. All security vulnerabilities will be promptly addressed. You may view our full security policy [here](https://github.com/GrahamCampbell/Guzzle-Factory/security/policy).


## License

Guzzle Factory is licensed under [The MIT License (MIT)](LICENSE).


---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/packagist-graham-campbell-guzzle-factory?utm_source=packagist-graham-campbell-guzzle-factory&utm_medium=referral&utm_campaign=readme">Get professional support for Guzzle Factory with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
