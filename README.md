> A slush generator for many web things (PHP, JS, Python, Ruby, HTML and CSS variants), optimized for Laravel


## Getting Started

Install `slush-regenerator` globally:

```bash
$ npm install -g slush-regenerator
```

### Dependencies
This tool is only compatible with the following web stack, make sure these criteria are met or else you will experience problems when you load up your site:
* [Laravel 5.2*](https://laravel.com/docs/5.2)
* [Entrust](https://github.com/Zizaco/entrust)

### Usage
Just run the generator from within the Laravel powered website folder:

```bash
$ cd site.app && slush regenerator:generate
```

## Getting To Know Regenerator

Regenerator is a tool that you can use on new or existing Laravel websites (currently supporting 5.2+).

It allows you to generate code for almost any aspect of the application. Currently you can generate the following:
* Configuration files
* Controllers
* Commands
* Migrations
* Models
* Policies
* Requests
* Routes
* Seeds
* Views (Currently only PHP/HTML files as .php)

(I plan to support more features to build but they are either a work in progress, or have been rejected due to low priority on implementation)

## Contributing

See the [CONTRIBUTING Guidelines](https://github.com/Truemedia/slush-regenerator/blob/master/CONTRIBUTING.md)

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/Truemedia/slush-regenerator/issues).

## License

The MIT License

Copyright (c) 2016, Wade Penistone

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
