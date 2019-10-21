function(obj) {
	try {
		obj.personId = mongojs.ObjectId(obj.personId);
		obj.groupId = mongojs.ObjectId(obj.groupId);
		console.log("Z TRANSFORMERSA personId: "+obj.personId);
		console.log("Z TRANSFORMERSA groupId: "+obj.groupId);
	} catch(err) {
		obj.personId = null;
		obj.groupId = null;
		console.log("Z TRANSFORMERSA ZLE personId: "+obj.personId);
		console.log("Z TRANSFORMERSA ZLE groupId: "+obj.groupId);
	}
	return obj;
}