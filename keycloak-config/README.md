# Configuration Keycloak

Ce dossier contient la configuration du realm Keycloak pour le projet Wassalni.

## ⚠️ AVERTISSEMENT DE SÉCURITÉ

Le fichier `realm-export.json` contient un client secret en clair (`wassalni-secret-key-2024`). 

**Cette configuration est UNIQUEMENT pour le développement local.**

### Pour la Production :

1. **NE JAMAIS** utiliser le client secret par défaut en production
2. Générer un nouveau secret sécurisé :
   ```bash
   openssl rand -base64 32
   ```
3. Mettre à jour le secret dans :
   - La console Keycloak (Clients → wassalni-app → Credentials)
   - Les variables d'environnement des microservices
   - Ne PAS commit le nouveau secret dans Git

4. Utiliser des variables d'environnement ou un gestionnaire de secrets (HashiCorp Vault, AWS Secrets Manager, etc.)

## Fichiers

- `realm-export.json` : Configuration complète du realm avec client, rôles et utilisateurs de test

## Utilisation

Ce fichier est automatiquement importé au démarrage de Keycloak via docker-compose.
