const { objectToQueryString } = require("@saltcorn/data/utils");
const fetch = require("node-fetch");

const base = "https://backstage.taboola.com/backstage/api/1.0";

const getAPI = async (urlPath, { access_token }) => {
  console.log({ urlPath, access_token });

  const response = await fetch(`${base}${urlPath}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return await response.json();
};

const getCurrentAccount = async (cfg) => {
  const url = `/users/current/account`;
  return await getAPI(url, cfg);
};

const getAllowedAccount = async (cfg) => {
  const url = `/users/current/allowed-accounts`;
  return await getAPI(url, cfg);
};

const getCampaignsForAccount = async (accountId, q, cfg) => {
  const qs = objectToQueryString(q || {}) || "";
  return await getAPI(`/${accountId}/campaigns?${qs}`, cfg);
};

const getCampaignItems = async (accountId, campaignId, q, cfg) => {
  const qs = objectToQueryString(q || {}) || "";

  // /campaigns/abf4b02153ee75f3cadc4fc128ab0419ab/promotedLinks?enabled=true&statuses=APPROVED,PENDING,REJECTED&limit=200&offset=3&sort=-creationTime&promotedLinkImageWidth=100&promotedLinkImageHeight=100
  return await getAPI(`/${accountId}/campaigns/${campaignId}/items?${qs}`, cfg);
};

const getCampaignContentReport = async (accountId, campaignId, q, cfg) => {
  if (!q) q = {};
  q.campaign = campaignId;
  const qs = objectToQueryString(q) || "";
  return await getAPI(
    `/${accountId}/reports/top-campaign-content/dimensions/item_breakdown?${qs}`,
    cfg
  );
};

module.exports = {
  getCurrentAccount,
  getAllowedAccount,
  getCampaignsForAccount,
  getCampaignItems,
  getCampaignContentReport,
  getAPI
};
