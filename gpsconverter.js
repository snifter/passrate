const gpxFolder = './gps/';
const fs = require('fs');
const path = require('path');
const gpxParse = require('gpx-parse');
const jsonPath = './src/json/passes.json';

const processFile = (filePath) => {
    return new Promise((resolve, reject) => {
        gpxParse.parseGpxFromFile(filePath, function(error, data) {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            
            resolve(data);
        });
    });
};

const parseGpxFiles = (files) => {
    return Promise.all(files.map((file) => {
        return processFile(file);
    }));
};

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

const extractRoutes = (datas) => {
    return new Promise((resolve) => {
        let routes = [];
        datas.forEach((data) => {
            if (!data.routes) {
                console.warn('No routes!');
                return;
            }

            data.routes.forEach((route) => {
                routes.push(route);
            });
        });

        resolve(routes);
    });
};

const extractPoints = (routes) => {
    return new Promise((resolve) => {
        let points = [];
        routes.forEach((route) => {
            route.points.filter((point) => {
                if (!point.name) {
                    return false;
                }

                let splitted = point.name.split('/');
                // name / elevation / slope
                return splitted.length > 2;
            }).forEach((point) => {
                points.push(point);
            });
        });

        resolve(points);
    });
};

const createPassObjects = (waypoints) => {
    return new Promise((resolve) => {
        let passes = [];
        waypoints.forEach((waypoint) => {
            let splitted = waypoint.name.split('/');

            const name = splitted[0].trim();
            const elevation = splitted[1].trim();
            const slope = splitted[2].trim();

            const pass = {
                name: name,
                point: [waypoint.lat, waypoint.lon],
                elevation: elevation,
                slope: slope
            };

            passes.push(pass);
        });

        resolve(passes);
    });
};

const writeToFile = (path, content) => {
    return new Promise((resolve, reject) => {
        const json = JSON.stringify(content, null, 2);

        fs.writeFile(path, json, 'utf-8', (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

listFilesInDir(gpxFolder)
    .then(parseGpxFiles)
    .then(extractRoutes)
    .then(extractPoints)
    .then(createPassObjects)
    .then((passes) => {
        return writeToFile(jsonPath, passes);
    });