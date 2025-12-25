# Guide de Dépannage - Erreur 401 lors de l'authentification

## Problème : Erreur 401 Unauthorized avec message "Authentication failed"

Si vous recevez cette erreur lors de la tentative d'obtention d'un token via `/api/auth/token`, suivez ces étapes de diagnostic :

### Étape 1 : Vérifier que Keycloak est démarré

```bash
# Vérifier que le conteneur Keycloak est en cours d'exécution
docker ps | grep keycloak

# Vérifier les logs de Keycloak
docker logs keycloak

# Tester l'accès à Keycloak
curl http://localhost:8080/health/ready
```

**Résultat attendu** : Le conteneur doit être "Up" et la commande curl doit retourner un statut de santé positif.

**Si Keycloak n'est pas démarré** :
```bash
cd /chemin/vers/projet
docker-compose up -d keycloak
# Attendre 30-60 secondes que Keycloak démarre complètement
```

### Étape 2 : Vérifier que le realm a été importé

1. Ouvrir http://localhost:8080 dans votre navigateur
2. Se connecter avec `admin` / `admin`
3. Dans le menu déroulant en haut à gauche, vérifier que **"wassalni-realm"** existe
4. Si le realm n'existe pas, le recréer :

```bash
# Arrêter Keycloak
docker-compose down

# Redémarrer avec import forcé
docker-compose up -d

# Vérifier les logs pour confirmation de l'import
docker logs keycloak | grep "wassalni-realm"
```

### Étape 3 : Vérifier les utilisateurs dans Keycloak

1. Dans la console Keycloak (http://localhost:8080)
2. Sélectionner le realm **"wassalni-realm"**
3. Aller dans **Users** dans le menu de gauche
4. Vérifier que les utilisateurs suivants existent :
   - passenger1 (email: passenger@wassalni.com)
   - driver1 (email: driver@wassalni.com)
   - admin (email: admin@wassalni.com)

**Si les utilisateurs n'existent pas**, vous devez :
- Soit les créer manuellement dans Keycloak
- Soit utiliser l'endpoint `/api/auth/register` pour créer un nouveau compte

### Étape 4 : Vérifier les credentials dans Postman

Les utilisateurs de test pré-configurés sont :

| Username (à utiliser) | Email | Mot de passe |
|----------------------|-------|--------------|
| passenger@wassalni.com | passenger@wassalni.com | password123 |
| driver@wassalni.com | driver@wassalni.com | password123 |
| admin@wassalni.com | admin@wassalni.com | admin123 |

**Important** : Dans Postman, le champ `username` doit contenir l'**email** de l'utilisateur, car `loginWithEmailAllowed` est activé dans le realm.

**Exemple de body JSON correct** :
```json
{
  "username": "passenger@wassalni.com",
  "password": "password123"
}
```

### Étape 5 : Vérifier la configuration du client Keycloak

1. Dans Keycloak, aller dans **Clients** → **wassalni-app**
2. Vérifier les paramètres suivants :
   - **Client authentication** : ON
   - **Direct access grants** : ON (enabled)
   - **Standard flow** : ON (enabled)

3. Dans l'onglet **Credentials**, vérifier que le client secret est : `wassalni-secret-key-2024`

### Étape 6 : Tester directement avec Keycloak

Pour isoler le problème, testez l'authentification directement avec Keycloak :

```bash
curl -X POST http://localhost:8080/realms/wassalni-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=wassalni-app" \
  -d "client_secret=wassalni-secret-key-2024" \
  -d "username=passenger@wassalni.com" \
  -d "password=password123"
```

**Si cette commande fonctionne** : Le problème est dans le microservice Authentication
**Si cette commande échoue** : Le problème est dans la configuration Keycloak

### Étape 7 : Vérifier que le service d'authentification est démarré

```bash
# Vérifier que le service tourne
curl http://localhost:8081/actuator/health

# Vérifier les logs du service
# (dans le terminal où le service a été démarré)
```

### Étape 8 : Créer un nouvel utilisateur

Si les utilisateurs de test ne fonctionnent pas, créez un nouveau compte :

**Requête Postman** :
- **Method** : POST
- **URL** : `{{auth_url}}/api/auth/register`
- **Body** :
```json
{
  "email": "test@example.com",
  "password": "Test123!",
  "phoneNumber": "+21612345678",
  "gender": "MALE",
  "userType": "PASSENGER",
  "preferredPaymentMethod": "CASH"
}
```

Ensuite, utilisez ces credentials pour obtenir un token.

### Étape 9 : Vérifier la connectivité réseau

Si tout le reste fonctionne mais Postman échoue toujours :

1. Vérifier que Postman peut accéder à localhost :
   - Désactiver les proxies dans Postman Settings
   - Essayer `127.0.0.1` au lieu de `localhost`

2. Vérifier les variables d'environnement Postman :
   - `auth_url` doit être `http://localhost:8081`
   - Pas de trailing slash

### Messages d'Erreur Détaillés (Après correction)

Avec les modifications apportées, vous devriez maintenant voir des messages d'erreur plus détaillés :

- **"Invalid credentials or Keycloak authentication failed"** : Mauvais username/password
- **"Cannot connect to Keycloak server"** : Keycloak n'est pas accessible
- **"Username and password are required"** : Paramètres manquants dans la requête

### Solution Rapide : Redémarrage Complet

Si rien ne fonctionne, essayez un redémarrage complet :

```bash
# Arrêter tout
docker-compose down

# Supprimer les volumes (ATTENTION : supprime les données)
docker-compose down -v

# Redémarrer
docker-compose up -d

# Attendre que Keycloak soit prêt (30-60 secondes)
sleep 60

# Vérifier
curl http://localhost:8080/health/ready
```

### Vérification Finale

Une fois tout configuré, cette requête devrait fonctionner :

**POST** `http://localhost:8081/api/auth/token`

**Headers** :
```
Content-Type: application/json
```

**Body** :
```json
{
  "username": "passenger@wassalni.com",
  "password": "password123"
}
```

**Réponse attendue (200 OK)** :
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 3600,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "user": null,
  "status": "success"
}
```

**Note** : `user` peut être `null` pour les utilisateurs importés depuis `realm-export.json` qui n'existent pas encore dans MongoDB. Ceci est normal.

## Aide Supplémentaire

Si le problème persiste après avoir suivi toutes ces étapes :

1. Vérifier les logs détaillés du service d'authentification
2. Vérifier les logs de Keycloak : `docker logs keycloak`
3. Consulter DEPLOYMENT.md pour les instructions complètes
4. Vérifier SECURITY.md pour les configurations de sécurité
