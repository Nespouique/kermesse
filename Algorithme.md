# Calcul du vainqueur – Paris de naissance

## Objectif

Déterminer le vainqueur d'un pari sur la naissance d'un bébé à partir de trois informations fournies par chaque participant :

- la date de naissance (jour uniquement),
- le poids,
- le sexe.

Le vainqueur est celui dont le score total est le plus faible.

---

## Définitions

- **N** = nombre total de parieurs
- **K** = nombre de parieurs ayant parié le bon sexe (une fois le résultat connu)

---

## Données d'entrée

### Données réelles

- date_reelle : date de naissance réelle (format ISO recommandé : YYYY-MM-DD)
- poids_reel : poids réel à la naissance (en grammes)
- sexe_reel : "F" ou "M"

### Données des participants

Pour chaque participant :

- date_pari : date pronostiquée (YYYY-MM-DD)
- poids_pari : poids pronostiqué (en grammes)
- sexe_pari : "F" ou "M"

---

## Étapes de calcul

### 1. Calcul des écarts bruts

Pour chaque participant :

**Écart de date**  
`ecart_date = |date_pari - date_reelle|` en jours

**Écart de poids**  
`ecart_poids = |poids_pari - poids_reel|` en grammes

**Exactitude du sexe**  
`sexe_correct = (sexe_pari == sexe_reel)`

---

### 2. Classement par critère

#### Classement sur la date (rang_date)

- Trier les participants par ecart_date croissant
- Attribuer un rang_date
- En cas d'égalité :
  - attribuer le même rang
  - le rang suivant est incrémenté en conséquence (classement standard)

#### Classement sur le poids (rang_poids)

- Trier par ecart_poids croissant
- Attribuer un rang_poids
- Même règle d'égalité que pour la date

#### Classement sur le sexe (rang_sexe)

- `sexe_correct = true` → `rang_sexe = 1`
- `sexe_correct = false` → `rang_sexe = K + 1`

---

### 3. Calcul du score final

**Formule :**

```
Score = (K + 2) × (N + 1) × rang_date + (N + 1) × rang_sexe + rang_poids
```

Plus le score est petit, meilleur est le classement.

---

## Pourquoi cette formule fonctionne

### Hiérarchie stricte : Date > Sexe > Poids

1. **Date > (Sexe + Poids)** :  
   Le "bloc" maximal que peuvent ajouter sexe + poids est strictement inférieur au pas d'un cran de rang_date `(K + 2) × (N + 1)`, donc le sexe/poids ne peuvent jamais compenser une mauvaise date.

2. **Sexe > Poids** :  
   À date égale, un mauvais sexe (K+1) ajoute au minimum `K × (N + 1)` de plus qu'un bon sexe (1), ce qui est plus grand que n'importe quelle différence de poids (≤ N).

---

## Gestion des égalités finales (Tiebreak)

En cas d'égalité parfaite sur le score final :

**Priorité au pari le plus ancien** (timestamp_pari croissant : celui qui a parié le plus tôt gagne)

---

## Détermination du vainqueur

1. Trier les participants par Score croissant
2. Si Score égal : trier par timestamp_pari croissant
3. Le participant en première position est le vainqueur

---

## Notes d'implémentation

- Les calculs de dates doivent ignorer l'heure (les participants ne sélectionnent pas l'heure)
- Les poids sont manipulés en grammes pour la précision des calculs
- Le système fonctionne quel que soit le nombre de participants
- Le classement par rang est stable et déterministe

---

## Exemple de restitution dans le tableau

| Rang               | Parieur         | Date                 | Sexe             | Poids            |
| ------------------ | --------------- | -------------------- | ---------------- | ---------------- |
| **1** - _1587 pts_ | Marie Chevauché | **1** - _03/01/2026_ | **1** - _Garçon_ | **21** - _3,1kg_ |
| **2** - _2985 pts_ | Emmanuel Waguet | **1** - _03/01/2026_ | **27** - _Fille_ | **15** - _3,2kg_ |
| **3** - _3150 pts_ | Jean Dupont     | **2** - _05/01/2026_ | **1** - _Garçon_ | **3** - _3,0kg_  |
