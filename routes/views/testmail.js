var keystone = require('keystone');
var mandrill = require('../../node_modules/keystone/node_modules/mandrill-api');
	
exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
		
	view.on('init', function(next) {
		var cb = function(err,data){
			if (err) console.log(err);
			console.log("mail sent!");
		};
		//var m = keystone.Email.mandrill;
		//console.log("mail",m);
		sendTest();
		console.log(__dirname);
		if (false) {
			var mail = new keystone.Email('test-mail');
			mail.send({
				subject: 'My mail from keystoneJS',
				//content: {},
				to: 'm_rambeau@brastel.co.jp',
				from: {
					name: 'Michael',
					email: 'mike@worldcompany.com'
							}
						}, cb);			
		}

		next();
	});
	view.render('index');
	
};

function sendTest(){
	mandrill_client = new mandrill.Mandrill('ZUpaylE-5Dr45UQNm-dBKQ');
	var message = {
			"html": '<h1>Example HTML content</h1><a href="http://michaelrambeau.com/it/projects">Projects</a>',
			"text": "Example text content",
			"subject": "example subject",
			"from_email": "mike@example.com",
			"from_name": "Michael",
			"to": [{
							"email": "m_rambeau@brastel.co.jp",
							"name": "Michael",
							"type": "to"
					}],
			"important": false,
			"track_opens": null,
			"track_clicks": null,
			"auto_text": null,
			"auto_html": null,
			"inline_css": null,
			"url_strip_qs": null,
			"preserve_recipients": null,
			"view_content_link": null,
			"tracking_domain": null,
			"signing_domain": null,
			"return_path_domain": null,
			"merge": true,
			"global_merge_vars": [{
							"name": "merge1",
							"content": "merge1 content"
					}],
			"merge_vars": [{
							"rcpt": "recipient.email@example.com",
							"vars": [{
											"name": "merge2",
											"content": "merge2 content"
									}]
					}],
			"tags": [
					"tag one"
			],
			"google_analytics_domains": [
					"example.com"
			],
			"google_analytics_campaign": "My google analytics campaign",
			"metadata": {
					"website": "www.example.com"
			},
			"recipient_metadata": [{
							"rcpt": "recipient.email@example.com",
							"values": {
									"user_id": 123456
							}
					}]
	};
	var async = false;
	var ip_pool = "Main Pool";
	var send_at = new Date();
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
			console.log(result);
			/*
			[{
							"email": "recipient.email@example.com",
							"status": "sent",
							"reject_reason": "hard-bounce",
							"_id": "abc123abc123abc123abc123abc123"
					}]
			*/
	}, function(e) {
			// Mandrill returns the error as an object with name and message keys
			console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
			// A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}