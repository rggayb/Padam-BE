// utils/overpassQuery.js

/**
 * Generates an Overpass API query to find water sources near a specific location.
 * @param {number} latitude - Latitude of the location.
 * @param {number} longitude - Longitude of the location.
 * @param {number} radius - Search radius in meters.
 * @returns {string} - The Overpass API query string.
 */
function queryGetNearestWaterSourcesOnRadius(latitude, longitude, radius) {
  return `
      (
        node(around:${radius}, ${latitude}, ${longitude})["natural"="water"];
        node(around:${radius}, ${latitude}, ${longitude})["waterway"="water_source"];
        way(around:${radius}, ${latitude}, ${longitude})["natural"="water"];
        way(around:${radius}, ${latitude}, ${longitude})["waterway"="water_source"];
        relation(around:${radius}, ${latitude}, ${longitude})["natural"="water"];
        relation(around:${radius}, ${latitude}, ${longitude})["waterway"="water_source"];
      );
      out body;
      >;
      out skel qt;
    `;
}

module.exports = { queryGetNearestWaterSourcesOnRadius };
