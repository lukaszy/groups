function(obj) {
	try {
		obj.authorId = mongojs.ObjectId(obj.authorId);
		obj.groupId = mongojs.ObjectId(obj.groupId);
	} catch(err) {
		obj.authorId = null;
		obj.groupId = null;
	}
	return obj;
}