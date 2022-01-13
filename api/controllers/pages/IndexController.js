/**
 * IndexController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  index: async function(req, res) {
    console.log(await Incident.find());

    return res.view('pages/index');
  },
};
