/**
 * HumanController
 *
 * @description :: Server-side logic for managing humans
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	//Creates new humans
	create: function(req, res) {
		var params = req.body;
		//console.log(params);

		if (params.hasOwnProperty('name')) {
			Human.create({
				name: params.name
			}).exec(
			function created (err, new_human){
				if (err || ! new_human) {
					console.log("Human not created");
				} else{
					console.log(new_human);
					Human.publishCreate(new_human);
				}
			});
		}
	},

	subscribe: function(req, res) {
		console.log('subscribing socket: ' + req.socket.id + ' to Human and Thing class rooms');
		Human.watch(req);
		Thing.watch(req);
	},

	swap_my_stuff: function(req, res) {
		console.log("\nSwapping stuff");
		//expected req.body: {human_id: INTEGER, stuff_index_1: INTEGER, stuff_index_2: INTEGER}
		var params = req.body;

		if ( params.hasOwnProperty('human_id') ) {
			Human.findOne(params.human_id).populate('stuff').exec(
			function(err, human){
				console.log(human);
				var temp = human.stuff[params.stuff_index_2];
				human.stuff[params.stuff_index_2] = human.stuff[params.stuff_index_1];
				human.stuff[params.stuff_index_1] = temp;

				//This correctly logs that the things were swapped in human.stuff
				console.log("\nlogging human after swap:");
				console.log(human);

				//But saving the changes does not affect the Human on the server
				human.save();
				Human.publishUpdate(human.id);
				

			});
		}
	},

	//Removes thing from a Human's Stuff (hopefully)
	remove_stuff: function(req, res) {
		console.log("\nRemoving stuff");

		var params = req.body;
		console.log(params);
		if (params.hasOwnProperty('human_id') && params.hasOwnProperty('stuff_index')) {
			Human.findOne(params.human_id).populate('stuff').exec(
			function(err, human){
				console.log(human);
				console.log(human.stuff[params.stuff_index].id);
				//human.stuff.remove(human.stuff[params.stuff_index].id);

				var stuff_index = parseInt(params.stuff_index);
				human.stuff.splice(stuff_index, 1);
				console.log(human);
				human.save();
				res.send('hi');
			});
		}
	}
};

