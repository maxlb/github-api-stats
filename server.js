// Dépendances  
var express = require('express'); 
var bodyParser = require('body-parser');
var stats = require('./stats');

// Initialisations
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  
var myRouter = express.Router(); 
 
// Router
myRouter.route('/').get(function(req,res){ 
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET');
	  
	var routes = [
		{nom: "basicStats", 		description: "pour obtenir toutes les stats de l'organisation"},
		{nom: "nbMembresStats", 	description: "pour obtenir le nombre de membres de l'organisation"},
		{nom: "nbRepoStats", 		description: "pour obtenir le nombre de répertoires de l'organisation"},
		{nom: "populareLanguages", 	description: "pour obtenir le nombre de répertoires par langages de l'organisation"},
		{nom: "popularePR", 		description: "pour obtenir les membres de l'organisation ayant effectué des PullRequest sur des projets populaires (plus de 1000 étoiles)"},
		{nom: "populareRepo", 		description: "pour obtenir les répertoires de l'organisation ayant ayant des contributeurs externes"},
	];

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

	res.send(HTML);
});


app.post('/:stat/', async function(req, res){ 

	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods','POST');

	var tokenGitHub = req.body.token;
	var loginGitHub = req.body.login;
	var orgaGitHub = req.body.orga

	console.log(`Server - Infos reçues : 
		- Token GitHub : ${tokenGitHub}
		- Login GitHub : ${loginGitHub}
		- Organisation : ${orgaGitHub}
		- Statistiques : ${req.params.stat}`
	);

	switch (req.params.stat) {
		case 'basicStats':
			await stats.getBasicStats(tokenGitHub, orgaGitHub, loginGitHub)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;

		case 'nbMembresStats':
			await stats.getNbMembres(tokenGitHub, orgaGitHub, loginGitHub)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;
		
		case 'nbRepoStats':
			await stats.getNbRepositories(tokenGitHub, orgaGitHub, loginGitHub)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;

		case 'populareLanguages':
			await stats.getPopulareLanguages(tokenGitHub, orgaGitHub, loginGitHub)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;
		
		case 'popularePR':
			await stats.getMembresPROnPopulareRepo(tokenGitHub, orgaGitHub, loginGitHub)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;
		case 'populareRepo':
			await stats.getPopulareRepo(tokenGitHub, orgaGitHub, loginGitHub)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;
	
		default:
			break;
	}

});

app.use(myRouter); 


// Lancement
const server = app.listen(8080, () => {
  console.log(`Serveur lancé sur https://${server.address().address == '::' ? 'localhost' : server.address().address}:${server.address().port}`);
});