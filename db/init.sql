CREATE TABLE "user" (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'STUDENT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    points FLOAT NOT NULL,
    CONSTRAINT fk_question_exam FOREIGN KEY (exam_id)
        REFERENCES exam(id) ON DELETE CASCADE
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
        REFERENCES "user"(id) ON DELETE CASCADE,
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

INSERT INTO "user" (id, first_name, last_name, email, password_hash, role, is_active)
VALUES (
    'admin-001',
    'Admin',
    'Master',
    'admin@example.com',
    '$2b$10$Lz47G/QyXDPUMyisEIqxF.9hWuLHWtbo8FaLIDEVHH78PNOHjTxeG',
    'ADMIN',
    TRUE
);