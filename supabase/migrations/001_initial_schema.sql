-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create couples table (extends Supabase auth.users)
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_slug VARCHAR(50) UNIQUE NOT NULL,
  partner1_name VARCHAR(100) NOT NULL,
  partner2_name VARCHAR(100) NOT NULL,
  wedding_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  group_name VARCHAR(50),
  invite_status VARCHAR(20) DEFAULT 'pending' CHECK (invite_status IN ('pending', 'sent', 'viewed')),
  invite_sent_at TIMESTAMP WITH TIME ZONE,
  invite_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_contacts table
CREATE TABLE vendor_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  category VARCHAR(30) NOT NULL CHECK (category IN ('decorator', 'event_coordinator', 'hall_manager', 'transport', 'photographer', 'caterer')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_details table
CREATE TABLE event_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  couple_intro TEXT,
  events JSONB NOT NULL DEFAULT '[]',
  venues JSONB NOT NULL DEFAULT '[]',
  timeline JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photo_collections table
CREATE TABLE photo_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  drive_folder_url TEXT NOT NULL,
  categories JSONB NOT NULL DEFAULT '[]',
  highlight_photos JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_settings table
CREATE TABLE gift_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  upi_id VARCHAR(100),
  qr_code_url TEXT,
  custom_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todo_tasks table
CREATE TABLE todo_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_couples_user_id ON couples(user_id);
CREATE INDEX idx_couples_slug ON couples(couple_slug);
CREATE INDEX idx_guests_couple_id ON guests(couple_id);
CREATE INDEX idx_guests_invite_status ON guests(invite_status);
CREATE INDEX idx_vendor_contacts_couple_id ON vendor_contacts(couple_id);
CREATE INDEX idx_vendor_contacts_category ON vendor_contacts(category);
CREATE INDEX idx_event_details_couple_id ON event_details(couple_id);
CREATE INDEX idx_photo_collections_couple_id ON photo_collections(couple_id);
CREATE INDEX idx_gift_settings_couple_id ON gift_settings(couple_id);
CREATE INDEX idx_todo_tasks_couple_id ON todo_tasks(couple_id);
CREATE INDEX idx_todo_tasks_completed ON todo_tasks(completed);

-- Enable Row Level Security (RLS)
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for couples table
CREATE POLICY "Users can only access their own couple record" ON couples
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for guests table
CREATE POLICY "Couples can only access their own guests" ON guests
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create RLS policies for vendor_contacts table
CREATE POLICY "Couples can only access their own vendor contacts" ON vendor_contacts
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create RLS policies for event_details table
CREATE POLICY "Couples can only access their own event details" ON event_details
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create RLS policies for photo_collections table
CREATE POLICY "Couples can only access their own photo collections" ON photo_collections
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create RLS policies for gift_settings table
CREATE POLICY "Couples can only access their own gift settings" ON gift_settings
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create RLS policies for todo_tasks table
CREATE POLICY "Couples can only access their own todo tasks" ON todo_tasks
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_contacts_updated_at BEFORE UPDATE ON vendor_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_details_updated_at BEFORE UPDATE ON event_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_collections_updated_at BEFORE UPDATE ON photo_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_settings_updated_at BEFORE UPDATE ON gift_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_tasks_updated_at BEFORE UPDATE ON todo_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();