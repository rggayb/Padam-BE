const { getDistanceFromLatLonInKm } = require("../utils/GetDistance.utils");
const {
  queryGetNearestWaterSourcesOnRadius,
} = require("../utils/QueryOSM.utils");
const {
  getNearestRoadNode,
  getAddressFromOsmIds,
  fetchOSMNearestWaterSource,
} = require("../utils/FetchOSMAPIs.utils");
const { getWaterResources } = require("./WaterResources.service");

exports.getWaterSources = async function (body) {
  const { longitude, latitude, radius } = body;
  if (!longitude || !latitude) {
    throw new Error("Please provide all the required fields");
  }
  if (!radius) {
    throw new Error("Please provide the radius");
  }

  // Fetch water sources from both OSM and local database
  const [osmSources, dbSources] = await Promise.all([
    fetchOSMSources(latitude, longitude, radius),
    getWaterResources({ latitude, longitude, radius })
  ]);

  // Combine and process water sources
  let allWaterSources = [];

  // Process OSM sources
  if (osmSources && osmSources.length > 0) {
    allWaterSources.push(...osmSources.map(source => ({
      ...source,
      sourceType: 'OSM'
    })));
  }

  // Process database sources
  if (dbSources && dbSources.length > 0) {
    allWaterSources.push(...dbSources.map(source => ({
      wayId: source.id.toString(), // Convert database ID to string to match OSM format
      nodeId: source.id.toString(),
      longitude: source.longitude,
      latitude: source.latitude,
      distance: getDistanceFromLatLonInKm(latitude, longitude, source.latitude, source.longitude) * 1000,
      sourceType: 'DATABASE',
      name: source.name 
    })));
  }

  // Sort all water sources by distance
  allWaterSources.sort((a, b) => a.distance - b.distance);

  // Get unique sources (prefer closer ones)
  const uniqueSources = allWaterSources.filter((item, index, self) =>
    index === self.findIndex((t) => 
      (t.wayId === item.wayId && t.sourceType === item.sourceType)
    )
  );

  // Get up to 5 nearest nodes
  let nearestNodes = uniqueSources.slice(0, 5);

  // If no water sources found, return message
  if (nearestNodes.length === 0) {
    return "Tidak berhasil menemukan sumber air dalam radius " + radius/1000 + "km";
  }

  // Get addresses for all nearest nodes
  try {
    const nodesWithAddresses = await Promise.all(
      nearestNodes.map(async (node) => {
        let address, roadInfo;
        
        if (node.sourceType === 'OSM') {
          address = await getAddressFromOsmIds(node.wayId, node.nodeId);
          roadInfo = await getNearestRoadNode(node.longitude, node.latitude);
        } else {
          // For database sources, use the name from the database
          address = node.name || 'Unnamed Water Source';
          roadInfo = await getNearestRoadNode(node.longitude, node.latitude);
        }
        
        return {
          wayId: node.wayId,
          sourceType: node.sourceType,
          node: {
            id: node.nodeId,
            latitude: Number(node.latitude),
            longitude: Number(node.longitude),
            distanceFromFirePoint: node.distance,
            address: address
          },
          road: roadInfo
        };
      })
    );

    return nodesWithAddresses;
  } catch (error) {
    throw new Error("Failed to fetch data: " + error.message);
  }
};

// Helper function to fetch OSM sources
async function fetchOSMSources(latitude, longitude, radius) {
  try {
    const query = queryGetNearestWaterSourcesOnRadius(latitude, longitude, radius);
    const waterSourceAroundRadius = await fetchOSMNearestWaterSource(query);
    
    let nodeWithDistance = [];
    for (let i = 0; i < waterSourceAroundRadius.length; i++) {
      for (let j = 0; j < waterSourceAroundRadius[i].nodes.length; j++) {
        const node = waterSourceAroundRadius[i].nodes[j];
        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          node.latitude,
          node.longitude
        );

        nodeWithDistance.push({
          wayId: waterSourceAroundRadius[i].wayId,
          nodeId: node.nodeId,
          longitude: node.longitude,
          latitude: node.latitude,
          distance: distance * 1000,
        });
      }
    }
    return nodeWithDistance;
  } catch (error) {
    console.error("Error fetching OSM sources:", error);
    return [];
  }
}
