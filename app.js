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
		var message = __("temperature") + body.temperatuur + __("humidity") + body.vochtigheid + __("end");
		console.log(message);
                Homey.manager('speech-output').say( message );
            });
            
    }).on('error', function(e)
    {
        console.log("Got error: " + e.message);
        Homey.manager('speech-output').say('No internet connection');
    });
}
