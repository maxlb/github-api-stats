// Dépendances  
var express = require('express'); 
var bodyParser = require('body-parser');
var stats = require('./stats');
var utils = require('./utils');

// Initialisations
var app = express();
var myRouter = express.Router();

// Routage
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  
app.use(myRouter); 
 
// Router
myRouter.route('/').get(function(req,res){ 
	// Autoriser l'accès
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET');
	
	// Routes disponibles
	var routes = [
		{nom: "basicStats", 		description: "pour obtenir toutes les stats de l'organisation"},
		{nom: "nbMembresStats", 	description: "pour obtenir le nombre de membres de l'organisation"},
		{nom: "nbRepoStats", 		description: "pour obtenir le nombre de répertoires de l'organisation"},
		{nom: "populareLanguages", 	description: "pour obtenir le nombre de répertoires par langages de l'organisation"},
		{nom: "popularePR", 		description: "pour obtenir les membres de l'organisation ayant effectué des PullRequest sur des projets populaires (plus de 1000 étoiles)"},
		{nom: "collaborativesRepos",description: "pour obtenir les répertoires de l'organisation ayant ayant des contributeurs externes"},
	];

	// Affichage HTML
	var HTML = utils.getHTML(routes);

	res.send(HTML);
});

// Routes de POST
app.post('/:stat/', async function(req, res){ 
	// Autoriser l'accès
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods','POST');

	var t = req.body;
	if (req.body) {
		// Log
		console.log(`Server - Infos reçues : 
			- Token GitHub : ${req.body.token}
			- Login GitHub : ${req.body.login}
			- Organisation : ${req.body.orga}
			- Statistiques : ${req.params.stat}`
		);

		// Appel et réponse de la statistique
		await stats.getStat(req.params.stat, req.body.token, req.body.orga, req.body.login)
						.then(obj => res.json( { ok:true , data:obj } ))
						.catch(err => res.json( { ok:false , error:err } ));
	} else {
		res.json( { ok:false, error:"Aucune données reçues..."} );
	}
	

});

// Lancement du server

const server = app.listen(8080, () => {
  console.log(`Serveur lancé sur https://${server.address().address == '::' ? 'localhost' : server.address().address}:${server.address().port}`);
});