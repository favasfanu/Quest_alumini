# Quest Foundation Database Schema

## Core Tables

### users
```sql
id                  UUID PRIMARY KEY
email               VARCHAR(255) UNIQUE NOT NULL
password_hash       VARCHAR(255) NOT NULL
user_type           ENUM('ALUMNI', 'STAFF', 'NON_ALUMNI') NOT NULL
role                ENUM('ADMIN', 'ALUMNI_MEMBER', 'QUEST_STAFF', 'NON_ALUMNI_MEMBER', 'LOAN_MANAGER') NOT NULL
status              ENUM('PENDING', 'APPROVED', 'REJECTED', 'DISABLED') DEFAULT 'PENDING'
is_loan_eligible    BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
approved_at         TIMESTAMP
approved_by         UUID REFERENCES users(id)
```

### profiles
```sql
id                  UUID PRIMARY KEY
user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
full_name           VARCHAR(255) NOT NULL
profile_photo_url   VARCHAR(500)
alumni_id           VARCHAR(50) UNIQUE
batch_year          INTEGER
department          VARCHAR(255)
course              VARCHAR(255)

-- Current Status
currently_working   BOOLEAN DEFAULT FALSE
currently_studying  BOOLEAN DEFAULT FALSE
city                VARCHAR(100)
state               VARCHAR(100)
country             VARCHAR(100)

-- Family Details
marital_status      ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')
spouse_name         VARCHAR(255)
children_count      INTEGER DEFAULT 0

created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
```

### profile_privacy_settings
```sql
id                      UUID PRIMARY KEY
profile_id              UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE
family_details_visible  BOOLEAN DEFAULT FALSE
education_visible       BOOLEAN DEFAULT FALSE
job_history_visible     BOOLEAN DEFAULT FALSE
current_job_visible     BOOLEAN DEFAULT TRUE
contact_details_visible BOOLEAN DEFAULT TRUE
```

### contact_details
```sql
id              UUID PRIMARY KEY
profile_id      UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE
phone           VARCHAR(20)
whatsapp        VARCHAR(20)
email           VARCHAR(255)
linkedin_url    VARCHAR(500)
instagram_url   VARCHAR(500)
other_links     JSONB
```

### education_records
```sql
id                  UUID PRIMARY KEY
profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE
institution         VARCHAR(255) NOT NULL
degree              VARCHAR(255) NOT NULL
field_of_study      VARCHAR(255)
start_year          INTEGER NOT NULL
end_year            INTEGER
currently_studying  BOOLEAN DEFAULT FALSE
display_order       INTEGER DEFAULT 0
created_at          TIMESTAMP DEFAULT NOW()
```

### job_experiences
```sql
id                  UUID PRIMARY KEY
profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE
company_name        VARCHAR(255) NOT NULL
job_title           VARCHAR(255) NOT NULL
industry            VARCHAR(255)
start_date          DATE NOT NULL
end_date            DATE
currently_working   BOOLEAN DEFAULT FALSE
job_location        VARCHAR(255)
display_order       INTEGER DEFAULT 0
created_at          TIMESTAMP DEFAULT NOW()
```

### membership_cards
```sql
id                  UUID PRIMARY KEY
user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
card_number         VARCHAR(50) UNIQUE NOT NULL
qr_code_data        TEXT NOT NULL
qr_code_url         VARCHAR(500)
card_status         ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE'
issued_at           TIMESTAMP DEFAULT NOW()
last_regenerated_at TIMESTAMP
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
```

## Loan Module Tables

### loan_categories
```sql
id                      UUID PRIMARY KEY
name                    VARCHAR(255) NOT NULL
description             TEXT
max_loan_amount         DECIMAL(12,2) NOT NULL
monthly_interest_rate   DECIMAL(5,2) NOT NULL
repayment_duration_months INTEGER NOT NULL
guarantor_active_loan_limit INTEGER DEFAULT 3
is_enabled              BOOLEAN DEFAULT TRUE
created_at              TIMESTAMP DEFAULT NOW()
updated_at              TIMESTAMP DEFAULT NOW()
created_by              UUID REFERENCES users(id)
```

### loan_applications
```sql
id                      UUID PRIMARY KEY
applicant_id            UUID REFERENCES users(id) ON DELETE CASCADE
loan_category_id        UUID REFERENCES loan_categories(id)
loan_amount             DECIMAL(12,2) NOT NULL
monthly_interest        DECIMAL(12,2) NOT NULL
total_payable           DECIMAL(12,2) NOT NULL
emi_amount              DECIMAL(12,2) NOT NULL
repayment_months        INTEGER NOT NULL

status                  ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FUNDS_TRANSFERRED', 'ACTIVE_LOAN', 'COMPLETED', 'CLOSED') DEFAULT 'SUBMITTED'

guarantor1_id           UUID REFERENCES users(id)
guarantor1_confirmed    BOOLEAN DEFAULT FALSE
guarantor2_id           UUID REFERENCES users(id)
guarantor2_confirmed    BOOLEAN DEFAULT FALSE

purpose                 TEXT
remarks                 TEXT
rejection_reason        TEXT

submitted_at            TIMESTAMP DEFAULT NOW()
reviewed_at             TIMESTAMP
approved_at             TIMESTAMP
funds_transferred_at    TIMESTAMP
completed_at            TIMESTAMP

reviewed_by             UUID REFERENCES users(id)
approved_by             UUID REFERENCES users(id)

created_at              TIMESTAMP DEFAULT NOW()
updated_at              TIMESTAMP DEFAULT NOW()
```

### loan_repayments
```sql
id                  UUID PRIMARY KEY
loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE
repayment_month     INTEGER NOT NULL
due_amount          DECIMAL(12,2) NOT NULL
paid_amount         DECIMAL(12,2) DEFAULT 0
due_date            DATE NOT NULL
paid_date           DATE
payment_status      ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE') DEFAULT 'PENDING'
remarks             TEXT
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
```

### audit_logs
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
action          VARCHAR(255) NOT NULL
entity_type     VARCHAR(100) NOT NULL
entity_id       UUID NOT NULL
old_values      JSONB
new_values      JSONB
ip_address      VARCHAR(45)
user_agent      TEXT
timestamp       TIMESTAMP DEFAULT NOW()
```

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_role ON users(role);

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_alumni_id ON profiles(alumni_id);
CREATE INDEX idx_profiles_batch_year ON profiles(batch_year);
CREATE INDEX idx_profiles_department ON profiles(department);

-- Education
CREATE INDEX idx_education_profile_id ON education_records(profile_id);
CREATE INDEX idx_education_institution ON education_records(institution);

-- Jobs
CREATE INDEX idx_jobs_profile_id ON job_experiences(profile_id);
CREATE INDEX idx_jobs_company ON job_experiences(company_name);
CREATE INDEX idx_jobs_title ON job_experiences(job_title);
CREATE INDEX idx_jobs_currently_working ON job_experiences(currently_working);

-- Loans
CREATE INDEX idx_loans_applicant_id ON loan_applications(applicant_id);
CREATE INDEX idx_loans_status ON loan_applications(status);
CREATE INDEX idx_loans_guarantor1 ON loan_applications(guarantor1_id);
CREATE INDEX idx_loans_guarantor2 ON loan_applications(guarantor2_id);
CREATE INDEX idx_loans_category ON loan_applications(loan_category_id);

-- Audit
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```
