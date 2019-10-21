var app = angular.module('app', ['ngRoute', 'ngCookies', 'ngWebSocket', 'ngAnimate', 'ui.bootstrap']);

app.value('globals', { session: { id: '', user: '' }, lastMessage: { from: '', message: '' } });

app.service('common', ['$http', 'globals', function($http, globals) {

	this.getSession = function(callback) {
		$http.get('/auth').then(
			function(response) {
				if(!globals.session.id) {
					globals.session = response.data;
				}
				callback(response.data);
			},
			function(err) {
				callback({});
			}
		);
	}
	
	this.statusName = function(status) {
		const statusNames = [ 'not-started', 'started', 'in-tests', 'completed', 'cancelled'];
		return status >= 0 && status < statusNames.length ? statusNames[status] : 'unknown';
	}
	
	this.confirm = { text: '?', action: function() {
		$("#confirmDialog1").modal('hide');
	}};
	
}]);

app.factory('ws', [ 'globals', function( globals) {
    
	return {
		
		init: function(sessId) {
				console.log('Sending initialization message by ws with session ' + sessId);
				//dataStream.send(JSON.stringify({ session: sessId }));			
		}
	}

}
]);