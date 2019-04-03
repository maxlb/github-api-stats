var utils = require('./utils');

var TOKEN;
var LOGIN;
var ORGA;

const asyncForEach = async(array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
}

var getStat = async(stat, tokenGitHub, orgaGitHub, loginGitHub) => {
    TOKEN = tokenGitHub;
    LOGIN = loginGitHub;
    ORGA = orgaGitHub;

    var stats;

    switch (stat) {
		case 'basicStats':
            stats = await getBasicStats().catch(err => { throw err });
			break;
		case 'nbMembresStats':
            stats = await getNbMembres().catch(err => { throw err });
			break;
		case 'nbRepoStats':
            stats = await getNbRepositories().catch(err => { throw err });
			break;
		case 'populareLanguages':
            stats = await getPopulareLanguages().catch(err => { throw err });
			break;
		case 'popularePR':
            stats = await getMembresPROnPopulareRepo().catch(err => { throw err });
			break;
		case 'collaborativesRepos':
            stats = await getCollaborativesRepos().catch(err => { throw err });
			break;
        default:
            throw {"ok": false, "error": "Route invalide : " + req.params.stat};
    }
    
    return stats;
}

var PRonExistingRepo = function (PRObject, value) {
    var index = -1;
    PRObject.forEach(function(PR,i) {
        if (PR.repository.name == value) {
            index = i;
        }
    });
    return index;
}

var getNbMembres = async function() {
    var query = `query {
                    organization(login: "${ORGA}") {
                        membersWithRole(first: 1) {
                            totalCount
                        }
                    }
                }`;

    var res = await utils.graphQLCall(TOKEN, LOGIN, query).catch(error => { throw error; } );

    var jsonRes = {
        organization: ORGA,
        countMembers: res.data.organization.membersWithRole.totalCount
    };
    
    console.log('Stats - Renvoi JSON réussi !');
    return jsonRes;
}

var getNbRepositories = async function() {
    var query = `query {
                    organization(login: "${ORGA}") {
                        repositories {
                            totalCount
                        }
                    }
                }`;

    var res = await utils.graphQLCall(TOKEN, LOGIN, query).catch(error => { throw error; } );

    var jsonRes = {
        organization: ORGA,
        countRepositories: res.data.organization.repositories.totalCount
    };
    
    console.log('Stats - Renvoi JSON réussi !');
    return jsonRes;
}

var getPopulareLanguages = async function() {

    var listLanguages = [];
    var listUsage = [];
    var hasNextPage = true;
    var curseur = "";

    while(hasNextPage) {

        // Requête
        var query = `query {
            organization(login: "${ORGA}") {
                repositories(after:"${curseur}", first: 100) {
                    edges {
                        cursor
                        node {
                            primaryLanguage {
                                name
                            }
                        }
                    }
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                }
            }
        }`;

        // Collecte des résultats
        var res = await utils.graphQLCall(TOKEN, LOGIN, query).catch(error => { throw error; } );
        res.data.organization.repositories.edges.forEach(repo => {

            if (repo.node.primaryLanguage != null) {
                var myPR = repo.node.primaryLanguage.name;
                var indexPR = listLanguages.indexOf(myPR);
        
                if (indexPR >= 0) {
                    listUsage[indexPR] +=1;
                } else {
                    listLanguages.push(myPR);
                    listUsage.push(1);
                }
            }
            
        });

        // Page suivante
        hasNextPage = res.data.organization.repositories.pageInfo.hasNextPage;
        curseur = res.data.organization.repositories.pageInfo.endCursor;
    }

    var jsonRes = {
        organization: ORGA,
        langages: listLanguages,
        nbRepositories: listUsage
    };
    
    console.log('Stats - Renvoi JSON réussi !');
    return jsonRes;
}

