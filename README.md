# Calcul de statistiques pour une organisation GitHub

## Statistiques diverses
  - URL : /**basicStats**/*{TOKEN_GIT}*/*{LOGIN_GIT}*/*{NOM_ORGANISATION}*
  - Permet d'obtenir toutes les stats de l'organisation.
  
## Nombre de membres
  - URL : /**nbMembresStats**/*{TOKEN_GIT}*/*{LOGIN_GIT}*/*{NOM_ORGANISATION}*
  - Permet d'obtenir le nombre de membres de l'organisation.
  - Retour JSON : 
    ```JSON
    {
      "organization":"NOM_ORGANISATION",
      "countMembers":250
    }
    ```

## Nombre de répertoires
  - URL : /**nbRepoStats**/*{TOKEN_GIT}*/*{LOGIN_GIT}*/*{NOM_ORGANISATION}*
  - Permet d'obtenir le nombre de répertoires de l'organisation.
  - Retour JSON : 
    ```JSON
    {
      "organization":"NOM_ORGANISATION",
      "countRepositories":60
    }
    ```

## Langages utilisés
  - URL : /**populareLanguages**/*{TOKEN_GIT}*/*{LOGIN_GIT}*/*{NOM_ORGANISATION}*
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
  - URL : /**popularePL**/*{TOKEN_GIT}*/*{LOGIN_GIT}*/*{NOM_ORGANISATION}*
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
    Ici, le membre de l'organisation "Bart Lannoeye" a réalisé 22 PR (qui ont été mergées) sur des répertoires externes à l'organisation qui possèdent plus de 1000 étoiles. Parmi eux, le répertoire "dotnet" de "Microsoft" dont le principal langage est "HTML" et qui possède 10691 étoiles où il a réalisé 2 PR aux dates indiquées.
