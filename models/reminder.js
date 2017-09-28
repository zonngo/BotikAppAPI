/**
 * Created by vcueva on 6/1/17.
 */

const dbConn = require('../database/medicine');

/**
 * @param row
 * @param row.id
 * @param row.user_id
 * @param row.medication_name
 * @param row.start_date
 * @param row.end_date
 * @param row.repeat_type
 * @param row.start_time
 * @param row.every_minutes
 * @param row.cycle_day
 * @param row.cycle_enabled_days
 * @param row.cycle_disabled_days
 * @param row.day_filter
 * @param row.timezone
 * @param row.state
 * @returns {{id, user_id: *, medication_name: *, start_date: *, end_date: *}}
 */
function formatReminder(row) {
	let reminder = {
		id: row.id,
		user_id: row.user_id,
		medication_name: row.medication_name,
		start_date: row.start_date,
		end_date: row.end_date
	};

	if (row.repeat_type === 'H') {
		reminder.repeat_type = {
			code: 'H',
			description: 'Periodic Hourly'
		};

		reminder.start_time = row.start_time;
		reminder.every_minutes = row.every_minutes;
	} else {

	}

	if (row.cycle_day && row.cycle_day > 0) {
		reminder.filters = [];
		reminder.filters.push({
			cycle_day: row.cycle_day,
			cycle_enabled_days: row.cycle_enabled_days,
			cycle_disabled_days: row.cycle_disabled_days
		});
	}

	if (row.day_filter !== 127) {
		reminder.filters = reminder.filters || [];

		let df = {};
		for (let i = 0; i < 7; i++) {
			df["d" + i] = (row.day_filter&(1<<i))?"enabled":"disabled";
		}
		reminder.filters.push(df);
	}

	return reminder;
}


/**
 *
 * @param options
 * @param options.id
 */
module.exports.find = function (options) {
	return new Promise(function (resolve, reject) {
		let q = 'SELECT id, user_id, medication_name, start_date, end_date, repeat_type, start_time, every_minutes, ' +
			'cycle_day, cycle_enabled_days, cycle_disabled_days, day_filter, timezone, state ' +
			'FROM REMINDER WHERE id = ?';

		dbConn.query(q, [options.id], function (err, rows) {
			if (err) {
				console.error(err);
				return reject({
					code: 500,
					message: err
				});
			}

			if (rows.length === 0) {
				return reject({
					code: 404
				});
			}

			resolve(formatReminder(rows[0]));
		});
	}).then(function (reminder) {
		if (reminder.repeat_type.code === 'H') {
			return reminder;
		}

		return new Promise(function (resolve, reject) {
			let q = 'SELECT id, reminder_id, time FROM REMINDER_LIST WHERE reminder_id = ?';

			dbConn.query(q, [options.id], function (err, rows) {
				if (err) {
					console.error(err);
					return reject({
						code: 500,
						message: err
					});
				}

				reminder.hours_day = rows.forEach(function (row) {
					return row.time;
				});

				resolve(reminder);
			});
		});
	});
};

/**
 *
 * @param options
 * @param options.user_id
 */
module.exports.all = function (options) {
	return new Promise(function (resolve, reject) {
		let q = 'SELECT id, user_id, medication_name, start_date, end_date, repeat_type, start_time, every_minutes, ' +
			'cycle_day, cycle_enabled_days, cycle_disabled_days, day_filter, timezone, state ' +
			'FROM REMINDER WHERE user_id = ?';

		dbConn.query(q, [options.user_id], function (err, rows) {
			if (err) {
				console.error(err);
				return reject({
					code: 500,
					message: err
				})
			}

			resolve(rows.forEach(function (row) {return formatReminder(row); }));
		});
	}).then(function (reminders) {

	});
};


/**
 *
 * @param reminder
 */
module.exports.save = function (reminder) {
	return new Promise(function (resolve, reject) {
		let q;
		if (reminder.id) {

		} else {
			q = 'INSERT INTO REMINDER (id, user_id, medication_name, start_date, end_date, repeat_type';

		}
	});
};
