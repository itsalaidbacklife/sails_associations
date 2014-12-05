/**
 * ThingController
 *
 * @description :: Server-side logic for managing things
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	//Creates new things
	create: function(req, res) {
		var params = req.body;

		if ( params.hasOwnProperty('name') && params.hasOwnProperty('owner') ) {
			Human.findOne(params.owner).exec(
			function(err, human) {
				if (err || !human) {
					console.log("Human not found");
				} else {
					Thing.create({
						name: params.name,
						owner: human,
						ownerName: human.name
					}).exec(
					function created (err, new_thing){
						if (err || ! new_thing) {
							console.log("Thing not created");
						} else{
							console.log(new_thing);
							Thing.publishCreate(new_thing);
						}
					});
					
				}
			});
		}
	},

	humans_and_things: function(req, res) {
		console.log("Humans and Things");
		var params = req.body;
		var humans = [];
		var things = [];

		Human.find({}).populate('stuff').exec(
		function(err, found) {
			//console.log(found);
			found.forEach(
			function(human, index, allHumans){
				//console.log("Logging found human in each loop: ");
				//console.log(human);
				humans.push(human);
				
			});
			console.log("\nLogging humans");
			console.log(humans);
			Thing.find({}).exec(
			function(err, found_things) {
				found_things.forEach(
				function(thing, index, allThings){
					//console.log("Logging found thing in each loop: ");
					//console.log(thing);
					things.push(thing);
				});
			//WEIRDNESS When this code is put outside of the find() function call, at the end of the action
			//For some reason, it executes before the either find() call when placed there. 
			console.log("\nLogging things");
			console.log(things);
			console.log("\nRelogging humans");
			console.log(humans);
			res.send({humans: humans, things: things});
			});
		});
	}
};

