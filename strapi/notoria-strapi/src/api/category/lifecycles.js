'use strict';

module.exports = {
  async beforeCreate(event) {
    const userId = event.state?.user?.id;
    if (userId) {
      event.params.data.users_permissions_user = userId;
    }
  },
  async beforeUpdate(event) {
    const userId = event.state?.user?.id;
    if (userId) {
      // prevent changing owner to someone else
      event.params.data.users_permissions_user = userId;
    }
  },
};