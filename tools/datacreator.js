const gpxFolderPath = '../gps/';
const dataFolderPath = '../src/data/';

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

const createPassObject = (waypoint) => {
    let splitted = waypoint.name.split('/');
    
    const name = splitted[0].trim();
    const elevation = splitted[1].trim();
    const slope = splitted.length > 2 ? splitted[2].trim() : '';

    return {
        name: name,
        point: { 
            lat: waypoint.lat, 
            lon: waypoint.lon 
        },
        elevation: elevation,
        slope: slope
    };
};

const createEmptyPassObject = (filePath) => {
    return {
        name: path.basename(filePath, path.extname(filePath)),
        point: { 
            lat: 0, 
            lon: 0 
        },
        elevation: '',
        slope: ''
    };
};

const processFile = (filePath) => {
    return new Promise((resolve, reject) => {
        gpxParse.parseGpxFromFile(filePath, function(error, data) {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            
            if (!data.routes) {
                console.warn('No routes!', filePath);
                resolve();
                return;
            }

            if (data.routes.length != 1) {
                console.warn('More than 1 or no routes!', filePath);
                resolve();
                return;
            }

            const route = data.routes[0];
            
            let passes = [];

            const passPoints = route.points.filter((point) => {
                if (!point.name) {
                    return false;
                }

                let splitted = point.name.split('/');
                // name / elevation / slope
                if (splitted.length > 2) {
                    return true;
                }

                if (splitted.length == 2) {
                    const elevation = splitted[1];
                    return !!elevation.match(/[0-9]+m/g) || false;
                }

                return false;
            });

            if (passPoints.length > 0) {
                passPoints.forEach((point) => {
                    passes.push({
                        pass: point,
                        waypoints: route.points.slice()
                    });
                });
            } else {
                passes.push({
                    waypoints: route.points.slice()
                });
            }

            let datas = [];
            
            passes.forEach((passPoints) => {
                let passData = { 
                    pass: passPoints.pass 
                        ? createPassObject(passPoints.pass) 
                        : createEmptyPassObject(filePath),
                    routePoints: passPoints.waypoints.map((waypoint) => {
                        return {
                            lat: waypoint.lat,
                            lon: waypoint.lon
                        }
                    }),
                    country: '',
                    region: '',
                    closed: {
                        from: '',
                        to: ''
                    },
                    difficulty: 0
                };
    
                datas.push(passData);
            });
            
            Promise.all(datas.map((data) => {
                return writeToFile(dataFileName(data), data);
            })).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
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

const dataFileName = (data) => {
    return path.join(dataFolderPath, `${data.pass.name}.json`);
};

listFilesInDir(gpxFolderPath)
    .then((paths) => {
        return Promise.all(paths.map((file) => {
            return processFile(file);
        }));
    })
    .catch((error) => {
        console.error(error);
    });