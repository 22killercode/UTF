const mongoose = require('mongoose');

    const dbConnecton = async()=>{
        try {
            await mongoose.connect('mongodb+srv://sebatbsit:KcZorfwjhcurNKEI@tbsit.12drd1s.mongodb.net/testtbsit', {
                // useCreateIndex:true,
                useNewUrlParser:true,
                useUnifiedTopology:true,
                // useFindAndModify:false
            })
                .then(db => console.log(`DB is connected`))
                .catch(err => console.error(err));
                
            } catch (error) {
                try {
                    mongoose.connect('mongodb://localhost/tbs',{
                        strictQuery:false
                        //         useCreateIndex:true,
                        //         useNewUrlParser:true,
                        //         useUnifiedTopology:true,
                        // //        useFindAndModify:false
                        })
                
                        .then(db => console.log('DB esta correctamente conectada'))
                        
                    } catch (error) {
                    console.error(error);
                }
            };
        };
        
        const conectDB =  dbConnecton()

        if (conectDB) {
            console.log(conectDB)
        } else {
            console.log("No tenes internet reinicia el modem")
            return
        }



