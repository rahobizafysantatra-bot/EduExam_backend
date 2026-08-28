CREATE TABLE "user" (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
        CHECK (role IN ('ADMIN', 'STUDENT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course (
    id VARCHAR(255) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE exam (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_exam_course FOREIGN KEY (course_id)
        REFERENCES course(id) ON DELETE RESTRICT
);

CREATE TABLE question (
    id VARCHAR(255) PRIMARY KEY,
    exam_id VARCHAR(255) NOT NULL,
    statement TEXT NOT NULL,
    points FLOAT NOT NULL
        CHECK (points >= 1),
    position INTEGER NOT NULL DEFAULT 1
        CHECK (position >= 1),
    CONSTRAINT fk_question_exam
        FOREIGN KEY (exam_id)
        REFERENCES exam(id)
        ON DELETE CASCADE
);

CREATE TABLE choice (
    id VARCHAR(255) PRIMARY KEY,
    question_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_choice_question FOREIGN KEY (question_id)
        REFERENCES question(id) ON DELETE CASCADE
);

CREATE TABLE attempt (
    id VARCHAR(255) PRIMARY KEY,
    exam_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score FLOAT NOT NULL,
    CONSTRAINT fk_attempt_exam FOREIGN KEY (exam_id)
        REFERENCES exam(id) ON DELETE RESTRICT,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id)
        REFERENCES "user"(id) ON DELETE RESTRICT,
    CONSTRAINT uq_exam_student UNIQUE (exam_id, student_id)
);

CREATE TABLE answer (
    id VARCHAR(255) PRIMARY KEY,
    attempt_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    choice_id VARCHAR(255) NOT NULL,
    CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id)
        REFERENCES attempt(id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id)
        REFERENCES question(id) ON DELETE RESTRICT,
    CONSTRAINT fk_answer_choice FOREIGN KEY (choice_id)
        REFERENCES choice(id) ON DELETE RESTRICT,
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE SEQUENCE student_id_seq START 1;
CREATE SEQUENCE course_id_seq START 1;
CREATE SEQUENCE exam_id_seq START 1;


INSERT INTO course (id, code, name, description) VALUES
('CS0001', 'PROG1', 'Introduction to Algorithms', 'Algorithm basics using JavaScript'),
('CS0002', 'PROG2', 'Object-Oriented Programming', 'OOP concepts using Java'),
('CS0003', 'DONNEES1', 'Database Fundamentals', 'Basic database commands using PostgreSQL/SQL'),
('CS0004', 'LV1', 'French Language', 'French as a foreign language');
 
INSERT INTO "user" (id, first_name, name, email, password_hash, role, is_active) VALUES 
('admin-001', 'Admin', 'Administrateur', 'admin@example.com',
 '$2b$10$Lz47G/QyXDPUMyisEIqxF.9hWuLHWtbo8FaLIDEVHH78PNOHjTxeG', 'ADMIN', TRUE);
 
INSERT INTO exam (id, course_id, title, description, start_date, end_date) VALUES
('EX0001', 'CS0001', 'PROG1 Midterm - Algorithm Basics', 'Covers variables, complexity and arrays', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days'),
('EX0002', 'CS0002', 'PROG2 Midterm - Java OOP', 'Covers inheritance and polymorphism', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days'),
('EX0003', 'CS0003', 'DONNEES1 Midterm - SQL Basics', 'Covers SELECT, WHERE and parameterized queries', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days'),
('EX0004', 'CS0004', 'LV1 Midterm - French Basics', 'Covers vocabulary and grammar basics', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days');

INSERT INTO question (id, exam_id, statement, points, position) VALUES
('q-prog1-1', 'EX0001', 'Which JavaScript keyword declares a block-scoped variable?', 2, 1),
('q-prog1-2', 'EX0001', 'What is the time complexity of a binary search on a sorted array of n elements?', 3, 2),
('q-prog1-3', 'EX0001', 'Is an array in JavaScript zero-indexed?', 1, 3),
('q-prog2-1', 'EX0002', 'Which keyword is used to inherit a class in Java?', 2, 1),
('q-prog2-2', 'EX0002', 'Which OOP principle allows a subclass to override a method defined in its superclass?', 3, 2),
('q-prog2-3', 'EX0002', 'Can a Java class extend more than one class directly?', 1, 3),
('q-donnees1-1', 'EX0003', 'Which SQL command is used to retrieve data from a database?', 2, 1),
('q-donnees1-2', 'EX0003', 'Which clause is used to filter rows in SQL before grouping?', 3, 2),
('q-donnees1-3', 'EX0003', 'Does PostgreSQL support parameterized queries with $1, $2 syntax?', 1, 3),
('q-lv1-1', 'EX0004', 'Comment dit-on "hello" en francais ?', 2, 1),
('q-lv1-2', 'EX0004', 'Quel est le feminin de "acteur" ?', 3, 2),
('q-lv1-3', 'EX0004', 'Le mot "le" est-il un article defini masculin singulier ?', 1, 3);

INSERT INTO choice (id, question_id, text, is_correct) VALUES
('c-prog1-1-a', 'q-prog1-1', 'var', FALSE),
('c-prog1-1-b', 'q-prog1-1', 'let', TRUE),
('c-prog1-1-c', 'q-prog1-1', 'function', FALSE),
('c-prog1-1-d', 'q-prog1-1', 'class', FALSE),

('c-prog1-2-a', 'q-prog1-2', 'O(n)', FALSE),
('c-prog1-2-b', 'q-prog1-2', 'O(log n)', TRUE),
('c-prog1-2-c', 'q-prog1-2', 'O(n^2)', FALSE),
('c-prog1-2-d', 'q-prog1-2', 'O(1)', FALSE),

('c-prog1-3-a', 'q-prog1-3', 'Yes', TRUE),
('c-prog1-3-b', 'q-prog1-3', 'No', FALSE),

('c-prog2-1-a', 'q-prog2-1', 'implements', FALSE),
('c-prog2-1-b', 'q-prog2-1', 'extends', TRUE),
('c-prog2-1-c', 'q-prog2-1', 'inherits', FALSE),
('c-prog2-1-d', 'q-prog2-1', 'super', FALSE),

('c-prog2-2-a', 'q-prog2-2', 'Encapsulation', FALSE),
('c-prog2-2-b', 'q-prog2-2', 'Abstraction', FALSE),
('c-prog2-2-c', 'q-prog2-2', 'Polymorphism', TRUE),
('c-prog2-2-d', 'q-prog2-2', 'Inheritance', FALSE),

('c-prog2-3-a', 'q-prog2-3', 'Yes', FALSE),
('c-prog2-3-b', 'q-prog2-3', 'No', TRUE),

('c-donnees1-1-a', 'q-donnees1-1', 'GET', FALSE),
('c-donnees1-1-b', 'q-donnees1-1', 'SELECT', TRUE),
('c-donnees1-1-c', 'q-donnees1-1', 'FETCH', FALSE),
('c-donnees1-1-d', 'q-donnees1-1', 'PULL', FALSE),

('c-donnees1-2-a', 'q-donnees1-2', 'HAVING', FALSE),
('c-donnees1-2-b', 'q-donnees1-2', 'WHERE', TRUE),
('c-donnees1-2-c', 'q-donnees1-2', 'GROUP BY', FALSE),
('c-donnees1-2-d', 'q-donnees1-2', 'ORDER BY', FALSE),

('c-donnees1-3-a', 'q-donnees1-3', 'Yes', TRUE),
('c-donnees1-3-b', 'q-donnees1-3', 'No', FALSE),

('c-lv1-1-a', 'q-lv1-1', 'Au revoir', FALSE),
('c-lv1-1-b', 'q-lv1-1', 'Bonjour', TRUE),
('c-lv1-1-c', 'q-lv1-1', 'Merci', FALSE),
('c-lv1-1-d', 'q-lv1-1', 'S''il vous plait', FALSE),

('c-lv1-2-a', 'q-lv1-2', 'Actrice', TRUE),
('c-lv1-2-b', 'q-lv1-2', 'Acteure', FALSE),
('c-lv1-2-c', 'q-lv1-2', 'Actorine', FALSE),
('c-lv1-2-d', 'q-lv1-2', 'Actrisse', FALSE),

('c-lv1-3-a', 'q-lv1-3', 'Oui', TRUE),
('c-lv1-3-b', 'q-lv1-3', 'Non', FALSE);

INSERT INTO attempt (id, exam_id, student_id, submitted_at, score) VALUES
('attempt-std25001-ex0001', 'EX0001', 'STD25001', NOW() - INTERVAL '2 hours', 2);

INSERT INTO answer (id, attempt_id, question_id, choice_id) VALUES
('answer-1', 'attempt-std25001-ex0001', 'q-prog1-1', 'c-prog1-1-b'),
('answer-2', 'attempt-std25001-ex0001', 'q-prog1-2', 'c-prog1-2-a');

SELECT setval('course_id_seq', 4, true);
SELECT setval('exam_id_seq', 4, true);
SELECT setval('student_id_seq', 4, true);