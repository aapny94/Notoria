'use strict';

/**
 * sum router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::sum.sum');
