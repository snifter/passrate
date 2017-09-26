const gpxFolderPath = '../gps/';
const dataFolderPath = '../src/data/';

const path = require('path');
const common = require('./common');

const extractPoints = (routes) => {
    return new Promise((resolve) => {
        let passes = [];

        routes.forEach((route) => {
            route.points.filter((point) => {
                if (!point.name) {
                    return false;
                }

                let splitted = point.name.split('/');
                // name / elevation / slope
                return splitted.length > 2;
            }).forEach((point) => {
                passes.push({
                    pass: point,
                    waypoints: route.points.slice()
                });
            });
        });
        
        resolve(passes);
    });
};

const convertToPassData = (passesPoints) => {
    return new Promise((resolve) => {
        let datas = [];

        passesPoints.forEach((passPoints) => {
            let passData = { 
                pass: common.createPassObject(passPoints.pass),
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

        resolve(datas);
    });
};

const dataFileName = (data) => {
    return path.join(dataFolderPath, `${data.pass.name}.json`);
};

common.listFilesInDir(gpxFolderPath)
    .then(common.parseGpxFiles)
    .then(common.extractRoutes)
    .then(extractPoints)
    .then(convertToPassData)
    .then((datas) => {
        return Promise.all(datas.map((data) => {
            return common.writeToFile(dataFileName(data), data);
        }));
    })
    .catch((error) => {
        console.error(error);
    });