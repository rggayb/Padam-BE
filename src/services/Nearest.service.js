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

  // get the nearest node from the fire point
  let nearestNode = nodeWithDistance[0];

  // Get the address of the nearest water source
  try {
    nearestNode.address = await getAddressFromOsmIds(
      nearestNode.wayId,
      nearestNode.nodeId
    );
  } catch (error) {
    throw new Error("Failed to fetch data from OSM: " + error.message);
  }

  // Get the nearest road node from the water source
  let responseSuccess = {
    wayId: nearestNode.wayId,
    node: {
      id: nearestNode.nodeId,
      latitude: Number(nearestNode.latitude),
      longitude: Number(nearestNode.longitude),
      distanceFromFirePoint: nearestNode.distance,
      address: nearestNode.address,
    },
    road: {},
  };

  try {
    responseSuccess.road = await getNearestRoadNode(
      nearestNode.longitude,
      nearestNode.latitude
    );
  } catch (error) {
    throw new Error("Failed to fetch data from OSM: " + error.message);
  }

  return responseSuccess;
};
