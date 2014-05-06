/**
 * Created by xerxes on 5/6/14.
 */
(function () {
    // this should really be in a config file!
    var conf = {
        client_id: '1429906980595399', client_secret: 'af662fb9b3f927e7549f72c9669d752d', scope: 'email, user_about_me, user_birthday', redirect_uri: 'http://tabstat.ap01.aws.af.cm/fblogin'
    };

    var express, app, http, route, _, bodyParser, graph;
    express = require('express');
    http = require('http');
    graph = require('fbgraph');
    bodyParser = require('body-parser');
    _ = require('underscore');

    app = express();

    app.use(bodyParser());
    app.set('port', process.env.PORT || 3000);

    http.createServer(app).listen(app.get('port'), function () {
        console.log('server running @ ', app.get('port'))
    });

    app.route('/')
        .get(function (request, response) {
            return response.sendfile('index.html');
        });

    app.route('/fblogin')
        .get(function (request, response) {
            console.log('fblogin request');
            if (!request.query.code) {
                var authUrl = graph.getOauthUrl({
                    "client_id": conf.client_id, "redirect_uri": conf.redirect_uri, "scope": conf.scope
                });

                if (!request.query.error) { //checks whether a user denied the app facebook login/permissions
                    return response.redirect(authUrl);
                } else {  //req.query.error == 'access_denied'
                    return response.send('access denied');
                }
            }

            // code is set
            // we'll send that and get the access token
            graph.authorize({
                "client_id": conf.client_id, "redirect_uri": conf.redirect_uri, "client_secret": conf.client_secret, "code": request.query.code
            }, function (err, facebookRes) {
                graph.setAccessToken(facebookRes.access_token);
                return response.redirect('/loginsuccess');
            });
        })

    app.route('/loginsuccess')
        .get(function (request, response) {
            console.log('fb login success');
            return response.sendfile('success.html');
        });

    app.route('/getdata')
        .get(function (request, response) {
            console.log('fb getdata')
            graph.get('/me', function (err, res) {
                return response.send({'err': err, 'response': res });
            })
        });
    app.route('/getaccesstoken')
        .get(function (request, response) {
            return response.send({ 'accessToken': graph.getAccessToken()});
        })
})();