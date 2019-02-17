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

  console.log(pluginOptions);

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

  opencage.geocode({key: pluginOptions.api_key, q: query}).then(data => {
    if (data.status.code == 200) {
      if (data.results.length > 0) {
        var place = data.results[0];

        if (geocodeType == forward) {
          console.log("Creating forward node");
          console.log(place.geometry);
          createNodeField({
            node,
            name: `geocoderGeometry`,
            value: place.geometry
          });
        }
        else if (geocodeType == reverse) {
          console.log("Creating reverse node");
          console.log(place.geometry);
          createNodeField({
            node,
            name: `geocoderAddress`,
            value: place.components
          });
        }

        if (nodeGeocodeConfig.addFullResult) {
          console.log("Creating full node");
          console.log(place.geometry);
          createNodeField({
            node,
            name: `geocodedFullResult`,
            value: place
          });
        }

        console.log(node);
      }
    }
    else if (data.status.code == 402) {
      console.log('hit free-trial daily limit');
      console.log('become a customer: https://opencagedata.com/pricing'); 
    }
    else {
      // other possible response codes:
      //     // https://opencagedata.com/api#codes
      console.log('error', data.status.message);
    }
  }).catch(error => {
    console.log('error', error.message);
  });

}

exports.onCreateNode = onCreateNode
