function(obj) {
	try {
		obj.managerId = mongojs.ObjectId(obj.managerId);
		console.log("Z TRANSFORMERSA : "+obj.managerId);
	} catch(err) {
		obj.managerId = null;
	}
	return obj;
}