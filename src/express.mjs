import express from 'express';

const app = express();
// port we are running on
const PORT = process.env.PORT || 4000;

// array for testing code 

const fakeUsers = [{id: 1, username: "anson", displayName: "Anson"},
    {id: 2, username: "Brock", displayName: "Brockypoo"},
    {id: 3, username: "jason", displayName: "JASON"}
];

//get method 
app.get("/", (request, response) => {
    response.status(201).send({msg: "helo"});
});

app.get('/api/users', (request, response) => {
    response.send(fakeUsers);
});

app.get('/api/users/:id', (request, response) => {
    console.log(request.params);
    const parsedId = parseInt(request.params.id);
    console.log(parsedId);
    if (isNaN(parsedId)) return response.status(400).send({msg: 'Bad request stop'});
    const userCheck = fakeUsers.find((user) => user.id === parsedId);
    if (!userCheck) return response.sendStatus(404);
    return response.send(userCheck);
})


app.get('/api/products', (request, response) => {
    response.send([{id: 1234, name: 'Chicken', price: 12.99 }])
});



app.listen(PORT, () => {
    console.log('running on Port ' + PORT);
});


// routes to be returned

