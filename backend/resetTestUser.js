const bcrypt = require("bcryptjs");
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Sam@1234",
    database: "store_rating_db"
});

const newPassword = "TestUser@123";

bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
        console.error(err);
        return;
    }

    db.connect((err) => {
        if (err) {
            console.error("Database connection failed:", err);
            return;
        }

        const sql = `
            UPDATE users
            SET password = ?
            WHERE email = ?
        `;

        db.query(
            sql,
            [hashedPassword, "test@example.com"],
            (err, result) => {
                if (err) {
                    console.error("Password update failed:", err);
                } else {
                    console.log(
                        "Password updated successfully. Rows changed:",
                        result.affectedRows
                    );
                }

                db.end();
            }
        );
    });
});