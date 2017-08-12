var app = new Vue({
  el: '#content',
  data: {
    proposals: null,
    hasGeolocation: false
  },
  created() {
    this.hasGeolocation = "geolocation" in navigator
    axios.get('https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/Planning_Land_Use_Development/FeatureServer/2/query', {
      params: {
        outFields: 'DATE_RECEI,DESCRIPTIO,PROPOSAL_D',
        where: "STATUS = 'In progress'",
        orderByFields: 'DATE_RECEI DESC',
        f: 'json',
        returnGeometry: false
      }
    })
    .then(res => this.proposals = res.data)
    .then(() => this.proposals.features = this.proposals.features.map(feature => {
      feature.attributes.DATE_RECEI = new Date(feature.attributes.DATE_RECEI).toISOString()
      return feature
    }))
  },
  methods: {
    getLocation() {
      navigator.geolocation.getCurrentPosition(position => {
        axios.get('https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/Planning_Land_Use_Development/FeatureServer/2/query', {
          params: {
            outFields: 'DATE_RECEI,DESCRIPTIO,PROPOSAL_D',
            where: `STATUS = 'In progress'`,
            geometryType: 'esriGeometryEnvelope',
            geometry: `${position.coords.longitude-0.02},${position.coords.latitude-0.02},${position.coords.longitude+0.02},${position.coords.latitude+0.02}`,
            returnGeometry: false,
            inSR: 4326,
            spatialRel: 'esriSpatialRelIntersects',
            outSR: 4326,
            orderByFields: 'DATE_RECEI DESC',
            f: 'json'
          }
        })
        .then(res => this.proposals = res.data)
        .then(() => this.proposals.features = this.proposals.features.map(feature => {
          feature.attributes.DATE_RECEI = new Date(feature.attributes.DATE_RECEI).toISOString()
          return feature
        }))
      })
    }
  }
})
