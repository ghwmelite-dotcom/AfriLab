-- AfriLab - Populate all experiments across disciplines
-- Migration 0005

-- =====================
-- CHEMISTRY - Additional Experiments
-- =====================

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('chem-organic-01', 'chem', 'Organic Synthesis: Aspirin', 'organic-synthesis-aspirin',
     'Synthesize acetylsalicylic acid (aspirin) from salicylic acid and acetic anhydride, then test its purity.',
     'intermediate', 60,
     'Acetic anhydride is corrosive and has a strong odor. Work in a fume hood. Wear gloves, goggles, and lab coat at all times.',
     '["Understand esterification reactions", "Perform recrystallization for purification", "Calculate percent yield", "Test product purity using melting point analysis"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('chem-electro-01', 'chem', 'Electrochemistry & Galvanic Cells', 'electrochemistry',
     'Build galvanic cells using different metal electrodes, measure cell potentials, and verify the electrochemical series.',
     'intermediate', 50,
     'Handle electrolyte solutions carefully. Avoid contact with copper sulfate and zinc sulfate solutions. Dispose of waste properly.',
     '["Understand oxidation-reduction reactions", "Build and measure galvanic cells", "Use the Nernst equation to predict cell potentials", "Verify the electrochemical series experimentally"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('chem-chromatography-01', 'chem', 'Chromatography Techniques', 'chromatography',
     'Separate and identify components of mixtures using paper chromatography and thin-layer chromatography (TLC).',
     'beginner', 40,
     'Some solvents are flammable. Work away from open flames. Use proper ventilation.',
     '["Understand the principles of chromatographic separation", "Calculate Rf values", "Compare paper and thin-layer chromatography", "Identify unknown substances using chromatographic data"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('chem-thermo-01', 'chem', 'Calorimetry & Thermochemistry', 'calorimetry',
     'Measure enthalpy changes for chemical reactions using a calorimeter and apply Hess''s Law.',
     'advanced', 55,
     'Handle hot solutions with care. Use insulated containers. Some reactions are exothermic and may splatter.',
     '["Measure heat of reaction using a calorimeter", "Apply Hess''s Law to calculate enthalpy changes", "Distinguish between exothermic and endothermic reactions", "Calculate specific heat capacity"]');

-- =====================
-- BIOLOGY - Additional Experiments
-- =====================

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('bio-photosynthesis-01', 'bio', 'Photosynthesis & Light Reactions', 'photosynthesis',
     'Investigate the effect of light intensity and wavelength on the rate of photosynthesis using aquatic plants.',
     'intermediate', 50,
     'Handle lab equipment carefully. Ensure proper lighting conditions. Do not look directly at bright light sources.',
     '["Understand the light-dependent reactions of photosynthesis", "Measure oxygen production as an indicator of photosynthesis rate", "Investigate the effect of light intensity on photosynthesis", "Analyze the absorption spectrum of chlorophyll"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('bio-genetics-01', 'bio', 'Mendelian Genetics', 'mendelian-genetics',
     'Simulate genetic crosses to understand inheritance patterns, dominant/recessive traits, and Punnett square predictions.',
     'beginner', 35,
     'This is a simulation-based lab. No physical safety hazards.',
     '["Apply Mendel''s laws of segregation and independent assortment", "Construct and interpret Punnett squares", "Calculate expected genotypic and phenotypic ratios", "Perform chi-square tests to evaluate genetic crosses"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('bio-enzyme-01', 'bio', 'Enzyme Kinetics', 'enzyme-kinetics',
     'Study the effects of temperature, pH, and substrate concentration on enzyme activity using catalase.',
     'intermediate', 45,
     'Handle hydrogen peroxide carefully. Wear goggles. Do not mix concentrated peroxide with organic materials.',
     '["Understand enzyme-substrate interactions", "Measure reaction rates under varying conditions", "Interpret Michaelis-Menten kinetics", "Determine optimal temperature and pH for enzyme activity"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('bio-ecology-01', 'bio', 'Ecosystem Simulation', 'ecosystem-simulation',
     'Model population dynamics, food webs, and energy flow through a virtual ecosystem with multiple trophic levels.',
     'advanced', 55,
     'This is a simulation-based lab. No physical safety hazards.',
     '["Understand energy flow through trophic levels", "Model predator-prey population dynamics", "Analyze the impact of environmental changes on biodiversity", "Apply ecological principles to conservation scenarios"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('bio-dna-01', 'bio', 'DNA Extraction & Electrophoresis', 'dna-extraction',
     'Extract DNA from biological samples and separate DNA fragments using gel electrophoresis.',
     'advanced', 60,
     'Handle ethanol and detergents carefully. Wear gloves when handling staining agents. Follow proper gel disposal procedures.',
     '["Perform DNA extraction from plant or animal tissue", "Understand the principles of gel electrophoresis", "Analyze DNA fragment sizes using molecular markers", "Interpret electrophoresis gel results"]');

