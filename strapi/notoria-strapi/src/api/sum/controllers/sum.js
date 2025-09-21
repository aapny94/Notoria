'use strict';

/**
 * sum controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::sum.sum');
