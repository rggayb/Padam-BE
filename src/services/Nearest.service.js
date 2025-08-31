const { getWaterResources } = require("./WaterResources.service");
const { getDistanceFromLatLonInKm } = require("../utils/GetDistance.utils");
const { fetchOSMNearestWaterSource } = require("../utils/FetchOSMAPIs.utils");

exports.getWaterSources = async (body) => {
    const { latitude, longitude, radius } = body;

    // Get water sources from database
    const waterSources = await getWaterResources({ latitude, longitude, radius });

    // Get nearest water sources from OSM
    const osmWaterSources = await fetchOSMNearestWaterSource(
        `[out:xml][timeout:25];
        (
          node["natural"="water"](around:${radius * 1000},${latitude},${longitude});
          way["natural"="water"](around:${radius * 1000},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;`
    );

    // Combine and sort by distance
    const allWaterSources = [...waterSources, ...osmWaterSources];
    
    // Calculate distances and sort
    const waterSourcesWithDistance = allWaterSources.map(source => {
        let sourceLat, sourceLon;
        
        // Handle database sources with new coordinates structure
        if (source.coordinates) {
            sourceLat = source.coordinates.latitude;
            sourceLon = source.coordinates.longitude;
        } else {
            // Handle OSM sources
            sourceLat = source.latitude || source.lat;
            sourceLon = source.longitude || source.lon;
        }
        
        const distance = getDistanceFromLatLonInKm(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(sourceLat),
            parseFloat(sourceLon)
        );
        return { ...source, distance };
    });

    // Sort by distance (nearest first)
    waterSourcesWithDistance.sort((a, b) => a.distance - b.distance);

    return waterSourcesWithDistance;
};
