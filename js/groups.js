app.controller('Groups', ['$http', 'common',
	function ($http, common) {

		console.log("Groups controller starting");


		var ctrl = this;
		ctrl.confirm = common.confirm;
		ctrl.alert = { text: "" };
		//ctrl.workersIds1 = {};
		ctrl.project = {};
		ctrl.groups = {};
		ctrl.currentUser = null;
		ctrl.persons = {};


		// =================================



		ctrl.userGroup = function () {
			$http.get('/auth').then(
				function (rep) {
					try {
						ctrl.currentUser = rep.data;
						console.log("ZALOGOWANY : " + ctrl.currentUser.user._id);
						$http.get('db/groups/').then(
							function (response) {
								ctrl.groups = response.data;

							},
							function (errResponse) {
								ctrl.groups = [];
							}
						);


					} catch (err) {
						idUsera = 1;
						ctrl.currentUser = null;
					}
				},
				function (err) {
					ctrl.alert = { type: "danger", text: "Login failed" };
					ctrl.currentUser = 1;
				}
			);
		}
		ctrl.userGroup();

		ctrl.login = null;
		ctrl.password = null;
		ctrl.message = null;
		ctrl.sendMessage = function () {
			console.log(ctrl.message);
		};


		ctrl.usuniecie = {};
		ctrl.deleteUserGroup = function (id = '') {
			var deleteUser = ctrl.usuniecie;
			console.log("ADDTOUSER :" + id);
			deleteUser.groupId = id;
			console.log("KLIKNIETY : " + JSON.stringify(id));
			$http.get('/auth').then(
				function (rep) {
					try {
						ctrl.currentUser = rep.data;
						deleteUser.personId = ctrl.currentUser.user._id;
						console.log("USUWANA OSOBA ID: " + deleteUser.personId);
						console.log("JS  :" + JSON.stringify(ctrl.usuniecie));
						$http.delete('/db/personGroups/' + id + '/' + deleteUser.personId).then(
							function (response) {
								ctrl.userGroup();
								$("#confirmAdd").modal('hide');
								ctrl.alert = { type: "success", text: "Usunieto z grupy" };
							},
							function (errResponse) {
								console.log(JSON.stringify(errResponse));
							}
						);
					} catch (err) {
						idUsera = 1;
						ctrl.currentUser = null;     
					}
				}
			);
		}
		
		ctrl.addUserToGroup = function (id = '') {
			
			var addUser = {};
			console.log("ADDTOUSER :" + id);
			addUser.groupId = id;
			console.log("KLIKNIETY : " + JSON.stringify(id));
			$http.get('/auth').then(
				function (rep) {
					try {
						ctrl.currentUser = rep.data;

						addUser.personId = ctrl.currentUser.user._id;

						$http.post('/db/personGroups/json', addUser).then(
							function (response) {
								ctrl.userGroup();
								$("#confirmAdd").modal('hide');
								ctrl.alert = { type: "success", text: "Dodano do grupy" };
							},
							function (errResponse) {
								console.log(JSON.stringify(errResponse));
							}
						);
					} catch (err) {
						idUsera = 1;
						//ctrl.currentUser = null;     
					}
				}
			);
		}

		ctrl.groupTemp1 = {};
		ctrl.getIdGruop = {};
		ctrl.edit = function (id = '') {
			ctrl.groupTemp = {};
			console.log("POBRANE ID GRUPY1 : " + JSON.stringify(id));
			ctrl.getIdGruop._id = id;
			console.log("getIdGruop " + ctrl.getIdGruop._id);
			$http.get('/auth').then(
				function (rep) {
					try {
						ctrl.currentUser = rep.data;
						console.log("ID : " + id);
						if (id) {
							$http.get('/db/personGroups/groupId=' + id).then(
								function (response) {
									ctrl.groupTemp1 = response.data;
									console.log("ctrl.groupTemp1: " + ctrl.groupTemp1);
									
									$http.get('/db/personGroups/personId=' + ctrl.currentUser.user._id).then(
										function (response) {
											// console.log("TEMP1 groupTemp1[0]: "+ctrl.groupTemp1[0].personId);
											console.log("TEMP1 currentUser: " + ctrl.currentUser.user._id);
											for (var k of ctrl.groupTemp1) {
												if (k.personId == ctrl.currentUser.user._id) {
													ctrl.groupTemp = response.data[0];

												}
												else ctrl.groupTemp = {};
											}

											$("#confirmAdd").modal();
												

										},
										function (errResponse) { console.log(JSON.stringify(errResponse));}
									);
								},

								function (errResponse) { console.log(JSON.stringify(errResponse));}
							);

						} else {
							$("#confirmAdd").modal();
						}

					} catch (err) {
						idUsera = 1;
						ctrl.currentUser = null;
					}
				}
			);
		}
		
		ctrl.closeAlert = function () {
			ctrl.alert = { text: "" };
		};
		ctrl.userGroup();

				// ctrl.updateGroup = function () {

		// 	$http.get('/auth').then(
		// 		function (rep) {
		// 			try {
		// 				ctrl.currentUser = rep.data;
		// 				console.log("ZAL1 : " + ctrl.currentUser.user._id);
		// 				$http.get('/db/persons/_id=' + ctrl.currentUser.user._id).then(
		// 					function (response) {
		// 						//ctrl.persons = response.data;
		// 						ctrl.workersIds1 = response.data;
		// 						console.log('personsUPD : ' + JSON.stringify(ctrl.workersIds1));
		// 						//console.log('WORKER'+ctrl.groups.workersIds);
		// 					},
		// 					function (errResponse) {
		// 						//ctrl.persons = [];
		// 						ctrl.workersIds1 = 0;
		// 					}
		// 				);


		// 			} catch (err) {
		// 				idUsera = 1;
		// 				ctrl.currentUser = null;
		// 			}
		// 		},
		// 		function (err) {
		// 			ctrl.alert = { type: "danger", text: " failed" };
		// 			ctrl.currentUser = 1;
		// 		}
		// 	);
		// }
		//ctrl.updateGroup();

	}
]);