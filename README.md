# gatsby-transformer-opencage-geocoder

Uses the [OpenCage Geocoder](https://www.opencagedata.com) to do the following:

1. Adds geospatial coordinates to nodes that just contain address information, so you can eg display them on a map. (aka Forward Geocoding)
2. Adds address information to nodes that contain just coordinates (ie lat/lon). (aka Reverse Geocoding)

So, this means, for example, that if you have a bunch of nodes in a CSV file that contain address information, but you want to display them on a map, you can add the lat-long coordinates to each node using this transformer plugin.

Or, if you've got some nodes in an Excel file that just contain lat-long coordinates, but you want to display address information alongside them, this transformer plugin can do that as well.

Development of this transformer plugin has been kindly sponsored by OpenCage Data - you can read more about their geocoding service at https://opencagedata.com - including details of their [generous free tier,](https://opencagedata.com/pricing) no credit card required. The free trial allows 2,500 requests per day.

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

addressFields: an array of fields that contain the node's address. The address to be geocoded will be determined by concatenating all the fields in this array, in order. Some tips on how to format addresses can be found at https://github.com/OpenCageData/opencagedata-misc-docs/blob/master/query-formatting.md

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

Reverse geocoding will add a two new fields:
'geocoderAddress' - a string containing the formatted address of the location specified by the lat-lon pair, and
'geocoderAddressFields' - which contains an object containing the components of the address of the location specified by the lat-lon pair (NB please dont rely on any specific field being in the components that are returned, as they may not be. The world is a big place, and very diverse), eg

```
"node": {
            "id": "65879725-c151-5abf-8524-0dcdad0bb614",
            "fields": {
              "geocoderAddress": "163 Rue Jeanne d'Arc, 54000 Nancy, France",
              "geocoderAddressFields": {
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

However, please dont rely on any specific field being in the components that are returned, as they may not be. The world is a big place, and very diverse.

### API Limits

The OpenCage Geocoder uses a rate limiting mechanism to ensure that the service stays available to all users. Free usage is limited to 2,500 requests per day. If you reach that limit the API returns a 402, and this plugin will terminate the gatsby process. This is to prevent you from hammering the API whilst over your limit which might result in you being blocked.

If however you are a paying customer, when you reach your everything keeps working, there is no additional surge or usage based pricing. The OpenCage Geocoder limits are "soft". If you need more requests on a given day, that is fine, you can keep geocoding. If you cross the limit repeatedly then the following month you will be asked to move to a higher tier.

More details can be found at https://opencagedata.com/pricing
