-- Insert default categories for all existing couples
INSERT INTO categories (couple_id, category_name, category_type, created_at, updated_at)
SELECT 
  c.id,
  category_name,
  'default',
  NOW(),
  NOW()
FROM couples c
CROSS JOIN (
  VALUES 
    ('Haldi'),
    ('Sangeet'),
    ('Wedding'),
    ('Reception')
) AS default_categories(category_name)
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.couple_id = c.id 
  AND categories.category_name = default_categories.category_name
);
