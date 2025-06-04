# API Backend de Gestion des Présences Scolaires

Ce document fournit la documentation complète de l'architecture backend du système de gestion des présences scolaires.

## Technologies utilisées

- **Node.js** et **Express.js** : Framework backend
- **TypeScript** : Typage statique pour JavaScript
- **MongoDB** : Base de données NoSQL pour le stockage des données
- **Mongoose** : ODM (Object Data Modeling) pour MongoDB
- **Firebase Authentication** : Service d'authentification utilisateur

## Structure de la base de données

### Modèles et relations

![Schéma de la base de données](https://via.placeholder.com/800x500.png?text=Schema+de+la+Base+de+Donnees)

#### 1. User (Utilisateur)
Gère les informations d'authentification des utilisateurs.
- **Rôles** : 
  - `superAdmin` : Accès complet à toutes les fonctionnalités et établissements, peut affecter des enseignants à plusieurs établissements
  - `admin` : Administrateur d'un établissement spécifique
  - `teacher` : Enseignant
  - `student` : Étudiant
- **Relations** :
  - Lié à un établissement (School)
  - Peut être lié à un profil Teacher ou Student

#### 2. School (Établissement)
Représente un établissement scolaire dans le système.
- **Données** : Nom, adresse, contact, etc.
- **Relations** : 
  - Contient des classes (Classroom)
  - Emploie des enseignants (Teacher)
  - Accueille des étudiants (Student)

#### 3. Teacher (Enseignant)
Informations détaillées sur les enseignants.
- **Données** : Nom, prénom, contact, etc.
- **Relations** :
  - Lié à un utilisateur (User)
  - Appartient principalement à un établissement (School)
  - Peut enseigner dans plusieurs établissements via TeacherSchoolAssignment
  - Enseigne des matières spécifiques dans des classes via ClassroomAssignment

#### 4. Student (Étudiant)
Informations sur les étudiants inscrits.
- **Données** : Nom, prénom, contact, etc.
- **Relations** :
  - Lié optionnellement à un utilisateur (User)
  - Appartient à un établissement (School)
  - Inscrit dans une classe (Classroom)

#### 5. Classroom (Salle de classe)
Représente une classe ou une salle physique.
- **Données** : Nom, etc.
- **Relations** :
  - Appartient à un établissement (School)
  - Contient des étudiants (Student)
  - Utilisée pour des enseignements via ClassroomAssignment

#### 6. Subject (Matière)
Matières enseignées dans les établissements.
- **Données** : Nom de la matière
- **Relations** :
  - Appartient à un établissement (School)
  - Enseignée dans des classes via ClassroomAssignment

#### 7. ClassroomAssignment (Attribution de classe)
Association entre un enseignant, une classe et une matière.
- **Données** : Horaires, etc.
- **Relations** :
  - Référence un enseignant (Teacher)
  - Référence une classe (Classroom)
  - Référence une matière (Subject)
  - Appartient à un établissement (School)

#### 8. Attendance (Présence)
Enregistrements des présences des étudiants.
- **Données** : Date, liste des présences par étudiant
- **Relations** :
  - Liée à une attribution de classe (ClassroomAssignment)
  - Référence les étudiants (Student) avec leur statut de présence
  - Enregistrée par un enseignant (Teacher)

#### 9. TeacherSchoolAssignment (Attribution d'enseignant à plusieurs écoles)
Gère l'affectation d'un enseignant à plusieurs établissements.
- **Données** : Statut (principal ou secondaire)
- **Relations** :
  - Référence un enseignant (Teacher)
  - Référence un établissement (School)

## Rôle du superAdmin

Le superAdmin représente l'entreprise qui conçoit le logiciel et a des privilèges spéciaux :

1. **Accès global** : Peut accéder à tous les établissements et toutes les données
2. **Gestion multi-établissements** : Autorisé à affecter un même enseignant à plusieurs établissements
3. **Support client** : Traite les demandes spéciales des établissements
4. **Configuration système** : Gère les paramètres globaux du système

Ce rôle est exclusif au personnel de l'entreprise développant le logiciel.

## Architecture du Backend

### Structure des dossiers

```
backend/
├── src/
│   ├── config/         # Configuration (DB, Firebase, etc.)
│   ├── controllers/    # Logique métier
│   ├── middlewares/    # Middlewares (auth, validation, etc.)
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes API
│   ├── utils/          # Fonctions utilitaires
│   ├── app.ts          # Configuration Express
│   └── index.ts        # Point d'entrée
├── .env                # Variables d'environnement
└── package.json        # Dépendances
```

### Flux d'authentification

1. L'utilisateur s'authentifie via Firebase Authentication
2. Le client reçoit un token JWT
3. Le token est envoyé dans l'en-tête `Authorization` avec chaque requête API
4. Le middleware d'authentification vérifie la validité du token
5. Le middleware de rôle vérifie les permissions de l'utilisateur

### API Endpoints

Les endpoints principaux sont organisés selon le modèle RESTful :

- `/api/auth` - Authentification et gestion des utilisateurs
- `/api/schools` - Gestion des établissements
- `/api/teachers` - Gestion des enseignants
- `/api/students` - Gestion des étudiants
- `/api/classrooms` - Gestion des classes
- `/api/subjects` - Gestion des matières
- `/api/assignments` - Gestion des attributions de classes
- `/api/attendance` - Gestion des présences

## Sécurité et permissions

### Niveaux d'accès

1. **superAdmin** :
   - Accès total à toutes les entités du système
   - Peut créer et gérer tous les établissements
   - Gère l'affectation multi-établissements des enseignants

2. **admin** :
   - Accès limité à son propre établissement
   - Gère les enseignants, étudiants, classes et matières
   - Configure les attributions de classes

3. **teacher** :
   - Accès à ses propres classes et attributions
   - Gère les présences des étudiants
   - Consulte les statistiques de présence

4. **student** :
   - Consulte son propre emploi du temps
   - Visualise son historique de présences

### Contrôle d'accès basé sur les rôles (RBAC)

- Middleware de vérification de rôle pour chaque route sensible
- Filtrage automatique des données par établissement
- Isolation complète des données entre établissements

## Démarrage du projet

### Prérequis
- Node.js (>= 14.x)
- MongoDB
- Compte Firebase pour l'authentification

### Installation

```bash
# Installer les dépendances
npm install

# Créer un fichier .env avec les variables d'environnement nécessaires
# Voir .env.example pour les variables requises

# Démarrer le serveur en mode développement
npm run dev

# Construire pour la production
npm run build
npm start
```

### Variables d'environnement requises

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NODE_ENV=development
FIREBASE_CONFIG={"type":"service_account","project_id":"..."}
```

## Bonnes pratiques de développement

- Utiliser les types TypeScript pour toutes les entités
- Suivre le pattern Controller-Service pour la logique métier
- Centraliser la gestion des erreurs
- Documenter toutes les routes API avec des commentaires JSDoc
- Implémenter la validation des données entrantes

---

## Support et contact

Pour toute question technique ou demande d'affectation multi-établissements pour un enseignant, contactez l'équipe de support :

Email : support@gestion-presence.com
