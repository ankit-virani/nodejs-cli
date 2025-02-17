const db = require('mongoose');
const UserRole = require('../model/userRole')(db);
const RouteRole = require('../model/routeRole')(db);
const ProjectRoute = require('../model/projectRoute')(db);
const { replaceAll } = require('../utils/common');
const sendResponse = require('../helpers/sendResponse');
const message = require('../utils/messages');

const checkRolePermission = async (req, res, next) => {
  if (req.user) {
    const loggedInUserId = req.user.id;
    let rolesOfUser = await UserRole.find({
      userId: loggedInUserId,
      isActive: true,
      isDeleted: false,
    }, {
      roleId: 1,
      _id: 0,
    });
    if (rolesOfUser && rolesOfUser.length) {
      rolesOfUser = rolesOfUser.map((role) => db.Types.ObjectId(role.roleId));
      const route = await ProjectRoute.findOne({
        route_name: replaceAll((req.route.path.toLowerCase()).substring(1), '/', '_'),
        uri: req.route.path.toLowerCase(),
      });
      if (route) {
        const allowedRoute = await RouteRole.find({
          routeId: route._id,
          roleId: { $in: rolesOfUser },
          isActive: true,
          isDeleted: false,
        });
        if (allowedRoute && allowedRoute.length) {
          next();
        } else {
          sendResponse(res, message.unAuthorizedRequest());
        }
      } else {
        next();
      }
    } else {
      /*
       * sendResponse(res, message.unAuthorizedRequest());
       */
      next();
    }
  } else {
    sendResponse(res, message.unAuthorizedRequest());
  }
  return undefined;
};

module.exports = checkRolePermission;
