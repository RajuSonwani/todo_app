const { Router } = require("express");
const express = require("express");
const router = express.Router();

const auth = require("./auth");

const bcrypt = require("bcrypt");

const knex = require("../models/pool");
const { where } = require("../models/pool");

//home
router.get("/",(req,res)=>{
    res.send("Hey Bro..!")
});


// [without authentication] POST /cities
router.post("/cities",(req,res)=>{
    knex.select().from("Cities").where("city_name",req.body.city).then(rows=>{
        if(rows.length==0){
            return knex("Cities").insert({"city_name":req.body.city}).then(data=>{
                // console.log(data);
                res.json({id:data[0],city:req.body.city})
            }).catch(e=>{
                console.log(e)
            })
        }res.send(rows[0])
    }).catch(e=>{
        console.log(e)
    })
})

// [without authentication] POST /users
router.post("/users",(req,res)=>{
    req.body.password = bcrypt.hashSync(req.body.password,10);
    knex.select().from("TodoUsers").where("email",req.body.email).then(rows=>{
        if(rows.length==0){
            return knex("TodoUsers").insert(req.body)
                .then(data=>{
                    knex.select().from("TodoUsers").where("email",req.body.email).join("Cities","TodoUsers.city_id","=","Cities.city_id").then(D=>{
                        // res.json(D[0])
                        res.json({id:D[0].id, name:D[0].name, email:D[0].email, age:D[0].age,
                        city:{id:D[0].city_id,name:D[0].city_name}})
                    })
                }).catch(e=>{
                    console.log(e)
                })
        }
        res.send(rows)
    }).catch(e=>{
        console.log(e)
    })
});
// [without authentication] POST /todos
router.post("/todos",(req,res)=>{
    // console.log(req.body)
    knex("Todos").insert(req.body)
        .then(data=>{
            knex.select().from("TodoUsers").where("id",req.body["assignedTo"]).join("Cities","TodoUsers.city_id","=","Cities.city_id").then(D=>{
                // res.json(D[0])
                res.json({"todo":{"text":req.body["text"],"assignedTo":{"id":D[0]["id"],"name":D[0]["name"],"email":D[0]["email"],"city":{"id":D[0]["city_id"],"name":D[0]["city_name"]}},"dueDate":req.body["dueDate"]}})
            })
        }).catch(e=>{
            console.log(e)
        })

})


// [with auth] GET /users
router.get("/users",auth,(req,res)=>{
    // console.log(req.headers)
    knex.select().from("TodoUsers").join("Cities",{"TodoUsers.city_id":"Cities.city_id"}).then(rows=>{
        let users = [];
        rows.forEach(row => {
            users.push({id:row.id,name:row.name,email:row.email,age:row.age,city:{id:row.city_id,name:row.city_name}})
        });
        res.json({users:users})
    }).catch(e=>{
        res.send(e)
    })
});

router.get("/users/:id",auth,(req,res)=>{
    knex.select().from("TodoUsers").join("Cities",{"TodoUsers.city_id":"Cities.city_id"}).where("id",req.params.id).
        then(rows=>{
            // console.log(rows);
            res.json({user:{id:rows[0].id,name:rows[0].name,email:rows[0].email,age:rows[0].age,city:{id:rows[0].city_id,name:rows[0].city_name}}})
        }).catch(e=>{
            res.send(e)
        })
    }
)

// [with auth] GET /todos
router.get("/todos",auth,(req,res)=>{
    knex.select().from("Todos").join("TodoUsers",{"Todos.assignedTo":"TodoUsers.id"}).join("Cities",{"TodoUsers.city_id":"Cities.city_id"}).then(rows=>{
        // console.log(rows);
        let users = [];
        rows.forEach(row => {
            users.push({"text":row.text,"assignedTo":{id:row.id,name:row.name,email:row.email,age:row.age,city:{id:row.city_id,name:row.city_name}},"dueDate":row.dueDate})
        });
        res.json({users:users})
    }).catch(e=>{
        res.send(e)
    })

})


//  [with auth] GET /mytodos
router.get("/mytodos",auth,(req,res)=>{
    // console.log(req.headers)
    const authHead = req.headers["authorization"];
    if (authHead == undefined) return res.sendStatus(401);
    const token = JSON.parse(authHead && authHead.split(" ")[1]);
    
    knex.select().from("TodoUsers").join("Cities",{"TodoUsers.city_id":"Cities.city_id"}).where("email",token.email).then(rows=>{
        // console.log(rows);
        knex.select().from("Todos").where("assignedTo",rows[0].id).then((D)=>{
            // console.log(D)
            res.json({"todos":D})
        })
    }).catch(e=>{
        res.send(e)
    })

})


module.exports = router;