var getMembresPROnPopulareRepo = async function() {

    var listMembers = [];
    var listPopularePR = [];
    var hasNextPage = true;
    var curseur = "";
    var curseurString = "";

    // Récupération des membres de l'organisation
    while(hasNextPage) {
        
        // Gestion de la pagniation
        if(curseur != "") {
            curseurString = 'after:"' + curseur + '",';
        } else {
            curseurString = "";
        }

        // Requête
        var query = `query {
            organization(login: "${ORGA}") {
                membersWithRole(${curseurString} first:100) {
                    edges {
                      cursor
                      node {
                        login
                        name
                      }
                    }
                    pageInfo {
                      endCursor
                      hasNextPage
                    }
                  }
            }
        }`;

        // Collecte des résultats
        var res = await utils.graphQLCall(TOKEN, LOGIN, query).catch(error => { throw error; } );
        res.data.organization.membersWithRole.edges.forEach(membre => {
            listMembers.push({
                login: membre.node.login,
                name: membre.node.name
            });
        });

        // Page suivante
        hasNextPage = res.data.organization.membersWithRole.pageInfo.hasNextPage;
        curseur = res.data.organization.membersWithRole.pageInfo.endCursor;
    }


    // Récupération des PR sur projets popualaires (> 1000 étoiles)
    await asyncForEach(listMembers, async (membre) => {
        hasNextPage = true;
        curseur = "";
        var memberPopularePR = {
            member: membre.name,
            login: membre.login,
            count: 0,
            popularePR: []
        }

        // Récupération des membres de l'organisation
        while(hasNextPage) {

            // Gestion de la pagniation
            if(curseur != "") {
                curseurString = 'after:"' + curseur + '",';
            } else {
                curseurString = "";
            }

            // Requête
            var query = `query {
                user(login:"${membre.login}") {
                    pullRequests(${curseurString} first:100, states:MERGED) {
                        edges {
                            node {
                                mergedAt
                                repository {
                                    name
                                    owner {
                                        login
                                    }
                                    primaryLanguage {
                                        name
                                    }
                                    stargazers {
                                        totalCount
                                    }
                                }
                            }
                        }
                        pageInfo {
                            endCursor
                            hasNextPage
                        }
                    }
                }
            }`;

            // Collecte des résultats
            var res = await utils.graphQLCall(TOKEN, LOGIN, query).catch(error => { throw error; } );
            res.data.user.pullRequests.edges.forEach(PR => {
                if (PR.node.repository.stargazers.totalCount >= 1000 && PR.node.repository.owner.login != ORGA) {
                    var indexRepo = PRonExistingRepo(memberPopularePR.popularePR, PR.node.repository.name);
                    if (indexRepo >= 0) {
                        memberPopularePR.popularePR[indexRepo].repository.pullRequests.mergedDates.push(PR.node.mergedAt);
                        memberPopularePR.popularePR[indexRepo].repository.pullRequests.count += 1;
                        memberPopularePR.count += 1;
                    } else {
                        var language = PR.node.repository.primaryLanguage == null ? "Inconnu" : PR.node.repository.primaryLanguage.name;
                        var myPR = {
                            repository: {
                                name: PR.node.repository.name,
                                owner: PR.node.repository.owner.login,
                                language: language,
                                stars: PR.node.repository.stargazers.totalCount,
                                pullRequests: {
                                    count: 1,
                                    mergedDates: [PR.node.mergedAt]
                                }
                            }
                        }
                        memberPopularePR.popularePR.push(myPR);
                        memberPopularePR.count += 1;
                    }
                }
            });

            // Page suivante
            hasNextPage = res.data.user.pullRequests.pageInfo.hasNextPage;
            curseur = res.data.user.pullRequests.pageInfo.endCursor;
        }

        // Stockage des résultats
        if (memberPopularePR.count > 0) {
            listPopularePR.push(memberPopularePR);
        }
        
    })
    
    console.log('Stats - Renvoi JSON réussi !');
    return listPopularePR;
}

var getAllRepos = async function() {
    var listRepos = [];

    var hasNextPage = true;
    var curseur = "";
    var curseurString = "";

    // Récupération des repos populaires de l'organisation
    while(hasNextPage) {
        
        // Gestion de la pagniation sur les répertoires
        if(curseur != "") {
            curseurString = 'after:"' + curseur + '",';
        } else {
            curseurString = "";
        }

        var query = `query {
            organization (login: "${ORGA}") {
                repositories (${curseurString} first: 5) {
                    pageInfo {
                        hasNextPage,
                        endCursor
                    }
                    edges {
                        cursor,
                        node {
                            name,
                            stargazers {
                                totalCount
                            },
                            primaryLanguage {
                                name
                            }
                        }
                    }
                }
            }
        }`;

        // Collecte des résultats - les Repos
        var res = await utils.graphQLCall(TOKEN, LOGIN, query).catch(error => { throw error; } );
        res.data.organization.repositories.edges.forEach(repo => {
             // Récuération des Repos
             var repoLang = repo.node.primaryLanguage == null ? "Inconnu" : repo.node.primaryLanguage;
             listRepos.push({
                 name: repo.node.name,
                 stars: repo.node.stargazers.totalCount,
                 language: repoLang,
                 PRExternes: []
             });
        });

        // Page suivante
        hasNextPage = res.data.organization.repositories.pageInfo.hasNextPage;
        curseur = res.data.organization.repositories.pageInfo.endCursor;
    }

    return listRepos;

}

