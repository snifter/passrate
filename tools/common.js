const fs = require('fs');
const path = require('path');
const gpxParse = require('gpx-parse');

const listFilesInDir = (dirPath) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (error, files) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }

            const paths = files.map((file) => {
                return path.join(dirPath, file);
            });

            resolve(paths);
        });
    });
};

module.exports = {
    listFilesInDir: listFilesInDir
}