# Architecture des Bases de Données - Keycloak et MongoDB

## Vue d'Ensemble

Dans cette architecture, il y a **DEUX bases de données SÉPARÉES** qui servent des objectifs différents :

### 1. Base de Données Keycloak (Interne)
**Stockage** : Fichiers locaux (`KC_DB: dev-file`)  
**Objectif** : Gestion de l'authentification et des identités  
**Contenu** :
- Utilisateurs et leurs credentials (mots de passe hashés)
- Rôles et permissions
- Clients OAuth2/OIDC
- Sessions et tokens
- Configuration du realm

**Configuration actuelle** :
```yaml
# docker-compose.yml
keycloak:
  environment:
    KC_DB: dev-file  # Base de données fichier pour développement
```

**Important** : Keycloak gère sa PROPRE base de données. Elle n'est PAS connectée à MongoDB.

### 2. Base de Données MongoDB
**Stockage** : MongoDB 7.0 (conteneur Docker)  
**Objectif** : Données métier de l'application  
**Contenu** :
- Profils utilisateurs détaillés (AppUser, Driver, Passenger)
- Réservations (Bookings)
- Courses (Rides)
- Avis (Reviews)
- Signalements (Reports)
- Notifications

**Configuration** :
```yaml
# docker-compose.yml
mongodb:
  image: mongo:7.0
  ports:
    - "27017:27017"
```

---

## Architecture Complète

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Postman/App)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 1. POST /api/auth/register
                         │    (email, password, userType, etc.)
                         ▼
          ┌──────────────────────────────────────┐
          │   Authentication Service (8081)       │
          │   KeycloakService.registerUser()     │
          └──────────┬───────────────────┬────────┘
                     │                   │
                     │                   │
      ┌──────────────▼─────┐   ┌────────▼──────────────┐
      │  MongoDB (27017)   │   │  Keycloak (8080)      │
      │  ================  │   │  ==================   │
      │                    │   │                       │
      │  Crée AppUser:     │   │  Crée User:          │
      │  - id              │   │  - username (email)  │
      │  - email           │   │  - password (hashé)  │
      │  - phoneNumber     │   │  - roles             │
      │  - userType        │   │  - enabled           │
      │  - preferences     │   │                      │
      │  - etc.            │   │  Stocké dans:        │
      │                    │   │  dev-file DB         │
      │  Collection:       │   │  (Keycloak interne)  │
      │  users             │   │                      │
      └────────────────────┘   └──────────────────────┘
             │                           │
             │                           │
             │                           │
             └───────────────┬───────────┘
                             │
                             │ 2. POST /api/auth/token
                             │    (username, password)
                             ▼
          ┌──────────────────────────────────────┐
          │   Authentication Service (8081)       │
          │   KeycloakService.getToken()         │
          └──────────┬───────────────────┬────────┘
                     │                   │
      ┌──────────────▼─────┐   ┌────────▼──────────────┐
      │  MongoDB           │   │  Keycloak             │
      │  Recherche user    │   │  Valide credentials   │
      │  par email pour    │   │  Génère JWT token     │
      │  infos complètes   │   │  avec rôles          │
      └────────────────────┘   └──────────────────────┘
                     │                   │
                     │                   │
                     └──────────┬────────┘
                                │
                                ▼
                  ┌──────────────────────────┐
                  │  Réponse:                │
                  │  {                       │
                  │    access_token: "...",  │
                  │    user: {...},          │
                  │    status: "success"     │
                  │  }                       │
                  └──────────────────────────┘
```

---

## Flux Détaillé : Enregistrement d'un Utilisateur

### Étape 1 : Création dans MongoDB
```java
// KeycloakService.java - ligne 43-44
AppUser appUser = authenticationService.createAccount(request);
```

**Ce qui se passe** :
- Crée un document dans MongoDB collection `users`
- Contient TOUTES les données métier (téléphone, préférences, etc.)
- Retourne un ID MongoDB

### Étape 2 : Création dans Keycloak
```java
// KeycloakService.java - lignes 46-76
UserRepresentation user = new UserRepresentation();
user.setUsername(request.email());
user.setEmail(request.email());
// ... définir credentials et attributs
keycloak.realm(realm).users().create(user);
```

**Ce qui se passe** :
- Crée un utilisateur dans la base Keycloak interne
- Stocke le mot de passe (hashé par Keycloak)
- Assigne les rôles (PASSENGER, DRIVER, ADMIN)
- Stocke l'ID MongoDB comme attribut personnalisé

### Résultat
**Deux entrées séparées** :
1. **Dans MongoDB** : Profil utilisateur complet
2. **Dans Keycloak** : Credentials et authentification

---

## Flux Détaillé : Connexion (Obtention de Token)

### Étape 1 : Authentification Keycloak
```java
// KeycloakService.java - lignes 119-133
String tokenUrl = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";
// POST avec username/password
ResponseEntity<Map> response = restTemplate.exchange(tokenUrl, ...);
```

**Ce qui se passe** :
- Keycloak vérifie username/password dans SA base de données
- Si valide, génère un JWT token signé
- Token contient les rôles de l'utilisateur

### Étape 2 : Enrichissement avec MongoDB
```java
// KeycloakService.java - lignes 137-142
AppUser user = authenticationService.getUserByEmail(username);
result.put("user", user);
```

**Ce qui se passe** :
- Récupère le profil complet depuis MongoDB
- Ajoute ces infos à la réponse
- Retourne token + profil utilisateur

---

## Pourquoi Deux Bases de Données ?

### Séparation des Responsabilités

| Aspect | Keycloak DB | MongoDB |
|--------|-------------|---------|
| **Objectif** | Authentification & Autorisation | Données métier |
| **Contenu** | Credentials, rôles, sessions | Profils, bookings, rides |
| **Optimisée pour** | Sécurité, validation rapide | Flexibilité, requêtes complexes |
| **Gérée par** | Keycloak (automatique) | Microservices |
| **Accès** | Via Keycloak Admin API | Via Spring Data MongoDB |

### Avantages

1. **Sécurité** : Les mots de passe sont isolés dans Keycloak
2. **Scalabilité** : Keycloak peut gérer des millions d'authentifications
3. **Flexibilité** : MongoDB peut stocker des données riches et variées
4. **Standards** : Keycloak suit OAuth2/OIDC
5. **Maintenance** : Chaque base a son cycle de vie propre

---

## Configuration Actuelle

### Développement (docker-compose.yml)

**Keycloak** :
```yaml
environment:
  KC_DB: dev-file  # Base fichier pour dev
