const through = require('through2');
const gutil = require('gulp-util');
const path = require('path');

const PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-geojson';

function gulpGeojson(fileName) {
    if (!fileName) {
        throw new PluginError(PLUGIN_NAME, 'Missing file name!');
    }

    let latestFile;
    let latestMod;
    let result = {
        type: 'FeatureCollection',
        features: []
    };

    function bufferPasses(file, enc, cb) {
        if (file.isNull()) {
            cb();
            return;
        }
      
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            cb();
            return;
        }

        const passData = JSON.parse(file.contents.toString());
        const pass = passData.pass;

        result.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [pass.point.lon, pass.point.lat]
            },
            properties: {
                name: pass.name,
                elevation: pass.elevation,
                slope: pass.slope
            }
        });

        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
            latestFile = file;
            latestMod = file.stat && file.stat.mtime;
        }

        cb();
    }

    function endStream(cb) {
        if (!latestFile) {
            cb();
            return;
        }

        let resultFile = latestFile.clone({contents: false});
        resultFile.path = path.join(latestFile.base, fileName);

        resultFile.contents = Buffer.from(JSON.stringify(result, null, 2));
        
        this.push(resultFile);
        cb();
    }

    return through.obj(bufferPasses, endStream);
};

module.exports = gulpGeojson;