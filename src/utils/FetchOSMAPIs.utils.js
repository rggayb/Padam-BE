const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const xml2js = require("xml2js");

/**
 * Get the nearest road node from a water source using OSRM API.
 * @param {number} longitude - The longitude of the water source.
 * @param {number} latitude - The latitude of the water source.
 * @returns {Promise<Object>} - The nearest road information.
 */
async function getNearestRoadNode(longitude, latitude) {
  const url = `http://router.project-osrm.org/nearest/v1/driving/${longitude},${latitude}`;
  const response = await fetch(url);

  // Ensure the response status is OK
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();

  // Ensure the response code is "Ok" and has waypoints
  if (data.code === "Ok" && data.waypoints.length > 0) {
    const waypoint = data.waypoints[0];
    return {
      nodeRode: waypoint.nodes[0] !== 0 ? waypoint.nodes[0] : waypoint.nodes[1], // Select the first node in the nodes array or the second if the first is 0
      distanceFromWaterSource: waypoint.distance,
      address: waypoint.name,
      latitude: waypoint.location[1],
      longitude: waypoint.location[0],
    };
  } else {
    throw new Error("No waypoints found or response code is not OK");
  }
}

/**
 * Fetches water sources from the Overpass API based on the provided query.
 * @param {string} query - The Overpass API query string.
 * @returns {Promise<Array>} - Array of water sources with way IDs and associated nodes.
 */
async function fetchOSMNearestWaterSource(query) {
  const response = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch data from OSM");
  }

  const xmlData = await response.text();
  const parsedData = await xml2js.parseStringPromise(xmlData);

  // Extract nodes and format them as array of objects
  const waterSources = [];
  if (parsedData.osm && parsedData.osm.node && parsedData.osm.way) {
    parsedData.osm.way.forEach((way) => {
      const wayObj = {
        wayId: way.$.id,
        nodes: [],
      };

      way.nd.forEach((nd) => {
        const node = parsedData.osm.node.find((node) => node.$.id === nd.$.ref);
        if (node) {
          wayObj.nodes.push({
            nodeId: node.$.id,
            latitude: node.$.lat,
            longitude: node.$.lon,
          });
        }
      });

      waterSources.push(wayObj);
    });
  }

  // // compare the numbers of way from waterSources and with the response from OSM
  // console.log(waterSources.length);
  // console.log(parsedData.osm.way.length);

  // // compare the numbers of nodes from waterSources and with the response from OSM
  // var totalNodes = 0;
  // var totalNodesOSM = 0;

  // for (let i = 0; i < waterSources.length; i++) {
  //   totalNodes += waterSources[i].nodes.length;
  // }
  // for (let i = 0; i < parsedData.osm.way.length; i++) {
  //   totalNodesOSM += parsedData.osm.way[i].nd.length;
  // }

  // console.log(totalNodes);

  return waterSources;
}

/**
 * Fetches address from OpenStreetMap (OSM) based on wayId, nodeId, or relationId.
 * @param {string} wayId - The way ID to search for in OSM.
 * @param {string} nodeId - The node ID to search for in OSM.
 * @param {string} relationId - The relation ID to search for in OSM.
 * @returns {Promise<string>} - The name of the place found.
 */
async function getAddressFromOsmIds(
  wayId = null,
  nodeId = null,
  relationId = null
) {
  const osmIds = [];
  // Set the osmIds based on the provided wayId, nodeId, and relationId
  if (wayId) osmIds.push(`W${wayId}`);
  if (nodeId) osmIds.push(`N${nodeId}`);
  if (relationId) osmIds.push(`R${relationId}`);
  if (osmIds.length === 0) {
    return "Unnamed Place";
  }

  // Join all osmIds into a single comma-separated string
  const osmIdsString = osmIds.join(",");
  const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=${osmIdsString}&format=xml`;
  const headers = {
    "User-Agent": "Padam/1.0 (padam.td@gmail.com)",
  };

  // Fetch data from Nominatim API
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const xmlData = await response.text();

  // Parse XML to JSON
  const result = await xml2js.parseStringPromise(xmlData);
  if (!result.searchresults || !result.searchresults.place) {
    return "Unnamed Place"; // No valid data found
  }

  // Loop through the places in the response and prioritize way > node > relation
  const places = result.searchresults.place.map((place) => {
    const address = {
      water: place.water ? place.water[0] : null,
      commercial: place.commercial ? place.commercial[0] : null,
      suburb: place.suburb ? place.suburb[0] : null,
      village: place.village ? place.village[0] : null,
      city: place.city ? place.city[0] : null,
      state: place.state ? place.state[0] : null,
      country: place.country ? place.country[0] : null,
    };

    // Find the first non-null name
    const placeName =
      address.water ||
      address.commercial ||
      address.suburb ||
      address.village ||
      address.city ||
      address.state ||
      address.country ||
      "Unnamed Place";

    return {
      placeId: place.$.place_id,
      osmType: place.$.osm_type,
      osmId: place.$.osm_id,
      lat: parseFloat(place.$.lat),
      lon: parseFloat(place.$.lon),
      placeName,
    };
  });

  // Return the first valid address based on way, node, or relation priority
  if (places.length > 0) {
    return places[0].placeName;
  } else {
    return "Unnamed Place"; // Fallback in case no valid address is found
  }
}

module.exports = {
  getNearestRoadNode,
  fetchOSMNearestWaterSource,
  getAddressFromOsmIds,
};
