"use strict";

var http = require('http');

module.exports.init = function() {

    setInterval(SaveTemp, 5 * 60 * 1000);

    Homey.manager('speech-input').on('speech', function(speech, callback) {
        getGardenTemp();
    });   
    
}


Homey.manager('flow').on('action.tell_garden_temp', function( callback, args ) {
    getGardenTemp();      
    callback( null, true );
});


function LogTemp(t) {

	Homey.manager('insights').createLog( 'sensor1_measure', {
	    label: { en: 'Temperatuur' },
	    type: 'number',
	    units: { en: '&deg;C' },
	    decimals: 2,
	    chart: 'line' 
	}, function callback(err , success){
	    if( err ) return console.error(err);
	    Homey.manager('insights').createEntry( 'sensor1_measure', parseFloat(t), new Date(), function(err, success){
		if( err ) return console.error(err);
	    })
	});
	
}

function SaveTemp() {

	var apiurl = Homey.manager('settings').get( 'apiurl' );
	var code1 = Homey.manager('settings').get( 'code1' );

    http.get(apiurl + code1, function(res) {
        var body = '';
		
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

     	console.log("createEntry t=" + parseFloat(t) + " new Date=" + new Date());
     	
    	Homey.manager('insights').createEntry( 'sensor1_measure', parseFloat(t) , new Date(), function(err, success){
        	if( err ) return console.error(err); 
        });     	
     	
    });
            
    }).on('error', function(e)
    {
        console.log("Got error: " + e.message);
    });
}


function getGardenTemp() {

	var apiurl = Homey.manager('settings').get( 'apiurl' );
	var code1 = Homey.manager('settings').get( 'code1' );

    http.get(apiurl + code1, function(res) {
        var body = '';
		
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
		
		var minutes = getMinutesAgo(body.meettijd, body.meetdatum);

		var message = __("temperature") + res1 + __("humidity") + res2 + __("timeago");
		

		var NoResult = res1.slice(0,2);
		if (NoResult == "--") {
			message = __("NoResult");
		} else {
			if (minutes < 2) {
				message = message + __("stop");
			} else {
				message = message + minutes + __("end");
			}
		}

		console.log(message);
        Homey.manager('speech-output').say( message );
    });
            
    }).on('error', function(e)
    {
        console.log("Got error: " + e.message);
        Homey.manager('speech-output').say('No internet connection');
    });
}

function getMinutesAgo(start_time, start_date) {
	
		var start_hour = start_time.slice(0, -3);
		var start_minutes = start_time.slice(-2);
		
		var start_year = start_date.slice(-4);
		
		var start_maand = start_date.slice(-7);
		start_maand = start_maand.slice(0, 2);
		start_maand = start_maand - 1;
		
		var start_month = start_maand;
		
		var start_day = start_date.slice(0, 2);
		
		var startDate = new Date(start_year, start_month, start_day, start_hour, start_minutes);
		var endDate = Date.now();
		
		console.log("startDate: " + startDate);
		console.log("endDate: " + endDate);

		var millis = endDate - startDate;
		var minutes = Math.round(millis/1000/60)+0;

	return minutes;

}
