const { getDistanceFromLatLonInKm } = require("../utils/GetDistance.utils");
const {
  queryGetNearestWaterSourcesOnRadius,
} = require("../utils/QueryOSM.utils");
const {
  getNearestRoadNode,
  getAddressFromOsmIds,
  fetchOSMNearestWaterSource,
} = require("../utils/FetchOSMAPIs.utils");

exports.getWaterSources = async function (body) {
  const { longitude, latitude, radius } = body;
  if (!longitude || !latitude) {
    throw new Error("Please provide all the required fields");
  }
  if (!radius) {
    throw new Error("Please provide the radius");
  }

  // Fetch nearest water sources from OSM
  const query = queryGetNearestWaterSourcesOnRadius(
    latitude,
    longitude,
    radius
  );

  // Call API to get nearest water sources inside the radius from coordinate fire point
  let waterSourceAroundRadius;
  try {
    waterSourceAroundRadius = await fetchOSMNearestWaterSource(query);
  } catch (error) {
    throw new Error("Failed to fetch data from OSM: " + error.message);
  }

  // Calculate distance of each nodes water source from the fire point
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

  // sorting the node with distance from the fire point in ascending order
  nodeWithDistance.sort((a, b) => a.distance - b.distance);

  const uniqueByWayId = nodeWithDistance.filter((item, index, self) =>
    index === self.findIndex((t) => t.wayId === item.wayId)
  );

  // Get up to 5 nearest nodes (or fewer if not enough data available)
  let nearestNodes = uniqueByWayId.slice(0, 5);

  // If no water sources found, return empty array
  if (nearestNodes.length === 0) {
    return "Tidak berhasil menemukan sumber air dalam radius " + radius/1000 + "km";
  }

  // Get addresses for all nearest nodes
  try {
    const nodesWithAddresses = await Promise.all(
      nearestNodes.map(async (node) => {
        const address = await getAddressFromOsmIds(node.wayId, node.nodeId);
        const roadInfo = await getNearestRoadNode(node.longitude, node.latitude);
        
        return {
          wayId: node.wayId,
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
    throw new Error("Failed to fetch data from OSM: " + error.message);
  }
};
