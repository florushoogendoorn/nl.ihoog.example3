"use strict";

var http = require('http');

module.exports.init = function() {
    Homey.manager('speech-input').on('speech', function(speech, callback) {
        getGardenTemp();
    });   
}

Homey.manager('flow').on('action.tell_garden_temp', function( callback, args ) {
    getGardenTemp();      
    callback( null, true );
});

function getGardenTemp() {
    http.get('http://jezietheternietaanaf.nl/sensorapi.php?sensor=NL5032EK05_01', function(res) {
        var body = '';

		// {"temperatuur":"10.20","vochtigheid":"99.90","meetdatum":"17-11-2016","meettijd":"11:23","msg":"Tuin-terras"}
		
        res
            .on('data', function(chunk)
            {
                body += chunk;
            })
            .on('end', function()
            {
                body = JSON.parse(body);
		
		var t = body.temperatuur;
		var h = body.vochtigheid;
				
		var c = t.replace(".",",");
		var p = h.replace(".",",");
				
		var res1 = c.substring(0, c.length-1);
		var res2 = p.substring(0, p.length-1);
		
		
		var start_time = body.meettijd;
		var start_date = body.meetdatum;

		var start_hour = start_time.slice(0, -3);
		var start_minutes = start_time.slice(-2);
		var start_year = start_date.slice(-4);
		var start_month = start_date.slice(3, 2);
		var start_day = start_date.slice(0, 2);

		var startDate = new Date(start_year, start_month, start_day, start_hour, start_minutes);
		var endDate = new Date();

		var millis = endDate - startDate;
		var minutes = millis/1000/60;

		var message = __("temperature") + res1 + __("humidity") + res2 + __("timeago") + minutes + __("end");
		console.log(message);
                Homey.manager('speech-output').say( message );
            });
            
    }).on('error', function(e)
    {
        console.log("Got error: " + e.message);
        Homey.manager('speech-output').say('No internet connection');
    });
}
