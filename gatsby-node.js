const opencage = require('opencage-api-client');

const forward = 1;
const reverse = 2;

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
},
  pluginOptions
) {

  let nodeGeocodeConfig = false;
  for (i = 0; i < pluginOptions.nodeTypes.length; i++) {
    if (node.internal.type == pluginOptions.nodeTypes[i].nodeType) {
      nodeGeocodeConfig = pluginOptions.nodeTypes[i];
    }
  }

  if (!nodeGeocodeConfig) {
    return;
  }

  if (!pluginOptions.api_key) {
    console.warn("Geocoding specified for this node type (" + node.internal.type + " but no API key set");
    return;
  }

  let geocodeType = false;
  if (nodeGeocodeConfig.addressFields) {
    geocodeType = forward;
  }
  else if (nodeGeocodeConfig.positionFields) {
    if (nodeGeocodeConfig.positionFields.lat &&
      nodeGeocodeConfig.positionFields.lon) {
    geocodeType = reverse;
    }
    else {
      console.warn("Geocoder options for positionFields (lat, lon) not specified");
    }
  }

  if (!geocodeType) {
    console.warn("Geocoding specified for this node type (" + node.internal.type + " but couldn't determine geocoding type");
    return;
  }

  const { createNode, createNodeField, createParentChildLink } = actions

  let query = false;
  if (geocodeType == forward) {
    let addressElements = [];
    for (let i = 0; i < nodeGeocodeConfig.addressFields.length; i++) {
      if (node[nodeGeocodeConfig.addressFields[i]]) {
        addressElements.push(node[nodeGeocodeConfig.addressFields[i]]);
      }
    }
    query = addressElements.join(",");
    console.log("Geocoding: " + query);
  }
  else if (geocodeType == reverse) {
    query = node[nodeGeocodeConfig.positionFields.lat] + "," + node[nodeGeocodeConfig.positionFields.lon]
    console.log("Reverse Geocoding: " + query);
  }
  try {

    let apiRequestOptions = {key: pluginOptions.api_key, q: query};

    if (nodeGeocodeConfig.addFullResult) {
      apiRequestOptions.no_annotations = 1;
    }

    let data = await opencage.geocode(apiRequestOptions);

    if (data.status.code == 200) {
      if (data.results.length > 0) {
        var place = data.results[0];

        if (geocodeType == forward) {
          createNodeField({
            node,
            name: `geocoderGeometry`,
            value: place.geometry
          });
        }
        else if (geocodeType == reverse) {
          createNodeField({
            node,
            name: `geocoderAddress`,
            value: place.components
          });
        }

        if (nodeGeocodeConfig.addFullResult) {
          createNodeField({
            node,
            name: `geocoderFullResult`,
            value: place
          });
        }

      }
    }
      /*
    else if (data.status.code == 402) {
      console.error('You have hit the OpenCage free-trial daily limit');
      console.error('become a customer: https://opencagedata.com/pricing'); 
      process.exit(1);
    }
    else if (data.status.code == 403) {
      console.error('You have reached your quota limit');
      console.error('More info: https://opencagedata.com'); 
      process.exit(1);
    }
    */
    else {
      console.error('error', data.status.message);
    }
  } 
  catch(error) {
    if (error.response.status == 402) {
      console.error('You have hit the OpenCage free-trial daily limit');
      console.error('become a customer: https://opencagedata.com/pricing'); 
      process.exit(1);
    }
    else if (error.response.status == 403) {
      console.error('You have reached your quota limit');
      console.error('More info: https://opencagedata.com'); 
      process.exit(1);
    }
    else {
      console.error('error', error.message);
    }
  }
}

exports.onCreateNode = onCreateNode
