# Guide de Déploiement avec Keycloak

Ce guide explique comment déployer et configurer Keycloak pour l'authentification des microservices Wassalni.

## Prérequis

- Docker et Docker Compose installés
- Java 21
- Maven 3.x
- Ports disponibles : 8080 (Keycloak), 8081-8089 (Microservices), 27017 (MongoDB)

## Étape 1 : Démarrage de Keycloak et MongoDB

### 1.1 Lancer les services avec Docker Compose

```bash
# À la racine du projet
docker-compose up -d
```

Cette commande démarre :
- **Keycloak** sur le port 8080
- **MongoDB** sur le port 27017

### 1.2 Vérifier que Keycloak fonctionne

Attendez environ 30-60 secondes que Keycloak démarre complètement.

```bash
# Vérifier les logs de Keycloak
docker logs keycloak

# Vérifier que Keycloak répond
curl http://localhost:8080/health/ready
```

### 1.3 Accéder à la console d'administration Keycloak

Ouvrez votre navigateur et accédez à :
- **URL** : http://localhost:8080
- **Username** : admin
- **Password** : admin

## Étape 2 : Vérification de la Configuration Keycloak

### 2.1 Vérifier le Realm

1. Connectez-vous à la console d'administration Keycloak
2. Dans le menu déroulant en haut à gauche, sélectionnez **"wassalni-realm"**
3. Vous devriez voir le realm configuré avec :
   - Nom : wassalni-realm
   - Enabled : ON

### 2.2 Vérifier le Client

1. Dans le menu de gauche, cliquez sur **"Clients"**
2. Vous devriez voir le client **"wassalni-app"**
3. Cliquez dessus pour voir les détails :
   - Client ID : wassalni-app
   - Client authentication : ON
   - Standard flow enabled : ON
   - Direct access grants enabled : ON

### 2.3 Vérifier les Rôles

1. Dans le menu de gauche, cliquez sur **"Realm roles"**
2. Vous devriez voir les rôles suivants :
   - PASSENGER
   - DRIVER
   - ADMIN

### 2.4 Vérifier les Utilisateurs de Test

1. Dans le menu de gauche, cliquez sur **"Users"**
2. Vous devriez voir 3 utilisateurs :
   - **passenger1** (email: passenger@wassalni.com, password: password123)
   - **driver1** (email: driver@wassalni.com, password: password123)
   - **admin** (email: admin@wassalni.com, password: admin123)

## Étape 3 : Démarrage des Microservices

### 3.1 Ordre de démarrage recommandé

1. **Eureka Server** (Service de découverte)
```bash
cd microservices/eureka-server\(8083\)
mvn spring-boot:run
```

2. **Authentication Service**
```bash
cd microservices/authentication-service\(8081\)
mvn spring-boot:run
```

3. **Gateway Service**
```bash
cd microservices/gateway-service\(8084\)
mvn spring-boot:run
```

4. **Autres microservices** (dans n'importe quel ordre)
```bash
# Booking Service
cd microservices/booking-service\(8082\)
mvn spring-boot:run

# Review Service
cd microservices/review-service\(8086\)
mvn spring-boot:run

# Ride Service
cd microservices/ride-service\(8085\)
mvn spring-boot:run

# Report Service
cd microservices/report-service\(8087\)
mvn spring-boot:run

# Notifications Service
cd microservices/notifications-service\(8088\)
mvn spring-boot:run
```

### 3.2 Vérifier le démarrage des services

Accédez au dashboard Eureka pour voir tous les services enregistrés :
- **URL** : http://localhost:8083

Vous devriez voir tous les microservices listés sous "Instances currently registered with Eureka".

## Étape 4 : Test de la Configuration

### 4.1 Obtenir un token JWT

```bash
curl -X POST http://localhost:8081/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "passenger@wassalni.com",
    "password": "password123"
  }'
```

Réponse attendue :
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 3600,
  "refresh_expires_in": 1800,
  "token_type": "Bearer",
  "user": {
    "id": "...",
    "email": "passenger@wassalni.com",
    ...
  },
  "status": "success"
}
```

### 4.2 Utiliser le token pour accéder aux microservices

```bash
# Remplacez <TOKEN> par le access_token reçu
curl -X GET http://localhost:8084/booking-service/api/bookings \
  -H "Authorization: Bearer <TOKEN>"
```

## Dépannage

### Keycloak ne démarre pas

```bash
# Vérifier les logs
docker logs keycloak

# Redémarrer Keycloak
docker-compose restart keycloak
```

### Les microservices ne peuvent pas se connecter à Keycloak

1. Vérifiez que Keycloak est accessible : `curl http://localhost:8080`
2. Vérifiez la configuration dans `application.properties` de chaque service
3. Assurez-vous que le realm "wassalni-realm" existe dans Keycloak

### Erreur "Invalid token"

1. Vérifiez que le token n'a pas expiré (validité : 1 heure)
2. Obtenez un nouveau token si nécessaire
3. Vérifiez que vous utilisez le bon format : `Authorization: Bearer <token>`

### MongoDB n'est pas accessible

```bash
# Vérifier que MongoDB fonctionne
docker logs mongodb

# Se connecter à MongoDB pour vérifier
docker exec -it mongodb mongosh
```

## Arrêt des Services

### Arrêter Keycloak et MongoDB
```bash
docker-compose down
```

### Arrêter les microservices
Utilisez `Ctrl+C` dans chaque terminal où un microservice s'exécute.

## Configuration Avancée

### Modifier les mots de passe

Pour modifier les mots de passe des utilisateurs :
1. Connectez-vous à la console Keycloak
2. Allez dans Users → Sélectionnez l'utilisateur → Credentials
3. Cliquez sur "Set password"

### Ajouter de nouveaux utilisateurs

1. Dans la console Keycloak, allez dans Users
2. Cliquez sur "Add user"
3. Remplissez les informations requises
4. Dans l'onglet "Credentials", définissez un mot de passe
5. Dans l'onglet "Role mapping", assignez les rôles appropriés

### Configurer les URL de redirection

Si vous déployez sur un serveur distant :
1. Allez dans Clients → wassalni-app
2. Modifiez "Valid redirect URIs" pour inclure vos URLs
3. Modifiez "Web origins" si nécessaire
4. Sauvegardez les modifications

## Support

Pour toute question ou problème, consultez :
- Documentation Keycloak : https://www.keycloak.org/documentation
- Logs des services : Vérifiez les logs de chaque microservice et de Keycloak
