# Calcul de statistiques pour une organisation GitHub

## Installation
L'installation est très simple: 
  1. Cloner le dépôt Git en local
  2. Dans le repertoire du clône, installer les modules avec la commande suivante : ```npm i```
  3. Dans le repertoire du clône, lancer le server avec la commande suivante : ```node server```
  4. Les requêtes se font en **POST** sur le port **8080** avec les paramètres suivants :
      * **token** : Il s'agit de votre token developpeur de GitHub.
      * **login** : Il s'agit de votre login GitHub.
      * **orga** : Il s'agit de login GitHub de l'organisation dont vous voulez récupérer les statistiques.
  5. Les retour sont sous la forme suivante : 
      * Si tout se passe bien :
      ```JSON
      {
        "ok":true,
        "data":{ STATISTIQUES }
      }
      ```
      * Si une erreur intervient :
      ```JSON
      {
        "ok":false,
        "error":{ ERREUR }
      }
      ```

## Statistiques diverses
  - URL : /**basicStats**
  - Permet d'obtenir toutes les stats de l'organisation.
  
## Nombre de membres
  - URL : /**nbMembresStats**
  - Permet d'obtenir le nombre de membres de l'organisation.
  - Retour JSON : 
    ```JSON
    {
      "organization":"NOM_ORGANISATION",
      "countMembers":250
    }
    ```

## Nombre de répertoires
  - URL : /**nbRepoStats**
  - Permet d'obtenir le nombre de répertoires de l'organisation.
  - Retour JSON : 
    ```JSON
    {
      "organization":"NOM_ORGANISATION",
      "countRepositories":60
    }
    ```

## Langages utilisés
  - URL : /**populareLanguages**
  - Permet d'obtenir le nombre de répertoires par langages de l'organisation.
  - Retour JSON : 
    ```JSON
    {
      "organization":"NOM_ORGANISATION",
      "langages":["C#","CSS"],
      "nbRepositories":[4,2]
     }
    ```
    Ici, l'organisation possède 4 répertoires dont le langage principal est C# et 2 dont le langage principal est CSS.
  
## PullRequest hors organisation importantes des membres
  - URL : /**popularePL**
  - Permet d'obtenir les membres de l'organisation ayant effectué des PullRequests sur des projets populaires (plus de 1000 étoiles).
  - Retour JSON : 
    ```JSON
    [
      {
        "member":"Bart Lannoeye",
        "login":"bartlannoeye",
        "count":22,
        "popularePL":[
          {
            "repository":{
              "name":"dotnet",
              "owner":"Microsoft",
              "language":"HTML",
              "stars":10691,
              "pullRequests":{
                  "count":2,
                  "mergedDates":["2015-10-30T16:12:00Z","2016-09-07T19:44:12Z"]
              }
            }
          },
          { Autres repositries... }
        ]
      }, 
      { Autres membres... }
    ]
    ```
    Ici, le membre de l'organisation *Bart Lannoeye* a réalisé 22 PR (qui ont été mergées) sur des répertoires externes à l'organisation qui possèdent plus de 1000 étoiles. Parmi eux, le répertoire *dotnet* de *Microsoft* dont le principal langage est *HTML* et qui possède *10691* étoiles où il a réalisé *2* PR aux dates indiquées.
    
 ## Répertoires auxquels la communauté contribue
  - URL : /**populareRepo**
  - Permet d'obtenir les répertoires de l'organisation ayant des contributeurs externes dans ses pull request mergées.
  - Retour JSON : 
    ```JSON
    [
      {
        "name": "Prism",
        "stars": 2843,
        "language": {
          "name": "C#"
        },
        "PRExternes": [
          {
            "date": "2015-08-25T17:14:46Z",
            "nbParticipantsExternes": 1,
            "participantsExternes": [
              {
                "login": "JohnTasler",
                "name": "John Tasler",
                "organizations": [
                  {
                    "name": "Microsoft",
                    "login": "Microsoft"
                  },
                  { Autres organisations... }
                ]
              }
            ]
          },
          { Autres PullRequests... }
        ],
        "nbPRExternes": 396
      },
      { Autres répertoires... }
    ]
    ```
    Ici, le répertoire *Prism* qui a *2843* étoiles et dont le principal langage est *C#* comporte *396* pull requests auxquelles des contributeurs externes ont participés. *John Tasler*, externe à l'organisation (il travaille pour *Microsoft*) à participé à la pull request mergée sur ce répertoire le *25/08/2015*.
