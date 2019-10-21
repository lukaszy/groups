var debugLog = true;

//var dbName = 'pms';
var dbName = 'pai';
if(debugLog) console.log('Initialization of \'' + dbName + '\'');

var mongojs = require('mongojs');
var db = mongojs(dbName);

db.dropDatabase();

var persons = db.collection('persons');

var personsExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'), firstName: 'Dmitrii', lastName: 'Mitroshenkov', login: 'dm@dm.com', password: 'dm', roles: 'AU' },
	{ _id: mongojs.ObjectId('000000000000000000000002'), firstName: 'Chowdhury', lastName: 'Joy Barua', login: 'jb@jb.com', password: 'jb', roles: 'U' },
	{ _id: mongojs.ObjectId('000000000000000000000003'), firstName: 'Adrian', lastName: 'Gryza', login: 'ag@ag.com', password: 'ag', roles: 'U' },
	{ _id: mongojs.ObjectId('000000000000000000000004'), firstName: 'Myroslav', lastName: 'Dmukhivskyi', login: 'md@md.com', password: 'md', roles: 'U' },
	{ _id: mongojs.ObjectId('000000000000000000000005'), firstName: 'Patryk', lastName: 'Dudka', login: 'pd@pd.com', password: 'pd', roles: 'AU' },
	{ _id: mongojs.ObjectId('000000000000000000000006'), firstName: 'Igor', lastName: 'Gwiazdowski', login: 'ig@ig.com', password: 'ig', roles: 'U' },
	{ _id: mongojs.ObjectId('000000000000000000000007'), firstName: 'Adrian', lastName: 'Bus', login: 'ab@ab.com', password: 'ab', roles: '' }
];

if(debugLog) console.log('Creating new collection \'persons\'');
for(var i in personsExample) {
	if(debugLog) {
		console.log(JSON.stringify(personsExample[i]));
	}
	persons.insert(personsExample[i]);
}

var messages = db.collection('messages');

var messagesExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'), content: 'http://www.customerportal.com', authorId: mongojs.ObjectId('000000000000000000000001'), groupId: mongojs.ObjectId('000000000000000000000001'), dateAdd: new Date("2018-01-30T17:00:00.000Z") },
	{ _id: mongojs.ObjectId('000000000000000000000002'), content: 'Business oriented communication system', authorId: mongojs.ObjectId('000000000000000000000001'), groupId: mongojs.ObjectId('000000000000000000000001'),dateAdd: new Date("2018-01-29T17:00:00.000Z") },
	{ _id: mongojs.ObjectId('000000000000000000000003'), content: 'Bug tracking system based on SMS', authorId: mongojs.ObjectId('000000000000000000000002'), groupId: mongojs.ObjectId('000000000000000000000001'), dateAdd: new Date("2018-01-28T17:00:00.000Z") }
];

if(debugLog) console.log('Creating new collection \'messages\'');
for(var i in messagesExample) {
	if(debugLog) {
		console.log(JSON.stringify(messagesExample[i]));
	}
	messages.insert(messagesExample[i]);
}

var groups = db.collection('groups');

var groupsExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'),  name: 'Grupa 1'},
	{ _id: mongojs.ObjectId('000000000000000000000002'),  name: 'Grupa 2'},
	{ _id: mongojs.ObjectId('000000000000000000000003'),  name: 'Grupa 3'}
];

// var groupsExample = [
// 	{ _id: mongojs.ObjectId('000000000000000000000001'),  name: 'Grupa 1', workersIds:  [mongojs.ObjectId('000000000000000000000001'), mongojs.ObjectId('000000000000000000000006')] },
// 	{ _id: mongojs.ObjectId('000000000000000000000002'),  name: 'Grupa 2', workersIds:  [mongojs.ObjectId('000000000000000000000001') ] },
// 	{ _id: mongojs.ObjectId('000000000000000000000003'),  name: 'Grupa 3', workersIds:  [mongojs.ObjectId('000000000000000000000006')] }
// ];

if(debugLog) console.log('Creating new collection \'groups\'');
for(var i in groupsExample) {
	if(debugLog) {
		console.log(JSON.stringify(groupsExample[i]));
	}
	groups.insert(groupsExample[i]);
}

var personGroups = db.collection('personGroups');

var personGroupsExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'),  groupId: mongojs.ObjectId('000000000000000000000001'), personId:  mongojs.ObjectId('000000000000000000000001') },
	{ _id: mongojs.ObjectId('000000000000000000000002'),  groupId: mongojs.ObjectId('000000000000000000000002'), personId:  mongojs.ObjectId('000000000000000000000001')  },
	{ _id: mongojs.ObjectId('000000000000000000000003'),  groupId: mongojs.ObjectId('000000000000000000000003'), personId:  mongojs.ObjectId('000000000000000000000005')}
];

if(debugLog) console.log('Creating new collection \'groups\'');
for(var i in personGroupsExample) {
	if(debugLog) {
		console.log(JSON.stringify(personGroupsExample[i]));
	}
	personGroups.insert(personGroupsExample[i]);
}

var projects = db.collection('projects');

var projectsExample = [
	{ _id: mongojs.ObjectId('000000000000000000000001'), name: 'Customer Portal', description: 'http://www.customerportal.com', managerId: mongojs.ObjectId('000000000000000000000003') },
	{ _id: mongojs.ObjectId('000000000000000000000002'), name: 'Co Messenger', description: 'Business oriented communication system', managerId: mongojs.ObjectId('000000000000000000000003') },
	{ _id: mongojs.ObjectId('000000000000000000000003'), name: 'BT-SMS', description: 'Bug tracking system based on SMS', managerId: mongojs.ObjectId('000000000000000000000002') }
];

if(debugLog) console.log('Creating new collection \'projects\'');
for(var i in projectsExample) {
	if(debugLog) {
		console.log(JSON.stringify(projectsExample[i]));
	}
	projects.insert(projectsExample[i]);
}



if(debugLog) console.log('End of initialization');