var utils = require('./utils')

const asyncForEach = async(array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
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

var getNbMembres = async function(token, orga, login) {
    var query = `query {
                    organization(login: "${orga}") {
                        membersWithRole(first: 1) {
                            totalCount
                        }
                    }
                }`;

    var res = await utils.graphQLCall(token, login, query).catch(error => { throw error; } );

    var jsonRes = {
        organization: orga,
        countMembers: res.data.organization.membersWithRole.totalCount
    };
    
    console.log('Stats - Renvoi JSON réussi !');
    return jsonRes;
}

var getNbRepositories = async function(token, orga, login) {
    var query = `query {
                    organization(login: "${orga}") {
                        repositories {
                            totalCount
                        }
                    }
                }`;

    var res = await utils.graphQLCall(token, login, query).catch(error => { throw error; } );

    var jsonRes = {
        organization: orga,
        countRepositories: res.data.organization.repositories.totalCount
    };
    
    console.log('Stats - Renvoi JSON réussi !');
    return jsonRes;
}

var getPopulareLanguages = async function(token, orga, login) {

    var listLanguages = [];
    var listUsage = [];
    var hasNextPage = true;
    var curseur = "";

    while(hasNextPage) {

        // Requête
        var query = `query {
            organization(login: "${orga}") {
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
        var res = await utils.graphQLCall(token, login, query).catch(error => { throw error; } );
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
        organization: orga,
        langages: listLanguages,
        nbRepositories: listUsage
    };
    
    console.log('Stats - Renvoi JSON réussi !');
    return jsonRes;
}

var getMembresPROnPopulareRepo = async function(token, orga, login) {

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
            organization(login: "${orga}") {
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
        var res = await utils.graphQLCall(token, login, query).catch(error => { throw error; } );
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
            var res = await utils.graphQLCall(token, login, query).catch(error => { throw error; } );
            res.data.user.pullRequests.edges.forEach(PR => {
                if (PR.node.repository.stargazers.totalCount >= 1000 && PR.node.repository.owner.login != orga) {
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
        listPopularePR.push(memberPopularePR);
    })
    
    console.log('Stats - Renvoi JSON réussi !');
    return listPopularePR;
}



var getBasicStats = async function(token, orga) {
    var query = `query {
                    organization(login: "${orga}") { 
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

    
    var res = await utils.graphQLCall(token, 'maxlb', query).catch(error => { throw error; } );
    console.log('Stats - Requête GitHub réussie !');
    return res;
}

exports.getBasicStats = getBasicStats;
exports.getNbMembres = getNbMembres;
exports.getNbRepositories = getNbRepositories;
exports.getPopulareLanguages = getPopulareLanguages;
exports.getMembresPROnPopulareRepo = getMembresPROnPopulareRepo;