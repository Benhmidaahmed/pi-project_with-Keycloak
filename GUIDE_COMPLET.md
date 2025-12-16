# 🚀 Migration Keycloak - Guide Complet

Ce document est le point d'entrée principal pour comprendre et utiliser la migration de l'authentification vers Keycloak.

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Démarrage Rapide](#démarrage-rapide)
3. [Architecture](#architecture)
4. [Guides Détaillés](#guides-détaillés)
5. [Sécurité](#sécurité)
6. [FAQ](#faq)

## 🎯 Vue d'Ensemble

Ce projet implémente une migration complète du système d'authentification des microservices Wassalni vers **Keycloak**, une solution open-source d'Identity and Access Management (IAM).

### Pourquoi Keycloak ?

- ✅ **Standard de l'industrie** : OAuth2 + OpenID Connect
- ✅ **Tokens JWT sécurisés** : Signés avec RS256
- ✅ **Gestion centralisée** : Un seul point pour les utilisateurs et rôles
- ✅ **Scalabilité** : Supporte des milliers d'utilisateurs
- ✅ **Interface d'administration** : Console web complète
- ✅ **Extensions** : MFA, social login, etc.

### Ce qui a été implémenté

#### 1. Infrastructure ⚙️
- **Docker Compose** pour déployer Keycloak + MongoDB
- Configuration automatique via `realm-export.json`
- Réseau isolé pour les services

#### 2. Code 💻
- **7 microservices** sécurisés avec validation JWT
- Service d'authentification intégré avec Keycloak Admin API
- Gateway avec validation centralisée des tokens
- Sessions stateless (pas de cookies)

#### 3. Documentation 📚
- Guide de déploiement complet
- Guide de test Postman avec exemples
- Analyse de sécurité
- Collection Postman prête à l'emploi

## 🚀 Démarrage Rapide

### Prérequis
```bash
# Vérifier les installations
docker --version          # >= 20.x
docker-compose --version  # >= 2.x
java -version            # = 17
mvn --version            # >= 3.6
```

### En 5 minutes

```bash
# 1. Démarrer Keycloak et MongoDB
docker-compose up -d

# 2. Vérifier que Keycloak est prêt (attendre ~30s)
curl http://localhost:8080/health/ready

# 3. Démarrer Eureka Server
cd microservices/eureka-server\(8083\)
mvn spring-boot:run &

# 4. Démarrer Authentication Service
cd ../authentication-service\(8081\)
mvn spring-boot:run &

# 5. Tester l'authentification
curl -X POST http://localhost:8081/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "passenger@wassalni.com",
    "password": "password123"
  }'
```

**Vous devriez recevoir** : Un objet JSON avec `access_token`, `refresh_token`, et les infos utilisateur.

### Accéder à Keycloak

1. Ouvrir http://localhost:8080
2. Se connecter avec `admin` / `admin`
3. Sélectionner le realm `wassalni-realm`
4. Explorer Users, Roles, Clients

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Postman/Frontend)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. POST /api/auth/token
                         ▼
          ┌──────────────────────────────┐
          │  Authentication Service      │
          │  (Port 8081)                 │
          └──────────┬───────────────────┘
                     │
                     │ 2. Validate credentials
                     │    Get JWT token
                     ▼
          ┌──────────────────────────────┐
          │      Keycloak Server         │
          │      (Port 8080)             │
          │  - Validate user             │
          │  - Generate JWT (RS256)      │
          │  - Return token              │
          └──────────────────────────────┘
                     │
                     │ 3. JWT Token
                     ▼
┌────────────────────────────────────────────────────────────┐
│                   CLIENT gets token                         │
│  {                                                          │
│    "access_token": "eyJhbGc...",                           │
│    "expires_in": 3600,                                      │
│    "user": {...}                                            │
│  }                                                          │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 4. Authorization: Bearer <token>
                     ▼
          ┌──────────────────────────────┐
          │    API Gateway               │
          │    (Port 8084)               │
          │  - Validate JWT              │
          │  - Extract roles             │
          │  - Route request             │
          └──────────┬───────────────────┘
                     │
                     │ 5. Validated request
                     ▼
     ┌───────────────────────────────────────────┐
     │          Microservices Layer              │
     ├───────────┬──────────┬──────────┬─────────┤
     │ Booking   │ Ride     │ Review   │ Report  │
     │ (8082)    │ (8085)   │ (8086)   │ (8087)  │
     └───────────┴──────────┴──────────┴─────────┘
                     │
                     │ 6. Access MongoDB
                     ▼
          ┌──────────────────────────────┐
          │       MongoDB                │
          │       (Port 27017)           │
          └──────────────────────────────┘
```

### Flux d'Authentification Détaillé

1. **Enregistrement** : `POST /api/auth/register`
   - Création dans MongoDB (via AuthenticationService)
   - Création dans Keycloak (via KeycloakService)
   - Attribution du rôle (PASSENGER ou DRIVER)

2. **Connexion** : `POST /api/auth/token`
   - AuthenticationService contacte Keycloak
   - Keycloak valide les credentials
   - Retourne un JWT signé (RS256)
   - Inclut les rôles dans le token

3. **Accès API** : `GET /booking-service/api/bookings`
   - Client envoie `Authorization: Bearer <token>`
   - Gateway valide le JWT avec la clé publique Keycloak
   - Extrait les rôles du claim `realm_access.roles`
   - Route la requête vers le microservice
   - Le microservice valide aussi le JWT (défense en profondeur)

## 📖 Guides Détaillés

### 🔧 [DEPLOYMENT.md](./DEPLOYMENT.md)
Guide complet de déploiement avec :
- Configuration Docker
- Démarrage des services
- Vérification de Keycloak
- Dépannage

### 🧪 [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
Guide de test avec :
- Configuration Postman
- Collection prête à l'emploi
- Exemples de requêtes
- Tests de sécurité

### 📘 [README_KEYCLOAK.md](./README_KEYCLOAK.md)
Documentation technique complète :
- Architecture détaillée
- Modifications du code
- Configuration Keycloak
- Migration des données

### 🔒 [SECURITY.md](./SECURITY.md)
Analyse de sécurité :
- Résultats CodeQL
- Justifications techniques
- Recommandations production
- Checklist sécurité

## 🔒 Sécurité

### ✅ Points Forts

| Aspect | Implémentation |
|--------|----------------|
| **Algorithme JWT** | RS256 (clé asymétrique) |
| **Durée token** | 1 heure (configurable) |
| **Refresh token** | Oui, 30 minutes |
| **Validation** | Centralisée via Keycloak |
| **Rôles** | RBAC via realm_access.roles |
| **Sessions** | Stateless (pas de cookies) |
| **CSRF** | Non applicable (JWT stateless) |

### ⚠️ Production

**AVANT DE DÉPLOYER EN PRODUCTION** :

```bash
# 1. Générer un nouveau client secret
openssl rand -base64 32

# 2. Mettre à jour dans Keycloak Console
# Clients → wassalni-app → Credentials → Regenerate Secret

# 3. Mettre à jour dans les microservices
# Via variables d'environnement, PAS dans le code !
export KEYCLOAK_CLIENT_SECRET="votre-nouveau-secret"

# 4. Activer HTTPS
# Configurer SSL/TLS sur Keycloak et tous les services

# 5. Base de données production
# Utiliser PostgreSQL pour Keycloak au lieu de dev-file
```

Voir [SECURITY.md](./SECURITY.md) pour la checklist complète.

## 🧪 Tester la Migration

### Test 1 : Obtenir un Token

```bash
curl -X POST http://localhost:8081/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "passenger@wassalni.com",
    "password": "password123"
  }'
```

**Résultat attendu** : HTTP 200 avec `access_token`

### Test 2 : Utiliser le Token

```bash
# Remplacer <TOKEN> par le access_token reçu
curl -X GET http://localhost:8084/booking-service/api/bookings \
  -H "Authorization: Bearer <TOKEN>"
```

**Résultat attendu** : HTTP 200 avec la liste des bookings (ou 200 avec liste vide)

### Test 3 : Token Invalide

```bash
curl -X GET http://localhost:8084/booking-service/api/bookings \
  -H "Authorization: Bearer invalid-token"
```

**Résultat attendu** : HTTP 401 Unauthorized

### Test 4 : Sans Token

```bash
curl -X GET http://localhost:8084/booking-service/api/bookings
```

**Résultat attendu** : HTTP 401 Unauthorized

## 👥 Utilisateurs de Test

| Email | Mot de passe | Rôle | Utilisation |
|-------|-------------|------|-------------|
| passenger@wassalni.com | password123 | PASSENGER | Tests passager |
| driver@wassalni.com | password123 | DRIVER | Tests chauffeur |
| admin@wassalni.com | admin123 | ADMIN | Tests admin |

## 🔧 Dépannage

### Keycloak ne démarre pas

```bash
# Vérifier les logs
docker logs keycloak

# Redémarrer
docker-compose restart keycloak

# Recréer si nécessaire
docker-compose down
docker-compose up -d
```

### "Connection refused" sur 8080

```bash
# Attendre que Keycloak soit prêt
curl http://localhost:8080/health/ready

# Vérifier que le port est ouvert
netstat -an | grep 8080
```

### "Invalid token"

1. Le token a peut-être expiré (validité : 1 heure)
2. Obtenez un nouveau token
3. Vérifiez que vous utilisez le bon format : `Bearer <token>`

### Erreur de compilation Java

```bash
# Vérifier la version Java
java -version  # Doit être 17

# Nettoyer et recompiler
mvn clean install -DskipTests
```

## 📊 Métriques et Monitoring

### Endpoints de Santé

- Keycloak: http://localhost:8080/health/ready
- Eureka: http://localhost:8083
- Services: http://localhost:808X/actuator/health

### Logs

```bash
# Logs Keycloak
docker logs -f keycloak

# Logs microservices
# Vérifier la sortie console de chaque service
```

## 🎓 Ressources d'Apprentissage

### Documentation Officielle
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Spring Security OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
- [JWT.io](https://jwt.io) - Décodeur JWT

### Tutoriels
- [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [Keycloak with Spring Boot](https://www.baeldung.com/spring-boot-keycloak)

### Outils
- [Postman](https://www.postman.com/) - Tests API
- [JMeter](https://jmeter.apache.org/) - Tests de charge
- [OWASP ZAP](https://www.zaproxy.org/) - Tests de sécurité

## 📞 Support

### En cas de problème

1. **Consulter les logs** : Docker + microservices
2. **Vérifier la documentation** : DEPLOYMENT.md, POSTMAN_GUIDE.md
3. **Tester la configuration** : curl, Postman
4. **Consulter SECURITY.md** : Pour questions de sécurité

### Checklist de Vérification

- [ ] Docker et Docker Compose installés
- [ ] Java 17 configuré
- [ ] Ports 8080-8089 disponibles
- [ ] MongoDB accessible sur 27017
- [ ] Keycloak démarré et accessible
- [ ] Realm "wassalni-realm" importé
- [ ] Services Eureka + Auth démarrés
- [ ] Token obtenu avec succès

## 🎉 Prochaines Étapes

Après avoir migré vers Keycloak, vous pouvez :

1. **Ajouter MFA** : Authentification multi-facteurs
2. **Social Login** : Google, Facebook, GitHub
3. **User Federation** : LDAP, Active Directory
4. **Custom Themes** : Personnaliser l'interface Keycloak
5. **Event Listeners** : Audit logs, notifications
6. **Fine-grained Authorization** : Permissions granulaires

## 📄 Licence

Conforme à la licence du projet principal Wassalni.

---

**Bon développement avec Keycloak ! 🚀**
