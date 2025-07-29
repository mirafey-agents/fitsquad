const exercisesCsv = `Sl No	Module Type	Exercise	Level	Muscle Group	Type	Energy Points	Goal	Goal Specific
1	Animal Flow	Beast Crawl	Advanced	Shoulders	Core	4	Core Stability	Core Strength & Stability
2	Animal Flow	Crab Reach	Beginner	Hips	Cardio	2	Fat Loss	Fat Loss at Home
3	Animal Flow	Ape Reach	Advanced	Shoulders	Power	4	Explosive Performance	Explosive Power Training
4	Animal Flow	Scorpion Reach	Beginner	Hips	Strength	2	Build Muscle	Strength Training at Gym
5	Animal Flow	Loaded Beast	Beginner	Back, Biceps	Strength	2	Build Muscle	Strength Training at Gym
6	Aquatic Fitness	Aqua Jog	Intermediate	Full Body	Cardio	3	Fat Loss	Fat Loss at Home
7	Aquatic Fitness	Water Treading	Beginner	Chest, Triceps	Mobility	2	Flexibility & Rehab	Mobility & Rehab
8	Aquatic Fitness	Pool Plank	Intermediate	Obliques	Strength	3	Build Muscle	Core Strength & Stability
9	Aquatic Fitness	Flutter Kicks	Beginner	Hamstrings	Cardio	2	Fat Loss	Fat Loss at Home
10	Aquatic Fitness	Aqua Jumping Jacks	Beginner	Back, Biceps	Flexibility	2	Flexibility & Rehab	Fat Loss at Home
11	Balance Training	Single Leg Stand	Advanced	Lower Back	Cardio	4	Fat Loss	Fat Loss at Home
12	Balance Training	BOSU Ball Squat	Intermediate	Shoulders	Endurance	3	Stamina	Strength Training at Gym
13	Balance Training	Balance Board Lunge	Beginner	Chest, Triceps	Mobility	2	Flexibility & Rehab	Mobility & Rehab
14	Balance Training	Y Balance Test	Advanced	Back, Biceps	Core	4	Core Stability	Core Strength & Stability
15	Balance Training	Stork Stand	Beginner	Chest, Triceps	Mobility	2	Flexibility & Rehab	Mobility & Rehab
16	Barbell	Barbell Squats	Beginner	Legs, Glutes	Strength	3	Build Muscle	Strength Training at Gym
17	Barbell	Barbell Bench Press	Beginner	Chest, Shoulders	Strength	3	Build Muscle	Strength Training at Gym
18	Barbell	Barbell Rows	Beginner	Back, Biceps	Strength	3	Build Muscle	Strength Training at Gym
19	Barbell	Barbell Overhead Press	Beginner	Chest, Shoulders	Strength	3	Build Muscle	Strength Training at Gym
20	Barbell	Barbell Deadlift	Beginner	Back, Hamstrings	Strength	3	Build Muscle	Strength Training at Gym
21	Barbell	Barbell Front Squat	Intermediate	Legs, Glutes	Strength	4	Build Muscle	Strength Training at Gym
22	Barbell	Barbell Incline Bench Press	Intermediate	Chest, Shoulders	Strength	4	Build Muscle	Strength Training at Gym
23	Barbell	Barbell Sumo Deadlift	Intermediate	Back, Hamstrings	Strength	4	Build Muscle	Strength Training at Gym
24	Barbell	Barbell Push Press	Intermediate	Chest, Shoulders	Strength	4	Build Muscle	Strength Training at Gym
25	Barbell	Barbell Bent over Rows (underhand grip)	Intermediate	Back, Biceps	Strength	4	Build Muscle	Strength Training at Gym
26	Barbell	Barbell Snatch	Advanced	Full Body	Strength	5	Build Muscle	Strength Training at Gym
27	Barbell	Barbell Clean and Jerk	Advanced	Full Body	Strength	5	Build Muscle	Strength Training at Gym
28	Barbell	Barbell Thruster	Advanced	Full Body	Strength	5	Build Muscle	Strength Training at Gym
29	Barbell	Barbell Romanian deadlift	Advanced	Back, Hamstrings	Strength	5	Build Muscle	Strength Training at Gym
30	Barbell	Barbell Paused Squat	Advanced	Legs, Glutes	Strength	5	Build Muscle	Strength Training at Gym
31	Barbell	Barbell Back Squat	Intermediate	Legs, Glutes	Strength	4	Build Muscle	Strength Training at Gym
32	Barbell	Barbell Row	Intermediate	Legs, Glutes	Core	4	Core Stability	Strength Training at Gym
33	Body Weight	Bodyweight Squats	Beginner	Legs, Glutes	Strength	2	Build Muscle	Strength Training at Gym
34	Body Weight	Incline Push-ups	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
35	Body Weight	Planks	Beginner	Core	Endurance	2	Stamina	Core Strength & Stability
36	Body Weight	Glute Bridges	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
37	Body Weight	Standing Knee Lifts	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
38	Body Weight	Lunges	Intermediate	Legs, Glutes	Strength	3	Build Muscle	Strength Training at Gym
39	Body Weight	Standard Push-ups	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
40	Body Weight	Side Planks	Intermediate	Core	Endurance	3	Stamina	Core Strength & Stability
41	Body Weight	Single Leg Glute Bridges	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
42	Body Weight	Bicycle Crunches	Intermediate	Full Body	Core	3	Core Stability	Core Strength & Stability
43	Body Weight	Pistol Squats (one-legged squats)	Advanced	Legs, Glutes	Strength	4	Build Muscle	Strength Training at Gym
44	Body Weight	Diamond Push-ups	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
45	Body Weight	Burpees	Advanced	Full Body	Cardio	4	Fat Loss	Fat Loss at Home
46	Body Weight	Hollow Hold	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
47	Body Weight	Handstand Against Wall	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
48	Bodyweight	Push-ups	Intermediate	Chest, Triceps	Power	2	Explosive Performance	Explosive Power Training
49	Bodyweight	Wall Sit	Intermediate	Legs, Glutes	Strength	2	Build Muscle	Strength Training at Gym
50	Bodyweight	Step-ups	Intermediate	Chest, Triceps	Strength	2	Build Muscle	Strength Training at Gym
51	Bodyweight	Bear Crawl	Advanced	Chest, Triceps	Strength	4	Build Muscle	Strength Training at Gym
52	Bodyweight	Mountain Climbers	Intermediate	Chest, Triceps	Mobility	2	Flexibility & Rehab	Mobility & Rehab
53	Bodyweight	Air Squats	Intermediate	Hamstrings	Core	2	Core Stability	Strength Training at Gym
54	Bodyweight	Superman Hold	Intermediate	Obliques	Flexibility	2	Flexibility & Rehab	Mobility & Rehab
55	Cardio	Walking	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
56	Cardio	Stationary Bike	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
57	Cardio	Eleptical Trainer	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
58	Cardio	Aqua Jogging	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
59	Cardio	Jump Rope	Beginner	Full Body	Cardio	2	Fat Loss	Fat Loss at Home
60	Cardio	Jogging	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
61	Cardio	Starir Climber	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
62	Cardio	Rowing Machine	Intermediate	Back, Biceps	Strength	3	Build Muscle	Strength Training at Gym
63	Cardio	High Intensity Interval Training	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
64	Cardio	Running	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
65	Cardio	Spin Class	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
66	Cardio	Circuit Training	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
67	Cardio	Tabata Workouts	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
68	Cardio	Trail Running	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
69	Cardio Machine	Treadmill Run	Intermediate	Legs, Heart	Cardio	3	Fat Loss	Fat Loss at Home
70	Cardio Machine	Rowing Machine Sprint	Intermediate	Back, Core	Cardio	3	Fat Loss	Strength Training at Gym
71	Cardio Machine	Air Bike Sprint	Advanced	Full Body	Cardio	4	Fat Loss	Fat Loss at Home
72	Core	Russian Twists	Beginner	Obliques	Core	2	Core Stability	Core Strength & Stability
73	Core	Hanging Leg Raises	Advanced	Abs	Core	4	Core Stability	Core Strength & Stability
74	Core	Dead Bug	Beginner	Core, Spine	Core	2	Core Stability	Core Strength & Stability
75	Core	Side Plank	Beginner	Core	Core	2	Core Stability	Core Strength & Stability
76	Core	Plank	Advanced	Shoulders	Power	4	Explosive Performance	Core Strength & Stability
77	Core	Leg Raises	Intermediate	Shoulders	Mobility	2	Flexibility & Rehab	Mobility & Rehab
78	Dance Fitness	Salsa Step	Intermediate	Hips	Endurance	3	Stamina	Quick 10-Min Burners
79	Dance Fitness	Zumba Shuffle	Advanced	Hips	Power	4	Explosive Performance	Explosive Power Training
80	Dance Fitness	Hip Roll	Intermediate	Core	Endurance	3	Stamina	Quick 10-Min Burners
81	Dance Fitness	Grapevine	Beginner	Hamstrings	Strength	2	Build Muscle	Strength Training at Gym
82	Dance Fitness	Dance Squat	Advanced	Hamstrings	Strength	4	Build Muscle	Strength Training at Gym
83	Dumbbell	Dumbbell Bicep Curls	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
84	Dumbbell	Dumbbell Shoulder Press	Beginner	Chest, Shoulders	Strength	2	Build Muscle	Strength Training at Gym
85	Dumbbell	Dumbbell Squats	Beginner	Legs, Glutes	Strength	2	Build Muscle	Strength Training at Gym
86	Dumbbell	Dumbbell Bench Press (Flat)	Beginner	Chest, Shoulders	Strength	2	Build Muscle	Strength Training at Gym
87	Dumbbell	Dumbbell Bent Over Rows	Beginner	Back, Biceps	Strength	2	Build Muscle	Strength Training at Gym
88	Dumbbell	Dumbbell Lunge	Intermediate	Legs, Glutes	Strength	3	Build Muscle	Strength Training at Gym
89	Dumbbell	Dumbbell Incline Bench Press	Intermediate	Chest, Shoulders	Strength	3	Build Muscle	Strength Training at Gym
90	Dumbbell	Dumbbell Deadlift	Intermediate	Back, Hamstrings	Strength	3	Build Muscle	Strength Training at Gym
91	Dumbbell	Dumbbell renegade Rows	Intermediate	Back, Biceps	Strength	3	Build Muscle	Strength Training at Gym
92	Dumbbell	Dumbbell Arnold Press	Intermediate	Chest, Shoulders	Strength	3	Build Muscle	Strength Training at Gym
93	Dumbbell	Dumbbell Snatch	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
94	Dumbbell	Dumbbell Single Leg Deadlift	Advanced	Back, Hamstrings	Strength	4	Build Muscle	Strength Training at Gym
95	Dumbbell	Dumbbell Turkish Get-Up	Advanced	Full Body, Core	Strength	4	Build Muscle	Strength Training at Gym
96	Dumbbell	Dumbbell Thrusters	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
97	Dumbbell	Dumbbell Farmer's Walk	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
98	Dumbbell	Dumbbell Bench Press	Intermediate	Back, Biceps	Cardio	3	Fat Loss	Strength Training at Gym
99	Dumbbell	Dumbbell Lunges	Beginner	Back, Biceps	Mobility	2	Flexibility & Rehab	Mobility & Rehab
100	HIIT	Skater Jumps	Advanced	Hips	Cardio	4	Fat Loss	Fat Loss at Home
101	HIIT	Jump Squats	Beginner	Shoulders	Mobility	2	Flexibility & Rehab	Fat Loss at Home
102	HIIT	Burpee to Tuck Jump	Beginner	Back, Biceps	Core	2	Core Stability	Fat Loss at Home
103	HIIT	Lunge Jumps	Beginner	Hamstrings	Strength	2	Build Muscle	Fat Loss at Home
104	HIIT	High Knees	Intermediate	Hamstrings	Endurance	4	Stamina	Quick 10-Min Burners
105	HIIT	Jumping Lunges	Intermediate	Legs, Core	Cardio	4	Fat Loss	Fat Loss at Home
106	HIIT	Burpee Broad Jumps	Advanced	Full Body	Cardio	4	Fat Loss	Fat Loss at Home
107	HIIT	Plank to Push-up	Intermediate	Core, Arms	Cardio	4	Fat Loss	Core Strength & Stability
108	HIIT	High Knees with Twist	Intermediate	Core, Legs	Cardio	4	Fat Loss	Core Strength & Stability
109	HIIT	Fast Feet + Drop	Intermediate	Legs	Cardio	4	Fat Loss	Fat Loss at Home
110	Isometric	Insometric Push-up Hold (mid-position)	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
111	Isometric	Isometric Yogi Squat Hold	Beginner	Legs, Glutes	Strength	2	Build Muscle	Strength Training at Gym
112	Isometric	Static Lunge Hold	Beginner	Legs, Glutes	Strength	2	Build Muscle	Strength Training at Gym
113	Isometric	Extended Wall Sit	Intermediate	Full Body	Endurance	3	Stamina	Quick 10-Min Burners
114	Isometric	Extended Plank	Intermediate	Core	Endurance	3	Stamina	Core Strength & Stability
115	Isometric	Isometric Pull-up Hold (at top)	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
116	Isometric	Bridge Hold	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
117	Isometric	Isometric Calf Raise Hold	Intermediate	Full Body	Core	3	Core Stability	Core Strength & Stability
118	Isometric	Single -Leg Wall sit	Advanced	Full Body	Endurance	4	Stamina	Quick 10-Min Burners
119	Isometric	Isometric Deadlift Hold (mid-shinlevel)	Advanced	Back, Hamstrings	Strength	4	Build Muscle	Strength Training at Gym
120	Isometric	Hanstand Hold against wall	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
121	Isometric	Isometric Squat Hold (90 degree angle)	Advanced	Legs, Glutes	Strength	4	Build Muscle	Strength Training at Gym
122	Kettlebell	Kettlebell Swings	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
123	Kettlebell	Goblet Squats	Beginner	Legs, Glutes	Strength	2	Build Muscle	Strength Training at Gym
124	Kettlebell	Kettlebell Deadlifts	Beginner	Back, Hamstrings	Strength	2	Build Muscle	Strength Training at Gym
125	Kettlebell	Single Arm Kettlebell Press	Beginner	Chest, Shoulders	Strength	2	Build Muscle	Strength Training at Gym
126	Kettlebell	Kettlebell Russian Twists	Beginner	Core	Core	2	Core Stability	Core Strength & Stability
127	Kettlebell	Turkish Get-Ups	Intermediate	Full Body, Core	Strength	4	Build Muscle	Strength Training at Gym
128	Kettlebell	Kettlebell Clean and Press	Intermediate	Chest, Shoulders	Strength	4	Build Muscle	Strength Training at Gym
129	Kettlebell	Kettlebell Lunge Press	Intermediate	Legs, Glutes	Strength	4	Build Muscle	Strength Training at Gym
130	Kettlebell	Kettlebell High Pulls	Intermediate	Full Body	Strength	4	Build Muscle	Strength Training at Gym
131	Kettlebell	Double Kettlebell Swings	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
132	Kettlebell	Kettlebell Snatch	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
133	Kettlebell	Double Kettlebell Turkish Get-Ups	Advanced	Full Body, Core	Strength	4	Build Muscle	Strength Training at Gym
134	Kettlebell	Kettlebell Windmill	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
135	Kettlebell	Kettlebell Complex (Swing, Clean, Squat, Press)	Advanced	Legs, Glutes	Strength	4	Build Muscle	Strength Training at Gym
136	Kettlebell	Kettlebell Swing	Advanced	Shoulders	Core	4	Core Stability	Core Strength & Stability
137	Kettlebell	Kettlebell Clean	Intermediate	Obliques	Mobility	4	Flexibility & Rehab	Mobility & Rehab
138	Kettlebell	Goblet Squat	Beginner	Full Body	Flexibility	2	Flexibility & Rehab	Strength Training at Gym
139	Kettlebell	Turkish Get-up	Advanced	Lower Back	Strength	4	Build Muscle	Strength Training at Gym
140	Mobility	Ankle Circles	Beginner	Full Body	Strength	1	Build Muscle	Mobility & Rehab
141	Mobility	Wrist Extension	Beginner	Full Body	Strength	1	Build Muscle	Mobility & Rehab
142	Mobility	Shoulder Rolls	Beginner	Full Body	Strength	1	Build Muscle	Mobility & Rehab
143	Mobility	Cat-Cow Stretch	Beginner	Full Body	Strength	1	Build Muscle	Mobility & Rehab
144	Mobility	Hip Circles	Beginner	Full Body	Strength	1	Build Muscle	Mobility & Rehab
145	Mobility	Leg Swings	Intermediate	Full Body	Strength	2	Build Muscle	Mobility & Rehab
146	Mobility	Arm Circles	Intermediate	Full Body	Strength	2	Build Muscle	Mobility & Rehab
147	Mobility	Deep Lunge with rotation	Intermediate	Legs, Glutes	Strength	2	Build Muscle	Mobility & Rehab
148	Mobility	Thoracic Spine Windmills	Intermediate	Full Body	Strength	2	Build Muscle	Mobility & Rehab
149	Mobility	Spiderman Stretch	Intermediate	Full Body	Strength	2	Build Muscle	Mobility & Rehab
150	Mobility	Dynamic Pigeon Pose	Advanced	Full Body	Strength	3	Build Muscle	Mobility & Rehab
151	Mobility	Inchworms	Advanced	Full Body	Strength	3	Build Muscle	Mobility & Rehab
152	Mobility	Wall Slides	Advanced	Full Body	Strength	3	Build Muscle	Mobility & Rehab
153	Mobility	Overhead Squat (with resistance band)	Advanced	Legs, Glutes	Strength	3	Build Muscle	Mobility & Rehab
154	Mobility	World’s Greatest Stretch	Advanced	Hips	Flexibility	3	Flexibility & Rehab	Mobility & Rehab
155	Mobility	Thoracic Rotations	Advanced	Hamstrings	Flexibility	3	Flexibility & Rehab	Mobility & Rehab
156	Mobility	Hip Flexor Stretch	Intermediate	Back, Biceps	Flexibility	2	Flexibility & Rehab	Mobility & Rehab
157	Parkour Conditioning	Wall Run	Intermediate	Obliques	Power	3	Explosive Performance	Explosive Power Training
158	Parkour Conditioning	Cat Leap	Intermediate	Legs, Glutes	Endurance	3	Stamina	Quick 10-Min Burners
159	Parkour Conditioning	Precision Jump	Advanced	Obliques	Strength	4	Build Muscle	Fat Loss at Home
160	Parkour Conditioning	Quadrupedal Crawl	Advanced	Shoulders	Core	4	Core Stability	Core Strength & Stability
161	Parkour Conditioning	Kong Vault	Intermediate	Obliques	Flexibility	3	Flexibility & Rehab	Mobility & Rehab
162	Pilates	Hundred	Beginner	Back, Biceps	Core	2	Core Stability	Core Strength & Stability
163	Pilates	Roll-Up	Advanced	Back, Biceps	Endurance	4	Stamina	Quick 10-Min Burners
164	Pilates	Leg Circles	Intermediate	Full Body	Power	3	Explosive Performance	Explosive Power Training
165	Pilates	Single-Leg Stretch	Intermediate	Core	Mobility	3	Flexibility & Rehab	Mobility & Rehab
166	Pilates	Spine Stretch Forward	Beginner	Legs, Glutes	Core	2	Core Stability	Core Strength & Stability
167	Plyometrics	Box Jumps	Intermediate	Legs, Core	Power	4	General Fitness	Fat Loss at Home
168	Plyometrics	Broad Jumps	Intermediate	Glutes, Hamstrings	Power	4	General Fitness	Fat Loss at Home
169	Plyometrics	Clap Push-ups	Advanced	Chest, Triceps	Power	4	General Fitness	Explosive Power Training
170	Plyometrics	Lateral Bounds	Advanced	Hips	Cardio	4	Fat Loss	Fat Loss at Home
171	Plyometrics	Depth Jumps	Beginner	Legs, Glutes	Endurance	2	Stamina	Fat Loss at Home
172	Powerlifting	Deadlift Lockout	Advanced	Full Body	Cardio	4	Fat Loss	Fat Loss at Home
173	Powerlifting	Board Press	Beginner	Full Body	Endurance	2	Stamina	Strength Training at Gym
174	Powerlifting	Box Squat	Intermediate	Legs, Glutes	Flexibility	3	Flexibility & Rehab	Strength Training at Gym
175	Powerlifting	Pause Squat	Beginner	Back, Biceps	Cardio	2	Fat Loss	Strength Training at Gym
176	Powerlifting	Rack Pull	Advanced	Lower Back	Endurance	4	Stamina	Quick 10-Min Burners
177	Prehab	Banded Shoulder Dislocates	Beginner	Shoulders	Mobility	2	Flexibility & Rehab	Mobility & Rehab
178	Prehab	Wall Angels	Beginner	Upper Back	Mobility	2	Flexibility & Rehab	Mobility & Rehab
179	Prehab	Shoulder External Rotations	Beginner	Shoulders	Mobility	2	Flexibility & Rehab	Mobility & Rehab
180	Prehab	Ankle Alphabet	Beginner	Ankles	Mobility	2	Flexibility & Rehab	Mobility & Rehab
181	Prehab	Scapular Wall Slides	Beginner	Shoulders, Upper Back	Mobility	2	Flexibility & Rehab	Mobility & Rehab
182	Prehab	Dead Hangs	Beginner	Spine, Shoulders	Mobility	2	Flexibility & Rehab	Mobility & Rehab
183	Prehab	Knee Taps	Beginner	Knees	Mobility	2	Flexibility & Rehab	Mobility & Rehab
184	Prenatal Fitness	Wall Push-up	Beginner	Legs, Glutes	Flexibility	2	Flexibility & Rehab	Mobility & Rehab
185	Prenatal Fitness	Bird Dog	Intermediate	Shoulders	Endurance	3	Stamina	Quick 10-Min Burners
186	Prenatal Fitness	Standing Cat Cow	Beginner	Chest, Triceps	Flexibility	2	Flexibility & Rehab	Mobility & Rehab
187	Prenatal Fitness	Pelvic Tilts	Intermediate	Hips	Power	3	Explosive Performance	Explosive Power Training
188	Reformer Pilates	Footwork on Reformer	Advanced	Hamstrings	Endurance	4	Stamina	Quick 10-Min Burners
189	Reformer Pilates	Long Stretch	Advanced	Shoulders	Core	4	Core Stability	Core Strength & Stability
190	Reformer Pilates	Elephant	Advanced	Hips	Core	4	Core Stability	Core Strength & Stability
191	Reformer Pilates	Chest Expansion	Intermediate	Hips	Mobility	3	Flexibility & Rehab	Mobility & Rehab
192	Reformer Pilates	Knee Stretches	Intermediate	Obliques	Cardio	3	Fat Loss	Fat Loss at Home
193	Resistance Band	Resistance Band Pull-Aparts	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
194	Resistance Band	Resistance Band Bicep Curls	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
195	Resistance Band	Resistance Band Squats	Beginner	Legs, Glutes	Strength	2	Build Muscle	Strength Training at Gym
196	Resistance Band	Resistance Band Overhead Press	Beginner	Chest, Shoulders	Strength	2	Build Muscle	Strength Training at Gym
197	Resistance Band	Resistance Band Leg Press	Beginner	Chest, Shoulders	Strength	2	Build Muscle	Strength Training at Gym
198	Resistance Band	Resistance Band Chest Press	Intermediate	Chest, Shoulders	Strength	2	Build Muscle	Strength Training at Gym
199	Resistance Band	Resistance Band Rows	Intermediate	Back, Biceps	Strength	2	Build Muscle	Strength Training at Gym
200	Resistance Band	Resistance Band Deadlifts	Intermediate	Back, Hamstrings	Strength	2	Build Muscle	Strength Training at Gym
201	Resistance Band	Resistance Band Lateral Walks	Intermediate	Full Body	Strength	2	Build Muscle	Strength Training at Gym
202	Resistance Band	Resistance Band Pallof Press	Intermediate	Chest, Shoulders	Strength	2	Build Muscle	Strength Training at Gym
203	Resistance Band	Resistance Band Single-Leg Deadlift	Advanced	Back, Hamstrings	Strength	4	Build Muscle	Strength Training at Gym
204	Resistance Band	Resistance Band Pull-ups	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
205	Resistance Band	Resistance Band Push-Ups	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
206	Resistance Band	Resistance Band Woodchoppers	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
207	Resistance Band	Resistance Band Turkish Get-Ups	Advanced	Full Body, Core	Strength	4	Build Muscle	Strength Training at Gym
208	Resistance Band	Band Squats	Intermediate	Core	Endurance	2	Stamina	Strength Training at Gym
209	Resistance Band	Band Glute Kickbacks	Advanced	Shoulders	Endurance	4	Stamina	Quick 10-Min Burners
210	Resistance Band	Band Rows	Intermediate	Shoulders	Core	2	Core Stability	Strength Training at Gym
211	Resistance Band	Band Pull Aparts	Advanced	Obliques	Cardio	4	Fat Loss	Fat Loss at Home
212	Resistance Band	Band Chest Press	Intermediate	Back, Biceps	Flexibility	2	Flexibility & Rehab	Strength Training at Gym
213	Senior Fitness	Chair Squats	Beginner	Legs, Glutes	Strength	1	Build Muscle	Functional Fitness for Seniors
214	Senior Fitness	Seated Arm Circles	Beginner	Shoulders	Mobility	1	Flexibility & Rehab	Functional Fitness for Seniors
215	Senior Fitness	Marching in Place	Beginner	Legs, Core	Cardio	1	Fat Loss	Functional Fitness for Seniors
216	Senior Fitness	Wall Push-ups	Beginner	Back, Biceps	Power	1	Explosive Performance	Functional Fitness for Seniors
217	Senior Fitness	Heel Raises	Advanced	Lower Back	Power	3	Explosive Performance	Functional Fitness for Seniors
218	Senior Fitness	Seated Marches	Advanced	Obliques	Core	3	Core Stability	Functional Fitness for Seniors
219	Senior Fitness	Seated Toe Taps	Beginner	Legs	Mobility	1	Flexibility & Rehab	Functional Fitness for Seniors
220	Senior Fitness	Wall Slides	Beginner	Shoulders	Mobility	1	Flexibility & Rehab	Functional Fitness for Seniors
221	Senior Fitness	Sit-to-Stand	Beginner	Legs, Core	Strength	1	Build Muscle	Functional Fitness for Seniors
222	Senior Fitness	Neck Rotations	Beginner	Neck	Mobility	1	Flexibility & Rehab	Functional Fitness for Seniors
223	Senior Fitness	Overhead Reach	Beginner	Shoulders, Arms	Mobility	1	Flexibility & Rehab	Functional Fitness for Seniors
224	Sports Conditioning	Sprint Start	Beginner	Legs, Glutes	Endurance	2	Stamina	Quick 10-Min Burners
225	Sports Conditioning	Agility Ladder Drill	Advanced	Lower Back	Strength	4	Build Muscle	Strength Training at Gym
226	Sports Conditioning	Medicine Ball Slam	Advanced	Core	Cardio	4	Fat Loss	Fat Loss at Home
227	Sports Conditioning	Cone Drill	Advanced	Chest, Triceps	Mobility	4	Flexibility & Rehab	Mobility & Rehab
228	Sports Conditioning	Tuck Jump	Advanced	Hamstrings	Power	4	Explosive Performance	Fat Loss at Home
229	Stretching	Neck Side Stretch	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
230	Stretching	Chest Opener	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
231	Stretching	Seated Hamstring Stretch	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
232	Stretching	Spinal Twist	Beginner	Core	Core	2	Core Stability	Core Strength & Stability
233	Stretching	Standing Quad Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
234	Stretching	Butterfly Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
235	Stretching	Piriformis Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
236	Stretching	Kneeling Hip Flexor Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
237	Stretching	Cobra Pose	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
238	Stretching	Pigeon Pose	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
239	Stretching	Standing Forward Bend	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
240	Stretching	Camel Pose	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
241	Stretching	Deep Lunge with Twist	Advanced	Legs, Glutes	Core	4	Core Stability	Core Strength & Stability
242	Stretching	Bridge Pose	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
243	TRX	TRX Rows	Beginner	Back, Biceps	Strength	2	Build Muscle	Strength Training at Gym
244	TRX	TRX Chest Press	Intermediate	Chest, Shoulders	Strength	3	Build Muscle	Strength Training at Gym
245	TRX	TRX Pike	Advanced	Core, Shoulders	Core	4	Core Stability	Core Strength & Stability
246	TRX	TRX Lunge	Advanced	Full Body	Mobility	4	Flexibility & Rehab	Mobility & Rehab
247	TRX	TRX Y-Fly	Advanced	Core	Power	4	Explosive Performance	Explosive Power Training
248	TRX	TRX Row	Intermediate	Hips	Power	3	Explosive Performance	Strength Training at Gym
249	TRX	TRX Power Pull	Intermediate	Back, Arms	Strength	3	Build Muscle	Strength Training at Gym
250	TRX	TRX Hamstring Curls	Intermediate	Hamstrings, Glutes	Strength	3	Build Muscle	Strength Training at Gym
251	TRX	TRX Chest Fly	Intermediate	Chest, Shoulders	Strength	3	Build Muscle	Strength Training at Gym
252	TRX	TRX Mountain Climbers	Intermediate	Core, Legs	Cardio	3	Fat Loss	Fat Loss at Home
253	TRX	TRX T Deltoid Fly	Intermediate	Shoulders, Back	Strength	3	Build Muscle	Strength Training at Gym
254	Warm-up	Jumping Jacks	Beginner	Full Body	Cardio	2	Fat Loss	Fat Loss at Home
255	Warm-up	Butt Kicks	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
256	Warm-up	Torso Twists	Beginner	Core	Core	2	Core Stability	Core Strength & Stability
257	Warm-up	Lunges with Twist	Beginner	Legs, Glutes	Core	2	Core Stability	Core Strength & Stability
258	Warm-up	Ankle Bounces	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
259	Warm-up	Side Shuffles	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
260	Warm-up	Toy Soldiers	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
261	Warm-up	Knee Hugs	Beginner	Full Body	Strength	2	Build Muscle	Strength Training at Gym
262	Warm-up	Arm Swings	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
263	Warm-up	Shoulder Shrugs	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
264	Warm-up	Hamstring Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
265	Warm-up	Quad Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
266	Warm-up	Calf Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
267	Warm-up	Groin Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
268	Warm-up	Triceps Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
269	Warm-up	Dynamic Squats	Intermediate	Legs, Glutes	Strength	3	Build Muscle	Strength Training at Gym
270	Warm-up	Neck Stretch	Intermediate	Full Body	Strength	3	Build Muscle	Strength Training at Gym
271	Warm-up	Lat Stretch	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
272	Warm-up	Wrist Flexor Stretch	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
273	Warm-up	Wrist Extensor Stretch	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
274	Warm-up	Standing Side Stretch	Advanced	Full Body	Strength	4	Build Muscle	Strength Training at Gym
275	Yoga	Child’s Pose	Advanced	Shoulders	Power	3	Explosive Performance	Mobility & Rehab
276	Yoga	Downward Dog	Advanced	Core	Core	3	Core Stability	Mobility & Rehab
277	Yoga	Tree Pose	Beginner	Hips	Mobility	1	Flexibility & Rehab	Mobility & Rehab
278	Yoga	Warrior II	Beginner	Shoulders	Core	1	Core Stability	Mobility & Rehab
279	Yoga	Half Moon Pose	Beginner	Core, Legs	Flexibility	1	Flexibility & Rehab	Mobility & Rehab
280	Yoga	Bridge Pose	Beginner	Glutes, Spine	Flexibility	1	Flexibility & Rehab	Mobility & Rehab
281	Yoga	Pigeon Pose	Intermediate	Hips	Flexibility	2	Flexibility & Rehab	Mobility & Rehab
282	Yoga	Reclining Twist	Beginner	Spine	Flexibility	1	Flexibility & Rehab	Core Strength & Stability
283	Yoga	Camel Pose	Intermediate	Chest, Spine	Flexibility	2	Flexibility & Rehab	Mobility & Rehab
284	Sports	Tennis	Beginner	Full Body	Cardio	3	General Fitness	Sports Conditioning
287	Sports	Basketball	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
288	Sports	Soccer	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
289	Sports	Swimming	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
291	Sports	Volleyball	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
292	Sports	Badminton	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
293	Sports	Table Tennis	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
294	Sports	Baseball	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
295	Sports	Cricket	Intermediate	Full Body	Cardio	3	General Fitness	Sports Conditioning
296	Sports	Rugby	Advanced	Full Body	Cardio	3	General Fitness	Sports Conditioning
297	Sports	Boxing	Advanced	Full Body	Cardio	3	General Fitness	Sports Conditioning
298	Sports	Martial Arts	Advanced	Full Body	Cardio	3	General Fitness	Sports Conditioning
299	Sports	Rock Climbing	Advanced	Full Body	Cardio	3	General Fitness	Sports Conditioning
300	Sports	Surfing	Advanced	Full Body	Cardio	3	General Fitness	Sports Conditioning
301	Sports	Skiing	Advanced	Full Body	Cardio	3	General Fitness	Sports Conditioning
302	Sports	Snowboarding	Advanced	Full Body	Cardio	3	General Fitness	Sports Conditioning
303	Sports	Hiking	Intermediate	Full Body	Cardio	2	General Fitness	Sports Conditioning
304	Sports	Sports	Beginner	Legs	Cardio	1	Stamina	Daily Movement
305	Sports	Jogging	Beginner	Legs	Cardio	2	Stamina	Light Endurance
306	Sports	Running	Intermediate	Legs, Core	Cardio	3	Endurance	Aerobic Fitness
307	Sports	Cycling (Outdoor)	Beginner	Legs	Cardio	2	Endurance	Outdoor Cardio
308	Sports	Skipping Rope	Intermediate	Full Body	Cardio	3	Cardio Burn	Agility and Endurance
309	Sports	Hiking	Intermediate	Legs, Core	Endurance	3	Cardio Endurance	Nature Activity
311	Sports	Stair Climbing	Intermediate	Legs	Strength	3	Leg Strength	Low-Impact Cardio
312	Sports	Elliptical Trainer	Beginner	Full Body	Cardio	2	Cardio Health	Low-Impact Burn
313	Sports	Rowing Machine	Intermediate	Back, Legs, Core	Cardio	3	Total Body Burn	Indoor Cardio
314	Sports	Yoga (Self-guided)	Beginner	Full Body	Mobility	2	Flexibility	Mind-Body Balance
315	Sports	Stretching Routine	Beginner	Full Body	Mobility	1	Flexibility	Daily Mobility
316	Sports	Mat Pilates	Intermediate	Core, Hips	Core	2	Core Strength	Controlled Movement
317	Sports	Breathwork	Beginner	Lungs, Mind	Relaxation	1	Recovery	Mental Reset
319	Sports	Meditation	Beginner	Mind	Mental	0	Focus	Daily Clarity
321	Sports	Push-ups	Beginner	Chest, Triceps	Strength	2	Upper Body Strength	Bodyweight Conditioning
322	Sports	Squats	Beginner	Legs, Glutes	Strength	2	Leg Strength	Home Workout
323	Sports	Lunges	Beginner	Glutes, Quads	Strength	2	Lower Body Strength	Body Control
324	Sports	Planks	Beginner	Core	Core	2	Core Stability	Home Friendly
325	Sports	Crunches	Beginner	Abs	Core	1	Core Activation	Floor Work
326	Sports	Jumping Jacks	Beginner	Full Body	Cardio	2	Quick Burn	Warm-up Routine
327	Sports	Mountain Climbers	Intermediate	Core, Legs	Cardio	3	Fat Burn	HIIT Movement
328	Sports	Wall Sit	Beginner	Legs	Strength	2	Isometric Strength	Leg Endurance
329	Sports	Burpees	Advanced	Full Body	Cardio	4	HIIT Burn	Explosive Cardio
331	Sports	Swimming	Intermediate	Full Body	Cardio	3	Cardiovascular Health	Low Impact
332	Sports	Dance Workout	Beginner	Full Body	Cardio	3	Fat Burn	Fun Movement
334	Sports	Shadow Boxing	Intermediate	Arms, Core	Cardio	3	Coordination	Cardio Skill
336	Sports	Skating	Beginner	Legs, Core	Balance	3	Fun & Cardio	Outdoor Movement
338	Sports	Frisbee Throwing (Solo)	Beginner	Shoulders, Core	Recreation	1	Light Activity	Movement & Play
339	Strength	Kettlebell Sumo Squat	Intermediate	Glutes, Quads, Hamstrings	Strength	3	Build Muscle	Lower Body Strength
340	Strength	Bicep Curl	Beginner	Biceps	Strength	2	Build Muscle	Arm Strength
341	Strength	Triceps Press	Beginner	Triceps	Strength	2	Build Muscle	Arm Strength
343	Strength	Lunges	Beginner	Glutes, Quads, Hamstrings	Strength	2	Build Muscle	Lower Body Strength
345	Strength	Pull-ups	Advanced	Back, Biceps	Strength	4	Build Muscle	Upper Body Strength
346	Strength	Bent Over Row	Intermediate	Back, Biceps	Strength	3	Build Muscle	Upper Body Strength
347	Glutes	Glute Bridge	Beginner	Glutes	Strength	2	Build Muscle	Glute Activation
348	Cardio	Jumping Jacks	Beginner	Full Body	Cardio	2	Fat Loss	Fat Loss at Home
349	Cardio	Mountain Climbers	Intermediate	Core, Legs, Shoulders	Cardio	3	Fat Loss	HIIT & Conditioning
350	Strength	Deadlift	Advanced	Back, Glutes, Hamstrings	Strength	4	Build Muscle	Full Body Strength
351	Strength	Overhead Press	Intermediate	Shoulders, Triceps	Strength	3	Build Muscle	Shoulder Strength
352	Warm-up	Arm Circles	Beginner	Shoulders	Mobility	1	Warm-up	Joint Mobility
353	Warm-up	High Knees	Beginner	Legs	Cardio	2	Warm-up	Cardio Activation
354	Mobility	World's Greatest Stretch	Intermediate	Hips, Hamstrings, Shoulders	Mobility	2	Mobility	Full Body Mobility
355	Mobility	Thoracic Spine Rotation	Beginner	Back	Mobility	1	Mobility	Thoracic Mobility
356	Rehab	Wall Slides	Beginner	Shoulders	Mobility	1	Rehabilitation	Shoulder Rehab
357	Rehab	Clamshells	Beginner	Glutes	Strength	1	Rehabilitation	Hip Strength
358	Rehab	Ankle Alphabet	Beginner	Ankles	Mobility	1	Rehabilitation	Ankle Mobility
359	Machine	Leg Press	Beginner	Quads, Glutes	Strength	3	Build Muscle	Lower Body Strength
360	Machine	Lat Pulldown	Beginner	Back, Biceps	Strength	3	Build Muscle	Upper Body Strength
361	Machine	Chest Press Machine	Beginner	Chest, Triceps	Strength	3	Build Muscle	Chest Strength
362	Machine	Cable Row	Intermediate	Back, Biceps	Strength	3	Build Muscle	Back Strength
363	Machine	Leg Curl Machine	Beginner	Hamstrings	Strength	2	Build Muscle	Hamstring Strength
364	Yoga	Cobra Pose	Beginner	Back	Mobility	2	Flexibility	Spinal Extension
365	Yoga	Child's Pose	Beginner	Back, Hips	Relaxation	1	Recovery	Restorative Yoga
366	Yoga	Warrior I	Beginner	Legs, Shoulders	Strength	2	Mobility	Yoga for Strength
367	Yoga	Triangle Pose	Intermediate	Hips, Back	Mobility	2	Flexibility	Lateral Stretching
368	Yoga	Seated Forward Bend	Beginner	Hamstrings, Back	Mobility	2	Flexibility	Hamstring Stretch
369	Yoga	Boat Pose	Intermediate	Core	Core	3	Core Strength	Yoga for Abs
370	Yoga	Chair Pose	Beginner	Quads, Glutes	Strength	2	Build Muscle	Yoga for Legs
371	Yoga	Plank to Cobra Flow	Intermediate	Full Body	Flow	3	Mobility	Yoga Flow
372	Yoga	Savasana	Beginner	Full Body	Relaxation	1	Recovery	Mind-Body Relaxation
373	Yoga	Eagle Pose	Advanced	Full Body	Balance	3	Balance	Stability and Focus
374	Strength	Barbell Bench Press	Intermediate	Chest, Triceps	Strength	4	Build Muscle	Chest Strength
375	Strength	Incline Dumbbell Press	Intermediate	Chest, Shoulders	Strength	3	Build Muscle	Upper Chest Strength
376	Strength	Dumbbell Fly	Intermediate	Chest	Strength	2	Build Muscle	Chest Isolation
377	Strength	Dumbbell Lateral Raise	Beginner	Shoulders	Strength	2	Build Muscle	Shoulder Isolation
378	Strength	Seated Cable Row	Intermediate	Back, Biceps	Strength	3	Build Muscle	Back Strength
379	Strength	Preacher Curl	Intermediate	Biceps	Strength	2	Build Muscle	Biceps Isolation
380	Strength	Skull Crushers	Intermediate	Triceps	Strength	3	Build Muscle	Triceps Strength
381	Strength	Smith Machine Squat	Intermediate	Quads, Glutes	Strength	3	Build Muscle	Leg Strength
382	Strength	Calf Raises	Beginner	Calves	Strength	2	Build Muscle	Calf Strength
383	Strength	Face Pulls	Intermediate	Shoulders, Upper Back	Strength	3	Posture	Shoulder Health
384	Mixed	Barbell Squat	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
385	Mixed	Barbell Hip Thrust	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
386	Mixed	Dumbbell Chest Press	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
387	Mixed	Dumbbell Row	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
388	Mixed	Dumbbell Romanian Deadlift	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
389	Mixed	Dumbbell Step Up	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
390	Mixed	Dumbbell Split Squat	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
391	Mixed	Dumbbell Pullover	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
392	Mixed	Kettlebell Turkish Get-Up	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
393	Mixed	Kettlebell Deadlift	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
394	Mixed	Chin-ups	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
395	Mixed	Pistol Squats	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
396	Mixed	Hollow Body Hold	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
397	Mixed	Russian Twist	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
398	Mixed	Hanging Leg Raise	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
399	Mixed	Cable Woodchop	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
400	Mixed	Skaters	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
401	Mixed	High Knees to Tuck Jump	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
402	Mixed	Sled Push	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
403	Mixed	90-90 Hip Switch	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
404	Mixed	Scapular Push-up	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
405	Mixed	Thoracic Bridge	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
406	Mixed	Pec Deck Fly	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
407	Mixed	Leg Extension	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
408	Mixed	Hack Squat	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
409	Mixed	Calf Press on Leg Press	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
410	Mixed	Assisted Pull-up	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
411	Mixed	Cable Lateral Raise	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
412	Mixed	Upward Facing Dog	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
413	Mixed	Cow Face Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
414	Mixed	Revolved Triangle Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
415	Mixed	Battle Rope Slam	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
416	Mixed	Sled Drag	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
417	Mixed	Tire Flip	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
418	Mixed	Farmer’s Carry	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
419	Mixed	Incline Dumbbell Fly	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
420	Mixed	Incline Bench Press	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
421	Mixed	Zottman Curl	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
422	Mixed	Reverse Curl	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
423	Mixed	Overhead Triceps Extension	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
424	Mixed	Cable Chest Crossover	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
425	Mixed	Cable Face Pull	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
426	Mixed	Arnold Press	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
427	Mixed	Lying Triceps Extension	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
428	Mixed	Concentration Curl	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
429	Mixed	Bulgarian Split Squat	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
430	Mixed	Step-Through Lunges	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
431	Mixed	Sumo Deadlift	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
432	Mixed	Walking Lunges	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
433	Mixed	Kettlebell Goblet Squat	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
434	Mixed	Trap Bar Deadlift	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
435	Mixed	Reverse Nordic Curl	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
436	Mixed	Sissy Squat	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
437	Mixed	Plank Reach	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
438	Mixed	Weighted Sit-Up	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
439	Mixed	Kneeling Cable Crunch	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
440	Mixed	Swiss Ball Stir the Pot	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
441	Mixed	V-Ups	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
442	Mixed	Toe Touches	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
443	Mixed	L-Sit Hold	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
444	Mixed	Side Plank with Reach Under	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
445	Mixed	Jump Lunge	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
446	Mixed	Broad Jump	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
447	Mixed	Power Skip	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
448	Mixed	Mountain Climber Twist	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
449	Mixed	Plank Jack	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
450	Mixed	Battle Rope Alternating Wave	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
451	Mixed	Box Jump	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
452	Mixed	Jump Rope Double Under	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
453	Mixed	Agility Ladder Shuffle	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
454	Mixed	Banded Glute Bridge	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
455	Mixed	Monster Walks	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
456	Mixed	Sidelying Leg Raise	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
457	Mixed	Wrist Mobility Rolls	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
458	Mixed	Forearm Wall Slide	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
459	Mixed	Shoulder External Rotation	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
460	Mixed	Scapular Wall Slide	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
461	Mixed	Heel Slide	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
462	Mixed	Toe Yoga	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
463	Mixed	Isometric Quad Set	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
464	Mixed	Bound Angle Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
465	Mixed	Standing Forward Fold	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
466	Mixed	Twisted Chair Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
467	Mixed	Crow Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
468	Mixed	Fire Log Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
469	Mixed	Thread the Needle Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
470	Mixed	Bridge Wheel Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
471	Mixed	Plow Pose	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
472	Mixed	Reclined Bound Angle	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
473	Mixed	Supine Spinal Twist	Intermediate	Full Body	Strength	3	Build Muscle	Comprehensive Strength & Conditioning
474	Kettlebell	Half-Kneeling Kettlebell Woodchopper	Advanced	Core, Shoulders, Hips	Compound	4	Full Body Integration	Hybrid Strength + Coordination
475	Olympic	Vertical Clean to Reverse Lunge	Advanced	Full Body	Compound	4	Full Body Integration	Hybrid Strength + Coordination
476	Core	Cross-Leg Hand Raise	Advanced	Core, Glutes	Compound	4	Full Body Integration	Hybrid Strength + Coordination
477	Kettlebell	Single Arm Snatch to Overhead Lunge	Advanced	Shoulders, Legs, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
478	Strength	Curtsy Lunge with Front Raise	Advanced	Glutes, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
479	Functional	Lateral Lunge to Overhead Press	Advanced	Legs, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
480	Plyometric	Kneeling to Squat Jump	Advanced	Glutes, Quads	Compound	4	Full Body Integration	Hybrid Strength + Coordination
481	Strength	Single-Leg Deadlift to Row	Advanced	Hamstrings, Back	Compound	4	Full Body Integration	Hybrid Strength + Coordination
482	Strength	Push-up to Renegade Row	Advanced	Chest, Core, Back	Compound	4	Full Body Integration	Hybrid Strength + Coordination
483	Cardio	Mountain Climber to Kick Through	Advanced	Full Body	Compound	4	Full Body Integration	Hybrid Strength + Coordination
484	Kettlebell	Overhead March with Kettlebell	Advanced	Core, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
485	Functional	Skater Jump to Curtsy Lunge	Advanced	Legs, Glutes	Compound	4	Full Body Integration	Hybrid Strength + Coordination
486	Strength	Reverse Lunge to Knee Drive & Press	Advanced	Glutes, Core, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
487	Bodyweight	Bear Crawl to Push-up	Advanced	Shoulders, Chest, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
488	Mobility	Cossack Squat with Reach	Advanced	Hips, Glutes	Compound	4	Full Body Integration	Hybrid Strength + Coordination
489	Bodyweight	Tactical Get-up	Advanced	Full Body	Compound	4	Full Body Integration	Hybrid Strength + Coordination
490	Kettlebell	Kettlebell Figure 8 to Hold	Advanced	Glutes, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
491	Functional	Wall Ball Squat to Press	Advanced	Full Body	Compound	4	Full Body Integration	Hybrid Strength + Coordination
492	Core	Pallof Press with Split Stance	Advanced	Core, Glutes	Compound	4	Full Body Integration	Hybrid Strength + Coordination
493	Strength	Deadlift to Upright Row	Advanced	Hamstrings, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
494	Plyometric	Jumping Lunge with Twist	Advanced	Legs, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
495	Functional	Squat to Cross-body Punch	Advanced	Legs, Arms, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
496	Core	Low Plank Walkout to Pike	Advanced	Shoulders, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
497	Strength	Step Up to Biceps Curl & Press	Advanced	Legs, Biceps, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
498	Cable	Standing Cable Chop to Lunge	Advanced	Obliques, Glutes	Compound	4	Full Body Integration	Hybrid Strength + Coordination
499	Core	Side Plank to Crunch	Advanced	Obliques, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
500	Mobility	Kneeling Windmill with Dumbbell	Advanced	Core, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
501	Kettlebell	Kettlebell Swing to Snatch	Advanced	Hips, Back, Shoulders	Compound	4	Full Body Integration	Hybrid Strength + Coordination
502	Functional	Sled Push to Sprint	Advanced	Full Body	Compound	4	Full Body Integration	Hybrid Strength + Coordination
503	Kettlebell	Single Arm Clean to Press	Advanced	Shoulders, Core	Compound	4	Full Body Integration	Hybrid Strength + Coordination
504	Barbell	Landmine Rainbow	Advanced	Core, Shoulders	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
505	Barbell	Barbell Complex (Row, Clean, Press, Squat)	Advanced	Full Body	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
506	Core	Plank to Arm Reach with Dumbbell Drag	Advanced	Core, Shoulders	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
507	Kettlebell	Kettlebell Bottoms-Up Press	Advanced	Shoulders, Forearms	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
508	Functional	Reverse Bear Crawl with Resistance Band	Advanced	Shoulders, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
509	Kettlebell	Split Stance Kettlebell Swing	Advanced	Hips, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
510	Strength	Single Leg Glute Bridge with Chest Press	Advanced	Glutes, Chest	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
511	Isometric	Wall Sit with Overhead Plate Hold	Advanced	Quads, Shoulders	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
512	Kettlebell	Turkish Get-Up to Overhead Walk	Advanced	Full Body	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
513	Core	Copenhagen Side Plank	Advanced	Adductors, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
514	Functional	Sled Rope Pull	Advanced	Back, Biceps	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
515	Agility	Sprint to Backpedal Drill	Advanced	Full Body	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
516	Plyometric	Tire Jump In and Out	Advanced	Legs, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
517	Explosive	Resistance Band Sprint Start	Advanced	Glutes, Hamstrings	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
518	Power	Med Ball Slam to Squat Catch	Advanced	Shoulders, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
519	Strength	Farmer's Carry to Press	Advanced	Grip, Core, Shoulders	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
520	Strength	Offset Dumbbell Deadlift	Advanced	Hamstrings, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
521	Plyometric	Banded Lateral Walk to Squat Jump	Advanced	Glutes, Quads	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
522	TRX	TRX Atomic Push-Up	Advanced	Chest, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility
523	Explosive	Kneeling Jump to Box Jump	Advanced	Legs, Core	Compound	4	Performance & Stability	Hybrid Power, Control & Mobility`;

