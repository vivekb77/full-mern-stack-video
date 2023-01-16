










// list all databases in mongo db
// const {MongoClient} = require('mongodb');
// main();
// async function main(){
//     /**
//      * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
//      * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
//      */
//     const uri = "mongodb+srv://user:de2LxbUlkcOYBgXJ@galaxzcluster.sofxyos.mongodb.net/?retryWrites=true&w=majority";
 

//     const client = new MongoClient(uri);
 
//     try {
//         // Connect to the MongoDB cluster
//         await client.connect();
 
//         // Make the appropriate DB calls
//         await  listDatabases(client);
 
//     } catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
//     }
// }

// main().catch(console.error);


// 	async function listDatabases(client){
// 		databasesList = await client.db().admin().listDatabases();
	 
// 		console.log("Databases:");
// 		databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// 	};





function addTweets(){
	try {
		
		 User.updateOne(
			{ email: "vivek@galaxz.com" },
			{ $set: { quote: userTweetsArray.toString() } }
		)
		
		console.log(userTweetsArray.toString())
		console.log("tweets added to db")
		
	} catch (err) {
		// res.json({ status: 'error', error: 'error happened' })
		console.log(err)

	}
}

