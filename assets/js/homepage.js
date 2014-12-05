////////////////
//Socket Setup//
////////////////

//Connect socket
var socket = io.connect('http://localhost:1337');

//Subscribe to Human class room when the socket connects
socket.on('connect', function(){
	socket.get('/subscribe', function(res){
		console.log(res);
	});
});

////////////////////
//Form Submissions//
////////////////////
//Create a human on form submission
$('#create_human').submit(function(form) {
	form.preventDefault();

	socket.post('/human', {
		name: $('#human_name').val()
	}, function(resData, jwres) {
		//log response
		console.log(resData);
	});

	//clear form
	$('#human_name').val('');
});

//Create a new thing on form submission
$('#create_thing').submit(function(form) {
	form.preventDefault();

	var conf = confirm("Would you like to create a new thing? If so, please click a human to be its owner.");
	if (conf) {
		var thing_name = $('#thing_name').val()
		$('#thing_name').val('');		
		$('.human').off('click');
		$('.human').on('click', function(){
			var humanId = $(this).prop('id');
			humanId = parseInt(humanId.replace(/[^\d]/g, ''));
			console.log(humanId);
			socket.post('/thing', {name: thing_name, owner: humanId}, 
			function(resData){
				conosle.log(resData);
			});
			$('.human').off('click');
		});
	}
});

//////////////////////
//Object Definitions//
//////////////////////
var Selector = function() {
	this.human_id = null;
	this.stuff_index = null;
	this.thing_name = null;
};

////////////////////
//Object Instances//
////////////////////
var sel1 = new Selector();
var sel2 = new Selector();



////////////////////////
//Function Definitions//
////////////////////////

//Clear DOM
var clear_humans = function() {
	$('#humans').html('<p>Humans:</p>');
};

var clear_things = function() {
	$('#things').html('<p>Things:</p>');
};

//Render DOM
var render_humans = function(humans) {
	clear_humans();
	console.log("logging humans to render: ");
	console.log(humans);
	humans.forEach(function(human, index, humans) {
		$('#humans').append("<div class='human' id='human_"+human.id+"'>Name: " + human.name +"             Things: </div>");
		var divId = '#human_'+human.id;
		if ( human.hasOwnProperty('stuff') ) {
			if(human.stuff.length > 0) {			
				human.stuff.forEach(
				function(thing, index, stuff){
					$(divId).append("<div class='stuff' id='"+human.name+"_stuff_"+thing.id+"' stuff_index='"+index+"' human_id='"+human.id+"'>"+thing.name+"</div");
				});
			}
		}
	});
};

var render_things = function(things) {
	console.log("Logging things to render");
	console.log(things);
	clear_things();
	things.forEach(
	function(thing, index, things) {
		//Refactor this to implement custom attributes
		$('#things').append("<div class='thing' id='thing_"+thing.id+"'>Name: " + thing.name + "            Owner: "+thing.ownerName+ "</div>");
	});
	$('.stuff').off('click');
	stuff_click();
};

var remove_stuff = function() {
	var conf = confirm("Click the thing you'd like to remove");
	if (conf) {
		$('.stuff').off('click');
		$('.stuff').on('click', 
		function() {
			var stuff_index = $(this).attr('stuff_index');
			var human_id = $(this).attr('human_id');
			socket.get('/remove_stuff', {human_id: human_id, stuff_index: stuff_index}, function(res){
				console.log(res);
			});
		});
	}
};

var stuff_click = function() {
	$('.stuff').on('click', function() {
		console.log("Clicked someone's stuff");
		var human_id = parseInt( $(this).attr('human_id') );
		var stuff_index_1 = parseInt( $(this).attr('stuff_index') );
		if (sel1.thing_name !== null && sel1.thing_name !== '') {
			console.log("sel1 is set set");
			console.log(sel1);
			console.log($(this).html());
			console.log( $(this).attr('human_id') );
			console.log( $(this).attr('human_id') === sel1.human_id);
			if ( $(this).html() === sel1.thing_name ) {
				console.log("Thing was already selected: deselecting");
				sel1.human_id = null;
				sel1.stuff_index = null;
				sel1.thing_name = null;
			} else if( parseInt($(this).attr('human_id')) === sel1.human_id) {
				console.log("Clicked a different thing with same owner. Requesting to swap.\n");
				var stuff_index_2 = sel1.stuff_index;
				socket.get('/swap_my_stuff', {
					human_id: human_id,
					stuff_index_1: stuff_index_1,
					stuff_index_2: stuff_index_2
				});
			}
		} else {
			console.log("Selecting clicked thing");
			sel1.human_id = human_id;
			sel1.stuff_index = stuff_index_1;
			sel1.thing_name = $(this).html();
		}
	});	
}

///////////////////////////
//On-click Function Calls//
///////////////////////////
$('#remove').on('click', function() {
	remove_stuff();
});
//TODO:
/*  1) Function to switch things within someone's stuff
 *  2) Function to give thing to someone else's stuff
 *  3) Function to remove thing from someone's stuff
 */

//////////////////
//Socket Responses
//////////////////

socket.on('human', function(obj){
	console.log(obj.verb);
	if (obj.verb === 'created' || obj.verb === 'destroyed') {
		socket.get('/human', 
		function(res){
			render_humans(res);
		});
	} else if(obj.verb === 'updated') {
		socket.get('/humans_and_things', 
		function(res){
			console.log(res);
			render_humans(res.humans);
			render_things(res.things);
		});		
	}
});

socket.on('thing', function(obj){
	console.log(obj.verb);
	if (obj.verb === 'created' || obj.verb === 'destroyed') {
		console.log("Thing was " + obj.verb);
		socket.get('/humans_and_things', 
		function(res){
			console.log(res);
			render_humans(res.humans);
			render_things(res.things);
		});
	}
});