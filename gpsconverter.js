const gpxFolder = './gps/';
const fs = require('fs');
const path = require('path');
const gpxParse = require("gpx-parse");

let passes = [];

const processWaypoint = (waypoint) => {
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

    console.log(pass);
};

const processRoute = (route) => {
    route.points.filter((point) => {
        if (!point.name) {
            return false;
        }

        let splitted = point.name.split('/');
        // name / elevation / slope
        return splitted.length > 2;
    }).forEach(processWaypoint);
};

const procesGpxData = (data) => {
    if (!data.routes) {
        console.warn('No routes!');
        return;
    }

    data.routes.forEach(processRoute);
};

const processFile = (file) => {
    const filePath = path.join(gpxFolder, file);
    gpxParse.parseGpxFromFile(filePath, function(error, data) {
        if (error) {
            console.error(error);
            return;
        }
        
        procesGpxData(data);
    });
};

fs.readdir(gpxFolder, (error, files) => {
    if (error) {
        console.error(error);
        return;
    }

    files.forEach(processFile);
});