-- =====================
-- PHYSICS - Additional Experiments
-- =====================

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('phys-projectile-01', 'phys', 'Projectile Motion', 'projectile-motion',
     'Launch projectiles at different angles and velocities to explore kinematic equations and trajectory analysis.',
     'intermediate', 45,
     'This is a simulation-based lab. No physical safety hazards.',
     '["Analyze projectile trajectories using kinematic equations", "Determine the optimal launch angle for maximum range", "Decompose motion into horizontal and vertical components", "Verify the independence of horizontal and vertical motion"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('phys-waves-01', 'phys', 'Wave Motion & Interference', 'wave-motion',
     'Explore wave properties including wavelength, frequency, amplitude, and observe constructive and destructive interference patterns.',
     'intermediate', 40,
     'This is a simulation-based lab. No physical safety hazards.',
     '["Understand transverse and longitudinal wave properties", "Measure wavelength, frequency, and wave speed", "Observe constructive and destructive interference", "Explore standing waves and resonance"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('phys-optics-01', 'phys', 'Optics: Lenses & Mirrors', 'optics',
     'Investigate image formation using convex and concave lenses and mirrors, and verify the thin lens equation.',
     'intermediate', 45,
     'Handle optical components carefully. Do not look directly into laser beams. Keep the optical bench stable.',
     '["Apply the thin lens equation (1/f = 1/do + 1/di)", "Distinguish between real and virtual images", "Measure focal lengths experimentally", "Understand magnification and image characteristics"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('phys-thermo-01', 'phys', 'Thermodynamics & Heat Transfer', 'thermodynamics',
     'Investigate heat conduction, convection, and radiation, and verify the laws of thermodynamics through calorimetry.',
     'advanced', 50,
     'Handle hot objects with tongs or heat-resistant gloves. Allow heated materials to cool before handling.',
     '["Understand the three modes of heat transfer", "Apply the first law of thermodynamics", "Measure specific heat capacity using calorimetry", "Analyze thermal equilibrium in isolated systems"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('phys-pendulum-01', 'phys', 'Simple Pendulum & SHM', 'pendulum',
     'Investigate simple harmonic motion using a pendulum, measuring period vs. length and verifying the pendulum equation.',
     'beginner', 30,
     'Ensure pendulum is securely mounted. Stand clear of the swing path.',
     '["Understand simple harmonic motion (SHM)", "Verify the relationship T = 2pi*sqrt(L/g)", "Measure the acceleration due to gravity experimentally", "Analyze the effect of amplitude on period"]');

