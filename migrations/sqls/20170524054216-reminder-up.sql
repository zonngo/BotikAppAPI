
-- start_date: default is now (datetime)
-- end_date: if hour and minutes is not specified default is 11:59

-- repeat_type: H -> Periodic Hourly, L -> List Daily
-- start_time: minute of the day when start the cycle
-- every_minutes: how minutes every reminder occurs

-- cycle_day: day on the cycle when start_date, max 127
-- cycle_enabled_days: how much days enabled, max 127
-- cycle_disabled_days: how much days disabled, max 127

-- day_filter: filter days of the week in each bit

-- timezone: offset minute
-- state: state of the reminder, default is activated (1)

CREATE TABLE REMINDER (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL ,
  medication_name VARCHAR(256) NOT NULL ,
  start_date DATETIME, -- UTC
  end_date DATETIME, -- UTC
  repeat_type CHAR(1),

  start_time DATETIME, -- UTC
  every_minutes SMALLINT, -- Minutes

  cycle_day SMALLINT NULL DEFAULT NULL,
  cycle_enabled_days TINYINT DEFAULT 1,
  cycle_disabled_days TINYINT DEFAULT 0,

  day_filter TINYINT DEFAULT 127,

  timezone SMALLINT DEFAULT -300,
  state CHAR(1) DEFAULT '1',
  INDEX REMINDER_USER_ID_INDEX (user_id)
);

-- time: minute of the day of the reminder
create TABLE REMINDER_LIST(
  id INT PRIMARY KEY AUTO_INCREMENT,
  reminder_id INT,
  time SMALLINT,
  FOREIGN KEY REMINDER_LIST_REMINDER (reminder_id) REFERENCES REMINDER(id),
  INDEX reminder_id_index (reminder_id)
);
