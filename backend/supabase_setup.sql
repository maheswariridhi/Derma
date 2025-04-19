-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    hospitalId TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    condition TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    patientId TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    diagnosis TEXT,
    diagnosisDetails TEXT,
    medications JSONB,
    nextSteps JSONB,
    next_appointment TEXT,
    recommendations JSONB,
    additional_notes TEXT,
    selectedTreatments JSONB,
    selectedMedicines JSONB,
    doctor TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER,
    price DECIMAL(10, 2),
    category TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    dosage TEXT,
    price DECIMAL(10, 2),
    unit TEXT,
    stock INTEGER DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    speciality TEXT,
    experience TEXT,
    bio TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON reports(patientId);
CREATE INDEX IF NOT EXISTS idx_reports_hospital_id ON reports(hospital_id);
CREATE INDEX IF NOT EXISTS idx_treatments_hospital_id ON treatments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_medicines_hospital_id ON medicines(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON doctors(hospital_id);

-- Set up Row-Level Security (RLS) policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies that allow full access when authenticated
CREATE POLICY "Allow full access to authenticated users" ON patients FOR ALL USING (true);
CREATE POLICY "Allow full access to authenticated users" ON reports FOR ALL USING (true);
CREATE POLICY "Allow full access to authenticated users" ON treatments FOR ALL USING (true);
CREATE POLICY "Allow full access to authenticated users" ON medicines FOR ALL USING (true);
CREATE POLICY "Allow full access to authenticated users" ON doctors FOR ALL USING (true);

-- Create policies for unauthenticated access during migration
CREATE POLICY "Allow public read/write access during migration" ON patients FOR ALL TO anon USING (true);
CREATE POLICY "Allow public read/write access during migration" ON reports FOR ALL TO anon USING (true);
CREATE POLICY "Allow public read/write access during migration" ON treatments FOR ALL TO anon USING (true);
CREATE POLICY "Allow public read/write access during migration" ON medicines FOR ALL TO anon USING (true);
CREATE POLICY "Allow public read/write access during migration" ON doctors FOR ALL TO anon USING (true);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at
BEFORE UPDATE ON treatments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON medicines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 