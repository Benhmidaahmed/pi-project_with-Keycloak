# Migration vers Keycloak - Wassalni Microservices

Ce document décrit la migration complète de l'authentification des microservices Wassalni vers Keycloak.

## Vue d'Ensemble

Le projet Wassalni est une plateforme de covoiturage composée de plusieurs microservices. Cette migration remplace le système d'authentification personnalisé par Keycloak, une solution d'authentification moderne et sécurisée basée sur OAuth2 et OpenID Connect.

## Architecture

### Microservices du Projet

1. **eureka-server** (8083) - Service de découverte
2. **authentication-service** (8081) - Gestion de l'authentification avec Keycloak
3. **gateway-service** (8084) - API Gateway avec validation JWT
4. **booking-service** (8082) - Gestion des réservations
5. **ride-service** (8085) - Gestion des courses
6. **review-service** (8086) - Gestion des avis
7. **report-service** (8087) - Gestion des signalements
8. **notifications-service** (8088) - Gestion des notifications

### Flux d'Authentification

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────>│  Keycloak    │────────>│ Auth Service│
│  (Postman)  │<────────│  (Port 8080) │<────────│ (Port 8081) │
└─────────────┘  Token  └──────────────┘  User   └─────────────┘
                                           Info
      │                                             
      │ Token JWT                                   
      ▼                                             
┌─────────────┐         ┌──────────────┐
│   Gateway   │────────>│ Microservices│
│ (Port 8084) │  Valid  │ (8082-8088)  │
└─────────────┘  Token  └──────────────┘
```

## Changements Effectués

### 1. Configuration Keycloak

#### Realm : wassalni-realm
Configuration d'un realm dédié avec :
- Durée de vie des tokens : 1 heure
- Support du flux "Direct Access Grants" pour les authentifications par mot de passe
- Support du refresh token

#### Client : wassalni-app
- Type : Confidentiel
- Client Secret : `wassalni-secret-key-2024`
- Redirections autorisées : `http://localhost:*`
- Grant types : password, refresh_token

#### Rôles Définis
1. **PASSENGER** - Utilisateurs passagers
2. **DRIVER** - Chauffeurs
3. **ADMIN** - Administrateurs

#### Utilisateurs de Test
- **passenger@wassalni.com** / password123 (Rôle: PASSENGER)
- **driver@wassalni.com** / password123 (Rôle: DRIVER)
- **admin@wassalni.com** / admin123 (Rôle: ADMIN)

### 2. Modifications du Code

#### Authentication Service (8081)

**Dépendances ajoutées** :
- `spring-boot-starter-oauth2-resource-server`
- `spring-boot-starter-oauth2-client`
- `keycloak-admin-client`

**Nouvelles classes** :
- `SecurityConfig` - Configuration Spring Security avec validation JWT
- `KeycloakConfig` - Configuration du client admin Keycloak
- `KeycloakService` - Service pour interagir avec Keycloak

**Endpoints modifiés** :
- `POST /api/auth/register` - Enregistrement avec création dans Keycloak
- `POST /api/auth/token` - Obtention de token JWT depuis Keycloak

**Endpoints dépréciés** (compatibilité rétrograde) :
- `POST /api/auth/createAccount` - Ancienne méthode de création de compte
- `POST /api/auth/authenticate` - Ancienne méthode d'authentification

#### Gateway Service (8084)

**Dépendances ajoutées** :
- `spring-boot-starter-oauth2-resource-server`

**Nouvelles classes** :
- `SecurityConfig` - Configuration WebFlux Security pour validation JWT

**Configuration** :
- Validation automatique des tokens JWT sur toutes les requêtes
- Endpoints publics : `/authentication-service/api/auth/token`, `/authentication-service/api/auth/register`

#### Autres Microservices (8082, 8085-8088)

Pour chaque microservice :

**Dépendances ajoutées** :
- `spring-boot-starter-oauth2-resource-server`

**Nouvelles classes** :
- `config/SecurityConfig` - Configuration de sécurité standardisée

**Configuration** :
- Validation JWT sur tous les endpoints (sauf `/actuator/**`)
- Extraction des rôles depuis `realm_access.roles`

### 3. Configuration Docker

**Fichier docker-compose.yml** :
- Keycloak 23.0.0 avec mode développement
- MongoDB 7.0 pour la persistance
- Import automatique de la configuration realm
- Réseau partagé `wassalni-network`

### 4. Documentation

Trois guides complets ont été créés :
1. **DEPLOYMENT.md** - Guide de déploiement
2. **POSTMAN_GUIDE.md** - Guide de test avec Postman
3. **README_KEYCLOAK.md** - Ce fichier

## Sécurité

### Améliorations de Sécurité

1. **Tokens JWT signés** : Utilisation de RS256 pour signer les tokens
2. **Tokens à durée limitée** : 1 heure de validité
3. **Refresh tokens** : Permet de renouveler les tokens sans re-authentification
4. **Validation centralisée** : Tous les microservices valident les tokens via Keycloak
5. **Rôles et permissions** : Système de rôles géré par Keycloak
6. **Sessions stateless** : Pas de session serveur, uniquement des tokens

### Configuration de Sécurité par Service

