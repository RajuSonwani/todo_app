const knex = require("knex")({
    client:"mysql",
    connection:{
        host:process.env.localhost,
        user:process.env.user,
        password:process.env.password,
        database:process.env.database

    },
    pool:{min:0,max:4}
})

//create user table

knex.schema.hasTable("TodoUsers").then(exist=>{
    if(!exist){
        return knex.schema.createTable("TodoUsers",function(table){
            table.increments("id").primary();
            table.string("name").notNullable();
            table.string("email").notNullable();
            table.string("password").notNullable();
            table.integer("age").notNullable();
            table.integer("city_id").unsigned().notNullable();
            table.foreign("city_id").references("Cities.city_id");
        }).then(()=>{
            console.log("USER TABLE is created..!")
        }).catch((e)=>{
            console.log(e)
        })

    }
    console.log(" USER TABLE already exists")
})


// // Create Table city;
knex.schema.hasTable("Cities").then(exist=>{
    if(!exist){
        return knex.schema.createTable('Cities', function (table) {
            table.increments('city_id').primary();
            table.string('city_name').notNullable();
        }).then(() => {
            console.log("TABLE CITIES created successfully....")
        }).catch(e=> {
            console.log(e);
        }) 
    }
    console.log(" TABLE CITIES already exists")
})


// Create Table todos;
knex.schema.hasTable("Todos").then(exist=>{
    if(!exist){
         return knex.schema.createTable('Todos', function (table) {
            table.increments('id').primary();
            table.varchar('text').notNullable();
            table.date('dueDate').notNullable();
            table.integer('assignedTo').unsigned().notNullable();
            table.foreign('assignedTo').references('TodoUsers.id')
        }).then(() => {
            console.log("Todos table created successfully....")
        }).catch(e => {
            console.log(e);
        })

    }
    console.log(" TABLE TODOS already created")
})


module.exports = knex;
