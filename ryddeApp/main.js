const express = require("express");
const bcrypt = require("bcrypt");
const sessionMiddleware = require("./session.js");
const { conn } = require("./db.js");

const route = express();
const port = 1488;

route.use(express.urlencoded({ extended: false }));
route.use(express.json());
route.use(sessionMiddleware);
route.use(express.static("public"));

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ redirect: "/login.html" });
    }
    next();
}

//##Offentlige Ruter##
//user registration
route.post("/submitUser", async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(password, salt);

        const userInsert = "INSERT INTO user (username, password) VALUES (?, ?)";
        await conn(userInsert, [username, hashedPwd]);

        res.json({ success: true, message: "Bruker registrert!" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, Error: "userReg: Error occured" });
    };
});

//user Login
route.post("/loginUser", async (req, res) => {
    try {
        const { username, password } = req.body;
        const sql = "SELECT * FROM user WHERE username = ?";
        const rows = await conn(sql, [username]);

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "Incorrect password or username" });
        };

        const user = rows[0];
        const verifyPwd = await bcrypt.compare(password, user.password);

        if (!verifyPwd || username !== user.username) {
            return res.status(400).json({ success: false, message: "Incorrect password or username" });
        };

        req.session.user = { id: user.id, username: user.username };

        res.json({ success: true, message: "Login successful" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "userLogin: Error occured" });
    };
});

//logg ut
route.get("/logout", async (req, res, next) => {
    try {
        req.session.destroy();
        res.json({ success: true, message: "Logget ut" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "logout: Error occured" });
    };
});

route.use("/checkLogged", requireLogin, async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ redirect: "/login.html" });
    };
});

//hent user session
route.get("/fetchSession", requireLogin, async (req, res) => {
    sessionData = req.session.user;
    res.json({ success: true, data: sessionData });
});

//hent bruker data
route.use("/fetchUsername", requireLogin, async (req, res) => {
    try {
        res.json({ success: true, data: req.session.user.username });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "fetchUserData: Error occured" });
    };
});

//oppdater bruker data
route.post("/updateUserData", requireLogin, async (req, res) => {
    try {
        const { username, newPwd } = req.body;

        if (newPwd !== "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPwd = await bcrypt.hash(newPwd, salt);
            const updateQuery = "UPDATE user SET username = ?, password = ? WHERE id = ?";
            await conn(updateQuery, [username, hashedPwd, req.session.user.id]);

            req.session.user.username = username;

            res.json({ success: true, message: "credentials updated!" });
        }
        else if (!username || username.trim() === "") {
            res.json({ success: true, message: "Brukernavn er tomt" });
        }
        else {
            const updateQuery = "UPDATE user SET username = ? WHERE id = ?";
            await conn(updateQuery, [username, req.session.user.id]);

            req.session.user.username = username;

            res.json({ success: true, message: "credentials updated!" });
        };
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "updateUserData: Error occured" });
    };
});

//hent oppgave data
route.get("/taskData", requireLogin, async (req, res) => {
    try{
        const taskQuery = `
            SELECT t.*, tc.category_name, u.username AS author_username FROM task t
            INNER JOIN user u ON t.author_id = u.id
            INNER JOIN task_category tc ON t.category = tc.id`;
        const taskObject = await conn(taskQuery);

        const compQuery = "SELECT tc.*, u.username AS comp_username FROM completed_task tc INNER JOIN user u on tc.user_id = u.id";
        const compTaskData = await conn(compQuery);

        const taskData = taskObject.map(item => {
            const match = compTaskData.find(c => c.task_id === item.id);
            return match ? { ...item, comp_username: match.comp_username, comp_date: match.date_completed } : { ...item, comp_username: null, comp_date: null };
        });



        return res.json({ success: true, data: taskData });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: "taskData: Error occured" });
    };
});

//opprett ny oppgave
route.post("/createTask", requireLogin, async (req, res) => {
    try{
        const { name, difficulty, description, categoryStr } = req.body;
        const author_id = req.session.user.id;
        const category = parseInt(categoryStr);

        const sql = "INSERT INTO task (name, description, difficulty, category, author_id) VALUES (?, ?, ?, ?, ?)";
        await conn(sql, [name, description, difficulty, category, author_id]);

        res.json({ success: true, message: "Task Inserted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "createTask: Error occured" });
    };
});

//ferdig oppgave
route.post("/compTask", requireLogin, async (req, res) => {
    try {
        const { taskId, comp_username } = req.body;
        compQuery = "INSERT INTO completed_task (task_id, user_id) SELECT ?, u.id FROM user u WHERE u.username = ?";
        compRes = await conn(compQuery, [taskId, comp_username]);

        if (compRes.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "Brukernavnet finnes ikke" });
        };
        res.json({ success: true, message: 'Oppgave markert "Fullført"' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false,message: "compTask: Error occured" });
    };
});

//task deleted
route.post("/deleteTask", requireLogin, async (req, res) => {
    try {
        const { taskId } = req.body;
        deleteQuery = "DELETE FROM task WHERE id = ?";
        deleteRes = await conn(deleteQuery, [taskId]);

        res.json({ success: true, message: "Oppgave slettet" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "deleteTask: Error occured" });
    };
});

//hent brukere for poeng podium
route.get("/getMemberTasks", requireLogin, async (req, res) => {
    try {
        const getMemberQuery = `
                SELECT
                    u.username,
                    u.id AS user_id,
                    c.id AS completed_id,
                    c.task_id AS completed_task_id,
                    c.date_completed AS completed_date_completed,
                    t.id AS task_id,
                    t.name AS task_name,
                    t.description AS task_description,
                    t.difficulty AS task_difficulty,
                    t.category AS task_category,
                    t.date_added AS task_date_added,
                    author.username AS author_username
                FROM user u
                LEFT JOIN completed_task c
                    ON u.id = c.user_id
                LEFT JOIN task t
                    ON t.id = c.task_id
                LEFT JOIN user author
                    ON t.author_id = author.id`;
        const fetchedMembers = await conn(getMemberQuery);
        res.json({ success: true, memberData: fetchedMembers });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "getFamilyUsers: Error occured" });
    };
});

//Må legge til familie funksjon

route.listen(port, () => console.log("Server running on port", port));
