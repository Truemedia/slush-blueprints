"use strict";
var gulp = require('gulp'),
	gulpPlugins = require('auto-plug')('gulp'),
    textract = require('textract'),
    WordPOS = require('wordpos'),
    changeCase = require('change-case'),
    pluralize = require('pluralize');

var wordpos = new WordPOS();

/* Extract content from PDF */
gulp.task('experiment-pdf', function(done) {
	return gulp.src(['./*.pdf'])
             .pipe( gulpPlugins.intercept( function(file) {
                textract.fromFileWithPath(file.path, function(err, text) {
                    if (err) throw err;
                    wordpos.getNouns(text, function(nouns) {
                        var keywords = new Set();
                        for (let noun of nouns) {
                            var mutations = 0;
                            for (let transform in changeCase) {
                                let transformed = changeCase[transform](noun);
                                if (keywords.has(transformed)) {
                                    mutations++;
                                }
                            }
                            if (mutations == 0) {
                                keywords.add(noun);
                            }
                        }
                        console.log(keywords);
                        done();
                    });
                });
              }));
});
