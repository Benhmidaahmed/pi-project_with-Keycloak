# Guide de Test avec Postman

Ce guide explique comment tester les microservices Wassalni avec Keycloak en utilisant Postman.

## Configuration Initiale de Postman

### 1. Créer une nouvelle Collection

1. Ouvrez Postman
2. Cliquez sur **"New Collection"**
3. Nommez-la **"Wassalni Microservices"**

### 2. Configurer les Variables d'Environnement

1. Créez un nouvel environnement nommé **"Wassalni Local"**
2. Ajoutez les variables suivantes :

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8084` | `http://localhost:8084` |
| `auth_url` | `http://localhost:8081` | `http://localhost:8081` |
| `keycloak_url` | `http://localhost:8080` | `http://localhost:8080` |
| `realm` | `wassalni-realm` | `wassalni-realm` |
| `client_id` | `wassalni-app` | `wassalni-app` |
| `client_secret` | `wassalni-secret-key-2024` | `wassalni-secret-key-2024` |
| `access_token` | | |
| `refresh_token` | | |

## Étape 1 : Obtenir un Token JWT depuis Keycloak

### Méthode 1 : Via le Authentication Service (Recommandé)

**Endpoint** : `POST {{auth_url}}/api/auth/token`

**Headers** :
```
Content-Type: application/json
```

**Body** (raw JSON) :
```json
{
  "username": "passenger@wassalni.com",
  "password": "password123"
}
```

**Script de Test** (onglet Tests) :
```javascript
// Sauvegarder le token dans les variables d'environnement
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("refresh_token", jsonData.refresh_token);
    console.log("Token saved successfully!");
}
```

**Réponse Attendue** :
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ij...",
  "expires_in": 3600,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkI...",
  "token_type": "Bearer",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "passenger@wassalni.com",
    "userType": "PASSENGER",
    ...
  },
  "status": "success"
}
```

### Méthode 2 : Directement depuis Keycloak

**Endpoint** : `POST {{keycloak_url}}/realms/{{realm}}/protocol/openid-connect/token`

**Headers** :
```
Content-Type: application/x-www-form-urlencoded
```

**Body** (x-www-form-urlencoded) :
```
grant_type: password
client_id: {{client_id}}
client_secret: {{client_secret}}
username: passenger@wassalni.com
password: password123
```

**Script de Test** :
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("refresh_token", jsonData.refresh_token);
}
```

## Étape 2 : Enregistrer un Nouvel Utilisateur

**Endpoint** : `POST {{auth_url}}/api/auth/register`

**Headers** :
```
Content-Type: application/json
```

**Body** (raw JSON) - Pour un Passager :
```json
{
  "email": "newpassenger@example.com",
  "password": "securePassword123",
  "phoneNumber": "+21612345678",
  "gender": "MALE",
  "userType": "PASSENGER",
  "preferredPaymentMethod": "CASH"
}
```

**Body** (raw JSON) - Pour un Chauffeur :
```json
{
  "email": "newdriver@example.com",
  "password": "securePassword123",
  "phoneNumber": "+21698765432",
  "gender": "FEMALE",
  "userType": "DRIVER",
  "licenseNumber": "DRV987654",
  "vehicleNumber": "VEH456",
  "vehiclePlate": "TUN-5678"
}
```

**Réponse Attendue** :
```json
{
  "userId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "status": "success",
  "message": "User registered successfully. Please login to get your token."
}
```

## Étape 3 : Utiliser le Token pour Accéder aux Microservices

### Configuration Générale pour les Requêtes Protégées

Pour toutes les requêtes suivantes, ajoutez ces headers :

**Headers** :
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 3.1 Booking Service

#### Créer une Réservation

**Endpoint** : `POST {{base_url}}/booking-service/api/bookings`

**Body** :
```json
{
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "driverId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "pickupLocation": "Tunis Centre",
  "dropoffLocation": "Aéroport Tunis-Carthage",
  "scheduledTime": "2024-12-20T10:00:00"
}
```

#### Lister toutes les Réservations

**Endpoint** : `GET {{base_url}}/booking-service/api/bookings`

#### Obtenir une Réservation par ID

**Endpoint** : `GET {{base_url}}/booking-service/api/bookings/{bookingId}`

### 3.2 Ride Service

#### Créer une Course

**Endpoint** : `POST {{base_url}}/ride-service/api/rides`

**Body** :
```json
{
  "bookingId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "startLocation": "Tunis Centre",
  "endLocation": "Aéroport Tunis-Carthage",
  "fare": 25.50
}
```

#### Lister toutes les Courses

**Endpoint** : `GET {{base_url}}/ride-service/api/rides`

### 3.3 Review Service

#### Créer un Avis

**Endpoint** : `POST {{base_url}}/review-service/api/reviews`

**Body** :
```json
{
  "rideId": "65f1a2b3c4d5e6f7g8h9i0j4",
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "rating": 5,
  "comment": "Excellent service, chauffeur très professionnel!"
}
```

#### Lister tous les Avis