var getPRByRepoName =  async function(nameRepo) {
    var listPR = [];

    var hasNextPage = true;
    var curseur = "";
    var curseurString = "";

    // Récupération des repos populaires de l'organisation
    while(hasNextPage) {
        
        // Gestion de la pagniation sur les répertoires
        if(curseur != "") {
            curseurString = 'after:"' + curseur + '",';
        } else {
            curseurString = "";
        }

        var query = `query {
            repository(name:"${nameRepo}", owner:"${ORGA}") {
                pullRequests ( ${curseurString} first:100, states: MERGED) {
                    pageInfo {
                        hasNextPage,
                        endCursor
                    }
                    edges {
                        cursor,
                        node {
                            mergedAt,
                            participants(first: 10) {
                                nodes{
                                    login,
                                    name,
                                    organizations(first: 5) {
                                        nodes {
                                            name,
                                            login
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;

        // Collecte des résultats - les Repos
        var res = await utils.graphQLCall(TOKEN, LOGIN, query).catch(error => { throw error; } );

        res.data.repository.pullRequests.edges.forEach(PR => {
            
            partExternes = [];

            PR.node.participants.nodes.forEach(PRpart => {
                var partExterne = true;
                PRpart.organizations.nodes.forEach(partOrga => {
                    if (partOrga.login == ORGA) {
                        partExterne = false
                    }
                });

                if (partExterne) {
                    partExternes.push({
                        login: PRpart.login,
                        name: PRpart.name,
                        organizations: PRpart.organizations.nodes
                    });
                }
            })
            
            // Récuération des PR avec participants externes
            if(partExternes.length > 0){
                listPR.push({
                    date: PR.node.mergedAt,
                    nbParticipantsExternes: partExternes.length,
                    participantsExternes: partExternes
                });
            }

        });

        // Page suivante
        hasNextPage = res.data.repository.pullRequests.pageInfo.hasNextPage;
        curseur = res.data.repository.pullRequests.pageInfo.endCursor;
    }

    return listPR;
}

var getCollaborativesRepos = async function() {
    var listAllRepos = [];
    var listRepos = [];

    // Récupération des repos de l'organisation
    listAllRepos = await getAllRepos();

    // Récupération des PR avec participants externes
    await asyncForEach(listAllRepos, async (repo) => {
        repo.PRExternes = await getPRByRepoName(repo.name);
        repo.nbPRExternes = repo.PRExternes.length;
    });

    listAllRepos.forEach(repo => {
        if (repo.nbPRExternes > 0) {
            listRepos.push(repo);
        }
    });

    console.log('Stats - Renvoi JSON réussi !');
    return listRepos;
}

var getBasicStats = async function() {
    var query = `query {
                    organization(login: "${ORGA}") { 
                        membersWithRole(first: 100) { 
                            edges { 
                                node { 
                                    login 
                                    name 
                                    email 
                                    createdAt 
                                    followers { 
                                        totalCount 
                                    } 
                                    isEmployee 
                                    repositories(first: 100) { 
                                        totalCount 
                                        nodes { 
                                            primaryLanguage { 
                                                name 
                                            } 
                                            languages(first: 10) { 
                                                nodes {
                                                    name 
                                                } 
                                            } 
                                        } 
                                    } 
                                } 
                            } 
                        } 
                    }
                }`;

    
    var res = await utils.graphQLCall(TOKEN, 'maxlb', query).catch(error => { throw error; } );
    console.log('Stats - Requête GitHub réussie !');
    return res;
}

exports.getStat = getStat;