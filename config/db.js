const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://brunodominguez:<password>@bloagapp.o6yos.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
/* Verifies where the application is running, local or an outside server */

if(process.env.NODE_ENV == 'production') {
	
	module.exports = {
		mongoURI: "mongodb+srv://brunodominguez:eCm25DkaxeTGphD5@bloagapp.o6yos.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
	}
} else {
	module.exports = {
		mongoURI: "mongodb://localhost/blogapp"
	}
}