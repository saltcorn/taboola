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
  getAllowedAccount,
  getCampaignsForAccount,
  getCampaignItems,
  getCampaignContentReport,
  getCurrentAccount,
  getAPI,
  getCampaignItem,
  createCampaignItem,
  updateCampaignItem,
} = require("./api");

const get_taboola_token = async (client_id, client_secret) => {
  const encodedParams = new URLSearchParams();
  encodedParams.set("client_id", client_id);
  encodedParams.set("client_secret", client_secret);
  encodedParams.set("grant_type", "client_credentials");

  const url = "https://backstage.taboola.com/backstage/oauth/token";
  const options = {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: encodedParams,
  };

  const res = await fetch(url, options);
  if (res.status === 200) {
    return await res.json();
  } else throw new Error("unable to authorize: " + (await res.text()));
};

const configuration_workflow = () =>
  new Workflow({
    onDone: async (ctx) => {
      console.log("taboola done cfg", ctx);
      const jres = await get_taboola_token(ctx.client_id, ctx.client_secret);
      return { ...ctx, ...jres };
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
    taboola_auth_fetch: {
      async run(url, cfgOverRide) {
        return await getAPI(url, { ...cfg, ...cfgOverRide });
      },
      isAsync: true,
      description: "taboola authenticated fetch",
      arguments: [],
    },
    get_taboola_current_account: {
      async run(cfgOverRide) {
        return await getCurrentAccount({ ...cfg, ...cfgOverRide });
      },
      isAsync: true,
      description: "Get taboola current account",
      arguments: [],
    },
    get_taboola_allowed_accounts: {
      async run(cfgOverRide) {
        return await getAllowedAccount({ ...cfg, ...cfgOverRide });
      },
      isAsync: true,
      description: "Get taboola allowed accounts",
      arguments: [],
    },
    get_taboola_account_campaigns: {
      async run(accountId, query, cfgOverRide) {
        return await getCampaignsForAccount(accountId, query, {
          ...cfg,
          ...cfgOverRide,
        });
      },
      isAsync: true,
      description: "Get taboola campaigns for account",
      arguments: [{ name: "accountId", type: "String" }],
    },
    get_taboola_campaign_items: {
      async run(accountId, campaignId, query, cfgOverRide) {
        return await getCampaignItems(accountId, campaignId, query, {
          ...cfg,
          ...cfgOverRide,
        });
      },
      isAsync: true,
      description: "Get taboola ad items for campaign",
      arguments: [
        { name: "accountId", type: "String" },
        { name: "campaignId", type: "String" },
      ],
    },
    get_taboola_campaign_item: {
      async run(accountId, campaignId, itemId, cfgOverRide) {
        return await getCampaignItem(accountId, campaignId, itemId, {
          ...cfg,
          ...cfgOverRide,
        });
      },
      isAsync: true,
      description: "Get taboola ad items",
      arguments: [
        { name: "accountId", type: "String" },
        { name: "campaignId", type: "String" },
        { name: "itemId", type: "String" },
      ],
    },
    get_taboola_campaign_content_report: {
      async run(accountId, campaignId, query, cfgOverRide) {
        return await getCampaignContentReport(accountId, campaignId, query, {
          ...cfg,
          ...cfgOverRide,
        });
      },
      isAsync: true,
      description: "Get taboola top campaign content report",
      arguments: [
        { name: "accountId", type: "String" },
        { name: "campaignId", type: "String" },
        { name: "query", type: "JSON" },
      ],
    },
    create_taboola_campaign_item: {
      async run(accountId, campaignId, url, cfgOverRide) {
        return await createCampaignItem(accountId, campaignId, url, {
          ...cfg,
          ...cfgOverRide,
        });
      },
      isAsync: true,
      description: "Create taboola ad item",
      arguments: [
        { name: "accountId", type: "String" },
        { name: "campaignId", type: "String" },
        { name: "url", type: "String" },
      ],
    },
    update_taboola_campaign_item: {
      async run(accountId, campaignId, itemId, body, cfgOverRide) {
        return await updateCampaignItem(accountId, campaignId, itemId, body, {
          ...cfg,
          ...cfgOverRide,
        });
      },
      isAsync: true,
      description: "Update taboola ad item",
      arguments: [
        { name: "accountId", type: "String" },
        { name: "campaignId", type: "String" },
        { name: "itemId", type: "String" },
        { name: "body", type: "JSON" },
      ],
    },
    get_taboola_token: {
      async run(client_id, client_secret) {
        return await get_taboola_token(client_id, client_secret);
      },
      isAsync: true,
      description: "Get taboola token",
      arguments: [
        { name: "clientId", type: "String" },
        { name: "clientSecret", type: "String" },
      ],
    },
  }),
  actions: (cfg) => ({
    //taboola_sync: require("./sync-action")(cfg),
    //caldav_edit: require("./add-action")(cfg),
  }),
};