```
- Stockage : Fichiers dans le conteneur
- Perte de données au redémarrage : OUI
- Performance : Correcte pour dev

**MongoDB** :
```yaml
volumes:
  - mongodb-data:/data/db  # Volume persistant
```
- Stockage : Volume Docker persistant
- Perte de données au redémarrage : NON
- Performance : Excellente

### Production Recommandée

**Keycloak** devrait utiliser PostgreSQL :
```yaml
environment:
  KC_DB: postgres
  KC_DB_URL: jdbc:postgresql://db-host:5432/keycloak
  KC_DB_USERNAME: keycloak
  KC_DB_PASSWORD: secure-password
```

**MongoDB** resterait identique (avec authentification activée).

---

## Synchronisation des Données

### Lors de l'Enregistrement
```
User Input → Authentication Service
                │
                ├─→ MongoDB (données métier)
                │      └─→ Retourne mongoUserId
                │
                └─→ Keycloak (credentials)
                       └─→ Stocke mongoUserId comme attribut
```

### Lors de la Connexion
```
Credentials → Keycloak → Valide → Génère JWT
                                     │
                                     └─→ JWT contient:
                                         - sub (Keycloak user ID)
                                         - email
                                         - roles
                                         
MongoDB userId ← Recherche par email ← Authentication Service
```

---

## Liens dans le Code

### 1. Enregistrement (Synchronisation)
**Fichier** : `KeycloakService.java`

```java
// Ligne 43-44 : Créer dans MongoDB
AppUser appUser = authenticationService.createAccount(request);

// Lignes 60-67 : Lier les IDs
Map<String, List<String>> attributes = new HashMap<>();
attributes.put("userId", Collections.singletonList(appUser.getId()));
// ... autres attributs
user.setAttributes(attributes);

// Ligne 73-82 : Créer dans Keycloak avec attributs
var response = keycloak.realm(realm).users().create(user);
```

### 2. Authentification (Récupération)
**Fichier** : `KeycloakService.java`

```java
// Lignes 133-134 : Authentification Keycloak
ResponseEntity<Map> response = restTemplate.exchange(tokenUrl, ...);

// Lignes 137-142 : Enrichissement MongoDB
AppUser user = authenticationService.getUserByEmail(username);
result.put("user", user);
```

---

## Requêtes Exemples

### Vérifier Keycloak
```bash
# Voir les utilisateurs dans Keycloak
# Via console: http://localhost:8080 → Realm: wassalni-realm → Users
```

### Vérifier MongoDB
```bash
# Se connecter à MongoDB
docker exec -it mongodb mongosh

# Utiliser la base
use wassalni

# Voir les utilisateurs
db.users.find().pretty()

# Rechercher par email
db.users.find({email: "passenger@wassalni.com"})
```

---

## Résumé

**Question** : "Où est la liaison entre Keycloak et la base de données ?"

**Réponse** :

1. **Il n'y a PAS de liaison directe** entre Keycloak et MongoDB
2. **Keycloak a SA PROPRE base de données** (dev-file en dev, PostgreSQL en prod)
3. **La liaison se fait au niveau applicatif** via le service d'authentification :
   - Lors de l'enregistrement : crée dans les DEUX bases
   - Lors de la connexion : interroge les DEUX bases
4. **L'ID MongoDB est stocké comme attribut** dans Keycloak pour le lien

**Architecture** : Deux bases indépendantes, synchronisées par le code applicatif.

---

## Diagramme Simplifié

```
┌─────────────────────────────────────────────────┐
│           Keycloak Container                    │
│  ┌──────────────────────────────────┐          │
│  │  Keycloak DB (dev-file)          │          │
│  │  - Users (auth)                  │          │
│  │  - Passwords (hashed)            │          │
│  │  - Roles                         │          │
│  │  - Attributs (mongoUserId, etc.) │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
                    ↕ HTTP API
┌─────────────────────────────────────────────────┐
│      Authentication Service (8081)              │
│      - KeycloakService                          │
│      - AuthenticationService                    │
└─────────────────────────────────────────────────┘
                    ↕ MongoDB Driver
┌─────────────────────────────────────────────────┐
│           MongoDB Container                     │
│  ┌──────────────────────────────────┐          │
│  │  wassalni Database               │          │
│  │  - users (profils complets)      │          │
│  │  - bookings                      │          │
│  │  - rides                         │          │
│  │  - reviews                       │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

**Pas de flèche directe** entre Keycloak DB et MongoDB → c'est le service d'authentification qui fait le pont.
