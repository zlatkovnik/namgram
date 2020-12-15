const _ = require('lodash');

const User = module.exports = function (_node) {
    _.extend(this, {
        "id":  _node.properties['id'],
        "username": _node.properties['username'],
        "email": _node.properties['email'],
        "birthday": _node.properties['birthday'],
        "name": _node.properties['name'],
        "lastname": _node.properties['lastname'],
        "password": _node.properties['password'],
    })
  
};
 