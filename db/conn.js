const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://root:root@practicecluster.pbzgp.mongodb.net/worksheet?retryWrites=true&w=majority",
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    }).then(() => {
        console.log(`MongoDB is Connected`);
    }).catch((err) => {
        console.log({ "msg": err });
    })