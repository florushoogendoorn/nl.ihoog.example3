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

		var message = __("temperature") + res1 + __("humidity") + res2 + __("end");
		console.log(message);
                Homey.manager('speech-output').say( message );
            });
            
    }).on('error', function(e)
    {
        console.log("Got error: " + e.message);
        Homey.manager('speech-output').say('No internet connection');
    });
}
