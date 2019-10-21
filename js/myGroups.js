
app.controller('MyGroups', ['$http', 'common',
	function ($http, common) {

		console.log("MyGroups controller starting");

		var ctrl = this;
		//ctrl.confirm = common.confirm;
		ctrl.workersIds1 = '';
		ctrl.project = {};
		ctrl.groups = {};
		ctrl.currentUser = null;
		ctrl.persons = {};
		ctrl.message = {};
		ctrl.nSkip = 0;
		ctrl.nLimit = 5;
		ctrl.count = 0;
		ctrl.countTotal = 0;

		ctrl.countMessages = function (id='') {
			$http.get("db/messages/"+id).then(
				function (rep) {
					ctrl.countTotal = rep.data.length;
					ctrl.count = rep.data.length;
					console.log("COUNT " + (ctrl.countTotal));
				},
				function (err) {
					ctrl.alert = { type: "warning", text: "Cannot retrieve data" };
				}
			);
		}
		//ctrl.countMessages();
		$http.get('/auth').then(
			function (rep) {
				try {
					ctrl.currentUser = rep.data;
					console.log(ctrl.currentUser.user._id);

				} catch (err) {
					ctrl.currentUser = null;
				}
			},
			function (err) {
				ctrl.alert = { type: "danger", text: "Login failed" };
				ctrl.currentUser = null;
			}
		);
		// =================================
		ctrl.messages = {};
		ctrl.getMessageId = {};
		ctrl.showMessages = function (idGroup = '') {
			
			ctrl.messages.groupId = idGroup;
			ctrl.getMessageId.groupId = idGroup;
			$("#dialogMessages").modal();
			$http.get('/auth').then(
				function (rep) {
					try {
						ctrl.messages.personId = rep.data;
						console.log("ZALOGOWANY : " + ctrl.messages.personId.user._id);
						console.log("GRUPA ID : " + ctrl.messages.groupId);
						$http.get('db/messages/' + ctrl.messages.groupId + '/' + ctrl.nSkip + "/" + ctrl.nLimit).then(
							function (response) {
								ctrl.messages = response.data;
								ctrl.countMessages(ctrl.messages.groupId);
								$("#dialogMessages").modal();
								
		

							},
							function (errResponse) {
								ctrl.messages = [];
								ctrl.count = ctrl.countTotal = 0;
							}
						);


					} catch (err) {
						idUsera = 1;
						ctrl.messages.personId = null;
					}
				},
				function (err) {
					ctrl.alert = { type: "danger", text: "Messages failed" };
					ctrl.messages.personId = 1;
				}
			);

		}
		ctrl.reset = function () {
			$('textarea#comment').val(" ");

		};
		ctrl.prev = function () {

			ctrl.nSkip -= ctrl.nLimit; ctrl.showMessages(ctrl.getMessageId.groupId);
		};
		ctrl.next = function () {
			console.log("NEXT");
			ctrl.nSkip += ctrl.nLimit; ctrl.showMessages(ctrl.getMessageId.groupId);
		};

		ctrl.sendMessage = function (groupId = '') {
			var today = new Date().toJSON().slice(0, 19).replace('T', ', ');;

			ctrl.message.authorId = ctrl.currentUser.user._id;
			ctrl.message.groupId = groupId;
			ctrl.message.dateAdd = today;
			console.log("ZALOGOWANY WYSLAL: " + JSON.stringify(ctrl.message.authorId));
			console.log("rep data1 : " + JSON.stringify(ctrl.message.personId));

			console.log("message.groupId: " + JSON.stringify(ctrl.message.groupId));
			$http.post('db/messages/json', ctrl.message).then(
				function (response) {
					ctrl.messages = response.data;
					ctrl.showMessages(ctrl.getMessageId.groupId);
					ctrl.reset();
				},
				function (errResponse) {

					ctrl.messages = [];
				}
			);
		};

		ctrl.temp = {};
		var jsonArray1 = [];
		var jsonArray2 = [];
		ctrl.currentU = function () {
			$http.get('/auth').then(
				function (rep) {
					try {
						ctrl.temp = {};
						ctrl.currentUser = rep.data;

						$http.get('db/personGroups/personId=' + ctrl.currentUser.user._id).then(
							function (response) {
								ctrl.temp = response.data;
								for (var k of ctrl.temp) {
									$http.get('db/groups/_id=' + k.groupId).then(
										function (response) {
											jsonArray1 = response.data;
											jsonArray2 = jsonArray1.concat(jsonArray2);
											ctrl.groups = jsonArray2;
										},

										function (errResponse) {
											ctrl.groups = {};
										}
									);
								}
								jsonArray2 = [];
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
		ctrl.currentU();

		$http.get('/db/persons').then(
			function (response) {
				ctrl.persons = response.data;
				ctrl.workersIds1 = response.data[0]._id;
				console.log('persons' + ctrl.persons._id);
				//console.log('WORKER'+ctrl.groups.workersIds);
			},
			function (errResponse) {
				ctrl.persons = [];
				ctrl.workersIds1 = 0;
			}
		);

		ctrl.usuniecie = {};
		ctrl.removeIdGroup = {};
		ctrl.deleteUserGroup = function (id = '') {

			$("#dialogMessages").modal('hide');
			ctrl.removeIdGroup = id;

			ctrl.confirm = {
				text: "", action: function () {
					$("#confirmDialog").modal("hide");

					var deleteUser = ctrl.usuniecie;

					deleteUser.groupId = id;

					$http.get('/auth').then(
						function (rep) {
							try {
								ctrl.currentUser = rep.data;

								deleteUser.personId = ctrl.currentUser.user._id;
								console.log("USUWANA OSOBA ID: " + deleteUser.personId);
								console.log("JS  :" + JSON.stringify(ctrl.usuniecie));
								$http.delete('/db/personGroups/' + id + '/' + deleteUser.personId).then(
									function (response) {
										ctrl.groups = {};
										ctrl.currentU();


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
			};
			$("#confirmDialog").modal();
		}
	}
]);