-- Catégories générales pour Colobane Marketplace
-- À exécuter dans l'éditeur SQL de Supabase

INSERT INTO "Category" (name, slug, "isGlobal", "createdAt") VALUES
-- High-Tech
('Téléphones & Tablettes', 'telephones-tablettes', true, NOW()),
('Informatique & Ordinateurs', 'informatique-ordinateurs', true, NOW()),
('Électronique & TV', 'electronique-tv', true, NOW()),
('Jeux Vidéo & Consoles', 'jeux-video-consoles', true, NOW()),

-- Mode
('Mode Homme', 'mode-homme', true, NOW()),
('Mode Femme', 'mode-femme', true, NOW()),
('Mode Enfant & Bébé', 'mode-enfant-bebe', true, NOW()),
('Montres & Bijoux', 'montres-bijoux', true, NOW()),
('Sacs & Accessoires', 'sacs-accessoires', true, NOW()),
('Chaussures', 'chaussures', true, NOW()),

-- Maison & Vie
('Maison & Décoration', 'maison-decoration', true, NOW()),
('Cuisine & Électroménager', 'cuisine-electromenager', true, NOW()),
('Meubles', 'meubles', true, NOW()),
('Bricolage & Outillage', 'bricolage-outillage', true, NOW()),
('Jardin & Piscine', 'jardin-piscine', true, NOW()),

-- Beauté & Santé
('Parfums & Cosmétiques', 'parfums-cosmetiques', true, NOW()),
('Soins & Beauté', 'soins-beaute', true, NOW()),
('Santé & Hygiène', 'sante-hygiene', true, NOW()),
('Cheveux & Coiffure', 'cheveux-coiffure', true, NOW()),

-- Loisirs & Autres
('Sport & Fitness', 'sport-fitness', true, NOW()),
('Auto & Moto', 'auto-moto', true, NOW()),
('Alimentation & Supermarché', 'alimentation-supermarche', true, NOW()),
('Jouets & Éveil', 'jouets-eveil', true, NOW()),
('Livres & Papeterie', 'livres-papeterie', true, NOW()),
('Musique & Audio', 'musique-audio', true, NOW()),
('Animaux', 'animaux', true, NOW())

ON CONFLICT (slug) DO NOTHING;
