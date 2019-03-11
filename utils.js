var rp = require('request-promise')

var graphQLCall  = async function(token, login, query) {

    var options = {
        method: 'POST',
        uri: 'https://api.github.com/graphql',
        body: {
            query: query
        },
        qs: {
            access_token: token
        },
        headers: {
            'User-Agent': login
        },
        json: true
    };

    var res = rp(options).catch(error => { throw error; });
    console.log('Utils - Requête GitHub réussie !');
    return res;

}

exports.graphQLCall = graphQLCall;