// Dépendances  
var express = require('express'); 
var stats = require('./stats');

// Initialisation
var app = express();  
var myRouter = express.Router(); 
 
// Router
myRouter.route('/').get(function(req,res){ 
	res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
	
	var html = " 																																					  	\
		<style type=\"text/css\">																																\
			body{ font-family: sans-serif; }																											\
			b{ font-family: monospace; font-size: large; color: white; background-color: gray; }	\
		</style>																																								\
		<h1>API de statistique d'une organisation GitHub</h1> 																	\
		<ul> 																																										\
			<li><b>/basicStats/{TOKEN_GIT}/{LOGIN_GIT}/{NOM_ORGANISATION}</b> pour obtenir toutes les stats de l'organisation </li> 		\
			<li><b>/nbMembresStats/{TOKEN_GIT}/{LOGIN_GIT}/{NOM_ORGANISATION}</b> pour obtenir le nombre de membres de l'organisation </li> 		\
			<li><b>/nbRepoStats/{TOKEN_GIT}/{LOGIN_GIT}/{NOM_ORGANISATION}</b> pour obtenir le nombre de répertoires de l'organisation </li> 		\
			<li><b>/populareLanguages/{TOKEN_GIT}/{LOGIN_GIT}/{NOM_ORGANISATION}</b> pour obtenir le nombre de répertoires par langages de l'organisation </li>				\
			<li><b>/popularePL/{TOKEN_GIT}/{LOGIN_GIT}/{NOM_ORGANISATION}</b> pour obtenir les membres de l'organisation ayant effectué des PullRequest sur des projets populaires (plus de 1000 étoiles) </li> \
		</ul> 																																									\
	"
	res.send(html);
});

myRouter.route('/:stat/:token/:login/:orga').get(async function(req,res){ 

	res.setHeader('Access-Control-Allow-Origin', '*');
  	res.setHeader('Access-Control-Allow-Methods', 'GET');

	console.log(`Server - Appel ${req.params.stat}`);

	switch (req.params.stat) {
		case 'basicStats':
			await stats.getBasicStats(req.params.token, req.params.orga, req.params.login)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;

		case 'nbMembresStats':
			await stats.getNbMembres(req.params.token, req.params.orga, req.params.login)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;
		
		case 'nbRepoStats':
			await stats.getNbRepositories(req.params.token, req.params.orga, req.params.login)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;

		case 'populareLanguages':
			await stats.getPopulareLanguages(req.params.token, req.params.orga, req.params.login)
								 .then(obj => res.json(obj))
								 .catch(err => res.json( {"error": err.message} ));
			break;
		
		case 'popularePL':
			await stats.getMembresPROnPopulareRepo(req.params.token, req.params.orga, req.params.login)
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
  const host = server.address().address;
  const port = server.address().port;
  
  var lhost = host;
  if(lhost == '::'){
	lhost = 'localhost';
  }

  console.log(`Serveur lancé sur https://${lhost}:${port}`);
});