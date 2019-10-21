app.controller("Persons", ["$http", function($http) {

    console.log("Persons started");

    var ctrl = this;

    ctrl.alert = { text: "" };
    ctrl.persons1 = [];
    ctrl.person1 = {};
    ctrl.rolesList = {};

    ctrl.nSkip1 = 0;
    ctrl.nLimit1 = 15;
    ctrl.filter = "";
    ctrl.count1 = 0;
    ctrl.countTotal1 = 0;

    ctrl.refreshCount = function() {
        $http.get("/db/persons/").then(
            function(rep) { ctrl.count = rep.data.count; },
            function(err) {
                ctrl.alert = { type: "warning", text: "Nie mozna pobrac danych" };
            }
        );
        $http.get("/db/persons/").then(
            function(rep) { ctrl.countTotal = rep.data.count; },
            function(err) {
                ctrl.alert = { type: "warning", text: "Nie mozna pobrac danych" };
            }
        );
    };

    ctrl.refreshPerson = function(_id) {
        ctrl.rolesList = {"administrator": false, "user": false};
        $http.get("/db/persons/" + _id).then(
            function (rep) {
                ctrl.rolesList = {"administrator": false, "user": false};
                ctrl.person1 = rep.data[0];
                for(var role in ctrl.rolesList) {
                    var firstLetter = role.charAt(0).toUpperCase();
                    if(ctrl.person1.roles.indexOf(firstLetter) >= 0) {
                        ctrl.rolesList[role] = true;
                    }
                }
            },
            function (err) {
                ctrl.alert = { type: "warning", text: "Nie mozna pobrac danych" };
                ctrl.persons1 = {};
            }
        );
    };

    ctrl.refreshPersons = function() {
        $http.get("/db/persons/" + ctrl.nSkip1 + "/" + ctrl.nLimit1 + "/").then(
            function (rep) {
                ctrl.persons1 = rep.data;
                ctrl.refreshCount();
            },
            function (err) {
                ctrl.alert = { type: "warning", text: "Nie mozna pobrac danych" };
                ctrl.persons1 = [];
                ctrl.count = ctrl.countTotal = 0;
            }
        );
    };

    ctrl.prev = function() { ctrl.nSkip1 -= ctrl.nLimit1; ctrl.refreshPersons(); };
    ctrl.next = function() { ctrl.nSkip1 += ctrl.nLimit1; ctrl.refreshPersons(); };

    ctrl.editPerson = function(_id) {
        ctrl.person1 = {};
        if(_id) {
            ctrl.refreshPerson(_id);
        }
        $("#editPerson").modal();
    };

    ctrl.editSubmit = function() {
        ctrl.person1.roles = '';
			for(var role in ctrl.rolesList) {
				var firstLetter = role.charAt(0).toUpperCase();
				if(ctrl.rolesList[role]) {
					ctrl.person1.roles += firstLetter;
				}
			}
        if(ctrl.person1._id) {
            /* update */
            console.log("OK");
            var _id = ctrl.person1._id;
            delete ctrl.person1._id;
            $http.put("/db/persons/" + _id, ctrl.person1).then(
                function(rep) {
                    ctrl.person1 = rep.data;
                    ctrl.refreshPersons();
                    ctrl.alert = {type: "info", text: "Twoje dane zostały pomyślnie zaktualizowane."};
                },
                function(err) {
                    ctrl.alert = {type: "info", text: "Wystąpił błąd podczas aktualizacji danych"};
                }
            );
        } 

        $("#editPerson").modal("hide");
    };

    ctrl.confirmRemove = function() {
        $("#editPerson").modal("hide");
        ctrl.confirm = { text: "Czy napewno chcesz usunąć '" + ctrl.person1.firstName + " " + ctrl.person1.lastName + "'", action: function() {
                /* delete */
                $("#confirmDialogPerson").modal("hide");
                $http.delete("/db/persons/" + ctrl.person1._id).then(
                    function(rep) {
                        ctrl.count--;
                        if(ctrl.nSkip1 >= ctrl.count1 && ctrl.count1 > 0) {
                            ctrl.nSkip1 -= ctrl.nLimit1;
                            if(ctrl.nSkip1 < 0) ctrl.nSkip1 = 0;
                        }
                        ctrl.refreshPersons();
                        ctrl.alert = { type: "info", text: "Usunięto" };
                    },
                    function(err) {
                        ctrl.alert = { type: "warning", text: "Wystąpił błąd podczas usuwania" };
                    }
                );
            }
        };
        $("#confirmDialogPerson").modal();
    };

    ctrl.closeAlert = function() {
        ctrl.alert = { text: "" };
    };

    ctrl.refreshPersons();

}]);