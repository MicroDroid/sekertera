const Logger = require('./logger');

const Helpers = {
	isAdmin: id => {
	    try {
	        var admins = JSON.parse(process.env.ADMINS);
	            admins = typeof(admins) === 'string' ? [admins] : admins;
	            
	        return admins.indexOf(id) !== -1;
	    } catch (e) {
	        Logger.warn('Failed to parse admins list');
	        return false;
	    }
	}
}

module.exports = Helpers;