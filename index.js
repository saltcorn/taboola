const db = require("@saltcorn/data/db");
const Form = require("@saltcorn/data/models/form");
const Field = require("@saltcorn/data/models/field");
const Table = require("@saltcorn/data/models/table");
const FieldRepeat = require("@saltcorn/data/models/fieldrepeat");
const Workflow = require("@saltcorn/data/models/workflow");
const { eval_expression } = require("@saltcorn/data/models/expression");
const {
  text,
  div,
  h5,
  style,
  a,
  script,
  pre,
  domReady,
  i,
  text_attr,
} = require("@saltcorn/markup/tags");
const { mkTable } = require("@saltcorn/markup");
const { readState } = require("@saltcorn/data/plugin-helper");
const {
  getMarketers,
  getCampaignsForMarketer,
  getPromotedLinksForCampaign,
  getPromotedContentReport,
} = require("./api");
const configuration_workflow = () =>
  new Workflow({
    onDone: async (ctx) => {
      console.log("taboola done cfg", ctx);
      const encodedParams = new URLSearchParams();
      encodedParams.set("client_id", ctx.client_id);
      encodedParams.set("client_secret", ctx.client_secret);
      encodedParams.set("grant_type", "client_credentials");

      const url = "https://backstage.taboola.com/backstage/oauth/token";
      const options = {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: encodedParams,
      };

      const res = await fetch(url, options);
      if (res.status === 200) {
        const jres = await res.json();
        console.log(jres);

        return { ...ctx, ...jres };
      } else throw new Error("unable to authorize: " + (await res.text()));
    },
    steps: [
      {
        name: "views",

        form: async (context) => {
          return new Form({
            fields: [
              {
                name: "client_id",
                label: "Client ID",
                type: "String",
                required: true,
              },
              {
                name: "client_secret",
                label: "Client secret",
                type: "String",
                required: true,
              },
            ],
          });
        },
      },
    ],
  });

module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: "taboola",
  configuration_workflow,
  //table_providers: require("./table-provider.js"),
  functions: (cfg) => ({
    get_taboola_marketer_campaigns: {
      async run(marketerId, query) {
        return await getCampaignsForMarketer(marketerId, query, cfg);
      },
      isAsync: true,
      description: "Get taboola campaigns for marketer",
      arguments: [{ name: "marketerId", type: "String" }],
    },
    get_taboola_campaign_promoted_links: {
      async run(campaignId, query) {
        return await getPromotedLinksForCampaign(campaignId, query, cfg);
      },
      isAsync: true,
      description: "Get taboola promoted links for campaign",
      arguments: [{ name: "campaignId", type: "String" }],
    },
    get_taboola_promoted_content_report: {
      async run(marketerId, query) {
        /* Query example: 
        {
          from: "2015-12-22",
          to: "2016-01-20",
          limit: 10,
          offset: 3,
          sort: "-ctr",
          filter: "clicks+gt+99",
          includeArchivedCampaigns: true,
          budgetId: "adc4fc128ab0419ababf4b02153ee75f3c",
          campaignId:
            "e75f3cadc4fc128ab0419ababf4b02153e, 0069fc0fe9598f99b4c528f0881cd74b4b",
          promotedLinkId: "19ababf4b02153ee75f3cadc4fc128ab04",
          includeConversionDetails: false,
          conversionsByClickDate: true,
        };
        */
        return await getPromotedContentReport(marketerId, query, cfg);
      },
      isAsync: true,
      description: "Get taboola promoted links for campaign",
      arguments: [
        { name: "marketerId", type: "String" },
        { name: "query", type: "JSON" },
      ],
    },
  }),
  actions: (cfg) => ({
    //taboola_sync: require("./sync-action")(cfg),
    //caldav_edit: require("./add-action")(cfg),
  }),
};
