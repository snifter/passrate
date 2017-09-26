const gpxFolder = '../gps/';
const jsonPath = '../src/json/passes.json';

const common = require('./common');

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

const convertToGeojson = (passes) => {
    return new Promise((resolve) => {
        let result = {
            type: 'FeatureCollection',
            features: []
        };
        passes.forEach((pass) => {
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
        });

        resolve(result);
    });
};

common.listFilesInDir(gpxFolder)
    .then(common.parseGpxFiles)
    .then(common.extractRoutes)
    .then(extractPoints)
    .then(common.createPassObjects)
    .then(convertToGeojson)
    .then((passes) => {
        return common.writeToFile(jsonPath, passes);
    });