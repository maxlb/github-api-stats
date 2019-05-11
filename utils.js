var rp = require('request-promise')

var graphQLCall  = async function(token, login, query) {

    var options = {
        method: 'POST',
        uri: 'https://api.github.com/graphql',
        body: {
            query: query
        },
        headers: {
            'User-Agent': login,
			'Authorization': 'token ' + token
		},
        json: true
    };

    var res = rp(options).catch(error => { throw error; });
    console.log('Utils - Requête GitHub réussie !');
    return res;

}

var getHTML = (routes) => {
    var style = `<style type="text/css">
					body{ font-family: sans-serif; }
					b{ font-family: monospace; font-size: large; color: white; background-color: gray; }
					</style>`;
	
	var post = `<p>Les requêtes se font en POST avec les paramètres suivants : 
					<ul>
						<li><b>token</b> : Il s'agit de votre token developpeur de GitHub.</li>
						<li><b>login</b> : Il s'agit de votre login GitHub.</li>
						<li><b>orga</b> : Il s'agit de login GitHub de l'organisation dont vous voulez récupérer les statistiques.</li>
					</ul>
				</p>`;

	var liste = 'Les routes disponibles sont les suivantes :<ul>';
	routes.forEach(route => {
		liste = `${liste}<li><b>/${route.nom}</b> ${route.description}. </li>`
	});
	liste += '</ul>'

	var HTML = `${style}
				<h1>API de statistiques d'une organisation GitHub</h1>
				${post}
                ${liste}`;

    return HTML;
}

exports.graphQLCall = graphQLCall;
exports.getHTML = getHTML;