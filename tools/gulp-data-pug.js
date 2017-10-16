const through = require('through2');
const gutil = require('gulp-util');
const pug = require('pug');

const PluginError = gutil.PluginError;
const ext = gutil.replaceExtension;

const PLUGIN_NAME = 'gulp-data-pug';

function gulpDataPug(fileName) {
    if (!fileName) {
        throw new PluginError(PLUGIN_NAME, 'Missing file name!');
    }

    function compilePug(file, enc, cb) {
        if (file.isStream()) {
            cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        file.path = ext(file.path, '.html');
        
        const passData = JSON.parse(file.contents.toString());

        try {
            const compiled = pug.renderFile(fileName, {
                pretty: true,
                filename: file.path,
                data: passData
            });
    
            file.contents = Buffer.from(compiled);
    
            cb(null, file);
        } catch(e) {
            cb(new PluginError(PLUGIN_NAME, e));
            return;
        }
    }

    return through.obj(compilePug);
};

module.exports = gulpDataPug;