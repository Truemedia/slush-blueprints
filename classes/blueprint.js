"use strict"

var File = require('vinyl'),
    path = require('path'),
    _ = require('underscore');

/**
  * Class for creating file blueprints (extending vinyl)
  */
class CoreBlueprint extends File {

  constructor (blueprintOptions) {
    super(blueprintOptions);
    this.pluginPath = blueprintOptions.pluginPath;
    this.encoding = blueprintOptions.encoding;
  }

    /**
      * Compile template into file content
      */
    compile (templateFileContents, templateData) {
        let tpl = _.template( templateFileContents.toString(this.encoding) )
        let fileContents = tpl(templateData);
        this.contents = new Buffer(fileContents, this.encoding);
    }

    /**
      * Get template path
      */
    templatePath (templateFilename) {
        return path.join(this.pluginPath, 'regen', 'templates', templateFilename);
    }
}

module.exports = CoreBlueprint;
