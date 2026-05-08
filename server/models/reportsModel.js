// CREATE TABLE reports (
//   report_id UUID PRIMARY KEY NOT NULL, 
//   user_id UUID  REFERENCES users, 
//   report_content VARCHAR(255), 
//   status report_status NOT NULL, 
//   created_at DATE NOT NULL
// );