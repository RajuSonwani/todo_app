const knex = require("../models/pool");
const bcrypt = require("bcrypt");

module.exports = (req, res, next) => {
    // console.log(req.headers);
    const authHead = req.headers["authorization"];
    if (authHead == undefined) return res.sendStatus(401);
    const token = JSON.parse(authHead && authHead.split(" ")[1]);
    
    knex.select().from("TodoUsers").where("email",token["email"]).then(rows=>{
        if(rows.length ===1){
            const checkPass = bcrypt.compareSync(token["password"],rows[0].password);
                if(checkPass) {
                    next()
                }
            }
    }).catch(err=> res.json(err));
};