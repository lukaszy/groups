app.constant('routes', [
			{ route: '/', templateUrl: '/html/default.html', controller: 'Default', controllerAs: 'ctrl', menu: '' },
			{ route: '/1', templateUrl: '/html/groups.html', controller: 'Groups', controllerAs: 'ctrl', menu: 'Grupy', onlyLoggedIn: true, showFor: 'AU' },
			{ route: '/2', templateUrl: '/html/myGroups.html', controller: 'MyGroups', controllerAs: 'ctrl', menu: 'Moje grupy' , onlyLoggedIn: true, showFor: 'AU'},
			{ route: '/3', templateUrl: 'html/persons.html', controller: 'Persons', controllerAs: 'ctrl', menu: 'Osoby', onlyLoggedIn: true, showFor: 'A' }
			
]);

app.config(['$routeProvider', 'routes', function($routeProvider, routes) {
	for(var i in routes) {
		$routeProvider.when(routes[i].route, routes[i]);
	}
	$routeProvider.otherwise({ redirectTo: '/' });
}]);

app.controller('Menu',['$http','$scope', '$location', 'common', 'globals', 'routes', 'ws',
	function($http,$scope, $location, common, globals, routes, ws) {
		var ctrl = this;
		ctrl.alert = { text: "" };

		//ctrl.menu = [];
		ctrl.confirm = common.confirm;
		ctrl.lastMessage = globals.lastMessage;
		
		ctrl.zmiana = function() {
			console.log(ctrl.loggedUser);
		};
		
		ctrl.person = {};
		ctrl.isCollapsed = true;
		$scope.ctrl.loggedUser;
		$scope.menuPos;
		$scope.alert;
		 
        $scope.$on('$routeChangeSuccess', function () {
            ctrl.isCollapsed = true;
		});

		ctrl.registrationSubmit = function() {
			
				ctrl.person.roles = 'U';
				$http.post("/addPerson", ctrl.person).then(
					function (rep) {
						
						console.log(rep.data);
						
						ctrl.alert = { type: "info", text: "Rejestracja przebiegła pomyślnie" };
						
						
						ctrl.refreshMenu();
					},
					function (err) {
						ctrl.alert = { type: "danger", text: "Wystąpił błąd podczas rejestracji." };
					}
				);
			
			$("#registrationDialog").modal("hide");
		};

		ctrl.hasRights = function(rights) {
			
			if(rights && ctrl.loggedUser) {
				var arr1 = ctrl.loggedUser.roles.split('');
				var arr2 = rights.split('');
				for(var i in arr1) {
					for(var j in arr2) {
						if(arr1[i] == arr2[j]) {
							return true;
						}
					}
				}
			}
			return false;
		}
		ctrl.refreshMenu = function() {
			ctrl.menu = [];
		
			for(var i in routes) {
				if(routes[i].menu && (!routes[i].onlyLoggedIn || ctrl.hasRights(routes[i].showFor))) {
					if(routes[i].menu) {
					ctrl.menu.push({ route: routes[i].route, title: routes[i].menu });
					}
				}
			}
			//ctrl.loggedUser = globals.session.user;
		}

		if(!globals.session.id) {
			common.getSession(function(sess) {
				ctrl.loggedUser = globals.session.user;
				ws.init(globals.session.id);
				ctrl.refreshMenu();
			});
		} else {
			ctrl.loggedUser = globals.session.user; 
		}
		if(ctrl.loggedUser)
		{
			console.log('ZALOGOWANY');
		}
		

		ctrl.logIn = function() {
			ctrl.loginMsg = '';
			ctrl.login = '';
			ctrl.password = '';
			
			ctrl.refreshMenu();
			
			$("#loginDialog").modal();
		};
		ctrl.registration = function() {
			ctrl.person.registrationMsg = '';
			ctrl.person.firstName = '';
			ctrl.person.lastName = '';
			ctrl.person.login = '';
			ctrl.person.password = '';
			ctrl.person.roles = 'U';
			$("#registrationDialog").modal();
		};

		ctrl.logOut = function() {
			$http.delete('/auth').then(
				function (rep) {
					ctrl.loggedUser = null;
					ctrl.alert = { type: "success", text: "Wylogowano" };
					
					ctrl.refreshMenu();
				},
				function (err) {
					ctrl.refreshMenu();					
				}
			);
			$("#confirmDialog1").modal('hide');
		}
		ctrl.confirmLogOut = function() {
			common.confirm.text = ctrl.loggedUser.firstName + ', czy chcesz się wylogować?';
			common.confirm.action = ctrl.logOut;
			$("#confirmDialog1").modal();			
		}

		ctrl.validateCredentials = function() {
			$http.post('/auth', { login: ctrl.login, password: ctrl.password }).then(
				function (rep) {
					try {
						ctrl.loggedUser = rep.data;
						$("#loginDialog").modal('hide');
						ctrl.alert = { type: "success", text: "Zalogowano" };
						ctrl.refreshMenu();
					} catch(err) {
						ctrl.loginMsg = 'Blad logowania';
						ctrl.loggedUser = null;
						ctrl.refreshMenu();
					}
				},
				function (err) {
					ctrl.loginMsg = 'Blad logowania';
					ctrl.loggedUser = null;
					ctrl.refreshMenu();
				}
			);
		}

		ctrl.navClass = function(page) {
			return page === $location.path() ? 'active' : '';
		}
		

		ctrl.closeAlert = function() {
			ctrl.alert = { text: "" };
		};

		ctrl.refreshMenu();
	}
]);