export interface Exercise {
  id: string;
  module_type: string;
  name: string;
  level: string;
  muscle_group: string;
  type: string;
  energy_points: number;
  goal: string;
  goal_specific: string;
}

function parseCsvToJson(csvData: string): Exercise[] {
  const lines = csvData.trim().split('\n');
  
  return lines.slice(1).map((line, index) => {
    const values = line.split('\t').map(value => value.trim());
    
    return {
      id: values[0].trim(),
      module_type: values[1].trim(),
      name: values[2].trim(),
      level: values[3].trim(),
      muscle_group: values[4].trim(),
      type: values[5].trim(),
      energy_points: parseInt(values[6].trim()),
      goal: values[7].trim(),
      goal_specific: values[8].trim()
    };
  });
}

export async function getExercises(): Promise<Exercise[]> {
    return parseCsvToJson(exercisesCsv);
}

// Helper function to get exercises by module type
export async function getExercisesByModuleType(module_type: string): Promise<Exercise[]> {
  const exercises = await getExercises();
  return exercises.filter(exercise => exercise.module_type === module_type);
}

// Helper function to get exercises by level
export async function getExercisesByLevel(level: string): Promise<Exercise[]> {
  const exercises = await getExercises();
  return exercises.filter(exercise => exercise.level === level);
}

// Helper function to get exercises by goal
export async function getExercisesByGoal(goal: string): Promise<Exercise[]> {
  const exercises = await getExercises();
  return exercises.filter(exercise => exercise.goal === goal);
}