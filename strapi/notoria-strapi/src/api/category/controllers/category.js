'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({ strapi }) => ({
  async find(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized();

    // merge any incoming filters with ownership filter
    const incoming = ctx.query?.filters || {};
    const filters = {
      ...incoming,
      users_permissions_user: {
        ...(incoming.users_permissions_user || {}),
        id: { $eq: userId },
      },
    };

    const data = await strapi.entityService.findMany('api::category.category', {
      ...ctx.query,
      filters,
    });
    return this.transformResponse(data);
  },

  async findOne(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized();

    const { id } = ctx.params;

    const rows = await strapi.entityService.findMany('api::category.category', {
      filters: {
        id: { $eq: id },
        users_permissions_user: { id: { $eq: userId } },
      },
      limit: 1,
      ...(ctx.query?.populate ? { populate: ctx.query.populate } : {}),
    });

    if (!rows || rows.length === 0) return ctx.notFound();
    return this.transformResponse(rows[0]);
  },
}));