**Endpoint** : `GET {{base_url}}/review-service/api/reviews`

### 3.4 Report Service

#### Créer un Signalement

**Endpoint** : `POST {{base_url}}/report-service/api/reports`

**Body** :
```json
{
  "reporterId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "reportedUserId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "reason": "Comportement inapproprié",
  "description": "Le chauffeur a été impoli durant le trajet"
}
```

### 3.5 Authentication Service (Opérations Protégées)

#### Obtenir tous les Utilisateurs

**Endpoint** : `GET {{base_url}}/authentication-service/api/auth/users`

#### Obtenir un Utilisateur par ID

**Endpoint** : `GET {{base_url}}/authentication-service/api/auth/users/{userId}`

#### Bannir un Utilisateur (Requiert rôle ADMIN)

**Endpoint** : `PUT {{base_url}}/authentication-service/api/auth/users/{userId}/ban`

## Étape 4 : Rafraîchir le Token

Lorsque le token expire (après 1 heure), utilisez le refresh token :

**Endpoint** : `POST {{keycloak_url}}/realms/{{realm}}/protocol/openid-connect/token`

**Headers** :
```
Content-Type: application/x-www-form-urlencoded
```

**Body** (x-www-form-urlencoded) :
```
grant_type: refresh_token
client_id: {{client_id}}
client_secret: {{client_secret}}
refresh_token: {{refresh_token}}
```

**Script de Test** :
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("refresh_token", jsonData.refresh_token);
}
```

## Utilisateurs de Test Disponibles

### Passager
- **Email** : passenger@wassalni.com
- **Password** : password123
- **Rôle** : PASSENGER

### Chauffeur
- **Email** : driver@wassalni.com
- **Password** : password123
- **Rôle** : DRIVER

### Administrateur
- **Email** : admin@wassalni.com
- **Password** : admin123
- **Rôle** : ADMIN

## Tests de Sécurité

### Test 1 : Accès sans Token

Essayez d'accéder à un endpoint protégé sans le header Authorization :

**Endpoint** : `GET {{base_url}}/booking-service/api/bookings`

**Résultat Attendu** : HTTP 401 Unauthorized

### Test 2 : Token Invalide

Utilisez un token invalide :

**Headers** :
```
Authorization: Bearer invalid_token_here
```

**Résultat Attendu** : HTTP 401 Unauthorized

### Test 3 : Token Expiré

Attendez que le token expire (1 heure) et essayez de faire une requête.

**Résultat Attendu** : HTTP 401 Unauthorized

### Test 4 : Accès avec Mauvais Rôle

Essayez de bannir un utilisateur avec un compte PASSENGER :

1. Connectez-vous avec passenger@wassalni.com
2. Essayez : `PUT {{base_url}}/authentication-service/api/auth/users/{userId}/ban`

**Résultat Attendu** : HTTP 403 Forbidden (si les permissions sont configurées)

## Décoder le Token JWT

Pour voir le contenu de votre token :

1. Copiez la valeur de `access_token`
2. Allez sur https://jwt.io
3. Collez le token dans le champ "Encoded"
4. Vous verrez :
   - **Header** : Algorithme de signature (RS256)
   - **Payload** : Informations de l'utilisateur, rôles, expiration, etc.
   - **Signature** : Signature cryptographique

**Exemple de Payload** :
```json
{
  "exp": 1702993200,
  "iat": 1702989600,
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "passenger@wassalni.com",
  "realm_access": {
    "roles": ["PASSENGER"]
  },
  "preferred_username": "passenger@wassalni.com"
}
```

## Dépannage

### Erreur "Invalid token"
- Vérifiez que le token est bien sauvegardé dans les variables d'environnement
- Vérifiez que vous utilisez `Bearer {{access_token}}` dans le header Authorization
- Le token expire après 1 heure, obtenez-en un nouveau

### Erreur "Connection refused"
- Vérifiez que tous les services sont démarrés
- Vérifiez les URLs dans les variables d'environnement

### Erreur "Client not found"
- Vérifiez que le client_id est correct : `wassalni-app`
- Vérifiez que Keycloak est bien configuré

## Collection Postman Prête à l'Emploi

Vous pouvez importer cette collection JSON dans Postman :

1. Créez un fichier `Wassalni.postman_collection.json` avec le contenu approprié
2. Dans Postman, cliquez sur Import
3. Sélectionnez le fichier JSON
4. La collection sera importée avec tous les endpoints pré-configurés

## Bonnes Pratiques

1. **Sécurisez vos tokens** : Ne partagez jamais vos tokens ou mots de passe
2. **Utilisez les variables d'environnement** : Pour faciliter le changement entre environnements (dev, staging, prod)
3. **Automatisez les tests** : Utilisez les scripts de test Postman pour valider les réponses
4. **Organisez vos requêtes** : Utilisez des dossiers dans votre collection pour organiser les endpoints par service
5. **Rafraîchissez les tokens** : Configurez un script pour rafraîchir automatiquement les tokens expirés
