-- ── Migration 005: Delivery zones ────────────────────────────────────────────
-- Adds a delivery_zones table to map pincodes → delivery availability/metadata.
-- Used by the tRPC delivery.checkPincode procedure (M-5 ship-ready plan).

CREATE TABLE IF NOT EXISTS delivery_zones (
  pincode       char(6)       PRIMARY KEY,
  zone_name     text          NOT NULL,
  -- 'local'   = bakery-delivered (Pune metro area)
  -- 'courier' = shipped via courier (pan-India dry goods only)
  -- 'unavailable' = not serviceable
  delivery_type text          NOT NULL DEFAULT 'local'
                              CHECK (delivery_type IN ('local', 'courier', 'unavailable')),
  delivery_days int           NOT NULL DEFAULT 1,  -- estimated business days
  extra_charge  numeric(10,2) NOT NULL DEFAULT 0,  -- surcharge on top of base delivery fee
  is_active     boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

-- Seed with common Pune pincodes (local delivery) + a few for courier
INSERT INTO delivery_zones (pincode, zone_name, delivery_type, delivery_days, extra_charge) VALUES
  ('411001', 'Pune Central',       'local',   1, 0),
  ('411002', 'Pune East',          'local',   1, 0),
  ('411003', 'Pune West',          'local',   1, 0),
  ('411004', 'Pune North',         'local',   1, 0),
  ('411005', 'Shivajinagar',       'local',   1, 0),
  ('411006', 'Kothrud',            'local',   1, 0),
  ('411007', 'Bibwewadi',          'local',   1, 0),
  ('411008', 'Karve Nagar',        'local',   1, 0),
  ('411009', 'Warje',              'local',   1, 0),
  ('411011', 'Hadapsar',           'local',   1, 0),
  ('411013', 'Yerawada',           'local',   1, 0),
  ('411014', 'Lohegaon',           'local',   1, 0),
  ('411015', 'Parvati',            'local',   1, 0),
  ('411016', 'Dhankawadi',         'local',   1, 0),
  ('411017', 'Wanowrie',           'local',   1, 0),
  ('411018', 'Mundhwa',            'local',   1, 0),
  ('411019', 'Wadgaonsheri',       'local',   1, 0),
  ('411020', 'Kondhwa',            'local',   1, 0),
  ('411021', 'Undri',              'local',   1, 50),
  ('411022', 'Ambegaon',           'local',   2, 50),
  ('411023', 'Bavdhan',            'local',   1, 0),
  ('411024', 'Pashan',             'local',   1, 0),
  ('411025', 'Sus',                'local',   1, 0),
  ('411026', 'Baner',              'local',   1, 0),
  ('411027', 'Aundh',              'local',   1, 0),
  ('411028', 'Pimple Saudagar',    'local',   1, 0),
  ('411029', 'Pimple Nilakh',      'local',   1, 0),
  ('411030', 'Pimple Gurav',       'local',   1, 0),
  ('411031', 'Vishal Nagar',       'local',   1, 0),
  ('411032', 'Rahatani',           'local',   1, 0),
  ('411033', 'Wakad',              'local',   1, 0),
  ('411034', 'Hinjewadi',          'local',   1, 0),
  ('411035', 'Tathawade',          'local',   1, 0),
  ('411036', 'Mahalunge',          'local',   2, 50),
  ('411037', 'Bhosari',            'local',   1, 0),
  ('411038', 'Kalas',              'local',   1, 0),
  ('411039', 'Vishrantwadi',       'local',   1, 0),
  ('411040', 'Dhanori',            'local',   1, 0),
  ('411041', 'Nagar Road',         'local',   1, 0),
  ('411042', 'Saswad Road',        'local',   2, 50),
  ('411043', 'Pisoli',             'local',   2, 50),
  ('411044', 'Manjri',             'local',   1, 0),
  ('411045', 'Kharadi',            'local',   1, 0),
  ('411046', 'Viman Nagar',        'local',   1, 0),
  ('411047', 'Kalyani Nagar',      'local',   1, 0),
  ('411048', 'Koregaon Park',      'local',   1, 0),
  ('411051', 'Magarpatta',         'local',   1, 0),
  ('411052', 'Phursungi',          'local',   2, 50),
  ('411057', 'Fatimanagar',        'local',   1, 0),
  ('411060', 'Wagholi',            'local',   1, 0),
  ('411062', 'Handewadi',          'local',   2, 50),
  -- PCMC pincodes (Pimpri-Chinchwad) — local delivery
  ('411018', 'Chinchwad',          'local',   1, 0),
  ('411019', 'Pimpri',             'local',   1, 0),
  -- Mumbai — courier only (dry goods)
  ('400001', 'Mumbai',             'courier', 2, 0),
  ('400050', 'Mumbai Bandra',      'courier', 2, 0),
  ('400051', 'Mumbai Khar',        'courier', 2, 0),
  ('400053', 'Mumbai Juhu',        'courier', 2, 0),
  ('400054', 'Mumbai Andheri',     'courier', 2, 0),
  -- Bangalore — courier
  ('560001', 'Bengaluru Central',  'courier', 3, 0),
  ('560002', 'Bengaluru Shivajinagar', 'courier', 3, 0),
  ('560038', 'Bengaluru Koramangala', 'courier', 3, 0),
  -- Delhi — courier
  ('110001', 'New Delhi Central',  'courier', 3, 0),
  ('110020', 'Delhi Hauz Khas',    'courier', 3, 0),
  -- Hyderabad — courier
  ('500001', 'Hyderabad',          'courier', 3, 0),
  -- Chennai — courier
  ('600001', 'Chennai Central',    'courier', 3, 0)
ON CONFLICT (pincode) DO NOTHING;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones (is_active) WHERE is_active = true;

-- Row-level security: allow read for everyone, write only for service role
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delivery_zones_read_all" ON delivery_zones
  FOR SELECT USING (true);
