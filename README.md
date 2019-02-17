# gatsby-transformer-opencage-geocoder

Uses the [OpenCage Geocoder](https://www.opencagedata.com) to do the following:

1. Adds geospatial coordinates to nodes that just contain address information, so you can eg display them on a map. (aka Forward Geocoding)
2. Adds address information to nodes that contain just coordinates (ie lat/lon). (aka Reverse Geocoding)

So, this means, for example, that if you have a bunch of nodes in a CSV file that contain address information, but you want to display them on a map, you can add the lat-long coordinates to each node using this transformer plugin.

Or, if you've got some nodes in an Excel file that just contain lat-long coordinates, but you want to display address information alongside them, this transformer plugin can do that as well.

Development of this transformer plugin has been kindly sponsored by OpenCage Data - you can read more about their geocoding service at https://opencagedata.com - including details of their [generous free tier,](https://opencagedata.com/pricing) no credit card required.

## Install

You'll need to install both this module and the opencage-api-client module.

`npm i gatsby-transformer-opencage-geocoder opencage-api-client`

## How to use

In your gatsby-config.js add:

```javascript
    {
      resolve: `gatsby-transformer-opencage-geocoder`,
      options: {
// Your OpenCage API key      
        api_key: `<YOUR OPENCAGE API KEY>`,
        
// An array of configurations per node type to geocode        
        nodeTypes: [
// Forward Geocoding
          { nodeType: `NodeTypeToBeGeocoded`,
            addressFields: [
              'Address1', 'Address2', 'Address3', 'Town', 'Country', 'Postcode'],
            addFullResult: false,
          },
          
// Reverse Geocoding
          { nodeType: `NodeTypeToBeReverseGeocoded`,
            positionFields: {
              lat: `lat`,
              lon: `lon`
            },
            addFullResult: true,
          }
          
        ]
      }
    }
```

## Options

api_key: Your OpenCage API Key. Get one over at https://opencagedata.com/api

nodeTypes: An array of geocoding configurations, one for each node type that you want to geocode (or reverse geocode). Each element in the array is an object which needs to contain the following elements, depending on whether you want to forward- or reverse-geocode.

### Forward geocoding an node type 

nodeType: the name of the node type to forward geocode

addressFields: an array of fields that contain the node's address. The address to be geocoded will be determined by concatenating all the fields in this array, in order.

addFullResult: if set to true, this will request and add the 'annotations' section of the geocoder result, as a field 'geocoderFullResult' which contains extended information (see https://opencagedata.com/api#response)

Forward geocoding will add a new field 'geocoderGeometry' which contains a lat and lon pair. eg

```
"node": {
  "id": "8351ce9c-d0b5-5393-9ac6-aaa049a1d2c7",
  "AppNo": "AR 003",
  "fields": {
    "geocoderGeometry": {
      "lat": 50.831528,
      "lng": -0.240344
    }
  }
}
```

### Reverse geocoding an node type 

nodeType: the name of the node type to forward geocode

locationFields: an object containing two elements - 'lat' - the name of the field containing the latitude of the node, and 'lon' - the name of the field containing the longitude of the node

addFullResult: if set to true, this will request and add the 'annotations' section of the geocoder result, as a field 'geocoderFullResult' which contains extended information (see https://opencagedata.com/api#response)

Reverse geocoding will add a new field 'geocoderAddress' which contains the address details of the location specified by the lat-lon pair, eg

```
"node": {
            "id": "65879725-c151-5abf-8524-0dcdad0bb614",
            "fields": {
              "geocoderAddress": {
                "ISO_3166_1_alpha_2": "FR",
                "ISO_3166_1_alpha_3": "FRA",
                "_type": "building",
                "city": "Nancy",
                "country": "France",
                "country_code": "fr",
                "county": "Nancy",
                "house_number": "163",
                "political_union": "European Union",
                "postcode": "54000",
                "road": "Rue Jeanne d'Arc",
                "state": "Grand Est",
                "suburb": "Poincaré - Foch - Anatole France - Croix de Bourgogne",
                "road_type": null,
                "state_district": null
              }
            }
```          
