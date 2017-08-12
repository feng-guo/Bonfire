var app = new Vue({
  el: '#app',
  data: {
    proposals: null
  },
  created() {
    axios.get('https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/Planning_Land_Use_Development/FeatureServer/2/query', {
      params: {
        outFields: 'DATE_RECEI,DESCRIPTIO,PROPOSAL_D',
        where: "STATUS IN ('In progress', 'Draft Approved', 'Public meeting', 'Received')",
        orderByFields: 'DATE_RECEI DESC',
        f: 'json',
        returnGeometry: false
      }
    })
    .then(res => {
      console.log(res.data);
      this.proposals = res.data
    })
  }
})
