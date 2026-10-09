--
-- PostgreSQL database dump
--

\restrict AylAhQGBI1K6gHruaE45a2HcWykqCIwkE9egClr5B8jnh8sKltAgJ5e0JpIwqe6

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: AcademicYear; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."AcademicYear" VALUES ('cmuzpubrc000x10oxeba1xb22', '2027-28', '2027-06-01 00:00:00', '2028-05-31 00:00:00', false, true, '2026-10-08 15:53:21.672', '2026-10-08 15:53:21.672', NULL);
INSERT INTO public."AcademicYear" VALUES ('cmuzp7hsm000ebynpfs5ze3wj', '2026-27', '2026-06-01 00:00:00', '2027-05-31 00:00:00', true, true, '2026-10-08 15:35:36.406', '2026-10-08 17:59:14.426', NULL);


--
-- Data for Name: School; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."School" VALUES ('cmuzu9oge0002ydphghgaadg6', 'SCSE', 'School of Computer Science and Engineering', 'Computing, Data Science, AI & Cyber Studies', NULL, true, '2026-10-08 17:57:16.43', '2026-10-08 17:59:14.433', NULL);
INSERT INTO public."School" VALUES ('cmuzu9ogg0003ydphf96cgbgs', 'SEEE', 'School of Electrical and Electronics Engineering', 'Electrical, Electronics & VLSI Systems', NULL, true, '2026-10-08 17:57:16.432', '2026-10-08 17:59:14.433', NULL);
INSERT INTO public."School" VALUES ('cmuzu9ogg0004ydph6vagboyw', 'SCMC', 'School of Chemical, Mechanical and Civil', 'Core Engineering Disciplines & Robotics', NULL, true, '2026-10-08 17:57:16.433', '2026-10-08 17:59:14.434', NULL);
INSERT INTO public."School" VALUES ('cmuzu9ogh0005ydphjtmm2pfn', 'SSCI', 'School of Sciences', 'Mathematical, Physical, Chemical & Biological Sciences, Applications', NULL, true, '2026-10-08 17:57:16.433', '2026-10-08 17:59:14.434', NULL);
INSERT INTO public."School" VALUES ('cmuzu9ogh0006ydphx00z30mh', 'SCM', 'School of Commerce and Management', 'Management, Business Analytics, Logistics & Enterprise', NULL, true, '2026-10-08 17:57:16.434', '2026-10-08 17:59:14.435', NULL);
INSERT INTO public."School" VALUES ('cmuzu9ogi0007ydphw5isz2ha', 'SAH', 'School of Arts and Humanities', 'Civil Service Studies, Languages, Economics & Humanities', NULL, true, '2026-10-08 17:57:16.434', '2026-10-08 17:59:14.435', NULL);


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."Department" VALUES ('cmuzu9ogj0009ydphloegjdx6', 'cmuzu9oge0002ydphghgaadg6', 'CSE', 'Department of Computer Science and Engineering', false, NULL, true, '2026-10-08 17:57:16.436', '2026-10-08 17:59:14.436', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogp000bydph8wd22scj', 'cmuzu9oge0002ydphghgaadg6', 'IT', 'Department of Information Technology', false, NULL, true, '2026-10-08 17:57:16.441', '2026-10-08 17:59:14.436', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogp000dydphib4mqn64', 'cmuzu9ogg0003ydphf96cgbgs', 'ECE', 'Department of Electronics and Communication Engineering', false, NULL, true, '2026-10-08 17:57:16.442', '2026-10-08 17:59:14.437', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogq000fydphc0dpxq2h', 'cmuzu9ogg0003ydphf96cgbgs', 'EEE', 'Department of Electrical and Electronics Engineering', false, NULL, true, '2026-10-08 17:57:16.442', '2026-10-08 17:59:14.437', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogr000hydphjmf7gen1', 'cmuzu9ogg0004ydph6vagboyw', 'MECH', 'Department of Mechanical Engineering', false, NULL, true, '2026-10-08 17:57:16.443', '2026-10-08 17:59:14.438', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogr000jydphx3bznqs0', 'cmuzu9ogg0004ydph6vagboyw', 'CIVIL', 'Department of Civil Engineering', false, NULL, true, '2026-10-08 17:57:16.444', '2026-10-08 17:59:14.438', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogr000lydphdn41j7wh', 'cmuzu9ogg0004ydph6vagboyw', 'CHEM', 'Department of Chemical Engineering', false, NULL, true, '2026-10-08 17:57:16.444', '2026-10-08 17:59:14.439', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogu000vydphxugprq5y', 'cmuzu9ogh0006ydphx00z30mh', 'MGMT', 'Department of Management Studies', false, NULL, true, '2026-10-08 17:57:16.446', '2026-10-08 17:59:14.44', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogu000xydph7g359w88', 'cmuzu9ogi0007ydphw5isz2ha', 'HSS', 'Department of Humanities and Social Sciences', false, NULL, true, '2026-10-08 17:57:16.447', '2026-10-08 17:59:14.441', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogs000nydph6e8x5r63', NULL, 'MATH', 'Department of Mathematics', true, NULL, true, '2026-10-08 17:57:16.444', '2026-10-08 17:59:14.439', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogs000pydphal3o60px', NULL, 'PHYS', 'Department of Physics', true, NULL, true, '2026-10-08 17:57:16.445', '2026-10-08 17:59:14.439', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogt000rydphged3u5y6', NULL, 'CHEM_SCI', 'Department of Chemistry', true, NULL, true, '2026-10-08 17:57:16.445', '2026-10-08 17:59:14.44', NULL);
INSERT INTO public."Department" VALUES ('cmuzu9ogt000tydphzkxjiy1r', NULL, 'ENG', 'Department of English', true, NULL, true, '2026-10-08 17:57:16.446', '2026-10-08 17:59:14.44', NULL);


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."User" VALUES ('cmuzu9oov004mydphjg2s99np', 'DM', 'dm@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. D Manasa', '+91 9440112233', true, false, '2026-10-08 18:00:33.114', 0, NULL, '2026-10-08 17:57:16.736', '2026-10-08 18:00:33.114', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ooj003sydph9ysvw492', 'KVP', 'kvp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. KV Padmavathi', '+91 9440112233', true, false, '2026-10-08 18:00:31.828', 0, NULL, '2026-10-08 17:57:16.724', '2026-10-08 18:00:31.829', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ool003xydphdqvmbd0b', 'MRR', 'mrr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. M Rama Rajeswari', '+91 9440112233', true, false, '2026-10-08 18:00:32.041', 0, NULL, '2026-10-08 17:57:16.726', '2026-10-08 18:00:32.042', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ooo0042ydph2cf7s60u', 'PSR', 'psr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. P Srinivas Rao', '+91 9440112233', true, false, '2026-10-08 18:00:32.255', 0, NULL, '2026-10-08 17:57:16.728', '2026-10-08 18:00:32.256', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ooq0047ydphbogdnye1', 'RN', 'rn@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Rani Nanda', '+91 9440112233', true, false, '2026-10-08 18:00:32.47', 0, NULL, '2026-10-08 17:57:16.731', '2026-10-08 18:00:32.47', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oos004cydphwkuc88w2', 'SA', 'sa@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. S Ashok', '+91 9440112233', true, false, '2026-10-08 18:00:32.683', 0, NULL, '2026-10-08 17:57:16.733', '2026-10-08 18:00:32.684', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oou004hydphvofh0ip3', 'BV', 'bv@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. B Vidya', '+91 9440112233', true, false, '2026-10-08 18:00:32.899', 0, NULL, '2026-10-08 17:57:16.734', '2026-10-08 18:00:32.9', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opo0074ydphr5czmqqq', 'ISR', 'isr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. I Srinivas Rao', '+91 9440112233', true, false, '2026-10-08 18:00:37.018', 0, NULL, '2026-10-08 17:57:16.764', '2026-10-08 18:00:37.018', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ooz004wydph7tohke43', 'PM', 'pm@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. P Manikanta', '+91 9440112233', true, false, '2026-10-08 18:00:33.547', 0, NULL, '2026-10-08 17:57:16.739', '2026-10-08 18:00:33.547', NULL);
INSERT INTO public."User" VALUES ('cmuzu9op00051ydph57trnn42', 'VBR', 'vbr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. V Bhaskar Rao', '+91 9440112233', true, false, '2026-10-08 18:00:33.763', 0, NULL, '2026-10-08 17:57:16.741', '2026-10-08 18:00:33.763', NULL);
INSERT INTO public."User" VALUES ('cmuzu9op20056ydph0wtyy3la', 'GS', 'gs@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mrs. G Sravani', '+91 9440112233', true, false, '2026-10-08 18:00:33.979', 0, NULL, '2026-10-08 17:57:16.743', '2026-10-08 18:00:33.979', NULL);
INSERT INTO public."User" VALUES ('cmuzp7hsc000bbynpr08m4i25', 'admin', 'admin@gvpihlr.edu.in', '$2a$12$olLcQ23IA0/wz/9ao901q.un91tdowzuc1DUEvtNvPsUZ2sGYuR5q', 'GVPIHLR Super Administrator', '+91 9876543210', true, false, '2026-10-08 18:05:57.574', 0, NULL, '2026-10-08 15:35:36.396', '2026-10-08 18:05:57.574', NULL);
INSERT INTO public."User" VALUES ('cmuzu9op6005gydphddh9mtce', 'DC', 'dc@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. D Chandravathi', '+91 9440112233', true, false, '2026-10-08 18:00:34.411', 0, NULL, '2026-10-08 17:57:16.746', '2026-10-08 18:00:34.412', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oof003iydphgyvr3cii', 'BSK', 'bsk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. B Santosh Kumar', '+91 9440112233', true, false, '2026-10-08 18:00:31.391', 0, NULL, '2026-10-08 17:57:16.72', '2026-10-08 18:00:31.392', NULL);
INSERT INTO public."User" VALUES ('cmuzu9op9005qydpho4pjs8iq', 'ADP', 'adp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. A Dhanunjaya Prasad', '+91 9440112233', true, false, '2026-10-08 18:00:34.842', 0, NULL, '2026-10-08 17:57:16.749', '2026-10-08 18:00:34.843', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opb005vydpha49v7tmk', 'BBK', 'bbk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. B Bala Krishna', '+91 9440112233', true, false, '2026-10-08 18:00:35.059', 0, NULL, '2026-10-08 17:57:16.751', '2026-10-08 18:00:35.059', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opc0060ydphcbp9oo8l', 'DAK', 'dak@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. D Arun Kumar', '+91 9440112233', true, false, '2026-10-08 18:00:35.275', 0, NULL, '2026-10-08 17:57:16.752', '2026-10-08 18:00:35.276', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opd0065ydphxdu1ouox', 'MA', 'ma@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. M Anil', '+91 9440112233', true, false, '2026-10-08 18:00:35.494', 0, NULL, '2026-10-08 17:57:16.754', '2026-10-08 18:00:35.495', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opf006aydphzzilc6xg', 'DMVP', 'dmvp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mrs. DMV Priya', '+91 9440112233', true, false, '2026-10-08 18:00:35.713', 0, NULL, '2026-10-08 17:57:16.755', '2026-10-08 18:00:35.713', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opg006fydphssjkc4go', 'CA', 'ca@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. C Aparna', '+91 9440112233', true, false, '2026-10-08 18:00:35.931', 0, NULL, '2026-10-08 17:57:16.757', '2026-10-08 18:00:35.931', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opi006kydphjl44uiyy', 'GSL', 'gsl@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. G Sathee Laxmi', '+91 9440112233', true, false, '2026-10-08 18:00:36.147', 0, NULL, '2026-10-08 17:57:16.758', '2026-10-08 18:00:36.147', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opj006pydphp024wu8u', 'KS', 'ks@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. K Swathi', '+91 9440112233', true, false, '2026-10-08 18:00:36.365', 0, NULL, '2026-10-08 17:57:16.76', '2026-10-08 18:00:36.366', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opl006uydphxq8zd8up', 'SLA', 'sla@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. S Laxmi Aparna', '+91 9440112233', true, false, '2026-10-08 18:00:36.582', 0, NULL, '2026-10-08 17:57:16.761', '2026-10-08 18:00:36.583', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opn006zydphae7jr1mr', 'DBVJ', 'dbvj@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. DBV Jagannadham', '+91 9440112233', true, false, '2026-10-08 18:00:36.8', 0, NULL, '2026-10-08 17:57:16.763', '2026-10-08 18:00:36.801', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opz008dydphf45zjzey', 'PKD', 'pkd@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. PK DAS', '+91 9440112233', true, false, '2026-10-08 18:00:38.979', 0, NULL, '2026-10-08 17:57:16.776', '2026-10-08 18:00:38.98', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opp0079ydph48ejt3tu', 'MN', 'mn@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. M Neelima', '+91 9440112233', true, false, '2026-10-08 18:00:37.234', 0, NULL, '2026-10-08 17:57:16.766', '2026-10-08 18:00:37.235', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opr007eydphr66l82pw', 'VA', 'va@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. V Adinarayana', '+91 9440112233', true, false, '2026-10-08 18:00:37.453', 0, NULL, '2026-10-08 17:57:16.767', '2026-10-08 18:00:37.453', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ops007jydph2w4telgt', 'VS', 'vs@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mrs. V Sridevi', '+91 9440112233', true, false, '2026-10-08 18:00:37.67', 0, NULL, '2026-10-08 17:57:16.768', '2026-10-08 18:00:37.671', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opu007tydph3tkyvaxq', 'KJR', 'kjr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. K Jhansi Rani', '+91 9440112233', true, false, '2026-10-08 18:00:38.105', 0, NULL, '2026-10-08 17:57:16.771', '2026-10-08 18:00:38.105', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opw007yydphn9klb1vx', 'PRSS', 'prss@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. PR Sri Satya', '+91 9440112233', true, false, '2026-10-08 18:00:38.324', 0, NULL, '2026-10-08 17:57:16.772', '2026-10-08 18:00:38.324', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opx0083ydphujxl4qb4', 'ARS', 'ars@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. A Ravi Shankar', '+91 9440112233', true, false, '2026-10-08 18:00:38.542', 0, NULL, '2026-10-08 17:57:16.773', '2026-10-08 18:00:38.542', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oq1008iydphx72end76', 'CHS', 'chs@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ch Sowjanya', '+91 9440112233', true, false, '2026-10-08 18:00:39.199', 0, NULL, '2026-10-08 17:57:16.777', '2026-10-08 18:00:39.199', NULL);
INSERT INTO public."User" VALUES ('cmuzu9op4005bydphxwgxubzc', 'BHP', 'bhp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Bh Padma', '+91 9440112233', true, false, '2026-10-08 18:03:11.13', 0, NULL, '2026-10-08 17:57:16.744', '2026-10-08 18:03:11.13', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oo4003dydph8jx0miue', 'SP', 'sp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. S Padma', '+91 9440112233', true, false, '2026-10-08 18:00:31.18', 0, NULL, '2026-10-08 17:57:16.709', '2026-10-08 18:00:31.181', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ooh003nydph6y8e5jp1', 'KVNL', 'kvnl@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. KV NagaLakshmi', '+91 9440112233', true, false, '2026-10-08 18:00:31.615', 0, NULL, '2026-10-08 17:57:16.722', '2026-10-08 18:00:31.615', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oq60092ydphh6540ixl', 'JRR', 'jrr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. J RajaRatnam', '+91 9440112233', true, false, '2026-10-08 18:00:40.079', 0, NULL, '2026-10-08 17:57:16.783', '2026-10-08 18:00:40.08', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqc009rydph4a3z44gt', 'CHVVDP', 'chvvdp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. CH VVD Prasad', '+91 9440112233', true, false, '2026-10-08 18:00:41.171', 0, NULL, '2026-10-08 17:57:16.788', '2026-10-08 18:00:41.172', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqa009hydph4c12wqt6', 'PBSKR', 'pbskr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. PBS Krishnamuraju', '+91 9440112233', true, false, '2026-10-08 18:00:40.732', 0, NULL, '2026-10-08 17:57:16.786', '2026-10-08 18:00:40.733', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqb009mydphxpmnxv51', 'MBS', 'mbs@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. M Bhanu Sridhar', '+91 9440112233', true, false, '2026-10-08 18:00:40.952', 0, NULL, '2026-10-08 17:57:16.787', '2026-10-08 18:00:40.953', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqm00aqydphkyxl6nml', 'KVSS', 'kvss@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. KVS Sarma', '+91 9440112233', true, false, '2026-10-08 18:00:42.719', 0, NULL, '2026-10-08 17:57:16.799', '2026-10-08 18:00:42.719', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqd009wydph37vthpub', 'SVM', 'svm@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. S Vinod Manikantha', '+91 9440112233', true, false, '2026-10-08 18:00:41.39', 0, NULL, '2026-10-08 17:57:16.789', '2026-10-08 18:00:41.391', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqe00a1ydphofwglgxa', 'ASL', 'asl@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. A Suseelatha', '+91 9440112233', true, false, '2026-10-08 18:00:41.611', 0, NULL, '2026-10-08 17:57:16.791', '2026-10-08 18:00:41.612', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqf00a6ydphz8r5sbiv', 'BB', 'bb@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. B Bharathi', '+91 9440112233', true, false, '2026-10-08 18:00:41.833', 0, NULL, '2026-10-08 17:57:16.792', '2026-10-08 18:00:41.834', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqh00abydphyrk6wo0i', 'CHAN', 'chan@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Ch Appala Naidu', '+91 9440112233', true, false, '2026-10-08 18:00:42.055', 0, NULL, '2026-10-08 17:57:16.793', '2026-10-08 18:00:42.055', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqj00agydpho3hnmh32', 'CHVS', 'chvs@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Ch V Sreedhar', '+91 9440112233', true, false, '2026-10-08 18:00:42.273', 0, NULL, '2026-10-08 17:57:16.796', '2026-10-08 18:00:42.274', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oql00alydphrnz57sid', 'KLSP', 'klsp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. K L Sai Prasad', '+91 9440112233', true, false, '2026-10-08 18:00:42.491', 0, NULL, '2026-10-08 17:57:16.797', '2026-10-08 18:00:42.492', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqy00buydphmu6in27s', 'YPR', 'ypr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. Y Prasad Reddy', '+91 9440112233', true, false, '2026-10-08 18:00:44.474', 0, NULL, '2026-10-08 17:57:16.81', '2026-10-08 18:00:44.474', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqo00avydphnyap4rgv', 'NGB', 'ngb@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. N Giribabu', '+91 9440112233', true, false, '2026-10-08 18:00:42.94', 0, NULL, '2026-10-08 17:57:16.8', '2026-10-08 18:00:42.94', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqq00b5ydphkng76q2y', 'SSAS', 'ssas@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. SS Ayyappa Sastri', '+91 9440112233', true, false, '2026-10-08 18:00:43.378', 0, NULL, '2026-10-08 17:57:16.803', '2026-10-08 18:00:43.378', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqs00baydphep82obna', 'TPK', 'tpk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. T Poornakantha', '+91 9440112233', true, false, '2026-10-08 18:00:43.597', 0, NULL, '2026-10-08 17:57:16.804', '2026-10-08 18:00:43.597', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqu00bfydphgpni5k4s', 'AS', 'as@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Anand Solanki', '+91 9440112233', true, false, '2026-10-08 18:00:43.818', 0, NULL, '2026-10-08 17:57:16.806', '2026-10-08 18:00:43.818', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqv00bkydphx9krsdp7', 'BVSAK', 'bvsak@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. BVS Arun Kumar', '+91 9440112233', true, false, '2026-10-08 18:00:44.036', 0, NULL, '2026-10-08 17:57:16.807', '2026-10-08 18:00:44.037', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oq4008sydphhvcxhf7x', 'CHA', 'cha@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Ch Alekya', '+91 9440112233', true, false, '2026-10-08 18:00:39.643', 0, NULL, '2026-10-08 17:57:16.78', '2026-10-08 18:00:39.644', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqw00bpydph8durqqw8', 'MBK', 'mbk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. M Bhaskar Kumar', '+91 9440112233', true, false, '2026-10-08 18:00:44.256', 0, NULL, '2026-10-08 17:57:16.809', '2026-10-08 18:00:44.256', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or800d3ydph0v6t83c5', 'NSSVRR', 'nssvrr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. NSSV Raja Rao', '+91 9440112233', true, false, '2026-10-08 18:00:46.451', 0, NULL, '2026-10-08 17:57:16.821', '2026-10-08 18:00:46.452', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqz00bzydph4zpmmvbe', 'KMK', 'kmk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. K Manikyakanthi', '+91 9440112233', true, false, '2026-10-08 18:00:44.694', 0, NULL, '2026-10-08 17:57:16.811', '2026-10-08 18:00:44.695', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or000c4ydphqv593sn2', 'PKM', 'pkm@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. P KiranMayi', '+91 9440112233', true, false, '2026-10-08 18:00:44.913', 0, NULL, '2026-10-08 17:57:16.812', '2026-10-08 18:00:44.914', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or100c9ydphnmpwh80l', 'TAJ', 'taj@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. Taj', '+91 9440112233', true, false, '2026-10-08 18:00:45.133', 0, NULL, '2026-10-08 17:57:16.814', '2026-10-08 18:00:45.133', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or200ceydphygnpfuwb', 'BN', 'bn@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. B Nagarjun', '+91 9440112233', true, false, '2026-10-08 18:00:45.353', 0, NULL, '2026-10-08 17:57:16.815', '2026-10-08 18:00:45.354', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or400cjydphst18nqf0', 'BRB', 'brb@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. B Rajesh Babu', '+91 9440112233', true, false, '2026-10-08 18:00:45.574', 0, NULL, '2026-10-08 17:57:16.816', '2026-10-08 18:00:45.575', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or500coydphf8sxkt85', 'CHR', 'chr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Ch Rajesh', '+91 9440112233', true, false, '2026-10-08 18:00:45.795', 0, NULL, '2026-10-08 17:57:16.817', '2026-10-08 18:00:45.796', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or600ctydph7010w0q9', 'CHSL', 'chsl@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. Ch S Lakshmi', '+91 9440112233', true, false, '2026-10-08 18:00:46.013', 0, NULL, '2026-10-08 17:57:16.818', '2026-10-08 18:00:46.014', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or700cyydph5yd0ba42', 'DSK', 'dsk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. D Santhosh Kumar', '+91 9440112233', true, false, '2026-10-08 18:00:46.232', 0, NULL, '2026-10-08 17:57:16.819', '2026-10-08 18:00:46.233', NULL);
INSERT INTO public."User" VALUES ('cmuzu9or900d8ydphreapmzgd', 'PVR', 'pvr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. PV Rajeswari', '+91 9440112233', true, false, '2026-10-08 18:00:46.67', 0, NULL, '2026-10-08 17:57:16.822', '2026-10-08 18:00:46.671', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ora00ddydphvr1vi0wp', 'RP', 'rp@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. R Praveena', '+91 9440112233', true, false, '2026-10-08 18:00:46.89', 0, NULL, '2026-10-08 17:57:16.823', '2026-10-08 18:00:46.89', NULL);
INSERT INTO public."User" VALUES ('cmuzu9orc00diydphpybxtk7h', 'VSJ', 'vsj@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr.V Siva Jahnavy', '+91 9440112233', true, false, '2026-10-08 18:00:47.111', 0, NULL, '2026-10-08 17:57:16.824', '2026-10-08 18:00:47.111', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ord00dnydphdwln95zi', 'KAR', 'kar@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. K AyyaRaju', '+91 9440112233', true, false, '2026-10-08 18:00:47.331', 0, NULL, '2026-10-08 17:57:16.825', '2026-10-08 18:00:47.331', NULL);
INSERT INTO public."User" VALUES ('cmuzu9ore00dsydph0i05x8t6', 'NVSK', 'nvsk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. NV Siva Krishna', '+91 9440112233', true, false, '2026-10-08 18:00:47.55', 0, NULL, '2026-10-08 17:57:16.826', '2026-10-08 18:00:47.55', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oq70097ydphk9ko7f09', 'NVL', 'nvl@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. N Vijaya Lakshmi', '+91 9440112233', true, false, '2026-10-08 18:00:40.298', 0, NULL, '2026-10-08 17:57:16.784', '2026-10-08 18:00:40.299', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oq5008xydph5s3lk30w', 'IRS', 'irs@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. I Rajasekhar', '+91 9440112233', true, false, '2026-10-08 18:00:39.862', 0, NULL, '2026-10-08 17:57:16.781', '2026-10-08 18:00:39.863', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oox004rydph03f490gx', 'GSK', 'gsk@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. G Santosh Kumar', '+91 9440112233', true, false, '2026-10-08 18:00:33.331', 0, NULL, '2026-10-08 17:57:16.737', '2026-10-08 18:00:33.331', NULL);
INSERT INTO public."User" VALUES ('cmuzu9op7005lydphc9foztkf', 'KR', 'kr@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. K Rohini', '+91 9440112233', true, false, '2026-10-08 18:00:34.627', 0, NULL, '2026-10-08 17:57:16.748', '2026-10-08 18:00:34.628', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opt007oydphtvdybf62', 'BDS', 'bds@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Ms. B Divya Sati', '+91 9440112233', true, false, '2026-10-08 18:00:37.888', 0, NULL, '2026-10-08 17:57:16.77', '2026-10-08 18:00:37.888', NULL);
INSERT INTO public."User" VALUES ('cmuzu9opy0088ydphf2ak7hvm', 'MVPL', 'mvpl@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. MV Pankaj Lahari', '+91 9440112233', true, false, '2026-10-08 18:00:38.761', 0, NULL, '2026-10-08 17:57:16.775', '2026-10-08 18:00:38.762', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oq2008nydphukhr80tr', 'BMF', 'bmf@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. BM Florence', '+91 9440112233', true, false, '2026-10-08 18:00:39.416', 0, NULL, '2026-10-08 17:57:16.778', '2026-10-08 18:00:39.416', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oq8009cydph5icd3mme', 'VVLUR', 'vvlur@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. VVL Usha Ramani', '+91 9440112233', true, false, '2026-10-08 18:00:40.515', 0, NULL, '2026-10-08 17:57:16.785', '2026-10-08 18:00:40.516', NULL);
INSERT INTO public."User" VALUES ('cmuzu9oqp00b0ydphx5t2pbfg', 'SAK', 'sak@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Dr. S Ashok Kumar', '+91 9440112233', true, false, '2026-10-08 18:00:43.159', 0, NULL, '2026-10-08 17:57:16.802', '2026-10-08 18:00:43.159', NULL);
INSERT INTO public."User" VALUES ('cmuzu9orf00dxydphmg1iayhn', 'PSSA', 'pssa@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. PSS Appalacharyulu', '+91 9440112233', true, false, '2026-10-08 18:00:47.768', 0, NULL, '2026-10-08 17:57:16.827', '2026-10-08 18:00:47.768', NULL);
INSERT INTO public."User" VALUES ('cmuzu9org00e2ydphu05asr0i', 'VVVSN', 'vvvsn@gvpihlr.edu.in', '$2a$12$nJ4aeMrqoVX7mm2I2yD0seTHMhUsmCnz0vHL.E2mV/mSo3Y5jDKaW', 'Mr. VVV Satyanarayana', '+91 9440112233', true, false, '2026-10-08 18:00:47.987', 0, NULL, '2026-10-08 17:57:16.828', '2026-10-08 18:00:47.988', NULL);


--
-- Data for Name: Faculty; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."Faculty" VALUES ('cmuzu9ooh003mydphxxnw12oj', 'cmuzu9oof003iydphgyvr3cii', 'GVPIHLR-BSK', 'BSK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000rydphged3u5y6', NULL, true, '2026-10-08 17:57:16.721', '2026-10-08 17:59:14.705', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ooj003rydph4433ehx2', 'cmuzu9ooh003nydph6y8e5jp1', 'GVPIHLR-KVNL', 'KVNL', 'Assistant Professor - SG', 'Ph.D / M.Tech', 'cmuzu9ogt000rydphged3u5y6', NULL, true, '2026-10-08 17:57:16.723', '2026-10-08 17:59:14.706', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ool003wydphq5pgk1yo', 'cmuzu9ooj003sydph9ysvw492', 'GVPIHLR-KVP', 'KVP', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000rydphged3u5y6', NULL, true, '2026-10-08 17:57:16.725', '2026-10-08 17:59:14.708', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oon0041ydphwfli1nhw', 'cmuzu9ool003xydphdqvmbd0b', 'GVPIHLR-MRR', 'MRR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000rydphged3u5y6', NULL, true, '2026-10-08 17:57:16.728', '2026-10-08 17:59:14.71', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ooq0046ydphts8c4ewe', 'cmuzu9ooo0042ydph2cf7s60u', 'GVPIHLR-PSR', 'PSR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000rydphged3u5y6', NULL, true, '2026-10-08 17:57:16.73', '2026-10-08 17:59:14.711', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oos004bydphlkqvei1y', 'cmuzu9ooq0047ydphbogdnye1', 'GVPIHLR-RN', 'RN', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000rydphged3u5y6', NULL, true, '2026-10-08 17:57:16.732', '2026-10-08 17:59:14.713', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oot004gydphij2nvkk5', 'cmuzu9oos004cydphwkuc88w2', 'GVPIHLR-SA', 'SA', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000rydphged3u5y6', NULL, true, '2026-10-08 17:57:16.734', '2026-10-08 17:59:14.714', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oov004lydphdqksogwy', 'cmuzu9oou004hydphvofh0ip3', 'GVPIHLR-BV', 'BV', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000jydphx3bznqs0', NULL, true, '2026-10-08 17:57:16.736', '2026-10-08 17:59:14.715', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oox004qydphuq8aoo2u', 'cmuzu9oov004mydphjg2s99np', 'GVPIHLR-DM', 'DM', 'Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000jydphx3bznqs0', NULL, true, '2026-10-08 17:57:16.737', '2026-10-08 17:59:14.716', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ooy004vydph8s54e6qk', 'cmuzu9oox004rydph03f490gx', 'GVPIHLR-GSK', 'GSK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000jydphx3bznqs0', NULL, true, '2026-10-08 17:57:16.739', '2026-10-08 17:59:14.718', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9op00050ydpho0z0amfl', 'cmuzu9ooz004wydph7tohke43', 'GVPIHLR-PM', 'PM', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000jydphx3bznqs0', NULL, true, '2026-10-08 17:57:16.74', '2026-10-08 17:59:14.719', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9op20055ydphdr2zkp2i', 'cmuzu9op00051ydph57trnn42', 'GVPIHLR-VBR', 'VBR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000jydphx3bznqs0', NULL, true, '2026-10-08 17:57:16.742', '2026-10-08 17:59:14.72', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9op3005aydphv2g288tx', 'cmuzu9op20056ydph0wtyy3la', 'GVPIHLR-GS', 'GS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000jydphx3bznqs0', NULL, true, '2026-10-08 17:57:16.744', '2026-10-08 17:59:14.721', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9op5005fydphd5sve6c9', 'cmuzu9op4005bydphxwgxubzc', 'GVPIHLR-BHP', 'BHP', 'Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.746', '2026-10-08 17:59:14.722', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9op7005kydph30yhvcmo', 'cmuzu9op6005gydphddh9mtce', 'GVPIHLR-DC', 'DC', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.747', '2026-10-08 17:59:14.723', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9op9005pydph7wv7k9fh', 'cmuzu9op7005lydphc9foztkf', 'GVPIHLR-KR', 'KR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.749', '2026-10-08 17:59:14.724', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opa005uydpheqstjxmq', 'cmuzu9op9005qydpho4pjs8iq', 'GVPIHLR-ADP', 'ADP', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.751', '2026-10-08 17:59:14.726', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opc005zydphgkqonaz2', 'cmuzu9opb005vydpha49v7tmk', 'GVPIHLR-BBK', 'BBK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.752', '2026-10-08 17:59:14.727', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opd0064ydphudllojl4', 'cmuzu9opc0060ydphcbp9oo8l', 'GVPIHLR-DAK', 'DAK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.753', '2026-10-08 17:59:14.728', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opf0069ydphl59md29m', 'cmuzu9opd0065ydphxdu1ouox', 'GVPIHLR-MA', 'MA', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.755', '2026-10-08 17:59:14.729', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opg006eydphzomh4tr0', 'cmuzu9opf006aydphzzilc6xg', 'GVPIHLR-DMVP', 'DMVP', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.756', '2026-10-08 17:59:14.73', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oph006jydphh4dxoypj', 'cmuzu9opg006fydphssjkc4go', 'GVPIHLR-CA', 'CA', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.758', '2026-10-08 17:59:14.731', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opj006oydphd1otyr17', 'cmuzu9opi006kydphjl44uiyy', 'GVPIHLR-GSL', 'GSL', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.759', '2026-10-08 17:59:14.732', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opk006tydph12hq4eo9', 'cmuzu9opj006pydphp024wu8u', 'GVPIHLR-KS', 'KS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.761', '2026-10-08 17:59:14.733', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opm006yydphsxp1wdis', 'cmuzu9opl006uydphxq8zd8up', 'GVPIHLR-SLA', 'SLA', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogj0009ydphloegjdx6', NULL, true, '2026-10-08 17:57:16.763', '2026-10-08 17:59:14.734', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opn0073ydphv2a59e4g', 'cmuzu9opn006zydphae7jr1mr', 'GVPIHLR-DBVJ', 'DBVJ', 'Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.764', '2026-10-08 17:59:14.735', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opp0078ydphw4nmz944', 'cmuzu9opo0074ydphr5czmqqq', 'GVPIHLR-ISR', 'ISR', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.766', '2026-10-08 17:59:14.736', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opq007dydphtqfrgwo9', 'cmuzu9opp0079ydph48ejt3tu', 'GVPIHLR-MN', 'MN', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.767', '2026-10-08 17:59:14.737', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ops007iydphxhsbxmiy', 'cmuzu9opr007eydphr66l82pw', 'GVPIHLR-VA', 'VA', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.768', '2026-10-08 17:59:14.738', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opt007nydphpfji8usg', 'cmuzu9ops007jydph2w4telgt', 'GVPIHLR-VS', 'VS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.769', '2026-10-08 17:59:14.739', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opu007sydphnyj7c97i', 'cmuzu9opt007oydphtvdybf62', 'GVPIHLR-BDS', 'BDS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.771', '2026-10-08 17:59:14.74', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opv007xydphkd2upaxj', 'cmuzu9opu007tydph3tkyvaxq', 'GVPIHLR-KJR', 'KJR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.772', '2026-10-08 17:59:14.741', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opx0082ydphq5b9ad9f', 'cmuzu9opw007yydphn9klb1vx', 'GVPIHLR-PRSS', 'PRSS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000dydphib4mqn64', NULL, true, '2026-10-08 17:57:16.773', '2026-10-08 17:59:14.741', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opy0087ydpho4qo8und', 'cmuzu9opx0083ydphujxl4qb4', 'GVPIHLR-ARS', 'ARS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogq000fydphc0dpxq2h', NULL, true, '2026-10-08 17:57:16.774', '2026-10-08 17:59:14.742', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9opz008cydphlbyb4j9k', 'cmuzu9opy0088ydphf2ak7hvm', 'GVPIHLR-MVPL', 'MVPL', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogq000fydphc0dpxq2h', NULL, true, '2026-10-08 17:57:16.776', '2026-10-08 17:59:14.743', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq0008hydphm8v9zzod', 'cmuzu9opz008dydphf45zjzey', 'GVPIHLR-PKD', 'PKD', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogq000fydphc0dpxq2h', NULL, true, '2026-10-08 17:57:16.777', '2026-10-08 17:59:14.744', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq1008mydphm4jlnxo7', 'cmuzu9oq1008iydphx72end76', 'GVPIHLR-CHS', 'CHS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.778', '2026-10-08 17:59:14.745', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq3008rydphkqjp021u', 'cmuzu9oq2008nydphukhr80tr', 'GVPIHLR-BMF', 'BMF', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.78', '2026-10-08 17:59:14.746', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq4008wydphr69jiezv', 'cmuzu9oq4008sydphhvcxhf7x', 'GVPIHLR-CHA', 'CHA', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.781', '2026-10-08 17:59:14.747', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ooe003hydphj3yb044c', 'cmuzu9oo4003dydph8jx0miue', 'GVPIHLR-SP', 'SP', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000lydphdn41j7wh', NULL, true, '2026-10-08 17:57:16.719', '2026-10-08 17:59:14.703', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq70096ydphp3wamysd', 'cmuzu9oq60092ydphh6540ixl', 'GVPIHLR-JRR', 'JRR', 'Assistant Professor - SG', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.783', '2026-10-08 17:59:14.749', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq8009bydphuwbhu1vz', 'cmuzu9oq70097ydphk9ko7f09', 'GVPIHLR-NVL', 'NVL', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.785', '2026-10-08 17:59:14.75', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq9009gydph4d5l6c0k', 'cmuzu9oq8009cydph5icd3mme', 'GVPIHLR-VVLUR', 'VVLUR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.786', '2026-10-08 17:59:14.751', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqb009lydphzttp8xvf', 'cmuzu9oqa009hydph4c12wqt6', 'GVPIHLR-PBSKR', 'PBSKR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.787', '2026-10-08 17:59:14.752', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqc009qydphsqlwwybf', 'cmuzu9oqb009mydphxpmnxv51', 'GVPIHLR-MBS', 'MBS', 'Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000bydph8wd22scj', NULL, true, '2026-10-08 17:57:16.788', '2026-10-08 17:59:14.753', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqd009vydph0fv3wy0u', 'cmuzu9oqc009rydph4a3z44gt', 'GVPIHLR-CHVVDP', 'CHVVDP', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000bydph8wd22scj', NULL, true, '2026-10-08 17:57:16.789', '2026-10-08 17:59:14.754', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqe00a0ydph6uxjk6jf', 'cmuzu9oqd009wydph37vthpub', 'GVPIHLR-SVM', 'SVM', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogp000bydph8wd22scj', NULL, true, '2026-10-08 17:57:16.79', '2026-10-08 17:59:14.755', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqf00a5ydph2smdmgbf', 'cmuzu9oqe00a1ydphofwglgxa', 'GVPIHLR-ASL', 'ASL', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.792', '2026-10-08 17:59:14.755', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqg00aaydphrkosh3r0', 'cmuzu9oqf00a6ydphz8r5sbiv', 'GVPIHLR-BB', 'BB', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.793', '2026-10-08 17:59:14.756', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqj00afydph1bpzimsn', 'cmuzu9oqh00abydphyrk6wo0i', 'GVPIHLR-CHAN', 'CHAN', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.795', '2026-10-08 17:59:14.757', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqk00akydph0l6522rt', 'cmuzu9oqj00agydpho3hnmh32', 'GVPIHLR-CHVS', 'CHVS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.797', '2026-10-08 17:59:14.758', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqm00apydph3ihhfgom', 'cmuzu9oql00alydphrnz57sid', 'GVPIHLR-KLSP', 'KLSP', 'Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.799', '2026-10-08 17:59:14.759', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqo00auydphyi90hkdb', 'cmuzu9oqm00aqydphkyxl6nml', 'GVPIHLR-KVSS', 'KVSS', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.8', '2026-10-08 17:59:14.76', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqp00azydphsyrnhqkz', 'cmuzu9oqo00avydphnyap4rgv', 'GVPIHLR-NGB', 'NGB', 'Assistant Professor - SG', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.801', '2026-10-08 17:59:14.761', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqq00b4ydpht96evcl8', 'cmuzu9oqp00b0ydphx5t2pbfg', 'GVPIHLR-SAK', 'SAK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.803', '2026-10-08 17:59:14.762', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqr00b9ydphzbwvfao0', 'cmuzu9oqq00b5ydphkng76q2y', 'GVPIHLR-SSAS', 'SSAS', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.804', '2026-10-08 17:59:14.763', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqt00beydpha23q5irg', 'cmuzu9oqs00baydphep82obna', 'GVPIHLR-TPK', 'TPK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000nydph6e8x5r63', NULL, true, '2026-10-08 17:57:16.806', '2026-10-08 17:59:14.764', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqv00bjydphbbvzpk44', 'cmuzu9oqu00bfydphgpni5k4s', 'GVPIHLR-AS', 'AS', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000hydphjmf7gen1', NULL, true, '2026-10-08 17:57:16.807', '2026-10-08 17:59:14.765', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqw00boydph146t2lzh', 'cmuzu9oqv00bkydphx9krsdp7', 'GVPIHLR-BVSAK', 'BVSAK', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000hydphjmf7gen1', NULL, true, '2026-10-08 17:57:16.808', '2026-10-08 17:59:14.766', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqx00btydph94y86cz1', 'cmuzu9oqw00bpydph8durqqw8', 'GVPIHLR-MBK', 'MBK', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000hydphjmf7gen1', NULL, true, '2026-10-08 17:57:16.81', '2026-10-08 17:59:14.768', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oqy00byydph7c8cdvy7', 'cmuzu9oqy00buydphmu6in27s', 'GVPIHLR-YPR', 'YPR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000hydphjmf7gen1', NULL, true, '2026-10-08 17:57:16.811', '2026-10-08 17:59:14.769', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or000c3ydphe6wnu038', 'cmuzu9oqz00bzydph4zpmmvbe', 'GVPIHLR-KMK', 'KMK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000hydphjmf7gen1', NULL, true, '2026-10-08 17:57:16.812', '2026-10-08 17:59:14.77', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or100c8ydphf0e56ghi', 'cmuzu9or000c4ydphqv593sn2', 'GVPIHLR-PKM', 'PKM', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000hydphjmf7gen1', NULL, true, '2026-10-08 17:57:16.813', '2026-10-08 17:59:14.771', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or200cdydph37u5p4of', 'cmuzu9or100c9ydphnmpwh80l', 'GVPIHLR-TAJ', 'TAJ', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogr000hydphjmf7gen1', NULL, true, '2026-10-08 17:57:16.814', '2026-10-08 17:59:14.772', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or300ciydphg75soxyh', 'cmuzu9or200ceydphygnpfuwb', 'GVPIHLR-BN', 'BN', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.816', '2026-10-08 17:59:14.773', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or400cnydphzhkk04l8', 'cmuzu9or400cjydphst18nqf0', 'GVPIHLR-BRB', 'BRB', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.817', '2026-10-08 17:59:14.774', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or600csydph3juc2969', 'cmuzu9or500coydphf8sxkt85', 'GVPIHLR-CHR', 'CHR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.818', '2026-10-08 17:59:14.775', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or700cxydphtectln47', 'cmuzu9or600ctydph7010w0q9', 'GVPIHLR-CHSL', 'CHSL', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.819', '2026-10-08 17:59:14.776', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or800d2ydphy2ztklbc', 'cmuzu9or700cyydph5yd0ba42', 'GVPIHLR-DSK', 'DSK', 'Senior Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.82', '2026-10-08 17:59:14.777', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9or900d7ydphf0b7jf42', 'cmuzu9or800d3ydph0v6t83c5', 'GVPIHLR-NSSVRR', 'NSSVRR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.821', '2026-10-08 17:59:14.778', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ora00dcydphy3o8qndb', 'cmuzu9or900d8ydphreapmzgd', 'GVPIHLR-PVR', 'PVR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.823', '2026-10-08 17:59:14.779', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9orb00dhydphs1ovemct', 'cmuzu9ora00ddydphvr1vi0wp', 'GVPIHLR-RP', 'RP', 'Associate Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.824', '2026-10-08 17:59:14.78', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9orc00dmydphprn3z7hv', 'cmuzu9orc00diydphpybxtk7h', 'GVPIHLR-VSJ', 'VSJ', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.825', '2026-10-08 17:59:14.781', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ord00drydphbkfst7bk', 'cmuzu9ord00dnydphdwln95zi', 'GVPIHLR-KAR', 'KAR', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.826', '2026-10-08 17:59:14.782', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9ore00dwydphdzdynqdz', 'cmuzu9ore00dsydph0i05x8t6', 'GVPIHLR-NVSK', 'NVSK', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.827', '2026-10-08 17:59:14.783', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9org00e1ydph8dfzfdtb', 'cmuzu9orf00dxydphmg1iayhn', 'GVPIHLR-PSSA', 'PSSA', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.828', '2026-10-08 17:59:14.784', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9orh00e6ydphwswc87v0', 'cmuzu9org00e2ydphu05asr0i', 'GVPIHLR-VVVSN', 'VVVSN', 'Assistant Professor', 'Ph.D / M.Tech', 'cmuzu9ogs000pydphal3o60px', NULL, true, '2026-10-08 17:57:16.829', '2026-10-08 17:59:14.785', NULL);
INSERT INTO public."Faculty" VALUES ('cmuzu9oq60091ydphj2suogg8', 'cmuzu9oq5008xydph5s3lk30w', 'GVPIHLR-IRS', 'IRS', 'Assistant Professor - SG', 'Ph.D / M.Tech', 'cmuzu9ogt000tydphzkxjiy1r', NULL, true, '2026-10-08 17:57:16.782', '2026-10-08 17:59:14.748', NULL);


--
-- Data for Name: Regulation; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."Regulation" VALUES ('cmuztcm1y00079z3dlq5k2hdd', 'R1', 'Regulation R1', 'University Curriculum Regulation R1 (Estd. 2026)', '2026-27', true, '2026-10-08 17:31:33.67', '2026-10-08 17:59:14.429', NULL);


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."Program" VALUES ('cmuzuc7j0001980kt73wwpg5z', 'cmuzu9ogg0003ydphf96cgbgs', 'BTECH-ELECTRONICS-AND-COMMUNICATION-ENG', 'Electronics and Communication Engineering', 'UG', 4, 8, true, '2026-10-08 17:59:14.461', '2026-10-08 17:59:14.461', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j1001b80ktkdgxdj1n', 'cmuzu9ogg0003ydphf96cgbgs', 'BTECH-ELECTRONICS-ENG-VLSI-DESIGN-AND-TECHNOLOGY', 'Electronics Engineering (VLSI Design & Technology)', 'UG', 4, 8, true, '2026-10-08 17:59:14.462', '2026-10-08 17:59:14.462', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7iu000z80ktzx6l8e95', 'cmuzu9oge0002ydphghgaadg6', 'BTECH-CS-AND-ENG', 'Computer Science and Engineering', 'UG', 4, 8, true, '2026-10-08 17:59:14.454', '2026-10-08 17:59:14.454', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7iy001180ktouskb5ea', 'cmuzu9oge0002ydphghgaadg6', 'BTECH-CS-AND-ENG-AI-AND-ML', 'Computer Science and Engineering (Artificial Intelligence & Machine Learning)', 'UG', 4, 8, true, '2026-10-08 17:59:14.458', '2026-10-08 17:59:14.458', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7iy001380ktdrw90uyt', 'cmuzu9oge0002ydphghgaadg6', 'BTECH-CS-AND-ENG-CYBERFORENSICS', 'Computer Science and Engineering (Cyberforensics)', 'UG', 4, 8, true, '2026-10-08 17:59:14.459', '2026-10-08 17:59:14.459', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7iz001580ktn33o87u5', 'cmuzu9oge0002ydphghgaadg6', 'BTECH-CS-AND-ENG-CYBERSECURITY', 'Computer Science and Engineering (Cybersecurity)', 'UG', 4, 8, true, '2026-10-08 17:59:14.46', '2026-10-08 17:59:14.46', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j0001780ktf017iq6b', 'cmuzu9oge0002ydphghgaadg6', 'BTECH-CS-AND-ENG-DATA-SCIENCE', 'Computer Science and Engineering (Data Science)', 'UG', 4, 8, true, '2026-10-08 17:59:14.46', '2026-10-08 17:59:14.46', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j2001d80kt8wqts53v', 'cmuzu9ogg0003ydphf96cgbgs', 'BTECH-ELECTRICAL-AND-ELECTRONICS-ENG', 'Electrical and Electronics Engineering', 'UG', 4, 8, true, '2026-10-08 17:59:14.462', '2026-10-08 17:59:14.462', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j3001f80kthq5p8jq2', 'cmuzu9ogg0003ydphf96cgbgs', 'BTECH-ELECTRICAL-AND-ELECTRONICS-ENG-ELECTRIC-VEHICLES', 'Electrical and Electronics Engineering (Electric Vehicles)', 'UG', 4, 8, true, '2026-10-08 17:59:14.463', '2026-10-08 17:59:14.463', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j3001h80kts4vwwn2f', 'cmuzu9ogg0004ydph6vagboyw', 'BTECH-CHEMICAL-ENG', 'Chemical Engineering', 'UG', 4, 8, true, '2026-10-08 17:59:14.464', '2026-10-08 17:59:14.464', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j4001j80kt1gwuz191', 'cmuzu9ogg0004ydph6vagboyw', 'BTECH-CIVIL-ENG', 'Civil Engineering', 'UG', 4, 8, true, '2026-10-08 17:59:14.464', '2026-10-08 17:59:14.464', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j4001l80kt9ngjag27', 'cmuzu9ogg0004ydph6vagboyw', 'BTECH-CIVIL-ENG-CONSTRUCTION-TECHNOLOGY', 'Civil Engineering (Construction Technology)', 'UG', 4, 8, true, '2026-10-08 17:59:14.464', '2026-10-08 17:59:14.464', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j4001n80ktizpjawrz', 'cmuzu9ogg0004ydph6vagboyw', 'BTECH-CIVIL-ENG-STRUCTURAL-ENG', 'Civil Engineering (Structural Engineering)', 'UG', 4, 8, true, '2026-10-08 17:59:14.465', '2026-10-08 17:59:14.465', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j5001p80kt7y4xhoxa', 'cmuzu9ogg0004ydph6vagboyw', 'BTECH-MECHANICAL-ENG', 'Mechanical Engineering', 'UG', 4, 8, true, '2026-10-08 17:59:14.465', '2026-10-08 17:59:14.465', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j5001r80ktgbhr8k92', 'cmuzu9ogg0004ydph6vagboyw', 'BTECH-MECHANICAL-ENG-ROBOTICS-AND-AI', 'Mechanical Engineering (Robotics & AI)', 'UG', 4, 8, true, '2026-10-08 17:59:14.466', '2026-10-08 17:59:14.466', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j6001t80kthc5jkk44', 'cmuzu9ogh0005ydphjtmm2pfn', 'BCA-BACHELOR-OF-COMPUTER-APPLICATIONS', 'Bachelor of Computer Applications', 'UG', 3, 6, true, '2026-10-08 17:59:14.466', '2026-10-08 17:59:14.466', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j6001v80ktrl70hc50', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-CS-AND-AI', 'Computer Science and Artificial Intelligence', 'UG', 3, 6, true, '2026-10-08 17:59:14.467', '2026-10-08 17:59:14.467', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j7001x80kti1f42989', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-EMBEDDED-ELECTRONICS-AND-AI', 'Embedded Electronics and Artificial Intelligence', 'UG', 3, 6, true, '2026-10-08 17:59:14.467', '2026-10-08 17:59:14.467', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j7001z80ktwrxjhkgn', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-QUANTUM-COMPUTING-AND-AI', 'Quantum Computing and Artificial Intelligence', 'UG', 3, 6, true, '2026-10-08 17:59:14.468', '2026-10-08 17:59:14.468', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j8002180ktt2f45khe', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-BIOINFORMATICS-WITH-AI', 'Bioinformatics with Artificial Intelligence', 'UG', 3, 6, true, '2026-10-08 17:59:14.468', '2026-10-08 17:59:14.468', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j8002380ktdi4tyull', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-STATISTICS-AND-DATA-SCIENCE', 'Statistics and Data Science', 'UG', 3, 6, true, '2026-10-08 17:59:14.469', '2026-10-08 17:59:14.469', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j9002580kt1m8rlaa5', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-MATHEMATICS-AND-CS', 'Mathematics and Computer Science', 'UG', 3, 6, true, '2026-10-08 17:59:14.469', '2026-10-08 17:59:14.469', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7j9002780ktxon5wqcd', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-STATISTICS-AND-QUANTITATIVE-METHODS', 'Statistics and Quantitative Methods', 'UG', 3, 6, true, '2026-10-08 17:59:14.47', '2026-10-08 17:59:14.47', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7ja002980ktxcnjn36w', 'cmuzu9ogh0005ydphjtmm2pfn', 'BSC-CHEMISTRY-AND-PHARMACEUTICAL-APPLICATIONS', 'Chemistry and Pharmaceutical Applications', 'UG', 3, 6, true, '2026-10-08 17:59:14.47', '2026-10-08 17:59:14.47', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7ja002b80ktuoiyvw17', 'cmuzu9ogh0005ydphjtmm2pfn', 'MCA-MASTER-OF-COMPUTER-APPLICATIONS', 'Master of Computer Applications', 'PG', 2, 4, true, '2026-10-08 17:59:14.471', '2026-10-08 17:59:14.471', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jb002d80ktipdx2558', 'cmuzu9ogh0005ydphjtmm2pfn', 'MSC-CS-AND-AI', 'Computer Science and Artificial Intelligence', 'PG', 2, 4, true, '2026-10-08 17:59:14.471', '2026-10-08 17:59:14.471', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jb002f80ktj29y2z56', 'cmuzu9ogh0005ydphjtmm2pfn', 'MSC-ORGANIC-CHEMISTRY-DRUG-DESIGN-AND-SYNTHESIS', 'Organic Chemistry, Drug Design and Synthesis', 'PG', 2, 4, true, '2026-10-08 17:59:14.472', '2026-10-08 17:59:14.472', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jc002h80ktalpeuol6', 'cmuzu9ogh0005ydphjtmm2pfn', 'MSC-MEDICAL-BIOTECHNOLOGY', 'Medical Biotechnology', 'PG', 2, 4, true, '2026-10-08 17:59:14.473', '2026-10-08 17:59:14.473', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jd002j80kt9exle6ye', 'cmuzu9ogh0006ydphx00z30mh', 'BBA', 'BBA', 'UG', 3, 6, true, '2026-10-08 17:59:14.473', '2026-10-08 17:59:14.473', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jd002l80kt9snh2i6v', 'cmuzu9ogh0006ydphx00z30mh', 'BBA-DIGITAL-MARKETING', 'Digital Marketing', 'UG', 3, 6, true, '2026-10-08 17:59:14.474', '2026-10-08 17:59:14.474', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7je002n80ktd8qqyqtv', 'cmuzu9ogh0006ydphx00z30mh', 'BBA-LOGISTICS-MANAGEMENT', 'Logistics Management', 'UG', 3, 6, true, '2026-10-08 17:59:14.474', '2026-10-08 17:59:14.474', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7je002p80kt7u5qtpoc', 'cmuzu9ogh0006ydphx00z30mh', 'BBA-HOSPITAL-MANAGEMENT', 'Hospital Management', 'UG', 3, 6, true, '2026-10-08 17:59:14.474', '2026-10-08 17:59:14.474', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7je002r80ktca7zdmiz', 'cmuzu9ogh0006ydphx00z30mh', 'BBA-ENTREPRENEUNSHIP-AND-STARTUP', 'Entrepreneunship and Startup', 'UG', 3, 6, true, '2026-10-08 17:59:14.475', '2026-10-08 17:59:14.475', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jf002t80ktwwrctqbu', 'cmuzu9ogh0006ydphx00z30mh', 'BBA-BUSINESS-ANALYTICS', 'Business Analytics', 'UG', 3, 6, true, '2026-10-08 17:59:14.475', '2026-10-08 17:59:14.475', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jf002v80ktpaeoagdu', 'cmuzu9ogh0006ydphx00z30mh', 'BBA-COMPUTER-APPLICATIONS', 'Computer Applications', 'UG', 3, 6, true, '2026-10-08 17:59:14.476', '2026-10-08 17:59:14.476', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jg002x80kt4eos5t70', 'cmuzu9ogh0006ydphx00z30mh', 'MBA', 'MBA', 'PG', 3, 6, true, '2026-10-08 17:59:14.476', '2026-10-08 17:59:14.476', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jg002z80ktfehuxkuy', 'cmuzu9ogh0006ydphx00z30mh', 'MBA-BUSINESS-ANALYTICS', 'Business Analytics', 'PG', 3, 6, true, '2026-10-08 17:59:14.477', '2026-10-08 17:59:14.477', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jh003180kttrozv13q', 'cmuzu9ogh0006ydphx00z30mh', 'MBA-LOGISTICS-AND-SUPPLY-CHAIN-MANAGEMENT', 'Logistics and Supply Chain Management', 'PG', 3, 6, true, '2026-10-08 17:59:14.478', '2026-10-08 17:59:14.478', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7ji003380ktcbf1254z', 'cmuzu9ogi0007ydphw5isz2ha', 'BA-TELUGU-AND-CIVIL-SERVICE-STUDIES', 'Telugu and Civil Service Studies', 'UG', 3, 6, true, '2026-10-08 17:59:14.478', '2026-10-08 17:59:14.478', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7ji003580kto81y8vmd', 'cmuzu9ogi0007ydphw5isz2ha', 'BA-SANSKRIT-AND-CIVIL-SERVICE-STUDIES', 'Sanskrit and Civil Service Studies', 'UG', 3, 6, true, '2026-10-08 17:59:14.479', '2026-10-08 17:59:14.479', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jj003780kt5k1wcsx8', 'cmuzu9ogi0007ydphw5isz2ha', 'BA-ECONOMICS-AND-CIVIL-SERVICE-STUDIES', 'Economics and Civil Service Studies', 'UG', 3, 6, true, '2026-10-08 17:59:14.479', '2026-10-08 17:59:14.479', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jj003980ktmiyf0rhy', 'cmuzu9ogi0007ydphw5isz2ha', 'BA-TRIBAL-STUDIES-AND-CIVIL-SERVICE-STUDIES', 'Tribal Studies and Civil Service Studies', 'UG', 3, 6, true, '2026-10-08 17:59:14.48', '2026-10-08 17:59:14.48', NULL, 'cmuztcm1y00079z3dlq5k2hdd');
INSERT INTO public."Program" VALUES ('cmuzuc7jk003b80ktbyrz72ls', 'cmuzu9ogi0007ydphw5isz2ha', 'MA-ASTROLOGY', 'Astrology', 'PG', 2, 4, true, '2026-10-08 17:59:14.48', '2026-10-08 17:59:14.48', NULL, 'cmuztcm1y00079z3dlq5k2hdd');


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: Subject; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: SubjectOffering; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: FacultySubjectAssignment; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: LabBatch; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: AttendanceSession; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: AttendanceAuditLog; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: AttendanceRecord; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."AuditLog" VALUES ('cmuzq1ix40001ewhzyzp3oygw', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 15:58:57.544');
INSERT INTO public."AuditLog" VALUES ('cmuzq1xu60003ewhzclcfcix0', 'cmuzp7hsc000bbynpr08m4i25', 'LOGOUT', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 15:59:16.878');
INSERT INTO public."AuditLog" VALUES ('cmuzqcd3g0003453fsotakgmx', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 16:07:23.213');
INSERT INTO public."AuditLog" VALUES ('cmuzqg2cq0005453fyw169hhv', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 16:10:15.915');
INSERT INTO public."AuditLog" VALUES ('cmuzqgfjt0007453f7gclf1v0', 'cmuzp7hsc000bbynpr08m4i25', 'LOGOUT', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 16:10:33.017');
INSERT INTO public."AuditLog" VALUES ('cmuzr4x5x0001z12z8qx70ggf', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 16:29:35.589');
INSERT INTO public."AuditLog" VALUES ('cmuzr5ud10009z12znzbeh37d', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 16:30:18.614');
INSERT INTO public."AuditLog" VALUES ('cmuzr8co3000bz12zbyorri34', 'cmuzp7hsc000bbynpr08m4i25', 'LOGOUT', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 16:32:15.651');
INSERT INTO public."AuditLog" VALUES ('cmuzr9frp000lz12zd78tf1k1', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 16:33:06.325');
INSERT INTO public."AuditLog" VALUES ('cmuzrs6g80001aev1mre0m1iv', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 16:47:40.713');
INSERT INTO public."AuditLog" VALUES ('cmuzrs6gp0004aev1l4vnde2d', 'cmuzp7hsc000bbynpr08m4i25', 'CREATE_SCHOOL', 'school', 'cmuzrs6gm0002aev1vi4id6n3', NULL, NULL, 'SUCCESS', '{"code": "SMGMT", "name": "School of Management Studies", "description": "Business Administration"}', '2026-10-08 16:47:40.729');
INSERT INTO public."AuditLog" VALUES ('cmuzrs6gw0008aev1ksupi1ya', 'cmuzp7hsc000bbynpr08m4i25', 'CREATE_DEPARTMENT', 'department', 'cmuzrs6gt0006aev18hgobd2d', NULL, NULL, 'SUCCESS', '{"code": "MGMT", "name": "Department of Management", "schoolId": "cmuzrs6gm0002aev1vi4id6n3", "isTeachingOnly": false}', '2026-10-08 16:47:40.737');
INSERT INTO public."AuditLog" VALUES ('cmuzrs6n5000faev1qyz89nbw', 'cmuzp7hsc000bbynpr08m4i25', 'CREATE_FACULTY', 'faculty', 'cmuzrs6n3000daev1h5huib4t', NULL, NULL, 'SUCCESS', '{"email": "a.sharma@gvpihlr.edu.in", "phone": "+91 9440112233", "fullName": "Dr. A. Sharma", "password": "[REDACTED]", "shortName": "AS", "employeeId": "GVPIHLR-FAC-0104", "designation": "Associate Professor", "departmentId": "cmuzrs6gt0006aev18hgobd2d", "qualification": "Ph.D in Management"}', '2026-10-08 16:47:40.961');
INSERT INTO public."AuditLog" VALUES ('cmuzrs6t5000haev1cf84synd', NULL, 'LOGIN', 'User', 'cmuzrs6my0009aev12aemiqzm', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 16:47:41.177');
INSERT INTO public."AuditLog" VALUES ('cmuzqgpk2000d453fqrj5jqas', NULL, 'LOGIN', 'User', 'cmuzp7hv3001vbynpvdaes997', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 16:10:45.986');
INSERT INTO public."AuditLog" VALUES ('cmuzr4x9i0005z12zwjohwbig', NULL, 'LOGIN', 'User', 'cmuzp7hv3001vbynpvdaes997', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 16:29:35.719');
INSERT INTO public."AuditLog" VALUES ('cmuzq20s90005ewhz44nyx1do', NULL, 'LOGIN', 'User', 'cmuzp7huw001qbynp14a3kl1i', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 15:59:20.697');
INSERT INTO public."AuditLog" VALUES ('cmuzq25ya0007ewhz9jymp5ia', NULL, 'LOGOUT', 'User', 'cmuzp7huw001qbynp14a3kl1i', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 15:59:27.394');
INSERT INTO public."AuditLog" VALUES ('cmuzr4x7t0003z12z1j696o7w', NULL, 'LOGIN', 'User', 'cmuzp7huw001qbynp14a3kl1i', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 16:29:35.657');
INSERT INTO public."AuditLog" VALUES ('cmuzr8itl000dz12zh6dhxqs6', NULL, 'LOGIN', 'User', 'cmuzp7huw001qbynp14a3kl1i', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 16:32:23.626');
INSERT INTO public."AuditLog" VALUES ('cmuzr8xre000fz12z8cw3wqd2', NULL, 'LOGOUT', 'User', 'cmuzp7huw001qbynp14a3kl1i', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 16:32:42.986');
INSERT INTO public."AuditLog" VALUES ('cmuzq292z0009ewhz16ahrtxc', NULL, 'LOGIN', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', '{"roles": ["STUDENT"]}', '2026-10-08 15:59:31.452');
INSERT INTO public."AuditLog" VALUES ('cmuzq2rsa000bewhzkd0tep4z', NULL, 'LOGOUT', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 15:59:55.69');
INSERT INTO public."AuditLog" VALUES ('cmuzqcd1k0001453ft112i155', NULL, 'LOGIN', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', '{"roles": ["STUDENT"]}', '2026-10-08 16:07:23.144');
INSERT INTO public."AuditLog" VALUES ('cmuzqgit10009453fg4el7cd6', NULL, 'LOGIN', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', '{"roles": ["STUDENT"]}', '2026-10-08 16:10:37.237');
INSERT INTO public."AuditLog" VALUES ('cmuzqgmkx000b453f2u3mxnz7', NULL, 'LOGOUT', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 16:10:42.13');
INSERT INTO public."AuditLog" VALUES ('cmuzr4xb60007z12za7j43lnn', NULL, 'LOGIN', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', '{"roles": ["STUDENT"]}', '2026-10-08 16:29:35.779');
INSERT INTO public."AuditLog" VALUES ('cmuzr913f000hz12zpb2s4zo7', NULL, 'LOGIN', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', '{"roles": ["STUDENT"]}', '2026-10-08 16:32:47.307');
INSERT INTO public."AuditLog" VALUES ('cmuzr9deu000jz12z8dysy2do', NULL, 'LOGOUT', 'User', 'cmuzp7hvh002fbynp64fpxb92', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 16:33:03.27');
INSERT INTO public."AuditLog" VALUES ('cmuzu9v6c00015nextr2s2iu7', 'cmuzu9op7005lydphc9foztkf', 'LOGIN', 'User', 'cmuzu9op7005lydphc9foztkf', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 17:57:25.141');
INSERT INTO public."AuditLog" VALUES ('cmuzua0qw00035nex1sibaqc1', 'cmuzu9oo4003dydph8jx0miue', 'LOGIN', 'User', 'cmuzu9oo4003dydph8jx0miue', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 17:57:32.36');
INSERT INTO public."AuditLog" VALUES ('cmuzua8b700055nex6oh5jxmo', 'cmuzu9op7005lydphc9foztkf', 'LOGIN', 'User', 'cmuzu9op7005lydphc9foztkf', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 17:57:42.163');
INSERT INTO public."AuditLog" VALUES ('cmuzuadvl00075nexv6qm0cye', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 17:57:49.378');
INSERT INTO public."AuditLog" VALUES ('cmuzucwrs00095nexpg2xnvnq', 'cmuzu9oo4003dydph8jx0miue', 'LOGIN', 'User', 'cmuzu9oo4003dydph8jx0miue', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 17:59:47.176');
INSERT INTO public."AuditLog" VALUES ('cmuzucwxo000b5nexoe4klawj', 'cmuzu9oof003iydphgyvr3cii', 'LOGIN', 'User', 'cmuzu9oof003iydphgyvr3cii', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 17:59:47.389');
INSERT INTO public."AuditLog" VALUES ('cmuzucx3k000d5nex7errndkv', 'cmuzu9op7005lydphc9foztkf', 'LOGIN', 'User', 'cmuzu9op7005lydphc9foztkf', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 17:59:47.601');
INSERT INTO public."AuditLog" VALUES ('cmuzucx9h000f5nex7h0m7058', 'cmuzu9oou004hydphvofh0ip3', 'LOGIN', 'User', 'cmuzu9oou004hydphvofh0ip3', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 17:59:47.813');
INSERT INTO public."AuditLog" VALUES ('cmuzucx9l000h5nex89we5n0w', NULL, 'FAILED_LOGIN', 'User', 'CKK', NULL, NULL, 'FAILURE', '{"reason": "User not found or inactive", "username": "CKK"}', '2026-10-08 17:59:47.818');
INSERT INTO public."AuditLog" VALUES ('cmuzucx9p000j5nexul7347nc', NULL, 'FAILED_LOGIN', 'User', 'CRB', NULL, NULL, 'FAILURE', '{"reason": "User not found or inactive", "username": "CRB"}', '2026-10-08 17:59:47.822');
INSERT INTO public."AuditLog" VALUES ('cmuzucx9s000l5nex78kk3ex6', NULL, 'FAILED_LOGIN', 'User', 'BK', NULL, NULL, 'FAILURE', '{"reason": "User not found or inactive", "username": "BK"}', '2026-10-08 17:59:47.824');
INSERT INTO public."AuditLog" VALUES ('cmuzucx9u000n5nexltca9h7t', NULL, 'FAILED_LOGIN', 'User', 'BJL', NULL, NULL, 'FAILURE', '{"reason": "User not found or inactive", "username": "BJL"}', '2026-10-08 17:59:47.827');
INSERT INTO public."AuditLog" VALUES ('cmuzucx9x000p5nexlaw6zlde', NULL, 'FAILED_LOGIN', 'User', 'CKR', NULL, NULL, 'FAILURE', '{"reason": "User not found or inactive", "username": "CKR"}', '2026-10-08 17:59:47.83');
INSERT INTO public."AuditLog" VALUES ('cmuzucxa0000r5nex0v47las8', NULL, 'FAILED_LOGIN', 'User', 'BGR', NULL, NULL, 'FAILURE', '{"reason": "User not found or inactive", "username": "BGR"}', '2026-10-08 17:59:47.832');
INSERT INTO public."AuditLog" VALUES ('cmuzucxa3000t5nexlf5f00gb', NULL, 'FAILED_LOGIN', 'User', 'BNL', NULL, NULL, 'FAILURE', '{"reason": "User not found or inactive", "username": "BNL"}', '2026-10-08 17:59:47.836');
INSERT INTO public."AuditLog" VALUES ('cmuzudmfq000v5nexpi6y3jpx', 'cmuzu9opn006zydphae7jr1mr', 'LOGIN', 'User', 'cmuzu9opn006zydphae7jr1mr', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:20.438');
INSERT INTO public."AuditLog" VALUES ('cmuzudmll000x5nexr54egqse', 'cmuzu9opx0083ydphujxl4qb4', 'LOGIN', 'User', 'cmuzu9opx0083ydphujxl4qb4', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:20.649');
INSERT INTO public."AuditLog" VALUES ('cmuzudmrg000z5nexm4z7or5e', 'cmuzu9oq60092ydphh6540ixl', 'LOGIN', 'User', 'cmuzu9oq60092ydphh6540ixl', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:20.86');
INSERT INTO public."AuditLog" VALUES ('cmuzudmxd00115nexmv5uco08', 'cmuzu9oqb009mydphxpmnxv51', 'LOGIN', 'User', 'cmuzu9oqb009mydphxpmnxv51', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:21.073');
INSERT INTO public."AuditLog" VALUES ('cmuzudn3b00135nex3tu1qes3', 'cmuzu9oql00alydphrnz57sid', 'LOGIN', 'User', 'cmuzu9oql00alydphrnz57sid', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:21.288');
INSERT INTO public."AuditLog" VALUES ('cmuzudn9a00155nexsp9g6i9r', 'cmuzu9oqw00bpydph8durqqw8', 'LOGIN', 'User', 'cmuzu9oqw00bpydph8durqqw8', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:21.503');
INSERT INTO public."AuditLog" VALUES ('cmuzudnf700175nexpl1f9m6w', 'cmuzu9or700cyydph5yd0ba42', 'LOGIN', 'User', 'cmuzu9or700cyydph5yd0ba42', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:21.716');
INSERT INTO public."AuditLog" VALUES ('cmuzudnl600195nexbwb4p1fn', 'cmuzu9oqu00bfydphgpni5k4s', 'LOGIN', 'User', 'cmuzu9oqu00bfydphgpni5k4s', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:21.93');
INSERT INTO public."AuditLog" VALUES ('cmuzudnr5001b5nexd6089f2z', 'cmuzu9op7005lydphc9foztkf', 'LOGIN', 'User', 'cmuzu9op7005lydphc9foztkf', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:22.146');
INSERT INTO public."AuditLog" VALUES ('cmuzudnx4001d5nexkcsdtfa9', 'cmuzu9op4005bydphxwgxubzc', 'LOGIN', 'User', 'cmuzu9op4005bydphxwgxubzc', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:22.36');
INSERT INTO public."AuditLog" VALUES ('cmuzudo34001f5nex8fa5iwco', 'cmuzu9oo4003dydph8jx0miue', 'LOGIN', 'User', 'cmuzu9oo4003dydph8jx0miue', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:22.577');
INSERT INTO public."AuditLog" VALUES ('cmuzuduq6001h5nexd04hag5l', 'cmuzu9oo4003dydph8jx0miue', 'LOGIN', 'User', 'cmuzu9oo4003dydph8jx0miue', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:31.182');
INSERT INTO public."AuditLog" VALUES ('cmuzuduw1001j5nexcc7rsz64', 'cmuzu9oof003iydphgyvr3cii', 'LOGIN', 'User', 'cmuzu9oof003iydphgyvr3cii', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:31.393');
INSERT INTO public."AuditLog" VALUES ('cmuzudv28001l5nexdopyhyaq', 'cmuzu9ooh003nydph6y8e5jp1', 'LOGIN', 'User', 'cmuzu9ooh003nydph6y8e5jp1', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:31.617');
INSERT INTO public."AuditLog" VALUES ('cmuzudv85001n5nexlyqcddvx', 'cmuzu9ooj003sydph9ysvw492', 'LOGIN', 'User', 'cmuzu9ooj003sydph9ysvw492', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:31.83');
INSERT INTO public."AuditLog" VALUES ('cmuzudve3001p5nexj5skk6ku', 'cmuzu9ool003xydphdqvmbd0b', 'LOGIN', 'User', 'cmuzu9ool003xydphdqvmbd0b', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:32.043');
INSERT INTO public."AuditLog" VALUES ('cmuzudvk1001r5nexc640b323', 'cmuzu9ooo0042ydph2cf7s60u', 'LOGIN', 'User', 'cmuzu9ooo0042ydph2cf7s60u', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:32.257');
INSERT INTO public."AuditLog" VALUES ('cmuzudvpz001t5nexg05uquw8', 'cmuzu9ooq0047ydphbogdnye1', 'LOGIN', 'User', 'cmuzu9ooq0047ydphbogdnye1', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:32.471');
INSERT INTO public."AuditLog" VALUES ('cmuzudvvx001v5nex9ysdvb2r', 'cmuzu9oos004cydphwkuc88w2', 'LOGIN', 'User', 'cmuzu9oos004cydphwkuc88w2', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:32.686');
INSERT INTO public."AuditLog" VALUES ('cmuzudw1x001x5nex6ubwolks', 'cmuzu9oou004hydphvofh0ip3', 'LOGIN', 'User', 'cmuzu9oou004hydphvofh0ip3', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:32.901');
INSERT INTO public."AuditLog" VALUES ('cmuzudw7v001z5nex2jxd3mff', 'cmuzu9oov004mydphjg2s99np', 'LOGIN', 'User', 'cmuzu9oov004mydphjg2s99np', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:33.116');
INSERT INTO public."AuditLog" VALUES ('cmuzudwdw00215nex4skrs6v1', 'cmuzu9oox004rydph03f490gx', 'LOGIN', 'User', 'cmuzu9oox004rydph03f490gx', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:33.333');
INSERT INTO public."AuditLog" VALUES ('cmuzudwjw00235nexamu0e73m', 'cmuzu9ooz004wydph7tohke43', 'LOGIN', 'User', 'cmuzu9ooz004wydph7tohke43', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:33.549');
INSERT INTO public."AuditLog" VALUES ('cmuzudwpw00255nex9g33br1p', 'cmuzu9op00051ydph57trnn42', 'LOGIN', 'User', 'cmuzu9op00051ydph57trnn42', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:33.764');
INSERT INTO public."AuditLog" VALUES ('cmuzudwvw00275nexemgs7lz7', 'cmuzu9op20056ydph0wtyy3la', 'LOGIN', 'User', 'cmuzu9op20056ydph0wtyy3la', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:33.981');
INSERT INTO public."AuditLog" VALUES ('cmuzudx1x00295nexe0ce0fgp', 'cmuzu9op4005bydphxwgxubzc', 'LOGIN', 'User', 'cmuzu9op4005bydphxwgxubzc', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:34.198');
INSERT INTO public."AuditLog" VALUES ('cmuzudx7x002b5nex1qf238b9', 'cmuzu9op6005gydphddh9mtce', 'LOGIN', 'User', 'cmuzu9op6005gydphddh9mtce', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:34.413');
INSERT INTO public."AuditLog" VALUES ('cmuzudxdw002d5nexb10sw986', 'cmuzu9op7005lydphc9foztkf', 'LOGIN', 'User', 'cmuzu9op7005lydphc9foztkf', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:34.629');
INSERT INTO public."AuditLog" VALUES ('cmuzudxjv002f5nexjpdk5ej7', 'cmuzu9op9005qydpho4pjs8iq', 'LOGIN', 'User', 'cmuzu9op9005qydpho4pjs8iq', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:34.844');
INSERT INTO public."AuditLog" VALUES ('cmuzudxpw002h5nexp8g3uh4k', 'cmuzu9opb005vydpha49v7tmk', 'LOGIN', 'User', 'cmuzu9opb005vydpha49v7tmk', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:35.061');
INSERT INTO public."AuditLog" VALUES ('cmuzudxvx002j5nex21l20m9i', 'cmuzu9opc0060ydphcbp9oo8l', 'LOGIN', 'User', 'cmuzu9opc0060ydphcbp9oo8l', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:35.277');
INSERT INTO public."AuditLog" VALUES ('cmuzudy20002l5nexwrkz2g6l', 'cmuzu9opd0065ydphxdu1ouox', 'LOGIN', 'User', 'cmuzu9opd0065ydphxdu1ouox', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:35.497');
INSERT INTO public."AuditLog" VALUES ('cmuzudy82002n5next0b7ra8c', 'cmuzu9opf006aydphzzilc6xg', 'LOGIN', 'User', 'cmuzu9opf006aydphzzilc6xg', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:35.715');
INSERT INTO public."AuditLog" VALUES ('cmuzudye4002p5nexa20lao19', 'cmuzu9opg006fydphssjkc4go', 'LOGIN', 'User', 'cmuzu9opg006fydphssjkc4go', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:35.933');
INSERT INTO public."AuditLog" VALUES ('cmuzudyk4002r5nexf3ebo2ar', 'cmuzu9opi006kydphjl44uiyy', 'LOGIN', 'User', 'cmuzu9opi006kydphjl44uiyy', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:36.149');
INSERT INTO public."AuditLog" VALUES ('cmuzudyq6002t5nex95z96q41', 'cmuzu9opj006pydphp024wu8u', 'LOGIN', 'User', 'cmuzu9opj006pydphp024wu8u', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:36.367');
INSERT INTO public."AuditLog" VALUES ('cmuzudyw7002v5nexuxv912la', 'cmuzu9opl006uydphxq8zd8up', 'LOGIN', 'User', 'cmuzu9opl006uydphxq8zd8up', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:36.584');
INSERT INTO public."AuditLog" VALUES ('cmuzudz2a002x5nexapra4mg7', 'cmuzu9opn006zydphae7jr1mr', 'LOGIN', 'User', 'cmuzu9opn006zydphae7jr1mr', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:36.802');
INSERT INTO public."AuditLog" VALUES ('cmuzudz8b002z5nexctd7bbtp', 'cmuzu9opo0074ydphr5czmqqq', 'LOGIN', 'User', 'cmuzu9opo0074ydphr5czmqqq', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:37.019');
INSERT INTO public."AuditLog" VALUES ('cmuzudzec00315nexp9j53rcs', 'cmuzu9opp0079ydph48ejt3tu', 'LOGIN', 'User', 'cmuzu9opp0079ydph48ejt3tu', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:37.236');
INSERT INTO public."AuditLog" VALUES ('cmuzudzke00335nexzvmimnmo', 'cmuzu9opr007eydphr66l82pw', 'LOGIN', 'User', 'cmuzu9opr007eydphr66l82pw', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:37.455');
INSERT INTO public."AuditLog" VALUES ('cmuzudzqg00355nexwa9va5wl', 'cmuzu9ops007jydph2w4telgt', 'LOGIN', 'User', 'cmuzu9ops007jydph2w4telgt', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:37.672');
INSERT INTO public."AuditLog" VALUES ('cmuzudzwi00375nexubpl2f56', 'cmuzu9opt007oydphtvdybf62', 'LOGIN', 'User', 'cmuzu9opt007oydphtvdybf62', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:37.89');
INSERT INTO public."AuditLog" VALUES ('cmuzue02i00395nexngjy30il', 'cmuzu9opu007tydph3tkyvaxq', 'LOGIN', 'User', 'cmuzu9opu007tydph3tkyvaxq', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:38.107');
INSERT INTO public."AuditLog" VALUES ('cmuzue08l003b5nexelgo8inn', 'cmuzu9opw007yydphn9klb1vx', 'LOGIN', 'User', 'cmuzu9opw007yydphn9klb1vx', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:38.326');
INSERT INTO public."AuditLog" VALUES ('cmuzue0en003d5nex74qk2hbw', 'cmuzu9opx0083ydphujxl4qb4', 'LOGIN', 'User', 'cmuzu9opx0083ydphujxl4qb4', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:38.544');
INSERT INTO public."AuditLog" VALUES ('cmuzue0kr003f5nexnedxbg0q', 'cmuzu9opy0088ydphf2ak7hvm', 'LOGIN', 'User', 'cmuzu9opy0088ydphf2ak7hvm', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:38.763');
INSERT INTO public."AuditLog" VALUES ('cmuzue0qt003h5nex78dsb26m', 'cmuzu9opz008dydphf45zjzey', 'LOGIN', 'User', 'cmuzu9opz008dydphf45zjzey', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:38.981');
INSERT INTO public."AuditLog" VALUES ('cmuzue0ww003j5nexg2w4utxx', 'cmuzu9oq1008iydphx72end76', 'LOGIN', 'User', 'cmuzu9oq1008iydphx72end76', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:39.201');
INSERT INTO public."AuditLog" VALUES ('cmuzue12x003l5nex4j3964sj', 'cmuzu9oq2008nydphukhr80tr', 'LOGIN', 'User', 'cmuzu9oq2008nydphukhr80tr', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:39.417');
INSERT INTO public."AuditLog" VALUES ('cmuzue198003n5nex69nvhp9x', 'cmuzu9oq4008sydphhvcxhf7x', 'LOGIN', 'User', 'cmuzu9oq4008sydphhvcxhf7x', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:39.645');
INSERT INTO public."AuditLog" VALUES ('cmuzue1fc003p5nexxodb5ei3', 'cmuzu9oq5008xydph5s3lk30w', 'LOGIN', 'User', 'cmuzu9oq5008xydph5s3lk30w', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:39.864');
INSERT INTO public."AuditLog" VALUES ('cmuzue1ld003r5nextro1uq7q', 'cmuzu9oq60092ydphh6540ixl', 'LOGIN', 'User', 'cmuzu9oq60092ydphh6540ixl', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:40.081');
INSERT INTO public."AuditLog" VALUES ('cmuzue1rf003t5nex2n3m2szv', 'cmuzu9oq70097ydphk9ko7f09', 'LOGIN', 'User', 'cmuzu9oq70097ydphk9ko7f09', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:40.3');
INSERT INTO public."AuditLog" VALUES ('cmuzue1xg003v5nex95cpeuao', 'cmuzu9oq8009cydph5icd3mme', 'LOGIN', 'User', 'cmuzu9oq8009cydph5icd3mme', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:40.517');
INSERT INTO public."AuditLog" VALUES ('cmuzue23i003x5nex3bv9s7r6', 'cmuzu9oqa009hydph4c12wqt6', 'LOGIN', 'User', 'cmuzu9oqa009hydph4c12wqt6', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:40.734');
INSERT INTO public."AuditLog" VALUES ('cmuzue29l003z5nex2lc4quh3', 'cmuzu9oqb009mydphxpmnxv51', 'LOGIN', 'User', 'cmuzu9oqb009mydphxpmnxv51', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:40.954');
INSERT INTO public."AuditLog" VALUES ('cmuzue2fp00415nexxivf008c', 'cmuzu9oqc009rydph4a3z44gt', 'LOGIN', 'User', 'cmuzu9oqc009rydph4a3z44gt', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:41.173');
INSERT INTO public."AuditLog" VALUES ('cmuzue2ls00435nexkedx3rn4', 'cmuzu9oqd009wydph37vthpub', 'LOGIN', 'User', 'cmuzu9oqd009wydph37vthpub', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:41.392');
INSERT INTO public."AuditLog" VALUES ('cmuzue2rw00455nex04sv03ae', 'cmuzu9oqe00a1ydphofwglgxa', 'LOGIN', 'User', 'cmuzu9oqe00a1ydphofwglgxa', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:41.613');
INSERT INTO public."AuditLog" VALUES ('cmuzue2y300475nexqpqt2bc1', 'cmuzu9oqf00a6ydphz8r5sbiv', 'LOGIN', 'User', 'cmuzu9oqf00a6ydphz8r5sbiv', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:41.835');
INSERT INTO public."AuditLog" VALUES ('cmuzue34800495nexefuawf3i', 'cmuzu9oqh00abydphyrk6wo0i', 'LOGIN', 'User', 'cmuzu9oqh00abydphyrk6wo0i', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:42.057');
INSERT INTO public."AuditLog" VALUES ('cmuzue3ab004b5nexlq6jz88l', 'cmuzu9oqj00agydpho3hnmh32', 'LOGIN', 'User', 'cmuzu9oqj00agydpho3hnmh32', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:42.275');
INSERT INTO public."AuditLog" VALUES ('cmuzue3gc004d5nex5mn60bfy', 'cmuzu9oql00alydphrnz57sid', 'LOGIN', 'User', 'cmuzu9oql00alydphrnz57sid', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:42.493');
INSERT INTO public."AuditLog" VALUES ('cmuzue3mo004f5nexyri10d56', 'cmuzu9oqm00aqydphkyxl6nml', 'LOGIN', 'User', 'cmuzu9oqm00aqydphkyxl6nml', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:42.721');
INSERT INTO public."AuditLog" VALUES ('cmuzue3st004h5nexfdb0hv0j', 'cmuzu9oqo00avydphnyap4rgv', 'LOGIN', 'User', 'cmuzu9oqo00avydphnyap4rgv', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:42.942');
INSERT INTO public."AuditLog" VALUES ('cmuzue3yw004j5nex939ftyyx', 'cmuzu9oqp00b0ydphx5t2pbfg', 'LOGIN', 'User', 'cmuzu9oqp00b0ydphx5t2pbfg', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:43.161');
INSERT INTO public."AuditLog" VALUES ('cmuzue44z004l5nex6r654y5o', 'cmuzu9oqq00b5ydphkng76q2y', 'LOGIN', 'User', 'cmuzu9oqq00b5ydphkng76q2y', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:43.38');
INSERT INTO public."AuditLog" VALUES ('cmuzue4b2004n5nexj2hv6128', 'cmuzu9oqs00baydphep82obna', 'LOGIN', 'User', 'cmuzu9oqs00baydphep82obna', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:43.599');
INSERT INTO public."AuditLog" VALUES ('cmuzue4h7004p5nex8i0xvagh', 'cmuzu9oqu00bfydphgpni5k4s', 'LOGIN', 'User', 'cmuzu9oqu00bfydphgpni5k4s', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:43.819');
INSERT INTO public."AuditLog" VALUES ('cmuzue4na004r5nexofasn5av', 'cmuzu9oqv00bkydphx9krsdp7', 'LOGIN', 'User', 'cmuzu9oqv00bkydphx9krsdp7', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:44.038');
INSERT INTO public."AuditLog" VALUES ('cmuzue4td004t5nex6fps83va', 'cmuzu9oqw00bpydph8durqqw8', 'LOGIN', 'User', 'cmuzu9oqw00bpydph8durqqw8', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:44.257');
INSERT INTO public."AuditLog" VALUES ('cmuzue4zf004v5nexkpk32i0o', 'cmuzu9oqy00buydphmu6in27s', 'LOGIN', 'User', 'cmuzu9oqy00buydphmu6in27s', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:44.475');
INSERT INTO public."AuditLog" VALUES ('cmuzue55j004x5nex16ywiedy', 'cmuzu9oqz00bzydph4zpmmvbe', 'LOGIN', 'User', 'cmuzu9oqz00bzydph4zpmmvbe', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:44.696');
INSERT INTO public."AuditLog" VALUES ('cmuzue5bm004z5nexswuspnvm', 'cmuzu9or000c4ydphqv593sn2', 'LOGIN', 'User', 'cmuzu9or000c4ydphqv593sn2', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:44.915');
INSERT INTO public."AuditLog" VALUES ('cmuzue5hq00515nexjlkdckem', 'cmuzu9or100c9ydphnmpwh80l', 'LOGIN', 'User', 'cmuzu9or100c9ydphnmpwh80l', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:45.135');
INSERT INTO public."AuditLog" VALUES ('cmuzue5nu00535nex2bwshj4o', 'cmuzu9or200ceydphygnpfuwb', 'LOGIN', 'User', 'cmuzu9or200ceydphygnpfuwb', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:45.355');
INSERT INTO public."AuditLog" VALUES ('cmuzue5tz00555nexic2acly7', 'cmuzu9or400cjydphst18nqf0', 'LOGIN', 'User', 'cmuzu9or400cjydphst18nqf0', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:45.576');
INSERT INTO public."AuditLog" VALUES ('cmuzue60400575nexlox2s8e0', 'cmuzu9or500coydphf8sxkt85', 'LOGIN', 'User', 'cmuzu9or500coydphf8sxkt85', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:45.797');
INSERT INTO public."AuditLog" VALUES ('cmuzue66700595nexswg5tylf', 'cmuzu9or600ctydph7010w0q9', 'LOGIN', 'User', 'cmuzu9or600ctydph7010w0q9', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:46.015');
INSERT INTO public."AuditLog" VALUES ('cmuzue6c9005b5nex81nu503y', 'cmuzu9or700cyydph5yd0ba42', 'LOGIN', 'User', 'cmuzu9or700cyydph5yd0ba42', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:46.234');
INSERT INTO public."AuditLog" VALUES ('cmuzue6ic005d5nexkzjcq0g3', 'cmuzu9or800d3ydph0v6t83c5', 'LOGIN', 'User', 'cmuzu9or800d3ydph0v6t83c5', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:46.452');
INSERT INTO public."AuditLog" VALUES ('cmuzue6og005f5nex0c08tzqv', 'cmuzu9or900d8ydphreapmzgd', 'LOGIN', 'User', 'cmuzu9or900d8ydphreapmzgd', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:46.672');
INSERT INTO public."AuditLog" VALUES ('cmuzue6uj005h5nexuu6t7d2y', 'cmuzu9ora00ddydphvr1vi0wp', 'LOGIN', 'User', 'cmuzu9ora00ddydphvr1vi0wp', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:46.892');
INSERT INTO public."AuditLog" VALUES ('cmuzue70o005j5nex9d57py4s', 'cmuzu9orc00diydphpybxtk7h', 'LOGIN', 'User', 'cmuzu9orc00diydphpybxtk7h', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:47.113');
INSERT INTO public."AuditLog" VALUES ('cmuzue76s005l5nexb7r5skzv', 'cmuzu9ord00dnydphdwln95zi', 'LOGIN', 'User', 'cmuzu9ord00dnydphdwln95zi', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:47.333');
INSERT INTO public."AuditLog" VALUES ('cmuzue7cv005n5nexhge7isrz', 'cmuzu9ore00dsydph0i05x8t6', 'LOGIN', 'User', 'cmuzu9ore00dsydph0i05x8t6', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:47.551');
INSERT INTO public."AuditLog" VALUES ('cmuzue7ix005p5nexyakd3mr2', 'cmuzu9orf00dxydphmg1iayhn', 'LOGIN', 'User', 'cmuzu9orf00dxydphmg1iayhn', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:47.77');
INSERT INTO public."AuditLog" VALUES ('cmuzue7p1005r5nexbsu67lh9', 'cmuzu9org00e2ydphu05asr0i', 'LOGIN', 'User', 'cmuzu9org00e2ydphu05asr0i', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:00:47.989');
INSERT INTO public."AuditLog" VALUES ('cmuzugyzk005t5nexso9j9ww9', 'cmuzp7hsc000bbynpr08m4i25', 'LOGOUT', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 18:02:56.672');
INSERT INTO public."AuditLog" VALUES ('cmuzuha59005v5nexdmcl9chh', 'cmuzu9op4005bydphxwgxubzc', 'LOGIN', 'User', 'cmuzu9op4005bydphxwgxubzc', NULL, NULL, 'SUCCESS', '{"roles": ["FACULTY"]}', '2026-10-08 18:03:11.133');
INSERT INTO public."AuditLog" VALUES ('cmuzuksvu005x5nexhfa51yyc', 'cmuzu9op4005bydphxwgxubzc', 'LOGOUT', 'User', 'cmuzu9op4005bydphxwgxubzc', NULL, NULL, 'SUCCESS', 'null', '2026-10-08 18:05:55.385');
INSERT INTO public."AuditLog" VALUES ('cmuzukuko005z5nexfy36wpdq', 'cmuzp7hsc000bbynpr08m4i25', 'LOGIN', 'User', 'cmuzp7hsc000bbynpr08m4i25', NULL, NULL, 'SUCCESS', '{"roles": ["SUPER_ADMIN"]}', '2026-10-08 18:05:57.577');


--
-- Data for Name: LabBatchStudent; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."Role" VALUES ('cmuzp7hmx0000bynp1ucssi8z', 'SUPER_ADMIN', 'SUPER_ADMIN institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hn50001bynpqpr92j6d', 'DIRECTOR', 'DIRECTOR institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hn60002bynp2eci90t2', 'DEAN', 'DEAN institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hn70003bynp3zevcmkk', 'HOD', 'HOD institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hn80004bynp6zohw7t1', 'FACULTY', 'FACULTY institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hn90005bynp42pbkgxh', 'STUDENT', 'STUDENT institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hna0006bynpl76lzpzs', 'PARENT', 'PARENT institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hnb0007bynpyw0p6bb1', 'ACADEMIC_ADMIN', 'ACADEMIC_ADMIN institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hnc0008bynp7bjkp2af', 'EXAM_ADMIN', 'EXAM_ADMIN institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hnc0009bynpvxo2l5tb', 'ACCOUNTS', 'ACCOUNTS institutional authority');
INSERT INTO public."Role" VALUES ('cmuzp7hnd000abynpvwgf06k3', 'OFFICE', 'OFFICE institutional authority');


--
-- Data for Name: StudentEnrollment; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: TimetableEntry; Type: TABLE DATA; Schema: public; Owner: saranneralla
--



--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: saranneralla
--

INSERT INTO public."UserRole" VALUES ('cmuzp7hsc000dbynppsz1uj90', 'cmuzp7hsc000bbynpr08m4i25', 'cmuzp7hmx0000bynp1ucssi8z', NULL, NULL, NULL, '2026-10-08 15:35:36.396');
INSERT INTO public."UserRole" VALUES ('cmuzu9oo8003fydphqvxvlow8', 'cmuzu9oo4003dydph8jx0miue', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000lydphdn41j7wh', NULL, '2026-10-08 17:57:16.713');
INSERT INTO public."UserRole" VALUES ('cmuzu9oog003kydph9t86ruwd', 'cmuzu9oof003iydphgyvr3cii', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000rydphged3u5y6', NULL, '2026-10-08 17:57:16.72');
INSERT INTO public."UserRole" VALUES ('cmuzu9ooi003pydphqyro3k85', 'cmuzu9ooh003nydph6y8e5jp1', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000rydphged3u5y6', NULL, '2026-10-08 17:57:16.722');
INSERT INTO public."UserRole" VALUES ('cmuzu9ook003uydphlnpx87pi', 'cmuzu9ooj003sydph9ysvw492', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000rydphged3u5y6', NULL, '2026-10-08 17:57:16.724');
INSERT INTO public."UserRole" VALUES ('cmuzu9oom003zydph9fji6ii0', 'cmuzu9ool003xydphdqvmbd0b', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000rydphged3u5y6', NULL, '2026-10-08 17:57:16.727');
INSERT INTO public."UserRole" VALUES ('cmuzu9oop0044ydph1acsbqf9', 'cmuzu9ooo0042ydph2cf7s60u', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000rydphged3u5y6', NULL, '2026-10-08 17:57:16.729');
INSERT INTO public."UserRole" VALUES ('cmuzu9oor0049ydphht89mra4', 'cmuzu9ooq0047ydphbogdnye1', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000rydphged3u5y6', NULL, '2026-10-08 17:57:16.732');
INSERT INTO public."UserRole" VALUES ('cmuzu9oot004eydphxtgjk65o', 'cmuzu9oos004cydphwkuc88w2', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000rydphged3u5y6', NULL, '2026-10-08 17:57:16.733');
INSERT INTO public."UserRole" VALUES ('cmuzu9oov004jydphutfl0pl8', 'cmuzu9oou004hydphvofh0ip3', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000jydphx3bznqs0', NULL, '2026-10-08 17:57:16.735');
INSERT INTO public."UserRole" VALUES ('cmuzu9oow004oydph49qpdbjh', 'cmuzu9oov004mydphjg2s99np', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000jydphx3bznqs0', NULL, '2026-10-08 17:57:16.737');
INSERT INTO public."UserRole" VALUES ('cmuzu9ooy004tydph6f637yjt', 'cmuzu9oox004rydph03f490gx', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000jydphx3bznqs0', NULL, '2026-10-08 17:57:16.738');
INSERT INTO public."UserRole" VALUES ('cmuzu9ooz004yydphym595r1q', 'cmuzu9ooz004wydph7tohke43', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000jydphx3bznqs0', NULL, '2026-10-08 17:57:16.74');
INSERT INTO public."UserRole" VALUES ('cmuzu9op10053ydph64fet5s5', 'cmuzu9op00051ydph57trnn42', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000jydphx3bznqs0', NULL, '2026-10-08 17:57:16.741');
INSERT INTO public."UserRole" VALUES ('cmuzu9op30058ydphd2j2nn53', 'cmuzu9op20056ydph0wtyy3la', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000jydphx3bznqs0', NULL, '2026-10-08 17:57:16.743');
INSERT INTO public."UserRole" VALUES ('cmuzu9op4005dydphupluxtjt', 'cmuzu9op4005bydphxwgxubzc', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.745');
INSERT INTO public."UserRole" VALUES ('cmuzu9op6005iydphrbg4jdqp', 'cmuzu9op6005gydphddh9mtce', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.747');
INSERT INTO public."UserRole" VALUES ('cmuzu9op8005nydph43r880mk', 'cmuzu9op7005lydphc9foztkf', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.748');
INSERT INTO public."UserRole" VALUES ('cmuzu9opa005sydphcr9yudra', 'cmuzu9op9005qydpho4pjs8iq', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.75');
INSERT INTO public."UserRole" VALUES ('cmuzu9opb005xydphjtkkw3il', 'cmuzu9opb005vydpha49v7tmk', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.752');
INSERT INTO public."UserRole" VALUES ('cmuzu9opc0062ydphpmc0lb24', 'cmuzu9opc0060ydphcbp9oo8l', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.753');
INSERT INTO public."UserRole" VALUES ('cmuzu9ope0067ydph7l6mhynm', 'cmuzu9opd0065ydphxdu1ouox', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.755');
INSERT INTO public."UserRole" VALUES ('cmuzu9opf006cydphgpb55i1t', 'cmuzu9opf006aydphzzilc6xg', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.756');
INSERT INTO public."UserRole" VALUES ('cmuzu9oph006hydph45jy0wet', 'cmuzu9opg006fydphssjkc4go', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.757');
INSERT INTO public."UserRole" VALUES ('cmuzu9opi006mydphdhxpx05k', 'cmuzu9opi006kydphjl44uiyy', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.759');
INSERT INTO public."UserRole" VALUES ('cmuzu9opk006rydphuxv62xri', 'cmuzu9opj006pydphp024wu8u', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.76');
INSERT INTO public."UserRole" VALUES ('cmuzu9opm006wydphrrr13i3u', 'cmuzu9opl006uydphxq8zd8up', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogj0009ydphloegjdx6', NULL, '2026-10-08 17:57:16.762');
INSERT INTO public."UserRole" VALUES ('cmuzu9opn0071ydphhp8ycy06', 'cmuzu9opn006zydphae7jr1mr', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.763');
INSERT INTO public."UserRole" VALUES ('cmuzu9opo0076ydphosus21n2', 'cmuzu9opo0074ydphr5czmqqq', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.765');
INSERT INTO public."UserRole" VALUES ('cmuzu9opq007bydphecrv4tka', 'cmuzu9opp0079ydph48ejt3tu', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.766');
INSERT INTO public."UserRole" VALUES ('cmuzu9opr007gydph78czi3qh', 'cmuzu9opr007eydphr66l82pw', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.768');
INSERT INTO public."UserRole" VALUES ('cmuzu9ops007lydphsu9cuwu6', 'cmuzu9ops007jydph2w4telgt', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.769');
INSERT INTO public."UserRole" VALUES ('cmuzu9opu007qydphed75jr0z', 'cmuzu9opt007oydphtvdybf62', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.77');
INSERT INTO public."UserRole" VALUES ('cmuzu9opv007vydphflnibiyk', 'cmuzu9opu007tydph3tkyvaxq', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.771');
INSERT INTO public."UserRole" VALUES ('cmuzu9opw0080ydphcmwh9pa9', 'cmuzu9opw007yydphn9klb1vx', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000dydphib4mqn64', NULL, '2026-10-08 17:57:16.773');
INSERT INTO public."UserRole" VALUES ('cmuzu9opx0085ydphtin56dro', 'cmuzu9opx0083ydphujxl4qb4', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogq000fydphc0dpxq2h', NULL, '2026-10-08 17:57:16.774');
INSERT INTO public."UserRole" VALUES ('cmuzu9opz008aydphtirvtinz', 'cmuzu9opy0088ydphf2ak7hvm', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogq000fydphc0dpxq2h', NULL, '2026-10-08 17:57:16.775');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq0008fydphalcktby7', 'cmuzu9opz008dydphf45zjzey', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogq000fydphc0dpxq2h', NULL, '2026-10-08 17:57:16.776');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq1008kydphecu207yl', 'cmuzu9oq1008iydphx72end76', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.777');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq3008pydph3zf6x6et', 'cmuzu9oq2008nydphukhr80tr', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.779');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq4008uydph1w4olk2q', 'cmuzu9oq4008sydphhvcxhf7x', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.78');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq5008zydphqyfv4ut7', 'cmuzu9oq5008xydph5s3lk30w', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.782');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq70094ydphr7nsdvcf', 'cmuzu9oq60092ydphh6540ixl', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.783');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq80099ydph0drgioui', 'cmuzu9oq70097ydphk9ko7f09', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.784');
INSERT INTO public."UserRole" VALUES ('cmuzu9oq9009eydph0ig1v96b', 'cmuzu9oq8009cydph5icd3mme', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.785');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqa009jydphckswpgsa', 'cmuzu9oqa009hydph4c12wqt6', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogt000tydphzkxjiy1r', NULL, '2026-10-08 17:57:16.787');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqb009oydphw290ioup', 'cmuzu9oqb009mydphxpmnxv51', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000bydph8wd22scj', NULL, '2026-10-08 17:57:16.788');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqc009tydphrqmhj3ay', 'cmuzu9oqc009rydph4a3z44gt', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000bydph8wd22scj', NULL, '2026-10-08 17:57:16.789');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqd009yydphlueuyc53', 'cmuzu9oqd009wydph37vthpub', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogp000bydph8wd22scj', NULL, '2026-10-08 17:57:16.79');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqf00a3ydph69x856p1', 'cmuzu9oqe00a1ydphofwglgxa', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.791');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqg00a8ydphe8cuw3cf', 'cmuzu9oqf00a6ydphz8r5sbiv', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.792');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqi00adydphd8e4ovpx', 'cmuzu9oqh00abydphyrk6wo0i', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.795');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqk00aiydphx8qjwul3', 'cmuzu9oqj00agydpho3hnmh32', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.796');
INSERT INTO public."UserRole" VALUES ('cmuzu9oql00anydph3p3yt89p', 'cmuzu9oql00alydphrnz57sid', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.798');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqn00asydph97le5bqj', 'cmuzu9oqm00aqydphkyxl6nml', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.799');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqo00axydphefmektyg', 'cmuzu9oqo00avydphnyap4rgv', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.801');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqq00b2ydphtdlskpgi', 'cmuzu9oqp00b0ydphx5t2pbfg', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.802');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqr00b7ydphm64oipzc', 'cmuzu9oqq00b5ydphkng76q2y', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.803');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqs00bcydph3rhsc2b6', 'cmuzu9oqs00baydphep82obna', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000nydph6e8x5r63', NULL, '2026-10-08 17:57:16.805');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqu00bhydph1xha6dhz', 'cmuzu9oqu00bfydphgpni5k4s', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000hydphjmf7gen1', NULL, '2026-10-08 17:57:16.807');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqv00bmydph6it2igov', 'cmuzu9oqv00bkydphx9krsdp7', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000hydphjmf7gen1', NULL, '2026-10-08 17:57:16.808');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqx00brydphdrnwbxsl', 'cmuzu9oqw00bpydph8durqqw8', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000hydphjmf7gen1', NULL, '2026-10-08 17:57:16.809');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqy00bwydph2uy0s98l', 'cmuzu9oqy00buydphmu6in27s', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000hydphjmf7gen1', NULL, '2026-10-08 17:57:16.81');
INSERT INTO public."UserRole" VALUES ('cmuzu9oqz00c1ydph1gnaggjf', 'cmuzu9oqz00bzydph4zpmmvbe', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000hydphjmf7gen1', NULL, '2026-10-08 17:57:16.812');
INSERT INTO public."UserRole" VALUES ('cmuzu9or000c6ydphpf1fn564', 'cmuzu9or000c4ydphqv593sn2', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000hydphjmf7gen1', NULL, '2026-10-08 17:57:16.813');
INSERT INTO public."UserRole" VALUES ('cmuzu9or200cbydphgkwc630a', 'cmuzu9or100c9ydphnmpwh80l', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogr000hydphjmf7gen1', NULL, '2026-10-08 17:57:16.814');
INSERT INTO public."UserRole" VALUES ('cmuzu9or300cgydphcuvntusz', 'cmuzu9or200ceydphygnpfuwb', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.815');
INSERT INTO public."UserRole" VALUES ('cmuzu9or400clydphs7ce109w', 'cmuzu9or400cjydphst18nqf0', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.816');
INSERT INTO public."UserRole" VALUES ('cmuzu9or500cqydpht8q9g176', 'cmuzu9or500coydphf8sxkt85', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.818');
INSERT INTO public."UserRole" VALUES ('cmuzu9or600cvydphacii13hw', 'cmuzu9or600ctydph7010w0q9', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.819');
INSERT INTO public."UserRole" VALUES ('cmuzu9or700d0ydphblheew2q', 'cmuzu9or700cyydph5yd0ba42', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.82');
INSERT INTO public."UserRole" VALUES ('cmuzu9or900d5ydphvy9z0kdx', 'cmuzu9or800d3ydph0v6t83c5', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.821');
INSERT INTO public."UserRole" VALUES ('cmuzu9ora00daydph0mts6nu9', 'cmuzu9or900d8ydphreapmzgd', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.822');
INSERT INTO public."UserRole" VALUES ('cmuzu9orb00dfydph16v46voa', 'cmuzu9ora00ddydphvr1vi0wp', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.823');
INSERT INTO public."UserRole" VALUES ('cmuzu9orc00dkydphgjvlcmah', 'cmuzu9orc00diydphpybxtk7h', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.824');
INSERT INTO public."UserRole" VALUES ('cmuzu9ord00dpydphtebpe99l', 'cmuzu9ord00dnydphdwln95zi', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.825');
INSERT INTO public."UserRole" VALUES ('cmuzu9ore00duydphvmc75ndt', 'cmuzu9ore00dsydph0i05x8t6', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.827');
INSERT INTO public."UserRole" VALUES ('cmuzu9orf00dzydphup4fw5rp', 'cmuzu9orf00dxydphmg1iayhn', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.828');
INSERT INTO public."UserRole" VALUES ('cmuzu9org00e4ydpheqoww0bl', 'cmuzu9org00e2ydphu05asr0i', 'cmuzp7hn80004bynp6zohw7t1', NULL, 'cmuzu9ogs000pydphal3o60px', NULL, '2026-10-08 17:57:16.829');


--
-- PostgreSQL database dump complete
--

\unrestrict AylAhQGBI1K6gHruaE45a2HcWykqCIwkE9egClr5B8jnh8sKltAgJ5e0JpIwqe6

