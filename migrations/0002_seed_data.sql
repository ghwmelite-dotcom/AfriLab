-- AfriLab Seed Data
-- Demo institutions, experiments, and base data

-- =====================
-- DEMO INSTITUTIONS
-- =====================
INSERT OR IGNORE INTO institutions (id, name, code, country, logo_url) VALUES
    ('inst-unilag', 'University of Lagos', 'UNILAG', 'Nigeria', NULL),
    ('inst-uct', 'University of Cape Town', 'UCT', 'South Africa', NULL),
    ('inst-knust', 'Kwame Nkrumah University of Science and Technology', 'KNUST', 'Ghana', NULL),
    ('inst-demo', 'AfriLab Demo University', 'DEMO', 'Pan-African', NULL);

-- =====================
-- ADDITIONAL EXPERIMENTS
-- =====================

-- UV-Vis Spectroscopy
INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives, instructions, simulation_config) VALUES
    ('chem-spectroscopy-01', 'chem', 'UV-Vis Spectroscopy', 'uv-vis-spectroscopy',
     'Master the principles of UV-Visible spectroscopy and Beer-Lambert Law through hands-on calibration and sample analysis.',
     'intermediate', 60,
     'Handle cuvettes carefully by the frosted sides only. Avoid touching optical surfaces. Dispose of chemical waste properly.',
     '["Understand Beer-Lambert Law (A = εlc)", "Learn to operate a UV-Vis spectrophotometer", "Create calibration curves for quantitative analysis", "Determine unknown concentrations from absorbance data"]',
     '[{"id": 1, "title": "Turn On Instrument", "description": "Power on the spectrophotometer and allow the lamp to warm up (2-3 minutes)", "hints": ["The lamp indicator should turn green when ready", "Warm-up ensures stable readings"]},{"id": 2, "title": "Set Wavelength", "description": "Set the wavelength to λmax for your compound (525 nm for KMnO4)", "hints": ["λmax is where absorbance is highest", "Different compounds have different λmax values"]},{"id": 3, "title": "Blank the Instrument", "description": "Insert a cuvette with distilled water and press ZERO to blank", "hints": ["This sets 100% transmittance (0 absorbance)", "Always blank before measurements"]},{"id": 4, "title": "Measure Standards", "description": "Measure absorbance of each standard solution and record values", "hints": ["Start with lowest concentration", "Wipe cuvettes with lens paper before inserting"]},{"id": 5, "title": "Create Calibration Curve", "description": "Plot absorbance vs concentration and calculate the regression line", "hints": ["A good curve has R² > 0.99", "The slope equals ε × l"]},{"id": 6, "title": "Analyze Unknown", "description": "Measure the unknown sample and use the calibration curve to determine its concentration", "hints": ["Use the equation: c = A / (ε × l)", "Compare to your calibration curve"]}]',
     '{"type": "spectroscopy", "compound": {"name": "Potassium Permanganate", "formula": "KMnO4", "molarAbsorptivity": 2455, "lambdaMax": 525, "color": "#8B008B"}, "standards": [0.00002, 0.00004, 0.00006, 0.00008, 0.0001], "pathLength": 1, "unknownConcentration": 0.00005}');

-- Microscopy Basics
INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('bio-microscopy-01', 'bio', 'Microscopy Basics', 'microscopy-basics',
     'Learn to use a compound microscope and identify cell structures in plant and animal tissue samples.',
     'beginner', 30,
     'Handle microscope slides carefully to avoid breakage. Never touch lens surfaces with fingers.',
     '["Properly set up and use a compound microscope", "Adjust focus using coarse and fine focus knobs", "Calculate total magnification", "Identify basic cell structures"]');

-- Cell Division
INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('bio-cell-01', 'bio', 'Cell Division', 'cell-division',
     'Observe and identify the stages of mitosis and meiosis in prepared tissue samples.',
     'intermediate', 45,
     'Handle prepared slides carefully. Use proper microscope techniques.',
     '["Identify the stages of mitosis: prophase, metaphase, anaphase, telophase", "Compare mitosis and meiosis", "Understand the purpose of cell division", "Calculate mitotic index"]');

-- Ohm's Law
INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('phys-ohm-01', 'phys', 'Ohm''s Law Verification', 'ohms-law',
     'Verify the linear relationship between voltage and current in resistive circuits.',
     'beginner', 35,
     'Never exceed maximum voltage ratings. Disconnect power before modifying circuits.',
     '["Verify Ohm''s Law (V = IR)", "Measure voltage and current accurately", "Calculate resistance from experimental data", "Understand the relationship between V, I, and R"]');

-- Drug Compounding
INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('pharm-compound-01', 'pharm', 'Drug Compounding', 'drug-compounding',
     'Practice pharmaceutical compounding techniques and accurate dosage calculations.',
     'intermediate', 60,
     'Always verify calculations before dispensing. Use appropriate PPE. Follow standard compounding protocols.',
     '["Perform accurate pharmaceutical calculations", "Use proper compounding techniques", "Prepare oral suspensions and solutions", "Verify dosage accuracy"]');