-- =====================
-- PHARMACY - Additional Experiments
-- =====================

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('pharm-dosage-01', 'pharm', 'Dosage Calculations', 'dosage-calculations',
     'Practice pharmaceutical dosage calculations for different patient populations, including pediatric and geriatric adjustments.',
     'beginner', 40,
     'Always double-check calculations before dispensing. Use appropriate measuring equipment.',
     '["Calculate drug doses based on body weight and BSA", "Convert between dosage units (mg, mL, mcg)", "Apply pediatric and geriatric dose adjustments", "Perform IV drip rate calculations"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('pharm-interaction-01', 'pharm', 'Drug Interactions', 'drug-interactions',
     'Analyze potential drug-drug and drug-food interactions using a virtual patient medication review system.',
     'intermediate', 50,
     'This is a simulation-based lab. Use clinical databases for verification in real practice.',
     '["Identify major drug-drug interactions", "Classify interactions by mechanism (pharmacokinetic vs pharmacodynamic)", "Evaluate clinical significance of interactions", "Recommend alternative therapies to avoid harmful combinations"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('pharm-quality-01', 'pharm', 'Quality Control Testing', 'quality-control',
     'Perform quality control tests on pharmaceutical preparations including dissolution, uniformity, and stability testing.',
     'advanced', 55,
     'Handle test reagents carefully. Follow proper waste disposal protocols. Calibrate instruments before use.',
     '["Perform dissolution testing on tablet formulations", "Assess content uniformity", "Conduct stability testing under accelerated conditions", "Interpret quality control data against pharmacopeial standards"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('pharm-pharma-01', 'pharm', 'Pharmacokinetics Simulation', 'pharmacokinetics',
     'Model drug absorption, distribution, metabolism, and excretion (ADME) using compartmental pharmacokinetic models.',
     'advanced', 60,
     'This is a simulation-based lab. No physical safety hazards.',
     '["Understand one- and two-compartment pharmacokinetic models", "Calculate pharmacokinetic parameters (Cmax, Tmax, AUC, t1/2)", "Predict drug plasma concentrations over time", "Design dosing regimens for therapeutic drug monitoring"]');

-- =====================
-- MEDICAL SCIENCES - Additional Experiments
-- =====================

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('med-ecg-01', 'med', 'ECG Reading & Interpretation', 'ecg-reading',
     'Learn to read and interpret electrocardiogram (ECG) traces, identifying normal sinus rhythm and common arrhythmias.',
     'intermediate', 45,
     'This is a simulation-based lab. No physical safety hazards.',
     '["Identify the components of a normal ECG waveform (P, QRS, T)", "Measure heart rate from an ECG strip", "Recognize common arrhythmias (atrial fibrillation, ventricular tachycardia)", "Correlate ECG findings with cardiac pathology"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('med-blood-01', 'med', 'Blood Typing & Analysis', 'blood-analysis',
     'Determine blood types using simulated antigen-antibody reactions and understand transfusion compatibility.',
     'beginner', 35,
     'This is a simulation using virtual blood samples. In real practice, always follow universal precautions when handling blood products.',
     '["Understand the ABO and Rh blood group systems", "Perform blood typing using antigen-antibody reactions", "Determine transfusion compatibility", "Interpret a complete blood count (CBC)"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('med-patient-01', 'med', 'Patient Assessment & History', 'patient-assessment',
     'Practice conducting a systematic patient assessment including history taking, physical examination, and clinical reasoning.',
     'intermediate', 50,
     'This is a simulation-based lab. Practice proper communication and documentation skills.',
     '["Conduct a structured patient history interview", "Perform a systematic physical examination", "Identify relevant clinical signs and symptoms", "Develop differential diagnoses using clinical reasoning"]');

INSERT OR IGNORE INTO experiments (id, discipline_id, title, slug, description, difficulty, duration_minutes, safety_notes, learning_objectives) VALUES
    ('med-auscultation-01', 'med', 'Heart & Lung Auscultation', 'auscultation',
     'Learn proper stethoscope technique and identify normal and abnormal heart and lung sounds in virtual patients.',
     'advanced', 45,
     'This is a simulation-based lab. Use headphones for optimal audio quality.',
     '["Identify the four cardiac auscultation areas", "Distinguish normal from abnormal heart sounds (murmurs, gallops)", "Recognize normal and adventitious breath sounds (crackles, wheezes)", "Correlate auscultation findings with clinical conditions"]');
