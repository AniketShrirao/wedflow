-- Create uploads table for tracking upload sessions
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  uploader_name VARCHAR(100) NOT NULL,
  uploader_email VARCHAR(100),
  upload_source VARCHAR(20) NOT NULL CHECK (upload_source IN ('dashboard', 'public_site', 'legacy')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  google_drive_folder_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table for storing individual photo metadata
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  google_drive_file_id VARCHAR(255),
  public_url TEXT,
  category VARCHAR(100) NOT NULL,
  folder VARCHAR(100),
  is_highlighted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table for managing custom and default categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('default', 'custom')),
  google_drive_folder_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_uploads_couple_id ON uploads(couple_id);
CREATE INDEX idx_uploads_uploader_email ON uploads(uploader_email);
CREATE INDEX idx_uploads_upload_source ON uploads(upload_source);
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_uploads_created_at ON uploads(created_at);

CREATE INDEX idx_images_couple_id ON images(couple_id);
CREATE INDEX idx_images_upload_id ON images(upload_id);
CREATE INDEX idx_images_category ON images(category);
CREATE INDEX idx_images_folder ON images(folder);
CREATE INDEX idx_images_is_highlighted ON images(is_highlighted);
CREATE INDEX idx_images_couple_category ON images(couple_id, category);
CREATE INDEX idx_images_couple_highlighted ON images(couple_id, is_highlighted);

CREATE INDEX idx_categories_couple_id ON categories(couple_id);
CREATE INDEX idx_categories_type ON categories(category_type);
CREATE INDEX idx_categories_couple_type ON categories(couple_id, category_type);

-- Enable Row Level Security (RLS)
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for uploads table
CREATE POLICY "Couples can only access their own uploads" ON uploads
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create RLS policies for images table
CREATE POLICY "Couples can only access their own images" ON images
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create RLS policies for categories table
CREATE POLICY "Couples can only access their own categories" ON categories
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