Tous les microservices (sauf Eureka) utilisent :
- `SessionCreationPolicy.STATELESS` - Pas de sessions
- Validation JWT obligatoire sur tous les endpoints protégés
- CSRF désactivé (car stateless)
- Extraction automatique des rôles depuis le token

## Migration des Données

### Utilisateurs Existants

Les utilisateurs existants dans MongoDB ne sont pas automatiquement migrés vers Keycloak. Deux options :

**Option 1 : Migration manuelle**
1. Exporter les utilisateurs depuis MongoDB
2. Créer les utilisateurs dans Keycloak via l'API Admin
3. Assigner les rôles appropriés

**Option 2 : Double authentification temporaire**
1. Garder l'ancien système en parallèle
2. Demander aux utilisateurs de se réenregistrer
3. Migrer progressivement

### Script de Migration (À implémenter)

```java
// Exemple de script de migration
public void migrateUsersToKeycloak() {
    List<AppUser> users = userRepository.findAll();
    for (AppUser user : users) {
        keycloakService.createUser(user);
    }
}
```

## Tests

### Tests Manuels Recommandés

1. **Test d'enregistrement** : Créer un nouveau compte
2. **Test d'authentification** : Obtenir un token JWT
3. **Test d'accès** : Accéder aux microservices avec le token
4. **Test d'expiration** : Vérifier l'expiration du token après 1 heure
5. **Test de refresh** : Rafraîchir le token
6. **Test de rôles** : Vérifier que les rôles sont correctement appliqués

### Tests de Sécurité

1. Tentative d'accès sans token → 401 Unauthorized
2. Tentative avec token invalide → 401 Unauthorized
3. Tentative avec token expiré → 401 Unauthorized
4. Accès avec mauvais rôle → 403 Forbidden (si configuré)

## Déploiement en Production

### Checklist Pré-Déploiement

- [ ] Changer les mots de passe par défaut (admin/admin)
- [ ] **IMPORTANT** : Changer le client secret dans `keycloak-config/realm-export.json` et dans les fichiers `application.properties` de tous les microservices
- [ ] Configurer HTTPS pour Keycloak
- [ ] Configurer SSL/TLS pour les connexions
- [ ] Activer `sslRequired: external` dans le realm
- [ ] Configurer une base de données PostgreSQL pour Keycloak (au lieu de dev-file)
- [ ] Configurer des redirections appropriées pour l'environnement de production
- [ ] Activer la force brute protection
- [ ] Configurer les logs et le monitoring
- [ ] Sauvegarder régulièrement la configuration Keycloak

### Variables d'Environnement pour Production

```properties
# Keycloak
KEYCLOAK_SERVER_URL=https://keycloak.votredomaine.com
KEYCLOAK_REALM=wassalni-realm
KEYCLOAK_CLIENT_ID=wassalni-app
KEYCLOAK_CLIENT_SECRET=<VOTRE_SECRET_SECURISE>  # Générez un secret fort avec: openssl rand -base64 32

# Base de données Keycloak (PostgreSQL recommandé)
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=<MOT_DE_PASSE_SECURISE>
```

### Générer un Secret Sécurisé pour Production

```bash
# Générer un client secret fort
openssl rand -base64 32

# Ou utiliser UUID
uuidgen
```

## Maintenance

### Gestion des Utilisateurs

Via la console Keycloak :
1. Créer/modifier/supprimer des utilisateurs
2. Réinitialiser les mots de passe
3. Gérer les rôles et permissions
4. Voir les sessions actives
5. Consulter les logs d'authentification

### Mise à Jour de Keycloak

Pour mettre à jour Keycloak :
1. Sauvegarder la configuration actuelle (Export realm)
2. Arrêter Keycloak : `docker-compose down`
3. Modifier la version dans `docker-compose.yml`
4. Démarrer : `docker-compose up -d`
5. Vérifier que tout fonctionne

### Surveillance

Points à surveiller :
- Temps de réponse de Keycloak
- Taux d'erreurs d'authentification
- Tentatives de connexion échouées (brute force)
- Utilisation mémoire/CPU de Keycloak
- Taille de la base de données

## Dépannage

### Problèmes Courants

**1. "Unable to connect to Keycloak"**
- Vérifier que Keycloak est démarré
- Vérifier l'URL de Keycloak dans la configuration
- Vérifier que le port 8080 est accessible

**2. "Invalid token"**
- Vérifier que le token n'a pas expiré
- Vérifier que l'issuer URI est correct
- Vérifier que la clé publique est accessible

**3. "Client not found"**
- Vérifier que le client_id est correct
- Vérifier que le realm est correct
- Vérifier que le client existe dans Keycloak

**4. "Unauthorized"**
- Vérifier que le token est inclus dans le header
- Vérifier le format : `Bearer <token>`
- Vérifier que le token est valide

## Ressources

- [Documentation Keycloak](https://www.keycloak.org/documentation)
- [Spring Security OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
- [JWT.io](https://jwt.io) - Pour décoder les tokens
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement
- [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) - Guide de test

## Contributeurs

Migration réalisée dans le cadre du projet PI - Wassalni.

## Licence

Conforme à la licence du projet principal.
