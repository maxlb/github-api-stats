var utils = require('./utils')

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
                var myPL = repo.node.primaryLanguage.name;
                var indexPL = listLanguages.indexOf(myPL);
        
                if (indexPL >= 0) {
                    listUsage[indexPL] +=1;
                } else {
                    listLanguages.push(myPL);
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